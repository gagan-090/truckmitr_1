import { ActivityIndicator, Modal, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import Space from './space'
import { useColor, useResponsiveScale, useShadow } from '../hooks';
import { useTranslation } from 'react-i18next';

type ConfirmationModalProps = {
    visible: boolean;
    onCancel?: () => void;
    onAccept?: () => void;
    title?: string;
    subtitle?: string;
    cancelText?: string;
    confirmText?: string;
    loader?: boolean;
    cancelStyle?: StyleProp<ViewStyle>;
    confirmStyle?: StyleProp<ViewStyle>;
};

export default function ConfirmationModal({
    visible,
    onCancel,
    onAccept,
    title,
    subtitle,
    cancelText,
    confirmText,
    loader = false,
    cancelStyle = {},
    confirmStyle = {},
}: ConfirmationModalProps) {
    const { t } = useTranslation();
    const colors = useColor();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();

    // ✅ Set default translated texts if not provided
    cancelText = cancelText ?? t('cancel');
    confirmText = confirmText ?? t('confirm');

    return (
        <Modal
            animationType={'fade'}
            transparent={true}
            visible={visible}
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={() => { }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.7), }}>
                <View style={{ backgroundColor: colors.white, alignItems: 'center', width: responsiveWidth(90), borderRadius: 10, overflow: 'hidden' }}>
                    <Space height={responsiveHeight(3)} />
                    <Text style={{ width: responsiveWidth(80),color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' ,textAlign:'center'}}>{title}</Text>
                    <Space height={responsiveHeight(.5)} />
                    <Text style={{ width: responsiveWidth(70), color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.8), fontWeight: '400', textAlign: 'center' }}>{subtitle}</Text>
                    <Space height={responsiveHeight(3)} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={onCancel} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.1), bottom: -1, ...(StyleSheet.flatten(cancelStyle) || {}) }}>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onAccept} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green, bottom: -1, ...(StyleSheet.flatten(confirmStyle) || {}) }}>
                            {loader ? <ActivityIndicator color={colors.white} size="small" /> :
                                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{confirmText}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
