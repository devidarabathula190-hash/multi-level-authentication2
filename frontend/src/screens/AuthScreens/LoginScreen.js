import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import authService from '../../services/authService';
import { theme } from '../../theme';

export default function LoginScreen({ navigation }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Floating effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert("Required", "Please enter your credentials to login.");
      return;
    }

    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await authService.login({ login_id: loginId, password });
      const { access, user } = response.data;
      dispatch(loginSuccess({ token: access, user }));
    } catch (error) {
      console.error("Login catch:", error);
      const errorMsg = error.response?.data?.error || error.message || "Invalid login credentials";
      dispatch(loginFailure(errorMsg));
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🏦</Text>
            </View>
          </Animated.View>
          
          <Text style={styles.title}>Machine Learning Based Secure Cardless Financial Transaction Using Multifactor Authentication</Text>
          <Text style={styles.subtitle}>The Future of Secure Finance</Text>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>LOGIN ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your login ID"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={loginId}
                onChangeText={setLoginId}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              <LinearGradient 
                colors={[theme.colors.success, '#1d976c']} 
                style={styles.btnGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>AUTHENTICATE</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerContainer} onPress={() => navigation.navigate('Registration')}>
              <Text style={styles.registerLink}>New user? <Text style={styles.registerLinkBold}>Create Secure Account</Text></Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    ...theme.shadows.gold,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 40,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    maxWidth: 450,
    padding: 30,
    borderRadius: 35,
    backgroundColor: 'rgba(25, 34, 60, 0.9)', // More solid background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...theme.shadows.premium,
  },
  inputWrapper: {
    marginBottom: 25,
  },
  inputLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 5,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 18,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginBtn: {
    borderRadius: 18,
    height: 65,
    marginTop: 10,
    overflow: 'hidden',
    ...theme.shadows.gold,
    shadowColor: theme.colors.success,
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  registerContainer: {
    marginTop: 30,
  },
  registerLink: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 15,
  },
  registerLinkBold: {
    color: '#FFD700',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }
});
