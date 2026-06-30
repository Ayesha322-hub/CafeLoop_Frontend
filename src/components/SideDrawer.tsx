import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  activeScreen: 'Home' | 'Profile';
}

const SideDrawer = ({ visible, onClose, navigation, activeScreen }: SideDrawerProps) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  const handleSignOut = () => {
    onClose();
    setTimeout(() => {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]);
    }, 250);
  };

  // Don't render at all when fully closed (perf + avoids blocking touches)
  if (!visible && (slideAnim as any).__getValue?.() === -DRAWER_WIDTH) {
    // still allow the closing animation to finish by rendering while fadeAnim > 0
  }

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: visible ? 999 : -1 }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Dark overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sliding panel */}
      <Animated.View
        style={[
          styles.drawer,
          { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>☕</Text>
            </View>
            <Text style={styles.appName}>CafeLoop</Text>
          </View>

          {/* Menu items */}
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Home' && styles.menuItemActive]}
              onPress={() => handleNavigate('Home')}
            >
              <Text style={styles.menuIcon}>🏠</Text>
              <Text style={[styles.menuLabel, activeScreen === 'Home' && styles.menuLabelActive]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Profile' && styles.menuItemActive]}
              onPress={() => handleNavigate('Profile')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={[styles.menuLabel, activeScreen === 'Profile' && styles.menuLabelActive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign out — pinned to bottom */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutLabel}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 28 },
  appName: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },

  menuSection: { flex: 1, paddingHorizontal: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemActive: { backgroundColor: '#FFF3E0' },
  menuIcon: { fontSize: 20, marginRight: 14, width: 24 },
  menuLabel: { fontSize: 15, color: '#444', fontWeight: '500' },
  menuLabelActive: { color: '#6B4226', fontWeight: '700' },

  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  signOutIcon: { fontSize: 20, marginRight: 14, width: 24 },
  signOutLabel: { fontSize: 15, color: '#e74c3c', fontWeight: '700' },
});

export default SideDrawer;