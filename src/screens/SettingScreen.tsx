// src/screens/SettingScreen.tsx
import React from 'react';
import { Platform, View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { deleteUsedAndExpiredGifticons } from '../services/gifticonService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // --- ⬅️ 아이콘 라이브러리를 import 합니다.

// 각 설정 행을 위한 재사용 컴포넌트
const SettingsRow = ({ icon, title, rightContent, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
    {/* --- ⬇️ icon prop이 React 컴포넌트를 받을 수 있도록 수정합니다. ⬇️ --- */}
    <View style={styles.iconContainer}>{icon}</View> 
    <Text style={styles.rowTitle}>{title}</Text>
    <View style={styles.rightContentContainer}>
      {rightContent}
    </View>
  </TouchableOpacity>
);

const SettingScreen = () => {
  const navigation = useNavigation();
  const Arrow = () => <Text style={styles.arrow}>〉</Text>;
  const ExternalLink = () => <Icon name="open-in-new" size={20} color={COLORS.gray5} />; // --- ⬅️ 외부 링크 아이콘을 정의합니다.

  const handleDeleteOldGifticons = () => {
    Alert.alert(
      '오래된 기프티콘 삭제',
      '사용 완료 및 기간이 만료된 모든 기프티콘을 영구적으로 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const deletedCount = await deleteUsedAndExpiredGifticons();
              if (deletedCount > 0) {
                Alert.alert('삭제 완료', `${deletedCount}개의 기프티콘을 삭제했습니다.`);
              } else {
                Alert.alert('알림', '삭제할 기프티콘이 없습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
            }
          },
        },
      ],
    );
  };

  const handleLinkPress = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`이 링크를 열 수 없습니다: ${url}`);
    }
  };
  
  const handleContactPress = async () => {
    const url = 'https://sites.google.com/view/2025-mobile-computing-nextstep/03-nextstep';
    handleLinkPress(url);
  };

  // --- ⬇️ 요청하신 URL로 연결하는 함수를 추가합니다. ⬇️ ---
  const handleTermsPress = () => {
    handleLinkPress('https://www.notion.so/aengzi/MOA-1ff35dd637af8077bb11e79a2fbd14e1?source=copy_link');
  };

  const handlePrivacyPress = () => {
    handleLinkPress('https://www.notion.so/aengzi/MOA-21535dd637af801885c8d525994d057c?source=copy_link');
  };
  // --- 여기까지 ---

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>마이페이지</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기프티콘 관리</Text>
          <View style={styles.card}>
            {/* --- ⬇️ icon prop에 이모지 대신 Icon 컴포넌트를 전달합니다. ⬇️ --- */}
            <SettingsRow
              icon={<Icon name="bell-outline" size={24} color={COLORS.gray7} />}
              title="알림 설정"
              rightContent={<Arrow />}
              onPress={() => navigation.navigate('NotificationSettingScreen')} 
            />
            <SettingsRow
              icon={<Icon name="arrow-up-box-outline" size={24} color={COLORS.gray7} />}
              title="사용가능 기프티콘 일괄 저장"
              rightContent={<Arrow />}
              onPress={() => navigation.navigate('AutoScan')}
            />
            <SettingsRow
              icon={<Icon name="trash-can-outline" size={24} color={COLORS.gray7} />}
              title="사용완료/기한만료 기프티콘 삭제"
              rightContent={<Arrow />}
              onPress={handleDeleteOldGifticons}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.card}>
             {/* --- ⬇️ onPress에 정의한 함수를 연결합니다. ⬇️ --- */}
            <SettingsRow 
              icon={<Icon name="file-document-outline" size={24} color={COLORS.gray7} />} 
              title="이용 약관" 
              rightContent={<ExternalLink />} 
              onPress={handleTermsPress} 
            />
            <SettingsRow 
              icon={<Icon name="shield-account-outline" size={24} color={COLORS.gray7} />} 
              title="개인정보 처리방침" 
              rightContent={<ExternalLink />} 
              onPress={handlePrivacyPress} 
            />
            {/* --- 여기까지 --- */}
            <SettingsRow 
              icon={<Icon name="information-outline" size={24} color={COLORS.gray7} />} 
              title="앱 버전 정보" 
              rightContent={<Text style={styles.versionText}>1.0.1</Text>} 
            />
            <SettingsRow 
              icon={<Icon name="message-text-outline" size={24} color={COLORS.gray7} />} 
              title="문의하기" 
              rightContent={<Arrow />} 
              onPress={handleContactPress} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray2 },
  scrollContainer: { padding: 20 },
  headerTitle: { ...TYPOGRAPHY.h1, marginBottom: 24, paddingHorizontal: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { ...TYPOGRAPHY.body4, color: COLORS.gray6, marginBottom: 8, paddingHorizontal: 12 },
  card: { backgroundColor: COLORS.white0, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: COLORS.gray2 },
  // --- ⬇️ 아이콘을 담을 컨테이너 스타일을 추가합니다. ⬇️ ---
  iconContainer: { width: 30, alignItems: 'center' },
  rowTitle: { ...TYPOGRAPHY.body2, flex: 1, marginLeft: 8 },
  rightContentContainer: { alignItems: 'flex-end' },
  arrow: { fontSize: 18, color: COLORS.gray5 },
  versionText: { ...TYPOGRAPHY.body3, color: COLORS.gray6 },
});

export default SettingScreen;