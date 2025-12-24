import React from 'react';
import { Modal, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useColor, useResponsiveScale } from '../hooks';
import { useTranslation } from 'react-i18next';

interface Props {
    visible: boolean;
    onClose: () => void;
    onCompleteProfile: () => void;
}

const ProfileIncompleteModal: React.FC<Props> = ({ visible, onClose, onCompleteProfile }) => {
    const colors = useColor();
    const { t } = useTranslation();
    const { responsiveFontSize } = useResponsiveScale();
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableWithoutFeedback>
                        <View style={{ width: '90%', backgroundColor: colors.white, borderRadius: 10, overflow: 'hidden' }}>
                            <LinearGradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                colors={['rgba(166, 205, 249, 0.3)', 'rgba(12, 120, 240, 0.3)']}
                                style={{ position: 'absolute', width: '100%', height: '100%' }}
                            />
                            <View style={{ padding: responsiveFontSize(2) }}>
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500' }}>
                                    {t('yourProfileIncomplete')}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveFontSize(0.5) }}>
                                    <Feather name="info" size={16} color={colors.black} />
                                    <Text style={{ flex: 1, color: colors.blackOpacity(0.5), marginStart: responsiveFontSize(1) }}>
                                        {t('profileIncompleteTitle')}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onCompleteProfile}
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: colors.royalBlue,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: responsiveFontSize(1),
                                        marginTop: responsiveFontSize(2),
                                        borderRadius: 5,
                                    }}
                                >
                                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>
                                        {t('completeProfile')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ProfileIncompleteModal;
