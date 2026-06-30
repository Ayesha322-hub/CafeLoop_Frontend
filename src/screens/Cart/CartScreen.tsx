import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Switch,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useTheme } from '../../theme/ThemeContext';

const CartScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const [cartRes, loyaltyRes]: any = await Promise.all([
        apiClient.get('/cart'),
        apiClient.get('/loyalty'),
      ]);
      setCart(cartRes);
      setLoyaltyPoints(loyaltyRes?.points || 0);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await apiClient.delete(`/cart/items/${itemId}`);
      } else {
        await apiClient.patch(`/cart/items/${itemId}`, { quantity });
      }
      loadCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result: any = await apiClient.post('/cart/coupon', {
        code: couponCode,
        subtotal,
      });
      setCouponDiscount(result.discount);
    } catch (err: any) {
      Alert.alert('Invalid Coupon', err.message || 'Could not apply coupon');
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Payment', {
      couponCode: couponDiscount > 0 ? couponCode : undefined,
      useLoyaltyPoints: useLoyalty,
    });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.foam }]}>
        <ActivityIndicator size="large" color={theme.gold} />
      </View>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0
  );
  const loyaltyDiscount = useLoyalty ? Math.min(loyaltyPoints, subtotal - couponDiscount) : 0;
  const deliveryFee = 0;
  const total = subtotal - couponDiscount - loyaltyDiscount + deliveryFee;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.foam }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient
          colors={[theme.coffee, '#4A2000']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>My Cart 🛒</Text>
          <Text style={styles.headerSubtitle}>
            {cart?.cafe?.name || 'Cart'} · {items.length} item{items.length !== 1 ? 's' : ''}
          </Text>
        </LinearGradient>

        <View style={styles.body}>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseBtnText}>Browse Cafes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ── Cart Items ── */}
              {items.map((item: any) => (
                <View key={item.id} style={[styles.cartItem, { backgroundColor: theme.card }]}>
                  <View style={styles.itemThumb}>
                    <Text style={styles.itemThumbEmoji}>☕</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.menuItem?.name || item.name}</Text>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <Text style={[styles.itemOpts, { color: theme.muted }]}>
                        {Object.values(item.customizations).join(' · ')}
                      </Text>
                    )}
                    <View style={styles.itemRow}>
                      <Text style={[styles.itemPrice, { color: theme.coffee }]}>PKR {item.unitPrice}</Text>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: theme.foam }]}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Text style={[styles.qtyBtnText, { color: theme.coffee }]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[styles.qtyNum, { color: theme.text }]}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: theme.foam }]}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Text style={[styles.qtyBtnText, { color: theme.coffee }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* ── Coupon Box ── */}
              <View style={[styles.couponBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ fontSize: 20 }}>🎟️</Text>
                <TextInput
                  style={[styles.couponInput, { color: theme.text }]}
                  placeholder="Enter coupon code..."
                  placeholderTextColor={theme.muted}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* ── Loyalty Row ── */}
              {loyaltyPoints > 0 && (
                <View style={[styles.loyaltyRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.loyaltyIcon}>
                    <Text style={{ fontSize: 18 }}>⭐</Text>
                  </View>
                  <View style={styles.loyaltyText}>
                    <Text style={[styles.loyaltyTitle, { color: theme.text }]}>Use {loyaltyPoints} loyalty points</Text>
                    <Text style={[styles.loyaltySub, { color: theme.muted }]}>Save PKR {loyaltyPoints} on this order</Text>
                  </View>
                  <Switch
                    value={useLoyalty}
                    onValueChange={setUseLoyalty}
                    trackColor={{ false: theme.border, true: theme.gold }}
                    thumbColor="#fff"
                  />
                </View>
              )}

              {/* ── Order Summary ── */}
              <View style={[styles.summaryBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.muted }]}>Subtotal</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {subtotal}</Text>
                </View>
                {couponDiscount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.discountLabel}>Coupon ({couponCode})</Text>
                    <Text style={styles.discountValue}>− PKR {couponDiscount}</Text>
                  </View>
                )}
                {loyaltyDiscount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.discountLabel}>Loyalty Points</Text>
                    <Text style={styles.discountValue}>− PKR {loyaltyDiscount}</Text>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.muted }]}>Delivery Fee</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {deliveryFee}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: theme.text }]}>PKR {total}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, color: '#FDF6EC', fontWeight: '900' },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  body: { padding: 16 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  browseBtn: { backgroundColor: '#1C0A00', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  browseBtnText: { color: '#FDF6EC', fontWeight: '700', fontSize: 15 },

  cartItem: { flexDirection: 'row', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  itemThumb: { width: 60, height: 60, borderRadius: 14, backgroundColor: '#C68642', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemThumbEmoji: { fontSize: 26 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  itemOpts: { fontSize: 12, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 16, fontWeight: '800' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '700' },
  qtyNum: { fontSize: 15, fontWeight: '700', minWidth: 16, textAlign: 'center' },

  couponBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, gap: 10, marginTop: 6, marginBottom: 12, borderWidth: 1.5 },
  couponInput: { flex: 1, fontSize: 14, paddingVertical: 8 },
  applyBtn: { backgroundColor: '#E8A045', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  loyaltyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 16, gap: 12, borderWidth: 1.5 },
  loyaltyIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFF8E8', alignItems: 'center', justifyContent: 'center' },
  loyaltyText: { flex: 1 },
  loyaltyTitle: { fontSize: 14, fontWeight: '700' },
  loyaltySub: { fontSize: 12, marginTop: 2 },

  summaryBox: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  summaryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '500' },
  discountLabel: { fontSize: 13, color: '#2ECC71' },
  discountValue: { fontSize: 13, color: '#2ECC71', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, paddingTop: 10, marginTop: 6 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 16, fontWeight: '800' },

  checkoutBtn: { backgroundColor: '#1C0A00', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  checkoutBtnText: { color: '#FDF6EC', fontSize: 16, fontWeight: '700' },
});

export default CartScreen;