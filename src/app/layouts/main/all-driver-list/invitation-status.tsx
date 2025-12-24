import { Text, View, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS, BASE_URL } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
interface Driver {
    id: number;
    unique_id: string;
    name: string;
    mobile: string;
    images?: string;
    avatar?: string;
    Driving_Experience?: string;
    Type_of_License?: string;
    License_Number?: string;
    vehicle_type_name?: string;
    state_name?: string;
}

interface Job {
    id: number;
    job_id: string;
    job_title: string;
    job_location: string;
    Required_Experience: string;
    Salary_Range: string;
    Type_of_License: string;
    vehicle_type: string;
    number_of_drivers_required: number;
    Preferred_Skills: string;
}

interface InviteItem {
    id: number;
    transporter_id: number;
    job_id: string;
    driver_id: number;
    status: string;
    created_at: string;
    updated_at: string;
    driver: Driver;
    job: Job;
}

const RenderTransporterInviteItem: React.FC<{ item: InviteItem }> = ({ item }) => {
    const { t } = useTranslation();
    const colors = useColor();
    const { shadow } = useShadow();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();

    const getDriverImage = () => {
        if (item.driver?.images) return `${BASE_URL}public/${item.driver.images}`;
        if (item.driver?.avatar) return `${BASE_URL}public/${item.driver.avatar}`;
        return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
    };

    // 👉 Get Status Config
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'accepted':
                return {
                    backgroundColor: '#E8F5E8',
                    color: '#2E7D32',
                    icon: 'check-circle',
                    text: t('accepted')
                };
            case 'pending':
                return {
                    backgroundColor: '#FFF3E0',
                    color: '#F57C00',
                    icon: 'clock-o',
                    text: t('pending')
                };
            case 'rejected':
                return {
                    backgroundColor: '#FFF3E0',
                    color: 'red',
                    icon: 'close',
                    text: t('rejected')
                };    
            default:
                return {
                    backgroundColor: '#F5F5F5',
                    color: '#757575',
                    icon: 'question-circle',
                    text: t('unknown')
                };
        }
    };

    const getPreferredSkills = () => {
        try {
            if (item.job?.Preferred_Skills) {
                const skills = JSON.parse(item.job.Preferred_Skills);
                if (Array.isArray(skills) && skills.length > 0) {
                    return skills.join(', ');
                }
            }
            return t('notAvailable');
        } catch (error) {
            return item.job?.Preferred_Skills || t('notAvailable');
        }
    };

    const callToDriver = async (item: any) => {
        try {
         Linking.openURL(`tel:${item.driver.mobile}`)
         const formData = new FormData();
            formData.append('id', item.driver.id);
            formData.append('job_id', item.job.job_id);
            const response: any = await axiosInstance.post(END_POINTS?.CALL_TRANSPORTER, formData);
            if (response?.data?.status) {
                console.log(response, "response")
            }
        } catch(error){
            console.log(error)
        }
    }

    const statusConfig = getStatusConfig(item.status);

    return (
        <View style={{
            width: responsiveWidth(94),
            backgroundColor: colors.white,
            padding: responsiveFontSize(2),
            borderRadius: 12,
            marginBottom: responsiveFontSize(1.5),
            ...shadow,
            borderLeftWidth: 4,
            borderLeftColor: colors.royalBlue,
        }}>
            {/* Header Section */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: responsiveFontSize(1.5)
            }}>
                {/* Driver Image */}
                <Image
                    style={{
                        height: responsiveFontSize(8),
                        width: responsiveFontSize(8),
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: colors.royalBlue + '20',
                    }}
                    source={{ uri: getDriverImage() }}
                />
                <View style={{
                    flex: 1,
                    marginLeft: responsiveFontSize(2),
                }}>
                    <Text style={{
                        color: colors.black,
                        fontSize: responsiveFontSize(2.2),
                        fontWeight: '700',
                        marginBottom: responsiveFontSize(0.5)
                    }}>
                        {item.driver?.name || t('notAvailable')}
                    </Text>
                    <Text style={{
                        color: colors.royalBlue,
                        fontSize: responsiveFontSize(1.6),
                        fontWeight: '600',
                    }}>
                        {item.driver?.unique_id || t('notAvailable')}
                    </Text>
                </View>

                {/* Status Badge */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: statusConfig.backgroundColor,
                    paddingHorizontal: responsiveFontSize(1.2),
                    paddingVertical: responsiveFontSize(0.6),
                    borderRadius: 16,
                }}>
                    <FontAwesome
                        name={statusConfig.icon}
                        size={responsiveFontSize(1.4)}
                        color={statusConfig.color}
                        style={{ marginRight: responsiveFontSize(0.3) }}
                    />
                    <Text
                        style={{
                            color: statusConfig.color,
                            fontSize: responsiveFontSize(1.4),
                            fontWeight: "600",
                        }}
                    >
                        {statusConfig.text}
                    </Text>
                </View>
            </View>

            {/* Driver Details Section */}
            <View style={{
                backgroundColor: colors.royalBlue + '08',
                padding: responsiveFontSize(1.3),
                borderRadius: 8,
                marginBottom: responsiveFontSize(1.3)
            }}>
                {/* Driver Contact and Experience */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: responsiveFontSize(1.2)
                }}>
                    <View style={{ flex: 1, marginRight: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='map-marker' size={14} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('state')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(2.1)
                        }}>
                            {item.driver?.state_name || t('notAvailable')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='car' size={responsiveFontSize(1.6)} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('experience')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(2.1)
                        }}>
                            {item.driver?.Driving_Experience ? `${item.driver.Driving_Experience} years` : t('notAvailable')}
                        </Text>
                    </View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                }}>
                    <View style={{ flex: 1, marginRight: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='id-card' size={14} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('license')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(2.1)
                        }}>
                            {item.driver?.Type_of_License || t('notAvailable')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='car' size={14} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('vehicleType')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(2.1)
                        }}>
                            {item.driver?.vehicle_type_name || t('notAvailable')}
                        </Text>
                    </View>
                </View>
            </View>
            {/* Job Details Section */}
            <View style={{
                backgroundColor: colors.royalBlue + '08',
                padding: responsiveFontSize(1.3),
                borderRadius: 8,
                marginBottom: responsiveFontSize(1.3)
            }}>
                <Text style={{
                    color: colors.royalBlue,
                    fontSize: responsiveFontSize(2),
                    fontWeight: '700',
                    marginBottom: responsiveFontSize(1)
                }}>
                    {t('jobDetails')} - {item.job?.job_id || t('notAvailable')}
                </Text>
                {/* Job Title and Location */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: responsiveFontSize(1)
                }}>
                    <View style={{ flex: 1, marginRight: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='briefcase' size={14} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('jobTitle')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(1.8)
                        }}>
                            {item.job?.job_title || t('notAvailable')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='map-marker' size={14} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('location')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(1.8)
                        }}>
                            {item.job?.job_location || t('notAvailable')}
                        </Text>
                    </View>
                </View>
                {/* Salary and Required Experience */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: responsiveFontSize(1)
                }}>
                    <View style={{ flex: 1, marginRight: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='money' size={12} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('salary')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(1.8)
                        }}>
                            {item.job?.Salary_Range ? `₹${item.job.Salary_Range}` : t('notAvailable')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='truck' size={12} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('experience')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(1.8)
                        }}>
                            {item.job?.Required_Experience
                                ? `${item.job.Required_Experience} ${t('years')}`
                                : t('notAvailable')}
                        </Text>
                    </View>
                </View>
                {/* Vehicle Type and Preferred Skills */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                }}>
                    <View style={{ flex: 1, marginRight: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='truck' size={12} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('vehicleType')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(1.8)
                        }}>
                            {item.job?.vehicle_type || t('notAvailable')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: responsiveFontSize(1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(0.5) }}>
                            <FontAwesome name='cogs' size={12} color={colors.royalBlue} />
                            <Text style={{
                                color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5)
                            }}>
                                {t('preferredSkills')}
                            </Text>
                        </View>
                        <Text style={{
                            color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400',
                            marginLeft: responsiveFontSize(1.8)
                        }}>
                            {getPreferredSkills()}
                        </Text>
                    </View>
                </View>
            </View>
            {/* Call Button (Only for accepted status) */}
            {item.status === "accepted" && item.driver?.mobile && (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity
                        onPress={() => callToDriver(item)}
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 20,
                            height: responsiveHeight(4.5),
                            backgroundColor: colors.green,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 5
                        }}
                    >
                        <FontAwesome
                            name="phone"
                            size={responsiveFontSize(1.6)}
                            color={colors.white}
                            style={{ marginRight: responsiveFontSize(0.8) }}
                        />
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>
                            {t('callToDriver')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default function TransporterInvites() {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content');
    const colors = useColor();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [loading, setLoading] = useState(true);
    const [invites, setInvites] = useState<InviteItem[]>([]);

    const fetchInvites = async (showLoader: boolean = true) => {
        try {
            if (showLoader) setLoading(true);
            const response = await axiosInstance.get(END_POINTS?.TRANSPORTER_INVITES);
            if (response.data.status) {
                const acceptedInvites = response.data.accepted || [];
                const pendingInvites = response.data.pending || [];
                const rejectedInvites = response.data.rejected || [];
                const allInvites = [
                    ...pendingInvites,
                    ...acceptedInvites,
                    ...rejectedInvites
                ];

                setInvites(allInvites);
            } else {
                setInvites([]);
            }
        } catch (error) {
            showToast('Failed to load invites');
            setInvites([]);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvites(true);
    }, []);

    const renderEmptyComponent = () => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: responsiveHeight(10) }}>
            <Image
                source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
                style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }}
                resizeMode="contain"
            />
            <Text style={{
                width: responsiveWidth(80),
                color: colors.blackOpacity(.9),
                fontSize: responsiveFontSize(1.9),
                textAlign: 'center',
                fontWeight: '500',
                marginTop: responsiveHeight(2)
            }}>
                {t('noInvitesAvailable')}
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={responsiveFontSize(1)} />

            <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={invites}
                renderItem={({ item }) => <RenderTransporterInviteItem item={item} />}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: responsiveWidth(3),
                    paddingBottom: responsiveHeight(5),
                    paddingTop: responsiveHeight(2)
                }}
                keyExtractor={(item) => `invite-${item.id}-${item.status}`}
                ListEmptyComponent={renderEmptyComponent}
            />
        </View>
    );
}