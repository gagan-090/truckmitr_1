import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import { Dropdown } from 'react-native-element-dropdown';
import Foundation from 'react-native-vector-icons/Foundation'
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';

const salaryData = [
    { label: '5000-10000', value: '5000-10000' },
    { label: '10000-15000', value: '10000-15000' },
    { label: '15000-20000', value: '15000-20000' },
    { label: '20000-25000', value: '20000-25000' },
    { label: '25000-30000', value: '25000-30000' },
    { label: '30000-35000', value: '30000-35000' },
    { label: '35000-40000', value: '35000-40000' },
    { label: '40000-45000', value: '40000-45000' },
    { label: '45000-50000', value: '45000-50000' },
    { label: '50000-55000', value: '50000-55000' },
    { label: '55000-60000', value: '55000-60000' },
];


const drivingExperienceArray = [
    { label: '1 year', value: '1' },
    { label: '2 years', value: '2' },
    { label: '3 years', value: '3' },
    { label: '4 years', value: '4' },
    { label: '5 years', value: '5' },
    { label: '6 years', value: '6' },
    { label: '7 years', value: '7' },
    { label: '8 years', value: '8' },
    { label: '9 years', value: '9' },
    { label: '10 years', value: '10' },
    { label: '11 years', value: '11' },
    { label: '12 years', value: '12' },
    { label: '13 years', value: '13' },
    { label: '14 years', value: '14' },
    { label: '15 years', value: '15' },
    { label: '16 years', value: '16' },
    { label: '17 years', value: '17' },
    { label: '18 years', value: '18' },
    { label: '19 years', value: '19' },
    { label: '20 years', value: '20' },
    { label: '21 years', value: '21' },
    { label: '22 years', value: '22' },
    { label: '23 years', value: '23' },
    { label: '24 years', value: '24' },
    { label: '25 years', value: '25' },
    { label: '26 years', value: '26' },
    { label: '27 years', value: '27' },
    { label: '28 years', value: '28' },
    { label: '29 years', value: '29' },
    { label: '30 years', value: '30' },
];


export default function JobFilter({ setfilterModel }: any) {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [loading, setloading] = useState(false)

    const [locationsList, setlocationsList] = useState<any[]>([]);
    const [errors, setErrors] = useState<{
        salary?: string;
    }>({});

    const getLocationList = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.GETSTATES);
            if (response?.data?.status) {
                setlocationsList(response?.data?.data);
            }
            console.log('Fetched locations:', JSON.stringify(response));
        } catch (error: any) {
            console.log('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        getLocationList()
    }, [])


    const [selectSalary, setselectSalary] = useState('')
    const [selectExperience, setselectExperience] = useState('')
    const [selectLocation, setselectLocation] = useState('')

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!selectSalary) {
            newErrors.salary = t(`expectedSalaryRequired`);
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const _navigateAvailableJob = async () => {
        if (!validate()) return;
        setloading(true)
        const payload = {
            salary: selectSalary,
            experience: selectExperience,
            jobLocation: locationsList?.find(a => Number(a.id) === Number(selectLocation))?.name
        }
        try {
            const response: any = await axiosInstance.get(END_POINTS.JOBS_FILTER(payload));
            setfilterModel(false)
            navigation.navigate(STACKS.AVAILABLE_JOB, { item: response?.data })
        } catch (err) {
            console.log("Failed to remove video progress:", err);
        } finally {
            setloading(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{ padding: responsiveWidth(5) }}>
                <TouchableOpacity style={{ flexDirection: 'row', }}>
                    <Foundation name={'filter'} size={25} color={colors.royalBlueOpacity(1)} />
                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(1), textDecorationLine: 'underline', textTransform:'uppercase'}}>{t('filter')}</Text>
                </TouchableOpacity>
                <Space height={responsiveHeight(4)} />
                <View>
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500' }}>{t(`expectedSalary`)} <Text style={{ color: 'red' }}>*</Text></Text>
                    <Dropdown
                        style={{ height: responsiveHeight(6), paddingHorizontal: responsiveFontSize(1.5), borderRadius: 10, borderColor: colors.blackOpacity(.2), borderWidth: 1, marginTop: responsiveFontSize(1) }}
                        containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
                        placeholderStyle={{ fontSize: responsiveFontSize(1.8) }}
                        selectedTextStyle={{ color: colors.blackOpacity(1), fontSize: responsiveFontSize(2), fontWeight: '400' }}
                        iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                        data={salaryData}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={t(`selectExpectedSalary`)}
                        value={selectSalary}
                        onChange={item => {
                            setselectSalary(item.value);
                            setErrors((prevData) => ({
                                ...prevData,
                                salary: undefined,
                            }));
                        }}
                    />
                    {errors.salary && (
                        <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.salary}</Text>
                    )}
                </View>
                <Space height={responsiveFontSize(2)} />
                <View>
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500' }}>{t(`experienceOfYears`)}</Text>
                    <Dropdown
                        style={{ height: responsiveHeight(6), paddingHorizontal: responsiveFontSize(1.5), borderRadius: 10, borderColor: colors.blackOpacity(.2), borderWidth: 1, marginTop: responsiveFontSize(1) }}
                        containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
                        placeholderStyle={{ fontSize: responsiveFontSize(1.8) }}
                        selectedTextStyle={{ color: colors.blackOpacity(1), fontSize: responsiveFontSize(2), fontWeight: '400' }}
                        iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                        data={drivingExperienceArray}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={t('selectExperienceOfYears')}
                        searchPlaceholder="Search..."
                        value={selectExperience}
                        onChange={item => {
                            setselectExperience(item?.value);
                        }}
                    />
                </View>
                <Space height={responsiveFontSize(2)} />
                <View>
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500' }}>{t(`location`)}</Text>
                    <Dropdown
                        style={{ height: responsiveHeight(6), paddingHorizontal: responsiveFontSize(1.5), borderRadius: 10, borderColor: colors.blackOpacity(.2), borderWidth: 1, marginTop: responsiveFontSize(1) }}
                        containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
                        placeholderStyle={{ fontSize: responsiveFontSize(1.8) }}
                        selectedTextStyle={{ color: colors.blackOpacity(1), fontSize: responsiveFontSize(2), fontWeight: '400' }}
                        iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                        data={locationsList.length ? locationsList.map(item => ({ label: item.name, value: item.id.toString() })) : []}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={t(`selectLocation`)}
                        searchPlaceholder="Search..."
                        value={selectLocation}
                        onChange={item => {
                            setselectLocation(item.value);
                        }}
                    />
                </View>
                <Space height={responsiveFontSize(8)} />
                <TouchableOpacity activeOpacity={.7} onPress={_navigateAvailableJob} style={{ height: responsiveHeight(6), width: responsiveWidth(90), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.royalBlue, borderRadius: 10 }}>
                    {loading ?
                        <ActivityIndicator color={colors.white} size="small" />
                        : <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`next`)}</Text>}
                </TouchableOpacity>
                <Space height={responsiveHeight(12)} />
            </View>

        </View>
    )
}