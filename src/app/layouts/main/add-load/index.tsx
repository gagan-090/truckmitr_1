import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Space } from '@truckmitr/src/app/components'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { hitSlop } from '@truckmitr/src/app/functions';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fontisto from 'react-native-vector-icons/Fontisto'
import Octicons from 'react-native-vector-icons/Octicons'

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function AddLoad() {
    const navigation = useNavigation<NavigatorProp>();
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useColor();
    const { shadow } = useShadow()
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const [currentStep, setCurrentStep] = useState<number[]>([0]);


    const isActive = (index: number) => currentStep.includes(index);
    const currentSingleStep = currentStep[currentStep.length - 1] ?? -1;
    console.log(isActive(1)); // true or false
    console.log(currentSingleStep); // gives last active step (or -1 if none)
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: responsiveFontSize(2),
                paddingVertical: 12,
                backgroundColor: colors.white
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={hitSlop(10)}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.blackOpacity(0.05)
                    }}
                >
                    <Ionicons name={'chevron-back'} size={22} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: responsiveFontSize(2.2),
                    color: colors.black,
                    fontWeight: '700'
                }}>
                    Post Load
                </Text>
                <View style={{ width: 36 }} />
            </View>

            <Space height={responsiveFontSize(1)} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: responsiveWidth(2.5) }}>

                {/* Step 0: Address */}
                <TouchableOpacity onPress={() => setCurrentStep([0])} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: isActive(0) ? colors.royalBlue : colors.transparent, height: responsiveFontSize(3.8), width: responsiveFontSize(3.8), borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: isActive(0) ? 0 : 1, borderColor: colors.blackOpacity(0.1) }}>
                        <Ionicons name="location-sharp" size={18} color={isActive(0) ? colors.white : colors.blackOpacity(0.2)} />
                    </View>
                    <Text style={{ color: isActive(0) ? colors.black : colors.blackOpacity(0.5), fontWeight: '500', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(0.5) }}>Address</Text>
                </TouchableOpacity>

                {/* Dashed Line */}
                <View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'center', top: responsiveFontSize(-1.2) }}>
                    {[...Array(12)].map((_, index) => (
                        <View key={index} style={{ height: responsiveFontSize(0.1), width: responsiveFontSize(0.5), backgroundColor: colors.blackOpacity(0.2), marginHorizontal: responsiveFontSize(0.1) }} />
                    ))}
                </View>

                {/* Step 1: Material */}
                <TouchableOpacity onPress={() => setCurrentStep([0, 1])} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: isActive(1) ? colors.royalBlue : colors.transparent, height: responsiveFontSize(3.8), width: responsiveFontSize(3.8), borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: isActive(1) ? 0 : 1, borderColor: colors.blackOpacity(0.1) }}>
                        <FontAwesome5 name="box" size={14} color={isActive(1) ? colors.white : colors.blackOpacity(0.2)} />
                    </View>
                    <Text style={{ color: isActive(1) ? colors.black : colors.blackOpacity(0.5), fontWeight: '500', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(0.5) }}>Material</Text>
                </TouchableOpacity>

                {/* Dashed Line */}
                <View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'center', top: responsiveFontSize(-1.2) }}>
                    {[...Array(12)].map((_, index) => (
                        <View key={index} style={{ height: responsiveFontSize(0.1), width: responsiveFontSize(0.5), backgroundColor: colors.blackOpacity(0.2), marginHorizontal: responsiveFontSize(0.1) }} />
                    ))}
                </View>

                {/* Step 2: Vehicle */}
                <TouchableOpacity onPress={() => setCurrentStep([0, 1, 2])} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: isActive(2) ? colors.royalBlue : colors.transparent, height: responsiveFontSize(3.8), width: responsiveFontSize(3.8), borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: isActive(2) ? 0 : 1, borderColor: colors.blackOpacity(0.1) }}>
                        <Fontisto name="truck" size={14} color={isActive(2) ? colors.white : colors.blackOpacity(0.2)} />
                    </View>
                    <Text style={{ color: isActive(2) ? colors.black : colors.blackOpacity(0.5), fontWeight: '500', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(0.5) }}>Vehicle</Text>
                </TouchableOpacity>

                {/* Dashed Line */}
                <View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'center', top: responsiveFontSize(-1.2) }}>
                    {[...Array(12)].map((_, index) => (
                        <View key={index} style={{ height: responsiveFontSize(0.1), width: responsiveFontSize(0.5), backgroundColor: colors.blackOpacity(0.2), marginHorizontal: responsiveFontSize(0.1) }} />
                    ))}
                </View>

                {/* Step 3: Review */}
                <TouchableOpacity onPress={() => setCurrentStep([0, 1, 2, 3])} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: isActive(3) ? colors.royalBlue : colors.transparent, height: responsiveFontSize(3.8), width: responsiveFontSize(3.8), borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: isActive(3) ? 0 : 1, borderColor: colors.blackOpacity(0.1) }}>
                        <FontAwesome5 name="money-check" size={14} color={isActive(3) ? colors.white : colors.blackOpacity(0.2)} />
                    </View>
                    <Text style={{ color: isActive(3) ? colors.black : colors.blackOpacity(0.5), fontWeight: '500', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(0.5) }}>Payment</Text>
                </TouchableOpacity>
            </View>
            <Space height={responsiveFontSize(4)} />
            {currentSingleStep === 0 && <View style={{ alignItems: 'center', padding: responsiveWidth(5) }}>
                {/* Pickup Section */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ backgroundColor: colors.green, height: responsiveFontSize(3), width: responsiveFontSize(3), borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="arrow-up" size={16} color={colors.white} />
                        </View>
                        {[...Array(8)].map((_, index) => (
                            <View key={index} style={{ height: responsiveFontSize(0.5), width: responsiveFontSize(0.1), backgroundColor: colors.blackOpacity(0.2), marginVertical: responsiveFontSize(0.1) }} />
                        ))}
                    </View>
                    <Space width={responsiveFontSize(1)} />
                    <TouchableOpacity onPress={() => navigation.navigate(STACKS.LOCATION_SEARCH)} activeOpacity={.7} style={{ height: responsiveHeight(7), flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.royalBlue, paddingHorizontal: responsiveWidth(3), borderRadius: 10 }}>
                        <View>
                            <Text style={{ color: colors.white, fontWeight: '500', fontSize: responsiveFontSize(1.8) }}>Add loading point</Text>
                            <Text style={{ color: colors.whiteOpacity(.7), fontWeight: '400', fontSize: responsiveFontSize(1.4) }}>Choose the starting location for your shipment.</Text>
                        </View>
                        <View style={{ backgroundColor: colors.white, height: responsiveFontSize(3), width: responsiveFontSize(3), borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Octicons name="plus" size={16} color={colors.royalBlue} />
                        </View>
                    </TouchableOpacity>
                    {/* <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 10, padding: responsiveWidth(2.5), borderColor: colors.blackOpacity(.02), borderWidth: 1, ...shadow }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.6) }}>Loading point</Text>
                            <TouchableOpacity>
                                <Text style={{ color: colors.royalBlue, fontWeight: 'bold', fontSize: responsiveFontSize(1.6) }}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: colors.blackOpacity(1), fontWeight: '500', fontSize: responsiveFontSize(2) }}>Delhi</Text>
                        <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.8) }}>Deepak Sharma . 8699921209</Text>
                        <Space height={responsiveFontSize(.5)} />
                        <View style={{ backgroundColor: colors.blackOpacity(.05), padding: responsiveFontSize(1), borderRadius: 10 }}>
                            <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.8) }}>{'C-1/134, Block C1, Janakpuri, MetroPillar number, janakpuri (West) 734, Delhi 110058, india'}</Text>
                        </View>
                    </View> */}
                </View>
                <Space height={responsiveHeight(1)} />
                {/* Drop Section */}
                <View style={{ flexDirection: 'row', }}>
                    <View style={{ alignItems: 'center', }}>
                        {/* {[...Array(6)].map((_, index) => (
                            <View key={index} style={{ height: responsiveFontSize(0.5), width: responsiveFontSize(0.1), backgroundColor: colors.blackOpacity(0.2), marginVertical: responsiveFontSize(0.1) }} />
                        ))} */}
                        <View style={{ backgroundColor: colors.roseRed, height: responsiveFontSize(3), width: responsiveFontSize(3), borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="arrow-down" size={16} color={colors.white} />
                        </View>
                    </View>
                    <Space width={responsiveFontSize(1)} />
                    {/* <TouchableOpacity activeOpacity={.7} style={{ height: responsiveHeight(7), flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.royalBlue, paddingHorizontal: responsiveWidth(3), borderRadius: 10, borderColor: colors.blackOpacity(.02), borderWidth: 0, ...shadow, shadowColor: colors.blackOpacity(.3) }}>
                        <View>
                            <Text style={{ color: colors.whiteOpacity(1), fontWeight: '500', fontSize: responsiveFontSize(1.8) }}>Add unloading point</Text>
                            <Text style={{ color: colors.whiteOpacity(.7), fontWeight: '400', fontSize: responsiveFontSize(1.4) }}>Choose where the goods will be dropped off.</Text>
                        </View>
                        <View style={{ backgroundColor: colors.whiteOpacity(1), height: responsiveFontSize(3), width: responsiveFontSize(3), borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Octicons name="plus" size={16} color={colors.royalBlueOpacity(1)} />
                        </View>
                    </TouchableOpacity> */}
                    <TouchableOpacity activeOpacity={.7} style={{ height: responsiveHeight(7), flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, paddingHorizontal: responsiveWidth(3), borderRadius: 10, borderColor: colors.blackOpacity(.02), borderWidth: 1, ...shadow, shadowColor: colors.blackOpacity(.3) }}>
                        <View>
                            <Text style={{ color: colors.blackOpacity(.5), fontWeight: '500', fontSize: responsiveFontSize(1.8) }}>Add unloading point</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.4) }}>Choose where the goods will be dropped off.</Text>
                        </View>
                        <View style={{ backgroundColor: colors.blackOpacity(.02), height: responsiveFontSize(3), width: responsiveFontSize(3), borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Octicons name="plus" size={16} color={colors.blackOpacity(.5)} />
                        </View>
                    </TouchableOpacity>
                    {/* <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 10, padding: responsiveWidth(2.5), borderColor: colors.blackOpacity(.02), borderWidth: 1, ...shadow }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.6) }}>Loading point</Text>
                            <TouchableOpacity>
                                <Text style={{ color: colors.royalBlue, fontWeight: 'bold', fontSize: responsiveFontSize(1.6) }}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: colors.blackOpacity(1), fontWeight: '500', fontSize: responsiveFontSize(2) }}>Chandigarh</Text>
                        <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.8) }}>Karan Sharma . 8699921209</Text>
                        <Space height={responsiveFontSize(.5)} />
                        <View style={{ backgroundColor: colors.blackOpacity(.05), padding: responsiveFontSize(1), borderRadius: 10 }}>
                            <Text style={{ color: colors.blackOpacity(.5), fontWeight: '400', fontSize: responsiveFontSize(1.8) }}>{'C-86, Phase 7 Main market (West), Industrial Area, Sector 74, Sahibzada Ajit Singh Nagar, eClerx Chandigarh, Chandigarh Punjab 160055, india'}</Text>
                        </View>
                    </View> */}
                </View>
            </View>}
            {/*  */}
            {currentSingleStep === 1 &&
                <View style={{ padding: responsiveWidth(5) }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{'Meterial Name'} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            placeholder={'Enter meterial name'}
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
                        {false && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{''}</Text>
                        )}
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: true ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: true ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Cement</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Sugarcane</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Plastic granules</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Electronics & appliances</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Gas cylinders</Text>
                            </TouchableOpacity>

                        </View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Clothing</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Books & Toys</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(.5)} />

                        </View>
                    </View>
                    <Space height={responsiveFontSize(4)} />
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{'Meterial Quantity ( Tonne(s))'} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            placeholder={'Enter meterial quantity'}
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
                        {false && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{''}</Text>
                        )}
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: true ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: true ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>22 Tonne's</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>26 Tonne's</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>30 Tonne's</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>40 Tonne's</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>46 Tonne's</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(.5)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>50 Tonne's</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>}
            {/*  */}
            {currentSingleStep === 2 &&
                <View style={{ padding: responsiveWidth(5) }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{'Vehical Body'} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            placeholder={'Select vehical body'}
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
                        {false && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{''}</Text>
                        )}
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: true ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: true ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Open Body</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Open Half Body</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Flat Bed</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Closed Body</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>Trailer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Space height={responsiveFontSize(4)} />
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{'Vehical Type'} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            placeholder={'Select vehical type'}
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
                        {false && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{''}</Text>
                        )}
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: true ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: true ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>14 ft</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>17 ft</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>19 ft</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>20 ft</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>22 ft</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>24 ft</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>32 ft</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(.5)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>40 ft</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>}
            {/*  */}
            {currentSingleStep === 3 &&
                <View style={{ padding: responsiveWidth(5) }}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{'Target Price'} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            placeholder={'Enter target price'}
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
                        {false && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{''}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(4)} />
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{'How much advance whould you like to pay'} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            placeholder={'Enter advance payment'}
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
                        {false && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{''}</Text>
                        )}
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: true ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: true ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>70%</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>80%</Text>
                            </TouchableOpacity>
                            <Space width={responsiveFontSize(1)} />
                            <TouchableOpacity
                                onPress={() => {
                                    //dispatch(userEditAction({ ...userEdit, Highest_Education: 'Below 10th' }));
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: false ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
                                    paddingHorizontal: responsiveFontSize(2),
                                    paddingVertical: responsiveFontSize(1),
                                    borderRadius: 100,
                                }}>
                                <Text style={{ color: colors.black, fontWeight: false ? '500' : '400', fontSize: responsiveFontSize(1.7), marginStart: responsiveFontSize(0.5) }}>90%</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>}
            <Space height={responsiveFontSize(5)} />
            {currentSingleStep === 3 && <TouchableOpacity
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
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{'Submit'}</Text>
            </TouchableOpacity>}
        </View>
    )
}
