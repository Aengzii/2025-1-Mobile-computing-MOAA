// src/navigation/NavigationBar.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './AppNavigator';

import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// --- ⬇️ 필요한 라이브러리 및 훅을 import 합니다. ⬇️ ---
import { launchImageLibrary } from 'react-native-image-picker';
import useGifticonDataExtractor from '../hooks/useGifticonDataExtractor'; // OCR 훅 경로 확인 필요

const NavigationBar = ({ state, descriptors, navigation: tabNavigation }: BottomTabBarProps) => {
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // --- ⬇️ OCR 로직 및 로딩 상태를 관리합니다. ⬇️ ---
  const { processImageForGifticonData } = useGifticonDataExtractor();
  const [isProcessing, setIsProcessing] = useState(false);
  // --- ⬇️ 이미지 선택 -> OCR -> 화면 이동 로직을 수행하는 함수입니다. ⬇️ ---
  const handlePressAddButton = async () => {
    // 1. 이미지 선택기를 띄웁니다.
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
        return;
      }
      if (response.assets && response.assets[0].uri) {
        const imageUri = response.assets[0].uri;
        
        try {
          setIsProcessing(true); // 로딩 시작
          
          // 2. 이미지를 OCR로 넘기고 정보를 추출합니다.
          const extractedData = await processImageForGifticonData(imageUri);
          
          // 3. 추출한 정보와 이미지 경로를 Upload.tsx로 파라미터화 해서 넘깁니다.
          stackNavigation.navigate('Upload', {
            imageUri,
            extractedData,
          });

        } catch (error) {
          console.error("OCR 처리 오류:", error);
          Alert.alert('오류', '이미지에서 정보를 추출하는 데 실패했습니다. 직접 입력해주세요.');
          // OCR 실패 시에도 이미지만 가지고 등록 화면으로 이동
          stackNavigation.navigate('Upload', { imageUri });
        } finally {
          setIsProcessing(false); // 로딩 종료
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={handlePressAddButton}
        style={styles.addButtonContainer}
        disabled={isProcessing} // 처리 중일 때 버튼 비활성화
      >
        <View style={styles.addButtonCircle}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcon name="folder-plus-outline" size={32} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = tabNavigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              tabNavigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            tabNavigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          
          // --- ⬇️ 요청하신 대로 아이콘과 텍스트 색상을 수정합니다. ⬇️ ---
          const iconColor = isFocused ? '#3e3e3e' : '#808080';
          // --- 여기까지 ---

          const getIcon = () => {
            let iconName: string;
            if (route.name === 'MainTab') {
              iconName = isFocused ? 'wallet' : 'wallet-outline';
            } 
            else if (route.name === 'SettingTab') { 
              iconName = isFocused ? 'settings' : 'settings-outline';
            } 
            else {
              return null;
            }
            return <Icon name={iconName} size={24} color={iconColor} />;
          };
          
          if (route.name === 'Add') {
            return <View key="add-button-placeholder" style={styles.placeholder} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              {getIcon()}
              <Text style={[styles.labelText, { color: iconColor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    height: 83,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    alignItems: 'center',
    justifyContent: 'center', // space-around에서 center로 변경
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    paddingHorizontal: 60, // 양쪽 패딩 추가해서 중앙으로 모이게 함
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    maxWidth: 80, // 최대 너비 제한
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  addButtonContainer: {
    position: 'absolute',
    top: -15, // 더 위로 올려서 반원 효과
    zIndex: 1,
  },
  addButtonCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#c62b00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    // 흰 테두리 추가로 더 돋보이게
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  placeholder: {
    flex: 0.8, // 중앙 버튼 공간을 좀 더 작게
  },
});

export default NavigationBar;