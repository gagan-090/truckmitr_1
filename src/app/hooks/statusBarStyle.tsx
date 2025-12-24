import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import React from 'react';

const useStatusBarStyle = (style: any) => {
    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setBarStyle(style);
        }, [style])
    );
};

export default useStatusBarStyle;
