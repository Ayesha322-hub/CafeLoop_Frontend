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
import { useTheme } from '../../theme/ThemeContext';

const STATUS_COLORS: Record<string, string> = {
  pending: '#E8A045',
  accepted: '#3498db',
  preparing: '#E8A045',
  ready: '#2ECC71',
  completed: '#2ECC71',
  cancelled: '#e74c3c',
};

const OrderHistoryScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res: any = await apiClient.get('/users/me/orders');
      setOrders(res?.orders || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.foam }]}>
        <ActivityIndicator size="large" color={theme.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.foam }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient colors={[theme.coffee, '#4A2000']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History 📦</Text>
          <Text style={styles.headerSubtitle}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.muted }]}>
                Your past orders will show up here
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseBtnText}>Browse Cafes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order: any) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
              >
                <View style={styles.orderCardTop}>
                  <Text style={[styles.orderCafeName, { color: theme.text }]}>
                    {order.cafe?.name || 'Cafe'}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: (STATUS_COLORS[order.status] || theme.muted) + '22' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] || theme.muted }]}>
                      {order.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.orderDate, { color: theme.muted }]}>
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Text>
                <View style={styles.orderCardBottom}>
                  <Text style={[styles.orderItemsCount, { color: theme.muted }]}>
                    {order.items?.length || 0} items
                  </Text>
                  <Text style={[styles.orderTotal, { color: theme.text }]}>
                    PKR {order.total}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 16, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#E8A045', fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 24, color: '#FDF6EC', fontWeight: '900' },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  body: { padding: 16 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center' },
  browseBtn: { backgroundColor: '#1C0A00', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  browseBtnText: { color: '#FDF6EC', fontWeight: '700', fontSize: 15 },

  orderCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  orderCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderCafeName: { fontSize: 16, fontWeight: '700' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  orderDate: { fontSize: 12, marginBottom: 12 },
  orderCardBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  orderItemsCount: { fontSize: 13 },
  orderTotal: { fontSize: 15, fontWeight: '800' },
});

export default OrderHistoryScreen;