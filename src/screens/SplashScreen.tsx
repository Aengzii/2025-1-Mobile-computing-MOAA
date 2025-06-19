// src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, StatusBar, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { CommonActions, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

// SplashScreen의 navigation prop 타입 정의
type SplashScreenNavigationProp = NavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(COLORS.white);
    }

    const timer = setTimeout(() => {
      // **목적지를 'MainTabs'로 변경합니다.**
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }], 
        })
      );
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icons/splash_icon.png')}
        style={styles.logo}
      />
      <Text style={[TYPOGRAPHY.body2, styles.sloganText]}>
        여기저기 흩어진 기프티콘을,
      </Text>
      <Text style={[TYPOGRAPHY.customTitle1, styles.appNameText]}>
        모아
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  sloganText: {
    color: COLORS.gray7,
    textAlign: 'center',
    marginBottom: 4,
  },
  appNameText: {
    color: COLORS.main,
    textAlign: 'center',
  },
});

export default SplashScreen;