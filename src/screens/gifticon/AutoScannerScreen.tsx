// src/screens/AutoScannerScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import useTargetedGalleryScanner, { GalleryScanOptions } from '../../hooks/useTargetedGalleryScanner';
import CustomButton from '../../components/common/CustomButton';
import { StoredGifticonData } from '../../services/gifticonService';
import { ExtractedGifticonInfo } from '../../hooks/useGifticonDataExtractor';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const DEFAULT_SCAN_FOLDER_ANDROID = 'Screenshots';
const DEFAULT_SCAN_FOLDER_IOS = 'Screenshots';

type AutoScannerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AutoScan'
>;

const AutoScannerScreen = () => {
  const {
    scannedAndSavedGifticons,
    skippedOrDuplicateGifticons,
    isScanning,
    scanProgress,
    scanError,
    startScan,
  } = useTargetedGalleryScanner();

  const navigation = useNavigation<AutoScannerScreenNavigationProp>();

  const [currentTargetFolder, _setCurrentTargetFolder] = useState<string | undefined>(
    Platform.OS === 'android' ? DEFAULT_SCAN_FOLDER_ANDROID : DEFAULT_SCAN_FOLDER_IOS,
  );

  const handleScan = (options: GalleryScanOptions) => {
    Alert.alert(
      '스캔 시작',
      `${options.targetAlbum ? `"${options.targetAlbum}" 앨범(폴더)의 ` : '전체 갤러리의 '}` +
      `${options.scanMode === 'newInAlbum' || options.scanMode === 'newInGallery' ? '새로운' : '모든'} 이미지를 스캔합니다.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '시작', onPress: () => startScan(options) },
      ],
    );
  };

  const renderGifticonItem = ({ item }: { item: StoredGifticonData | ExtractedGifticonInfo }) => {
    const isStored = 'createdAt' in item; // StoredGifticonData에는 있지만 Extracted에는 없는 필드로 구분
    
    return (
      <TouchableOpacity onPress={() => navigation.navigate('Upload', { imageUri: item.imageUri })}>
        <View style={[styles.itemContainer, isStored ? styles.itemStored : styles.itemSkipped]}>
          <View style={styles.itemDetails}>
            <Text style={TYPOGRAPHY.body4} numberOfLines={1}>
              상품: {item.productName || '정보 없음'}
            </Text>
            <Text style={TYPOGRAPHY.body5} numberOfLines={1}>
              브랜드: {item.brandName || '정보 없음'}
            </Text>
            <Text style={TYPOGRAPHY.caption1}>
              바코드: {item.barcodeValue || '바코드 없음'}
            </Text>
            <Text style={TYPOGRAPHY.caption2}>
              유효기간: {item.expiryDate || '정보 없음'}
            </Text>
            {isStored && (
              <Text style={[TYPOGRAPHY.caption2, styles.statusStored]}>(저장됨)</Text>
            )}
            {!isStored && (
              <Text style={[TYPOGRAPHY.caption2, styles.statusSkipped]}>(저장 안됨 - 중복 또는 오류)</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[TYPOGRAPHY.h2, styles.headerTitle]}>기프티콘 자동 스캐너</Text>

      <View style={styles.scanOptionsContainer}>
        <Text style={[TYPOGRAPHY.body2, styles.folderInfo]}>
          현재 대상 폴더: {currentTargetFolder || '전체 갤러리'}
        </Text>
        
        {/* --- ⬇️ 요청에 따라 아래 두 개의 버튼만 남기고 나머지는 삭제했습니다. ⬇️ --- */}
      <View style={styles.buttonWrapper}>
        <CustomButton
          title={`"${currentTargetFolder || '지정 폴더'}" 새 이미지 스캔`}
          onPress={() =>
            handleScan({
              targetAlbum: currentTargetFolder,
              scanMode: 'newInAlbum',
              forceRescanProcessed: false,
            })
          }
          disabled={isScanning || !currentTargetFolder}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <CustomButton
          title="전체 갤러리 전체 다시 스캔"
          onPress={() =>
            handleScan({
              scanMode: 'newInGallery',
              forceRescanProcessed: true,
            })
          }
          disabled={isScanning}
          buttonStyle={{ backgroundColor: COLORS.warning }}
        />
      </View>
        {/* --- 여기까지 수정 --- */}

      </View>

      {isScanning && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={COLORS.main} />
          <Text style={[TYPOGRAPHY.body4, styles.progressText]}>
            {scanProgress.currentTask || '스캔 중...'}
          </Text>
          {scanProgress.totalFetched !== undefined && (
             <Text style={TYPOGRAPHY.caption1}>
              {scanProgress.processed} / {scanProgress.totalFetched} 처리됨
            </Text>
          )}
        </View>
      )}

      {scanError && (
        <Text style={[TYPOGRAPHY.body5, styles.errorText]}>스캔 오류: {scanError}</Text>
      )}

      <Text style={[TYPOGRAPHY.h5, styles.listHeader]}>스캔 결과</Text>
      <FlatList
        data={[...scannedAndSavedGifticons, ...skippedOrDuplicateGifticons]}
        renderItem={renderGifticonItem}
        keyExtractor={(item, index) => `${item.imageUri}-${index}-${item.barcodeValue || 'nobarcode'}`}
        style={styles.list}
        ListEmptyComponent={
          !isScanning ? (
            <Text style={[TYPOGRAPHY.body2, styles.emptyListText]}>
              스캔된 기프티콘이 없습니다. 스캔을 시작해주세요.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.white, },
  headerTitle: { textAlign: 'center', marginBottom: 20, color: COLORS.main, },
  scanOptionsContainer: { marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray2, },
  folderInfo: { textAlign: 'center', marginBottom: 10, color: COLORS.gray7, },
  scanButton: {},
  buttonWrapper: {
    marginVertical: 8, // 여기에 직접 여백을 적용
  },
  progressContainer: { alignItems: 'center', marginVertical: 15, },
  progressText: { marginTop: 8, color: COLORS.grayB, },
  errorText: { color: COLORS.error, textAlign: 'center', marginVertical: 10, },
  listHeader: { marginTop: 20, marginBottom: 10, color: COLORS.grayB, },
  list: { flex: 1, },
  itemContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray1, alignItems: 'center', borderRadius: 6, marginBottom: 8, },
  itemStored: { backgroundColor: COLORS.gray1, },
  itemSkipped: { backgroundColor: '#fff0f0', },
  itemDetails: { flex: 1, },
  statusStored: { color: COLORS.success, fontSize: TYPOGRAPHY.caption2.fontSize, marginTop: 2, },
  statusSkipped: { color: COLORS.warning, fontSize: TYPOGRAPHY.caption2.fontSize, marginTop: 2, },
  emptyListText: { textAlign: 'center', marginTop: 30, color: COLORS.gray5, },
});
export default AutoScannerScreen;