import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SecondHandTruckMarketplace = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();

    const _goBack = () => navigation.goBack();

    // Benefit Item Component with checkmark
    const BenefitItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1.2) }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="checkmark" size={14} color="#16A34A" />
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.7), color: '#334155', flex: 1 }}>{text}</Text>
        </View>
    );

    // Star Item Component for highlights
    const StarItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: responsiveHeight(1) }}>
            <Text style={{ marginRight: 8, fontSize: responsiveFontSize(1.5) }}>•</Text>
            <Text style={{ fontSize: responsiveFontSize(1.7), color: '#334155', flex: 1 }}>{text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: 'bold', color: colors.royalBlue, textAlign: 'center', flex: 1 }}>
                    Second Hand Truck Marketplace
                </Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(6) }} showsVerticalScrollIndicator={false}>

                {/* 🚛 1️⃣ Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center', ...shadow, shadowColor: 'rgba(0,0,0,0.08)' }}>
                    {/* Coming Soon Badge */}
                    <View style={{ backgroundColor: '#F97316', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 14 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), fontWeight: '700', color: colors.white }}>🔥 COMING SOON</Text>
                    </View>

                    <View style={{ width: 65, height: 65, borderRadius: 32, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 32 }}>🚛</Text>
                    </View>

                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 }}>
                        Second Hand Truck Marketplace
                    </Text>

                    <Text style={{ fontSize: responsiveFontSize(1.9), color: '#001F3F', textAlign: 'center', lineHeight: responsiveFontSize(2.8), fontWeight: '600' }}>
                        Buy and sell used trucks with confidence.
                    </Text>

                    {/* Sub-line */}
                    <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#CBD5E1', width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', textAlign: 'center', fontStyle: 'italic', lineHeight: responsiveFontSize(2.2) }}>
                            A trusted platform to find reliable used trucks{'\n'}and sell your trucks easily.
                        </Text>
                    </View>
                </View>

                {/* ❓ 2️⃣ What is Second Hand Truck Marketplace */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>
                        What is Second Hand Truck Marketplace?
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.7), color: '#64748B', lineHeight: responsiveFontSize(2.5) }}>
                        TruckMitr is launching a Second Hand Truck Marketplace to help transporters buy reliable used trucks and sell their trucks easily on one trusted platform.
                    </Text>
                    <View style={{ backgroundColor: '#EAF3FF', padding: 12, borderRadius: 8, marginTop: 14 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#2563EB', fontWeight: '600', textAlign: 'center' }}>
                            🚛 Simple. Transparent. Transporter-focused.
                        </Text>
                    </View>
                </View>

                {/* 🔄 3️⃣ What You Can Do */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#10B981' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: '700', color: '#001F3F', marginBottom: 14 }}>
                        What you can do
                    </Text>
                    <BenefitItem text="Buy verified second-hand trucks" />
                    <BenefitItem text="Sell your used trucks to genuine buyers" />
                    <BenefitItem text="View detailed truck specifications" />
                    <BenefitItem text="Compare options and make informed decisions" />
                    <BenefitItem text="Save time and effort in the buying process" />

                    {/* Footer note */}
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', textAlign: 'center', fontStyle: 'italic' }}>
                            ✔ Clear actions  •  ✔ Easy to understand
                        </Text>
                    </View>
                </View>

                {/* ⭐ 4️⃣ Why This Marketplace Matters */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: '700', color: '#001F3F', marginBottom: 14 }}>
                        Why this marketplace matters
                    </Text>
                    <StarItem text="Reduces risk in buying used trucks" />
                    <StarItem text="Brings transparency to pricing & details" />
                    <StarItem text="Connects genuine buyers and sellers" />
                    <StarItem text="Supports business expansion at lower cost" />
                    <StarItem text="Makes fleet upgrades easier & faster" />

                    {/* Business value message */}
                    <View style={{ marginTop: 12, backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#92400E', fontWeight: '700', textAlign: 'center' }}>
                            Strong business value for your fleet.
                        </Text>
                    </View>
                </View>

                {/* 🚚 5️⃣ Built for Transporters */}
                <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                        <Text style={{ fontSize: 22 }}>🚚</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.9), fontWeight: '700', color: '#166534', marginBottom: 10 }}>
                            Built for transporters
                        </Text>
                        <BenefitItem text="Transporter-focused buying & selling" />
                        <BenefitItem text="Trusted listings with reliable information" />
                        <BenefitItem text="Simple & easy-to-use platform" />
                        <BenefitItem text="Designed for Indian trucking needs" />
                    </View>
                </View>

                {/* ⏳ 6️⃣ Coming Soon for Transporters */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#8B5CF6' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>
                        ⏳ Coming soon for transporters
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.7), color: '#64748B', lineHeight: responsiveFontSize(2.5), marginBottom: 12 }}>
                        TruckMitr is bringing Second Hand Truck Marketplace to simplify used truck transactions and support transporter growth.
                    </Text>

                    {/* Optional small line */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FE', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 }}>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>🔔</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#7C3AED', fontWeight: '600' }}>
                            Stay tuned for launch updates
                        </Text>
                    </View>
                </View>

                {/* 📢 7️⃣ Footer Brand Message */}
                <View style={{ backgroundColor: '#1E3A5F', borderRadius: 12, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <Text style={{ fontSize: 30, marginBottom: 10 }}>📢</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.0), fontWeight: '700', color: colors.white, marginBottom: 6, textAlign: 'center' }}>
                        Second Hand Truck Marketplace
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.7), color: '#93C5FD', fontStyle: 'italic', textAlign: 'center', marginBottom: 8 }}>
                        "Smart buying. Easy selling."
                    </Text>
                    <View style={{ marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#3B5A8A', width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#A5B4FC', textAlign: 'center' }}>
                            Launching soon. Stay tuned with TruckMitr.
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default SecondHandTruckMarketplace;
