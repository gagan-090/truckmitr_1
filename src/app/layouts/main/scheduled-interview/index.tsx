import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ScheduledInterviews = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();

    const _goBack = () => navigation.goBack();

    // Interview Card Component
    const InterviewCard = ({ date, time, status }: { date: string, time: string, status: 'scheduled' | 'live' | 'completed' }) => (
        <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(3), marginBottom: responsiveHeight(1.5), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: status === 'live' ? '#22C55E' : '#2563EB', borderWidth: 1, borderColor: '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 4 }}>
                        {status === 'live' ? 'Live Interview' : 'Upcoming Interview'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Ionicons name="calendar-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155' }}>{date}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155' }}>{time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="videocam-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155' }}>Video Interview</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: status === 'live' ? '#DCFCE7' : '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: status === 'live' ? '#166534' : '#1E40AF', fontWeight: 'bold', fontSize: responsiveFontSize(1.2) }}>
                        {status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}
                    </Text>
                </View>
            </View>

            {status !== 'completed' && (
                <TouchableOpacity style={{ marginTop: 12, paddingVertical: 10, backgroundColor: status === 'live' ? '#16A34A' : colors.royalBlue, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>
                        {status === 'live' ? 'Join Now' : 'Join Link (Active 5m before)'}
                    </Text>
                </TouchableOpacity>
            )}

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B', fontStyle: 'italic' }}>
                    Check your interview date and time in the calendar and be ready in advance.
                </Text>
            </View>
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
                    Scheduled Interviews
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4) }} showsVerticalScrollIndicator={false}>
                <InterviewCard date="12 Feb 2025" time="11:30 AM" status="scheduled" />
                <InterviewCard date="14 Feb 2025" time="02:00 PM" status="scheduled" />
                <InterviewCard date="15 Feb 2025" time="10:00 AM" status="scheduled" />
                <View style={{ opacity: 0.7 }}>
                    <InterviewCard date="10 Feb 2025" time="04:30 PM" status="completed" />
                </View>
            </ScrollView>
        </View>
    );
};

export default ScheduledInterviews;
