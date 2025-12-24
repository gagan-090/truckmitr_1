import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isIOS } from '@truckmitr/src/app/functions';

interface CertificateActionModalProps {
    visible: boolean;
    onClose: () => void;
    onView: () => Promise<void>;
    onDownload: () => Promise<void>;
    onShare: () => Promise<void>;
    isGenerating: boolean;
    moduleId: number;
}

export default function CertificateActionModal({
    visible,
    onClose,
    onView,
    onDownload,
    onShare,
    isGenerating,
    moduleId
}: CertificateActionModalProps) {
    const { t } = useTranslation();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const [loadingAction, setLoadingAction] = useState<'view' | 'download' | 'share' | null>(null);

    const handleAction = async (type: 'view' | 'download' | 'share', action: () => Promise<void>) => {
        try {
            setLoadingAction(type);
            await action();
            if (type === 'download' || type === 'share') {
                onClose();
            }
        } catch (error) {
            console.error('Action error:', error);
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: responsiveWidth(5)
            }}>
                <View style={{
                    backgroundColor: colors.white,
                    borderRadius: 15,
                    padding: responsiveFontSize(2.5),
                    width: responsiveWidth(85),
                    ...shadow,
                    shadowColor: isIOS() ? colors.blackOpacity(0.2) : colors.blackOpacity(0.4),
                }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: responsiveFontSize(2)
                    }}>
                        <View style={{
                            height: responsiveFontSize(4),
                            width: responsiveFontSize(4),
                            backgroundColor: colors.royalBlueOpacity(0.1),
                            borderRadius: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: responsiveFontSize(1.5)
                        }}>
                            <Ionicons name="document-text" size={responsiveFontSize(2.2)} color={colors.royalBlue} />
                        </View>
                        <Text style={{
                            fontSize: responsiveFontSize(2.2),
                            fontWeight: '600',
                            color: colors.black,
                            flex: 1
                        }}>
                            {t('certificateOptions')}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{
                                height: responsiveFontSize(3.5),
                                width: responsiveFontSize(3.5),
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Ionicons name="close" size={responsiveFontSize(2.2)} color={colors.blackOpacity(0.6)} />
                        </TouchableOpacity>
                    </View>

                    {/* Module Info */}
                    <Text style={{
                        fontSize: responsiveFontSize(1.8),
                        color: colors.blackOpacity(0.7),
                        marginBottom: responsiveFontSize(2.5),
                        textAlign: 'center'
                    }}>
                        {t('module')} {moduleId} - {t('trainingCertificate')}
                    </Text>

                    {/* Action Buttons */}
                    <View style={{ gap: responsiveFontSize(1.5) }}>
                        {/* View Certificate */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.royalBlueOpacity(0.1),
                                padding: responsiveFontSize(1.8),
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.royalBlueOpacity(0.2),
                                opacity: loadingAction && loadingAction !== 'view' ? 0.5 : 1
                            }}
                            onPress={() => handleAction('view', onView)}
                            activeOpacity={0.7}
                            disabled={!!loadingAction}
                        >
                            <View style={{
                                height: responsiveFontSize(3.5),
                                width: responsiveFontSize(3.5),
                                backgroundColor: colors.royalBlue,
                                borderRadius: 100,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: responsiveFontSize(1.5)
                            }}>
                                {loadingAction === 'view' ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Ionicons name="eye" size={responsiveFontSize(1.8)} color={colors.white} />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.9),
                                    fontWeight: '600',
                                    color: colors.black
                                }}>
                                    {t('viewCertificate')}
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.5),
                                    color: colors.blackOpacity(0.6),
                                    marginTop: responsiveFontSize(0.2)
                                }}>
                                    {loadingAction === 'view'
                                        ? t('openingCertificate')
                                        : t('viewCertificateDescription')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={responsiveFontSize(1.8)} color={colors.blackOpacity(0.4)} />
                        </TouchableOpacity>

                        {/* Download Certificate */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.greenOpacitiy(0.1),
                                padding: responsiveFontSize(1.8),
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.greenOpacitiy(0.2),
                                opacity: loadingAction && loadingAction !== 'download' ? 0.5 : 1
                            }}
                            onPress={() => handleAction('download', onDownload)}
                            activeOpacity={0.7}
                            disabled={!!loadingAction}
                        >
                            <View style={{
                                height: responsiveFontSize(3.5),
                                width: responsiveFontSize(3.5),
                                backgroundColor: colors.greenOpacitiy(1),
                                borderRadius: 100,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: responsiveFontSize(1.5)
                            }}>
                                {loadingAction === 'download' ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Ionicons name="download" size={responsiveFontSize(1.8)} color={colors.white} />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.9),
                                    fontWeight: '600',
                                    color: colors.black
                                }}>
                                    {t('downloadCertificate')}
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.5),
                                    color: colors.blackOpacity(0.6),
                                    marginTop: responsiveFontSize(0.2)
                                }}>
                                    {loadingAction === 'download'
                                        ? t('downloadingCertificate')
                                        : t('downloadCertificateDescription')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={responsiveFontSize(1.8)} color={colors.blackOpacity(0.4)} />
                        </TouchableOpacity>

                        {/* Share Certificate */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.bronzeOpacity(0.1),
                                padding: responsiveFontSize(1.8),
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.bronzeOpacity(0.2),
                                opacity: loadingAction && loadingAction !== 'share' ? 0.5 : 1
                            }}
                            onPress={() => handleAction('share', onShare)}
                            activeOpacity={0.7}
                            disabled={!!loadingAction}
                        >
                            <View style={{
                                height: responsiveFontSize(3.5),
                                width: responsiveFontSize(3.5),
                                backgroundColor: colors.bronze,
                                borderRadius: 100,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: responsiveFontSize(1.5)
                            }}>
                                {loadingAction === 'share' ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Ionicons name="share-social" size={responsiveFontSize(1.8)} color={colors.white} />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.9),
                                    fontWeight: '600',
                                    color: colors.black
                                }}>
                                    {t('shareCertificate')}
                                </Text>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.5),
                                    color: colors.blackOpacity(0.6),
                                    marginTop: responsiveFontSize(0.2)
                                }}>
                                    {loadingAction === 'share'
                                        ? t('sharingCertificate')
                                        : t('shareCertificateDescription')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={responsiveFontSize(1.8)} color={colors.blackOpacity(0.4)} />
                        </TouchableOpacity>
                    </View>

                    {/* Public Sharing Info */}
                    <View style={{
                        marginTop: responsiveFontSize(2),
                        padding: responsiveFontSize(1.5),
                        backgroundColor: colors.royalBlueOpacity(0.05),
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.royalBlue
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="information-circle" size={responsiveFontSize(1.6)} color={colors.royalBlue} />
                            <Text style={{
                                fontSize: responsiveFontSize(1.5),
                                color: colors.royalBlue,
                                fontWeight: '500',
                                marginLeft: responsiveFontSize(0.8),
                                flex: 1
                            }}>
                                {t('publicSharingInfo')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
