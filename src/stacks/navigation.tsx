/* Packages */
import { CommonActions, StackActions } from '@react-navigation/native';
import { navigationRef } from '@ollnine/utils/global/global.ref';

type RootStackParamList = {
    [key: string]: object | undefined;
};

export const navigate = (name: keyof RootStackParamList, params?: object) => {
    navigationRef.current?.navigate(name as string, params);
};

export const replace = (name: keyof RootStackParamList, params?: object) => {
    navigationRef.current?.dispatch(
        StackActions.replace(name as string, params)
    );
};

export const navBack = () => {
    navigationRef.current?.goBack();
};

export const navigateToScreen = (name: keyof RootStackParamList, param?: object) => {
    navigationRef.current?.dispatch(
        CommonActions.navigate({
            name: name as string,
            params: param,
        })
    );
};

export const reset = (name: keyof RootStackParamList, param: object = {}) => {
    navigationRef.current?.dispatch(
        CommonActions.reset({
            index: 1,
            routes: [
                {
                    name: name as string,
                    params: param,
                },
            ],
        })
    );
};

export const popToTop = () => {
    navigationRef.current?.dispatch(StackActions.popToTop());
};
