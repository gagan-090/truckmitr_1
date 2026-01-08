import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hitSlop } from '@truckmitr/src/app/functions';

const ScheduledInterviews = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const safeAreaInsets = useSafeAreaInsets();

    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const _goBack = () => navigation.goBack();

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(END_POINTS.DRIVER_INTERVIEW);
            if (response?.data?.status) {
                setInterviews(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchInterviews();
        }, [])
    );

    const getStatus = (interviewAt: string) => {
        const now = moment();
        const interviewTime = moment(interviewAt, "YYYY-MM-DD HH:mm:ss");
        const diffMinutes = interviewTime.diff(now, 'minutes');

        if (diffMinutes >= -15 && diffMinutes <= 15) {
            return 'live';
        } else if (now.isAfter(interviewTime)) {
            return 'completed';
        } else {
            return 'scheduled';
        }
    };

    // InterviewCard Component
    const InterviewCard = ({ item }: { item: any }) => {
        const { driver_name, transporter_name, job_id, interview_at } = item;
        const status = getStatus(interview_at);
        const date = moment(interview_at).format("DD MMM YYYY");
        const time = moment(interview_at).format("hh:mm A");

        // Color Logic
        let statusColor = '#2563EB'; // Default Blue
        let statusBg = '#DBEAFE';
        let statusText = 'SCHEDULED';
        let statusLabel = 'Upcoming Interview';

        if (status === 'live') {
            statusColor = '#22C55E'; // Green
            statusBg = '#DCFCE7';
            statusText = 'LIVE NOW';
            statusLabel = 'Live Interview';
        } else if (status === 'completed') {
            statusColor = '#006400'; // Dark Green
            statusBg = '#E0F2F1'; // Light Greenish
            statusText = 'COMPLETED';
            statusLabel = 'Completed Interview';
        } else if (status === 'scheduled') {
            statusColor = '#FFA500'; // Orange
            statusBg = '#FFF3E0'; // Light Orange
            statusText = 'SCHEDULED';
            statusLabel = 'Upcoming Interview';
        }

        return (
            <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(1.8), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: statusColor, borderWidth: 1, borderColor: '#E2E8F0', opacity: status === 'completed' ? 0.8 : 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={{ fontSize: responsiveFontSize(2.1), fontWeight: '700', color: '#001F3F', marginBottom: 8 }}>
                            {statusLabel}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155', fontWeight: '600' }}>Date: </Text>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155' }}>{date}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Ionicons name="time-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155', fontWeight: '600' }}>Time: </Text>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155' }}>{time}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155', fontWeight: '600' }}>Transporter: </Text>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155' }}>{transporter_name}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="briefcase-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155', fontWeight: '600' }}>Job ID: </Text>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155' }}>{job_id}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: statusBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: statusColor, fontWeight: 'bold', fontSize: responsiveFontSize(1.4) }}>
                            {statusText}
                        </Text>
                    </View>
                </View>

                {status !== 'completed'}

                <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', fontStyle: 'italic' }}>
                        Check your interview date and time in the calendar and be ready in advance.
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: responsiveFontSize(2),
                paddingVertical: 12,
                marginTop: safeAreaInsets.top,
                backgroundColor: colors.white,
                borderBottomWidth: 1,
                borderBottomColor: colors.blackOpacity(0.05)
            }}>
                <TouchableOpacity
                    onPress={_goBack}
                    hitSlop={hitSlop(10)}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.blackOpacity(0.05)
                    }}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: responsiveFontSize(2.2),
                    color: colors.black,
                    fontWeight: '700'
                }}>
                    Scheduled Interviews ({interviews.length})
                </Text>
                <View style={{ width: 36 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.royalBlue} />
                </View>
            ) : interviews.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#64748B', fontSize: responsiveFontSize(1.8) }}>No scheduled interviews found.</Text>
                </View>
            ) : (
                <FlatList
                    data={interviews}
                    renderItem={({ item }) => <InterviewCard item={item} />}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ padding: responsiveWidth(4) }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default ScheduledInterviews;
