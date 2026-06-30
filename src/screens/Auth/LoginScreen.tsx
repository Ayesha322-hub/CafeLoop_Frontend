import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth.store';

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

const LoginScreen = ({ navigation }: any) => {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password');
      return;
    }
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Login Failed', err?.message || JSON.stringify(err) || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient
          colors={[COLORS.coffee, '#4A2000']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>☕</Text>
          <Text style={styles.welcomeText}>Welcome back ☕</Text>
          <Text style={styles.headerTitle}>Sign in to{'\n'}CaféLoop</Text>
          <Text style={styles.headerSubtitle}>Your morning routine, simplified.</Text>
        </LinearGradient>

        {/* ── Form ── */}
        <View style={styles.body}>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputIconWrap}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.inputField}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputIconWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.inputField}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#bbb"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtnWrap}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.coffee, '#4A2000']}
              style={styles.loginBtn}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.cream} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.foam },
  header: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 28,
    overflow: 'hidden',
  },
  headerEmoji: {
    position: 'absolute',
    fontSize: 120,
    right: -20,
    top: -20,
    opacity: 0.08,
  },
  welcomeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.cream,
    lineHeight: 38,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 6,
  },
  body: { padding: 24, paddingTop: 32 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputIconWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: {
    position: 'absolute',
    left: 16,
    fontSize: 18,
    opacity: 0.4,
    zIndex: 1,
  },
  inputField: {
    width: '100%',
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 18,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  forgotLink: {
    textAlign: 'right',
    fontSize: 13,
    color: COLORS.caramel,
    fontWeight: '500',
    marginBottom: 24,
  },
  loginBtnWrap: { marginBottom: 16, borderRadius: 16 },
  loginBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: { fontSize: 14, color: COLORS.muted },
  signupLink: { fontSize: 14, color: COLORS.caramel, fontWeight: '600' },
});

export default LoginScreen;