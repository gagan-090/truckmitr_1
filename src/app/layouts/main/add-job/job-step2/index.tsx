import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle, DimensionValue } from 'react-native'
import React, { useState } from 'react'
import { Space } from '@truckmitr/src/app/components'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { jobAddAction } from '@truckmitr/src/redux/actions/user.action';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const operationalSegment = [
  'E-commerce', 'White Goods', 'Livestock',
  'Perishable', 'Oversized', 'Fuel Tanker',
  'Automobile Carrier', 'Construction Industry',
  'Refrigerator Vehicle', 'Others'
];

const salaryRanges = [
  '20000-25000', '25000-30000', '30000-35000',
  '35000-40000', '40000-45000', '45000-50000',
  '50000-55000', '55000-60000'
];

const licenseTypes = ['LMV', 'HMV', 'HGMV', 'HPMV/HTV'];

// Apple-style Chip Component
const SelectableChip = ({
  label,
  selected,
  onPress,
  showCheckmark = false,
  chipWidth,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  showCheckmark?: boolean;
  chipWidth?: DimensionValue;
}) => {
  const colors = useColor();
  const { responsiveFontSize } = useResponsiveScale();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.royalBlueOpacity(0.15) : colors.blackOpacity(0.04),
          borderColor: selected ? colors.royalBlue : 'transparent',
          width: chipWidth,
        }
      ]}
    >
      <Text style={[
        styles.chipText,
        {
          color: selected ? colors.royalBlue : colors.black,
          fontWeight: selected ? '600' : '400',
          fontSize: responsiveFontSize(1.4)
        }
      ]}>
        {label}
      </Text>
      {showCheckmark && (
        <View style={[styles.chipIcon, { marginLeft: 4 }]}>
          <Feather
            name={selected ? 'check' : 'plus'}
            size={12}
            color={selected ? colors.royalBlue : colors.blackOpacity(0.5)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Progress Steps Component
const ProgressSteps = ({ currentStep }: { currentStep: number }) => {
  const colors = useColor();
  const { responsiveFontSize } = useResponsiveScale();
  const { t } = useTranslation();

  const steps = [
    { number: 1, label: t('Basic Info') },
    { number: 2, label: t('Details') },
    { number: 3, label: t('Review') },
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

export default function JobStep2() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useStatusBarStyle('dark-content');
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { addJob } = useSelector((state: any) => state?.job);

  const [errors, setErrors] = useState<{
    salaryRange?: string;
    licenseType?: string;
    preferredSkills?: string;
  }>({});

  const validate = (): boolean => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    if (!addJob?.Salary_Range) {
      newErrors.salaryRange = t('salaryRangeRequired');
      valid = false;
    }
    if (!addJob?.Type_of_License) {
      newErrors.licenseType = t('licenseTypeRequired');
      valid = false;
    }
    if (!addJob?.Preferred_Skills) {
      newErrors.preferredSkills = t('preferredSkillsRequired');
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const _goback = () => navigation.goBack();
  const _onpressNext = () => {
    if (!validate()) return;
    navigation.navigate(STACKS.JOB_STEP3);
  };

  const toggleCategory = (item: string) => {
    setErrors((prev) => ({ ...prev, preferredSkills: undefined }));
    if (addJob?.Preferred_Skills?.includes(item)) {
      dispatch(jobAddAction({
        ...addJob,
        Preferred_Skills: addJob?.Preferred_Skills?.filter((a: string) => a !== item)
      }));
    } else {
      dispatch(jobAddAction({
        ...addJob,
        Preferred_Skills: addJob?.Preferred_Skills ? [...addJob?.Preferred_Skills, item] : [item]
      }));
    }
  };

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
        <ProgressSteps currentStep={2} />

        <Space height={responsiveFontSize(1.5)} />

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.white }]}>
          <View style={styles.formHeader}>
            <View style={[styles.formIconContainer, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={20} color={colors.royalBlue} />
            </View>
            <View style={styles.formHeaderText}>
              <Text style={[styles.formTitle, { color: colors.black, fontSize: responsiveFontSize(2) }]}>
                {t('Details')}
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.blackOpacity(0.5), fontSize: responsiveFontSize(1.4) }]}>
                {t('Select Job Requirements')}
              </Text>
            </View>
          </View>

          <View style={[styles.formDivider, { backgroundColor: colors.blackOpacity(0.06) }]} />

          {/* Salary Range */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                <Ionicons name="cash-outline" size={16} color={colors.royalBlue} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                {t('Salary Range')}
                <Text style={{ color: '#FF3B30' }}> *</Text>
              </Text>
            </View>
            <View style={styles.salaryGrid}>
              {salaryRanges.map((range) => (
                <SelectableChip
                  key={range}
                  label={`₹${range}`}
                  selected={addJob?.Salary_Range === range}
                  onPress={() => {
                    dispatch(jobAddAction({ ...addJob, Salary_Range: range }));
                    setErrors((prev) => ({ ...prev, salaryRange: undefined }));
                  }}
                  chipWidth="48%"
                />
              ))}
            </View>
            {errors?.salaryRange && (
              <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>
                {errors.salaryRange}
              </Text>
            )}
          </View>

          {/* License Type */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                <Ionicons name="card-outline" size={16} color={colors.royalBlue} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                {t('typeOfLicense')}
                <Text style={{ color: '#FF3B30' }}> *</Text>
              </Text>
            </View>
            <View style={styles.licenseGrid}>
              {licenseTypes.map((license) => (
                <SelectableChip
                  key={license}
                  label={license}
                  selected={addJob?.Type_of_License === license}
                  onPress={() => {
                    dispatch(jobAddAction({ ...addJob, Type_of_License: license }));
                    setErrors((prev) => ({ ...prev, licenseType: undefined }));
                  }}
                />
              ))}
            </View>
            {errors?.licenseType && (
              <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>
                {errors.licenseType}
              </Text>
            )}
          </View>

          {/* Preferred Skills */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                <Ionicons name="construct-outline" size={16} color={colors.royalBlue} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                {t('preferredSkills')}
                <Text style={{ color: '#FF3B30' }}> *</Text>
              </Text>
            </View>
            <View style={styles.skillsGrid}>
              {operationalSegment.map((item) => (
                <SelectableChip
                  key={item}
                  label={item}
                  selected={addJob?.Preferred_Skills?.includes(item)}
                  onPress={() => toggleCategory(item)}
                  showCheckmark
                  chipWidth="31%"
                />
              ))}
            </View>
            {errors?.preferredSkills && (
              <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>
                {errors.preferredSkills}
              </Text>
            )}
          </View>
        </View>

        <Space height={responsiveFontSize(12)} />
      </KeyboardAwareScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: safeAreaInsets.bottom + 10 }]}>
        <TouchableOpacity
          onPress={_onpressNext}
          activeOpacity={0.9}
          style={styles.nextButton}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
            colors={['#084489', '#0c78f0']}
          />
          <Text style={[styles.nextButtonText, { fontSize: responsiveFontSize(1.8) }]}>
            {t('next')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    marginBottom: 10,
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

  // Salary Grid - 2 per row
  salaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
    justifyContent: 'flex-start',
  },

  // License Grid - side by side
  licenseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
    justifyContent: 'flex-start',
  },

  // Skills Grid - 3 per row
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 6,
    justifyContent: 'flex-start',
  },

  // Legacy chip styles (keep for compatibility)
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 6,
    justifyContent: 'flex-start',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 6,
    justifyContent: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    textAlign: 'center',
  },
  chipIcon: {},

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

  // Next Button
  nextButton: {
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
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});