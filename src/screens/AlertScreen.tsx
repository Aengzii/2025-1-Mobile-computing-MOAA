// src/screens/AlertScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import Icon from 'react-native-vector-icons/Ionicons';
import { GifticonData as Gifticon } from '../services/gifticonService'; // Gifticon 타입을 가져옵니다.

const getKoreanToday = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaOffset = 9 * 60 * 60000;
  return new Date(new Date(utc + koreaOffset).setHours(0, 0, 0, 0));
};

const AlertItem = ({ item }) => {
  const getBadgeStyle = () => {
    switch(item.type) {
      case 'today':
        return { container: styles.badgeRed, text: styles.badgeRedText };
      case 'd-day':
        return { container: styles.badgeGray, text: styles.badgeGrayText };
      case 'expired':
        return { container: styles.badgeLightGray, text: styles.badgeLightGrayText };
      default:
        return {};
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Image source={{ uri: `file://${item.imagePath}` }} style={styles.itemIcon} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
      <View style={styles.timeContainer}>
        <View style={[styles.badgeBase, badgeStyle.container]}>
          <Text style={badgeStyle.text}>{item.time}</Text>
        </View>
        {item.date && <Text style={styles.itemDate}>{item.date}</Text>}
      </View>
    </View>
  );
};

const AlertScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const gifticons: Gifticon[] = route.params?.gifticons || [];
  const [alertSections, setAlertSections] = useState([]);

  useEffect(() => {
    const today = getKoreanToday();
    const todayAlerts = [];
    const previousAlerts = [];

    gifticons.forEach(gifticon => {
      const expiryDate = new Date(new Date(gifticon.expiryDate).setHours(0, 0, 0, 0));
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let alertData = null;

      if (diffDays < 0) {
        alertData = {
          ...gifticon,
          brand: gifticon.brandName,
          description: '이미 만료된 기프티콘입니다.',
          time: '만료됨',
          type: 'expired',
          date: expiryDate.toLocaleDateString('ko-KR'),
        };
        previousAlerts.push(alertData);
      } else if (diffDays === 0) {
        alertData = {
          ...gifticon,
          brand: gifticon.brandName,
          description: '유효기간 만료일이 오늘이에요!',
          time: '오늘 만료',
          type: 'today',
        };
        todayAlerts.push(alertData);
      } else if (diffDays <= 7) { // D-1 ~ D-7
        alertData = {
          ...gifticon,
          brand: gifticon.brandName,
          description: `유효기간 만료일이 ${diffDays}일 남았어요.`,
          time: `D-${diffDays}`,
          type: 'd-day',
        };
        todayAlerts.push(alertData);
      }
    });

    const sections = [];
    if (todayAlerts.length > 0) {
      sections.push({ title: '확인할 알림', data: todayAlerts.sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()) });
    }
    if (previousAlerts.length > 0) {
      sections.push({ title: '만료된 알림', data: previousAlerts.sort((a,b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()) });
    }
    
    setAlertSections(sections);
  }, [gifticons]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.black9} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationSettingScreen')} style={styles.settingsButton}>
          <Icon name="settings-outline" size={24} color={COLORS.black9} />
        </TouchableOpacity>
      </View>
      {alertSections.length > 0 ? (
        <SectionList
          sections={alertSections}
          keyExtractor={(item, index) => item.id.toString() + index}
          renderItem={({ item }) => <AlertItem item={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>도착한 알림이 없어요.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (기존 스타일과 거의 동일)
  container: { flex: 1, backgroundColor: COLORS.white0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, },
  backButton: { padding: 4 },
  settingsButton: { padding: 4 },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.black9 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: { ...TYPOGRAPHY.h4, color: COLORS.gray7, marginTop: 24, marginBottom: 16 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white0, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gray2, },
  iconContainer: { marginRight: 12 },
  itemIcon: { width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.gray2, resizeMode: 'cover' },
  infoContainer: { flex: 1, marginRight: 8 },
  itemBrand: { ...TYPOGRAPHY.body2, fontWeight: 'bold', color: COLORS.black9, marginBottom: 4 },
  itemDescription: { ...TYPOGRAPHY.body5, color: COLORS.gray7 },
  timeContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  badgeBase: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, minWidth: 60, alignItems: 'center' },
  badgeRed: { backgroundColor: '#FFEAE5' },
  badgeRedText: { ...TYPOGRAPHY.caption, color: '#F46127', fontWeight: 'bold' },
  badgeGray: { backgroundColor: COLORS.gray2 },
  badgeGrayText: { ...TYPOGRAPHY.caption, color: COLORS.gray6, fontWeight: 'bold' },
  badgeLightGray: { backgroundColor: COLORS.gray2 },
  badgeLightGrayText: { ...TYPOGRAPHY.caption, color: COLORS.gray5, fontWeight: 'bold' },
  itemDate: { ...TYPOGRAPHY.caption, color: COLORS.gray5, marginTop: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.body1, color: COLORS.gray5 },
});

export default AlertScreen;