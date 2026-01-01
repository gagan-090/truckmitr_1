import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const ChallanCheckResult = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();

    // Data from navigation params
    const { vehicleNumber, results } = route.params || { vehicleNumber: '', results: [] };

    // Determine if there are pending challans
    const hasChallan = results && results.length > 0;

    const _goBack = () => navigation.goBack();

    const DetailRow = ({ label, value, isAmount = false }: { label: string, value: string, isAmount?: boolean }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', flex: 1, lineHeight: responsiveFontSize(2.2), textAlign: 'left' }}>{label}</Text>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: isAmount ? '#DC2626' : '#334155', fontWeight: isAmount ? 'bold' : '600', flex: 1, textAlign: 'right', lineHeight: responsiveFontSize(2.2) }}>{value}</Text>
        </View>
    );

    const ChallanCard = ({ item, index }: { item: any, index: number }) => (
        <View key={index} style={{ backgroundColor: colors.white, borderRadius: 16, padding: responsiveWidth(5), marginBottom: 16, ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: 'bold', color: '#001F3F' }}>
                    #{index + 1}
                </Text>
                <View style={{ backgroundColor: item.challan_status === 'pending' ? '#FEE2E2' : '#DBF4E6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: item.challan_status === 'pending' ? '#DC2626' : '#16A34A', fontWeight: '600', textTransform: 'capitalize' }}>
                        {item.challan_status || 'Pending'}
                    </Text>
                </View>
            </View>

            <DetailRow label={t('vehicleNumber', 'Vehicle Number')} value={vehicleNumber} />
            <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 }} />
            <DetailRow label={t('challanNumber', 'Challan Number')} value={item.challan_number || '-'} />
            <DetailRow label={t('offenceDetails', 'Offence Details')} value={item.offense_details || '-'} />
            <DetailRow label={t('challanPlace', 'Place')} value={item.challan_place || '-'} />
            <DetailRow label={t('challanDate', 'Date & Time')} value={item.challan_date_time || '-'} />
            <DetailRow label={t('state', 'State')} value={item.state || '-'} />
            <DetailRow label={t('accusedName', 'Accused Name')} value={item.accused_name || '-'} />

            <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 }} />
            <DetailRow label={t('challanAmount', 'Challan Amount')} value={item.amount ? `₹${item.amount}` : '-'} isAmount />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(4), paddingTop: responsiveHeight(6), backgroundColor: colors.white, elevation: 4 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: colors.royalBlue }}>
                    {t('challanDetails', 'Challan Details')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(20) }}>

                {/* Status Badge */}
                <View style={{ alignItems: 'center', marginVertical: responsiveHeight(3) }}>
                    <View style={{
                        backgroundColor: hasChallan ? '#FEE2E2' : '#DBF4E6',
                        height: 80, width: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16
                    }}>
                        <Ionicons
                            name={hasChallan ? "warning-outline" : "checkmark-circle"}
                            size={48}
                            color={hasChallan ? "#DC2626" : "#16A34A"}
                        />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: 'bold', color: hasChallan ? '#DC2626' : '#16A34A', marginBottom: 6, textAlign: 'center' }}>
                        {hasChallan ? t('pendingChallanFound', 'Challan Found') : t('noPendingChallan', 'No Pending Challan')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B', textAlign: 'center', lineHeight: responsiveFontSize(2.2), paddingHorizontal: 20 }}>
                        {hasChallan
                            ? t('challansFoundDesc', 'Found {{count}} challan(s) for your vehicle.', { count: results.length })
                            : t('vehicleIsClean', 'Your vehicle is clean')}
                    </Text>
                </View>

                {/* Details List */}
                {hasChallan && results.map((item: any, index: number) => (
                    <ChallanCard key={index} item={item} index={index} />
                ))}

            </ScrollView>

            {/* Bottom CTA */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>

                <TouchableOpacity
                    onPress={_goBack}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                        {t('done', 'Done')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={_goBack}
                    style={{ paddingVertical: responsiveHeight(1.5), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), fontWeight: '600' }}>
                        {t('checkAnotherVehicle', 'Check Another Vehicle')}
                    </Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default ChallanCheckResult;
