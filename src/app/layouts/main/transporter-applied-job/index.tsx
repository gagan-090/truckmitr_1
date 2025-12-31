import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConfirmationModal, Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { FlatList } from 'react-native';
import { END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function TransporterAppliedJob() {
    const dispatch = useDispatch()
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [loading, setloading] = useState(true)
    const [appliedJobList, setappliedJobList] = useState([])
    const [search, setsearch] = useState('')
    const [acceptJobId, setacceptJobId] = useState<any>(-1)
    const [rejectJobId, setrejectJobId] = useState<any>(-1)
    const [accpetRejectLoading, setaccpetRejectLoading] = useState(false)
    const [showVideoInterviewModal, setShowVideoInterviewModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<any>(null);

    const _fetchJobs = async () => {
        try {
            const response: any = await axiosInstance.get(END_POINTS?.TRANSPORTER_APPLIED_JOBS_LIST);
            if (response?.data?.status) {
                setappliedJobList(response?.data?.data);
                console.log('data-------------', response?.data?.data);

            } else {
                setappliedJobList([]);
            }
        } catch (error) {
            console.error("Error searching jobs:", error);
        } finally {
            setloading(false);
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            setloading(true)
            _fetchJobs();
        }, [])
    );

    const _goback = () => {
        navigation.goBack()
    }

    const _onPressAcceptApplication = async () => {
        try {
            setaccpetRejectLoading(true)
            const formData = new FormData();
            formData.append('status', `Accepted`);  // {`Pending`} {`Accepted`} {`Rejected`}
            const response: any = await axiosInstance.post(END_POINTS?.TRANSPORTER_JOB_ACCEPT_REJECT(acceptJobId), formData);
            if (response?.data?.status) {
                _fetchJobs()
            } else {
                showToast(response?.data?.message)
            }
        } catch (error) {

        } finally {
            setaccpetRejectLoading(false)
            setacceptJobId(-1)
        }
    }
    const _onPressRejectApplication = async () => {
        try {
            setaccpetRejectLoading(true)
            const formData = new FormData();
            formData.append('status', `Rejected`);  // {`Pending`} {`Accepted`} {`Rejected`}
            const response: any = await axiosInstance.post(END_POINTS?.TRANSPORTER_JOB_ACCEPT_REJECT(rejectJobId), formData);
            if (response?.data?.status) {
                _fetchJobs()
            } else {
                showToast(response?.data?.message)
            }
        } catch (error) {

        } finally {
            setaccpetRejectLoading(false)
            setrejectJobId(-1)
        }
    }

    const callToDriver = async (item: any) => {
        try {
            Linking.openURL(`tel:${item?.driver_mobile}`)
            const formData = new FormData();
            formData.append('id', item.driver_id);
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
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`viewApplications`)}</Text>
            </View>
            {(loading && !search.length) ?
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Space height={responsiveHeight(20)} />
                    <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                </View>
                : loading ?
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <ActivityIndicator color={colors.royalBlue} size="small" />
                    </View>
                    :
                    !appliedJobList?.length ?
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Space height={responsiveHeight(20)} />
                            <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                            <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.9), fontSize: responsiveFontSize(1.9), textAlign: 'center', fontWeight: '500', }}> {search ? `${t(`noDriverFoundFor`)} "${search}" ${t(`trySearchingDifferentKeyword`)}` : t("driverHaventAppliedYetApplicationsMayComeSoon")}</Text>
                        </View>
                        :
                        <View style={{ flex: 1 }}>
                            <FlatList
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                data={appliedJobList}
                                renderItem={({ item, index }: any) => {
                                    const isAcceptedSelected = item?.available_statuses?.some(
                                        (status: any) => status.value === "Accepted" && status.selected
                                    );
                                    const isRejectedSelected = item?.available_statuses?.some(
                                        (status: any) => status.value === "Rejected" && status.selected
                                    );
                                    const isAcceptedOrRejectedSelected = isAcceptedSelected || isRejectedSelected;
                                    if (item?.unique_id === "") return null;
                                    return (
                                        <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, padding: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(5), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ width: responsiveWidth(75), fontSize: responsiveFontSize(2.2), color: colors.black, fontWeight: '500' }}>{item?.job_title}</Text>
                                            </View>
                                            <Space height={responsiveHeight(2)} />
                                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <View style={{ flex: 1.5 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <FontAwesome name='id-card-o' size={14} color={colors.royalBlue} />
                                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`tmId`)}</Text>
                                                    </View>
                                                    <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.unique_id}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <FontAwesome6 name='user-tie' size={14} color={colors.royalBlue} />
                                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`jobId`)}</Text>
                                                    </View>
                                                    <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.job_id}</Text>
                                                </View>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                                <View style={{ flex: 1.5 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <FontAwesome name='user' size={14} color={colors.royalBlue} />
                                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`driverName`)}</Text>
                                                    </View>
                                                    <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.driver_name}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <FontAwesome6 name='trophy' size={14} color={colors.royalBlue} />
                                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`ranking`)}</Text>
                                                    </View>
                                                    <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.ranking}</Text>
                                                </View>
                                            </View>
                                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                                <View style={{ flex: 1.5 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <FontAwesome name='calendar-o' size={14} color={colors.royalBlue} />
                                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`appliedDateTime`)}</Text>
                                                    </View>
                                                    <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{moment(item?.applied_at).format("DD-MM-YYYY (h:mm:A)")}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <MaterialIcons name='stars' size={16} color={colors.royalBlue} />
                                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`rating`)}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', marginStart: responsiveFontSize(2) }}>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <FontAwesome
                                                                key={i}
                                                                name={'star'}
                                                                size={14}
                                                                color={i < item?.rating ? colors.royalBlue : colors.blackOpacity(.2)}
                                                                style={{ marginEnd: responsiveFontSize(.5) }}
                                                            />
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                            <Space height={responsiveFontSize(2)} />
                                            {isAcceptedOrRejectedSelected && <View style={{ flex: 1.5 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <MaterialCommunityIcons name='checkbox-multiple-marked-circle-outline' size={16} color={colors.royalBlue} />
                                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`Accept/Reject`)}</Text>
                                                </View>
                                                <Space height={responsiveHeight(1)} />
                                                <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: isAcceptedSelected ? colors.greenOpacitiy(.1) : colors.roseRedOpacity(.1), paddingVertical: responsiveFontSize(.3), paddingHorizontal: responsiveFontSize(1.5), borderRadius: 100 }}>
                                                    <Image style={{ height: responsiveFontSize(2.4), width: responsiveFontSize(2.4) }} source={{ uri: isAcceptedSelected ? `https://cdn-icons-png.flaticon.com/512/3002/3002519.png` : `https://cdn-icons-png.flaticon.com/512/10621/10621089.png` }} />
                                                    <Text style={{ color: isAcceptedSelected ? colors.greenOpacitiy(1) : colors.roseRedOpacity(1), fontWeight: 'bold', marginLeft: responsiveFontSize(.6) }}>{isAcceptedSelected ? t('accepted') : t('rejected')}</Text>
                                                </View>
                                            </View>}
                                            {!isAcceptedOrRejectedSelected && <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                                                <TouchableOpacity onPress={() => setrejectJobId(item?.application_id)} style={{ flex: 1, height: responsiveHeight(4.5), backgroundColor: colors.roseRed, alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`reject`)}</Text>
                                                </TouchableOpacity>
                                                <Space width={responsiveFontSize(1)} />
                                                <TouchableOpacity onPress={() => setacceptJobId(item?.application_id)} style={{ flex: 1, height: responsiveHeight(4.5), backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`accept`)}</Text>
                                                </TouchableOpacity>
                                            </View>}
                                            <Space height={responsiveFontSize(2)} />
                                            {item?.driver_mobile && <View style={{ alignItems: 'center', width: '100%', }}>
                                                <TouchableOpacity
                                                    onPress={() => callToDriver(item)}
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
                                                        {t(`callToDriver`)}
                                                    </Text>
                                                </TouchableOpacity>
                                                {/* <ZegoSendCallInvitationButton
                                                    invitees={[{ userID: 'TM2512UPDR23435', userName: 'Abhishek' }]}
                                                    isVideoCall={true}
                                                    resourceID="TruckMitr"
                                                    text="Start Video Interview"
                                                    backgroundColor={colors.royalBlue}
                                                    textColor={colors.white}
                                                    width={200}
                                                    height={responsiveHeight(4.5)}

                                                    borderRadius={5}
                                                // borderColor={colors.royalBlue}
                                                /> */}
                                            </View>}
                                        </View>
                                    );
                                }}
                                contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(5), paddingTop: responsiveHeight(2) }}
                                keyExtractor={(item, index) => index.toString()}
                                ListFooterComponent={() => {
                                    return (
                                        <Space height={responsiveHeight(10)} />
                                    )
                                }} />
                        </View>
            }
            <ConfirmationModal
                visible={acceptJobId !== -1}
                title={t(`acceptThisApplication`)}
                subtitle={t(`byAcceptingThisApplicationYouWillBeContactedSoon`)}
                confirmText={t(`accept`)}
                loader={accpetRejectLoading}
                onCancel={() => setacceptJobId(-1)}
                onAccept={_onPressAcceptApplication}
            />
            <ConfirmationModal
                visible={rejectJobId !== -1}
                title={t(`rejectThisApplication`)}
                subtitle={t(`noWorriesYouWillGetMoreApplications`)}
                confirmText={t(`reject`)}
                loader={accpetRejectLoading}
                onCancel={() => setrejectJobId(-1)}
                onAccept={_onPressRejectApplication}
                confirmStyle={{ backgroundColor: colors.roseRed }}
            />
        </View>
    )
}
