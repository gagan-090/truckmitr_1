import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Modal,
    FlatList,
    Image,
    Pressable,
} from 'react-native';
import { useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigatorParams } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { jobAddAction } from '@truckmitr/src/redux/actions/user.action';
import { Dropdown } from 'react-native-element-dropdown';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
type EditJobRouteProp = RouteProp<NavigatorParams, 'editJob'>;

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

// Step config - moved outside component
const STEP_TITLES: { [key: string]: string } = {
    job_title: 'jobTitle', job_location: 'jobLocation', route: 'route', vehicle_type: 'vehicleType',
    experience: 'experienceInYears', license_type: 'typeOfLicense', preferred_skills: 'preferredSkills',
    salary_range: 'fixedSalary', esi_pf: 'esiPf', food_allowance: 'foodAllowance', trip_incentive: 'tripIncentive',
    accommodation: 'accommodationFacility', mileage: 'mileageRequired', fastag: 'fastagRoadKharcha',
    drivers_count: 'numberOfDrivers', job_description: 'jobDescriptionTitle', truck_condition: 'truckCondition', deadline: 'applicationDeadline',
};

const STEP_ICONS: { [key: string]: string } = {
    job_title: 'briefcase-outline', job_location: 'location-outline', route: 'map-outline', vehicle_type: 'car-outline',
    experience: 'time-outline', license_type: 'card-outline', preferred_skills: 'construct-outline', salary_range: 'cash-outline',
    esi_pf: 'shield-checkmark-outline', food_allowance: 'restaurant-outline', trip_incentive: 'gift-outline', accommodation: 'home-outline',
    mileage: 'speedometer-outline', fastag: 'card-outline', drivers_count: 'people-outline', job_description: 'document-text-outline',
    truck_condition: 'build-outline', deadline: 'calendar-outline',
};

const STEP_SUBTITLES: { [key: string]: string } = {
    job_title: 'enterJobTitleHint', job_location: 'selectJobLocationHint', route: 'enterRouteHint', vehicle_type: 'selectVehicleTypeHint',
    experience: 'selectExperienceHint', license_type: 'selectLicenseTypeHint', preferred_skills: 'selectPreferredSkillsHint',
    salary_range: 'selectSalaryRangeHint', esi_pf: 'selectEsiPfHint', food_allowance: 'selectFoodAllowanceHint',
    trip_incentive: 'selectTripIncentiveHint', accommodation: 'selectAccommodationHint', mileage: 'selectMileageHint',
    fastag: 'selectFastagHint', drivers_count: 'enterDriversCountHint', job_description: 'writeDescriptionHint',
    truck_condition: 'selectTruckConditionHint', deadline: 'selectDeadlineHint',
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
    { label: '₹20,000 - 25,000', value: '20000-25000' }, { label: '₹25,000 - 30,000', value: '25000-30000' },
    { label: '₹30,000 - 35,000', value: '30000-35000' }, { label: '₹35,000 - 40,000', value: '35000-40000' },
    { label: '₹40,000 - 50,000', value: '40000-50000' }, { label: '₹50,000+', value: '50000+' },
];

const licenseTypes = [
    { label: 'LMV (Light)', value: 'LMV', emoji: '🚗' }, { label: 'HMV (Heavy)', value: 'HMV', emoji: '🚛' },
    { label: 'HGMV (Goods)', value: 'HGMV', emoji: '📦' }, { label: 'HPMV/HTV', value: 'HPMV/HTV', emoji: '🚚' },
];

const operationalSegments = [
    { id: 'ecommerce', label: 'E-commerce', emoji: '📦' }, { id: 'white_goods', label: 'White Goods', emoji: '🏠' },
    { id: 'livestock', label: 'Livestock', emoji: '🐄' }, { id: 'perishable', label: 'Perishable', emoji: '🍎' },
    { id: 'oversized', label: 'Oversized', emoji: '📏' }, { id: 'fuel_tanker', label: 'Fuel Tanker', emoji: '⛽' },
    { id: 'automobile', label: 'Automobile Carrier', emoji: '🚗' }, { id: 'construction', label: 'Construction', emoji: '🏗️' },
    { id: 'refrigerator', label: 'Refrigerator Vehicle', emoji: '❄️' }, { id: 'others', label: 'Others', emoji: '📋' },
];

const truckConditions = [
    { value: 'excellent', titleKey: 'excellent', title: 'Excellent', desc: 'New/Very well maintained' },
    { value: 'good', titleKey: 'good', title: 'Good', desc: 'Regularly serviced' },
    { value: 'average', titleKey: 'average', title: 'Average', desc: 'Working condition' },
    { value: 'old_running', titleKey: 'old_running', title: 'Old but Running', desc: '' },
    { value: 'road_ready', titleKey: 'road_ready', title: 'Made Road Ready', desc: 'After joining' },
];

// Memoized Vehicle Tile for instant response
const VehicleTile = memo(({ vehicle, isSelected, onSelect }: { vehicle: any; isSelected: boolean; onSelect: () => void }) => (
    <Pressable 
        style={({ pressed }) => [styles.vehicleTile, isSelected && styles.vehicleTileSelected, pressed && styles.pressedTile]}
        onPress={onSelect}
        android_ripple={{ color: '#E0E7FF', borderless: false }}
    >
        <Image source={vehicle.image} style={styles.vehicleImage} resizeMode="contain" />
        <Text style={[styles.vehicleLabel, isSelected && styles.vehicleLabelSelected]}>{vehicle.label}</Text>
        {isSelected && <View style={styles.vehicleCheckmark}><Ionicons name="checkmark-circle" size={20} color="#246BFD" /></View>}
    </Pressable>
));

// Memoized Experience Tile
const ExperienceTile = memo(({ exp, isSelected, onSelect, label }: { exp: any; isSelected: boolean; onSelect: () => void; label: string }) => (
    <Pressable style={({ pressed }) => [styles.experienceTile, isSelected && styles.experienceTileSelected, pressed && styles.pressedTile]}
        onPress={onSelect} android_ripple={{ color: '#E0E7FF', borderless: false }}>
        <Text style={[styles.experienceTileText, isSelected && styles.experienceTileTextSelected]}>{label}</Text>
    </Pressable>
));

// Memoized Salary Tile
const SalaryTile = memo(({ salary, isSelected, onSelect }: { salary: any; isSelected: boolean; onSelect: () => void }) => (
    <Pressable style={({ pressed }) => [styles.salaryTile, isSelected && styles.salaryTileSelected, pressed && styles.pressedTile]}
        onPress={onSelect} android_ripple={{ color: '#E0E7FF', borderless: false }}>
        <Text style={[styles.salaryTileText, isSelected && styles.salaryTileTextSelected]}>{salary.label}</Text>
        {isSelected && <Ionicons name="checkmark-circle" size={16} color="#246BFD" style={{ marginLeft: 4 }} />}
    </Pressable>
));

// Memoized Skill Chip
const SkillChip = memo(({ skill, isSelected, onToggle }: { skill: any; isSelected: boolean; onToggle: () => void }) => (
    <Pressable style={({ pressed }) => [styles.skillChip, isSelected && styles.skillChipSelected, pressed && styles.pressedTile]}
        onPress={onToggle} android_ripple={{ color: '#E0E7FF', borderless: false }}>
        <Text style={{ fontSize: 16, marginRight: 6 }}>{skill.emoji}</Text>
        <Text style={[styles.skillChipText, isSelected && styles.skillChipTextSelected]}>{skill.label}</Text>
        <Ionicons name={isSelected ? "checkmark" : "add"} size={14} color={isSelected ? "#246BFD" : "#666"} style={{ marginLeft: 4 }} />
    </Pressable>
));

export default function EditJob() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useStatusBarStyle('dark-content');
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigatorProp>();
    const route = useRoute<EditJobRouteProp>();
    const { addJob } = useSelector((state: any) => state?.job);

    const stepId = route.params?.stepId || 'job_title';
    const stepTitle = STEP_TITLES[stepId] || 'editJob';
    const stepIcon = STEP_ICONS[stepId] || 'create-outline';
    const stepSubtitle = STEP_SUBTITLES[stepId] || '';

    const [locationsList, setLocationsList] = useState<any[]>([]);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [pincode, setPincode] = useState(addJob?.pincode || '');
    const [pincodeAreas, setPincodeAreas] = useState<any[]>([]);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [pincodeError, setPincodeError] = useState('');
    const [selectedArea, setSelectedArea] = useState<string | null>(addJob?.area || null);

    useEffect(() => {
        if (stepId === 'job_location') {
            fetchLocations();
            if (addJob?.pincode) fetchAreasByPincode(addJob.pincode);
        }
    }, [stepId]);

    const fetchLocations = useCallback(async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.GETSTATES);
            if (response?.data?.status) setLocationsList(response?.data?.data);
        } catch (error) { console.log('Error fetching locations:', error); }
    }, []);

    const fetchAreasByPincode = useCallback(async (pincodeValue: string) => {
        if (pincodeValue.length !== 6) { setPincodeAreas([]); setPincodeError(''); return; }
        setPincodeLoading(true); setPincodeError('');
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincodeValue}`);
            const data = await response.json();
            if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice) {
                setPincodeAreas(data[0].PostOffice.map((po: any) => ({ label: po.Name, value: po.Name, district: po.District, state: po.State })));
            } else { setPincodeError(t('invalidPincode') || 'Invalid pincode'); }
        } catch (error) { setPincodeError(t('pincodeApiError') || 'Error fetching pincode data'); }
        finally { setPincodeLoading(false); }
    }, [t]);

    const handlePincodeChange = useCallback((text: string) => {
        const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
        setPincode(numericText);
        if (numericText.length === 6) fetchAreasByPincode(numericText);
        else { setPincodeAreas([]); setPincodeError(''); setSelectedArea(null); }
    }, [fetchAreasByPincode]);

    const toggleSkill = useCallback((label: string) => {
        const current = addJob?.Preferred_Skills || [];
        const newSkills = current.includes(label) ? current.filter((i: string) => i !== label) : [...current, label];
        dispatch(jobAddAction({ ...addJob, Preferred_Skills: newSkills }));
    }, [addJob, dispatch]);

    const handleUpdate = useCallback(() => navigation.goBack(), [navigation]);
    const goBack = useCallback(() => navigation.goBack(), [navigation]);
    const openLocationModal = useCallback(() => setLocationModalOpen(true), []);
    const closeLocationModal = useCallback(() => setLocationModalOpen(false), []);
    const openDatePicker = useCallback(() => setDatePickerOpen(true), []);
    const closeDatePicker = useCallback(() => setDatePickerOpen(false), []);

    const updateJob = useCallback((updates: any) => {
        dispatch(jobAddAction({ ...addJob, ...updates }));
    }, [addJob, dispatch]);

    // Immediate update for visual feedback (used for selections)
    const updateJobImmediate = useCallback((updates: any) => {
        dispatch(jobAddAction({ ...addJob, ...updates }));
    }, [addJob, dispatch]);

    const yesText = useMemo(() => t('yes') || 'Yes', [t]);
    const noText = useMemo(() => t('no') || 'No', [t]);

    const renderStepContent = () => {
        switch (stepId) {
            case 'job_title':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('jobTitle') || 'Job Title'}</Text>
                        <Text style={styles.helperText}>{t('jobTitleHintDetail') || 'Enter a clear and descriptive job title'}</Text>
                        <TextInput style={[styles.classicInput, styles.largeInput]} placeholder={t('jobTitlePlaceholder') || "e.g. Long Haul Truck Driver"}
                            placeholderTextColor="#999" value={addJob?.job_title || ''} onChangeText={(text) => updateJob({ job_title: text })} multiline />
                    </View>
                );
            case 'job_location':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('jobLocation') || 'Job Location'}</Text>
                        <Text style={styles.helperText}>{t('jobLocationHintDetail') || 'Select the state where the job is located'}</Text>
                        <Pressable style={({ pressed }) => [styles.classicBox, pressed && styles.pressedBox]} onPress={openLocationModal}>
                            <Text style={[styles.classicBoxText, !addJob?.job_location && { color: '#999' }]}>{addJob?.job_location || t('selectLocation') || 'Select Location'}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </Pressable>
                        <View style={styles.pincodeSection}>
                            <Text style={styles.conditionalLabel}>{t('enterPincode') || 'Enter Pincode'}</Text>
                            <TextInput style={styles.amountInput} placeholder="Enter 6 digit pincode" placeholderTextColor="#999" value={pincode} onChangeText={handlePincodeChange} keyboardType="numeric" maxLength={6} />
                            {pincodeLoading && <ActivityIndicator size="small" color="#246BFD" style={{ marginTop: 8 }} />}
                            {pincodeError ? <Text style={styles.pincodeErrorText}>{pincodeError}</Text> : null}
                            {pincodeAreas.length > 0 && (
                                <View style={{ marginTop: 12 }}>
                                    <Text style={styles.conditionalLabel}>{t('selectArea') || 'Select Area'}</Text>
                                    <Dropdown style={styles.dropdown} data={pincodeAreas} labelField="label" valueField="value" placeholder="Select Area" value={selectedArea}
                                        placeholderStyle={styles.dropdownPlaceholder} selectedTextStyle={styles.dropdownSelectedText}
                                        onChange={item => { setSelectedArea(item.value); updateJob({ pincode, area: item.value, area_district: item.district, area_state: item.state }); }} />
                                </View>
                            )}
                        </View>
                    </View>
                );
            case 'route':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('route') || 'Route'}</Text>
                        <Text style={styles.helperText}>{t('routeHintDetail') || 'Enter the route for this job'}</Text>
                        <TextInput style={[styles.classicInput, styles.largeInput]} placeholder={t('enterRoute') || 'Enter route (e.g., Delhi to Mumbai)'}
                            placeholderTextColor="#999" value={addJob?.route || ''} onChangeText={(text) => updateJob({ route: text })} multiline />
                    </View>
                );
            case 'vehicle_type':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('vehicleType') || 'Vehicle Type'}</Text>
                        <Text style={styles.helperText}>{t('vehicleTypeHintDetail') || 'Select the type of vehicle required'}</Text>
                        <View style={styles.vehicleGrid}>
                            {vehicleTypes.map((vehicle) => (
                                <VehicleTile
                                    key={vehicle.value}
                                    vehicle={vehicle}
                                    isSelected={addJob?.vehicle_type === vehicle.value}
                                    onSelect={() => updateJobImmediate({ vehicle_type: vehicle.value })}
                                />
                            ))}
                        </View>
                    </View>
                );

            case 'experience':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('experienceRequired') || 'Experience Required'}</Text>
                        <Text style={styles.helperText}>{t('selectExperienceHintDetail') || 'Select the minimum experience required'}</Text>
                        <View style={styles.gridContainer}>
                            {drivingExperienceArray.map((expItem) => (
                                <ExperienceTile
                                    key={expItem.value}
                                    exp={expItem}
                                    isSelected={addJob?.Required_Experience === expItem.value}
                                    onSelect={() => updateJobImmediate({ Required_Experience: expItem.value })}
                                    label={t(expItem.labelKey) || expItem.label}
                                />
                            ))}
                        </View>
                    </View>
                );
            case 'license_type':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('typeOfLicense') || 'Type of License'}</Text>
                        <Text style={styles.helperText}>{t('selectLicenseHintDetail') || 'Select the license type required'}</Text>
                        <View>
                            {licenseTypes.map((license) => {
                                const isSelected = addJob?.Type_of_License === license.value;
                                return (
                                    <Pressable key={license.value} style={({ pressed }) => [styles.endorsementTile, isSelected && styles.endorsementTileSelected, pressed && styles.pressedTile]}
                                        onPress={() => updateJobImmediate({ Type_of_License: license.value })}>
                                        <View style={[styles.endorsementIcon, isSelected && { backgroundColor: '#246BFD' }]}><Text style={{ fontSize: 22 }}>{license.emoji}</Text></View>
                                        <View style={{ flex: 1 }}><Text style={[styles.endorsementLabel, isSelected && { color: '#246BFD' }]}>{license.label}</Text></View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#246BFD" />}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                );
            case 'preferred_skills':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('preferredSkills') || 'Preferred Skills'}</Text>
                        <Text style={styles.helperText}>{t('selectSkillsHintDetail') || 'Select all skills that apply'}</Text>
                        <View style={styles.skillsGrid}>
                            {operationalSegments.map((skill) => (
                                <SkillChip
                                    key={skill.id}
                                    skill={skill}
                                    isSelected={addJob?.Preferred_Skills?.includes(skill.label)}
                                    onToggle={() => toggleSkill(skill.label)}
                                />
                            ))}
                        </View>
                    </View>
                );
            case 'salary_range':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('fixedSalary') || 'Fixed Salary'}</Text>
                        <Text style={styles.helperText}>{t('selectSalaryHintDetail') || 'Select the monthly salary range'}</Text>
                        <View style={styles.gridContainer}>
                            {salaryRanges.map((salary) => (
                                <SalaryTile
                                    key={salary.value}
                                    salary={salary}
                                    isSelected={addJob?.Salary_Range === salary.value}
                                    onSelect={() => updateJobImmediate({ Salary_Range: salary.value })}
                                />
                            ))}
                        </View>
                    </View>
                );

            case 'esi_pf':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('esiPf') || 'ESI/PF Benefits'}</Text>
                        <Text style={styles.helperText}>{t('esiPfHintDetail') || 'Will you provide ESI/PF benefits?'}</Text>
                        <View style={styles.radioContainer}>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.esi_pf === 'yes' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ esi_pf: 'yes' })}>
                                <View style={[styles.radioCircle, addJob?.esi_pf === 'yes' && styles.radioCircleSelected]}>{addJob?.esi_pf === 'yes' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.esi_pf === 'yes' && styles.radioTextSelected]}>{yesText}</Text>
                            </Pressable>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.esi_pf === 'no' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ esi_pf: 'no' })}>
                                <View style={[styles.radioCircle, addJob?.esi_pf === 'no' && styles.radioCircleSelected]}>{addJob?.esi_pf === 'no' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.esi_pf === 'no' && styles.radioTextSelected]}>{noText}</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            case 'food_allowance':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('foodAllowance') || 'Food Allowance'}</Text>
                        <Text style={styles.helperText}>{t('foodAllowanceHintDetail') || 'Will you provide food allowance?'}</Text>
                        <View style={styles.radioContainer}>
                            <View>
                                <Pressable style={({ pressed }) => [styles.radioOption, addJob?.food_allowance === 'yes' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                    onPress={() => updateJobImmediate({ food_allowance: 'yes' })}>
                                    <View style={[styles.radioCircle, addJob?.food_allowance === 'yes' && styles.radioCircleSelected]}>{addJob?.food_allowance === 'yes' && <View style={styles.radioInner} />}</View>
                                    <Text style={[styles.radioText, addJob?.food_allowance === 'yes' && styles.radioTextSelected]}>{yesText}</Text>
                                </Pressable>
                                {addJob?.food_allowance === 'yes' && (
                                    <View style={styles.conditionalInputInline}>
                                        <Text style={styles.conditionalLabel}>{t('enterAmountPerDay') || 'Enter Amount (₹/day)'}</Text>
                                        <TextInput style={styles.amountInput} placeholder={t('enterFoodAllowanceAmount') || '₹ Enter amount'} placeholderTextColor="#999"
                                            value={addJob?.food_allowance_desc || ''} keyboardType="numeric" onChangeText={(text) => updateJob({ food_allowance_desc: text })} />
                                    </View>
                                )}
                            </View>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.food_allowance === 'no' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ food_allowance: 'no', food_allowance_desc: '' })}>
                                <View style={[styles.radioCircle, addJob?.food_allowance === 'no' && styles.radioCircleSelected]}>{addJob?.food_allowance === 'no' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.food_allowance === 'no' && styles.radioTextSelected]}>{noText}</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            case 'trip_incentive':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('tripIncentive') || 'Trip Incentive'}</Text>
                        <Text style={styles.helperText}>{t('tripIncentiveHintDetail') || 'Will you provide trip incentive?'}</Text>
                        <View style={styles.radioContainer}>
                            <View>
                                <Pressable style={({ pressed }) => [styles.radioOption, addJob?.trip_incentive === 'yes' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                    onPress={() => updateJobImmediate({ trip_incentive: 'yes' })}>
                                    <View style={[styles.radioCircle, addJob?.trip_incentive === 'yes' && styles.radioCircleSelected]}>{addJob?.trip_incentive === 'yes' && <View style={styles.radioInner} />}</View>
                                    <Text style={[styles.radioText, addJob?.trip_incentive === 'yes' && styles.radioTextSelected]}>{yesText}</Text>
                                </Pressable>
                                {addJob?.trip_incentive === 'yes' && (
                                    <View style={styles.conditionalInputInline}>
                                        <Text style={styles.conditionalLabel}>{t('enterAmountPerDay') || 'Enter Amount (₹/day)'}</Text>
                                        <TextInput style={styles.amountInput} placeholder={t('enterTripIncentiveAmount') || '₹ Enter amount'} placeholderTextColor="#999"
                                            value={addJob?.trip_incentive_desc || ''} keyboardType="numeric" onChangeText={(text) => updateJob({ trip_incentive_desc: text })} />
                                    </View>
                                )}
                            </View>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.trip_incentive === 'no' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ trip_incentive: 'no', trip_incentive_desc: '' })}>
                                <View style={[styles.radioCircle, addJob?.trip_incentive === 'no' && styles.radioCircleSelected]}>{addJob?.trip_incentive === 'no' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.trip_incentive === 'no' && styles.radioTextSelected]}>{noText}</Text>
                            </Pressable>
                        </View>
                    </View>
                );

            case 'accommodation':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('accommodationFacility') || 'Accommodation Facility'}</Text>
                        <Text style={styles.helperText}>{t('accommodationHintDetail') || 'Will you provide accommodation?'}</Text>
                        <View style={styles.radioContainer}>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.rahane_ki_suvidha === 'yes' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ rahane_ki_suvidha: 'yes' })}>
                                <View style={[styles.radioCircle, addJob?.rahane_ki_suvidha === 'yes' && styles.radioCircleSelected]}>{addJob?.rahane_ki_suvidha === 'yes' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.rahane_ki_suvidha === 'yes' && styles.radioTextSelected]}>{yesText}</Text>
                            </Pressable>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.rahane_ki_suvidha === 'no' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ rahane_ki_suvidha: 'no' })}>
                                <View style={[styles.radioCircle, addJob?.rahane_ki_suvidha === 'no' && styles.radioCircleSelected]}>{addJob?.rahane_ki_suvidha === 'no' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.rahane_ki_suvidha === 'no' && styles.radioTextSelected]}>{noText}</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            case 'mileage':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('mileageRequired') || 'Mileage Required'}</Text>
                        <Text style={styles.helperText}>{t('mileageHintDetail') || 'Do you require mileage tracking?'}</Text>
                        <View style={styles.radioContainer}>
                            <View>
                                <Pressable style={({ pressed }) => [styles.radioOption, addJob?.mileage === 'yes' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                    onPress={() => updateJobImmediate({ mileage: 'yes' })}>
                                    <View style={[styles.radioCircle, addJob?.mileage === 'yes' && styles.radioCircleSelected]}>{addJob?.mileage === 'yes' && <View style={styles.radioInner} />}</View>
                                    <Text style={[styles.radioText, addJob?.mileage === 'yes' && styles.radioTextSelected]}>{yesText}</Text>
                                </Pressable>
                                {addJob?.mileage === 'yes' && (
                                    <View style={styles.conditionalInputInline}>
                                        <Text style={styles.conditionalLabel}>{t('expectedMileageKmPerLiter') || 'Expected Mileage (km/l)'}</Text>
                                        <TextInput style={styles.amountInput} placeholder={t('enterMileageAmount') || 'Enter km per liter'} placeholderTextColor="#999"
                                            value={addJob?.mileage_desc || ''} keyboardType="numeric" onChangeText={(text) => updateJob({ mileage_desc: text })} />
                                    </View>
                                )}
                            </View>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.mileage === 'no' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ mileage: 'no', mileage_desc: '' })}>
                                <View style={[styles.radioCircle, addJob?.mileage === 'no' && styles.radioCircleSelected]}>{addJob?.mileage === 'no' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.mileage === 'no' && styles.radioTextSelected]}>{noText}</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            case 'fastag':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('fastagRoadKharcha') || 'FASTag/Road Kharcha'}</Text>
                        <Text style={styles.helperText}>{t('fastagHintDetail') || 'Will you provide FASTag/Road expenses?'}</Text>
                        <View style={styles.radioContainer}>
                            <View>
                                <Pressable style={({ pressed }) => [styles.radioOption, addJob?.fast_tag_road_kharcha === 'yes' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                    onPress={() => updateJobImmediate({ fast_tag_road_kharcha: 'yes' })}>
                                    <View style={[styles.radioCircle, addJob?.fast_tag_road_kharcha === 'yes' && styles.radioCircleSelected]}>{addJob?.fast_tag_road_kharcha === 'yes' && <View style={styles.radioInner} />}</View>
                                    <Text style={[styles.radioText, addJob?.fast_tag_road_kharcha === 'yes' && styles.radioTextSelected]}>{yesText}</Text>
                                </Pressable>
                                {addJob?.fast_tag_road_kharcha === 'yes' && (
                                    <View style={styles.conditionalInputInline}>
                                        <Text style={styles.conditionalLabel}>{t('enterAmountRs') || 'Enter Amount (₹)'}</Text>
                                        <TextInput style={styles.amountInput} placeholder={t('enterFastagAmount') || '₹ Enter amount'} placeholderTextColor="#999"
                                            value={addJob?.fast_tag_road_kharcha_desc || ''} keyboardType="numeric" onChangeText={(text) => updateJob({ fast_tag_road_kharcha_desc: text })} />
                                    </View>
                                )}
                            </View>
                            <Pressable style={({ pressed }) => [styles.radioOption, addJob?.fast_tag_road_kharcha === 'no' && styles.radioOptionSelected, pressed && styles.pressedTile]}
                                onPress={() => updateJobImmediate({ fast_tag_road_kharcha: 'no', fast_tag_road_kharcha_desc: '' })}>
                                <View style={[styles.radioCircle, addJob?.fast_tag_road_kharcha === 'no' && styles.radioCircleSelected]}>{addJob?.fast_tag_road_kharcha === 'no' && <View style={styles.radioInner} />}</View>
                                <Text style={[styles.radioText, addJob?.fast_tag_road_kharcha === 'no' && styles.radioTextSelected]}>{noText}</Text>
                            </Pressable>
                        </View>
                    </View>
                );

            case 'drivers_count':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('numberOfDrivers') || 'Number of Drivers'}</Text>
                        <Text style={styles.helperText}>{t('driversCountHintDetail') || 'How many drivers do you need?'}</Text>
                        <TextInput style={styles.classicInput} placeholder="Enter number of drivers" placeholderTextColor="#999"
                            value={addJob?.Job_Management || ''} keyboardType="numeric" onChangeText={(text) => updateJob({ Job_Management: text })} />
                    </View>
                );
            case 'job_description':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('jobDescriptionTitle') || 'Job Description'}</Text>
                        <Text style={styles.helperText}>{t('jobDescriptionHintDetail') || 'Describe the job requirements'}</Text>
                        <TextInput style={[styles.classicInput, styles.textArea]} placeholder="Enter job description..." placeholderTextColor="#999"
                            value={addJob?.Job_Description || ''} multiline numberOfLines={6} textAlignVertical="top" onChangeText={(text) => updateJob({ Job_Description: text })} />
                    </View>
                );
            case 'truck_condition':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('truckCondition') || 'Truck Condition'}</Text>
                        <Text style={styles.helperText}>{t('truckConditionHintDetail') || 'Select the expected truck condition'}</Text>
                        {truckConditions.map((condition) => {
                            const isSelected = addJob?.truck_condition === condition.value;
                            return (
                                <Pressable key={condition.value} style={({ pressed }) => [styles.conditionOption, isSelected && styles.conditionOptionSelected, pressed && styles.pressedTile]}
                                    onPress={() => updateJobImmediate({ truck_condition: condition.value })}>
                                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>{isSelected && <View style={styles.radioInner} />}</View>
                                    <View style={styles.conditionTextContainer}>
                                        <Text style={[styles.conditionTitle, isSelected && { color: '#246BFD' }]}>{t(condition.titleKey) || condition.title}</Text>
                                        {condition.desc ? <Text style={styles.conditionDesc}>{condition.desc}</Text> : null}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                );
            case 'deadline':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('applicationDeadline') || 'Application Deadline'}</Text>
                        <Text style={styles.helperText}>{t('selectDeadlineHintDetail') || 'Set the last date to accept applications'}</Text>
                        <Pressable style={({ pressed }) => [styles.classicBox, pressed && styles.pressedBox]} onPress={openDatePicker}>
                            <Text style={[styles.classicBoxText, !addJob?.Application_Deadline && { color: '#999' }]}>
                                {addJob?.Application_Deadline ? moment(addJob.Application_Deadline).format('DD MMMM YYYY') : t('selectDate') || 'Select Date'}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </Pressable>
                    </View>
                );
            default:
                return <Text>Unknown step</Text>;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <View style={styles.header}>
                <Pressable onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#212529" />
                </Pressable>
                <Text style={styles.headerTitle}>{t('edit') || 'Edit'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.stepHeader}>
                    <View style={styles.stepIconContainer}><Ionicons name={stepIcon as any} size={24} color="#FFF" /></View>
                    <View style={styles.stepHeaderText}>
                        <Text style={styles.stepTitle}>{t(stepTitle) || 'Edit'}</Text>
                        <Text style={styles.stepSubtitle}>{t(stepSubtitle) || ''}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                {renderStepContent()}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: safeAreaInsets.bottom + 16 }]}>
                <Pressable style={({ pressed }) => [styles.updateButton, pressed && styles.updateButtonPressed]} onPress={handleUpdate}>
                    <Text style={styles.updateButtonText}>{t('update') || 'Update'}</Text>
                </Pressable>
            </View>

            <Modal visible={locationModalOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('selectLocation') || 'Select Location'}</Text>
                            <Pressable onPress={closeLocationModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Ionicons name="close" size={24} color="#333" /></Pressable>
                        </View>
                        <FlatList data={locationsList} keyExtractor={(item) => item.id.toString()} initialNumToRender={15} maxToRenderPerBatch={10}
                            renderItem={({ item }) => (
                                <Pressable style={({ pressed }) => [styles.locationItem, pressed && { backgroundColor: '#F5F5F5' }]}
                                    onPress={() => { updateJob({ job_location: item.name }); closeLocationModal(); }}>
                                    <Text style={styles.locationText}>{item.name}</Text>
                                    {addJob?.job_location === item.name && <Ionicons name="checkmark" size={20} color="#246BFD" />}
                                </Pressable>
                            )} />
                    </View>
                </View>
            </Modal>

            <Modal visible={datePickerOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('selectDate') || 'Select Date'}</Text>
                            <Pressable onPress={closeDatePicker} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Ionicons name="close" size={24} color="#333" /></Pressable>
                        </View>
                        <Calendar minDate={moment().format('YYYY-MM-DD')}
                            onDayPress={(day: any) => { updateJob({ Application_Deadline: day.dateString }); closeDatePicker(); }}
                            markedDates={{ [addJob?.Application_Deadline || '']: { selected: true, selectedColor: '#246BFD' } }}
                            theme={{ todayTextColor: '#246BFD', selectedDayBackgroundColor: '#246BFD' }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
    backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    backButtonPressed: { opacity: 0.6, backgroundColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#212529' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    stepIconContainer: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#246BFD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    stepHeaderText: { flex: 1 },
    stepTitle: { fontSize: 20, fontWeight: '700', color: '#212529', marginBottom: 2 },
    stepSubtitle: { fontSize: 13, color: '#6C757D' },
    divider: { height: 1, backgroundColor: '#E9ECEF', marginBottom: 16 },
    stepContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16 },
    classicLabel: { fontSize: 16, fontWeight: '600', color: '#212529', marginBottom: 8 },
    helperText: { fontSize: 14, color: '#6C757D', marginBottom: 12 },
    classicInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#333', backgroundColor: '#FAFAFA' },
    largeInput: { minHeight: 80, textAlignVertical: 'top' },
    textArea: { minHeight: 150 },
    classicBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FAFAFA' },
    pressedBox: { opacity: 0.7, backgroundColor: '#F0F0F0' },
    classicBoxText: { fontSize: 16, color: '#333' },
    radioContainer: { flexDirection: 'column', gap: 12, marginTop: 8 },
    radioOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', width: '100%', justifyContent: 'flex-start' },
    radioOptionSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    radioCircleSelected: { borderColor: '#246BFD' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#246BFD' },
    radioText: { fontSize: 18, color: '#374151', fontWeight: '500' },
    radioTextSelected: { color: '#246BFD', fontWeight: '600' },
    conditionalInputInline: { marginTop: 12 },
    conditionalLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
    amountInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#333', backgroundColor: 'white' },
    pincodeSection: { marginTop: 8 },
    pincodeErrorText: { marginTop: 8, fontSize: 14, color: '#EF4444' },
    dropdown: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
    dropdownPlaceholder: { fontSize: 16, color: '#999' },
    dropdownSelectedText: { fontSize: 16, color: '#333' },
    vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
    vehicleTile: { width: '46%', margin: '2%', backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    vehicleTileSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    pressedTile: { opacity: 0.7 },
    vehicleImage: { width: 60, height: 40, marginBottom: 8 },
    vehicleLabel: { fontSize: 12, color: '#333', textAlign: 'center' },
    vehicleLabelSelected: { color: '#246BFD', fontWeight: '600' },
    vehicleCheckmark: { position: 'absolute', top: 8, right: 8 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
    experienceTile: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', margin: 4 },
    experienceTileSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    experienceTileText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    experienceTileTextSelected: { color: '#246BFD', fontWeight: '600' },
    salaryTile: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', margin: 4 },
    salaryTileSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    salaryTileText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    salaryTileTextSelected: { color: '#246BFD', fontWeight: '600' },
    endorsementTile: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF' },
    endorsementTileSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    endorsementIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    endorsementLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
    skillsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14, marginRight: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    skillChipSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    skillChipText: { fontSize: 14, color: '#333' },
    skillChipTextSelected: { color: '#246BFD', fontWeight: '500' },
    conditionOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF' },
    conditionOptionSelected: { borderColor: '#246BFD', backgroundColor: '#F0F7FF' },
    conditionTextContainer: { flex: 1, marginLeft: 4 },
    conditionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 2 },
    conditionDesc: { fontSize: 13, color: '#6B7280' },
    footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E9ECEF' },
    updateButton: { backgroundColor: '#246BFD', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    updateButtonPressed: { opacity: 0.8, backgroundColor: '#1E5AD8' },
    updateButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#212529' },
    locationItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    locationText: { fontSize: 16, color: '#333' },
});