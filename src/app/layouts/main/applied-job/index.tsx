import { Image, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlatList } from 'react-native';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import ProfileIncompleteModal from '@truckmitr/src/app/components/profile-completion-modal';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;


export default function AppliedJob() {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { profileCompletion, isDriver, isTransporter } = useSelector((state: any) => state?.user) || { profileCompletion: 0, isDriver: false, isTransporter: false };

    const _goback = () => {
        navigation.goBack()
    }
    const _navigateProfileEdit = () => {
        if (isDriver) navigation.navigate(STACKS.PROFILE_EDIT);
        if (isTransporter) navigation.navigate(STACKS.PROFILE_EDIT_TRANSPORTER);
    };

    const [expandedJobs, setExpandedJobs] = useState<{ [key: number]: boolean }>({});
    const [appliedJobsList, setappliedJobsList] = useState<any[]>([])
    const [loading, setloading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            const _fetchAllAvailableJobs = async () => {
                try {
                    const appliedJobs: any = await axiosInstance.get(END_POINTS?.APPLIED_JOBS);
                    if (appliedJobs?.data?.status) {
                        setappliedJobsList(appliedJobs?.data?.data);
                    }
                    isJobAccepted()
                } catch (error) {
                    console.error("Error fetching applied jobs:", error);
                } finally {
                    setloading(false)
                }
            };
            _fetchAllAvailableJobs();
        }, [])
    );

    function isJobAccepted(): boolean {
        return appliedJobsList.some(item => item.accept_reject_status?.toLowerCase() === "accepted") && profileCompletion <= 90;
    }

    const toggleExpand = (id: number) => {
        setExpandedJobs((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const callToTransporter = async (item: any) => {
        try {
            Linking.openURL(`tel:${item?.transporter_mobile}`)
            console.log(item)
            const formData = new FormData();
            formData.append('id', item.transporter_id);
            formData.append('job_id', item.job_id);
            const response: any = await axiosInstance.post(END_POINTS?.CALL_TRANSPORTER, formData);
            if (response?.data?.status) {
                console.log(response, "response")
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`appliedJobs`)}</Text>
            </View>
            {loading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ height: responsiveHeight(22), width: responsiveWidth(50), borderTopLeftRadius: 10, borderTopRightRadius: 10, tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                </View>
                :
                appliedJobsList?.length ?
                    <View style={{ flex: 1 }}>
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            data={appliedJobsList}
                            renderItem={({ item }: any) => {
                                const _item = item?.job
                                const isExpanded = expandedJobs[_item?.id] || false;
                                const shortDescription = _item?.Job_Description.slice(0, 200) + "...";

                                let skills: string[] = [];
                                try {
                                    const parsed = JSON.parse(_item?.Preferred_Skills);
                                    skills = Array.isArray(parsed) ? parsed : [parsed];
                                } catch (e) {
                                    skills = [_item?.Preferred_Skills];
                                }
                                return (
                                    <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, padding: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
                                        <Text style={{ fontSize: responsiveFontSize(2.2), color: colors.black, fontWeight: '500' }}>{_item.job_title}</Text>
                                        <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.7), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                                            {isExpanded ? _item.Job_Description : shortDescription}
                                        </Text>
                                        <TouchableOpacity onPress={() => toggleExpand(_item.id)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveFontSize(1) }}>
                                            <Text style={{ fontSize: responsiveFontSize(2), color: colors.royalBlue, fontWeight: '600' }}>
                                                {isExpanded ? t("showLess") : t("showMore")}
                                            </Text>
                                            <FontAwesome6 name={!isExpanded ? 'chevron-down' : 'chevron-up'} size={14} color={colors.royalBlue} style={{ marginHorizontal: responsiveFontSize(.7), marginTop: responsiveFontSize(.2) }} />
                                        </TouchableOpacity>
                                        <Space height={responsiveHeight(2)} />
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome name='rupee' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`salary`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.Salary_Range}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <MaterialCommunityIcons name='license' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`typeOfLicense`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.Type_of_License}</Text>
                                            </View>
                                        </View>
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                            <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome6 name='location-dot' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`location`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.job_location}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome6 name='business-time' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`noOfJobs`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.Job_Management}</Text>
                                            </View>
                                        </View>
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                            <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome name='trophy' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`experience`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.Required_Experience}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome name='id-card-o' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`jobId`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.job_id}</Text>
                                            </View>
                                        </View>
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                            <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome name='calendar-o' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`postDate`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{moment(_item?.Created_at).format("DD-MM-YYYY")}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome name='calendar-minus-o' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`lastDate`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.Application_Deadline}</Text>
                                            </View>
                                        </View>
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                            <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome6 name='car-rear' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`vehicleType`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{_item?.vehicle_type}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome6 name='child-reaching' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`preferredSkills`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{skills.join(", ")}</Text>
                                            </View>
                                        </View>
                                        <Space height={responsiveHeight(1)} />
                                        {_item?.transporter_mobile && item?.accept_reject_status === 'accepted' && <View style={{ alignItems: 'center', width: '100%' }}>
                                            <TouchableOpacity
                                                onPress={() => callToTransporter(_item)}
                                                style={{
                                                    paddingHorizontal: 20,
                                                    height: responsiveHeight(4.5),
                                                    backgroundColor: colors.green,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: 5,
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <FontAwesome
                                                    name="phone"
                                                    size={responsiveFontSize(2)}
                                                    color={colors.white}
                                                    style={{ marginRight: responsiveFontSize(0.8) }}
                                                />
                                                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>
                                                    {t(`callToTransporter`)}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>}
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1.4), borderTopColor: colors?.blackOpacity(.05), borderTopWidth: 1, paddingTop: responsiveFontSize(1) }}>
                                            <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Feather name='check-circle' size={14} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t('status')}</Text>
                                                </View>
                                                <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '500', textTransform: 'capitalize' }}>{item?.accept_reject_status}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <MaterialCommunityIcons name={"timer-outline"} size={20} color={colors.green} />
                                                    <Text style={{ color: colors.green, fontSize: responsiveFontSize(2), fontWeight: '500', marginLeft: responsiveFontSize(.2) }}>{t(`applied`)}</Text>
                                                </View>
                                                <Text style={{ color: colors.green, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginLeft: responsiveFontSize(.5) }}>{moment(item?.Created_at).format("DD-MM-YYYY")}</Text>
                                            </View>
                                        </View>
                                        <Space height={responsiveHeight(1)} />
                                    </View>
                                );
                            }}
                            contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(5), paddingTop: responsiveHeight(2) }}
                            keyExtractor={(item: any) => item.id.toString()}
                            ListFooterComponent={() => {
                                return (
                                    <Space height={responsiveHeight(10)} />
                                )
                            }} />
                    </View> : <View style={{ flex: 1, alignItems: 'center' }}>
                        <Space height={responsiveHeight(20)} />
                        <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                        <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.9), fontSize: responsiveFontSize(1.8), fontWeight: '500', textAlign: 'center' }}>{t(`youHaventAppliedAnyJobs`)}</Text>
                    </View>}
            <ProfileIncompleteModal
                visible={isJobAccepted()}
                onClose={_goback}
                onCompleteProfile={_navigateProfileEdit}
            />
        </View>
    )
}
