import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import CustomButton from '../components/common/CustomButton';
import { 
  getGifticon, 
  getCategory, 
  updateGifticonStatus, 
  deleteGifticon, 
  GifticonData, 
  Category 
} from '../services/gifticonService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  
// 재사용 컴포넌트들
const DetailRow = ({ label, value, onPress }) => {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueContainer}>
        <Text style={styles.detailValue}>{value}</Text>
        {onPress && <Text style={styles.arrow}>〉</Text>}
      </View>
    </View>
  );
};

const StatusOverlay = ({ status }) => {
  if (status === 'available') return null;
  const text = status === 'used' ? '사용 완료' : '기간 만료';
  return (
    <View style={styles.statusOverlay}>
      <Text style={styles.statusOverlayText}>{text}</Text>
    </View>
  );
};

export const DetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { gifticonId } = route.params as { gifticonId: string };

  const [gifticon, setGifticon] = useState<GifticonData | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUsedModal, setShowUsedModal] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [effectiveStatus, setEffectiveStatus] = useState<'available' | 'used' | 'expired'>('available');

  const fetchGifticonData = useCallback(async () => {
    if (!gifticonId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getGifticon(gifticonId);
      setGifticon(data);

      if (data) {
        if (data.categoryId) {
          const catData = await getCategory(data.categoryId);
          setCategory(catData);
        }
        if (data.status === 'used') {
          setEffectiveStatus('used');
        } else if (new Date(data.expiryDate) < new Date()) {
          setEffectiveStatus('expired');
        } else {
          setEffectiveStatus('available');
        }
      }
    } catch (error) {
      console.error('기프티콘 데이터를 불러오는 중 오류 발생:', error);
      Alert.alert('오류', '데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [gifticonId]);

  useFocusEffect(
    useCallback(() => {
      // 비동기 작업을 수행하는 내부 함수를 정의합니다.
      const fetchData = async () => {
        if (!gifticonId) {
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const data = await getGifticon(gifticonId);
          setGifticon(data);

          if (data) {
            if (data.categoryId) {
              const catData = await getCategory(data.categoryId);
              setCategory(catData);
            }
            if (data.status === 'used') {
              setEffectiveStatus('used');
            } else if (new Date(data.expiryDate) < new Date()) {
              setEffectiveStatus('expired');
            } else {
              setEffectiveStatus('available');
            }
          }
        } catch (error) {
          console.error('기프티콘 데이터를 불러오는 중 오류 발생:', error);
          Alert.alert('오류', '데이터를 불러올 수 없습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      // 정의한 비동기 함수를 바로 호출합니다.
      fetchData();
    }, [gifticonId])
  );

  const handleStatusUpdate = async (newStatus: 'used' | 'available') => {
    if (!gifticon) return;

    // "사용 완료"로 변경하는 경우 -> 확인 Alert 표시
    if (newStatus === 'used') {
      Alert.alert(
        '기프티콘 사용',
        '이 기프티콘을 사용하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '사용',
            onPress: async () => {
              try {
                await updateGifticonStatus(gifticon.id, 'used');
                // 상태 변경 성공 시, 완료 모달 표시
                setShowUsedModal(true);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                Alert.alert('오류', `사용 처리 중 문제가 발생했습니다: ${errorMessage}`);
                console.error('사용 처리 실패:', error);
              }
            },
          },
        ]
      );
    } else {
      // "사용 가능"으로 변경하는 경우 (사용 취소) -> 즉시 변경
      try {
        await updateGifticonStatus(gifticon.id, 'available');
        // 화면에 즉시 반영
        fetchGifticonData();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        Alert.alert('오류', `상태 변경 중 문제가 발생했습니다: ${errorMessage}`);
      }
    }
  };

  const handleModalConfirm = () => {
    setShowUsedModal(false);
    // 메인 화면으로 돌아가면 useFocusEffect가 목록을 새로고침해줍니다.
    navigation.goBack();
  };

  const handleEditPress = () => {
    navigation.navigate('Upload', { gifticonToEdit: gifticon });
  };

  const handleDeletePress = () => {
    Alert.alert(
      '삭제 확인',
      `'${gifticon?.productName}' 기프티콘을 정말 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제',
          onPress: async () => {
            try {
              await deleteGifticon(gifticon!.id);
              Alert.alert('삭제 완료');
              // 삭제 성공 후 이전 화면으로 돌아가도록 수정
              navigation.goBack(); 
            } catch (error) {
              Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleEditPress} style={{ marginRight: 16 }}>
            <Icon name="pencil-outline" size={24} color={COLORS.black9} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePress}>
            <Icon name="trash-can-outline" size={24} color={COLORS.black9} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, gifticon]);
  
  // 1. 순수 공유 기능만 담당하는 함수
    const shareImage = async () => {
        if (!gifticon?.imagePath) {
            Alert.alert('오류', '공유할 이미지 파일이 없습니다.');
            return;
        }
        try {
            const base64Data = await RNFS.readFile(gifticon.imagePath, 'base64');
            const url = `data:image/jpeg;base64,${base64Data}`;
            await Share.open({ title: '기프티콘 공유', url, failOnCancel: false });
        } catch (error) {
            console.error('공유 오류:', error);
            Alert.alert('오류', '공유하는 중 문제가 발생했습니다.');
        }
    };

    // 2. Alert를 띄우고 사용자의 선택에 따라 동작을 결정하는 함수
    const triggerShareFlow = () => {
        Alert.alert(
            '공유 옵션 선택',
            '공유 이후에 기프티콘을 사용완료 처리할까요?',
            [
                {
                    text: '아니오 (공유만 하기)',
                    onPress: async () => {
                        await shareImage();
                        setImageModalVisible(false); // 동작 완료 후 이미지 모달 닫기
                    },
                },
                {
                    text: '예 (사용 완료 후 공유)',
                    onPress: async () => {
                        await updateGifticonStatus(gifticon!.id, 'used');
                        await shareImage();
                        setImageModalVisible(false); // 동작 완료 후 이미지 모달 닫기
                        fetchGifticonData(); // 화면 데이터 새로고침
                    },
                },
                {
                    text: '취소',
                    onPress: () => setImageModalVisible(false), // 확인 창 취소 시에도 이미지 모달 닫기
                    style: 'cancel',
                },
            ],
            { cancelable: true, onDismiss: () => setImageModalVisible(false) } // 바깥쪽을 눌러도 모달 닫기
        );
    };

    // 3. 상세 화면의 '공유' 버튼을 누르면 이미지 확대 및 확인 창을 동시에 띄웁니다.
    const handleShare = () => {
        if (effectiveStatus !== 'available') {
            Alert.alert('알림', '사용 가능 상태의 기프티콘만 공유할 수 있습니다.');
            return;
        }
        // 1. 이미지 확대 모달을 먼저 띄웁니다.
        setImageModalVisible(true);

        // 2. 0.2초(200ms) 뒤에 확인 다이얼로그를 띄웁니다.
        setTimeout(() => {
            triggerShareFlow();
        }, 200);
    };

  const renderBottomButton = () => {
    switch (effectiveStatus) {
      case 'used':
        return <CustomButton title="사용 취소" onPress={() => handleStatusUpdate('available')} />;
      case 'expired':
        return <CustomButton title="기간 만료" disabled={true} containerStyle={{ opacity: 0.5 }} />;
      default:
        return <CustomButton title="사용 완료" onPress={() => handleStatusUpdate('used')} />;
    }
  };

  if (isLoading) {
    return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color={COLORS.main} /></SafeAreaView>;
  }
  if (!gifticon) {
    return <SafeAreaView style={styles.centerContainer}><Text style={TYPOGRAPHY.body1}>기프티콘 정보를 찾을 수 없습니다.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => setImageModalVisible(true)}>
          <View style={styles.gifticonImageContainer}>
            <Image source={{ uri: `file://${gifticon.imagePath}` }} style={styles.gifticonImage} />
            <StatusOverlay status={effectiveStatus} />
          </View>
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <DetailRow label="바코드" value={gifticon.barcode} />
          <DetailRow label="상품명" value={gifticon.productName} />
          <DetailRow label="사용처" value={gifticon.brandName} />
          <DetailRow label="유효기간" value={gifticon.expiryDate} />
          <TouchableOpacity onPress={handleShare}>
                      <DetailRow label="공유" value="이미지 내보내기" onPress={handleShare} />
                    </TouchableOpacity>
        </View>
        {gifticon.memo ? (
          <View style={styles.memoContainer}>
            <Text style={styles.detailLabel}>메모</Text>
            <View style={styles.memoBox}><Text style={styles.memoText}>{gifticon.memo}</Text></View>
          </View>
        ) : null}
        {category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.detailLabel}>카테고리</Text>
            <View style={[styles.categoryChip, { backgroundColor: `${category.color}20`, borderColor: category.color }]}>
              <Icon name={category.icon} size={16} color={category.color} style={{ marginRight: 5 }} />
                    <Text style={[styles.categoryChipText, { color: category.color }]}>{category.name}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonWrapper}>{renderBottomButton()}</View>
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
        <Pressable style={styles.imageModalContainer} onPress={() => setImageModalVisible(false)}>
          <Image source={{ uri: `file://${gifticon.imagePath}` }} style={styles.fullscreenImage} resizeMode="contain" />
        </Pressable>
      </Modal>
      <Modal
        visible={showUsedModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalConfirm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>사용 완료</Text>
            <Text style={styles.modalText}>기프티콘이 사용 처리되었습니다.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalConfirm}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white0 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { paddingBottom: 20 },
  buttonWrapper: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.gray2, backgroundColor: COLORS.white0 },
  gifticonImageContainer: { width: '100%', aspectRatio: 329 / 677, borderRadius: 12, overflow: 'hidden', marginBottom: 32 },
  gifticonImage: { width: '100%', height: '100%' },
  statusOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(90, 90, 90, 0.6)', justifyContent: 'center', alignItems: 'center' },
  statusOverlayText: { fontSize: 40, color: COLORS.white0, fontWeight: '900', transform: [{ rotate: '-15deg' }], textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  infoContainer: { paddingHorizontal: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  detailLabel: { ...TYPOGRAPHY.body1, color: COLORS.black9 },
  detailValueContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', },
  detailValue: { ...TYPOGRAPHY.body3, color: COLORS.gray6, flexShrink: 1, textAlign: 'right' },
  arrow: { fontSize: 18, color: COLORS.gray5, marginLeft: 8 },
  memoContainer: { marginTop: 10, paddingHorizontal: 20 },
  memoBox: { marginTop: 8, padding: 16, borderWidth: 1, borderColor: COLORS.gray3, borderRadius: 12, minHeight: 80 },
  memoText: { ...TYPOGRAPHY.body5, color: COLORS.gray8, lineHeight: 20 },
  categoryContainer: { marginTop: 28, paddingHorizontal: 20 },
  categoryChip: { alignSelf: 'flex-start', flexDirection: 'row', marginTop: 8, height: 32, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  categoryChipText: { ...TYPOGRAPHY.body5 },
  imageModalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '100%', height: '80%' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.white0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: 10,
  },
  modalText: {
    ...TYPOGRAPHY.body3,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.main,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  modalButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.white0,
    fontWeight: 'bold',
  },
});

export default DetailScreen;