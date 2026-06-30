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
  text: '#1C0A00',
  muted: '#8B6F5E',
  border: '#EDE0D4',
};

const ORDER_TYPES = [
  { key: 'pickup', icon: '🏃', label: 'Pickup' },
  { key: 'dine_in', icon: '🪑', label: 'Dine-In' },
  { key: 'delivery', icon: '🛵', label: 'Delivery' },
];

const PAYMENT_METHODS = [
  { key: 'stripe', icon: '💳', bg: '#635BFF22', name: 'Credit / Debit Card', desc: 'Visa, Mastercard via Stripe' },
  { key: 'jazzcash', icon: '📱', bg: '#C8102E22', name: 'JazzCash', desc: 'Pay with your JazzCash wallet' },
  { key: 'cash', icon: '💵', bg: '#2ECC7122', name: 'Cash on Pickup', desc: 'Pay when you collect your order' },
];

const PaymentScreen = ({ route, navigation }: any) => {
  const { couponCode, useLoyaltyPoints } = route.params || {};

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderType, setOrderType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cnic, setCnic] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res: any = await apiClient.get('/cart');
      setCart(res);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = (cart?.items || []).reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0
  );
  const total = subtotal; // discounts already applied in cart screen state if needed

  const handlePay = async () => {
    setPlacing(true);
    try {
      let stripePaymentIntentId: string | undefined;
      let jazzCashTxnRef: string | undefined;

      if (paymentMethod === 'stripe') {
        const intent: any = await apiClient.post('/payments/stripe/intent', {
          amount: total,
          orderId: 'temp',
        });
        stripePaymentIntentId = intent.paymentIntentId;
      }

      if (paymentMethod === 'jazzcash') {
        const result: any = await apiClient.post('/payments/jazzcash', {
          amount: total,
          orderId: 'temp',
          mobileNumber: mobileNumber || '03001234567',
          userId: 'temp',
        });
        jazzCashTxnRef = result.txnRefNo;
      }

      const order: any = await apiClient.post('/orders', {
        cafeId: cart?.cafe?.id,
        orderType,
        paymentMethod,
        useLoyaltyPoints: !!useLoyaltyPoints,
        couponCode,
        stripePaymentIntentId,
        jazzCashTxnRef,
      });

      navigation.replace('OrderTracking', { orderId: order.id });
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  const selectedMethod = PAYMENT_METHODS.find((m) => m.key === paymentMethod);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient colors={[COLORS.coffee, '#4A2000']} style={styles.header}>
          <Text style={styles.headerTitle}>Checkout 💳</Text>
          <Text style={styles.headerSubtitle}>
            PKR {total} · {cart?.items?.length || 0} items
          </Text>
        </LinearGradient>

        <View style={styles.body}>

          {/* ── Order Type ── */}
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.orderTypeRow}>
            {ORDER_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.orderTypeBtn, orderType === type.key && styles.orderTypeBtnActive]}
                onPress={() => setOrderType(type.key)}
              >
                <Text style={styles.orderTypeIcon}>{type.icon}</Text>
                <Text style={[styles.orderTypeText, orderType === type.key && styles.orderTypeTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Payment Method ── */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.methodOption,
                paymentMethod === method.key && styles.methodOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.key)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.bg }]}>
                <Text style={{ fontSize: 20 }}>{method.icon}</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
              <View style={[styles.radioDot, paymentMethod === method.key && styles.radioDotSelected]}>
                {paymentMethod === method.key && <View style={styles.radioDotInner} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* ── JazzCash Form ── */}
          {paymentMethod === 'jazzcash' && (
            <View style={styles.jazzcashForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>JazzCash Number</Text>
                <View style={styles.inputIconWrap}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="03001234567"
                    placeholderTextColor="#bbb"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>CNIC (optional)</Text>
                <View style={styles.inputIconWrap}>
                  <Text style={styles.inputIcon}>🪪</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="3520112345678"
                    placeholderTextColor="#bbb"
                    value={cnic}
                    onChangeText={setCnic}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.payNowBtn, placing && styles.payNowBtnDisabled]}
            onPress={handlePay}
            disabled={placing}
          >
            {placing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payNowBtnText}>
                Pay PKR {total} via {selectedMethod?.name}
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.foam },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 26, color: COLORS.cream, fontWeight: '900' },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  body: { padding: 16 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginTop: 8 },

  orderTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  orderTypeBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderTypeBtnActive: { backgroundColor: COLORS.coffee, borderColor: COLORS.coffee },
  orderTypeIcon: { fontSize: 22, marginBottom: 4 },
  orderTypeText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  orderTypeTextActive: { color: COLORS.cream },

  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  methodOptionSelected: { borderColor: COLORS.gold, backgroundColor: COLORS.foam },
  methodIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  methodDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  radioDot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDotSelected: { borderColor: COLORS.gold },
  radioDotInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gold },

  jazzcashForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  inputIconWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 14, fontSize: 16, opacity: 0.5, zIndex: 1 },
  inputField: {
    backgroundColor: COLORS.foam,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingLeft: 42,
    paddingRight: 14,
    fontSize: 14,
    color: COLORS.text,
  },

  payNowBtn: {
    backgroundColor: COLORS.coffee,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  payNowBtnDisabled: { opacity: 0.6 },
  payNowBtnText: { color: COLORS.cream, fontSize: 16, fontWeight: '700' },
});

export default PaymentScreen;