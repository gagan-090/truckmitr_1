import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import React, { } from 'react'
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import { BASE_URL } from '@truckmitr/src/utils/config';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { showToast } from '@truckmitr/src/app/hooks/toast';

const VideoModulesView = ({ item, index, module }: any) => {
    const dispatch = useDispatch()
    const { t } = useTranslation();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const colors = useColor();
    const { shadow } = useShadow()

    const { isDriver, subscriptionDetails, subscriptionModal } = useSelector((state: any) => { return state?.user })

    const videoPlayStatus = !item?.play_status

    const _navigatePlayer = () => {
        if (subscriptionDetails?.showSubscriptionModel && isDriver && module !== "Module 1") {
            !subscriptionModal && dispatch(subscriptionModalAction(true))
        }
        if (!videoPlayStatus) {
            if (index === 0) {
                navigation.navigate(STACKS.PLAYER, { item })
            } else {
                navigation.navigate(STACKS.PLAYER, { item })
            }
        } else {
            if (!subscriptionDetails?.showSubscriptionModel) { showToast(t(`toWatchThisVideoPleaseCompleteThePreviousOneFirst`)) }
        }
    }
    return (
        <View style={{ width: responsiveWidth(100), marginBottom: responsiveFontSize(2) }}>
            <TouchableOpacity onPress={_navigatePlayer} activeOpacity={.7} style={{ width: responsiveWidth(90), backgroundColor: colors.white, marginTop: responsiveFontSize(1), borderRadius: 10, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), opacity: videoPlayStatus ? .5 : 1 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <FastImage style={{ height: responsiveHeight(24), width: responsiveWidth(90), borderTopLeftRadius: 10, borderTopRightRadius: 10 }} tintColor={item.thumbnail_url ? undefined : colors.blackOpacity(.3)} source={{ uri: `${BASE_URL}public/${item.thumbnail_url}` || 'https://truckmitr.com/public/images/preview.png' }} />
                    <TouchableOpacity onPress={_navigatePlayer} style={{ backgroundColor: colors.blackOpacity(.5), padding: responsiveFontSize(1.4), borderRadius: 100, position: 'absolute' }}>
                        <Ionicons name={"play"} size={26} color="white" />
                    </TouchableOpacity>
                </View>
                <Text style={{ color: colors.black, fontWeight: '500', fontSize: responsiveFontSize(2), margin: responsiveFontSize(1), marginBottom: 0 }}>{item.topic_name}</Text>
                <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), margin: responsiveFontSize(1), marginTop: responsiveFontSize(.5), marginBottom: responsiveFontSize(1.5) }}>{item.video_title_name}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default function Modules() {
    const { t } = useTranslation();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const route = useRoute<any>();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const { module, videos } = route?.params

    const _goback = () => {
        navigation.goBack()
    }
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{module?.name}</Text>
            </View>
            {/* <Space height={responsiveFontSize(1)} /> */}
            <View>
                <FlatList
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={videos}
                    renderItem={({ item, index }) => <VideoModulesView key={index} item={item} index={index} module={module?.name} />}
                    contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(5) }}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={() => {
                        return (
                            <Space height={responsiveHeight(20)} />
                        )
                    }} />
            </View>

        </View>
    )
}
