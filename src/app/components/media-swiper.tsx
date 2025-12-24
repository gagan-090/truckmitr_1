/**
 * Swiper for displaying media (images and videos)
 * @format
 */
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';

import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { useResponsiveScale } from '../hooks';

const { width } = Dimensions.get('window');

interface BannerItem {
  id: string | number;
  type: 'image' | 'video';
  url: string;
}

export const MediaSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [activeVideoIndex, setActiveVideoIndex] = useState<any>(null);
  const [videoCurrentTimes, setVideoCurrentTimes] = useState<any>({});
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [data, setData] = useState<BannerItem[]>([]);
  const [originalData, setOriginalData] = useState<BannerItem[]>([]);
  const flatListRef = useRef<any>(null);
  const videoRefs = useRef<any>({});
  const isFocused = useIsFocused();
  const lastActiveVideoIndex = useRef<any>(null);
  const { responsiveHeight, responsiveWidth, responsiveFontSize } =
    useResponsiveScale();

  // Set fixed dimensions for all media
  const mediaHeight = responsiveHeight(22);
  const mediaWidth = responsiveWidth(95);

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      const response = await axiosInstance.get(END_POINTS?.TRUCKMITRBANNERS);
      if (response?.data?.status && response?.data?.data) {
        const banners = response.data.data.map((banner: any) => ({
          id: banner.id,
          type: banner.media_type as 'image' | 'video',
          url: `${BASE_URL}/public${banner.media_url}`,
        }));
        setOriginalData(banners);
        // Setup infinite loop data
        if (banners.length > 0) {
          const firstItem = banners[0];
          const lastItem = banners[banners.length - 1];
          const newData = [lastItem, ...banners, firstItem];
          setData(newData);
        } else {
          setData([]);
        }
      } else {
        setOriginalData([]);
        setData([]);
      }
    } catch (error) {
      console.log('Error fetching banners:', error);
      setOriginalData([]);
      setData([]);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Cleanup effect to pause all videos when component unmounts
  useEffect(() => {
    return () => {
      Object.keys(videoRefs.current).forEach(index => {
        if (videoRefs.current[index]) {
          videoRefs.current[index].pause();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!isFocused) {
      // Pause all videos when screen loses focus
      Object.keys(videoRefs.current).forEach(index => {
        if (videoRefs.current[index]) {
          videoRefs.current[index].pause();
        }
      });
      
      if (activeVideoIndex !== null) {
        lastActiveVideoIndex.current = activeVideoIndex;
      }
      setActiveVideoIndex(null);
      setIsFullscreen(false);
    } else {
      if (lastActiveVideoIndex.current !== null) {
        setActiveVideoIndex(lastActiveVideoIndex.current);
        lastActiveVideoIndex.current = null;
      }
    }
  }, [isFocused, isFullscreen]);

  // Handle video playback when index changes
  useEffect(() => {
    if (data.length === 0) return;

    // Pause all videos first
    Object.keys(videoRefs.current).forEach(index => {
      if (videoRefs.current[index]) {
        // Don't seek to 0, just pause
      }
    });

    // If the current slide is a video, set it as active and play automatically
    if (data[currentIndex]?.type === 'video') {
      setActiveVideoIndex(currentIndex);

      // Resume video from current position or start from beginning
      const videoRef = videoRefs.current[currentIndex];
      if (videoRef) {
        const originalIndex =
          currentIndex === 0
            ? data.length - 3
            : currentIndex === data.length - 1
            ? 0
            : currentIndex - 1;

        const currentTime = videoCurrentTimes[originalIndex] || 0;
        videoRef.seek(currentTime);
      }
    } else {
      // If it's not a video, ensure no video is active
      setActiveVideoIndex(null);
    }
  }, [currentIndex, data, isFullscreen]);

  const handleManualSwipe = (event: any) => {
    if (data.length === 0) return;

    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.floor(contentOffset.x / layoutMeasurement.width);

    if (data?.length > 0) {
      const isVideo = data[index]?.type === 'video';
      if (isVideo) {
        videoRefs.current[index].pause();
      }
    }

    if (index === 0) {
      setCurrentIndex(data.length - 2);
      flatListRef.current?.scrollToIndex({
        index: data.length - 2,
        animated: false,
      });
    } else if (index >= data.length - 1) {
      setCurrentIndex(1);
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    } else {
      setCurrentIndex(index);
    }
  };

  const handleVideoProgress = (data: any, index: any) => {
    const originalIndex =
      index === 0 ? data.length - 3 : index === data.length - 1 ? 0 : index - 1;

    setVideoCurrentTimes((prev: any) => ({
      ...prev,
      [originalIndex]: data.currentTime,
    }));
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.slide}>
      {item.type === 'image' ? (
        <View
          style={[
            styles.mediaContainer,
            { width: mediaWidth, height: mediaHeight },
          ]}
        >
          <Image
            source={{ uri: item.url }}
            style={[{ width: mediaWidth, height: mediaHeight }]}
            resizeMode="cover"
            onError={() => console.warn('Failed to load image:', item.url)}
          />
        </View>
      ) : (
        <View
          style={[
            styles.videoContainer,
            { width: mediaWidth, height: mediaHeight },
          ]}
        >
          <Video
            ref={(ref: any) => (videoRefs.current[index] = ref)}
            source={{ uri: item.url }}
            style={[{ width: mediaWidth, height: mediaHeight }]}
            resizeMode="contain"
            repeat={false}
            paused={true}
            muted={isMuted}
            onProgress={(data: any) => handleVideoProgress(data, index)}
            onError={() => console.warn('Failed to load video:', item.url)}
            controls
            onFullscreenPlayerWillPresent={() => {
              setIsFullscreen(true);
            }}
            onFullscreenPlayerWillDismiss={() => {
              setIsFullscreen(false);
            }}
            onEnd={() => {
              if (videoRefs.current[index]) {
                videoRefs.current[index].dismissFullscreenPlayer();
              }
              setIsFullscreen(false);
              // Reset current time when video ends
              const originalIndex =
                index === 0
                  ? data.length - 3
                  : index === data.length - 1
                  ? 0
                  : index - 1;
              setVideoCurrentTimes((prev: any) => ({
                ...prev,
                [originalIndex]: 0,
              }));
            }}
          />
          {activeVideoIndex === index && (
            <TouchableOpacity
              style={styles.muteButton}
              onPress={() => setIsMuted(!isMuted)}
            >
              <MaterialCommunityIcons
                name={isMuted ? 'volume-off' : 'volume-high'}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderPagination = () => {
    if (data.length === 0 || originalData.length === 0) return null;
    const displayIndex =
      currentIndex === 0
        ? originalData.length - 1
        : currentIndex === data.length - 1
        ? 0
        : currentIndex - 1;

    return (
      <View
        style={[styles.paginationContainer, { bottom: responsiveFontSize(1) }]}
      >
        <View style={styles.pagination}>
          {originalData.map((_, index) => {
            return (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === displayIndex
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (data.length === 0) {
    return <View style={{ padding: 0 }} />;
  }

  return (
    <View
      style={[
        styles.container,
        { height: mediaHeight + responsiveFontSize(2) },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleManualSwipe}
        onScrollEndDrag={handleManualSwipe}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={1}
        decelerationRate="fast"
      />

      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  slide: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  videoContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paginationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  muteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
