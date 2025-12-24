import { DeviceEventEmitter, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import Video, { OnProgressData } from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { hitSlop } from '@truckmitr/src/app/functions';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { showToast } from '@truckmitr/src/app/hooks/toast';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Player() {
    useStatusBarStyle('light-content');
    const route = useRoute<any>();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveFontSize, responsiveHeight, responsiveWidth, responsiveScreenHeight, responsiveScreenWidth } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const { item, isContinueWatching } = route?.params
    const STORAGE_VIDEO_KEY = `@video_progress_${item.video}`;

    const videoRef = useRef<any>(null);
    const [paused, setPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [completeVideo, setcompleteVideo] = useState(false)

    useEffect(() => {
        if (isFullScreen) {
            Orientation.lockToLandscape();
            StatusBar.setHidden(true);
        } else {
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
        }
    }, [isFullScreen]);

    const getAllStoredData = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys(); // 1. Get all keys
            const result = await AsyncStorage.multiGet(keys); // 2. Get all key-value pairs

            const data = result.map(([key, value]) => ({ key, value }));
            console.log(data, '🔍 All stored AsyncStorage data');
            return data;
        } catch (error) {
            console.error('Failed to load AsyncStorage data', error);
            return [];
        }
    };

    useEffect(() => {
        getAllStoredData()
        Orientation.addOrientationListener(handleOrientation);
        return () => {
            Orientation.removeOrientationListener(handleOrientation);
            Orientation.lockToPortrait();
            StatusBar.setHidden(false);
            StatusBar.setBarStyle('dark-content')
        };
    }, []);

    function handleOrientation(orientation: string) {
        if (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT') {
            setIsFullScreen(true);
        } else {
            setIsFullScreen(false);
        }
    }


    // Format time in minutes:seconds
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // ✅ Save current time to storage on progress
    const onProgress = async (data: OnProgressData) => {
        const time = data.currentTime;
        setCurrentTime(time);
        try {
            // 1. Get all keys
            const allKeys = await AsyncStorage.getAllKeys();
            // 2. Filter for keys that match video progress pattern
            const progressKeys = allKeys.filter(key => key.startsWith('@video_progress_'));
            // 3. Remove all existing video progress keys
            if (progressKeys.length > 0) {
                await AsyncStorage.multiRemove(progressKeys);
            }
            // 4. Save current video progress
            await AsyncStorage.setItem(STORAGE_VIDEO_KEY, JSON.stringify(time));
        } catch (error) {
            console.error('Error managing video progress storage:', error);
        }
    };


    // ✅ Seek to saved time on load
    const onLoad = async (data: any) => {
        setDuration(data.duration);
        try {
            if (isContinueWatching) {
                const saved = await AsyncStorage.getItem(STORAGE_VIDEO_KEY);
                let parsed = saved ? JSON.parse(saved) : 0;

                // Seek to 2 seconds earlier, but not below 0
                const seekTime = Math.max(0, parsed - 2);

                if (seekTime > 0 && videoRef.current) {
                    videoRef.current.seek(seekTime);
                }
            } else {
                // Start from beginning
                if (videoRef.current) {
                    videoRef.current.seek(0);
                }
            }
        } catch (err) {
            console.log("Error restoring video position:", err);
        }
    };


    // Toggle Play/Pause
    const togglePlayPause = () => {
        setPaused(!paused);
        setShowControls(true); // Show controls when interacting
    };

    // Toggle Fullscreen Mode
    function toggleFullScreen() {
        if (isFullScreen) {
            Orientation.lockToPortrait();
        } else {
            setTimeout(() => {
                Orientation.lockToLandscape();
            }, Platform.select({ android: 200, ios: 600 }));
        }
    }

    // Hide controls automatically after 3 seconds
    useEffect(() => {
        if (showControls) {
            const timeout = setTimeout(() => setShowControls(false), 3000);
            return () => clearTimeout(timeout);
        }
    }, [showControls]);

    const _goback = () => {
        navigation.goBack();
    };

    // ✅ Clear storage when video completes
    const handleVideoComplete = async () => {
        if (!completeVideo) {
            const formData = new FormData();
            formData.append('video_id', item?.id);
            formData.append('watch_time', duration);
            try {
                const response: any = await axiosInstance.post(END_POINTS.VIDEO_WATCH_ACTIVITY, formData);
                if (response?.data?.success) {
                    showToast(response?.data?.message)
                    await AsyncStorage.removeItem(STORAGE_VIDEO_KEY);
                    setPaused(true)
                    setCurrentTime(0)
                    videoRef.current.seek(0);
                    setcompleteVideo(true)
                    _goback();
                    const moduleResponse: any = await axiosInstance.get(END_POINTS?.VIDEO_MODULES);
                    if (moduleResponse?.data?.success) {
                        const updatedModules = moduleResponse.data.data;
                        let foundModule = null;
                        for (const module of updatedModules) {
                            const videoInModule = module.videos.find((v: any) => v.id === item.id);
                            if (videoInModule) {
                                foundModule = module;
                                break;
                            }
                        }
                        // Check if this is the last video in the module
                        if (foundModule) {
                            const allVideosWatched = foundModule.videos.every((video: any) => video.watch_status === true);
                            if (allVideosWatched) {
                                const moduleNumberMatch = foundModule.module?.name.match(/\d+/);
                                const moduleNumber = moduleNumberMatch ? parseInt(moduleNumberMatch[0]) : 1;
                                const totalModules = updatedModules.length;
                                DeviceEventEmitter.emit('SHOW_TRAINING_COMPLETE_MODAL', {
                                    module: moduleNumber,
                                    totalModules: totalModules
                                });
                            }
                        } else {
                            _goback();
                        }
                    }
                }
            } catch (err) {
                console.log("Failed to remove video progress:", err);
            }
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{ backgroundColor: colors.black }}>
                <Space height={safeAreaInsets.top} />
                <Video
                    ref={videoRef}
                    source={{ uri: `${BASE_URL}public/${item.video}` }}
                    style={{
                        height: isFullScreen ? responsiveScreenHeight(100) : responsiveHeight(30) - safeAreaInsets.top,
                        width: isFullScreen ? responsiveScreenWidth(100) : responsiveWidth(100),
                        backgroundColor: colors.black
                    }}
                    resizeMode={'contain'}
                    paused={paused}
                    onProgress={onProgress}
                    onLoad={onLoad}
                    onEnd={handleVideoComplete}
                />
                <TouchableOpacity
                    style={{ height: isFullScreen ? responsiveScreenHeight(100) : responsiveHeight(30) - safeAreaInsets.top, width: isFullScreen ? responsiveScreenWidth(100) : responsiveWidth(100), position: 'absolute', bottom: 0 }}
                    activeOpacity={1}
                    onPress={() => setShowControls(!showControls)}>
                    {showControls && (<View style={{ height: isFullScreen ? responsiveScreenHeight(100) : responsiveHeight(30) - safeAreaInsets.top, width: isFullScreen ? responsiveScreenWidth(100) : responsiveWidth(100), position: 'absolute', bottom: 0, backgroundColor: colors.blackOpacity(.5) }}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(2.5) }}>
                                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.5), borderRadius: 100, zIndex: 100 }}>
                                    <Ionicons name={'chevron-back'} size={24} color={colors.white} />
                                </TouchableOpacity>
                                <Text numberOfLines={1} style={{ flex: 1, color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginLeft: responsiveFontSize(1.5) }}>{item?.video_title_name}</Text>
                                <View style={{ width: responsiveWidth(10) }} />
                            </View>

                        </View>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={togglePlayPause} style={{ backgroundColor: colors.blackOpacity(.5), padding: responsiveFontSize(1.6), borderRadius: 100 }}>
                                <Ionicons name={paused ? "play" : "pause"} size={30} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                            <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6) }}>{formatTime(currentTime)}<Text style={{ color: colors.whiteOpacity(.7) }}> / {formatTime(duration)}</Text></Text>
                                <TouchableOpacity onPress={toggleFullScreen}>
                                    <MaterialIcons name={isFullScreen ? "fullscreen-exit" : "fullscreen"} size={25} color="white" />
                                </TouchableOpacity>
                            </View>
                            <Space height={responsiveHeight(1)} />
                            {isFullScreen && <Space height={safeAreaInsets.bottom} />}
                        </View>
                    </View>)}
                </TouchableOpacity>
            </View>
            {!isFullScreen && (
                <View style={{ flex: 1, padding: responsiveWidth(2.5) }}>
                    {item?.video_topic_name ?
                        <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(2), fontWeight: '500' }}>{item?.video_topic_name}</Text>
                        : <>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '600' }}>{item?.topic_name}</Text>
                            <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(2), fontWeight: '500' }}>{item?.video_title_name}</Text>
                        </>
                    }

                    {/* <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity>
                                <Image style={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8), tintColor: true ? colors.roseRed : colors.black }} source={{ uri: true ? `https://cdn-icons-png.flaticon.com/512/1077/1077086.png` : `https://cdn-icons-png.flaticon.com/512/1077/1077035.png` }} />
                            </TouchableOpacity>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '600', marginLeft: responsiveFontSize(.5) }}>1,532</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: responsiveFontSize(2) }}>
                            <TouchableOpacity>
                                <Image style={{ height: responsiveFontSize(2.6), width: responsiveFontSize(2.6) }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/5948/5948565.png` }} />
                            </TouchableOpacity>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '600', marginLeft: responsiveFontSize(.5) }}>32</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: responsiveFontSize(2) }}>
                            <TouchableOpacity>
                                <Image style={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/2958/2958783.png` }} />
                            </TouchableOpacity>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '600', marginLeft: responsiveFontSize(.5) }}>7</Text>
                        </View>
                    </View> */}
                    {/* <Text style={{ color: colors.blackOpacity(.6), marginTop: responsiveFontSize(1) }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget viverra odio. Aenean pulvinar sollicitudin dictum. consectetur adipiscing elit.</Text> */}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({})