import { DeviceEventEmitter, FlatList, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useColor, useImage, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space, TrainingCompletionModal } from '@truckmitr/src/app/components';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import { AnimatedFAB } from 'react-native-paper';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import FastImage from 'react-native-fast-image'
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Subscription from '../subscription';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import Feather from 'react-native-vector-icons/Feather'
import { showToast } from '@truckmitr/src/app/hooks/toast';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;


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
        <TouchableOpacity onPress={_navigatePlayer} activeOpacity={.7} style={{ width: responsiveWidth(50), backgroundColor: colors.white, marginTop: responsiveFontSize(1), marginRight: responsiveFontSize(2), borderRadius: 10, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), opacity: videoPlayStatus ? .5 : 1 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <FastImage style={{ height: responsiveHeight(12), width: responsiveWidth(50), borderTopLeftRadius: 10, borderTopRightRadius: 10 }} tintColor={item.thumbnail_url ? undefined : colors.blackOpacity(.3)} source={{ uri: `${BASE_URL}public/${item.thumbnail_url}` || 'https://truckmitr.com/public/images/preview.png' }} />
                <TouchableOpacity onPress={_navigatePlayer} style={{ backgroundColor: colors.blackOpacity(.5), padding: responsiveFontSize(1.2), borderRadius: 100, position: 'absolute' }}>
                    <Ionicons name={"play"} size={20} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', margin: responsiveFontSize(1), marginBottom: responsiveFontSize(0) }}>{item?.topic_name}</Text>
            <Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.6), margin: responsiveFontSize(1), marginTop: responsiveFontSize(0), marginBottom: responsiveFontSize(1.5) }}>{item?.video_title_name}</Text>
        </TouchableOpacity>
    )
}

export default function Training() {
    const { t } = useTranslation();
    const route = useRoute<any>()
    const { params } = route
    const dispatch = useDispatch()
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const images = useImage()
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [theme, settheme] = useState('LIGHT')
    const { i18n } = useTranslation(); // Use translation hook from i18next

    const STORAGE_VIDEO_KEY = (value: any) => `@video_progress_${value}`;

    const { isDriver, subscriptionDetails, subscriptionModal } = useSelector((state: any) => { return state?.user })

    const [videoModules, setvideoModules] = useState([])
    const [continueWatching, setcontinueWatching] = useState<any>({})
    const [loading, setloading] = useState(true)
    const [quizModuleModel, setquizModuleModel] = useState(false)
    const [moduleQuizToggle, setmoduleQuizToggle] = useState('')
    const [quizList, setquizList] = useState([])
    const [trainingCompleteModal, setTrainingCompleteModal] = useState({
        visible: false,
        module: 1
    });
    const [isExtended, setIsExtended] = useState(false);

    const handleAttemptQuiz = () => {
        if (subscriptionDetails?.showSubscriptionModel && isDriver) {
            !subscriptionModal && dispatch(subscriptionModalAction(true));
        } else {
            setmoduleQuizToggle('MODULE_1');
            setquizModuleModel(true);
        }
    };

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('SHOW_TRAINING_COMPLETE_MODAL', (data) => {
            setTrainingCompleteModal({
                visible: true,
                module: data.module,
                totalModules: data.totalModules
            });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const handleStartNextModule = () => {
        const nextModuleNumber = trainingCompleteModal.module + 1;

        if (nextModuleNumber > trainingCompleteModal.totalModules) {
            setTrainingCompleteModal({ ...trainingCompleteModal, visible: false });
            return;
        }
        // Find the next module
        const nextModule = videoModules.find((module: any) => {
            const moduleName = module.module?.name.toLowerCase();
            const moduleNumberMatch = moduleName.match(/\d+/);
            if (moduleNumberMatch) {
                return parseInt(moduleNumberMatch[0]) === nextModuleNumber;
            }
            return false;
        });

        if (nextModule) {
            navigation.navigate(STACKS.MODULES, nextModule);
        }
        setTrainingCompleteModal({ ...trainingCompleteModal, visible: false });
    };

    // Update the handleModalClose function
    const handleModalClose = () => {
        setTrainingCompleteModal({ ...trainingCompleteModal, visible: false });
    };

    useEffect(() => {
        setTimeout(() => {
            setIsExtended(true)
        }, 500);
    }, [])

    const watchAllVideos = videoModules.map(({ module, videos }: any) => {
        const watchAllVideos = videos.every((video: any) => video.watch_status === true);
        return {
            module: module.name.toLowerCase().replace(/\s+/g, ''),
            watchAllVideos
        };
    }) as any


    const _quizList = async () => {
        try {
            const response: any = await axiosInstance.get(END_POINTS?.QUIZ_LIST);
            if (response?.data?.status) {
                setquizList(response?.data?.data)
            }
        } catch (error) {
            console.error(error);
        }
    };

    const LANGUAGES = [
        { name: 'हिन्दी', title: i18n.t(`hindi`), code: 'hi', },        // Hindi
        { name: 'English', title: i18n.t(`english`), code: 'en' },      // English
        { name: 'Hinglish', title: i18n.t(`hinglish`), code: 'hn' },     // Hinglish (custom/mixed language – no native script)
        { name: 'ਪੰਜਾਬੀ', title: i18n.t(`punjabi`), code: 'pa' },       // Punjabi
        { name: 'اردو', title: i18n.t(`urdu`), code: 'ur' },         // Urdu
    ];

    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            const currentLang = i18n.language;
            const selected = LANGUAGES.find(l => l.code === currentLang);
            if (selected) {
                setSelectedLanguage(selected.name);
            }
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (params?.quizModal) {
                setTimeout(() => {
                    setquizModuleModel(params?.quizModal)
                }, 500);
            }
        }, [navigation, route])
    );

    useFocusEffect(
        useCallback(() => {
            const _videoModules = async () => {
                try {
                    const response: any = await axiosInstance.get(END_POINTS?.VIDEO_MODULES);
                    if (response?.data?.success) {
                        setvideoModules(response?.data?.data);
                        const allVideos = response?.data?.data.flatMap((module: any) => module.videos);
                        let storeVideo = null;
                        for (const a of allVideos) {
                            const saved = await AsyncStorage.getItem(STORAGE_VIDEO_KEY(a?.video));
                            if (saved) {
                                storeVideo = a;
                                break;
                            }
                        }
                        setcontinueWatching(storeVideo);
                    }
                } catch (error) {
                    console.error("Error fetching video modules:", error);
                } finally {
                    setloading(false);
                }
            };
            _videoModules();
            _quizList()
        }, [])
    );


    const _navigateModules = (item: any) => () => {
        navigation.navigate(STACKS.MODULES, item)
    }
    const _openQuizModel = () => {
        if (subscriptionDetails?.showSubscriptionModel && isDriver) {
            !subscriptionModal && dispatch(subscriptionModalAction(true))
        } else {
            setquizModuleModel(true)
        }

    }
    const _navigateQuiz = () => {
        navigation.navigate(STACKS.QUIZ, { item: quizList?.find((a: any) => Number(a?.module) === (moduleQuizToggle === 'MODULE_1' ? 1 : 2)) })
    }
    const _navigatePlayer = () => {
        navigation.navigate(STACKS.PLAYER, { item: continueWatching, isContinueWatching: true })
    }
    const _navigateLanguage = () => {
        navigation.navigate(STACKS.LANGUAGE_MAIN)
    }
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(5) }}>
                <Image source={images.TRUCKMITR_HORIZONTAL} style={{ height: responsiveHeight(8), width: responsiveWidth(32), resizeMode: 'contain' }} />
                {/* <View style={{ height: responsiveFontSize(3.7), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, padding: responsiveFontSize(.5), borderRadius: 100, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                    <TouchableOpacity activeOpacity={.7} onPress={_onpressTheme('DARK')} hitSlop={hitSlop(10)} style={{ height: responsiveFontSize(3.2), width: responsiveFontSize(3.2), backgroundColor: theme === 'DARK' ? colors.royalBlue : colors.transparent, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                        <Ionicons name={'moon'} size={16} color={theme === 'DARK' ? colors.white : colors.blackOpacity(.2)} />
                    </TouchableOpacity>
                    <Space width={responsiveWidth(.5)} />
                    <TouchableOpacity activeOpacity={.7} onPress={_onpressTheme('LIGHT')} hitSlop={hitSlop(10)} style={{ height: responsiveFontSize(3.2), width: responsiveFontSize(3.2), backgroundColor: theme === 'LIGHT' ? colors.royalBlue : colors.transparent, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                        <Ionicons name={'sunny'} size={16} color={theme === 'LIGHT' ? colors.white : colors.blackOpacity(.2)} />
                    </TouchableOpacity>
                </View> */}
                <TouchableOpacity onPress={_navigateLanguage} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: responsiveFontSize(.4), paddingHorizontal: responsiveFontSize(1.6), borderRadius: 100, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                    <Ionicons name={'language'} size={22} color={colors.royalBlue} />
                    <Text style={{ color: colors.royalBlue, fontWeight: 'bold', marginHorizontal: responsiveFontSize(.5) }}>{selectedLanguage}</Text>
                    <Feather name={'chevron-down'} size={18} color={colors.blackOpacity(.5)} />
                </TouchableOpacity>
            </View>
            <Space height={responsiveFontSize(1)} />
            {loading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ height: responsiveHeight(22), width: responsiveWidth(50), borderTopLeftRadius: 10, borderTopRightRadius: 10, tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                </View>
                : <ScrollView style={{}}>
                    {continueWatching?.video_title_name &&
                        <View style={{ width: responsiveWidth(100), marginBottom: responsiveFontSize(2) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(5), marginTop: responsiveFontSize(1), }}>
                                <Text style={{ fontSize: responsiveFontSize(2), color: colors.black, fontWeight: '500' }}>{t('continueWatching')}</Text>
                            </View>
                            <TouchableOpacity onPress={_navigatePlayer} activeOpacity={.7} style={{ width: responsiveWidth(50), backgroundColor: colors.white, marginTop: responsiveFontSize(1), marginRight: responsiveFontSize(2), borderRadius: 10, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), margin: responsiveWidth(5) }}>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Image style={{ height: responsiveHeight(12), width: responsiveWidth(50), borderTopLeftRadius: 10, borderTopRightRadius: 10 }} source={{ uri: `${BASE_URL}public/${continueWatching.thumbnail_url}` || 'https://truckmitr.com/public/images/preview.png' }} />
                                    <TouchableOpacity onPress={_navigatePlayer} style={{ backgroundColor: colors.blackOpacity(.5), padding: responsiveFontSize(1.2), borderRadius: 100, position: 'absolute' }}>
                                        <Ionicons name={"play"} size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', margin: responsiveFontSize(1), marginBottom: responsiveFontSize(0) }}>{continueWatching.topic_name}</Text>
                                <Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.6), margin: responsiveFontSize(1), marginTop: responsiveFontSize(0), marginBottom: responsiveFontSize(1.5) }}>{continueWatching.video_title_name}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    <Space height={responsiveHeight(5)} />
                    <View style={{ marginHorizontal: responsiveWidth(5), marginTop: responsiveWidth(-8) }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' }}>{t(`modules`)}</Text>
                        <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{t(`modulesTitle`)}</Text>
                    </View>
                    <Space height={responsiveHeight(2)} />
                    {videoModules?.length ? <FlatList
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={videoModules}
                        renderItem={({ item, index }: any) => {
                            const moduleName = item?.module?.name;
                            return (
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(5), marginTop: responsiveFontSize(1), }}>
                                        <Text style={{ fontSize: responsiveFontSize(2), color: colors.black, fontWeight: '500' }}>{item?.module?.name}</Text>
                                        <TouchableOpacity onPress={_navigateModules(item)} style={{}}>
                                            <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.blackOpacity(.7), fontWeight: '500' }}>{t(`seeAll`)}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        showsHorizontalScrollIndicator={false}
                                        showsVerticalScrollIndicator={false}
                                        horizontal
                                        data={item?.videos}
                                        renderItem={({ item, index }) => <VideoModulesView key={index} item={item} index={index} module={moduleName} />}
                                        contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(5) }}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                </View>
                            )
                        }}
                        contentContainerStyle={{ paddingBottom: responsiveHeight(5) }}
                        keyExtractor={(item, index) => index.toString()}
                    /> : null}
                </ScrollView>}
            <TrainingCompletionModal
                visible={trainingCompleteModal.visible}
                onRequestClose={handleModalClose}
                currentModule={trainingCompleteModal.module}
                totalModules={trainingCompleteModal.totalModules}
                onAttemptQuiz={handleAttemptQuiz}
                onStartNextModule={handleStartNextModule}
            />
            {/* Model DOB */}
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={quizModuleModel}
                statusBarTranslucent
                navigationBarTranslucent>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.7), }}>
                    <View style={{ backgroundColor: colors.white, alignItems: 'center', width: responsiveWidth(90), borderRadius: 10, overflow: 'hidden' }}>
                        <Space height={responsiveHeight(2)} />
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' }}>{t(`attemptTheQuiz`)}</Text>
                        <Space height={responsiveHeight(.5)} />
                        {!watchAllVideos[0]?.watchAllVideos ? <Text style={{ width: '80%', color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.9), textAlign: 'center', marginVertical: responsiveFontSize(1.2) }}>{t(`youMustCompleteAllVideos`)}</Text>
                            : <View style={{ flexDirection: 'row', padding: responsiveWidth(6) }}>
                                <TouchableOpacity onPress={() => setmoduleQuizToggle('MODULE_1')} style={{ flex: 1, height: responsiveHeight(10), alignItems: 'center', justifyContent: 'center', backgroundColor: moduleQuizToggle === 'MODULE_1' ? colors.blackOpacity(.07) : colors.blackOpacity(.01), borderRadius: 5, borderColor: moduleQuizToggle === 'MODULE_1' ? colors.blackOpacity(.0) : colors.blackOpacity(.05), borderWidth: 1 }}>
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.9), fontWeight: '500' }}>{`Module 1`}</Text>
                                    <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.6), fontWeight: '400' }}>{t('quiz')}</Text>
                                    <TouchableOpacity onPress={() => setmoduleQuizToggle('MODULE_1')} style={{ position: 'absolute', zIndex: 100, left: responsiveFontSize(.7), top: responsiveFontSize(.7) }}>
                                        <Ionicons name={moduleQuizToggle === 'MODULE_1' ? 'radio-button-on' : 'radio-button-off'} size={22} color={moduleQuizToggle === 'MODULE_1' ? colors.black : colors.blackOpacity(.5)} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                                <Space width={responsiveWidth(4)} />
                                <TouchableOpacity onPress={() => setmoduleQuizToggle('MODULE_2')} disabled={!watchAllVideos[1]?.watchAllVideos} style={{ flex: 1, height: responsiveHeight(10), alignItems: 'center', justifyContent: 'center', backgroundColor: moduleQuizToggle === 'MODULE_2' ? colors.blackOpacity(.07) : colors.blackOpacity(.01), borderRadius: 5, borderColor: moduleQuizToggle === 'MODULE_2' ? colors.blackOpacity(.0) : colors.blackOpacity(.05), borderWidth: 1, opacity: !watchAllVideos[1]?.watchAllVideos ? .5 : 1 }}>
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.9), fontWeight: '500' }}>{`Module 2`}</Text>
                                    <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.6), fontWeight: '400' }}>{t('quiz')}</Text>
                                    <TouchableOpacity onPress={() => {
                                        if (!watchAllVideos[1]?.watchAllVideos) {
                                            showToast(t(`toAttemptQuizPlsCompleteModule2Training`));
                                        } else {
                                            setmoduleQuizToggle('MODULE_2');
                                        }
                                    }}
                                        // disabled={!watchAllVideos[1]?.watchAllVideos}
                                        style={{ position: 'absolute', zIndex: 100, left: responsiveFontSize(.7), top: responsiveFontSize(.7) }}>
                                        <Ionicons name={moduleQuizToggle === 'MODULE_2' ? 'radio-button-on' : 'radio-button-off'} size={22} color={moduleQuizToggle === 'MODULE_2' ? colors.black : colors.blackOpacity(.5)} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </View>}
                        <Space height={responsiveHeight(2)} />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setquizModuleModel(false)} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.1), bottom: -1 }}>
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`cancel`)}</Text>
                            </TouchableOpacity>
                            {!watchAllVideos[0]?.watchAllVideos ? <TouchableOpacity onPress={() => setquizModuleModel(false)} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.azureBlue, bottom: -1 }}>
                                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`ok`)}</Text>
                            </TouchableOpacity>
                                : <TouchableOpacity onPress={() => {
                                    _navigateQuiz()
                                    setquizModuleModel(false)
                                }} activeOpacity={.7} disabled={!moduleQuizToggle?.length} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.azureBlue, bottom: -1, opacity: !moduleQuizToggle?.length ? .7 : 1 }}>
                                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`confirm`)}</Text>
                                </TouchableOpacity>}
                        </View>
                    </View>
                </View>
            </Modal>
            <AnimatedFAB
                icon={'lightbulb-on'}
                label={t('quiz')}
                color={colors.white}
                extended={isExtended}
                onPress={_openQuizModel}
                visible={true}
                iconMode={'dynamic'}
                style={{
                    position: 'absolute',
                    bottom: responsiveWidth(5),
                    right: responsiveWidth(5),
                    backgroundColor: colors.royalBlue
                }}
            />
        </View>
    )
}
