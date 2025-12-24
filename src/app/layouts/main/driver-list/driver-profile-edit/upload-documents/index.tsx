import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from 'react-native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-crop-picker';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import { driverProfileEditAction } from '@truckmitr/src/redux/actions/user.action';
import { useTranslation } from 'react-i18next';
import { requestPhotoLibraryPermission } from '@truckmitr/src/utils/permissions/imagePermissions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
type UploadDocumentsRouteProp = RouteProp<NavigatorParams, typeof STACKS.UPLOAD_DOCUMENTS>;

export default function DriverUploadDocumentsByTransporter() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const route = useRoute<UploadDocumentsRouteProp>();
    const { shadow } = useShadow();
    const { driverProfileEdit } = useSelector((state: any) => { return state?.driver })

    const licenseExpiry = driverProfileEdit?.Expiry_date_of_License ? new Date(driverProfileEdit?.Expiry_date_of_License) : moment().subtract().toDate()

    const [licenseExpiryModel, setlicenseExpiryModel] = useState(false)

    const [loading, setloading] = useState(false)

    const [errors, setErrors] = useState<{
        aadharNumber?: string;
        aadharPhoto?: string;
        licenseNumber?: string;
    }>({});

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!driverProfileEdit?.Aadhar_Number) {
            newErrors.aadharNumber = t(`aadharNumberRequired`);
            valid = false;
        }
        if (!driverProfileEdit?.aadharImagePath?.path && !driverProfileEdit?.Aadhar_Photo) {
            newErrors.aadharPhoto = t(`AadharPhotoRequired`);
            valid = false;
        }
        if (!driverProfileEdit?.License_Number) {
            newErrors.licenseNumber = t(`licenseNumberRequired`);
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    // Functions to pick images using image crop picker
    const pickAadharImage = async () => {
        const hasPermission = await requestPhotoLibraryPermission();
        if (!hasPermission) {
            showToast(t('photoPermissionRequired'));
            return;
        }

        ImagePicker.openPicker({
            cropping: true,
            width: 512,
            height: 512,
            mediaType: 'photo'
        })
            .then(image => {
                console.log('Aadhar image:', image);
                dispatch(driverProfileEditAction({ ...driverProfileEdit, aadharImagePath: image }));
                setErrors((prevData) => ({
                    ...prevData,
                    aadharPhoto: undefined,
                }));
            })
            .catch(error => {
                console.log('Aadhar image picker error:', error);
                if (error.code !== 'E_PICKER_CANCELLED') {
                    showToast(t('failedToSelectImage'));
                }
            });
    };

    const pickDrivingLicenseImage = async () => {
        const hasPermission = await requestPhotoLibraryPermission();
        if (!hasPermission) {
            showToast(t('photoPermissionRequired'));
            return;
        }

        ImagePicker.openPicker({
            cropping: true,
            width: 512,
            height: 512,
            mediaType: 'photo'
        })
            .then(image => {
                console.log('Driving License image:', image);
                dispatch(driverProfileEditAction({ ...driverProfileEdit, drivingLicensePath: image }));
            })
            .catch(error => {
                console.log('Driving License picker error:', error);
            });
    };

    // Function to combine all data and hit API
    const submitDocuments = async () => {
        if (!validate()) return;
        setloading(true)
        const combinedData = {
            ...route?.params,
            // From this screen
            aadharNumber: driverProfileEdit?.Aadhar_Number,
            licenseNumber: driverProfileEdit?.License_Number,
            licenseExpiry: moment(licenseExpiry).format("DD-MM-YYYY"),
            aadharPhoto: driverProfileEdit?.aadharImagePath?.path ? driverProfileEdit?.aadharImagePath : {},
            drivingLicensePhoto: driverProfileEdit?.drivingLicensePath?.path ? driverProfileEdit?.drivingLicensePath : {},
        } as any

        console.log('Combined Data for API:', combinedData);

        // const FormData = require('form-data');
        let data = new FormData();

        data.append('name', combinedData?.fullName);
        data.append('email', combinedData?.email);
        data.append('mobile', combinedData?.mobile);
        // ✅ Optional profile photo
        if (combinedData?.profile?.path && combinedData?.profile?.mime && combinedData?.profile?.filename) {
            data.append('images', {
                uri: combinedData.profile.path,
                type: combinedData.profile.mime,
                name: combinedData.profile.filename
            });
        }
        data.append('father_name', combinedData?.fatherName);
        data.append('DOB', combinedData?.dateOfBirth);
        data.append('Sex', combinedData?.gender);
        data.append('Marital_Status', combinedData?.maritalStatus);
        data.append('Highest_Education', combinedData?.education);
        data.append('address', combinedData?.address);
        data.append('city', combinedData?.city);
        data.append('states', combinedData?.state);
        data.append('vehicle_type', combinedData?.vehicleType);
        data.append('Driving_Experience', combinedData?.drivingExperience);
        data.append('Preferred_Location', combinedData?.preferredLocation);
        data.append('Current_Monthly_Income', combinedData?.currentMonthlyIncome);
        data.append('Expected_Monthly_Income', combinedData?.expectedMonthlyIncome);
        data.append('Type_of_License', combinedData?.licenseType);
        data.append('Aadhar_Number', combinedData?.aadharNumber);
        if (!driverProfileEdit?.Aadhar_Photo) {
            data.append('Aadhar_Photo', {
                uri: combinedData.aadharPhoto.path,
                type: combinedData.aadharPhoto.mime,
                name: combinedData.aadharPhoto.filename
            });
        }
        data.append('License_Number', combinedData?.licenseNumber);
        data.append('expiry_date_of_license', combinedData?.licenseExpiry);
        data.append('state', combinedData?.state);
        // ✅ Optional Driving License photo
        if (combinedData?.drivingLicensePhoto?.path && combinedData?.drivingLicensePhoto?.mime && combinedData?.drivingLicensePhoto?.filename) {
            data.append('Driving_License', {
                uri: combinedData.drivingLicensePhoto.path,
                type: combinedData.drivingLicensePhoto.mime,
                name: combinedData.drivingLicensePhoto.filename
            });
        }
        data.append('Job_Placement', combinedData?.interestedInAbroad);
        data.append('Previous_Employer', combinedData?.referenceCheck);
        try {
            const response = await axiosInstance.post(END_POINTS.TRANSPORTER_UPDATE_DRIVERS_PROFILE(driverProfileEdit?.id), data);
            if (response?.data?.status) {
                const updateProfileMSG = response?.data?.message
                showToast(updateProfileMSG);
                navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.DRIVER_LIST })
            } else {
                showToast(response?.data?.message)
            }
        } catch (error) {
            console.log('Signup error:', error);
            showToast(JSON.stringify(error));
        } finally {
            setloading(false);
        }
    }
    const _goback = () => {
        navigation.goBack();
    };

    const formatBytes = (bytes: any) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${size} ${sizes[i]}`;
    };

    // Define minimum and maximum dates using Moment and convert them to Date objects.
    const minimumDate = new Date(); // current date
    const maximumDate = moment().add(150, "years").toDate(); // 150 years in the future

    const aadharImageUri = driverProfileEdit?.aadharImagePath?.path ? driverProfileEdit?.aadharImagePath?.path : null;
    const drivingLicenseUri = driverProfileEdit?.drivingLicensePath?.path ? driverProfileEdit?.drivingLicensePath?.path : null;

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
                    {t(`driverProfileEdit`)}
                </Text>
            </View>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={responsiveHeight(30)}>
                <Space height={responsiveFontSize(2)} />
                <View style={{ height: responsiveHeight(5.5), flexDirection: 'row', paddingHorizontal: responsiveWidth(2.5) }}>
                    <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.05), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '500', textAlign: 'center' }}>
                            {t('personalDetails')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.05), alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginHorizontal: responsiveWidth(3) }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '500', textAlign: 'center' }}>
                            {t('drivingDetails')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.blueOpacity(0.2), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), fontWeight: '600', textAlign: 'center' }}>
                            {t('uploadDocuments')}
                        </Text>
                    </View>
                </View>
                <Space height={responsiveFontSize(4)} />
                <View style={{ flex: 1, width: responsiveWidth(100), paddingHorizontal: responsiveWidth(5) }}>
                    {/* Aadhar Number */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`aadharNumber`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            editable={true}
                            placeholder={t('enterAadharNumber')}
                            value={driverProfileEdit?.Aadhar_Number || ''}
                            keyboardType='number-pad'
                            onChangeText={(text) => {
                                dispatch(driverProfileEditAction({ ...driverProfileEdit, Aadhar_Number: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    aadharNumber: undefined,
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
                            }}
                        />
                    </View>
                    {errors?.aadharNumber && (
                        <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.aadharNumber}</Text>
                    )}
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Upload Aadhar Photo */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`uploadAadharPhoto`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                    {driverProfileEdit?.Aadhar_Photo ?
                        <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(1), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                            <Image style={{ height: responsiveHeight(20), width: '100%', borderRadius: 10 }} source={{ uri: `${BASE_URL}public/${driverProfileEdit?.Aadhar_Photo}` }} />
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(driverProfileEditAction({ ...driverProfileEdit, Aadhar_Photo: null }));
                                }}
                                activeOpacity={0.7}
                                style={{
                                    height: responsiveFontSize(4),
                                    width: responsiveFontSize(4),
                                    backgroundColor: colors.white,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    top: responsiveFontSize(.5),
                                    right: responsiveFontSize(.5),
                                    borderColor: colors.blackOpacity(.1), borderWidth: 1,
                                    borderRadius: 100,
                                    ...shadow,
                                    shadowColor: isIOS() ? colors.blackOpacity(0.2) : colors.blackOpacity(0.4),
                                }}>
                                <Ionicons name={'close'} size={20} color={colors.black} />
                            </TouchableOpacity>
                        </View>
                        :
                        driverProfileEdit?.aadharImagePath?.path ?
                            <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ height: responsiveFontSize(6), width: responsiveFontSize(6), alignItems: 'center', justifyContent: 'center', borderColor: colors?.blackOpacity(.05), borderWidth: 1, alignSelf: 'flex-start', borderRadius: 10 }}>
                                        <Image style={{ height: responsiveFontSize(4), width: responsiveFontSize(4) }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png` }} />
                                    </View>
                                    <View style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{driverProfileEdit?.aadharImagePath?.filename}</Text>
                                        <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.5) }}>
                                            {formatBytes(driverProfileEdit?.aadharImagePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity onPress={() => {
                                        dispatch(driverProfileEditAction({ ...driverProfileEdit, aadharImagePath: {} }));
                                    }}>
                                        <MaterialCommunityIcons name={'delete'} size={20} color={colors.blackOpacity(1)} />
                                    </TouchableOpacity>
                                </View>
                                <Image style={{ height: responsiveHeight(15), width: '100%', marginTop: responsiveHeight(1), borderRadius: 10 }} source={{ uri: aadharImageUri }} />
                            </View>
                            :
                            <>
                                <View style={{ flexDirection: 'row', borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                                    <MaterialCommunityIcons name={'file'} size={24} color={colors.royalBlue} />
                                    <View style={{ marginStart: responsiveFontSize(1), flex: 1 }}>
                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('chooseFile')}</Text>
                                        <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                                            {`${t('upload')} .jpg ${t('or')} .jpeg ${t('or')} .png`}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={pickAadharImage}
                                            style={{
                                                flexDirection: 'row',
                                                borderColor: colors.royalBlue,
                                                borderWidth: 1,
                                                alignSelf: 'flex-start',
                                                padding: responsiveFontSize(0.7),
                                                paddingHorizontal: responsiveFontSize(4),
                                                borderRadius: 5,
                                                marginTop: responsiveFontSize(2),
                                            }}>
                                            <MaterialCommunityIcons name={'upload'} size={24} color={colors.royalBlue} />
                                            <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginStart: responsiveFontSize(1) }}>{t('upload')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {errors?.aadharPhoto && (
                                    <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.aadharPhoto}</Text>
                                )}
                            </>}
                    <Space height={responsiveFontSize(2.5)} />

                    {/* License Number */}
                    <>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`licenseNumber`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                        <TextInput
                            editable={true}
                            placeholder={t('enterLicenseNumber')}
                            value={driverProfileEdit?.License_Number || ''}
                            onChangeText={(text) => {
                                dispatch(driverProfileEditAction({ ...driverProfileEdit, License_Number: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    licenseNumber: undefined,
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
                            }}
                        />
                        {errors?.licenseNumber && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.licenseNumber}</Text>
                        )}
                    </>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Expiry Date of License */}

                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('expiryDateOfLicense')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: responsiveHeight(5.5), borderColor: colors.blackOpacity(0.2), borderWidth: 1, borderRadius: 10, marginTop: responsiveFontSize(0.5), paddingHorizontal: responsiveFontSize(2), }}>
                        <TextInput
                            value={moment(licenseExpiry).format("DD-MM-YYYY")}
                            editable={false}
                            placeholder='DD-MM-YYYY'
                            style={{
                                flex: 1,
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                            }}
                        />
                        <TouchableOpacity onPress={() => setlicenseExpiryModel(true)} hitSlop={hitSlop(10)}>
                            <Ionicons name={'calendar'} size={20} color={colors.black} />
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Upload Driving License */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`uploadDrivingLicense`)}</Text>
                    {driverProfileEdit?.Driving_License ?
                        <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(1), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                            <Image style={{ height: responsiveHeight(20), width: '100%', borderRadius: 10 }} source={{ uri: `${BASE_URL}public/${driverProfileEdit?.Driving_License}` }} />
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(driverProfileEditAction({ ...driverProfileEdit, Driving_License: null }));
                                }}
                                activeOpacity={0.7}
                                style={{
                                    height: responsiveFontSize(4),
                                    width: responsiveFontSize(4),
                                    backgroundColor: colors.white,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    top: responsiveFontSize(.5),
                                    right: responsiveFontSize(.5),
                                    borderColor: colors.blackOpacity(.1), borderWidth: 1,
                                    borderRadius: 100,
                                    ...shadow,
                                    shadowColor: isIOS() ? colors.blackOpacity(0.2) : colors.blackOpacity(0.4),
                                }}>
                                <Ionicons name={'close'} size={20} color={colors.black} />
                            </TouchableOpacity>
                        </View>
                        :
                        driverProfileEdit?.drivingLicensePath?.path ?
                            <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ height: responsiveFontSize(6), width: responsiveFontSize(6), alignItems: 'center', justifyContent: 'center', borderColor: colors?.blackOpacity(.05), borderWidth: 1, alignSelf: 'flex-start', borderRadius: 10 }}>
                                        <Image style={{ height: responsiveFontSize(4), width: responsiveFontSize(4) }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png` }} />
                                    </View>
                                    <View style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{driverProfileEdit?.drivingLicensePath?.filename}</Text>
                                        <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.5) }}>
                                            {formatBytes(driverProfileEdit?.drivingLicensePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity onPress={() => {
                                        dispatch(driverProfileEditAction({ ...driverProfileEdit, drivingLicensePath: {} }));
                                    }}>
                                        <MaterialCommunityIcons name={'delete'} size={20} color={colors.blackOpacity(1)} />
                                    </TouchableOpacity>
                                </View>
                                <Image style={{ height: responsiveHeight(15), width: '100%', marginTop: responsiveHeight(1), borderRadius: 10 }} source={{ uri: drivingLicenseUri }} />
                            </View>
                            : <View style={{ flexDirection: 'row', borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                                <MaterialCommunityIcons name={'file'} size={24} color={colors.royalBlue} />
                                <View style={{ marginStart: responsiveFontSize(1), flex: 1 }}>
                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500' }}>
                                        {t('chooseFile')}
                                    </Text>
                                    <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                                        {`${t('upload')} .jpg ${t('or')} .jpeg ${t('or')} .png`}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={pickDrivingLicenseImage}
                                        style={{
                                            flexDirection: 'row',
                                            borderColor: colors.royalBlue,
                                            borderWidth: 1,
                                            alignSelf: 'flex-start',
                                            padding: responsiveFontSize(0.7),
                                            paddingHorizontal: responsiveFontSize(4),
                                            borderRadius: 5,
                                            marginTop: responsiveFontSize(2),
                                        }}>
                                        <MaterialCommunityIcons name={'upload'} size={24} color={colors.royalBlue} />
                                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginStart: responsiveFontSize(1) }}>{t('upload')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>}
                    <Space height={responsiveFontSize(6)} />
                    <TouchableOpacity
                        onPress={submitDocuments}
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
                        {loading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`submit`)}</Text>
                        )}
                    </TouchableOpacity>
                    <Space height={responsiveFontSize(10)} />

                    {/* Model License Exipre */}
                    <Modal
                        animationType={'fade'}
                        transparent={true}
                        visible={licenseExpiryModel}
                        statusBarTranslucent
                        navigationBarTranslucent>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.7), }}>
                            <View style={{ backgroundColor: colors.white, alignItems: 'center', width: responsiveWidth(90), borderRadius: 10, overflow: 'hidden' }}>
                                <Space height={responsiveHeight(2)} />
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' }}>{t('expiryDateOfLicense')}</Text>
                                <Space height={responsiveHeight(.5)} />
                                <DatePicker
                                    mode='date'
                                    theme='light'
                                    date={licenseExpiry} // Sets the initial date to display in the picker
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    onDateChange={(date) => {
                                        dispatch(driverProfileEditAction({ ...driverProfileEdit, Expiry_date_of_License: date }));
                                        setErrors((prevData) => ({
                                            ...prevData,
                                            licenseExpiry: undefined
                                        }))
                                    }}
                                    modal={false}
                                />
                                <Space height={responsiveHeight(.5)} />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => setlicenseExpiryModel(false)} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.1), bottom: -1 }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`cancel`)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setTimeout(() => {
                                            setlicenseExpiryModel(false)
                                        }, 600);
                                    }} activeOpacity={.7} style={{ height: responsiveHeight(6.5), flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.azureBlue, bottom: -1 }}>
                                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`confirm`)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
}
