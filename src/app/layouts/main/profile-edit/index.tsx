import { Image, Modal, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import ImagePicker from 'react-native-image-crop-picker';
import { Dropdown } from 'react-native-element-dropdown';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { userEditAction } from '@truckmitr/src/redux/actions/user.action';
import { useTranslation } from 'react-i18next';
import { requestCameraPermission, requestPhotoLibraryPermission } from '@truckmitr/src/utils/permissions/imagePermissions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function ProfileEdit() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { shadow } = useShadow();
    const { userEdit } = useSelector((state: any) => { return state?.user })

    const dateOfBirth = userEdit?.DOB ? new Date(userEdit?.DOB) : moment().subtract(18, 'years').toDate();

    const [dateOfBirthModel, setdateOfBirthModel] = useState(false)
    const [profileModel, setprofileModel] = useState(false)

    const [locations, setLocations] = useState<any[]>([]);

    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        mobile?: string;
        dateOfBirth?: string;
        gender?: string;
        address?: string
        city?: string
        state?: string;
    }>({});

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!userEdit?.name) {
            newErrors.fullName = t('fullNameRequired');
            valid = false;
        }
        // if (!userEdit?.email) {
        //     newErrors.email = t('e-mailRequired');
        //     valid = false;
        // }
        else if (userEdit?.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEdit?.email)) {
                newErrors.email = t('invalidEmailFormat');
                valid = false;
            }
        }
        if (!userEdit?.mobile) {
            newErrors.mobile = t('mobileNumberRequired');
            valid = false;
        } else if (userEdit?.mobile.length < 10) {
            newErrors.mobile = t('mobileNumber_10_digits');
            valid = false;
        }
        if (!userEdit?.DOB) {
            newErrors.dateOfBirth = t('dobRequired');
            valid = false;
        }
        if (!userEdit?.Sex) {
            newErrors.gender = t('genderRequired');
            valid = false;
        }
        if (!userEdit?.address) {
            newErrors.address = t('addressRequired');
            valid = false;
        }
        if (!userEdit?.city) {
            newErrors.city = t('cityRequired');
            valid = false;
        }
        if (!userEdit?.states) {
            newErrors.state = t('stateRequired');
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const _goback = () => {
        navigation.goBack();
    };

    const _navigateDrivingDetails = () => {
        if (!validate()) return;
        navigation.navigate(STACKS.DRIVING_DETAILS, {
            profile: userEdit?.profilePath?.path ? userEdit?.profilePath : {},
            fullName: userEdit?.name,
            email: userEdit?.email,
            mobile: userEdit?.mobile,
            fatherName: userEdit?.Father_Name,
            dateOfBirth: moment(dateOfBirth).format("DD-MM-YYYY"),
            gender: userEdit?.Sex,
            maritalStatus: userEdit.Marital_Status,
            education: userEdit?.Highest_Education,
            address: userEdit?.address,
            city: userEdit?.city,
            state: userEdit?.states
        });
    };



    const _openCamera = async () => {
        try {
            // Request camera permission first
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                showToast(t('cameraPermissionRequired') || 'Camera permission required');
                return;
            }

            const image = await ImagePicker.openCamera({
                cropping: true,
                width: 512,
                height: 512,
                mediaType: 'photo',
                includeBase64: false,
                compressImageQuality: 0.8,
            });

            console.log('Profile image from camera:', image);

            if (image && image.path) {
                dispatch(userEditAction({ ...userEdit, profilePath: image }));
                setprofileModel(false);
                showToast(t('imageSelected') || 'Image selected successfully');
            } else {
                console.error('Invalid image data from camera');
                showToast(t('failedToOpenCamera') || 'Failed to capture image');
            }
        } catch (error: any) {
            console.log('Camera image picker error:', error);
            if (error.code !== 'E_PICKER_CANCELLED') {
                showToast(t('failedToOpenCamera') || 'Failed to open camera');
            }
        }
    }

    const _openGallery = async () => {
        try {
            // Request photo library permission first
            // On Android 13+, this returns true immediately as we use the system picker
            const hasPermission = await requestPhotoLibraryPermission();
            if (!hasPermission) {
                showToast(t('photoPermissionRequired') || 'Photo permission required');
                return;
            }

            const image = await ImagePicker.openPicker({
                cropping: true,
                width: 512,
                height: 512,
                mediaType: 'photo',
                includeBase64: false,
                compressImageQuality: 0.8,
            });

            console.log('Profile image from gallery:', image);

            if (image && image.path) {
                dispatch(userEditAction({ ...userEdit, profilePath: image }));
                setprofileModel(false);
                showToast(t('imageSelected') || 'Image selected successfully');
            } else {
                console.error('Invalid image data from gallery');
                showToast(t('failedToSelectImage') || 'Failed to select image');
            }
        } catch (error: any) {
            console.log('Gallery image picker error:', error);
            if (error.code !== 'E_PICKER_CANCELLED') {
                showToast(t('failedToSelectImage') || 'Failed to select image');
            }
        }
    }

    const _onPressProfile = () => {
        setprofileModel(true)
    };

    const _onPressProfileDelete = () => {
        dispatch(userEditAction({ ...userEdit, profilePath: {} }));
    }

    const getLocation = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.GETSTATES);
            if (response?.data?.status) {
                setLocations(response?.data?.data);
            }
            console.log('Fetched locations:', JSON.stringify(response));
        } catch (error: any) {
            console.log('Error fetching locations:', error);
            showToast(error);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    // Add timestamp to server images to prevent caching issues
    const profileImageUri = userEdit?.profilePath?.path
        ? userEdit.profilePath.path
        : userEdit?.images
            ? `${BASE_URL}public/${userEdit.images}?t=${Date.now()}`
            : 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';

    // Create a unique key for the image to force re-render when it changes
    const imageKey = userEdit?.profilePath?.path || `${userEdit?.images}-${Date.now()}` || 'default';

    console.log('Profile Image URI:', profileImageUri);
    console.log('userEdit.profilePath:', userEdit?.profilePath);

    // Define minimum and maximum dates using Moment and convert them to Date objects.
    const minimumDate = moment().subtract(150, "years").toDate();
    const maximumDate = moment().subtract(18, "years").toDate();
    return (
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center' }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity
                    hitSlop={hitSlop(10)}
                    onPress={_goback}
                    style={{
                        height: responsiveFontSize(4),
                        width: responsiveFontSize(4),
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.white,
                        borderRadius: 100,
                        zIndex: 100,
                    }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text
                    style={{
                        width: responsiveWidth(100),
                        fontSize: responsiveFontSize(2.2),
                        color: colors.royalBlue,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        position: 'absolute',
                        zIndex: 1,
                    }}>
                    {t('profileEdit')}
                </Text>
            </View>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={responsiveHeight(30)}>
                <Space height={responsiveFontSize(2)} />
                <View style={{ height: responsiveHeight(5.5), flexDirection: 'row', paddingHorizontal: responsiveWidth(2.5) }}>
                    <View style={{ flex: 1, backgroundColor: colors.blueOpacity(0.2), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), fontWeight: '600', textAlign: 'center' }}>
                            {t('personalDetails')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.05), alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginHorizontal: responsiveWidth(3) }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '500', textAlign: 'center' }}>
                            {t('drivingDetails')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.05), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '500', textAlign: 'center' }}>
                            {t('uploadDocuments')}
                        </Text>
                    </View>
                </View>
                <Space height={responsiveFontSize(2)} />
                <TouchableOpacity onPress={_onPressProfile} activeOpacity={1}>
                    <Image
                        key={imageKey}
                        style={{ height: responsiveHeight(14), width: responsiveHeight(14), borderRadius: 100, borderColor: colors.blackOpacity(.2), borderWidth: 1 }}
                        source={{ uri: profileImageUri }}
                        onError={(error) => console.log('Image load error:', error.nativeEvent)}
                        onLoad={() => console.log('Image loaded successfully:', profileImageUri)}
                    />
                    {!userEdit?.profilePath?.path ? <TouchableOpacity
                        onPress={_onPressProfile}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveFontSize(4.2),
                            width: responsiveFontSize(4.2),
                            backgroundColor: colors.white,
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            bottom: responsiveFontSize(-2),
                            alignSelf: 'center',
                            borderRadius: 100,
                            ...shadow,
                            shadowColor: isIOS() ? colors.blackOpacity(0.2) : colors.blackOpacity(0.4),
                        }}>
                        <MaterialIcons name={'edit'} size={20} color={colors.black} />
                    </TouchableOpacity>
                        :
                        <TouchableOpacity
                            onPress={_onPressProfileDelete}
                            activeOpacity={0.7}
                            style={{
                                height: responsiveFontSize(3.5),
                                width: responsiveFontSize(3.5),
                                backgroundColor: colors.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'absolute',
                                bottom: responsiveFontSize(-2),
                                alignSelf: 'center',
                                borderRadius: 100,
                                ...shadow,
                                shadowColor: isIOS() ? colors.blackOpacity(0.2) : colors.blackOpacity(0.4),
                            }}>
                            <Ionicons name={'close'} size={16} color={colors.black} />
                        </TouchableOpacity>}
                </TouchableOpacity>
                <Space height={responsiveFontSize(4)} />
                <View style={{ flex: 1, width: responsiveWidth(100), paddingHorizontal: responsiveWidth(5) }}>
                    {/* Full Name */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('fullName')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            value={userEdit?.name || ''}
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, name: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    fullName: undefined,
                                }));
                            }}
                            placeholder={t('enterFullName')}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors?.fullName && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.fullName}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* E-mail */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('e-mail')}
                        </Text>
                        <TextInput
                            value={userEdit?.email || ''}
                            onChangeText={(text) => {
                                const lower = text.toLowerCase(); // lowercase all
                                dispatch(userEditAction({ ...userEdit, email: lower }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    email: undefined,
                                }));
                            }}
                            placeholder={t('enterE-mail')}
                            keyboardType={'email-address'}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors?.email && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.email}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Mobile */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`mobile`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            value={userEdit?.mobile || ''}
                            editable={false}
                            placeholder={t('enterMobile')}
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, mobile: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    mobile: undefined,
                                }));
                            }}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                                opacity: 0.5,
                            }}
                        />
                        {errors?.mobile && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.mobile}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Father's Name */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('fatherName')}</Text>
                    <TextInput
                        value={userEdit?.Father_Name || ''}
                        onChangeText={(text) => {
                            dispatch(userEditAction({ ...userEdit, Father_Name: text }));
                        }}
                        placeholder={t('enterFatherName')}
                        style={{
                            color: colors.black,
                            fontSize: responsiveFontSize(2),
                            fontWeight: '500',
                            height: responsiveHeight(5.5),
                            borderColor: colors.blackOpacity(0.2),
                            borderWidth: 1,
                            borderRadius: 10,
                            marginTop: responsiveFontSize(0.5),
                            paddingHorizontal: responsiveFontSize(2),
                        }}
                    />
                    <Space height={responsiveFontSize(2.5)} />

                    {/* DOB */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('dob')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: responsiveHeight(5.5), borderColor: colors.blackOpacity(0.2), borderWidth: 1, borderRadius: 10, marginTop: responsiveFontSize(0.5), paddingHorizontal: responsiveFontSize(2), }}>
                            <TextInput
                                value={userEdit?.DOB ? moment(dateOfBirth).format("DD-MM-YYYY") : ''}
                                editable={false}
                                placeholder='DD-MM-YYYY'
                                style={{
                                    flex: 1,
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '500',

                                }}
                            />
                            <TouchableOpacity onPress={() => setdateOfBirthModel(true)} hitSlop={hitSlop(10)}>
                                <Ionicons name={'calendar'} size={20} color={colors.black} />
                            </TouchableOpacity>
                        </View>
                        {errors?.dateOfBirth && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.dateOfBirth}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Gender */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('gender')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(userEditAction({ ...userEdit, Sex: 'Male' }));
                                    setErrors((prevData) => ({
                                        ...prevData,
                                        gender: undefined,
                                    }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: userEdit?.Sex === 'Male' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2.5),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Image
                                    style={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2118/2118607.png' }}
                                />
                                <Text style={{ color: colors.black, fontWeight: userEdit?.Sex === 'Male' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>{'Male'}</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1.5)} />
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(userEditAction({ ...userEdit, Sex: 'Female' }));
                                    setErrors((prevData) => ({
                                        ...prevData,
                                        gender: undefined,
                                    }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: userEdit?.Sex === 'Female' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2.5),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Image
                                    style={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2118/2118601.png' }}
                                />
                                <Text style={{ color: colors.black, fontWeight: userEdit?.Sex === 'Female' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>{'Female'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors?.gender && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.gender}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Marital Status */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`maritalStatus`)}</Text>
                    <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Marital_Status: 'Single' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit.Marital_Status === 'Single' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit.Marital_Status === 'Single' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>Single</Text>
                        </TouchableOpacity>
                        <Space width={responsiveFontSize(1.5)} />
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Marital_Status: 'Married' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit.Marital_Status === 'Married' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit.Marital_Status === 'Married' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>Married</Text>
                        </TouchableOpacity>
                        <Space width={responsiveFontSize(1.5)} />
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Marital_Status: 'Widowed' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit.Marital_Status === 'Widowed' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit.Marital_Status === 'Widowed' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>Widowed</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Marital_Status: 'Divorced' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit.Marital_Status === 'Divorced' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit.Marital_Status === 'Divorced' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>Divorced</Text>
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Highest Education */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('highestEducation')}</Text>
                    <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit?.Highest_Education === 'Below 10th' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit?.Highest_Education === 'Below 10th' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Below 10th</Text>
                        </TouchableOpacity>
                        <Space width={responsiveFontSize(1.5)} />
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Highest_Education: '10th Passed' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit?.Highest_Education === '10th Passed' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit?.Highest_Education === '10th Passed' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>10th Passed</Text>
                        </TouchableOpacity>
                        <Space width={responsiveFontSize(1.5)} />
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Highest_Education: '12th Passed' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit?.Highest_Education === '12th Passed' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit?.Highest_Education === '12th Passed' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>12th Passed</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Highest_Education: 'Graduate' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit?.Highest_Education === 'Graduate' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit?.Highest_Education === 'Graduate' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Graduate</Text>
                        </TouchableOpacity>
                        <Space width={responsiveFontSize(1.5)} />
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(userEditAction({ ...userEdit, Highest_Education: 'Post Graduate' }));
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: userEdit?.Highest_Education === 'Post Graduate' ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                paddingHorizontal: responsiveFontSize(2),
                                paddingVertical: responsiveFontSize(1),
                                borderRadius: 100,
                            }}>
                            <Text style={{ color: colors.black, fontWeight: userEdit?.Highest_Education === 'Post Graduate' ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Post Graduate</Text>
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Address */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('address')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                        <TextInput
                            value={userEdit?.address || ''}
                            multiline
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, address: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    address: undefined,
                                }));
                            }}
                            placeholder={t('enterCompleteAddress')}
                            style={{
                                textAlignVertical: 'top',
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(14),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors.address && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.address}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* City */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('city')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                        <TextInput
                            value={userEdit?.city || ''}
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, city: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    city: undefined,
                                }));
                            }}
                            placeholder={t('enterCity')}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors.city && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.city}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* State */}
                    <View>
                        <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500', marginLeft: responsiveFontSize(0.5) }}>{t('state')} <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <Dropdown
                            disable
                            style={{
                                height: responsiveHeight(6),
                                paddingHorizontal: responsiveFontSize(1.5),
                                borderRadius: 10,
                                borderColor: colors.blackOpacity(0.1),
                                borderWidth: 1,
                                marginTop: responsiveFontSize(0.5),
                            }}
                            containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
                            itemTextStyle={{ color: colors.blackOpacity(0.8) }}
                            placeholderStyle={{
                                fontSize: responsiveFontSize(1.9),
                                color: colors.blackOpacity(0.7),
                                fontWeight: '500',
                            }}
                            selectedTextStyle={{
                                color: colors.blackOpacity(.5),
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                            }}
                            iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                            // Map the fetched locations to the required format
                            data={locations.length ? locations.map(item => ({ label: item.name, value: item.id.toString() })) : []}
                            dropdownPosition="top"
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={t("selectState")}
                            value={(locations?.find(state => userEdit?.states && (state.name.toLowerCase() === userEdit.states.toLowerCase() || state.id === Number(userEdit.states)))?.id)?.toString() || ''}
                            onChange={item => {
                                dispatch(userEditAction({ ...userEdit, states: item.value }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    state: undefined,
                                }));
                            }}
                        />
                        {errors.state && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.state}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(5)} />
                    <TouchableOpacity
                        onPress={_navigateDrivingDetails}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveHeight(5.8),
                            width: responsiveWidth(90),
                            backgroundColor: colors.royalBlue,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            borderRadius: 8,
                        }}>
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('next')}</Text>
                    </TouchableOpacity>
                    <Space height={responsiveFontSize(10)} />
                    {/* Model DOB */}
                    <Modal
                        animationType={'fade'}
                        transparent={true}
                        visible={dateOfBirthModel}
                        statusBarTranslucent
                        navigationBarTranslucent
                        onRequestClose={() => {
                            // Alert.alert('Modal has been closed.');
                            // setModalVisible(!modalVisible);
                        }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.7), }}>
                            <View style={{ backgroundColor: colors.white, alignItems: 'center', width: responsiveWidth(90), borderRadius: 10, overflow: 'hidden' }}>
                                <Space height={responsiveHeight(2)} />
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' }}>{t(`dateOfBirth`)}</Text>
                                <Space height={responsiveHeight(.5)} />
                                <DatePicker
                                    mode='date'
                                    theme='light'
                                    date={dateOfBirth} // Sets the initial date to display in the picker
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    onDateChange={(date) => {
                                        dispatch(userEditAction({ ...userEdit, DOB: date }));
                                        setErrors((prevData) => ({
                                            ...prevData,
                                            dateOfBirth: undefined
                                        }))
                                    }}
                                    modal={false}
                                />
                                <Space height={responsiveHeight(.5)} />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => setdateOfBirthModel(false)} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.1), bottom: -1 }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`cancel`)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setTimeout(() => {
                                            setdateOfBirthModel(false)
                                        }, 600);
                                    }} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.azureBlue, bottom: -1 }}>
                                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`confirm`)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
                {/* Profile Model */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={profileModel}
                    statusBarTranslucent
                    navigationBarTranslucent>
                    <TouchableWithoutFeedback onPress={() => setprofileModel(false)}>
                        <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.5), justifyContent: 'flex-end' }}>
                            <TouchableWithoutFeedback>
                                <View style={{ width: responsiveWidth(100), backgroundColor: colors.white, alignItems: 'center', padding: responsiveWidth(2.5), borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' }}>{t(`chooseAction`)}</Text>
                                    <Space height={responsiveFontSize(1.2)} />
                                    <TouchableOpacity onPress={_openCamera} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: responsiveFontSize(1.5) }}>
                                        <Image style={{ height: responsiveFontSize(3), width: responsiveFontSize(3) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/16076/16076003.png' }} />
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500', marginLeft: responsiveFontSize(2.5) }}>{t(`camera`)}</Text>
                                    </TouchableOpacity>
                                    <Space style={{ height: responsiveFontSize(.1), width: '100%', backgroundColor: colors.blackOpacity(.05) }} />
                                    <TouchableOpacity onPress={_openGallery} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', padding: responsiveFontSize(1.5) }}>
                                        <Image style={{ height: responsiveFontSize(3.2), width: responsiveFontSize(3.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/9261/9261484.png' }} />
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500', marginLeft: responsiveFontSize(2.5) }}>{t(`gallery`)}</Text>
                                    </TouchableOpacity>
                                    <Space height={safeAreaInsets.bottom + responsiveHeight(1)} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </KeyboardAwareScrollView>
        </View>
    );
}
