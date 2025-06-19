// src/navigation/MainTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 스크린 컴포넌트
import MainScreen from '../screens/MainScreen';
import SettingScreen from '../screens/SettingScreen';

// 커스텀 네비게이션 바
import NavigationBar from './NavigationBar';

// 탭 파라미터 리스트의 타입을 수정합니다. (MyPageTab -> SettingTab)
export type MainTabParamList = {
  MainTab: undefined;
  Add: undefined; // 가운데 버튼을 위한 임시 스크린
  SettingTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      // 우리가 만든 커스텀 네비게이션 바를 tabBar로 지정합니다.
      tabBar={props => <NavigationBar {...props} />}
      screenOptions={{
        headerShown: false, // 각 탭 스크린의 헤더는 보이지 않게 처리
      }}
    >
      <Tab.Screen
        name="MainTab"
        component={MainScreen}
        options={{ title: '보관함' }}
      />
      <Tab.Screen
        name="Add"
        component={() => null} 
        options={{ title: '추가' }}
      />
      {/* 이 부분을 SettingScreen으로 교체합니다. */}
      <Tab.Screen
        name="SettingTab"
        component={SettingScreen}
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;