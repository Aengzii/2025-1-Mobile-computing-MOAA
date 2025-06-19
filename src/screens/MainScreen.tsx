// src/screens/MainScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllGifticons, getAllCategories, saveCategory, GifticonData as Gifticon, Category } from '../services/gifticonService';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import CustomButton from '../components/common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// ... (상수 및 다른 하위 컴포넌트는 이전과 동일)
const AVAILABLE_ICONS = ['☕️', '🏪', '🎬', '🎁', '🍔', '🛒', '🎟️', '✈️'];
const AVAILABLE_COLORS = [ '#FF69B4', '#FFD700', '#32CD32', '#4169E1', '#964B00', '#8A2BE2' ];
const getKoreanToday = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaOffset = 9 * 60 * 60000;
  return new Date(new Date(utc + koreaOffset).setHours(0, 0, 0, 0));
};
const HeaderInfo = ({ count, onAlertClick }: { count: number; onAlertClick: () => void; }) => (
    <View style={styles.header_container}>
        <View>
            <Text style={styles.header_line1}>사용 가능한 기프티콘이</Text>
            <Text style={styles.header_line2}>{count.toString().padStart(2, '0')}개 남아있어요.</Text>
        </View>
        <TouchableOpacity onPress={onAlertClick}>
            <Image source={require('../assets/images/yesAlarm.png')} style={styles.header_icon} />
        </TouchableOpacity>
    </View>
);
const GifticonTab = ({ tab, setTab, availableCount, usedCount }: any) => (
  <View style={styles.tab_container}>
    <TouchableOpacity style={styles.tab_button} onPress={() => setTab('available')}><Text style={tab === 'available' ? styles.tab_activeText : styles.tab_inactiveText}>사용 가능 {availableCount}</Text>{tab === 'available' && <View style={styles.tab_underline} />}</TouchableOpacity>
    <TouchableOpacity style={styles.tab_button} onPress={() => setTab('used')}><Text style={tab === 'used' ? styles.tab_activeText : styles.tab_inactiveText}>사용 완료 {usedCount}</Text>{tab === 'used' && <View style={styles.tab_underline} />}</TouchableOpacity>
  </View>
);
const GifticonCategoryFilter = ({ selectedCategoryId, setSelectedCategoryId, categories, onAddPress }: { selectedCategoryId: string | null; setSelectedCategoryId: (id: string | null) => void; categories: Category[]; onAddPress: () => void; }) => (
  <View>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.category_scroll_container}
    >
      <TouchableOpacity 
        style={styles.category_addButton} 
        onPress={onAddPress}
      >
        <Text style={styles.category_addButtonText}>＋</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.category_button, selectedCategoryId === null ? styles.category_active : styles.category_inactive]} 
        onPress={() => setSelectedCategoryId(null)}
      >
        <Text style={[styles.category_text, selectedCategoryId === null ? styles.category_activeText : styles.category_inactiveText]}>전체</Text>
      </TouchableOpacity>
      {categories.map((cat: Category) => (
        <TouchableOpacity 
          key={cat.id} 
          style={[styles.category_button, cat.id === selectedCategoryId ? styles.category_active : styles.category_inactive]} 
          onPress={() => setSelectedCategoryId(cat.id)}
        >
          <Icon 
            name={cat.icon} 
            size={16} 
            color={cat.id === selectedCategoryId ? COLORS.white0 : COLORS.gray6} 
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.category_text, cat.id === selectedCategoryId ? styles.category_activeText : styles.category_inactiveText]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);
const GifticonSortSelector = ({ sortOption }: { sortOption: string }) => (<TouchableOpacity style={styles.sort_button}><Text style={styles.sort_buttonText}>{sortOption}</Text><Text style={styles.sort_chevron}>▼</Text></TouchableOpacity>);
const GifticonCard = ({ gifticon }: { gifticon: Gifticon }) => {
    const today = getKoreanToday();
    const expireDate = new Date(new Date(gifticon.expiryDate).setHours(0, 0, 0, 0));
    const diffDays = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let badgeColor = COLORS.main;
    if (diffDays <= 7) badgeColor = '#FF6347';
    if (diffDays <= 0) badgeColor = COLORS.gray5;
    return (
        <View style={styles.card_item}>
            <View style={styles.card_imageWrapper}>
                <Image source={{uri: `file://${gifticon.imagePath}`}} style={styles.card_image} />
                <View style={[styles.card_badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.card_badgeText}>{diffDays >= 0 ? `D-${diffDays}` : `만료`}</Text>
                </View>
            </View>
            <View style={styles.card_info}>
                <Text style={styles.card_brand} numberOfLines={1}>{gifticon.brandName}</Text>
                <Text style={styles.card_title} numberOfLines={2}>{gifticon.productName}</Text>
                <Text style={styles.card_date}>{new Date(gifticon.expiryDate).toLocaleDateString('ko-KR')}</Text>
            </View>
        </View>
    );
};
const GifticonListItem = ({ gifticon }: { gifticon: Gifticon }) => (<View><Text>{gifticon.productName}</Text></View>);

// --- ⬇️ GifticonGrid 컴포넌트에 columnWrapperStyle을 다시 추가합니다. ⬇️ ---
const GifticonGrid = ({ gifticons, viewMode, navigation, onRefresh, refreshing }: { gifticons: Gifticon[]; viewMode: 'card'|'list'; navigation: any; onRefresh: () => void; refreshing: boolean; }) => {
  const renderItem: ListRenderItem<Gifticon> = ({ item }) => {
    const content = viewMode === 'card' ? <GifticonCard gifticon={item} /> : <GifticonListItem gifticon={item} />;
    return (<TouchableOpacity onPress={() => navigation.navigate('Detail', { gifticonId: item.id })}>{content}</TouchableOpacity>);
  };
  return (
    <FlatList
      data={gifticons}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      numColumns={viewMode === 'card' ? 2 : 1}
      showsVerticalScrollIndicator={false}
      // 두 열의 아이템을 양 끝으로 정렬하여 가운데 공간을 만듭니다.
      columnWrapperStyle={viewMode === 'card' ? { justifyContent: 'space-between' } : undefined}
      contentContainerStyle={{ paddingBottom: 20 }} // 하단 여백 추가
      onRefresh={onRefresh}
      refreshing={refreshing}
      key={viewMode}
    />
  );
};

const GifticonEmptyState = () => (<View style={styles.empty_container}><Text style={styles.empty_text}>사용 가능한 기프티콘이 없어요</Text><Text style={styles.empty_subtext}>하단의 '+' 버튼을 눌러 등록해보세요!</Text></View>);

const MainScreen = ({ navigation }: any) => {
  // ... (state와 함수 로직은 이전과 동일)
  const [tab, setTab] = useState<'available' | 'used'>('available');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('유효기간 순');
  const [gifticons, setGifticons] = useState<Gifticon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const loadData = useCallback(async () => { try { const [loadedGifticons, loadedCategories] = await Promise.all([ getAllGifticons(), getAllCategories(), ]); setGifticons(loadedGifticons); setCategories(loadedCategories); } catch (error) { console.error("메인 화면 데이터 로딩 실패:", error); } }, []);
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));
  const onRefresh = useCallback(async () => { setIsRefreshing(true); await loadData(); setIsRefreshing(false); }, [loadData]);
  const handleAddNewCategory = async () => { if (!searchQuery) return; try { const savedCategory = await saveCategory({ name: searchQuery, icon: selectedIcon, color: selectedColor }); setCategories(prev => [...prev, savedCategory]); setCategoryModalVisible(false); setSearchQuery(''); } catch (error) { Alert.alert('오류', '카테고리 저장에 실패했습니다.'); } };
  const today = getKoreanToday();
  const availableGifticons = gifticons.filter(g => g.status === 'available' && new Date(g.expiryDate).getTime() >= today.getTime());
  const usedGifticons = gifticons.filter(g => g.status === 'used' || new Date(g.expiryDate).getTime() < today.getTime());
  const filteredByTab = tab === 'available' ? availableGifticons : usedGifticons;
  const filteredGifticons = selectedCategoryId === null ? filteredByTab : filteredByTab.filter(g => g.categoryId === selectedCategoryId);
  const sortedGifticons = [...filteredGifticons].sort((a, b) => { if (sortOption === '유효기간 순') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(); if (sortOption === '등록날짜 순') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); return 0; });
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <HeaderInfo 
            count={availableGifticons.length} 
            onAlertClick={() => navigation.navigate('Alert', { gifticons: gifticons })} 
        />
        <GifticonTab tab={tab} setTab={setTab} availableCount={availableGifticons.length} usedCount={usedGifticons.length} />
      </View>
      <View style={styles.contentWrapper}>
        <GifticonCategoryFilter selectedCategoryId={selectedCategoryId} setSelectedCategoryId={setSelectedCategoryId} categories={categories} onAddPress={() => setCategoryModalVisible(true)} />
        <View style={styles.toolbarWrapper}>
            <GifticonSortSelector sortOption={sortOption} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Search', { gifticons })}><Image source={require('../assets/images/searchIcon.png')} style={styles.toolbarIcon} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode(v => v === 'card' ? 'list' : 'card')}><Image source={viewMode === 'card' ? require('../assets/images/cardButton.png') : require('../assets/images/listButton.png')} style={styles.toolbarIcon} /></TouchableOpacity>
            </View>
        </View>
        {sortedGifticons.length > 0 ? (<GifticonGrid gifticons={sortedGifticons} viewMode={viewMode} navigation={navigation} onRefresh={onRefresh} refreshing={isRefreshing} />) : (<GifticonEmptyState />)}
      </View>
      <Modal animationType="slide" transparent={true} visible={isCategoryModalVisible} onRequestClose={() => setCategoryModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>카테고리 추가</Text>
            <View style={styles.modalSearchBarContainer}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput style={styles.modalSearchInput} placeholder="카페, 편의점 등의 카테고리 검색" placeholderTextColor={COLORS.gray4} value={searchQuery} onChangeText={setSearchQuery}/>
            </View>
            {searchQuery.length > 0 && (
              <View style={styles.modalCreationContainer}>
                <Text style={styles.modalSectionLabel}>아이콘</Text>
                <View style={styles.modalGridContainer}>
                  {AVAILABLE_ICONS.map(icon => (<TouchableOpacity key={icon} style={[styles.modalGridItem, selectedIcon === icon && styles.modalGridItemSelected]} onPress={() => setSelectedIcon(icon)}><Text style={styles.modalIconText}>{icon}</Text></TouchableOpacity>))}
                </View>
                <Text style={styles.modalSectionLabel}>색상</Text>
                <View style={styles.modalGridContainer}>
                  {AVAILABLE_COLORS.map(color => (<TouchableOpacity key={color} style={[styles.modalColorGridItem, { backgroundColor: color }, selectedColor === color && styles.modalGridItemSelected]} onPress={() => setSelectedColor(color)}/>))}
                </View>
                <View style={{ flex: 1 }} />
                <CustomButton title={`'${searchQuery}' 카테고리 추가`} onPress={handleAddNewCategory} />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};


// --- ⬇️ 스타일을 아래와 같이 수정합니다. ⬇️ ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white0 },
    headerWrapper: { paddingHorizontal: 16, backgroundColor: COLORS.white0 },
    // --- ⬇️ 그리드 전체의 좌우 여백을 다시 추가합니다. (예: 16) ⬇️ ---
    contentWrapper: { flex: 1, paddingHorizontal: 8 }, // 패딩을 최소화하여 카드가 더 크게 보이게 함
    toolbarWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    category_scroll_container: { paddingVertical: 8 },
    toolbarIcon: { width: 24, height: 24, marginLeft: 16 },
    header_container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 16, },
    header_line1: { fontSize: 20, color: COLORS.gray8 },
    header_line2: { fontSize: 20, color: COLORS.gray8, fontWeight: 'bold' },
    header_icon: { width: 28, height: 28 },
    tab_container: { height: 59, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', },
    tab_button: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    tab_activeText: { fontSize: 16, lineHeight: 16, fontWeight: '700', color: '#131313', },
    tab_inactiveText: { fontSize: 16, lineHeight: 16, fontWeight: '500', color: '#808080', },
    tab_underline: { position: 'absolute', bottom: 0, width: 122, height: 1, backgroundColor: '#F46127', },
    category_addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray2, justifyContent: 'center', alignItems: 'center', marginRight: 8, },
    category_addButtonText: { fontSize: 16, color: COLORS.gray6 },
    category_button: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, marginRight: 8, flexDirection: 'row', alignItems: 'center' },
    category_active: { backgroundColor: COLORS.main },
    category_inactive: { backgroundColor: COLORS.gray2 },
    category_text: { fontSize: 14, fontWeight: '500' },
    category_activeText: { color: COLORS.white0 },
    category_inactiveText: { color: COLORS.gray6 },
    sort_button: { flexDirection: 'row', alignItems: 'center' },
    sort_buttonText: { color: COLORS.gray8, fontSize: 14 },
    sort_chevron: { marginLeft: 4, fontSize: 10, color: COLORS.gray8 },
    // --- ⬇️ 카드 크기를 더 크게 조정합니다. ⬇️ ---
    card_item: {
        width: '48.5%', // 카드 크기를 최대한 크게
        marginBottom: 12,
    },
    card_imageWrapper: { 
        width: '100%', 
        aspectRatio: 0.65, // 0.7에서 0.65로 변경하여 더 세로로 길게 
        borderRadius: 12,
        position: 'relative', 
        overflow: 'hidden', 
        backgroundColor: '#F0F0F0',
        elevation: 2, // 그림자 효과 추가
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    card_image: { width: '100%', height: '100%', resizeMode: 'cover' },
    card_badge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    card_badgeText: { color: COLORS.white0, fontSize: 14, fontWeight: 'bold' },
    card_info: { marginTop: 12, paddingHorizontal: 4 },
    card_brand: { fontSize: 13, color: COLORS.gray6, marginBottom: 2 },
    card_title: { fontSize: 16, color: COLORS.gray8, fontWeight: '600', marginVertical: 4, lineHeight: 20 },
    card_date: { fontSize: 13, color: COLORS.gray6, marginTop: 2 },
    empty_container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty_text: { fontSize: 16, color: COLORS.gray5 },
    empty_subtext: { fontSize: 14, color: COLORS.gray5, marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.white0, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '70%', paddingHorizontal: 20, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.gray3, alignSelf: 'center', marginTop: 12 },
    modalTitle: { ...TYPOGRAPHY.h4, textAlign: 'center', marginVertical: 20 },
    modalSearchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white0, borderRadius: 30, borderWidth: 1, borderColor: COLORS.gray3, paddingHorizontal: 15, marginBottom: 20 },
    modalSearchIcon: { fontSize: 18, marginRight: 10 },
    modalSearchInput: { ...TYPOGRAPHY.body3, flex: 1, height: 48 },
    modalCreationContainer: { flex: 1 },
    modalSectionLabel: { ...TYPOGRAPHY.body1, color: COLORS.black9, marginBottom: 8 },
    modalGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24, justifyContent: 'center' },
    modalGridItem: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray2 },
    modalColorGridItem: { width: 48, height: 48, borderRadius: 24 },
    modalGridItemSelected: { borderWidth: 3, borderColor: COLORS.main },
    modalIconText: { fontSize: 24 },
});

export default MainScreen;