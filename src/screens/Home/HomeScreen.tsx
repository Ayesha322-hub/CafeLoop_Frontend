import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiClient from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideDrawer from '../../components/SideDrawer';

const HomeScreen = ({ navigation }: any) => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Token:', token);

      const cafesRes: any = await apiClient.get('/cafes');
      console.log('Cafes response:', JSON.stringify(cafesRes));

      const userRes: any = await apiClient.get('/users/me');
      console.log('User response:', JSON.stringify(userRes));

      setCafes(cafesRes?.cafes || cafesRes || []);
      setUser(userRes);
    } catch (err: any) {
      console.log('Error:', JSON.stringify(err));
      Alert.alert('Error', JSON.stringify(err));
    } finally {
      setLoading(false);
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
    <View style={styles.container}>

      {/* Top bar with hamburger */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.hamburgerBtn}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>CafeLoop</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day ☕</Text>
          <Text style={styles.name}>{user?.name || 'Welcome'}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {user?.loyaltyPoints || 0} pts</Text>
        </View>
      </View>

      {/* Search bar placeholder */}
      <TouchableOpacity style={styles.searchBar}>
        <Text style={styles.searchText}>🔍 Search cafes...</Text>
      </TouchableOpacity>

      {/* Cafes list */}
      <Text style={styles.sectionTitle}>Nearby Cafes</Text>

      {cafes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>☕ No cafes yet</Text>
          <Text style={styles.emptySubtext}>Add cafes from the admin panel</Text>
        </View>
      ) : (
        <FlatList
          data={cafes}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={styles.cafeCard}
              onPress={() => navigation.navigate('CafeDetail', { cafeId: item.id })}
            >
              <View style={styles.cafeInfo}>
                <Text style={styles.cafeName}>{item.name}</Text>
                <Text style={styles.cafeAddress}>{item.address}</Text>
                <View style={styles.cafeFooter}>
                  <Text style={styles.rating}>⭐ {item.rating}</Text>
                  <Text style={[styles.status, { color: item.isOpen ? 'green' : 'red' }]}>
                    {item.isOpen ? '● Open' : '● Closed'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Slide-in drawer */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
        activeScreen="Home"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hamburgerBtn: { width: 40, justifyContent: 'center' },
  hamburgerIcon: { fontSize: 24, color: '#1a1a1a' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 16, paddingHorizontal: 16 },
  greeting: { fontSize: 14, color: '#888' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  pointsBadge: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 12 },
  pointsText: { color: '#6B4226', fontWeight: '600' },
  searchBar: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 20, marginHorizontal: 16, borderWidth: 1, borderColor: '#eee' },
  searchText: { color: '#999', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, paddingHorizontal: 16 },
  cafeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, marginHorizontal: 16, elevation: 2 },
  cafeInfo: { flex: 1 },
  cafeName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cafeAddress: { fontSize: 13, color: '#888', marginBottom: 8 },
  cafeFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  rating: { fontSize: 13, color: '#F4A300' },
  status: { fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 20, color: '#888', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#bbb' },
});

export default HomeScreen;