import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Space } from '@truckmitr/src/app/components';
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { useTranslation } from 'react-i18next';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const Approval = ({ }) => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation<NavigatorProp>();
  const colors = useColor();
  const { response } = route?.params as any
  const { responsiveFontSize, responsiveWidth, responsiveHeight } = useResponsiveScale();
  const _navigateLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: STACKS.LOGIN,
          },
        ],
      })
    );
  };
  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={80} color="#3D5EE1" />
      <Text style={styles.title}>{t(`approvalPending`)}</Text>
      <Text style={styles.message}>{response?.message}</Text>
      <Space height={responsiveHeight(5)} />
      <TouchableOpacity onPress={_navigateLogin} activeOpacity={.7} style={{ height: responsiveHeight(6.5), width: responsiveWidth(90), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.royalBlue, borderRadius: 10 }}>
        <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('backToLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    marginTop: 6,
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    lineHeight: 22,
  },
});

export default Approval;
