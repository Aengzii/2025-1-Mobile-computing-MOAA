// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text } from 'react-native';

// 새로 만든 MainTabs 임포트
import MainTabs from './MainTabs'; 

// 스크린 컴포넌트 import
import SplashScreen from '../screens/SplashScreen';
import AutoScannerScreen from '../screens/gifticon/AutoScannerScreen';
import UploadScreen from '../screens/Upload';
import DetailScreen from '../screens/DetailScreen';
import TempScreen from '../screens/temp';
import SettingScreen from '../screens/SettingScreen';
import AlertScreen from '../screens/AlertScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationSettingScreen from '../screens/NotificationSettingScreen';

// 네비게이션 스택 타입 정의 (Main과 MyPage 대신 MainTabs를 포함)
export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined; // MainScreen과 MyPageScreen을 포함하는 탭 네비게이터
  Upload: {
    imageUri?: string;
    barcode?: string;
    productName?: string;
    brandName?: string;
    expiryDate?: string;
    gifticonToEdit?: any;
    currentGifticonIndex?: number;
    totalGifticonCount?: number;
    extractedData?: any;
  } | undefined;
  AutoScan: undefined;
  Detail: { gifticonId: number };
  Temp: undefined;
  Setting: undefined;
  Alert: undefined;
  Search: undefined;
  NotificationSettingScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const AppNavigator = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={defaultScreenOptions}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        {/* MainTabs 스크린 추가 */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={({ route }) => {
            // 현재 활성화된 라우트 이름을 가져옵니다.
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'MainTab';
            // 하단 바를 숨길 스크린 목록
            const hideOnScreens = ['SettingTab']; // 여기에 SettingTab을 추가
            
            return {
              headerShown: false,
              // SettingTab이 활성화되면 tabBarStyle을 none으로 설정합니다.
              tabBarStyle: hideOnScreens.includes(routeName) ? { display: 'none' } : undefined,
            };
          }}
        />

        <Stack.Screen
          name="AutoScan"
          component={AutoScannerScreen}
          options={{ headerShown: true, title: '기프티콘 자동 스캔' }}
        />
        <Stack.Screen
            name="Upload"
            component={UploadScreen}
            options={{
              headerShown: true,
              title: '쿠폰 등록', // 실제 제목은 UploadScreen 내부에서 동적으로 설정됩니다.
              headerBackTitleVisible: false,
            }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{
            title: '기프티콘 정보',
            headerShown: true,
            headerBackTitleVisible: false,
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => console.log('Edit Tapped!')} style={{ marginRight: 16 }}>
                  <Text style={{ fontSize: 22 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log('Delete Tapped!')}>
                  <Text style={{ fontSize: 22 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Temp"
          component={TempScreen}
          options={{ title: '임시 테스트' }}
        />
        <Stack.Screen
          name="Setting"
          component={SettingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Alert"
          component={AlertScreen}
          options={{ title: '알림' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationSettingScreen"
          component={NotificationSettingScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;