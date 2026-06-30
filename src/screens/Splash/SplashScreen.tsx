import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Design tokens from cafeloop-designs.html
const COLORS = {
  coffee: '#1C0A00',
  espresso: '#2D1200',
  caramel: '#C68642',
  cream: '#FDF6EC',
  foam: '#FFF8F0',
  gold: '#E8A045',
  accent: '#FF6B35',
  text: '#1C0A00',
  muted: '#8B6F5E',
};

const SplashScreen = ({ navigation }: any) => {
  return (
    <LinearGradient
      colors={['#1C0A00', '#3D1A00', '#6B3200']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Logo ── */}
      <View style={styles.logoSection}>
        <LinearGradient
          colors={[COLORS.gold, COLORS.accent]}
          style={styles.iconBox}
        >
          <Text style={styles.iconEmoji}>☕</Text>
        </LinearGradient>
        <Text style={styles.title}>
          Café<Text style={styles.titleAccent}>Loop</Text>
        </Text>
        <Text style={styles.tagline}>Your perfect cup, on demand</Text>
      </View>

      {/* ── Hero ── */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>🫖</Text>
        <Text style={styles.heroTitle}>Order ahead.{'\n'}Skip the queue.</Text>
        <Text style={styles.heroSubtitle}>
          Discover nearby cafés, customize{'\n'}your order, pay & pick up seamlessly.
        </Text>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actionsSection}>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <TouchableOpacity
          style={styles.primaryBtnWrap}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.gold, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.outlineBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  logoSection: { alignItems: 'center' },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  iconEmoji: { fontSize: 42 },
  title: {
    color: COLORS.cream,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  titleAccent: { color: COLORS.gold },
  tagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  heroSection: { alignItems: 'center' },
  heroEmoji: { fontSize: 100, textAlign: 'center' },
  heroTitle: {
    color: COLORS.cream,
    fontSize: 26,
    marginTop: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionsSection: { width: '100%' },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.gold,
  },
  primaryBtnWrap: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  outlineBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: COLORS.cream,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SplashScreen;