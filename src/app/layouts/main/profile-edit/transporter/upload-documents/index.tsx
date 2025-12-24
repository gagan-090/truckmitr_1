import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
import { useDispatch, useSelector } from 'react-redux';
import { userAction, userEditAction } from '@truckmitr/src/redux/actions/user.action';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { requestPhotoLibraryPermission } from '@truckmitr/src/utils/permissions/imagePermissions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function UploadDocumentsTransporter() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { shadow } = useShadow();
    const { userEdit } = useSelector((state: any) => { return state?.user })

    const [loading, setloading] = useState(false)

    const [errors, setErrors] = useState<{
        panNumber?: string;
        gstNumber?: string;
    }>({});

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!userEdit?.PAN_Number) {
            newErrors.panNumber = t(`panNumberRequired`);
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    // Functions to pick images using image crop picker
    const pickPanImage = async () => {
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
                console.log('Pan image:', image);
                dispatch(userEditAction({ ...userEdit, panImagePath: image }));
            })
            .catch(error => {
                console.log('Pan image picker error:', error);
                if (error.code !== 'E_PICKER_CANCELLED') {
                    showToast(t('failedToSelectImage'));
                }
            });
    };

    const pickGstCertificateImage = async () => {
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
                console.log('GST Certificate image:', image);
                dispatch(userEditAction({ ...userEdit, gstCertificatePath: image }));
            })
            .catch(error => {
                console.log('GST Certificate picker error:', error);
                if (error.code !== 'E_PICKER_CANCELLED') {
                    showToast(t('failedToSelectImage'));
                }
            });
    };

    // Function to combine all data and hit API
    const submitDocuments = async () => {
        if (!validate()) return;
        setloading(true)
        const combinedData = {
            profile: userEdit?.profilePath?.path ? userEdit?.profilePath : {},
            fullName: userEdit?.name,
            email: userEdit?.email,
            mobile: userEdit?.mobile,
            address: userEdit?.address,
            city: userEdit?.city,
            state: userEdit?.states,
            transportName: userEdit?.Transport_Name,
            yearOfEstablishment: userEdit?.Year_of_Establishment ? moment(userEdit?.Year_of_Establishment).format("YYYY") : null,
            fleetSize: userEdit?.Fleet_Size,
            operationalSegment: userEdit?.Operational_Segment,
            averageKm: userEdit?.Average_KM,
            panNumber: userEdit?.PAN_Number,
            panPhoto: userEdit?.panImagePath?.path ? userEdit?.panImagePath : {},
            gstNumber: userEdit?.GST_Number,
            gstCertificatePhoto: userEdit?.gstCertificatePath?.path ? userEdit?.gstCertificatePath : {},
            referralCode: userEdit?.Referral_Code
        } as any

        console.log('Combined Data for API:', combinedData);

        const FormData = require('form-data');
        let data = new FormData();
        data.append('name', combinedData?.fullName);
        data.append('email', combinedData?.email);
        data.append('mobile', combinedData?.mobile);
        // ✅ Optional profile photo
        if (combinedData?.profile?.path && combinedData?.profile?.mime && combinedData?.profile?.filename) {
            data.append('profile_photo', {
                uri: combinedData.profile.path,
                type: combinedData.profile.mime,
                name: combinedData.profile.filename
            });
        }
        data.append('address', combinedData?.address);
        data.append('city', combinedData?.city);
        data.append('state', combinedData?.state);
        data.append('transport_name', combinedData?.transportName);
        if (combinedData?.yearOfEstablishment) {
            data.append('year_of_establishment', combinedData?.yearOfEstablishment);
        }
        data.append('fleet_size', combinedData?.fleetSize);
        data.append('operational_segment', JSON.stringify(combinedData?.operationalSegment));
        // data.append('operational_segment', '');
        data.append('average_km', combinedData?.averageKm);
        data.append('pan_number', combinedData?.panNumber);
        if (combinedData?.panPhoto?.path && combinedData?.panPhoto?.mime && combinedData?.panPhoto?.filename) {
            data.append('pan_image', {
                uri: combinedData.panPhoto.path,
                type: combinedData.panPhoto.mime,
                name: combinedData.panPhoto.filename
            });
        }
        data.append('gst_number', combinedData?.gstNumber);
        // ✅ Optional Driving License photo
        if (combinedData?.gstCertificatePhoto?.path && combinedData?.gstCertificatePhoto?.mime && combinedData?.gstCertificatePhoto?.filename) {
            data.append('gst_certificate', {
                uri: combinedData.gstCertificatePhoto.path,
                type: combinedData.gstCertificatePhoto.mime,
                name: combinedData.gstCertificatePhoto.filename
            });
        }
        data.append('Referral_Code', combinedData?.referralCode);
        try {
            const response = await axiosInstance.post(END_POINTS.EDIT_PROFILE, data);
            if (response?.data?.status) {
                const updateProfileMSG = response?.data?.message
                const profile: any = await axiosInstance.get(END_POINTS?.GET_PROFILE);
                if (profile?.data?.status) {
                    dispatch(userAction(profile?.data))
                    navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.PROFILE })
                    showToast(updateProfileMSG);
                }
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

    const panImageUri = userEdit?.panImagePath?.path ? userEdit?.panImagePath?.path : null;
    const gstCertificateUri = userEdit?.gstCertificatePath?.path ? userEdit?.gstCertificatePath?.path : null;

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
                    {/* Pan Number */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`panNumber`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            editable={true}
                            placeholder={t('enterPanNumber')}
                            value={userEdit?.PAN_Number || ''}
                            keyboardType='default'
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, PAN_Number: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    panNumber: undefined,
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
                    {errors?.panNumber && (
                        <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.panNumber}</Text>
                    )}
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Upload Pan Photo */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('uploadPanDocument')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                    {userEdit?.PAN_Image ?
                        <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(1), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                            <Image style={{ height: responsiveHeight(20), width: '100%', borderRadius: 10 }} source={{ uri: `${BASE_URL}public/${userEdit?.PAN_Image}` }} />
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(userEditAction({ ...userEdit, PAN_Image: null }));
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
                        userEdit?.panImagePath?.path ?
                            <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ height: responsiveFontSize(6), width: responsiveFontSize(6), alignItems: 'center', justifyContent: 'center', borderColor: colors?.blackOpacity(.05), borderWidth: 1, alignSelf: 'flex-start', borderRadius: 10 }}>
                                        <Image style={{ height: responsiveFontSize(4), width: responsiveFontSize(4) }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png` }} />
                                    </View>
                                    <View style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{userEdit?.panImagePath?.filename}</Text>
                                        <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.5) }}>
                                            {formatBytes(userEdit?.panImagePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity onPress={() => {
                                        dispatch(userEditAction({ ...userEdit, panImagePath: {} }));
                                    }}>
                                        <MaterialCommunityIcons name={'delete'} size={20} color={colors.blackOpacity(1)} />
                                    </TouchableOpacity>
                                </View>
                                <Image style={{ height: responsiveHeight(15), width: '100%', marginTop: responsiveHeight(1), borderRadius: 10 }} source={{ uri: panImageUri }} />
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
                                            onPress={pickPanImage}
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
                            </>}
                    <Space height={responsiveFontSize(2.5)} />

                    {/* GST Number */}
                    <>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('gstNumber')}
                        </Text>
                        <TextInput
                            editable={true}
                            placeholder={t('enterGstNumber')}
                            value={userEdit?.GST_Number || ''}
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, GST_Number: text }));
                                setErrors((prevData) => ({
                                    ...prevData,
                                    gstNumber: undefined,
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
                        {errors?.gstNumber && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.gstNumber}</Text>
                        )}
                    </>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Upload GST Certificate */}
                    <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('uploadGstCertificate')}</Text>
                    {userEdit?.GST_Certificate ?
                        <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(1), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                            <Image style={{ height: responsiveHeight(20), width: '100%', borderRadius: 10 }} source={{ uri: `${BASE_URL}public/${userEdit?.GST_Certificate}` }} />
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(userEditAction({ ...userEdit, GST_Certificate: null }));
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
                        userEdit?.gstCertificatePath?.path ?
                            <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ height: responsiveFontSize(6), width: responsiveFontSize(6), alignItems: 'center', justifyContent: 'center', borderColor: colors?.blackOpacity(.05), borderWidth: 1, alignSelf: 'flex-start', borderRadius: 10 }}>
                                        <Image style={{ height: responsiveFontSize(4), width: responsiveFontSize(4) }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png` }} />
                                    </View>
                                    <View style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{userEdit?.gstCertificatePath?.filename}</Text>
                                        <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.5) }}>
                                            {formatBytes(userEdit?.gstCertificatePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity onPress={() => {
                                        dispatch(userEditAction({ ...userEdit, gstCertificatePath: {} }));
                                    }}>
                                        <MaterialCommunityIcons name={'delete'} size={20} color={colors.blackOpacity(1)} />
                                    </TouchableOpacity>
                                </View>
                                <Image style={{ height: responsiveHeight(15), width: '100%', marginTop: responsiveHeight(1), borderRadius: 10 }} source={{ uri: gstCertificateUri }} />
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
                                        onPress={pickGstCertificateImage}
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
                    <Space height={responsiveFontSize(2.5)} />
                    {/*  */}
                    <>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`referralCode`)}</Text>
                        <TextInput
                            editable={true}
                            placeholder={t('enterReferralCode')}
                            value={userEdit?.Referral_Code || ''}
                            onChangeText={(text) => {
                                dispatch(userEditAction({ ...userEdit, Referral_Code: text }));
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
                    </>
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
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('submit')}</Text>
                        )}
                    </TouchableOpacity>
                    <Space height={responsiveFontSize(10)} />
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
}
