import React, { useEffect, useState } from 'react';
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
    ActivityIndicator,
    TouchableWithoutFeedback,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet
} from 'react-native';
import {
    useColor,
    useResponsiveScale,
    useShadow,
} from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import { useTranslation } from 'react-i18next';
import { requestCameraPermission, requestPhotoLibraryPermission } from '@truckmitr/src/utils/permissions/imagePermissions';

interface DocumentUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    driver_id?: string;
}

export default function DriversDocumentUploadModal({
    driver_id,
    visible,
    onClose,
    onSuccess,
}: DocumentUploadModalProps) {
    const { t } = useTranslation();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } =
        useResponsiveScale();
    const { shadow } = useShadow();
    const [licenseExpiryModel, setlicenseExpiryModel] = useState(false);
    const [loading, setloading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [checkBoxSelect, setCheckBoxSelect] = useState(false);
    const [showError, setShowError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        Aadhar_Number: '',
        PAN_Number: '',
        address: '',
        License_Number: '',
        Expiry_date_of_License: moment().add(1, 'year').toDate(),
        Aadhar_Photo: null as string | null,
        Driving_License: null as string | null,
        PAN_Image: null as string | null,
        aadharImagePath: null as any,
        drivingLicensePath: null as any,
        panImagePath: null as any,
    });

    useEffect(() => {
        const _fetchUser = async () => {
            try {
                const profile: any = await axiosInstance.get(END_POINTS.GET_DRIVERS_PROFILE(driver_id));

                if (profile.data?.status && profile.data?.user) {
                    const userData = profile.data.user;
                    setFormData({
                        name: userData.name || '',
                        Aadhar_Number: userData.Aadhar_Number || '',
                        PAN_Number: userData.PAN_Number || '',
                        address: userData.address || '',
                        License_Number: userData.License_Number || '',
                        Expiry_date_of_License: userData.Expiry_date_of_License
                            ? new Date(userData.Expiry_date_of_License)
                            : moment().add(1, 'year').toDate(),
                        Aadhar_Photo: userData.Aadhar_Photo || null,
                        Driving_License: userData.Driving_License || null,
                        PAN_Image: userData.PAN_Image || null,
                        aadharImagePath: null,
                        drivingLicensePath: null,
                        panImagePath: null,
                    });

                    setIsDataLoaded(true);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setIsDataLoaded(true);
            }
        };

        if (driver_id && visible) {
            _fetchUser();
        }
    }, [driver_id, visible]);

    // Reset data when modal closes
    useEffect(() => {
        if (!visible) {
            setIsDataLoaded(false);
            setFormData({
                name: '',
                Aadhar_Number: '',
                PAN_Number: '',
                address: '',
                License_Number: '',
                Expiry_date_of_License: moment().add(1, 'year').toDate(),
                Aadhar_Photo: null,
                Driving_License: null,
                PAN_Image: null,
                aadharImagePath: null,
                drivingLicensePath: null,
                panImagePath: null,
            });
        }
    }, [visible]);

    const [imagePickerModel, setImagePickerModel] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState<'aadhar' | 'license' | 'pan' | null>(null);

    const _onpressCheckBox = () => {
            setCheckBoxSelect(!checkBoxSelect);
            if (showError) {
                setShowError(false);
            }
        };
    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            showToast(t('cameraPermissionDenied'));
            return;
        }
        ImagePicker.openCamera({
            cropping: true,
            width: 800,
            height: 600,
            mediaType: 'photo',
            compressImageQuality: 0.8,
            freeStyleCropEnabled: true,
            writeTempFile: true,
        })
            .then(image => {
                handleImageSelection(image);
                setImagePickerModel(false);
            })
            .catch(error => {
                if (error.code !== 'E_PICKER_CANCELLED') {
                    showToast(t('cameraError'));
                }
            });
    };

    const openGallery = async () => {
        const hasPermission = await requestPhotoLibraryPermission();
        if (!hasPermission) {
            showToast(t('photoPermissionRequired'));
            return;
        }

        ImagePicker.openPicker({
            cropping: true,
            width: 800,
            height: 600,
            mediaType: 'photo',
            compressImageQuality: 0.8,
            freeStyleCropEnabled: true,
        })
            .then(image => {
                handleImageSelection(image);
                setImagePickerModel(false);
            })
            .catch(error => {
                if (error.code !== 'E_PICKER_CANCELLED') {
                    showToast(t('galleryError'));
                }
            });
    };

    const handleImageSelection = (image: any) => {
        if (!selectedDocumentType) return;

        switch (selectedDocumentType) {
            case 'aadhar':
                setFormData(prev => ({
                    ...prev,
                    aadharImagePath: image,
                    Aadhar_Photo: null
                }));
                setErrors(prevData => ({
                    ...prevData,
                    aadharPhoto: undefined,
                }));
                break;
            case 'license':
                setFormData(prev => ({
                    ...prev,
                    drivingLicensePath: image,
                    Driving_License: null
                }));
                setErrors(prevData => ({
                    ...prevData,
                    drivingLicense: undefined,
                }));
                break;
            case 'pan':
                setFormData(prev => ({
                    ...prev,
                    panImagePath: image
                }));
                setErrors(prevData => ({
                    ...prevData,
                    PAN_Image: undefined,
                }));
                break;
        }
        setSelectedDocumentType(null);
    };

    const openImagePicker = (documentType: 'aadhar' | 'license' | 'pan') => {
        setSelectedDocumentType(documentType);
        setImagePickerModel(true);
    };

    const licenseExpiry = formData?.Expiry_date_of_License
        ? new Date(formData?.Expiry_date_of_License)
        : moment().add(1, 'year').toDate();

    const [errors, setErrors] = useState<{
        name?: string;
        aadharNumber?: string;
        PAN_Number?: string;
        address?: string;
        aadharPhoto?: string;
        licenseNumber?: string;
        PAN_Image?: string;
        drivingLicense?: string;
    }>({});

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};

        // Check if at least one document is provided
        const hasAadharPhoto = (formData?.aadharImagePath?.path) || (formData?.Aadhar_Photo && typeof formData.Aadhar_Photo === 'string');
        const hasDrivingLicense = (formData?.drivingLicensePath?.path) || (formData?.Driving_License && typeof formData.Driving_License === 'string');
        const hasPanImage = (formData?.panImagePath?.path) || (formData?.PAN_Image && typeof formData.PAN_Image === 'string');

        if (!hasAadharPhoto && !hasDrivingLicense && !hasPanImage) {
            newErrors.aadharPhoto = t(`atLeastOneDocumentRequired`);
            valid = false;
        }

        // Only validate Aadhar fields if Aadhar photo is being uploaded
        if (!hasAadharPhoto) {
            newErrors.aadharPhoto = t(`AadharPhotoRequired`);
            valid = false;
        }

        if (!formData?.Aadhar_Number) {
            newErrors.aadharNumber = t(`aadharNumberRequired`);
            valid = false;
        }

        // Driving License validation - both license number and license image are required
        if (!formData?.License_Number) {
            newErrors.licenseNumber = t(`licenseNumberRequired`);
            valid = false;
        }

        if (!hasDrivingLicense) {
            newErrors.drivingLicense = t(`drivingLicenseRequired`);
            valid = false;
        }

        // PAN validation - both PAN number and PAN image are required
        if (!formData?.PAN_Number) {
            newErrors.PAN_Number = t(`panNumberRequired`);
            valid = false;
        }

        if (!hasPanImage) {
            newErrors.PAN_Image = t(`panImageRequired`);
            valid = false;
        }

        if (!formData?.name) {
            newErrors.name = t(`fullNameRequired`);
            valid = false;
        }

        if (!formData?.address) {
            newErrors.address = t(`permanentAddressRequired`);
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // Functions to pick images using image crop picker
    const pickAadharImage = () => {
        openImagePicker('aadhar');
    };

    const pickDrivingLicenseImage = () => {
        openImagePicker('license');
    };

    const pickPanImage = () => {
        openImagePicker('pan');
    };

    // Function to upload documents using the new API
    const submitDocuments = async () => {
        if (!validate()) return;
        if (!checkBoxSelect) {
            setShowError(true);
            return;
        }
        setloading(true);

        // Check if at least one document is provided
        const hasAadharPhoto = formData?.aadharImagePath?.path || formData?.Aadhar_Photo;
        const hasDrivingLicense = formData?.drivingLicensePath?.path || formData?.Driving_License;

        if (!hasAadharPhoto && !hasDrivingLicense) {
            showToast(t('atLeastOneDocumentRequired'));
            setloading(false);
            return;
        }

        let data = new FormData();

        if (driver_id) {
            data.append('driver_id', driver_id);
        }

        // Add Aadhar photo if available
        if (formData?.aadharImagePath?.path) {
            data.append('Aadhar_Photo', {
                uri: formData.aadharImagePath.path,
                type: formData.aadharImagePath.mime,
                name: formData.aadharImagePath.filename || 'aadhar.jpg',
            });
        } else if (formData?.Aadhar_Photo && typeof formData.Aadhar_Photo === 'string') {
            // If using existing Aadhar photo, send the filename
            data.append('existing_Aadhar_Photo', formData.Aadhar_Photo);
        }

        // Add Driving License photo if available
        if (formData?.drivingLicensePath?.path) {
            data.append('Driving_License', {
                uri: formData.drivingLicensePath.path,
                type: formData.drivingLicensePath.mime,
                name: formData.drivingLicensePath.filename || 'license.jpg',
            });
        }

        // Add PAN_Image if available
        if (formData?.panImagePath?.path) {
            data.append('PAN_Image', {
                uri: formData.panImagePath.path,
                type: formData.panImagePath.mime || 'image/jpeg',
                name: formData.panImagePath.filename || 'pan.jpg',
            });
        }

        // Add other form data
        data.append('Aadhar_Number', formData?.Aadhar_Number || '');
        data.append('License_Number', formData?.License_Number || '');
        data.append('Expiry_date_of_License', moment(formData?.Expiry_date_of_License).format('YYYY-MM-DD'));
        data.append('name', formData?.name || '');
        data.append('PAN_Number', formData?.PAN_Number || '');
        data.append('address', formData?.address || '');

        try {
            const response = await axiosInstance.post(
                END_POINTS.DRIVER_UPLOAD_DOCUMENTS_BY_TRANSPORTER(driver_id),
                data
            );

            if (response?.data?.success) {
                const successMessage = response?.data?.message || t('documentsUploadedSuccessfully');
                showToast(successMessage);

                // Call success callback to refresh verification status
                onSuccess?.();

                // Close modal after successful upload
                onClose();
            } else {
                // Handle validation errors
                if (response?.data?.errors) {
                    const errorMessages = Object.values(response.data.errors).flat();
                    showToast(errorMessages.join(', '));
                } else {
                    showToast(response?.data?.message || t('documentUploadFailed'));
                }
            }
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                showToast(errorMessages.join(', '));
            } else if (error.response?.data?.message) {
                showToast(error.response.data.message);
            } else if (error.message) {
                showToast(error.message);
            } else {
                showToast(t('documentUploadFailed'));
            }
        } finally {
            setloading(false);
            setCheckBoxSelect(false)
        }
    };

    const formatBytes = (bytes: any) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${size} ${sizes[i]}`;
    };

    // Define minimum and maximum dates using Moment and convert them to Date objects.
    const minimumDate = new Date(); // current date
    const maximumDate = moment().add(150, 'years').toDate(); // 150 years in the future

    const aadharImageUri = formData?.aadharImagePath?.path
        ? formData?.aadharImagePath?.path
        : formData?.Aadhar_Photo
            ? `${BASE_URL}public/${formData?.Aadhar_Photo}`
            : null;

    const drivingLicenseUri = formData?.drivingLicensePath?.path
        ? formData?.drivingLicensePath?.path
        : formData?.Driving_License
            ? `${BASE_URL}public/${formData?.Driving_License}`
            : null;

    const panImageUri = formData?.panImagePath?.path
        ? formData?.panImagePath?.path
        : formData?.PAN_Image && typeof formData.PAN_Image === 'string'
            ? `${BASE_URL}public/${formData?.PAN_Image}`
            : null;

    // Show loading indicator while data is being fetched
    if (visible && !isDataLoaded) {
        return (
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={onClose}
            >
                <View style={{ flex: 1, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.royalBlue} />
                    <Text style={{ marginTop: 20, fontSize: responsiveFontSize(1.8), color: colors.black }}>
                        {t('loadingUserData')}
                    </Text>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View
                style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center' }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        alignItems: 'center',
                        padding: responsiveWidth(3),
                    }}
                >
                    <TouchableOpacity
                        hitSlop={hitSlop(10)}
                        onPress={onClose}
                        style={{
                            height: responsiveFontSize(4),
                            width: responsiveFontSize(4),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.white,
                            borderRadius: 100,
                            zIndex: 100,
                        }}
                    >
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
                        }}
                    >
                        {t(`documentUpload`)}
                    </Text>
                </View>
                <ScrollView
                    contentContainerStyle={{
                        backgroundColor: colors.white,
                        alignItems: 'center',
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Space height={responsiveFontSize(3)} />

                    {/* Document Requirements Info */}
                    <View style={{ paddingHorizontal: responsiveWidth(5), marginBottom: responsiveFontSize(2) }}>
                        <Text
                            style={{
                                fontSize: responsiveFontSize(1.6),
                                color: colors.blackOpacity(0.7),
                                textAlign: 'center',
                                lineHeight: responsiveFontSize(2.2),
                            }}
                        >
                            {t('uploadAtLeastOneDocument')}
                        </Text>
                        <Text
                            style={{
                                fontSize: responsiveFontSize(1.4),
                                color: colors.blackOpacity(0.5),
                                textAlign: 'center',
                                marginTop: responsiveFontSize(0.5),
                            }}
                        >
                            {t('supportedFormats')}: JPG, JPEG, PNG, PDF (Max 2MB each)
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            width: responsiveWidth(100),
                            paddingHorizontal: responsiveWidth(5),
                        }}
                    >
                        {/* Full Name */}
                        <View>
                            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('fullName')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                            </Text>
                            <TextInput
                                value={formData?.name || ''}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, name: text }));
                                    setErrors(prevData => ({
                                        ...prevData,
                                        name: undefined,
                                    }));
                                }}
                                placeholderTextColor={colors.blackOpacity(0.5)}
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
                            {errors?.name && (
                                <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.name}</Text>
                            )}
                        </View>
                        <Space height={responsiveFontSize(2.5)} />
                        {/* License Number */}
                        <>
                            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}> {t(`drivingLicenseNumber`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                            </Text>
                            <TextInput
                                editable={true}
                                placeholderTextColor={colors.blackOpacity(0.5)}
                                placeholder={t('enterLicenseNumber')}
                                value={formData?.License_Number || ''}
                                onChangeText={text => {
                                    setFormData(prev => ({ ...prev, License_Number: text }));
                                    setErrors(prevData => ({
                                        ...prevData,
                                        licenseNumber: undefined,
                                    }));
                                }}
                                style={{
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '500',
                                    height: responsiveHeight(5.8),
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                    paddingHorizontal: responsiveFontSize(2),
                                }}
                            />
                            {errors?.licenseNumber && (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontSize: responsiveFontSize(1.6),
                                        marginTop: responsiveFontSize(0.5),
                                    }}
                                >
                                    {errors?.licenseNumber}
                                </Text>
                            )}
                        </>
                        <Space height={responsiveFontSize(2.5)} />

                        {/*Aadhar Number */}
                        <View>
                            <Text
                                style={{
                                    color: colors.blackOpacity(0.9),
                                    fontSize: responsiveFontSize(1.7),
                                    fontWeight: '600',
                                }}
                            >
                                {t(`aadharNumber`)}{' '}
                                <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                            </Text>
                            <TextInput
                                editable={true}
                                placeholderTextColor={colors.blackOpacity(0.5)}
                                placeholder={t('enterAadharNumber')}
                                value={formData?.Aadhar_Number || ''}
                                keyboardType="number-pad"
                                onChangeText={text => {
                                    setFormData(prev => ({ ...prev, Aadhar_Number: text }));
                                    setErrors(prevData => ({
                                        ...prevData,
                                        aadharNumber: undefined,
                                    }));
                                }}
                                style={{
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '500',
                                    height: responsiveHeight(5.8),
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                    paddingHorizontal: responsiveFontSize(2),
                                }}
                            />
                            {errors?.aadharNumber && (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontSize: responsiveFontSize(1.6),
                                        marginTop: responsiveFontSize(0.5),
                                    }}
                                >
                                    {errors?.aadharNumber}
                                </Text>
                            )}
                        </View>
                        <Space height={responsiveFontSize(2.5)} />

                        {/* Pan Number */}
                        <View>
                            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`panNumber`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                            <TextInput
                                editable={true}
                                placeholderTextColor={colors.blackOpacity(0.5)}
                                placeholder={t('enterPanNumber')}
                                value={formData?.PAN_Number || ''}
                                keyboardType='default'
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, PAN_Number: text }));
                                    setErrors((prevData) => ({
                                        ...prevData,
                                        PAN_Number: undefined,
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
                            {errors?.PAN_Number && (
                                <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.PAN_Number}</Text>
                            )}
                        </View>
                        <Space height={responsiveFontSize(2.5)} />

                        {/* Address */}
                        <View>
                            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('address')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
                            <TextInput
                                value={formData?.address || ''}
                                multiline
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, address: text }));
                                    setErrors((prevData) => ({
                                        ...prevData,
                                        address: undefined,
                                    }));
                                }}
                                placeholderTextColor={colors.blackOpacity(0.5)}
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

                        {/* Document Upload Section */}
                        <Text
                            style={{
                                color: colors.blackOpacity(0.9),
                                fontSize: responsiveFontSize(1.8),
                                fontWeight: '600',
                                marginTop: responsiveFontSize(1),
                            }}
                        >
                            {t('documentUploadSection')}
                        </Text>

                        {/* Upload Aadhar Photo */}
                        <Text
                            style={{
                                color: colors.blackOpacity(0.9),
                                fontSize: responsiveFontSize(1.7),
                                fontWeight: '600',
                                marginTop: responsiveFontSize(2),
                            }}
                        >
                            {t(`uploadAadharPhoto`)}{' '}
                            <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        {formData?.Aadhar_Photo ? (
                            <View
                                style={{
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(1),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <Image
                                    style={{
                                        height: responsiveHeight(20),
                                        width: '100%',
                                        borderRadius: 10,
                                    }}
                                    source={{ uri: aadharImageUri }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, Aadhar_Photo: null }));
                                    }}
                                    activeOpacity={0.7}
                                    style={{
                                        height: responsiveFontSize(4),
                                        width: responsiveFontSize(4),
                                        backgroundColor: colors.white,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        top: responsiveFontSize(0.5),
                                        right: responsiveFontSize(0.5),
                                        borderColor: colors.blackOpacity(0.1),
                                        borderWidth: 1,
                                        borderRadius: 100,
                                        ...shadow,
                                        shadowColor: isIOS()
                                            ? colors.blackOpacity(0.2)
                                            : colors.blackOpacity(0.4),
                                    }}
                                >
                                    <Ionicons name={'close'} size={20} color={colors.black} />
                                </TouchableOpacity>
                            </View>
                        ) : formData?.aadharImagePath?.path ? (
                            <View
                                style={{
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(2),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            height: responsiveFontSize(6),
                                            width: responsiveFontSize(6),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderColor: colors?.blackOpacity(0.05),
                                            borderWidth: 1,
                                            alignSelf: 'flex-start',
                                            borderRadius: 10,
                                        }}
                                    >
                                        <Image
                                            style={{
                                                height: responsiveFontSize(4),
                                                width: responsiveFontSize(4),
                                            }}
                                            source={{
                                                uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png`,
                                            }}
                                        />
                                    </View>
                                    <View
                                        style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.black,
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '500',
                                            }}
                                        >
                                            {formData?.aadharImagePath?.filename}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.blackOpacity(0.4),
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '400',
                                                marginTop: responsiveFontSize(0.5),
                                            }}
                                        >
                                            {formatBytes(formData?.aadharImagePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFormData(prev => ({ ...prev, aadharImagePath: null }));
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={'delete'}
                                            size={20}
                                            color={colors.blackOpacity(1)}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Image
                                    style={{
                                        height: responsiveHeight(15),
                                        width: '100%',
                                        marginTop: responsiveHeight(1),
                                        borderRadius: 10,
                                    }}
                                    source={{ uri: aadharImageUri }}
                                />
                            </View>
                        ) : (
                            <>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        borderColor: colors.blackOpacity(0.2),
                                        borderWidth: 1,
                                        padding: responsiveFontSize(2),
                                        borderRadius: 10,
                                        marginTop: responsiveFontSize(0.5),
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={'file'}
                                        size={24}
                                        color={colors.royalBlue}
                                    />
                                    <View style={{ marginStart: responsiveFontSize(1), flex: 1 }}>
                                        <Text
                                            style={{
                                                color: colors.royalBlue,
                                                fontSize: responsiveFontSize(2),
                                                fontWeight: '500',
                                            }}
                                        >
                                            {t('chooseFile')}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.blackOpacity(0.4),
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '400',
                                                marginTop: responsiveFontSize(1),
                                            }}
                                        >
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
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name={'upload'}
                                                size={24}
                                                color={colors.royalBlue}
                                            />
                                            <Text
                                                style={{
                                                    color: colors.royalBlue,
                                                    fontSize: responsiveFontSize(1.8),
                                                    fontWeight: '500',
                                                    marginStart: responsiveFontSize(1),
                                                }}
                                            >
                                                {t('upload')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {errors?.aadharPhoto && (
                                    <Text
                                        style={{
                                            color: 'red',
                                            fontSize: responsiveFontSize(1.6),
                                            marginTop: responsiveFontSize(0.5),
                                        }}
                                    >
                                        {errors?.aadharPhoto}
                                    </Text>
                                )}
                            </>
                        )}
                        <Space height={responsiveFontSize(2.5)} />

                        {/* Expiry Date of License */}
                        <Text
                            style={{
                                color: colors.blackOpacity(0.9),
                                fontSize: responsiveFontSize(1.7),
                                fontWeight: '600',
                            }}
                        >
                            {t('expiryDateOfLicense')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        >
                            <TextInput
                                value={moment(licenseExpiry).format('DD-MM-YYYY')}
                                editable={false}
                                placeholder="DD-MM-YYYY"
                                style={{
                                    flex: 1,
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '500',
                                    height: responsiveHeight(5.8),
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => setlicenseExpiryModel(true)}
                                hitSlop={hitSlop(10)}
                            >
                                <Ionicons name={'calendar'} size={20} color={colors.black} />
                            </TouchableOpacity>
                        </View>
                        <Space height={responsiveFontSize(2.5)} />

                        {/* Upload Driving License */}
                        <Text
                            style={{
                                color: colors.blackOpacity(0.9),
                                fontSize: responsiveFontSize(1.7),
                                fontWeight: '600',
                            }}
                        >
                            {t(`uploadDrivingLicense`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        {formData?.Driving_License ? (
                            <View
                                style={{
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(1),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <Image
                                    style={{
                                        height: responsiveHeight(20),
                                        width: '100%',
                                        borderRadius: 10,
                                    }}
                                    source={{ uri: drivingLicenseUri }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, Driving_License: null }));
                                    }}
                                    activeOpacity={0.7}
                                    style={{
                                        height: responsiveFontSize(4),
                                        width: responsiveFontSize(4),
                                        backgroundColor: colors.white,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        top: responsiveFontSize(0.5),
                                        right: responsiveFontSize(0.5),
                                        borderColor: colors.blackOpacity(0.1),
                                        borderWidth: 1,
                                        borderRadius: 100,
                                        ...shadow,
                                        shadowColor: isIOS()
                                            ? colors.blackOpacity(0.2)
                                            : colors.blackOpacity(0.4),
                                    }}
                                >
                                    <Ionicons name={'close'} size={20} color={colors.black} />
                                </TouchableOpacity>
                            </View>
                        ) : formData?.drivingLicensePath?.path ? (
                            <View
                                style={{
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(2),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            height: responsiveFontSize(6),
                                            width: responsiveFontSize(6),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderColor: colors?.blackOpacity(0.05),
                                            borderWidth: 1,
                                            alignSelf: 'flex-start',
                                            borderRadius: 10,
                                        }}
                                    >
                                        <Image
                                            style={{
                                                height: responsiveFontSize(4),
                                                width: responsiveFontSize(4),
                                            }}
                                            source={{
                                                uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png`,
                                            }}
                                        />
                                    </View>
                                    <View
                                        style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.black,
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '500',
                                            }}
                                        >
                                            {formData?.drivingLicensePath?.filename}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.blackOpacity(0.4),
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '400',
                                                marginTop: responsiveFontSize(0.5),
                                            }}
                                        >
                                            {formatBytes(formData?.drivingLicensePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFormData(prev => ({ ...prev, drivingLicensePath: null }));
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={'delete'}
                                            size={20}
                                            color={colors.blackOpacity(1)}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Image
                                    style={{
                                        height: responsiveHeight(15),
                                        width: '100%',
                                        marginTop: responsiveHeight(1),
                                        borderRadius: 10,
                                    }}
                                    source={{ uri: drivingLicenseUri }}
                                />
                            </View>
                        ) : (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(2),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={'file'}
                                    size={24}
                                    color={colors.royalBlue}
                                />
                                <View style={{ marginStart: responsiveFontSize(1), flex: 1 }}>
                                    <Text
                                        style={{
                                            color: colors.royalBlue,
                                            fontSize: responsiveFontSize(2),
                                            fontWeight: '500',
                                        }}
                                    >
                                        {t('chooseFile')}
                                    </Text>
                                    <Text
                                        style={{
                                            color: colors.blackOpacity(0.4),
                                            fontSize: responsiveFontSize(1.8),
                                            fontWeight: '400',
                                            marginTop: responsiveFontSize(1),
                                        }}
                                    >
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
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={'upload'}
                                            size={24}
                                            color={colors.royalBlue}
                                        />
                                        <Text
                                            style={{
                                                color: colors.royalBlue,
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '500',
                                                marginStart: responsiveFontSize(1),
                                            }}
                                        >
                                            {t('upload')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        {errors?.drivingLicense && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.drivingLicense}</Text>
                        )}
                        <Space height={responsiveFontSize(2.5)} />
                        {/* Upload pan card */}
                        <Text
                            style={{
                                color: colors.blackOpacity(0.9),
                                fontSize: responsiveFontSize(1.7),
                                fontWeight: '600',
                            }}
                        >
                            {t(`uploadPanCard`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        {formData?.PAN_Image && typeof formData.PAN_Image === 'string' ? (
                            <View
                                style={{
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(1),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <Image
                                    style={{
                                        height: responsiveHeight(20),
                                        width: '100%',
                                        borderRadius: 10,
                                    }}
                                    source={{ uri: panImageUri }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, PAN_Image: null }));
                                    }}
                                    activeOpacity={0.7}
                                    style={{
                                        height: responsiveFontSize(4),
                                        width: responsiveFontSize(4),
                                        backgroundColor: colors.white,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        top: responsiveFontSize(0.5),
                                        right: responsiveFontSize(0.5),
                                        borderColor: colors.blackOpacity(0.1),
                                        borderWidth: 1,
                                        borderRadius: 100,
                                        ...shadow,
                                        shadowColor: isIOS()
                                            ? colors.blackOpacity(0.2)
                                            : colors.blackOpacity(0.4),
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={'delete'}
                                        size={20}
                                        color={colors.blackOpacity(1)}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : formData?.panImagePath?.path ? (
                            <View
                                style={{
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(2),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            height: responsiveFontSize(6),
                                            width: responsiveFontSize(6),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderColor: colors?.blackOpacity(0.05),
                                            borderWidth: 1,
                                            alignSelf: 'flex-start',
                                            borderRadius: 10,
                                        }}
                                    >
                                        <Image
                                            style={{
                                                height: responsiveFontSize(4),
                                                width: responsiveFontSize(4),
                                            }}
                                            source={{
                                                uri: `https://cdn-icons-png.flaticon.com/512/9261/9261484.png`,
                                            }}
                                        />
                                    </View>
                                    <View
                                        style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.black,
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '500',
                                            }}
                                        >
                                            {formData?.panImagePath?.filename || 'pan_image.jpg'}
                                        </Text>
                                        <Text
                                            style={{
                                                color: colors.blackOpacity(0.4),
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '400',
                                                marginTop: responsiveFontSize(0.5),
                                            }}
                                        >
                                            {formatBytes(formData?.panImagePath?.size)}
                                        </Text>
                                    </View>
                                    <Space width={responsiveFontSize(2)} />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFormData(prev => ({ ...prev, panImagePath: null }));
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={'delete'}
                                            size={20}
                                            color={colors.blackOpacity(1)}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Image
                                    style={{
                                        height: responsiveHeight(15),
                                        width: '100%',
                                        marginTop: responsiveHeight(1),
                                        borderRadius: 10,
                                    }}
                                    source={{ uri: panImageUri }}
                                />
                            </View>
                        ) : (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    borderColor: colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    padding: responsiveFontSize(2),
                                    borderRadius: 10,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={'file'}
                                    size={24}
                                    color={colors.royalBlue}
                                />
                                <View style={{ marginStart: responsiveFontSize(1), flex: 1 }}>
                                    <Text
                                        style={{
                                            color: colors.royalBlue,
                                            fontSize: responsiveFontSize(2),
                                            fontWeight: '500',
                                        }}
                                    >
                                        {t('chooseFile')}
                                    </Text>
                                    <Text
                                        style={{
                                            color: colors.blackOpacity(0.4),
                                            fontSize: responsiveFontSize(1.8),
                                            fontWeight: '400',
                                            marginTop: responsiveFontSize(1),
                                        }}
                                    >
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
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={'upload'}
                                            size={24}
                                            color={colors.royalBlue}
                                        />
                                        <Text
                                            style={{
                                                color: colors.royalBlue,
                                                fontSize: responsiveFontSize(1.8),
                                                fontWeight: '500',
                                                marginStart: responsiveFontSize(1),
                                            }}
                                        >
                                            {t('upload')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        {errors?.PAN_Image && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.PAN_Image}</Text>
                        )}
                        <Space height={responsiveFontSize(6)} />
            <View style={{paddingBottom: responsiveHeight(2)}}>
                <View style={styles.consentContent}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={_onpressCheckBox}
                        style={styles.checkboxContainer}
                    >
                        <MaterialCommunityIcons
                            name={checkBoxSelect ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={checkBoxSelect ? colors.royalBlue : 'gray'}
                        />
                    </TouchableOpacity>
                    <Text style={[
                        styles.consentText,
                        {
                            color: colors.blackOpacity(0.7),
                            fontSize: responsiveFontSize(1.8)
                        }
                    ]}>
                        {t(`consentText`)}
                    </Text>
                </View>
                {showError && (
                    <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                        <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(5) }}>
                            {t('docUploadConsentError')}
                        </Text>
                    </View>
                )}
            </View>
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
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <Text
                                    style={{
                                        color: colors.white,
                                        fontSize: responsiveFontSize(2),
                                        fontWeight: '500',
                                    }}
                                >
                                    {t(`submit`)}
                                </Text>
                            )}
                        </TouchableOpacity>
                        <Space height={responsiveFontSize(10)} />
                    </View>
                </ScrollView>

                {/* Image Picker Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={imagePickerModel}
                    statusBarTranslucent
                    navigationBarTranslucent
                    onRequestClose={() => setImagePickerModel(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setImagePickerModel(false)}>
                        <View style={{
                            flex: 1,
                            backgroundColor: colors.blackOpacity(0.5),
                            justifyContent: 'flex-end'
                        }}>
                            <TouchableWithoutFeedback>
                                <View style={{
                                    width: responsiveWidth(100),
                                    backgroundColor: colors.white,
                                    alignItems: 'center',
                                    padding: responsiveWidth(2.5),
                                    borderTopLeftRadius: 10,
                                    borderTopRightRadius: 10
                                }}>
                                    <Text style={{
                                        color: colors.black,
                                        fontSize: responsiveFontSize(2.4),
                                        fontWeight: '500'
                                    }}>
                                        {t('chooseAction')}
                                    </Text>

                                    <Space height={responsiveFontSize(1.2)} />

                                    {/* Camera Option */}
                                    <TouchableOpacity
                                        onPress={openCamera}
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: responsiveFontSize(1.5)
                                        }}
                                    >
                                        <Image
                                            style={{
                                                height: responsiveFontSize(3),
                                                width: responsiveFontSize(3)
                                            }}
                                            source={{
                                                uri: 'https://cdn-icons-png.flaticon.com/512/16076/16076003.png'
                                            }}
                                        />
                                        <Text style={{
                                            color: colors.black,
                                            fontSize: responsiveFontSize(2),
                                            fontWeight: '500',
                                            marginLeft: responsiveFontSize(2.5)
                                        }}>
                                            {t('camera')}
                                        </Text>
                                    </TouchableOpacity>

                                    <Space style={{
                                        height: responsiveFontSize(.1),
                                        width: '100%',
                                        backgroundColor: colors.blackOpacity(.05)
                                    }} />

                                    {/* Gallery Option */}
                                    <TouchableOpacity
                                        onPress={openGallery}
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: responsiveFontSize(1.5)
                                        }}
                                    >
                                        <Image
                                            style={{
                                                height: responsiveFontSize(3.2),
                                                width: responsiveFontSize(3.2)
                                            }}
                                            source={{
                                                uri: 'https://cdn-icons-png.flaticon.com/512/9261/9261484.png'
                                            }}
                                        />
                                        <Text style={{
                                            color: colors.black,
                                            fontSize: responsiveFontSize(2),
                                            fontWeight: '500',
                                            marginLeft: responsiveFontSize(2.5)
                                        }}>
                                            {t('gallery')}
                                        </Text>
                                    </TouchableOpacity>

                                    <Space height={safeAreaInsets.bottom + responsiveHeight(1)} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* Model License Expire */}
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={licenseExpiryModel}
                    statusBarTranslucent
                    navigationBarTranslucent
                >
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.blackOpacity(0.7),
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: colors.white,
                                alignItems: 'center',
                                width: responsiveWidth(90),
                                borderRadius: 10,
                                overflow: 'hidden',
                            }}
                        >
                            <Space height={responsiveHeight(2)} />
                            <Text
                                style={{
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2.4),
                                    fontWeight: '500',
                                }}
                            >
                                {t('expiryDateOfLicense')}
                            </Text>
                            <Space height={responsiveHeight(0.5)} />
                            <DatePicker
                                mode="date"
                                theme='light'
                                date={licenseExpiry}
                                minimumDate={minimumDate}
                                maximumDate={maximumDate}
                                onDateChange={date => {
                                    setFormData(prev => ({
                                        ...prev,
                                        Expiry_date_of_License: date,
                                    }));
                                    setErrors(prevData => ({
                                        ...prevData,
                                        licenseExpiry: undefined,
                                    }));
                                }}
                                modal={false}
                            />
                            <Space height={responsiveHeight(0.5)} />
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => setlicenseExpiryModel(false)}
                                    activeOpacity={0.7}
                                    style={{
                                        height: responsiveHeight(6.5),
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.blackOpacity(0.1),
                                        bottom: -1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.black,
                                            fontSize: responsiveFontSize(1.8),
                                            fontWeight: '500',
                                        }}
                                    >
                                        {t(`cancel`)}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setTimeout(() => {
                                            setlicenseExpiryModel(false);
                                        }, 600);
                                    }}
                                    activeOpacity={0.7}
                                    style={{
                                        height: responsiveHeight(6.5),
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.azureBlue,
                                        bottom: -1,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.white,
                                            fontSize: responsiveFontSize(1.8),
                                            fontWeight: '500',
                                        }}
                                    >
                                        {t(`confirm`)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    consentContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        marginRight: 8,
        padding: 4,
    },
    consentText: {
        flex: 1,
        flexShrink: 1,
        flexWrap: 'wrap',
    }
});