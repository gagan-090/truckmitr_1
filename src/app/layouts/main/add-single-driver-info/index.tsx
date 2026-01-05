import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import ImagePicker from 'react-native-image-crop-picker';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import { requestCameraPermission, requestPhotoLibraryPermission } from '@truckmitr/src/utils/permissions/imagePermissions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

interface DriverFormData {
    fullName: string;
    mobileNumber: string;
    address: string;
    fatherName: string;
    dateOfBirth: string;
    govtIdImage: any;
    drivingLicenseImage: any;
}

export default function AddSingleDriverInfo() {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigatorProp>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const safeAreaInsets = useSafeAreaInsets();
    useStatusBarStyle('dark-content');

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [imagePickerModal, setImagePickerModal] = useState(false);
    const [currentImageType, setCurrentImageType] = useState<'govtIdImage' | 'drivingLicenseImage'>('govtIdImage');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [formData, setFormData] = useState<DriverFormData>({
        fullName: '',
        mobileNumber: '',
        address: '',
        fatherName: '',
        dateOfBirth: '',
        govtIdImage: null,
        drivingLicenseImage: null,
    });

    const totalSteps = 3;

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [currentStep]);

    const onBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const updateFormData = useCallback((key: keyof DriverFormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const openImagePicker = (type: 'govtIdImage' | 'drivingLicenseImage') => {
        setCurrentImageType(type);
        setImagePickerModal(true);
    };

    const pickFromCamera = async () => {
        setImagePickerModal(false);
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                showToast(t('cameraPermissionRequired', 'Camera permission is required'));
                return;
            }
            const image = await ImagePicker.openCamera({
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });
            if (image?.path) {
                updateFormData(currentImageType, { uri: image.path, ...image });
            }
        } catch (error: any) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.error('Camera error:', error);
                showToast(t('cameraError', 'Unable to open camera'));
            }
        }
    };

    const pickFromGallery = async () => {
        setImagePickerModal(false);
        try {
            const hasPermission = await requestPhotoLibraryPermission();
            if (!hasPermission) {
                showToast(t('photoPermissionRequired', 'Photo library permission is required'));
                return;
            }
            const image = await ImagePicker.openPicker({
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });
            if (image?.path) {
                updateFormData(currentImageType, { uri: image.path, ...image });
            }
        } catch (error: any) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.error('Gallery error:', error);
                showToast(t('galleryError', 'Unable to open gallery'));
            }
        }
    };

    const validateStep1 = () => {
        if (!formData.fullName.trim()) {
            showToast(t('pleaseEnterFullName', 'Please enter full name'));
            return false;
        }
        if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
            showToast(t('pleaseEnterValidMobile', 'Please enter valid mobile number'));
            return false;
        }
        if (!formData.address.trim()) {
            showToast(t('pleaseEnterAddress', 'Please enter address'));
            return false;
        }
        if (!formData.fatherName.trim()) {
            showToast(t('pleaseEnterFatherName', "Please enter father's name"));
            return false;
        }
        if (!formData.dateOfBirth.trim()) {
            showToast(t('pleaseEnterDOB', 'Please enter date of birth'));
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.govtIdImage) {
            showToast(t('pleaseUploadGovtId', 'Please upload Government ID'));
            return false;
        }
        if (!formData.drivingLicenseImage) {
            showToast(t('pleaseUploadDL', 'Please upload Driving License'));
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        // TODO: Submit form data to API
        setTimeout(() => {
            setLoading(false);
            showToast(t('driverAddedSuccessfully', 'Driver added successfully!'));
            navigation.goBack();
        }, 1500);
    };

    const renderStep1 = () => (
        <View>
            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                {t('enterDriverDetails', 'Enter Driver Details')}
            </Text>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', marginBottom: 20 }}>
                {t('provideRequiredInfo', 'Provide required driver information')}
            </Text>

            {/* Full Name */}
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { fontSize: responsiveFontSize(1.5) }]}>{t('fullName', 'Full Name')}</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        value={formData.fullName}
                        onChangeText={(text) => updateFormData('fullName', text)}
                        placeholder={t('enterFullName', 'Enter full name')}
                        placeholderTextColor="#94A3B8"
                        style={[styles.textInput, { fontSize: responsiveFontSize(1.6) }]}
                    />
                </View>
            </View>

            {/* Mobile Number */}
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { fontSize: responsiveFontSize(1.5) }]}>{t('mobileNumber', 'Mobile Number')}</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        value={formData.mobileNumber}
                        onChangeText={(text) => updateFormData('mobileNumber', text)}
                        placeholder={t('enterMobileNumber', 'Enter mobile number')}
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        style={[styles.textInput, { fontSize: responsiveFontSize(1.6) }]}
                    />
                </View>
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { fontSize: responsiveFontSize(1.5) }]}>{t('address', 'Address')}</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="location-outline" size={20} color="#94A3B8" style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 14 }]} />
                    <TextInput
                        value={formData.address}
                        onChangeText={(text) => updateFormData('address', text)}
                        placeholder={t('enterAddress', 'Enter complete address')}
                        placeholderTextColor="#94A3B8"
                        multiline
                        style={[styles.textInput, styles.multilineInput, { fontSize: responsiveFontSize(1.6) }]}
                    />
                </View>
            </View>

            {/* Father's Name */}
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { fontSize: responsiveFontSize(1.5) }]}>{t('fatherName', "Father's Name")}</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="people-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        value={formData.fatherName}
                        onChangeText={(text) => updateFormData('fatherName', text)}
                        placeholder={t('enterFatherName', "Enter father's name")}
                        placeholderTextColor="#94A3B8"
                        style={[styles.textInput, { fontSize: responsiveFontSize(1.6) }]}
                    />
                </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { fontSize: responsiveFontSize(1.5) }]}>{t('dob', 'Date of Birth')}</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.inputWrapper}
                >
                    <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <Text style={[styles.textInput, { fontSize: responsiveFontSize(1.6), color: formData.dateOfBirth ? '#1E293B' : '#94A3B8', paddingVertical: 14 }]}>
                        {formData.dateOfBirth || t('selectDateOfBirth', 'Select date of birth')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    minimumDate={new Date(1940, 0, 1)}
                    onChange={(event, date) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (date && event.type !== 'dismissed') {
                            setSelectedDate(date);
                            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                            updateFormData('dateOfBirth', formattedDate);
                        }
                    }}
                />
            )}
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                {t('uploadRequiredDocs', 'Upload Required Documents')}
            </Text>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', marginBottom: 20 }}>
                {t('uploadClearDocs', 'Upload clear and valid documents')}
            </Text>

            {/* Government ID Upload */}
            <TouchableOpacity
                onPress={() => openImagePicker('govtIdImage')}
                style={[styles.uploadCard, { borderColor: formData.govtIdImage ? '#16A34A' : '#E2E8F0', borderStyle: formData.govtIdImage ? 'solid' : 'dashed' }]}
            >
                {formData.govtIdImage ? (
                    <View style={{ alignItems: 'center' }}>
                        <Image source={{ uri: formData.govtIdImage.uri }} style={{ width: 120, height: 80, borderRadius: 8, marginBottom: 8 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#16A34A', fontWeight: '600' }}>{t('uploaded', 'Uploaded')}</Text>
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B', marginTop: 4 }}>{t('tapToChange', 'Tap to change')}</Text>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Ionicons name="card-outline" size={28} color={colors.royalBlue} />
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#334155', fontWeight: '600', marginBottom: 4 }}>{t('govtId', 'Government ID (Aadhaar/Voter ID/PAN)')}</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>{t('tapToUpload', 'Tap to upload')}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Driving License Upload */}
            <TouchableOpacity
                onPress={() => openImagePicker('drivingLicenseImage')}
                style={[styles.uploadCard, { borderColor: formData.drivingLicenseImage ? '#16A34A' : '#E2E8F0', borderStyle: formData.drivingLicenseImage ? 'solid' : 'dashed' }]}
            >
                {formData.drivingLicenseImage ? (
                    <View style={{ alignItems: 'center' }}>
                        <Image source={{ uri: formData.drivingLicenseImage.uri }} style={{ width: 120, height: 80, borderRadius: 8, marginBottom: 8 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#16A34A', fontWeight: '600' }}>{t('uploaded', 'Uploaded')}</Text>
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B', marginTop: 4 }}>{t('tapToChange', 'Tap to change')}</Text>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                            <Ionicons name="car-outline" size={28} color={colors.royalBlue} />
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#334155', fontWeight: '600', marginBottom: 4 }}>{t('dl', 'Driving License')}</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>{t('tapToUpload', 'Tap to upload')}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: responsiveFontSize(1.4), marginRight: 6 }}>⚠️</Text>
                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#DC2626', flex: 1 }}>
                    {t('ensureDocsReadable', 'Ensure documents are readable to avoid verification delays.')}
                </Text>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                {t('reviewAndConfirm', 'Review & Confirm')}
            </Text>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', marginBottom: 20 }}>
                {t('reviewDetailsAndDocs', 'Review all entered details and documents')}
            </Text>

            {/* Driver Details Summary */}
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 12 }}>
                    {t('driverDetails', 'Driver Details')}
                </Text>
                <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B' }}>{t('fullName', 'Full Name')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#1E293B', fontWeight: '500' }}>{formData.fullName}</Text>
                </View>
                <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B' }}>{t('mobileNumber', 'Mobile Number')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#1E293B', fontWeight: '500' }}>{formData.mobileNumber}</Text>
                </View>
                <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B' }}>{t('address', 'Address')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#1E293B', fontWeight: '500' }}>{formData.address}</Text>
                </View>
                <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B' }}>{t('fatherName', "Father's Name")}</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#1E293B', fontWeight: '500' }}>{formData.fatherName}</Text>
                </View>
                <View>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B' }}>{t('dob', 'Date of Birth')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#1E293B', fontWeight: '500' }}>{formData.dateOfBirth}</Text>
                </View>
            </View>

            {/* Documents Summary */}
            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 12 }}>
                    {t('uploadedDocuments', 'Uploaded Documents')}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    {formData.govtIdImage && (
                        <View style={{ alignItems: 'center' }}>
                            <Image source={{ uri: formData.govtIdImage.uri }} style={{ width: 80, height: 60, borderRadius: 8, marginBottom: 6 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.2), color: '#64748B' }}>{t('govtId', 'Govt ID')}</Text>
                        </View>
                    )}
                    {formData.drivingLicenseImage && (
                        <View style={{ alignItems: 'center' }}>
                            <Image source={{ uri: formData.drivingLicenseImage.uri }} style={{ width: 80, height: 60, borderRadius: 8, marginBottom: 6 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.2), color: '#64748B' }}>{t('drivingLicense', 'License')}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Verification Checks */}
            <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 12 }}>
                    {t('verificationChecks', 'Verification Checks')}
                </Text>
                {[t('idCheck', 'ID Check'), t('courtCheck', 'Court Check'), t('digitalAddressCheck', 'Digital Address Check')].map((check, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155' }}>{check}</Text>
                    </View>
                ))}
            </View>

            {/* Pricing */}
            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16 }}>
                <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 8 }}>
                    {t('pricing', 'Pricing')}
                </Text>
                <Text style={{ fontSize: responsiveFontSize(2), fontWeight: 'bold', color: colors.royalBlue }}>
                    ₹500 + GST
                </Text>
                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>
                    {t('pricingInclude', '(Includes ID Check, Court Check & Digital Address Check)')}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Space height={safeAreaInsets.top} />
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(4), backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                <TouchableOpacity onPress={onBack} hitSlop={hitSlop(10)} style={{ padding: 4, marginRight: 8 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: colors.royalBlue, flex: 1 }}>
                    {t('addSingleDriver', 'Add Single Driver')}
                </Text>
                <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B' }}>
                    {currentStep}/{totalSteps}
                </Text>
            </View>

            {/* Step Indicator */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }}>
                {[1, 2, 3].map((step, index) => (
                    <React.Fragment key={step}>
                        <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: currentStep >= step ? colors.royalBlue : '#E2E8F0',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {currentStep > step ? (
                                <Ionicons name="checkmark" size={18} color={colors.white} />
                            ) : (
                                <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: 'bold', color: currentStep >= step ? colors.white : '#94A3B8' }}>{step}</Text>
                            )}
                        </View>
                        {index < 2 && (
                            <View style={{ width: 40, height: 3, backgroundColor: currentStep > step ? colors.royalBlue : '#E2E8F0', marginHorizontal: 8 }} />
                        )}
                    </React.Fragment>
                ))}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: 300 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky CTA */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), paddingBottom: safeAreaInsets.bottom || 20, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E2E8F0', ...shadow, elevation: 10 }}>
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={loading}
                    style={{
                        backgroundColor: colors.royalBlue,
                        paddingVertical: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.9), fontWeight: 'bold', marginRight: 8 }}>
                                {currentStep === totalSteps ? t('submitAndPay', 'Submit & Pay') : t('next', 'Next')}
                            </Text>
                            <Ionicons name={currentStep === totalSteps ? "card-outline" : "arrow-forward"} size={20} color={colors.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Image Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={imagePickerModal}
                onRequestClose={() => setImagePickerModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    activeOpacity={1}
                    onPress={() => setImagePickerModal(false)}
                >
                    <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: safeAreaInsets.bottom || 20 }}>
                        <View style={{ alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 }} />
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 20 }}>
                            {t('selectImageSource', 'Select Image Source')}
                        </Text>

                        {/* Camera Option */}
                        <TouchableOpacity
                            onPress={pickFromCamera}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16,
                                backgroundColor: '#F8FAFC',
                                borderRadius: 12,
                                marginBottom: 12
                            }}
                        >
                            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                <Ionicons name="camera" size={24} color={colors.royalBlue} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '600', color: '#1E293B' }}>
                                    {t('takePhoto', 'Take Photo')}
                                </Text>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>
                                    {t('useCamera', 'Use camera to capture')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                        </TouchableOpacity>

                        {/* Gallery Option */}
                        <TouchableOpacity
                            onPress={pickFromGallery}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16,
                                backgroundColor: '#F8FAFC',
                                borderRadius: 12,
                                marginBottom: 12
                            }}
                        >
                            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                <Ionicons name="images" size={24} color="#16A34A" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '600', color: '#1E293B' }}>
                                    {t('chooseFromGallery', 'Choose from Gallery')}
                                </Text>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>
                                    {t('selectExistingPhoto', 'Select existing photo')}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={() => setImagePickerModal(false)}
                            style={{
                                padding: 16,
                                backgroundColor: '#FEE2E2',
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '600', color: '#DC2626' }}>
                                {t('cancel', 'Cancel')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        color: '#334155',
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        paddingVertical: 14,
        color: '#1E293B',
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    uploadCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 2,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
});
