import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useOrderTracking } from '../../hooks/useOrderTracking';

const COLORS = {
  coffee: '#1C0A00',
  caramel: '#C68642',
  cream: '#FDF6EC',
  foam: '#FFF8F0',
  gold: '#E8A045',
  text: '#1C0A00',
  muted: '#8B6F5E',
  border: '#EDE0D4',
  success: '#2ECC71',
};

const STEPS = [
  { key: 'pending', title: 'Order Placed', icon: '✓' },
  { key: 'accepted', title: 'Order Accepted', icon: '✓' },
  { key: 'preparing', title: 'Preparing Your Order', icon: '☕' },
  { key: 'ready', title: 'Ready for Pickup', icon: '🔔' },
  { key: 'completed', title: 'Completed', icon: '✓' },
];

const OrderTrackingScreen = ({ route }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { status } = useOrderTracking(orderId);

  useEffect(() => {
    loadOrder();
  }, []);

  // Refresh full order data when live status updates via WebSocket
  useEffect(() => {
    if (status) loadOrder();
  }, [status]);

  const loadOrder = async () => {
    try {
      const res: any = await apiClient.get(`/orders/${orderId}`);
      setOrder(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  const currentStatus = order?.status || 'pending';
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient colors={[COLORS.coffee, '#4A2000']} style={styles.header}>
          <Text style={styles.headerTitle}>Order Tracking 📦</Text>
          <Text style={styles.headerSubtitle}>Real-time updates on your order</Text>
          <View style={styles.orderIdPill}>
            <Text style={styles.orderIdText}>
              CL-{orderId?.slice(-8).toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>

          {/* ── Cafe Info ── */}
          <View style={styles.cafeInfoCard}>
            <View style={styles.cafeInfoThumb}>
              <Text style={{ fontSize: 26 }}>☕</Text>
            </View>
            <View style={styles.cafeInfoText}>
              <Text style={styles.cafeInfoName}>{order?.cafe?.name}</Text>
              <Text style={styles.cafeInfoAddr}>📍 {order?.cafe?.address}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* ── Tracking Steps ── */}
          <View style={styles.trackingSteps}>
            {STEPS.map((step, index) => {
              const isDone = index < currentIndex || (index === currentIndex && currentStatus === 'completed');
              const isCurrent = index === currentIndex && currentStatus !== 'completed';
              const isPending = index > currentIndex;

              return (
                <View key={step.key} style={styles.trackingStep}>
                  <View style={styles.stepIndicator}>
                    <View
                      style={[
                        styles.stepCircle,
                        isDone && styles.stepCircleDone,
                        isCurrent && styles.stepCircleCurrent,
                        isPending && styles.stepCirclePending,
                      ]}
                    >
                      <Text style={[
                        styles.stepCircleText,
                        (isDone || isCurrent) && { color: '#fff' },
                      ]}>
                        {step.icon}
                      </Text>
                    </View>
                    {index < STEPS.length - 1 && (
                      <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, isPending && styles.stepTitlePending]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepTime}>
                      {isCurrent ? 'In progress...' : isPending ? 'Waiting...' : 'Done'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Order Items ── */}
          <View style={styles.trackItems}>
            <Text style={styles.trackItemsTitle}>Order Items</Text>
            {(order?.items || []).map((item: any) => (
              <View key={item.id} style={styles.trackItemRow}>
                <Text style={styles.trackItemLabel}>☕ {item.name} x{item.quantity}</Text>
                <Text style={styles.trackItemValue}>PKR {item.unitPrice * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.trackTotal}>
              <Text style={styles.trackTotalLabel}>Total Paid</Text>
              <Text style={styles.trackTotalValue}>PKR {order?.total}</Text>
            </View>
          </View>

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
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4, marginBottom: 16 },
  orderIdPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  orderIdText: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  body: { padding: 16 },

  cafeInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    shadowColor: COLORS.coffee,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cafeInfoThumb: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: COLORS.caramel,
    alignItems: 'center', justifyContent: 'center',
  },
  cafeInfoText: { flex: 1 },
  cafeInfoName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cafeInfoAddr: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  callBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.foam,
    alignItems: 'center', justifyContent: 'center',
  },

  trackingSteps: { marginBottom: 24 },
  trackingStep: { flexDirection: 'row' },
  stepIndicator: { alignItems: 'center', marginRight: 14 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.border,
  },
  stepCircleDone: { backgroundColor: COLORS.success },
  stepCircleCurrent: { backgroundColor: COLORS.gold, shadowColor: COLORS.gold, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  stepCirclePending: { backgroundColor: COLORS.border },
  stepCircleText: { fontSize: 16, color: COLORS.muted },
  stepLine: { width: 2, height: 40, backgroundColor: COLORS.border, marginTop: 2 },
  stepLineDone: { backgroundColor: COLORS.success },
  stepContent: { paddingTop: 6, paddingBottom: 26 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  stepTitlePending: { color: COLORS.muted },
  stepTime: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  trackItems: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.coffee,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  trackItemsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  trackItemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.foam,
  },
  trackItemLabel: { fontSize: 14, color: COLORS.text },
  trackItemValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  trackTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 },
  trackTotalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  trackTotalValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },
});

export default OrderTrackingScreen;