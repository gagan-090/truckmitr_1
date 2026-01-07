import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Image,
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

// Data Arrays
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

export default function JobSummary() {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content');
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigatorProp>();
    const { addJob } = useSelector((state: any) => state?.job);

    const notProvided = t('notProvided') || 'Not Provided';


    const getSalaryLabel = (value: string) => {
        return salaryRanges.find(s => s.value === value)?.label || value;
    };

    const getExperienceLabel = (value: string) => {
        const exp = drivingExperienceArray.find(e => e.value === value);
        return exp ? (t(exp.labelKey) || exp.label) : value;
    };

    const getLicenseLabel = (value: string) => {
        return licenseTypes.find(l => l.value === value)?.label || value;
    };

    const getVehicleImage = (value: string) => {
        return vehicleTypes.find(v => v.value === value)?.image || null;
    };

    const handleEdit = () => {
        navigation.navigate(STACKS?.ADD_JOB);
    };

    const EditButton = () => (
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="pencil" size={14} color="#246BFD" />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#212529" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('jobSummary') || 'Job Summary'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryHeaderTitle}>{t('reviewYourJob') || 'Review Your Job'}</Text>
                    <Text style={styles.summaryHeaderSubtitle}>
                        {t('reviewJobDetailsMessage') || 'Please review all the details before posting your job'}
                    </Text>
                </View>

                {/* Job Title Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#E8F4FD' }]}>
                            <Ionicons name="briefcase" size={18} color="#246BFD" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('jobTitle') || 'Job Title'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>{addJob?.job_title || notProvided}</Text>
                </View>

                {/* Location & Route Row */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, styles.summaryCardHalf]}>
                        <View style={styles.summaryCardHeader}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#E8F8F0' }]}>
                                <Ionicons name="location" size={18} color="#10B981" />
                            </View>
                            <Text style={styles.summaryCardTitle}>{t('location') || 'Location'}</Text>
                            <EditButton />
                        </View>
                        <Text style={styles.summaryCardValue}>{addJob?.job_location || notProvided}</Text>
                    </View>

                    <View style={[styles.summaryCard, styles.summaryCardHalf]}>
                        <View style={styles.summaryCardHeader}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#EBF4FF' }]}>
                                <Ionicons name="map" size={18} color="#3B82F6" />
                            </View>
                            <Text style={styles.summaryCardTitle}>{t('route') || 'Route'}</Text>
                            <EditButton />
                        </View>
                        <Text style={styles.summaryCardValue} numberOfLines={2}>
                            {addJob?.route || notProvided}
                        </Text>
                    </View>
                </View>

                {/* Vehicle Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF3E8' }]}>
                            <Ionicons name="car" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('vehicle') || 'Vehicle'}</Text>
                        <EditButton />
                    </View>
                    {getVehicleImage(addJob?.vehicle_type) && (
                        <Image
                            source={getVehicleImage(addJob?.vehicle_type)}
                            style={styles.summaryVehicleImage}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={[styles.summaryCardValue, { fontSize: 13, marginTop: 4 }]}>
                        {addJob?.vehicle_type || notProvided}
                    </Text>
                </View>

                {/* Experience & Salary Row */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, styles.summaryCardHalf]}>
                        <View style={styles.summaryCardHeader}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#F3E8FF' }]}>
                                <Ionicons name="time" size={18} color="#8B5CF6" />
                            </View>
                            <Text style={styles.summaryCardTitle}>{t('experience') || 'Experience'}</Text>
                            <EditButton />
                        </View>
                        <Text style={styles.summaryCardValue}>
                            {getExperienceLabel(addJob?.Required_Experience) || notProvided}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardHalf]}>
                        <View style={styles.summaryCardHeader}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#E8FDF0' }]}>
                                <Ionicons name="cash" size={18} color="#059669" />
                            </View>
                            <Text style={styles.summaryCardTitle}>{t('fixedSalary') || 'Fixed Salary'}</Text>
                            <EditButton />
                        </View>
                        <Text style={styles.summaryCardValue}>
                            {getSalaryLabel(addJob?.Salary_Range) || notProvided}
                        </Text>
                    </View>
                </View>

                {/* ESI/PF Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#F0F9FF' }]}>
                            <Ionicons name="shield-checkmark" size={18} color="#0EA5E9" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('esiPf') || 'ESI/PF'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.esi_pf === 'yes' ? (t('yes') || 'Yes') : addJob?.esi_pf === 'no' ? (t('no') || 'No') : notProvided}
                    </Text>
                </View>

                {/* Food Allowance Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF3E2' }]}>
                            <Ionicons name="restaurant" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('foodAllowance') || 'Food Allowance'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.food_allowance === 'yes'
                            ? `${t('yes') || 'Yes'}${addJob?.food_allowance_desc ? ` - ₹${addJob.food_allowance_desc}/day` : ''}`
                            : addJob?.food_allowance === 'no'
                                ? (t('no') || 'No')
                                : notProvided}
                    </Text>
                </View>

                {/* Trip Incentive Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#F0FDF4' }]}>
                            <Ionicons name="gift" size={18} color="#16A34A" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('tripIncentive') || 'Trip Incentive'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.trip_incentive === 'yes'
                            ? `${t('yes') || 'Yes'}${addJob?.trip_incentive_desc ? ` - ₹${addJob.trip_incentive_desc}/day` : ''}`
                            : addJob?.trip_incentive === 'no'
                                ? (t('no') || 'No')
                                : notProvided}
                    </Text>
                </View>

                {/* Accommodation Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="home" size={18} color="#6366F1" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('accommodationFacility') || 'Accommodation Facility'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.rahane_ki_suvidha === 'yes' ? (t('yes') || 'Yes') : addJob?.rahane_ki_suvidha === 'no' ? (t('no') || 'No') : notProvided}
                    </Text>
                </View>

                {/* Mileage Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#F0F9FF' }]}>
                            <Ionicons name="speedometer" size={18} color="#0EA5E9" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('mileageRequired') || 'Mileage Required'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.mileage === 'yes'
                            ? `${t('yes') || 'Yes'}${addJob?.mileage_desc ? ` - ${addJob.mileage_desc} km/l` : ''}`
                            : addJob?.mileage === 'no'
                                ? (t('no') || 'No')
                                : notProvided}
                    </Text>
                </View>

                {/* FASTag/Road Kharcha Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF3E2' }]}>
                            <Ionicons name="card" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('fastagRoadKharcha') || 'FASTag/Road Kharcha'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.fast_tag_road_kharcha === 'yes'
                            ? `${t('yes') || 'Yes'}${addJob?.fast_tag_road_kharcha_desc ? ` - ₹${addJob.fast_tag_road_kharcha_desc}` : ''}`
                            : addJob?.fast_tag_road_kharcha === 'no'
                                ? (t('no') || 'No')
                                : notProvided}
                    </Text>
                </View>

                {/* License & Drivers Count Row */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, styles.summaryCardHalf]}>
                        <View style={styles.summaryCardHeader}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#FEE8E8' }]}>
                                <Ionicons name="card" size={18} color="#EF4444" />
                            </View>
                            <Text style={styles.summaryCardTitle}>{t('license') || 'License'}</Text>
                            <EditButton />
                        </View>
                        <Text style={styles.summaryCardValue}>
                            {getLicenseLabel(addJob?.Type_of_License) || notProvided}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardHalf]}>
                        <View style={styles.summaryCardHeader}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#E8F0FE' }]}>
                                <Ionicons name="people" size={18} color="#3B82F6" />
                            </View>
                            <Text style={styles.summaryCardTitle}>{t('drivers') || 'Drivers'}</Text>
                            <EditButton />
                        </View>
                        <Text style={styles.summaryCardValue}>
                            {addJob?.Job_Management || notProvided}
                        </Text>
                    </View>
                </View>

                {/* Deadline Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#FFF3E8' }]}>
                            <Ionicons name="calendar" size={18} color="#F97316" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('applicationDeadline') || 'Application Deadline'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.Application_Deadline
                            ? moment(addJob.Application_Deadline).format('DD MMMM YYYY')
                            : notProvided
                        }
                    </Text>
                </View>

                {/* Skills Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#E8F4FD' }]}>
                            <Ionicons name="construct" size={18} color="#246BFD" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('preferredSkills') || 'Preferred Skills'}</Text>
                        <EditButton />
                    </View>
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
                </View>

                {/* Description Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#F3E8FF' }]}>
                            <Ionicons name="document-text" size={18} color="#8B5CF6" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('jobDescriptionTitle') || 'Job Description'}</Text>
                        <EditButton />
                    </View>
                    <Text style={[styles.summaryCardValue, styles.summaryDescription]}>
                        {addJob?.Job_Description || notProvided}
                    </Text>
                </View>

                {/* Truck Condition Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryIconContainer, { backgroundColor: '#FEF3E2' }]}>
                            <Ionicons name="build" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.summaryCardTitle}>{t('truckCondition') || 'Truck Condition'}</Text>
                        <EditButton />
                    </View>
                    <Text style={styles.summaryCardValue}>
                        {addJob?.truck_condition ? (
                            (() => {
                                const conditionLabels: { [key: string]: string } = {
                                    'excellent': t('excellent') || 'Excellent (New/Very well maintained)',
                                    'good': t('good') || 'Good (Regularly serviced)',
                                    'average': t('average') || 'Average (Working condition)',
                                    'old_running': t('old_running') || 'Old but Running',
                                    'road_ready': t('road_ready') || 'Made Road Ready after joining'
                                };
                                return conditionLabels[addJob.truck_condition] || addJob.truck_condition;
                            })()
                        ) : notProvided}
                    </Text>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    summaryHeader: {
        marginBottom: 20,
    },
    summaryHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 6,
    },
    summaryHeaderSubtitle: {
        fontSize: 13,
        color: '#6C757D',
        lineHeight: 20,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryCardHalf: {
        flex: 1,
        marginHorizontal: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        marginHorizontal: -5,
        marginBottom: 0,
    },
    summaryCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    summaryCardTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6C757D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flex: 1,
    },
    summaryCardValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212529',
        marginLeft: 48,
        lineHeight: 22,
    },
    summaryVehicleImage: {
        width: '100%',
        height: 60,
        marginTop: 4,
        marginBottom: 4,
    },
    summarySkillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 48,
        marginTop: 0,
    },
    summarySkillChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F5FF',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    summarySkillText: {
        fontSize: 12,
        color: '#246BFD',
        fontWeight: '500',
        marginLeft: 5,
    },
    summaryDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: '#495057',
        fontWeight: '400',
    },
    editButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
