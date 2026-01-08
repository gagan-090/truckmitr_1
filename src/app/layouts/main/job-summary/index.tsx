import React, { useCallback, useMemo, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Image,
    Pressable,
} from 'react-native';
import { useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { hitSlop } from '@truckmitr/src/app/functions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

// Truck Images
const TruckImages = {
    cargoOpen: require('@truckmitr/src/assets/trucks/open_cargo.png'),
    cargoClosed: require('@truckmitr/src/assets/trucks/close_cargo.png'),
    tipper: require('@truckmitr/src/assets/trucks/tripper.png'),
    trailer: require('@truckmitr/src/assets/trucks/tailer.png'),
    tanker: require('@truckmitr/src/assets/trucks/tainkers.png'),
    carCarrier: require('@truckmitr/src/assets/trucks/car_carrier.png'),
    container: require('@truckmitr/src/assets/trucks/container.png'),
    reefer: require('@truckmitr/src/assets/trucks/refregerator.png'),
};

// Data Arrays - moved outside component to prevent recreation
const vehicleTypes = [
    { label: 'Cargo Truck (Open)', value: 'Cargo Truck (Open)', image: TruckImages.cargoOpen },
    { label: 'Cargo Truck (Closed)', value: 'Cargo Truck (Closed)', image: TruckImages.cargoClosed },
    { label: 'Tipper Trucks', value: 'Tipper Trucks', image: TruckImages.tipper },
    { label: 'Trailer / Semi-Trailer', value: 'Trailer / Semi-Trailer Trucks', image: TruckImages.trailer },
    { label: 'Tankers', value: 'Tankers', image: TruckImages.tanker },
    { label: 'Car Carriers', value: 'Car Carriers', image: TruckImages.carCarrier },
    { label: 'Container Trucks', value: 'Container Trucks', image: TruckImages.container },
    { label: 'Reefer Trucks', value: 'Refrigerator (Reefer) Trucks', image: TruckImages.reefer },
];

const drivingExperienceArray = [
    { labelKey: 'exp1to5Years', label: '1-5 years', value: '1-5' },
    { labelKey: 'exp5to10Years', label: '5-10 years', value: '5-10' },
    { labelKey: 'exp10to15Years', label: '10-15 years', value: '10-15' },
    { labelKey: 'exp15to20Years', label: '15-20 years', value: '15-20' },
    { labelKey: 'exp20PlusYears', label: '20+ years', value: '20+' },
];

const salaryRanges = [
    { label: '₹20,000 - 25,000', value: '20000-25000' },
    { label: '₹25,000 - 30,000', value: '25000-30000' },
    { label: '₹30,000 - 35,000', value: '30000-35000' },
    { label: '₹35,000 - 40,000', value: '35000-40000' },
    { label: '₹40,000 - 50,000', value: '40000-50000' },
    { label: '₹50,000+', value: '50000+' },
];

const licenseTypes = [
    { label: 'LMV (Light)', value: 'LMV', emoji: '🚗' },
    { label: 'HMV (Heavy)', value: 'HMV', emoji: '🚛' },
    { label: 'HGMV (Goods)', value: 'HGMV', emoji: '📦' },
    { label: 'HPMV/HTV', value: 'HPMV/HTV', emoji: '🚚' },
];

const operationalSegments = [
    { id: 'ecommerce', label: 'E-commerce', emoji: '📦' },
    { id: 'white_goods', label: 'White Goods', emoji: '🏠' },
    { id: 'livestock', label: 'Livestock', emoji: '🐄' },
    { id: 'perishable', label: 'Perishable', emoji: '🍎' },
    { id: 'oversized', label: 'Oversized', emoji: '📏' },
    { id: 'fuel_tanker', label: 'Fuel Tanker', emoji: '⛽' },
    { id: 'automobile', label: 'Automobile Carrier', emoji: '🚗' },
    { id: 'construction', label: 'Construction', emoji: '🏗️' },
    { id: 'refrigerator', label: 'Refrigerator Vehicle', emoji: '❄️' },
    { id: 'others', label: 'Others', emoji: '📋' },
];

const conditionLabelsMap: { [key: string]: string } = {
    'excellent': 'Excellent (New/Very well maintained)',
    'good': 'Good (Regularly serviced)',
    'average': 'Average (Working condition)',
    'old_running': 'Old but Running',
    'road_ready': 'Made Road Ready after joining'
};

// Memoized Edit Button Component for better performance
const EditButton = memo(({ onPress }: { onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
        <Ionicons name="pencil" size={14} color="#246BFD" />
    </Pressable>
));

// Memoized Summary Card Component
const SummaryCard = memo(({ iconBg, iconName, iconColor, title, value, onEdit, children }: {
    iconBg: string; iconName: string; iconColor: string; title: string; value?: string; onEdit: () => void; children?: React.ReactNode;
}) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryCardHeader}>
            <View style={[styles.summaryIconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName as any} size={18} color={iconColor} />
            </View>
            <Text style={styles.summaryCardTitle}>{title}</Text>
            <EditButton onPress={onEdit} />
        </View>
        {children || <Text style={styles.summaryCardValue}>{value}</Text>}
    </View>
));

export default function JobSummary() {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content');
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigatorProp>();
    const { addJob } = useSelector((state: any) => state?.job);

    const notProvided = useMemo(() => t('notProvided') || 'Not Provided', [t]);

    const getSalaryLabel = useCallback((value: string) => {
        return salaryRanges.find(s => s.value === value)?.label || value || notProvided;
    }, [notProvided]);

    const getExperienceLabel = useCallback((value: string) => {
        const exp = drivingExperienceArray.find(e => e.value === value);
        return exp ? (t(exp.labelKey) || exp.label) : (value || notProvided);
    }, [t, notProvided]);

    const getLicenseLabel = useCallback((value: string) => {
        return licenseTypes.find(l => l.value === value)?.label || value || notProvided;
    }, [notProvided]);

    const getVehicleImage = useCallback((value: string) => {
        return vehicleTypes.find(v => v.value === value)?.image || null;
    }, []);

    const handleEdit = useCallback((stepId: string) => {
        navigation.navigate(STACKS?.EDIT_JOB, { stepId });
    }, [navigation]);

    const goBack = useCallback(() => navigation.goBack(), [navigation]);

    // Memoized edit handlers
    const editJobTitle = useCallback(() => handleEdit('job_title'), [handleEdit]);
    const editLocation = useCallback(() => handleEdit('job_location'), [handleEdit]);
    const editRoute = useCallback(() => handleEdit('route'), [handleEdit]);
    const editVehicle = useCallback(() => handleEdit('vehicle_type'), [handleEdit]);
    const editExperience = useCallback(() => handleEdit('experience'), [handleEdit]);
    const editSalary = useCallback(() => handleEdit('salary_range'), [handleEdit]);
    const editEsiPf = useCallback(() => handleEdit('esi_pf'), [handleEdit]);
    const editFoodAllowance = useCallback(() => handleEdit('food_allowance'), [handleEdit]);
    const editTripIncentive = useCallback(() => handleEdit('trip_incentive'), [handleEdit]);
    const editAccommodation = useCallback(() => handleEdit('accommodation'), [handleEdit]);
    const editMileage = useCallback(() => handleEdit('mileage'), [handleEdit]);
    const editFastag = useCallback(() => handleEdit('fastag'), [handleEdit]);
    const editLicense = useCallback(() => handleEdit('license_type'), [handleEdit]);
    const editDriversCount = useCallback(() => handleEdit('drivers_count'), [handleEdit]);
    const editDeadline = useCallback(() => handleEdit('deadline'), [handleEdit]);
    const editSkills = useCallback(() => handleEdit('preferred_skills'), [handleEdit]);
    const editDescription = useCallback(() => handleEdit('job_description'), [handleEdit]);
    const editTruckCondition = useCallback(() => handleEdit('truck_condition'), [handleEdit]);

    // Memoized values
    const yesText = useMemo(() => t('yes') || 'Yes', [t]);
    const noText = useMemo(() => t('no') || 'No', [t]);

    const getYesNoValue = useCallback((value: string | undefined, desc?: string, suffix?: string) => {
        if (value === 'yes') return `${yesText}${desc ? ` - ${suffix === 'km/l' ? desc : '₹' + desc}${suffix || '/day'}` : ''}`;
        if (value === 'no') return noText;
        return notProvided;
    }, [yesText, noText, notProvided]);

    const truckConditionValue = useMemo(() => {
        if (!addJob?.truck_condition) return notProvided;
        return t(addJob.truck_condition) || conditionLabelsMap[addJob.truck_condition] || addJob.truck_condition;
    }, [addJob?.truck_condition, t, notProvided]);

    const deadlineValue = useMemo(() => {
        return addJob?.Application_Deadline ? moment(addJob.Application_Deadline).format('DD MMMM YYYY') : notProvided;
    }, [addJob?.Application_Deadline, notProvided]);

    return (
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={goBack}
                    style={styles.backButton}
                    hitSlop={hitSlop(10)}
                >
                    <Ionicons name="chevron-back" size={22} color="#246BFD" />
                </Pressable>
                <Text style={styles.headerTitle}>{t('jobSummary') || 'Job Summary'}</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} removeClippedSubviews>
                {/* Header Section */}
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryHeaderTitle}>{t('reviewYourJob') || 'Review Your Job'}</Text>
                    <Text style={styles.summaryHeaderSubtitle}>{t('reviewJobDetailsMessage') || 'Please review all the details before posting your job'}</Text>
                </View>

                <SummaryCard iconBg="#E8F4FD" iconName="briefcase" iconColor="#246BFD" title={t('jobTitle') || 'Job Title'} value={addJob?.job_title || notProvided} onEdit={editJobTitle} />
                <SummaryCard iconBg="#E8F8F0" iconName="location" iconColor="#10B981" title={t('location') || 'Location'} value={addJob?.job_location || notProvided} onEdit={editLocation} />
                <SummaryCard iconBg="#EBF4FF" iconName="map" iconColor="#3B82F6" title={t('route') || 'Route'} value={addJob?.route || notProvided} onEdit={editRoute} />

                {/* Vehicle Card */}
                <SummaryCard iconBg="#FEF3E8" iconName="car" iconColor="#F59E0B" title={t('vehicle') || 'Vehicle'} onEdit={editVehicle}>
                    {getVehicleImage(addJob?.vehicle_type) && (
                        <Image source={getVehicleImage(addJob?.vehicle_type)} style={styles.summaryVehicleImage} resizeMode="contain" />
                    )}
                    <Text style={[styles.summaryCardValue, { fontSize: 13, marginTop: 4 }]}>{addJob?.vehicle_type || notProvided}</Text>
                </SummaryCard>

                <SummaryCard iconBg="#F3E8FF" iconName="time" iconColor="#8B5CF6" title={t('experience') || 'Experience'} value={getExperienceLabel(addJob?.Required_Experience)} onEdit={editExperience} />
                <SummaryCard iconBg="#E8FDF0" iconName="cash" iconColor="#059669" title={t('fixedSalary') || 'Fixed Salary'} value={getSalaryLabel(addJob?.Salary_Range)} onEdit={editSalary} />
                <SummaryCard iconBg="#F0F9FF" iconName="shield-checkmark" iconColor="#0EA5E9" title={t('esiPf') || 'ESI/PF'} value={addJob?.esi_pf === 'yes' ? yesText : addJob?.esi_pf === 'no' ? noText : notProvided} onEdit={editEsiPf} />
                <SummaryCard iconBg="#FEF3E2" iconName="restaurant" iconColor="#F59E0B" title={t('foodAllowance') || 'Food Allowance'} value={getYesNoValue(addJob?.food_allowance, addJob?.food_allowance_desc)} onEdit={editFoodAllowance} />
                <SummaryCard iconBg="#F0FDF4" iconName="gift" iconColor="#16A34A" title={t('tripIncentive') || 'Trip Incentive'} value={getYesNoValue(addJob?.trip_incentive, addJob?.trip_incentive_desc)} onEdit={editTripIncentive} />
                <SummaryCard iconBg="#EEF2FF" iconName="home" iconColor="#6366F1" title={t('accommodationFacility') || 'Accommodation Facility'} value={addJob?.rahane_ki_suvidha === 'yes' ? yesText : addJob?.rahane_ki_suvidha === 'no' ? noText : notProvided} onEdit={editAccommodation} />
                <SummaryCard iconBg="#F0F9FF" iconName="speedometer" iconColor="#0EA5E9" title={t('mileageRequired') || 'Mileage Required'} value={getYesNoValue(addJob?.mileage, addJob?.mileage_desc, 'km/l')} onEdit={editMileage} />
                <SummaryCard iconBg="#FEF3E2" iconName="card" iconColor="#F59E0B" title={t('fastagRoadKharcha') || 'FASTag/Road Kharcha'} value={getYesNoValue(addJob?.fast_tag_road_kharcha, addJob?.fast_tag_road_kharcha_desc, '')} onEdit={editFastag} />
                <SummaryCard iconBg="#FEE8E8" iconName="card" iconColor="#EF4444" title={t('license') || 'License'} value={getLicenseLabel(addJob?.Type_of_License)} onEdit={editLicense} />
                <SummaryCard iconBg="#E8F0FE" iconName="people" iconColor="#3B82F6" title={t('drivers') || 'Drivers'} value={addJob?.Job_Management || notProvided} onEdit={editDriversCount} />
                <SummaryCard iconBg="#FFF3E8" iconName="calendar" iconColor="#F97316" title={t('applicationDeadline') || 'Application Deadline'} value={deadlineValue} onEdit={editDeadline} />

                {/* Skills Card */}
                <SummaryCard iconBg="#E8F4FD" iconName="construct" iconColor="#246BFD" title={t('preferredSkills') || 'Preferred Skills'} onEdit={editSkills}>
                    <View style={styles.summarySkillsContainer}>
                        {(addJob?.Preferred_Skills || []).map((skill: string, index: number) => {
                            const skillData = operationalSegments.find(s => s.label === skill);
                            return (
                                <View key={index} style={styles.summarySkillChip}>
                                    <Text style={{ fontSize: 12 }}>{skillData?.emoji || '📋'}</Text>
                                    <Text style={styles.summarySkillText}>{skill}</Text>
                                </View>
                            );
                        })}
                        {(!addJob?.Preferred_Skills || addJob.Preferred_Skills.length === 0) && (
                            <Text style={styles.summaryCardValue}>{notProvided}</Text>
                        )}
                    </View>
                </SummaryCard>

                <SummaryCard iconBg="#F3E8FF" iconName="document-text" iconColor="#8B5CF6" title={t('jobDescriptionTitle') || 'Job Description'} onEdit={editDescription}>
                    <Text style={[styles.summaryCardValue, styles.summaryDescription]}>{addJob?.Job_Description || notProvided}</Text>
                </SummaryCard>

                <SummaryCard iconBg="#FEF3E2" iconName="build" iconColor="#F59E0B" title={t('truckCondition') || 'Truck Condition'} value={truckConditionValue} onEdit={editTruckCondition} />

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
    backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    summaryHeader: { marginBottom: 20 },
    summaryHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginBottom: 6 },
    summaryHeaderSubtitle: { fontSize: 13, color: '#6C757D', lineHeight: 20 },
    summaryCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E9ECEF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    summaryCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    summaryIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    summaryCardTitle: { fontSize: 11, fontWeight: '600', color: '#6C757D', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
    summaryCardValue: { fontSize: 15, fontWeight: '600', color: '#212529', marginLeft: 48, lineHeight: 22 },
    summaryVehicleImage: { width: '100%', height: 60, marginTop: 4, marginBottom: 4 },
    summarySkillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 48, marginTop: 0 },
    summarySkillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5FF', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
    summarySkillText: { fontSize: 12, color: '#246BFD', fontWeight: '500', marginLeft: 5 },
    summaryDescription: { fontSize: 14, lineHeight: 22, color: '#495057', fontWeight: '400' },
    editButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
    editButtonPressed: { opacity: 0.6, backgroundColor: '#D0E7FF' },
});