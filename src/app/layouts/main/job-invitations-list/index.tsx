import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { STACKS } from '@truckmitr/src/stacks/stacks';
import { useDispatch } from 'react-redux';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const JobInvitationsList = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();

    const getRequirementTitle = (title: string) => {
        switch (title) {
            case 'Complete / Update Driver Profile': return t('reqUpdateProfile');
            case 'Training': return t('reqTraining');
            case 'ID Check': return t('reqIdCheck');
            case 'Court Check': return t('reqCourtCheck');
            case 'Digital Address Check': return t('reqAddressCheck');
            default: return title;
        }
    };

    // Mock Invitations Data
    const [invitations, setInvitations] = useState([
        {
            id: 1,
            transporterName: 'FastLogistics Pvt Ltd',
            location: 'Mumbai, Maharashtra',
            jobType: 'Long Haul Driver',
            status: 'pending', // pending, ready, applied
            requirements: [
                { id: 1, title: 'Complete / Update Driver Profile', status: 'completed' },
                { id: 2, title: 'Training', status: 'completed' },
                { id: 3, title: 'ID Check', status: 'pending' },
                { id: 4, title: 'Court Check', status: 'pending' },
                { id: 5, title: 'Digital Address Check', status: 'pending' },
            ]
        },
        {
            id: 2,
            transporterName: 'SafeCargo Transports',
            location: 'Delhi, NCR',
            jobType: 'City Delivery Driver',
            status: 'ready',
            requirements: [
                { id: 1, title: 'Complete / Update Driver Profile', status: 'completed' },
                { id: 2, title: 'Training', status: 'completed' },
                { id: 3, title: 'ID Check', status: 'completed' },
                { id: 4, title: 'Court Check', status: 'completed' },
                { id: 5, title: 'Digital Address Check', status: 'completed' },
            ]
        }
    ]);

    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

    const _goBack = () => navigation.goBack();

    const _toggleExpand = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCardId(expandedCardId === id ? null : id);
    };

    const _handleAction = (invitation: any) => {
        if (invitation.status === 'ready') {
            console.log('Applying for Job:', invitation.jobType);
        } else {
            _toggleExpand(invitation.id);
        }
    };

    const _handleRequirementClick = (req: any, cardId: number) => {
        if (req.status === 'completed') return;

        // Auto-complete simulation (In real app, update state after return from screen)
        // Here we just toggle it for demo purposes when returning, or immediately
        setInvitations(prev => prev.map(inv => {
            if (inv.id === cardId) {
                return {
                    ...inv,
                    requirements: inv.requirements.map(r => r.id === req.id ? { ...r, status: 'completed' } : r)
                };
            }
            return inv;
        }));


        // Navigation Logic with Delay to show checkmark
        setTimeout(() => {
            switch (req.title) {
                case 'ID Check':
                    navigation.navigate(STACKS.ID_CHECK_INFO);
                    break;
                case 'Court Check':
                    navigation.navigate(STACKS.COURT_CHECK_INFO);
                    break;
                case 'Digital Address Check':
                    navigation.navigate(STACKS.DIGITAL_ADDRESS_CHECK_INFO);
                    break;
                case 'Complete / Update Driver Profile':
                    navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.PROFILE });
                    break;
                case 'Training':
                    navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.TRAINING });
                    break;
                default:
                    break;
            }
        }, 500);
    };

    const InvitationCard = ({ item }: { item: any }) => {
        const isExpanded = expandedCardId === item.id;
        const allReqsCompleted = item.requirements.every((r: any) => r.status === 'completed');
        const cardStatus = allReqsCompleted ? 'ready' : 'pending';

        return (
            <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: cardStatus === 'ready' ? '#22C55E' : '#F59E0B' }}>
                {/* Header Section */}
                <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: '700', color: '#001F3F', flex: 1, marginRight: 8 }}>{item.transporterName}</Text>
                        <View style={{ backgroundColor: cardStatus === 'ready' ? '#DCFCE7' : '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                            <Text style={{ color: cardStatus === 'ready' ? '#166534' : '#B45309', fontWeight: 'bold', fontSize: responsiveFontSize(1.3) }}>
                                {cardStatus === 'ready' ? t('readyToApply') : t('actionRequired')}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#64748B', marginRight: 12 }}>{item.location}</Text>
                        <MaterialCommunityIcons name="truck-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#64748B' }}>{item.jobType}</Text>
                    </View>
                </View>

                {/* Collapsible Requirements Section */}
                {isExpanded && (
                    <View style={{ marginTop: 8, marginBottom: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '600', color: '#334155', marginBottom: 8 }}>{t('requiredActions')}</Text>

                        {item.requirements.map((req: any) => (
                            <TouchableOpacity key={req.id} onPress={() => _handleRequirementClick(req, item.id)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <View style={{
                                    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5,
                                    borderColor: req.status === 'completed' ? '#16A34A' : '#CBD5E1',
                                    backgroundColor: req.status === 'completed' ? '#16A34A' : 'transparent',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 10
                                }}>
                                    {req.status === 'completed' && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text style={{ flex: 1, fontSize: responsiveFontSize(1.6), color: req.status === 'completed' ? '#64748B' : '#0F172A', textDecorationLine: req.status === 'completed' ? 'line-through' : 'none' }}>
                                    {getRequirementTitle(req.title)}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={{ marginTop: 8 }}>
                            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', fontStyle: 'italic', lineHeight: responsiveFontSize(2.0) }}>
                                {t('completingStepsHelps')}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#94A3B8' }}>{t('statusUpdatesShown')}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* CTA Button */}
                <TouchableOpacity
                    onPress={() => _handleAction(item)}
                    style={{ backgroundColor: cardStatus === 'ready' ? colors.royalBlue : '#EAB308', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 }}
                >
                    <Text style={{ color: cardStatus === 'ready' ? colors.white : '#713F12', fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                        {cardStatus === 'ready' ? t('applyForJob') : (isExpanded ? t('completeRequirements') : t('viewRequirements'))}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <View>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: 'bold', color: colors.royalBlue }}>
                        {t('jobInvitationsTitle')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B' }}>
                        {t('jobInvitationsSubtitle')}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(10) }} showsVerticalScrollIndicator={false}>
                {invitations.map((item) => (
                    <InvitationCard key={item.id} item={item} />
                ))}

                {invitations.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: '#94A3B8', fontSize: responsiveFontSize(1.8) }}>{t('noInvitations')}</Text>
                    </View>
                )}
            </ScrollView>

            {/* 🔒 Data Security Footer */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(2), backgroundColor: '#F8FAFC', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.7 }}>
                    <Ionicons name="lock-closed" size={12} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>{t('securityFooter')}</Text>
                </View>
            </View>
        </View>
    );
};

export default JobInvitationsList;
