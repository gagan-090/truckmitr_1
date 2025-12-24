import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColor, useImage, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import AllDriverList from './all-driver-list';
import TransporterInvites from './invitation-status';
import { hitSlop } from '@truckmitr/src/app/functions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

type TabType = 'all' | 'invitations';

export default function AllDriverListWithTabs({ route }: any) {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const images = useImage();
    const { job_id } = route?.params || {};

    const [activeTab, setActiveTab] = useState<TabType>('all');

    const _goback = () => {
        navigation.goBack()
    }

    // Tab Header Component
    const TabHeader = () => (
        <View style={{
            flexDirection: 'row',
            marginHorizontal: responsiveWidth(3),
            marginBottom: responsiveFontSize(1),
            justifyContent: 'space-between',
        }}>
            {(['all', 'myInvites'] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={{
                            flex: 1,
                            marginHorizontal: 4,
                            paddingVertical: responsiveFontSize(1.6),
                            alignItems: 'center',
                            borderRadius: 8,
                            backgroundColor: isActive ? colors.royalBlue : colors.whiteOpacity(1),
                            borderWidth: 1,
                            borderColor: isActive ? colors.royalBlue : colors.blackOpacity(0.2),
                        }}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={{
                            color: isActive ? colors.white : colors.blackOpacity(0.5),
                            fontSize: responsiveFontSize(1.8),
                            fontWeight: isActive ? '600' : '500'
                        }}>
                            {tab === 'all' ? t('allDrivers') : t('myInvites')}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t('inviteDrivers')}</Text>
            </View>
            <Space height={responsiveFontSize(1)} />

            {/* Tab Header */}
            <TabHeader />

            {/* Render Active Screen */}
            <View style={{ flex: 1 }}>
                {activeTab === 'all' ? (
                    <AllDriverList job_id={job_id} />
                ) : (
                    <TransporterInvites />
                )}
            </View>
        </View>
    );
};
