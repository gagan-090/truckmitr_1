import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export interface ThemeColors {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    transparent: string;
    white: string
    whiteOpacity: (value: number) => string;
    black: string,
    blackOpacity: (value: number) => string;
    royalBlue: string;
    royalBlueOpacity: (value: number) => string;
    azureBlue: string
    roseRed: string
    roseRedOpacity: (value: number) => string;
    green: string
    greenOpacitiy: (value: number) => string;
    purple: string
    purpleOpacitiy: (value: number) => string;
    yellow: string
    yellowOpacity: (value: number) => string;
    blue: string
    blueOpacity: (value: number) => string;
    bronze: string;
    bronzeOpacity: (value: number) => string;

    error: string
}

const lightColors: ThemeColors = {
    primary: 'rgb(0, 122, 255)',
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
    transparent: 'transparent',
    white: 'rgb(255, 255, 255)',
    whiteOpacity: (value: number) => `rgba(255, 255, 255, ${value})`,
    black: 'rgb(0, 0, 0)',
    blackOpacity: (value: number) => `rgba(0, 0, 0, ${value})`,
    royalBlue: '#084489',
    royalBlueOpacity: (value: number) => `rgba(8, 68, 137, ${value})`,
    roseRed: '#ff002d',
    roseRedOpacity: (value: number) => `rgba(255, 0, 45, ${value})`,
    green: '#01963c',
    greenOpacitiy: (value: number) => `rgba(0, 170, 70, ${value})`,
    yellow: '#ffc800',
    yellowOpacity: (value: number) => `rgba(255, 200, 0, ${value})`,
    blue: '#0c78f0',
    blueOpacity: (value: number) => `rgba(12, 120, 240, ${value})`,
    bronze: '#7B610E',
    bronzeOpacity: (value: number) => `rgba(123, 97, 14, ${value})`,
    purple: '#af00de',
    purpleOpacitiy: (value: number) => `rgba(75, 0, 222, ${value})`,

    azureBlue: '#056CE2',
    error: '#ff0000'
};

const darkColors: ThemeColors = {
    primary: 'rgb(0, 122, 255)',
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
    transparent: 'transparent',
    white: 'rgb(255, 255, 255)',
    whiteOpacity: (value: number) => `rgba(255, 255, 255, ${value})`,
    black: 'rgb(0, 0, 0)',
    blackOpacity: (value: number) => `rgba(0, 0, 0, ${value})`,
    royalBlue: '#084489',
    royalBlueOpacity: (value: number) => `rgba(8, 68, 137, ${value})`,
    roseRed: '#ff002d',
    roseRedOpacity: (value: number) => `rgba(255, 0, 45, ${value})`,
    green: '#01963c',
    greenOpacitiy: (value: number) => `rgba(1, 150, 60, ${value})`,
    yellow: '#ffc800',
    yellowOpacity: (value: number) => `rgba(255, 200, 0, ${value})`,
    blue: '#0c78f0',
    blueOpacity: (value: number) => `rgba(12, 120, 240, ${value})`,
    bronze: '#7B610E',
    bronzeOpacity: (value: number) => `rgba(123, 97, 14, ${value})`,
    purple: '#af00de',
    purpleOpacitiy: (value: number) => `rgba(75, 0, 222, ${value})`,

    azureBlue: '#056CE2',
    error: '#ff0000'
};

export const lightTheme = {
    ...DefaultTheme,
    colors: lightColors,
};

export const darkTheme = {
    ...DarkTheme,
    colors: darkColors,
};
