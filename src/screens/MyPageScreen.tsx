// src/screens/MyPageScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
// import { COLORS } from '../constants/colors';

// 임시 상수
const COLORS = {
    white0: '#FFFFFF',
    gray1: '#F8F9FA',
    gray2: '#F1F3F5',
    gray4: '#CED4DA',
    gray7: '#495057',
    black9: '#131313',
};


// ⭐️ 'export' 키워드를 여기서 제거했습니다.
const MyPageScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Setting')}
        >
          <View style={styles.menuLeft}>
            <Icon name="settings" size={24} color={COLORS.gray7} />
            <Text style={styles.menuText}>설정</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.gray4} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Icon name="bell" size={24} color={COLORS.gray7} />
            <Text style={styles.menuText}>알림 설정</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.gray4} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Icon name="info" size={24} color={COLORS.gray7} />
            <Text style={styles.menuText}>앱 정보</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.gray4} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white0,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black9,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: COLORS.black9,
  },
});

// ⭐️ 파일 맨 아래에 이 줄을 추가했습니다.
export default MyPageScreen;