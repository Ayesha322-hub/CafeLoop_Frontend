import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { cartApi } from '../../api/cart.api';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { loyaltyApi } from '../../api/loyalty.api';

const PlaceOrderScreen = ({ navigation }: any) => {
  const [cart, setCart] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderType, setOrderType] = useState<'pickup' | 'dine_in' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'jazzcash' | 'cash'>('cash');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // ── Load cart and loyalty on mount ──────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartData, loyaltyData] = await Promise.all([
        cartApi.getCart(),
        loyaltyApi.getStatus(),
      ]);
      setCart(cartData);
      setLoyalty(loyaltyData);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // ── Apply Coupon ─────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result: any = await cartApi.validateCoupon(couponCode, cart?.subtotal);
      setCouponDiscount(result.discount);
      Alert.alert('✅ Coupon Applied', `You saved PKR ${result.discount}`);
    } catch (err: any) {
      Alert.alert('Invalid Coupon', err.message);
    }
  };

  // ── Calculate Total ──────────────────────────────────────────
  const loyaltyDiscount = useLoyaltyPoints
    ? Math.min(loyalty?.points || 0, cart?.subtotal || 0)
    : 0;

  const total = (cart?.subtotal || 0) - couponDiscount - loyaltyDiscount;

  // ── Place Order ──────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart first');
      return;
    }

    setPlacing(true);
    try {
      let stripePaymentIntentId: string | undefined;

      // Handle Stripe payment
      if (paymentMethod === 'stripe') {
        const intentResult: any = await paymentsApi.createStripeIntent(total, 'temp');
        // In real app: use Stripe SDK to confirm payment here
        // const { error } = await confirmPayment(intentResult.clientSecret, {...});
        stripePaymentIntentId = intentResult.paymentIntentId;
      }

      // Place the order
      const order: any = await ordersApi.create({
        cafeId: cart.cafe.id,
        orderType,
        paymentMethod,
        useLoyaltyPoints,
        couponCode: couponCode || undefined,
        stripePaymentIntentId,
      });

      // Navigate to tracking screen
      navigation.replace('OrderTracking', { orderId: order.id });

    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Something went wrong');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* ── Cart Items ── */}
      <Text style={styles.sectionTitle}>Your Order</Text>
      {cart?.items?.map((item: any) => (
        <View key={item.id} style={styles.cartItem}>
          <Text style={styles.itemName}>{item.menuItem?.name}</Text>
          <Text style={styles.itemQty}>x{item.quantity}</Text>
          <Text style={styles.itemPrice}>PKR {item.unitPrice * item.quantity}</Text>
        </View>
      ))}

      {/* ── Order Type ── */}
      <Text style={styles.sectionTitle}>Order Type</Text>
      <View style={styles.optionRow}>
        {(['pickup', 'dine_in', 'delivery'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.optionBtn, orderType === type && styles.optionBtnActive]}
            onPress={() => setOrderType(type)}
          >
            <Text style={[styles.optionText, orderType === type && styles.optionTextActive]}>
              {type === 'pickup' ? '🛍 Pickup' : type === 'dine_in' ? '🪑 Dine In' : '🚚 Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Payment Method ── */}
      <Text style={styles.sectionTitle}>Payment</Text>
      <View style={styles.optionRow}>
        {(['cash', 'jazzcash', 'stripe'] as const).map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.optionBtn, paymentMethod === method && styles.optionBtnActive]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={[styles.optionText, paymentMethod === method && styles.optionTextActive]}>
              {method === 'cash' ? '💵 Cash' : method === 'jazzcash' ? '📱 JazzCash' : '💳 Card'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Coupon ── */}
      <Text style={styles.sectionTitle}>Coupon Code</Text>
      <View style={styles.couponRow}>
        <View style={styles.couponInput}>
          <Text style={{ color: couponCode ? '#000' : '#999' }}>
            {couponCode || 'Enter coupon code'}
          </Text>
        </View>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* ── Loyalty Points ── */}
      {loyalty?.points > 0 && (
        <TouchableOpacity
          style={styles.loyaltyRow}
          onPress={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
        >
          <View style={styles.checkbox}>
            {useLoyaltyPoints && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.loyaltyText}>
            Use {loyalty.points} loyalty points (Save PKR {loyalty.points})
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Price Breakdown ── */}
      <View style={styles.priceBox}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>PKR {cart?.subtotal}</Text>
        </View>
        {couponDiscount > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: 'green' }]}>Coupon Discount</Text>
            <Text style={[styles.priceValue, { color: 'green' }]}>- PKR {couponDiscount}</Text>
          </View>
        )}
        {loyaltyDiscount > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: 'green' }]}>Loyalty Points</Text>
            <Text style={[styles.priceValue, { color: 'green' }]}>- PKR {loyaltyDiscount}</Text>
          </View>
        )}
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>PKR {total}</Text>
        </View>
      </View>

      {/* ── Place Order Button ── */}
      <TouchableOpacity
        style={[styles.placeOrderBtn, placing && styles.placeOrderBtnDisabled]}
        onPress={handlePlaceOrder}
        disabled={placing}
      >
        {placing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderText}>Place Order · PKR {total}</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginTop: 20, marginBottom: 10 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { flex: 1, fontSize: 14, color: '#333' },
  itemQty: { fontSize: 14, color: '#666', marginHorizontal: 10 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  optionBtnActive: { borderColor: '#6B4226', backgroundColor: '#6B4226' },
  optionText: { fontSize: 12, color: '#666' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  applyBtn: { backgroundColor: '#6B4226', padding: 12, borderRadius: 8, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '600' },
  loyaltyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#6B4226', alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#6B4226', fontWeight: '700' },
  loyaltyText: { fontSize: 14, color: '#333' },
  priceBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 14, color: '#333' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#6B4226' },
  placeOrderBtn: { backgroundColor: '#6B4226', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  placeOrderBtnDisabled: { backgroundColor: '#bbb' },
  placeOrderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PlaceOrderScreen;