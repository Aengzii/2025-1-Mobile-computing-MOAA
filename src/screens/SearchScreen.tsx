// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ListRenderItem
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator'; // AppNavigator 경로에 맞게 수정해주세요.

// 임시 상수 (실제 프로젝트에서는 constants 폴더의 import를 사용하세요)
const COLORS = {
    white0: '#FFFFFF',
    gray2: '#F1F3F5',
    gray5: '#808080',
    gray6: '#495057',
    gray8: '#212529',
    gray9: '#131313',
    main: '#F46127',
};
const TYPOGRAPHY = {
    h2: { fontSize: 22, fontWeight: 'bold' },
};


// =================================================================
// 1. 타입 및 헬퍼 함수 정의
// =================================================================

interface Gifticon {
  id: number;
  brand: string;
  title: string;
  expireDate: string;
  price: number;
  createdAt: string;
  category: string;
  used: boolean;
  image?: string;
}

const getKoreanToday = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaOffset = 9 * 60 * 60000;
  return new Date(new Date(utc + koreaOffset).setHours(0, 0, 0, 0));
};

// =================================================================
// 2. 하위 컴포넌트 정의
// =================================================================

// --- SearchEmptyHint ---
const SearchEmptyHint = ({ style }: { style?: object }) => (
    <Text style={[styles.seh_searchHint, style]}>※ 사용 가능한 기프티콘 먼저 노출됩니다</Text>
);

// --- GifticonCard ---
const GifticonCard = ({ gifticon, tab }: { gifticon: Gifticon; tab: string }) => {
    // ... GifticonCard 로직 (MainScreen 통합 버전과 유사)
    return <View style={styles.card_item}>{/* ... 카드 UI ... */}</View>;
};

// --- GifticonListItem ---
const GifticonListItem = ({ gifticon, tab }: { gifticon: Gifticon; tab: string }) => {
    // ... GifticonListItem 로직 (MainScreen 통합 버전과 유사)
    return <View style={styles.listItem_item}>{/* ... 리스트 아이템 UI ... */}</View>;
};

// --- GifticonGrid ---
const GifticonGrid = ({ gifticons, viewMode, tab }: { gifticons: Gifticon[]; viewMode: 'card' | 'list'; tab: string; }) => {
  const renderItem: ListRenderItem<Gifticon> = ({ item }) =>
    viewMode === 'card' ? (
      <GifticonCard gifticon={item} tab={tab} />
    ) : (
      <GifticonListItem gifticon={item} tab={tab} />
    );

  return (
    <FlatList
      data={gifticons}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      numColumns={viewMode === 'card' ? 2 : 1}
      contentContainerStyle={viewMode === 'card' ? styles.grid_cardGrid : styles.grid_listGrid}
      showsVerticalScrollIndicator={false}
    />
  );
};


// =================================================================
// 3. 메인 컴포넌트
// =================================================================

type SearchScreenRouteProp = RouteProp<RootStackParamList, 'Search'>;

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<SearchScreenRouteProp>();
  const gifticons: Gifticon[] = route.params?.gifticons || [];
  const [keyword, setKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Gifticon[]>([]);

  const handleInputChange = (text: string) => {
    setKeyword(text);
    if (!Array.isArray(gifticons) || text.trim() === '') {
      setSearchResults([]);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = gifticons.filter(
      g =>
        g.brand.toLowerCase().includes(lower) ||
        g.title.toLowerCase().includes(lower)
    );
    setSearchResults(filtered);
  };

  return (
    <View style={styles.ss_container}>
      <View style={styles.ss_header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.ss_leading}>
          <Image
            source={require('../assets/images/backIcon.png')} // assets 경로 확인 필요
            style={styles.ss_backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.ss_title}>기프티콘 검색</Text>
      </View>

      <View style={styles.ss_searchBarWrapper}>
        <Image
          source={require('../assets/images/searchIcon.png')} // assets 경로 확인 필요
          style={styles.ss_searchBarIcon}
        />
        <TextInput
          style={styles.ss_searchBarInput}
          value={keyword}
          onChangeText={handleInputChange}
          placeholder="검색어를 입력하세요"
          placeholderTextColor={COLORS.gray6}
        />
      </View>

      {keyword.trim() === '' ? (
        <SearchEmptyHint style={styles.ss_searchHint} />
      ) : searchResults.length === 0 ? (
        <Text style={styles.ss_noResultText}>검색 결과가 없습니다</Text>
      ) : (
        <GifticonGrid gifticons={searchResults} viewMode="card" tab="search" />
      )}
    </View>
  );
};

// =================================================================
// 4. 모든 스타일 정의
// =================================================================
const styles = StyleSheet.create({
  // --- SearchScreen Styles (ss_ 접두사 사용) ---
  ss_container: {
    flex: 1,
    backgroundColor: COLORS.white0,
    paddingTop: 112,
    paddingHorizontal: 20,
  },
  ss_header: {
    position: 'absolute',
    top: 54, left: 0, right: 0, height: 44,
    flexDirection: 'row', alignItems: 'center',
  },
  ss_leading: {
    paddingVertical: 11, paddingHorizontal: 8,
  },
  ss_backIcon: {
    width: 17, height: 22, resizeMode: 'contain',
  },
  ss_title: {
    position: 'absolute', left: 36, top: 12,
    ...TYPOGRAPHY.h2, color: COLORS.gray9,
  },
  ss_searchBarWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.main, borderRadius: 24,
    paddingVertical: 10, paddingHorizontal: 16, marginBottom: 12,
  },
  ss_searchBarIcon: {
    width: 16, height: 16, tintColor: COLORS.main, marginRight: 8,
  },
  ss_searchBarInput: {
    flex: 1, fontSize: 14, fontWeight: '400', color: COLORS.gray8,
  },
  ss_searchHint: {
    paddingLeft: 6,
  },
  ss_noResultText: {
    paddingVertical: 8, paddingHorizontal: 6,
    fontSize: 14, color: COLORS.gray6,
  },

  // --- SearchEmptyHint Styles (seh_ 접두사 사용) ---
  seh_searchHint: {
    fontSize: 12, fontWeight: '500', color: COLORS.gray6,
    marginBottom: 16,
  },

  // --- GifticonGrid Styles (grid_ 접두사 사용) ---
  grid_cardGrid: { paddingTop: 12, paddingBottom: 16, },
  grid_listGrid: { paddingTop: 12, paddingBottom: 16, },
  
  // --- GifticonCard & ListItem Styles (이전 통합 버전과 유사) ---
  card_item: { /* ... */ },
  listItem_item: { /* ... */ },
});

export default SearchScreen;