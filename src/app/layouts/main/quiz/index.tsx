import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProgressBar } from 'react-native-paper';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Quiz() {
    const { t } = useTranslation();
    const route = useRoute<any>();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { item } = route?.params
    const [currentQuestionId, setCurrentQuestionId] = useState(item?.questions[0].id);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [selectedAnswerLoading, setselectedAnswerLoading] = useState('')
    const [completeQuiz, setcompleteQuiz] = useState(false)
    const [quizResult, setquizResult] = useState<any>({})

    const attemptedQuestions = item?.questions.findIndex((q: any) => q.id === currentQuestionId) + 1;

    const _goback = () => {
        navigation.goBack();
    };
    
    const _navigateQuizResult = () => {
            navigation.navigate(STACKS.QUIZ_RESULT)
        }

    const handleAnswerSelection = async (answer: string) => {
        if (!currentQuestion) return;
        setselectedAnswerLoading(answer);
        setSelectedAnswer(answer);
        const formData = new FormData();
        formData.append('quiz_id', currentQuestion.id);
        formData.append('user_answer', answer);
        try {
            const response = await axiosInstance.post(END_POINTS.ATTEMPT_QUIZ, formData);
            if (response?.data?.status) {
                setquizResult(response?.data?.data.result)
                const currentIndex = item?.questions.findIndex((q: any) => q.id === currentQuestionId);
                if (currentIndex !== -1 && currentIndex < item?.questions.length - 1) {
                    const nextQuestionId = item.questions[currentIndex + 1].id;
                    setCurrentQuestionId(nextQuestionId);
                    setSelectedAnswer(null);
                } else {
                    // Quiz completed
                    setcompleteQuiz(true)
                    console.log("Quiz completed!");
                    // You can trigger navigation or show a result modal here
                }
            } else {
                console.warn("Quiz attempt failed: ", response?.data?.message);
            }
        } catch (error: any) {
            console.error("Quiz attempt error:", error);
        } finally {
            setselectedAnswerLoading('');
        }
    };


    const currentQuestion = item?.questions.find((q: any) => q.id === currentQuestionId);
    if (!currentQuestion) return null;

    const currentOptions = () => {
        const optionsObject = {
            option1: currentQuestion?.option1,
            option2: currentQuestion?.option2,
            option3: currentQuestion?.option3,
            option4: currentQuestion?.option4,
        }
        const options = Object.values(optionsObject);
        return options || []
    }


    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{`Module ${item?.module} (${t(`quiz`)})`}</Text>
            </View>
            {/*  */}
            {completeQuiz ?
                <View style={{ flex: 1, alignItems: 'center', }}>
                    <LottieView style={{ height: responsiveHeight(12), width: responsiveHeight(12), marginTop: responsiveHeight(4) }} source={require('@truckmitr/res/lotties/complete.json')} autoPlay loop />
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), marginTop: responsiveFontSize(1), fontWeight: '500' }}>{t(`complete`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.8), marginTop: responsiveFontSize(3), fontWeight: '500' }}>{t(`quizResult`)}</Text>
                    <Text style={{ width: responsiveWidth(90), color: colors.blackOpacity(.5), fontSize: responsiveFontSize(2), textAlign: 'center', fontWeight: '400' }}>{t(`quizResultTitle`)}</Text>
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(5) }}>
                        <TouchableOpacity style={{ flex: 1, height: responsiveHeight(10), alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`youHaveAttempted`)}</Text>
                            <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.4), fontWeight: 'bold' }}>{quizResult?.total_questions}</Text>
                        </TouchableOpacity>
                        <Space width={responsiveWidth(2)} />
                        <TouchableOpacity style={{ flex: 1, height: responsiveHeight(10), alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`correctAnswer`)}</Text>
                            <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.4), fontWeight: 'bold' }}>{quizResult?.correct_answers}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={_goback}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveHeight(5.8),
                            width: responsiveWidth(90),
                            backgroundColor: colors.royalBlue,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            borderRadius: 8, marginTop: responsiveHeight(2)
                        }}>
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.9), fontWeight: '500' }}>{t('reviewTraining')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={_navigateQuizResult}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveHeight(5.8),
                            width: responsiveWidth(90),
                            backgroundColor: colors.royalBlue,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            borderRadius: 8, marginTop: responsiveHeight(2)
                        }}>
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.9), fontWeight: '500' }}>{t('downloadTrainingCertificate')}</Text>
                    </TouchableOpacity>
                </View>
                : <>
                    <View style={{ paddingHorizontal: responsiveWidth(5) }}>
                        <ProgressBar progress={(item?.questions.findIndex((q: any) => q.id === currentQuestionId) + 1) / item?.questions.length} color={colors.royalBlue} style={{ height: responsiveFontSize(1), borderRadius: 5 }} />
                    </View>
                    <View style={{ backgroundColor: colors.blackOpacity(.05), alignSelf: 'center', paddingHorizontal: responsiveFontSize(2), paddingVertical: responsiveFontSize(.2), borderRadius: 100, marginTop: responsiveFontSize(1) }}>
                        <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '600' }}>{`${attemptedQuestions}/${item?.questions.length}`}</Text>
                    </View>
                    {/*  */}
                    <Space height={responsiveHeight(2)} />
                    {/*  */}
                    <View style={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(5) }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '600' }}>{`${currentQuestion.question_name}`}</Text>
                        <Image style={{ height: responsiveHeight(20), borderRadius: 10, marginVertical: responsiveFontSize(2), resizeMode: 'contain' }} source={{ uri: `${BASE_URL}${currentQuestion?.question_image}` }} />
                        <Space height={responsiveHeight(2)} />
                        {currentOptions().map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleAnswerSelection(option)}
                                disabled={selectedAnswerLoading?.length !== 0}
                                style={{ width: responsiveWidth(90), flexDirection: 'row', alignItems: 'center', backgroundColor: selectedAnswer === option ? colors.royalBlue : colors.white, paddingHorizontal: responsiveFontSize(1.5), paddingVertical: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(2), borderWidth: 1, borderColor: colors.blackOpacity(.05), ...shadow }}>
                                <Text style={{ flex: 1, color: selectedAnswer === option ? colors.white : colors.blackOpacity(.8), fontSize: responsiveFontSize(2), fontWeight: '400' }}>{option}</Text>
                                {selectedAnswerLoading === option ?
                                    <ActivityIndicator color={colors.white} size="small" />
                                    :
                                    <Ionicons name={selectedAnswer === option ? 'radio-button-on' : 'radio-button-off'} size={20} color={selectedAnswer === option ? colors.white : colors.blackOpacity(.7)} />
                                }
                            </TouchableOpacity>
                        ))}
                    </View>
                </>}
        </View>
    );
}
