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

const COLORS = {
  coffee: '#1C0A00',
  caramel: '#C68642',
  cream: '#FDF6EC',
  foam: '#FFF8F0',
  gold: '#E8A045',
  accent: '#FF6B35',
  text: '#1C0A00',
  muted: '#8B6F5E',
  border: '#EDE0D4',
  success: '#2ECC71',
};

const CartScreen = ({ navigation }: any) => {
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.gold} />
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient
          colors={[COLORS.coffee, '#4A2000']}
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
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
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
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemThumb}>
                    <Text style={styles.itemThumbEmoji}>☕</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.menuItem?.name || item.name}</Text>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <Text style={styles.itemOpts}>
                        {Object.values(item.customizations).join(' · ')}
                      </Text>
                    )}
                    <View style={styles.itemRow}>
                      <Text style={styles.itemPrice}>PKR {item.unitPrice}</Text>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* ── Coupon Box ── */}
              <View style={styles.couponBox}>
                <Text style={{ fontSize: 20 }}>🎟️</Text>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code..."
                  placeholderTextColor="#bbb"
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
                <View style={styles.loyaltyRow}>
                  <View style={styles.loyaltyIcon}>
                    <Text style={{ fontSize: 18 }}>⭐</Text>
                  </View>
                  <View style={styles.loyaltyText}>
                    <Text style={styles.loyaltyTitle}>Use {loyaltyPoints} loyalty points</Text>
                    <Text style={styles.loyaltySub}>Save PKR {loyaltyPoints} on this order</Text>
                  </View>
                  <Switch
                    value={useLoyalty}
                    onValueChange={setUseLoyalty}
                    trackColor={{ false: COLORS.border, true: COLORS.gold }}
                    thumbColor="#fff"
                  />
                </View>
              )}

              {/* ── Order Summary ── */}
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>PKR {subtotal}</Text>
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
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>PKR {deliveryFee}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>PKR {total}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.foam },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontFamily: 'serif', fontSize: 26, color: COLORS.cream, fontWeight: '900' },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  body: { padding: 16 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 24 },
  browseBtn: { backgroundColor: COLORS.coffee, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  browseBtnText: { color: COLORS.cream, fontWeight: '700', fontSize: 15 },

  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: COLORS.coffee,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  itemThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: COLORS.caramel,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemThumbEmoji: { fontSize: 26 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  itemOpts: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 16, fontWeight: '800', color: COLORS.coffee },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: COLORS.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, color: COLORS.coffee, fontWeight: '700' },
  qtyNum: { fontSize: 15, fontWeight: '700', color: COLORS.text, minWidth: 16, textAlign: 'center' },

  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  couponInput: { flex: 1, fontSize: 14, color: COLORS.text, paddingVertical: 8 },
  applyBtn: { backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  loyaltyIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#FFF8E8',
    alignItems: 'center', justifyContent: 'center',
  },
  loyaltyText: { flex: 1 },
  loyaltyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  loyaltySub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.coffee,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 13, color: COLORS.muted },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  discountLabel: { fontSize: 13, color: COLORS.success },
  discountValue: { fontSize: 13, color: COLORS.success, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 6 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  checkoutBtn: {
    backgroundColor: COLORS.coffee,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutBtnText: { color: COLORS.cream, fontSize: 16, fontWeight: '700' },
});

export default CartScreen;