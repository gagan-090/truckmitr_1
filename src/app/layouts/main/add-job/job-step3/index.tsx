import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Space } from '@truckmitr/src/app/components'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { jobAddAction } from '@truckmitr/src/redux/actions/user.action';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

// Progress Steps Component
const ProgressSteps = ({ currentStep }: { currentStep: number }) => {
  const colors = useColor();
  const { responsiveFontSize } = useResponsiveScale();
  const { t } = useTranslation();

  const steps = [
    { number: 1, label: t('basicInfo') },
    { number: 2, label: t('details') },
    { number: 3, label: t('review') },
  ];

  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              step.number <= currentStep && styles.progressDotActive,
              { backgroundColor: step.number <= currentStep ? colors.royalBlue : colors.blackOpacity(0.15) }
            ]}>
              {step.number < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.progressDotText,
                  { color: step.number <= currentStep ? '#FFFFFF' : colors.blackOpacity(0.4) }
                ]}>
                  {step.number}
                </Text>
              )}
            </View>
            <Text style={[
              styles.progressLabel,
              {
                color: step.number <= currentStep ? colors.royalBlue : colors.blackOpacity(0.4),
                fontSize: responsiveFontSize(1.3)
              }
            ]}>
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[
              styles.progressLine,
              { backgroundColor: step.number < currentStep ? colors.royalBlue : colors.blackOpacity(0.15) }
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default function JobStep3() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useStatusBarStyle('dark-content');
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { addJob } = useSelector((state: any) => state?.job);

  const licenseExpiry = addJob?.Application_Deadline ? new Date(addJob?.Application_Deadline) : moment().toDate();
  const [licenseExpiryModel, setlicenseExpiryModel] = useState(false);
  const [loading, setloading] = useState(false);
  const [checkBoxSelect, setCheckBoxSelect] = useState<boolean>(true);

  const [errors, setErrors] = useState<{
    applicationDeadline?: string;
    driverRequired?: string;
    jobDecription?: string;
    checkBox?: string;
  }>({});

  const validate = (): boolean => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    if (!addJob?.Application_Deadline) {
      newErrors.applicationDeadline = t('applicationDeadlineRequired');
      valid = false;
    }
    if (!addJob?.Job_Management) {
      newErrors.driverRequired = t('noOfDriversRequired');
      valid = false;
    }
    if (!addJob?.Job_Description) {
      newErrors.jobDecription = t('jobDescriptionRequired');
      valid = false;
    }
    if (!checkBoxSelect) {
      newErrors.checkBox = t('youNeedToAcceptTruckMitr');
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const _goback = () => navigation.goBack();

  const _onpressNext = async () => {
    if (!validate()) return;
    setloading(true);
    const FormData = require('form-data');
    let data = new FormData();
    data.append('job_title', addJob?.job_title);
    data.append('job_location', addJob?.job_location);
    data.append('vehicle_type', addJob?.vehicle_type);
    data.append('Required_Experience', addJob?.Required_Experience);
    data.append('Salary_Range', addJob?.Salary_Range);
    data.append('Type_of_License', addJob?.Type_of_License);
    data.append('Preferred_Skills', JSON.stringify(addJob?.Preferred_Skills));
    data.append('Application_Deadline', moment(addJob?.Application_Deadline).format("DD-MM-YYYY"));
    data.append('Job_Management', addJob?.Job_Management);
    data.append('Job_Description', addJob?.Job_Description);
    data.append('consent_visible_driver', checkBoxSelect ? 1 : 0);

    try {
      const response = addJob?.id
        ? await axiosInstance.post(END_POINTS.TRANSPORTER_EDIT_JOB(addJob?.id), data)
        : await axiosInstance.post(END_POINTS.TRANSPORTER_ADD_JOB, data);

      if (response?.data?.status) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: STACKS.BOTTOM_TAB,
                state: {
                  index: 0,
                  routes: [{ name: STACKS.HOME }],
                },
              },
            ],
          })
        );
        dispatch(jobAddAction(null));
        showToast(response?.data?.message);
      } else {
        showToast(response?.data?.message);
      }
    } catch (error) {
      console.log('Add job error:', JSON.stringify(error));
      showToast(JSON.stringify(error));
    } finally {
      setloading(false);
    }
  };

  const _onpressCheckBox = () => {
    setCheckBoxSelect(!checkBoxSelect);
    setErrors((prev) => ({ ...prev, checkBox: undefined }));
  };

  const minimumDate = new Date();
  const maximumDate = moment().add(150, "years").toDate();

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <Space height={safeAreaInsets.top} />

      {/* Apple-style Header */}
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={hitSlop(10)}
          onPress={_goback}
          style={[styles.backButton, { backgroundColor: colors.blackOpacity(0.05) }]}
        >
          <Ionicons name={'chevron-back'} size={22} color={colors.royalBlue} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.black, fontSize: responsiveFontSize(2.2) }]}>
          {addJob?.id ? t('editJob') : t('addJob')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={responsiveHeight(10)}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Steps */}
        <ProgressSteps currentStep={3} />

        <Space height={responsiveFontSize(1.5)} />

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.white }]}>
          <View style={styles.formHeader}>
            <View style={[styles.formIconContainer, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={colors.royalBlue} />
            </View>
            <View style={styles.formHeaderText}>
              <Text style={[styles.formTitle, { color: colors.black, fontSize: responsiveFontSize(2) }]}>
                {t('Review')}
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.blackOpacity(0.5), fontSize: responsiveFontSize(1.4) }]}>
                {t('Final Details')}
              </Text>
            </View>
          </View>

          <View style={[styles.formDivider, { backgroundColor: colors.blackOpacity(0.06) }]} />

          {/* Application Deadline */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.royalBlue} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                {t('applicationDeadline')}
                <Text style={{ color: '#FF3B30' }}> *</Text>
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setlicenseExpiryModel(true)}
              style={[styles.dateButton, { backgroundColor: colors.blackOpacity(0.03) }]}
            >
              <Text style={[
                styles.dateText,
                {
                  color: addJob?.Application_Deadline ? colors.black : colors.blackOpacity(0.4),
                  fontSize: responsiveFontSize(1.8)
                }
              ]}>
                {addJob?.Application_Deadline
                  ? moment(licenseExpiry).format("DD MMM YYYY")
                  : 'DD-MM-YYYY'
                }
              </Text>
              <Ionicons name="calendar" size={20} color={colors.royalBlue} />
            </TouchableOpacity>
            {errors?.applicationDeadline && (
              <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>
                {errors.applicationDeadline}
              </Text>
            )}
          </View>

          {/* Number of Drivers */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                <Ionicons name="people-outline" size={16} color={colors.royalBlue} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                {t('numberOfDrivers')}
                <Text style={{ color: '#FF3B30' }}> *</Text>
              </Text>
            </View>
            <TextInput
              value={addJob?.Job_Management || ''}
              onChangeText={(text) => {
                dispatch(jobAddAction({ ...addJob, Job_Management: text }));
                setErrors((prev) => ({ ...prev, driverRequired: undefined }));
              }}
              keyboardType='numeric'
              placeholder={t('enterNumberOfDrivers')}
              placeholderTextColor={colors.blackOpacity(0.4)}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.blackOpacity(0.03),
                  color: colors.black,
                  fontSize: responsiveFontSize(1.8),
                }
              ]}
            />
            {errors?.driverRequired && (
              <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>
                {errors.driverRequired}
              </Text>
            )}
          </View>

          {/* Job Description */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                <Feather name="file-text" size={16} color={colors.royalBlue} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                {t('jobDescription_500_character')}
                <Text style={{ color: '#FF3B30' }}> *</Text>
              </Text>
            </View>
            <TextInput
              multiline
              value={addJob?.Job_Description || ''}
              onChangeText={(text) => {
                dispatch(jobAddAction({ ...addJob, Job_Description: text }));
                setErrors((prev) => ({ ...prev, jobDecription: undefined }));
              }}
              placeholder={t('writeJobDescription')}
              placeholderTextColor={colors.blackOpacity(0.4)}
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.blackOpacity(0.03),
                  color: colors.black,
                  fontSize: responsiveFontSize(1.8),
                  minHeight: responsiveHeight(15),
                }
              ]}
            />
            {errors?.jobDecription && (
              <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>
                {errors.jobDecription}
              </Text>
            )}
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={_onpressCheckBox}
            style={styles.checkboxContainer}
          >
            <View style={[
              styles.checkbox,
              {
                backgroundColor: checkBoxSelect ? colors.royalBlue : 'transparent',
                borderColor: checkBoxSelect ? colors.royalBlue : colors.blackOpacity(0.3)
              }
            ]}>
              {checkBoxSelect && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={[styles.checkboxText, { color: colors.blackOpacity(0.7), fontSize: responsiveFontSize(1.5) }]}>
              {t('iAgreeToTruckMitr')}
              <Text
                onPress={() => navigation.navigate(STACKS?.TRANSPORTER_CONSENT)}
                style={{ color: colors.royalBlue, fontWeight: '600' }}
              >
                {' '}{t('transporterConsent')}
              </Text>
              {t('addJobPolicy')}
            </Text>
          </TouchableOpacity>
          {errors.checkBox && (
            <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4), marginTop: 8 }]}>
              {errors.checkBox}
            </Text>
          )}
        </View>

        <Space height={responsiveFontSize(12)} />
      </KeyboardAwareScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: safeAreaInsets.bottom + 10 }]}>
        <TouchableOpacity
          onPress={_onpressNext}
          activeOpacity={0.9}
          disabled={loading}
          style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
            colors={['#084489', '#0c78f0']}
          />
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={[styles.submitButtonText, { fontSize: responsiveFontSize(1.8) }]}>
                {addJob?.id ? t('editJob') : t('addJob')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal - Apple Style */}
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={licenseExpiryModel}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            {/* Handle Bar */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.black, fontSize: responsiveFontSize(2) }]}>
                {t('applicationDeadline')}
              </Text>
              <TouchableOpacity onPress={() => setlicenseExpiryModel(false)}>
                <View style={[styles.closeButton, { backgroundColor: colors.blackOpacity(0.08) }]}>
                  <Ionicons name="close" size={18} color={colors.black} />
                </View>
              </TouchableOpacity>
            </View>

            <DatePicker
              mode='date'
              theme='light'
              date={licenseExpiry}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onDateChange={(date) => {
                dispatch(jobAddAction({ ...addJob, Application_Deadline: date }));
                setErrors((prev) => ({ ...prev, applicationDeadline: undefined }));
              }}
              modal={false}
              style={{ alignSelf: 'center' }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setlicenseExpiryModel(false)}
                style={[styles.modalButton, styles.modalButtonSecondary, { backgroundColor: colors.blackOpacity(0.08) }]}
              >
                <Text style={[styles.modalButtonTextSecondary, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setlicenseExpiryModel(false)}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                  colors={['#084489', '#0c78f0']}
                />
                <Text style={[styles.modalButtonTextPrimary, { fontSize: responsiveFontSize(1.6) }]}>
                  {t('confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Progress Steps
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    shadowColor: '#084489',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  progressDotText: {
    fontWeight: '700',
    fontSize: 12,
  },
  progressLabel: {
    marginTop: 4,
    fontWeight: '500',
  },
  progressLine: {
    width: 32,
    height: 2,
    marginHorizontal: 6,
    marginBottom: 16,
    borderRadius: 1,
  },

  // Form Card
  formCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeaderText: {
    marginLeft: 12,
  },
  formTitle: {
    fontWeight: '700',
  },
  formSubtitle: {
    marginTop: 2,
  },
  formDivider: {
    height: 1,
    marginVertical: 14,
  },

  // Field Container
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fieldLabel: {
    fontWeight: '600',
  },

  // Text Input
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '500',
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '500',
    textAlignVertical: 'top',
  },

  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontWeight: '500',
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxText: {
    flex: 1,
    lineHeight: 22,
  },

  // Error
  errorText: {
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 4,
  },

  // Bottom Button Container
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    overflow: 'hidden',
    gap: 8,
    shadowColor: '#084489',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalButtonSecondary: {},
  modalButtonPrimary: {},
  modalButtonTextSecondary: {
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});