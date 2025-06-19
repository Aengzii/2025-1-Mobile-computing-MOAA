// src/screens/NotificationSettingScreen.tsx
import React, { useState, useLayoutEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingRow = ({ title, children }) => (
  <View style={styles.row}>
    <Text style={styles.rowTitle}>{title}</Text>
    {children}
  </View>
);

const NotificationSettingScreen = () => {
  const navigation = useNavigation();
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  // 화면이 처음 렌더링될 때 상태 초기화
  useLayoutEffect(() => {
    // Android에서는 기본적으로 알림 허용 상태로 설정
    // 실제 권한은 나중에 체크
    if (Platform.OS === 'android') {
      setIsNotificationEnabled(true);
    }
  }, []);

  // --- ⬇️ 하단 네비게이션 바를 숨기는 로직 ⬇️ ---
  useLayoutEffect(() => {
    // 부모 네비게이터(MainTabs)를 찾아 tabBarStyle을 'none'으로 설정
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    // 화면을 벗어날 때 다시 보이도록 원래대로 복원
    return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
  }, [navigation]);

  // 알림 허용 스위치 토글 핸들러
  const handleToggleSwitch = async () => {
    // 스위치를 끄는 경우는 상태만 변경
    if (isNotificationEnabled) {
      setIsNotificationEnabled(false);
      return;
    }

    // 스위치를 켜는 경우
    try {
      if (Platform.OS === 'android') {
        // Android에서는 일단 활성화하고, 실제 권한은 앱에서 알림을 보낼 때 요청
        setIsNotificationEnabled(true);
        Alert.alert('알림이 활성화되었습니다.', '기프티콘 만료 전 알림을 받을 수 있습니다.');
      } else if (Platform.OS === 'ios') {
        // iOS는 react-native-permissions 대신 기본 API 사용
        const { check, request, PERMISSIONS, RESULTS } = require('react-native-permissions');
        
        const result = await check(PERMISSIONS.IOS.NOTIFICATIONS);
        
        if (result === RESULTS.GRANTED) {
          setIsNotificationEnabled(true);
        } else if (result === RESULTS.DENIED) {
          const requestResult = await request(PERMISSIONS.IOS.NOTIFICATIONS);
          if (requestResult === RESULTS.GRANTED) {
            setIsNotificationEnabled(true);
            Alert.alert('알림이 허용되었습니다.');
          } else {
            Alert.alert('알림이 거부되었습니다.');
          }
        } else if (result === RESULTS.BLOCKED) {
          Alert.alert(
            '권한 필요',
            '알림을 받으려면 휴대폰 설정에서 알림 권한을 직접 허용해야 합니다.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정으로 이동', onPress: () => Linking.openSettings() }
            ]
          );
        }
      }
    } catch (error) {
      console.error("Permission error:", error);
      // 에러가 발생해도 일단 활성화
      setIsNotificationEnabled(true);
      Alert.alert('알림이 활성화되었습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.black9} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <SettingRow title="푸시 알림 받기">
          <Switch
            trackColor={{ false: COLORS.gray3, true: COLORS.main }}
            thumbColor={COLORS.white0}
            onValueChange={handleToggleSwitch}
            value={isNotificationEnabled}
          />
        </SettingRow>
        
        {isNotificationEnabled && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              기프티콘 만료 3일 전과 당일에 알림을 받을 수 있습니다.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white0 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    height: 56, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.gray2, 
  },
  backButton: { width: 24 },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.black9 },
  content: { flex: 1, padding: 20 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    backgroundColor: COLORS.white0, 
    borderRadius: 12, 
    paddingHorizontal: 20 
  },
  rowTitle: { ...TYPOGRAPHY.body2, color: COLORS.gray8 },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.gray1,
    borderRadius: 8,
  },
  infoText: {
    ...TYPOGRAPHY.body4,
    color: COLORS.gray6,
    lineHeight: 20,
  }
});

export default NotificationSettingScreen;