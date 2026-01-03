import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RcCheckResult = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();

    const { rcNumber } = route.params || { rcNumber: 'MH12AB1234' };

    const _goBack = () => navigation.goBack();

    const DetailRow = ({ label, value }: { label: string, value: string }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', flex: 1 }}>{label}</Text>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155', fontWeight: '600', flex: 1, textAlign: 'right' }}>{value}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: colors.royalBlue }}>
                    RC Details
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4) }}>

                {/* Status Badge */}
                <View style={{ alignItems: 'center', marginVertical: responsiveHeight(3) }}>
                    <View style={{ backgroundColor: '#DBF4E6', height: 80, width: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: 'bold', color: '#16A34A', marginBottom: 4 }}>Verified</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>Vehicle details verified successfully</Text>
                </View>

                {/* Details Card */}
                <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: responsiveWidth(5), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <DetailRow label="Vehicle Number" value={rcNumber} />
                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 }} />
                    <DetailRow label="Owner Name" value="Rahul Sharma" />
                    <DetailRow label="Vehicle Type" value="Truck" />
                    <DetailRow label="Fuel Type" value="Diesel" />
                    <DetailRow label="Registration Date" value="12 Jan 2019" />
                    <DetailRow label="Fitness Valid Upto" value="11 Jan 2025" />
                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B' }}>RC Status</Text>
                        <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                            <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: responsiveFontSize(1.3) }}>ACTIVE</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom CTA */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>
                <TouchableOpacity
                    onPress={_goBack}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                        Done
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={_goBack}
                    style={{ paddingVertical: responsiveHeight(1.5), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), fontWeight: '600' }}>
                        Check Another Vehicle RC
                    </Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default RcCheckResult;
