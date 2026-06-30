import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api/client';

const CafeDetailScreen = ({ route, navigation }: any) => {
  const { cafeId } = route.params;
  const [cafe, setCafe] = useState<any>(null);
  const [menu, setMenu] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cafeRes, menuRes, cartRes]: any = await Promise.all([
        apiClient.get(`/cafes/${cafeId}`),
        apiClient.get(`/cafes/${cafeId}/menu`),
        apiClient.get('/cart'),
      ]);

      setCafe(cafeRes);
      setMenu(menuRes.grouped || {});
      setCartCount(cartRes?.items?.length || 0);

      // Set first category as active
      const categories = Object.keys(menuRes.grouped || {});
      if (categories.length > 0) setActiveCategory(categories[0]);

    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load cafe');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await apiClient.post(`/cafes/${cafeId}/favorite`);
      setIsFavorite(!isFavorite);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAddToCart = async (item: any) => {
    try {
      await apiClient.post('/cart/items', {
        cafeId,
        menuItemId: item.id,
        quantity: 1,
        unitPrice: item.price,
        customizations: {},
      });
      setCartCount(cartCount + 1);
      Alert.alert('✅ Added!', `${item.name} added to cart`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  const categories = Object.keys(menu);
  const activeItems = menu[activeCategory] || [];

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
          <Text style={styles.favoriteText}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Cafe Info ── */}
        <View style={styles.cafeInfoBox}>
          <View style={styles.cafeImagePlaceholder}>
            <Text style={styles.cafeImageEmoji}>☕</Text>
          </View>
          <Text style={styles.cafeName}>{cafe?.name}</Text>
          <Text style={styles.cafeAddress}>📍 {cafe?.address}</Text>
          <View style={styles.cafeStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {cafe?.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{cafe?.totalOrders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: cafe?.isOpen ? 'green' : 'red' }]}>
                {cafe?.isOpen ? 'Open' : 'Closed'}
              </Text>
              <Text style={styles.statLabel}>{cafe?.openTime} - {cafe?.closeTime}</Text>
            </View>
          </View>
        </View>

        {/* ── Category Tabs ── */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Menu Items ── */}
        <Text style={styles.sectionTitle}>Menu</Text>

        {activeItems.length === 0 ? (
          <View style={styles.emptyMenu}>
            <Text style={styles.emptyText}>No items in this category</Text>
          </View>
        ) : (
          activeItems.map((item: any) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.menuItemDesc}>{item.description}</Text>
                )}
                <Text style={styles.menuItemPrice}>PKR {item.price}</Text>
                {item.isPopular && (
                  <Text style={styles.popularBadge}>🔥 Popular</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Cart Button ── */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartBtnText}>
            🛒 View Cart ({cartCount} items)
          </Text>
        </TouchableOpacity>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff' },
  backBtn: { padding: 8 },
  backText: { fontSize: 16, color: '#6B4226', fontWeight: '600' },
  favoriteBtn: { padding: 8 },
  favoriteText: { fontSize: 24 },
  cafeInfoBox: { backgroundColor: '#fff', padding: 20, alignItems: 'center', marginBottom: 8 },
  cafeImagePlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cafeImageEmoji: { fontSize: 40 },
  cafeName: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cafeAddress: { fontSize: 14, color: '#888', marginBottom: 16 },
  cafeStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#eee' },
  categoryScroll: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8 },
  categoryTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  categoryTabActive: { backgroundColor: '#6B4226' },
  categoryText: { fontSize: 12, color: '#666', fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', padding: 16, paddingBottom: 8 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, elevation: 1 },
  menuItemInfo: { flex: 1, marginRight: 12 },
  menuItemName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  menuItemDesc: { fontSize: 13, color: '#888', marginBottom: 4 },
  menuItemPrice: { fontSize: 15, fontWeight: '700', color: '#6B4226' },
  popularBadge: { fontSize: 11, color: '#F4A300', marginTop: 4 },
  addBtn: { backgroundColor: '#6B4226', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyMenu: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#888', fontSize: 16 },
  cartBtn: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#6B4226', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 5 },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CafeDetailScreen;