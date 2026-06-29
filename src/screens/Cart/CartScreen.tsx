import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import apiClient from '../../api/client';

const CartScreen = ({ navigation }: any) => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res: any = await apiClient.get('/cart');
      setCart(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await apiClient.delete(`/cart/items/${itemId}`);
      // Refresh cart
      loadCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await apiClient.patch(`/cart/items/${itemId}`, { quantity });
      loadCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update quantity');
    }
  };

  const handlePlaceOrder = async () => {
  if (!cart?.items?.length) {
    Alert.alert('Empty Cart', 'Add some items before placing an order.');
    return;
  }

  setPlacingOrder(true);

  try {
    await apiClient.post('/orders', {
      paymentMethod: 'CASH',
    });

    Alert.alert('🎉 Order Placed!', 'Your order has been placed successfully.', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  } catch (err: any) {
    Alert.alert('Error', err.message || 'Failed to place order');
  } finally {
    setPlacingOrder(false);
  }
};

  const handleClearCart = async () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete('/cart');
            loadCart();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0
  );
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        /* ── Empty State ── */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items from a cafe to get started</Text>
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
          <FlatList
            data={items}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: any) => (
              <View style={styles.cartItem}>
                {/* Item Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.menuItem?.name || item.name}</Text>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <Text style={styles.itemCustom}>
                      {Object.entries(item.customizations)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>PKR {item.unitPrice}</Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Line Total */}
                <Text style={styles.lineTotal}>
                  PKR {item.unitPrice * item.quantity}
                </Text>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.divider} />
            }
          />

          {/* ── Order Summary ── */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>PKR {subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>PKR {deliveryFee}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>PKR {total}</Text>
            </View>

            <TouchableOpacity
              style={[styles.orderBtn, placingOrder && styles.orderBtnDisabled]}
              onPress={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderBtnText}>
                  Place Order · PKR {total}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: '#6B4226', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, color: '#e74c3c', fontWeight: '600' },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', marginBottom: 32, textAlign: 'center' },
  browseBtn: { backgroundColor: '#6B4226', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // List
  listContent: { padding: 16, paddingBottom: 8 },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  itemInfo: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  itemCustom: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  itemPrice: { fontSize: 13, color: '#6B4226', fontWeight: '600' },

  // Quantity
  qtyControls: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: 18, color: '#6B4226', fontWeight: '700', lineHeight: 22 },
  qtyText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginHorizontal: 10 },

  // Line total
  lineTotal: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', minWidth: 70, textAlign: 'right' },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },

  // Summary
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 4, marginBottom: 16 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#6B4226' },

  // Order Button
  orderBtn: {
    backgroundColor: '#6B4226',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CartScreen;