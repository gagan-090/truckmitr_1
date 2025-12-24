import React, { useMemo } from 'react'
import { isIOS } from '@ollnine/src/app/functions';
import WebView from 'react-native-webview';
import { useResponsiveScale } from '@ollnine/src/app/hooks';
import { View } from 'react-native';

export default function GiftOverlay(props: any) {
  const { giftUri, isPaused, onGiftVideoEnd } = props
  const { responsiveScreenHeight, responsiveScreenWidth } = useResponsiveScale()

  const overlayUrl =
    isIOS()
      ? 'https://ollnine.s3.us-east-1.amazonaws.com/gift/heart_transparent.mov'
      : giftUri

  const overlayHtml = useMemo(() => `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                margin: 0;
                background: transparent;
                overflow: hidden;
                touch-action: none;
              }
              video {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                background: transparent;
              }
            </style>
          </head>
          <body>
            <video autoplay ${isPaused ? 'paused' : ''} playsinline id="overlayVideo">
              <source src="${overlayUrl}" type="${isIOS() ? 'video/mp4' : 'video/webm'}" />
            </video>
            <script>
              const videoElement = document.getElementById('overlayVideo');
              videoElement.onended = function() {
                window.ReactNativeWebView.postMessage("videoEnded");
              };
            </script>
          </body>
        </html>
      `, [overlayUrl]);

  const handleWebViewMessage = (event: any) => {
    if (event.nativeEvent.data === 'videoEnded') {
      onGiftVideoEnd();
    }
  };

  return (
    <View style={{ flex: 1, height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), position: 'absolute', pointerEvents: 'none' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: overlayHtml }}
        style={{ height: responsiveScreenHeight(100), width: responsiveScreenWidth(100), position: 'absolute', backgroundColor: 'transparent', pointerEvents: 'none' }}
        backgroundColor="transparent"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        scalesPageToFit={false}
        zoomable={false}
        scrollEnabled={false}
        onMessage={handleWebViewMessage}
      />
    </View>
  );
}
