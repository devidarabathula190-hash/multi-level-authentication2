import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FaceCamera from '../../components/FaceCamera';
import authService from '../../services/authService';
import { theme } from '../../theme';

export default function RegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    login_id: '',
    mobile: '',
    email: '',
    address: '',
    password: '',
  });
  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Anim
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleFaceCaptured = (photo) => {
    setFaceImage(photo.uri);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!formData.name || !formData.login_id || !formData.password || !formData.mobile) {
      Alert.alert("Missing Info", "Please fill name, login_id, mobile, and password.");
      return;
    }
    if (!faceImage) {
      Alert.alert("Scan Required", "Please use the camera scan below to authorize.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (Platform.OS === 'web') {
        const response = await fetch(faceImage);
        const blob = await response.blob();
        data.append('face_image', blob, 'reg_face.jpg');
      } else {
        data.append('face_image', {
          uri: faceImage,
          name: 'face.jpg',
          type: 'image/jpeg',
        });
      }

      await authService.register(data);
      // Auto navigate to login
      navigation.navigate('Login');
    } catch (error) {
      console.error("DEBUG REG ERROR:", error);
      const bErr = error.response?.data;
      let detailedError = "";
      if (bErr) {
        detailedError = Object.keys(bErr).map(k => `${k.toUpperCase()}: ${bErr[k]}`).join("\n");
      } else {
        detailedError = error.message;
      }
      setErrorMsg(detailedError);
      Alert.alert("Registration Refused", detailedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Secure Archive</Text>
            <Text style={styles.subtitle}>CREATE NEW SYSTEM IDENTITY</Text>

            <View style={styles.card}>
              {errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ VALIDATION ERROR:</Text>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <View style={styles.inputStack}>
                 <Text style={styles.label}>FULL IDENTITY NAME</Text>
                 <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="rgba(255,255,255,0.3)" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
              </View>

              <View style={styles.inputGrid}>
                <View style={[styles.inputStack, { flex: 1 }]}>
                    <Text style={styles.label}>SYSTEM LOGIN ID</Text>
                    <TextInput style={styles.input} placeholder="Unique ID" autoCapitalize="none" value={formData.login_id} onChangeText={(t) => setFormData({...formData, login_id: t})} />
                </View>
                <View style={[styles.inputStack, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.label}>REGISTERED MOBILE</Text>
                    <TextInput style={styles.input} placeholder="+91..." keyboardType="numeric" value={formData.mobile} onChangeText={(t) => setFormData({...formData, mobile: t})} />
                </View>
              </View>

              <View style={styles.inputStack}>
                 <Text style={styles.label}>SECURED EMAIL</Text>
                 <TextInput style={styles.input} placeholder="email@provider.com" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} />
              </View>

              <View style={styles.inputStack}>
                 <Text style={styles.label}>HOME ADDRESS</Text>
                 <TextInput style={styles.input} placeholder="Enter your full address" value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} />
              </View>

              <View style={styles.inputStack}>
                 <Text style={styles.label}>LEDGER PASSWORD</Text>
                 <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={formData.password} onChangeText={(t) => setFormData({...formData, password: t})} />
              </View>

              <Text style={styles.label}>IDENTITY HANDSHAKE (BIOMETRIC)</Text>
              {faceImage ? (
                <View style={styles.capturedContainer}>
                   <Image source={{ uri: faceImage }} style={styles.capturedImg} />
                   <TouchableOpacity style={styles.retakeBtn} onPress={() => setFaceImage(null)}>
                      <Text style={styles.retakeText}>RE-SCAN IDENTITY</Text>
                   </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cameraBox}>
                   <FaceCamera 
                     inline={true} 
                     onFaceCaptured={handleFaceCaptured} 
                     onCancel={() => {}} 
                   />
                </View>
              )}

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                 {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>COMMIT TO SYSTEM</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.backBtnText}>BACK TO PORTAL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 60, alignItems: 'center' },
  title: { fontSize: 32, color: '#fff', fontWeight: '900', textAlign: 'center', marginTop: 10 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: 10, letterSpacing: 3, marginBottom: 20 },
  card: { width: '100%', maxWidth: 500, backgroundColor: 'rgba(20, 25, 45, 0.98)', padding: 25, borderRadius: 30, borderWidth: 1, borderColor: '#FFD70033' },
  errorBox: { backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, fontWeight: '700' },
  inputStack: { marginBottom: 15 },
  inputGrid: { flexDirection: 'row', width: '100%' },
  label: { color: '#ffd700', fontSize: 10, fontWeight: '900', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cameraBox: { height: 350, backgroundColor: '#000', borderRadius: 20, overflow: 'hidden', marginBottom: 25, marginTop: 5, borderWidth: 1, borderColor: '#ffd70033' },
  capturedContainer: { height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  capturedImg: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#00b09b' },
  retakeBtn: { marginTop: 10 },
  retakeText: { color: '#ffd700', fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },
  submitBtn: { height: 65, backgroundColor: '#ffd700', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#ffd700', shadowOffset: {width:0, height:5}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 },
  backBtn: { marginTop: 25, alignItems: 'center' },
  backBtnText: { color: 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
});
