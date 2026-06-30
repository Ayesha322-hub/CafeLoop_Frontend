import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/auth.store';

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
};

const ProfileScreen = ({ navigation }: any) => {
  const { logout } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, loyaltyRes, referralRes]: any = await Promise.all([
        apiClient.get('/users/me'),
        apiClient.get('/loyalty'),
        apiClient.get('/referrals/my-code'),
      ]);
      setUser(userRes);
      setLoyalty(loyaltyRes);
      setReferral(referralRes);
      setNotifEnabled(userRes?.pushEnabled ?? true);
      setDarkMode(userRes?.darkMode ?? false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Sign Out',
      style: 'destructive',
      onPress: async () => {
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
    },
  ]);
};

  const handleToggleNotif = async (value: boolean) => {
    setNotifEnabled(value);
    try {
      await apiClient.patch('/users/me', { pushEnabled: value });
    } catch {}
  };

  const handleToggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    try {
      await apiClient.patch('/users/me', { darkMode: value });
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const progressPercent = loyalty?.progressPercent || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.profileHero}>
          <LinearGradient colors={[COLORS.gold, COLORS.accent]} style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* ── Loyalty Card ── */}
        <View style={styles.loyaltyCardWrap}>
          <LinearGradient
            colors={[COLORS.coffee, '#4A2000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loyaltyCard}
          >
            <View style={styles.loyaltyCardRow}>
              <View>
                <Text style={styles.loyaltyPointsBig}>{loyalty?.points || 0}</Text>
                <Text style={styles.loyaltyPointsLabel}>Loyalty Points</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.freeCoffeesText}>{loyalty?.freeCoffees || 0} Free Coffees</Text>
                <Text style={styles.freeCoffeesSub}>earned so far</Text>
              </View>
            </View>
            <View style={styles.loyaltyProgress}>
              <Text style={styles.progressLabel}>
                {loyalty?.pointsToNextFreeCoffee || 0} points to next free coffee
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.profileBody}>

          {/* ── Account Section ── */}
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.menuRowIcon, { backgroundColor: '#FFF0D4' }]}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={styles.menuRowText}>
                <Text style={styles.menuRowTitle}>Edit Profile</Text>
                <Text style={styles.menuRowSub}>Name, phone, avatar</Text>
              </View>
              <Text style={styles.menuRowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <View style={[styles.menuRowIcon, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{ fontSize: 18 }}>📦</Text>
              </View>
              <View style={styles.menuRowText}>
                <Text style={styles.menuRowTitle}>Order History</Text>
                <Text style={styles.menuRowSub}>{user?.totalOrders || 0} orders placed</Text>
              </View>
              <Text style={styles.menuRowArrow}>›</Text>
            </TouchableOpacity>

            <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.menuRowIcon, { backgroundColor: '#EDE8FF' }]}>
                <Text style={{ fontSize: 18 }}>🎟️</Text>
              </View>
              <View style={styles.menuRowText}>
                <Text style={styles.menuRowTitle}>My Referral Code</Text>
                <Text style={styles.menuRowSub}>
                  {referral?.referralCode} · {referral?.successfulReferrals || 0} friends joined
                </Text>
              </View>
              <Text style={styles.menuRowArrow}>›</Text>
            </View>
          </View>

          {/* ── Preferences Section ── */}
          <Text style={styles.menuSectionTitle}>Preferences</Text>
          <View style={styles.menuSection}>
            <View style={styles.menuRow}>
              <View style={[styles.menuRowIcon, { backgroundColor: '#FFF0F0' }]}>
                <Text style={{ fontSize: 18 }}>🔔</Text>
              </View>
              <View style={styles.menuRowText}>
                <Text style={styles.menuRowTitle}>Notifications</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: COLORS.border, true: COLORS.gold }}
                thumbColor="#fff"
              />
            </View>
            <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.menuRowIcon, { backgroundColor: '#F0F8FF' }]}>
                <Text style={{ fontSize: 18 }}>🌙</Text>
              </View>
              <View style={styles.menuRowText}>
                <Text style={styles.menuRowTitle}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: COLORS.border, true: COLORS.gold }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Text style={styles.logoutBtnText}>🚪 Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.foam },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileHero: { alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.muted, marginTop: 2 },

  loyaltyCardWrap: { paddingHorizontal: 16, marginBottom: 20 },
  loyaltyCard: { borderRadius: 20, padding: 20 },
  loyaltyCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  loyaltyPointsBig: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 48 },
  loyaltyPointsLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
  freeCoffeesText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  freeCoffeesSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  loyaltyProgress: { marginTop: 14 },
  progressLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 100, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 100 },

  profileBody: { paddingHorizontal: 16, paddingBottom: 30 },
  menuSectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginTop: 8,
  },
  menuSection: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16,
    shadowColor: COLORS.coffee, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.foam,
  },
  menuRowIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  menuRowText: { flex: 1 },
  menuRowTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuRowSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  menuRowArrow: { color: COLORS.muted, fontSize: 18 },

  logoutBtn: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#FCD9D9',
    paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8,
  },
  logoutBtnText: { color: '#e74c3c', fontSize: 15, fontWeight: '700' },
});

export default ProfileScreen;