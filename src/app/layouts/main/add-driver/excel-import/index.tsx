import { ActivityIndicator, Alert, BackHandler, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import RNFS from 'react-native-fs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import FileViewer from 'react-native-file-viewer';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { pick } from '@react-native-documents/picker'
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

export default function ExcelImport() {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const [choosedFile, setchoosedFile] = useState<any>()
    const [error, seterror] = useState('')
    const [loading, setloading] = useState(false)
    const [errorArray, seterrorArray] = useState<any>([])
    const [errorModel, seterrorModel] = useState(false)

    const _goback = () => {
        navigation.goBack()
    }

    const handleDownload = async () => {
        try {
            const fileName = 'Bulk-Driver-Registration-Format.xlsx';
            const assetPath = fileName;
            const destPath =
                Platform.OS === 'android'
                    ? `${RNFS.DownloadDirectoryPath}/${fileName}`
                    : `${RNFS.DocumentDirectoryPath}/${fileName}`;

            if (Platform.OS === 'android') {
                const exists = await RNFS.existsAssets(assetPath);
                if (!exists) throw new Error('File not found in assets');

                await RNFS.copyFileAssets(assetPath, destPath);

                // Try opening the file with FileViewer
                try {
                    await FileViewer.open(destPath, {
                        showOpenWithDialog: true,
                        mimeType: 'application/vnd.ms-excel', // fallback MIME type
                    } as any);
                    console.log('File opened');
                } catch (openError) {
                    console.log('FileViewer failed, trying to share...', openError);
                    // await Share.open({
                    //     url: `file://${destPath}`,
                    //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    //     title: 'Open Excel File',
                    // });
                }
            } else {
                Alert.alert('Unsupported', 'This method is Android-only');
            }
        } catch (err) {
            console.error('Download failed', err);
        }
    };


    const _uploadExcelFile = async () => {
        try {
            const [file] = await pick({
                // type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                type: ['*/*']
            });
            // Manual .xlsx validation
            const isValid = file?.name?.endsWith('.xlsx') || file?.type?.includes('sheet');
            if (!isValid) {
                seterror(t(`invalidFilePleaseSelectValidXlsxExcel`));
                return;
            }
            console.log('Picked file:', file);
            setchoosedFile(file)
            seterror('')
        } catch (err: any) {
            if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
                console.log('User cancelled picker');
            } else {
                console.error('File selection failed:', err);
            }
        }
    };

    const _onpressSubmit = async () => {
        if (!choosedFile?.uri) {
            seterror(t(`noFileSelectedPleaseChooseExcelFile`));
            return;
        }
        setloading(true)
        let data = new FormData();
        data.append('file', {
            uri: choosedFile.uri,
            type: choosedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            name: choosedFile.name || 'file.xlsx',
        });
        try {
            // Optionally show a loader here
            const response = await axiosInstance.post(END_POINTS.DRIVER_IMPORT, data);
            if (response?.data?.success) {
                showToast('File uploaded successfully');
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            {
                                name: STACKS.BOTTOM_TAB,
                                state: {
                                    index: 0,
                                    routes: [
                                        {
                                            name: STACKS.DRIVER_LIST ,
                                        },

                                    ],
                                },
                            },
                        ],
                    })
                );
            } else {
                // showToast(response?.data?.message || 'Upload failed');
                const _errorArray = Object.entries(response?.data?.errors).map(([row, message]) => ({
                    row,
                    message,
                })) as any
                seterrorArray({ title: response?.data?.message, list: _errorArray })
                seterrorModel(true)
            }
        } catch (error: any) {
            console.log('Upload error:', error);
            showToast('Upload error: ' + (error?.message || JSON.stringify(error)));
        } finally {
            setloading(false); // if using a loader
        }
    };

    const formatBytes = (bytes: any) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${size} ${sizes[i]}`;
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center' }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t('uploadExcel')}</Text>
            </View>
            <ScrollView contentContainerStyle={{ width: responsiveWidth(100), alignItems: 'center', backgroundColor: colors.white }}>
                <Space height={responsiveFontSize(1)} />
                <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, padding: responsiveFontSize(2), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                    <Text style={{ width: responsiveWidth(85), color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '600', }}>{t(`youCanAlsoAccessThisFeatureOnDesktopOrLaptopThrough`)}<Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.2), fontWeight: 'bold', textDecorationLine: 'underline' }} onPress={() => { Linking.openURL('https://www.truckmitr.com/login'); }}>{`\nwww.truckmitr.com/login`}</Text></Text>
                    <Space height={responsiveFontSize(2)} />
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{t(`uploadExcelSheet`)}</Text>
                    <TouchableOpacity onPress={handleDownload} style={{ flexDirection: 'row', borderColor: colors.blackOpacity(.3), borderWidth: 1, alignSelf: 'flex-start', padding: responsiveFontSize(.7), paddingHorizontal: responsiveFontSize(4), borderRadius: 5, marginTop: responsiveFontSize(2) }}>
                        <MaterialCommunityIcons name={'download'} size={24} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginStart: responsiveFontSize(1) }}>{t('downloadSampleFile')}</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '600', marginTop: responsiveFontSize(1) }}>{t(`instruction`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(1) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`1. `}</Text>{t(`downloadTheExcel`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.2) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`2. `}</Text>{t(`fillTheDetailsIncludingNameEmail`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.2) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`3. `}</Text>{t(`referToSheet2ToCheckAndCopy`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.2) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`4. `}</Text>{t(`nameMobileNumberAndStateCodeAreMandatoryFields`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.2) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`5. `}</Text>{t(`theEmailFieldOptional`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.2) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`6. `}</Text>{t(`afterEnteringTheDetails`)}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(2) }}><Text style={{ fontSize: responsiveFontSize(2), fontWeight: '600' }}>{`${t(`note`)}: `}</Text>{t(`theSystemWillValidateTheMobileNumber`)}</Text>
                    <Space height={responsiveFontSize(2)} />
                    {choosedFile?.uri ?
                        <View style={{ borderColor: colors.blackOpacity(0.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(0.5) }}>
                            <View style={{ flexDirection: 'row', }}>
                                <View style={{ height: responsiveFontSize(6), width: responsiveFontSize(6), alignItems: 'center', justifyContent: 'center', borderColor: colors?.blackOpacity(.05), borderWidth: 1, alignSelf: 'flex-start', borderRadius: 10 }}>
                                    <Image style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), aspectRatio: 1.4 }} source={{ uri: `https://cdn-icons-png.flaticon.com/512/2299/2299521.png` }} />
                                </View>
                                <View style={{ marginHorizontal: responsiveFontSize(1), flex: 1 }}>
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{choosedFile?.name}</Text>
                                    <Text style={{ color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(.5) }}>
                                        {formatBytes(choosedFile?.size)}
                                    </Text>
                                </View>
                                <Space width={responsiveFontSize(2)} />
                                <TouchableOpacity onPress={() => {
                                    setchoosedFile({})
                                }}>
                                    <MaterialCommunityIcons name={'delete'} size={20} color={colors.blackOpacity(1)} />
                                </TouchableOpacity>
                            </View>
                            <Image style={{ height: responsiveHeight(15), width: '100%', marginTop: responsiveHeight(1), borderRadius: 10, resizeMode: 'contain' }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732220.png' }} />
                        </View>
                        : <View style={{ flexDirection: 'row', borderColor: colors.blackOpacity(.2), borderWidth: 1, padding: responsiveFontSize(2), borderRadius: 10, marginTop: responsiveFontSize(.5), }}>
                            <MaterialCommunityIcons name={'file'} size={24} color={colors.royalBlue} />
                            <View style={{ marginStart: responsiveFontSize(1) }}>
                                <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', }}>{t('chooseFile')}</Text>
                                <Text style={{ color: colors.blackOpacity(.4), fontSize: responsiveFontSize(1.8), fontWeight: '400', marginTop: responsiveFontSize(1) }}>{t(`uploadExcelXlsx`)}</Text>
                                <TouchableOpacity onPress={_uploadExcelFile} style={{ flexDirection: 'row', borderColor: colors.blackOpacity(.3), borderWidth: 1, alignSelf: 'flex-start', padding: responsiveFontSize(.7), paddingHorizontal: responsiveFontSize(4), borderRadius: 5, marginTop: responsiveFontSize(2) }}>
                                    <MaterialCommunityIcons name={'upload'} size={24} color={colors.royalBlue} />
                                    <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginStart: responsiveFontSize(1) }}>{t('upload')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>}
                    {error && <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{error}</Text>}
                </View>
                <Space height={responsiveFontSize(6)} />
                <TouchableOpacity onPress={_onpressSubmit} activeOpacity={.7} style={{ height: responsiveHeight(5.8), width: responsiveWidth(90), backgroundColor: colors.royalBlue, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderRadius: 8 }}>
                    {loading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('submit')}</Text>}
                </TouchableOpacity>
                <Space height={responsiveHeight(10)} />

                {/*  */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={errorModel}
                    statusBarTranslucent
                    navigationBarTranslucent
                    onRequestClose={() => seterrorModel(false)}>
                    <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.5), justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={() => seterrorModel(false)} style={{ height: '100%', width: '100%', }}></TouchableOpacity>
                        <View style={{ height: responsiveHeight(70), width: responsiveWidth(100), backgroundColor: colors.white, alignItems: 'center', padding: responsiveWidth(2.5), borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <Space height={responsiveFontSize(1)} />
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: 'bold' }}>{t('fileImportErrors')}</Text>
                            <Space height={responsiveFontSize(2)} />
                            <View style={{ flex: 1, width: responsiveWidth(100) }}>
                                <FlatList
                                    data={errorArray?.list || []}
                                    keyExtractor={(_, index) => index.toString()}
                                    contentContainerStyle={{}}
                                    showsVerticalScrollIndicator
                                    renderItem={({ item }: any) => (
                                        <View style={{ paddingHorizontal: responsiveWidth(2.5), marginBottom: responsiveFontSize(1) }}>
                                            <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>{`Row ${item.row}`}</Text>
                                            <Text style={{ color: colors.roseRed, }}>{item?.message}</Text>
                                        </View>
                                    )}
                                />
                            </View>
                            <Space height={safeAreaInsets.bottom + responsiveHeight(1)} />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    )
}