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

const RegisterScreen = ({ navigation }: any) => {
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        name,
        email,
        phone: phone || undefined,
        password,
      });
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message || JSON.stringify(err) || 'Something went wrong');
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
          <Text style={styles.welcomeText}>Join us ☕</Text>
          <Text style={styles.headerTitle}>Create your{'\n'}CaféLoop account</Text>
          <Text style={styles.headerSubtitle}>Earn points with every cup.</Text>
        </LinearGradient>

        {/* ── Form ── */}
        <View style={styles.body}>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputIconWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.inputField}
                value={name}
                onChangeText={setName}
                placeholder=""
                placeholderTextColor="#bbb"
                autoCapitalize="words"
              />
            </View>
          </View>

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
            <Text style={styles.inputLabel}>Phone (optional)</Text>
            <View style={styles.inputIconWrap}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.inputField}
                value={phone}
                onChangeText={setPhone}
                placeholder="03XX XXXXXXX"
                placeholderTextColor="#bbb"
                keyboardType="phone-pad"
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputIconWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.inputField}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#bbb"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerBtnWrap}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.coffee, '#4A2000']}
              style={styles.registerBtn}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.cream} />
              ) : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.cream,
    lineHeight: 36,
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
  registerBtnWrap: { marginTop: 8, marginBottom: 16, borderRadius: 16 },
  registerBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  registerBtnText: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  loginText: { fontSize: 14, color: COLORS.muted },
  loginLink: { fontSize: 14, color: COLORS.caramel, fontWeight: '600' },
});

export default RegisterScreen;