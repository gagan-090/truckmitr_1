import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { STACKS } from '@truckmitr/src/stacks/stacks';
import { useTranslation } from 'react-i18next';

const CallJobManagerInfo = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();

    const _goBack = () => navigation.goBack();

    const _handleCall = () => {
        navigation.navigate(STACKS.CALL_JOB_MANAGER_LIST);
    };

    const InfoItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingRight: 8 }}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" style={{ marginRight: 10, marginTop: 3 }} />
            <Text style={{ flex: 1, fontSize: responsiveFontSize(1.5), color: '#334155', lineHeight: responsiveFontSize(2.4), textAlign: 'left' }}>{text}</Text>
        </View>
    );

    const StepItem = ({ number, text }: { number: string; text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingRight: 8 }}>
            <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', marginRight: 8, minWidth: 24 }}>{number}</Text>
            <Text style={{ flex: 1, fontSize: responsiveFontSize(1.4), color: '#334155', lineHeight: responsiveFontSize(2.2), textAlign: 'left' }}>{text}</Text>
        </View>
    );

    const NoteItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingRight: 8 }}>
            <Text style={{ fontSize: responsiveFontSize(1.4), color: '#475569', marginRight: 6 }}>•</Text>
            <Text style={{ flex: 1, fontSize: responsiveFontSize(1.4), color: '#475569', lineHeight: responsiveFontSize(2.2), textAlign: 'left' }}>{text}</Text>
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
                    {t('callJobManagerTitle', 'Call Job Manager')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Ionicons name="call-outline" size={30} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 }}>
                        {t('callJobManagerTitle', 'Call Job Manager')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.4), paddingHorizontal: 8 }}>
                        {t('callJobManagerHeroDesc', 'Connect with your assigned Job Manager for job-related assistance')}
                    </Text>
                </View>

                {/* Why Call Job Manager */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 10 }}>
                        {t('whyCallJobManager', 'Why Call Job Manager?')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.45), color: '#475569', lineHeight: responsiveFontSize(2.2), textAlign: 'left' }}>
                        {t('whyCallJobManagerDesc', 'For each job you apply to, a dedicated Job Manager is assigned to assist you during the hiring process.')}
                    </Text>
                </View>

                {/* What You Can Do */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 14 }}>
                        {t('whatYouCanDo', 'You can call the Job Manager to:')}
                    </Text>
                    <InfoItem text={t('getUpdatesOnApplication', 'Get updates on your job application')} />
                    <InfoItem text={t('clarifyJobDetails', 'Clarify job details')} />
                    <InfoItem text={t('discussNextSteps', 'Discuss next steps')} />
                </View>

                {/* How It Works */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 14 }}>
                        {t('howItWorks', 'How it works')}
                    </Text>
                    <StepItem number="1." text={t('howItWorksStep1', 'Each job has its own Job Manager')} />
                    <StepItem number="2." text={t('howItWorksStep2', 'Call option is available only for applied jobs')} />
                    <StepItem number="3." text={t('howItWorksStep3', 'Tap the "Call Job Manager" button for the selected job')} />
                </View>

                {/* Usage Guidelines */}
                <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), borderLeftWidth: 4, borderLeftColor: '#F97316' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name="warning-outline" size={18} color="#EA580C" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#9A3412' }}>
                            {t('usageGuidelines', 'Usage Guidelines')}
                        </Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(1.45), color: '#9A3412', lineHeight: responsiveFontSize(2.2), textAlign: 'left' }}>
                        {t('usageGuidelinesDesc', 'Please contact the Job Manager only for job-related queries.')}
                    </Text>
                </View>

                {/* Important Note */}
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="information-circle-outline" size={18} color="#475569" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155' }}>
                            {t('importantNote', 'Important Note')}
                        </Text>
                    </View>
                    <View style={{ marginLeft: 4 }}>
                        <NoteItem text={t('noteJobManagersDiffer', 'Job Managers may differ for each job')} />
                        <NoteItem text={t('noteCallAvailability', 'Call availability depends on working hours')} />
                        <NoteItem text={t('noteMissedCalls', 'Missed calls may not receive a callback')} />
                    </View>
                </View>

            </ScrollView>

            {/* Sticky CTA Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>
                <TouchableOpacity
                    onPress={_handleCall}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                        {t('callJobManagerBtn', 'Call Job Manager')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CallJobManagerInfo;
