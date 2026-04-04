import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FaceCamera from '../../components/FaceCamera';
import OTPInput from '../../components/OTPInput';
import Header from '../../components/Header';
import transactionService from '../../services/transactionService';
import { theme } from '../../theme';

export default function TransactionVerificationScreen({ route, navigation }) {
  const { transaction_id, receiver, amount } = route.params;
  const [step, setStep] = useState('FACE'); // FACE, OTP, SUCCESS
  const [loading, setLoading] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState('');

  const handleFaceCaptured = async (photo) => {
    setLoading(true);
    try {
      const response = await transactionService.verifyFace(transaction_id, photo);
      if (response.data.face_verified) {
        setReceiverEmail(response.data.sender_email);
        setStep('OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Identity Verification Failed", error.response?.data?.message || "Biometric mismatch detected.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setLoading(true);
    try {
      const response = await transactionService.verifyOTP(transaction_id, otp);
      if (response.data.success) {
        setStep('SUCCESS');
        setTimeout(() => {
          navigation.navigate('UserDashboard');
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Authorization Failed", error.response?.data?.error || "Invalid secured OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step !== 'SUCCESS' && (
        <LinearGradient colors={['#1a2a6c', '#00082a']} style={styles.header}>
            <Header 
              title={step === 'FACE' ? "BIOMETRIC AUTH" : "KEY AUTHORIZATION"} 
              titleStyle={{ color: '#fff', fontSize: 18 }} 
              showBack={true} 
            />
            <View style={styles.txnSummary}>
                <Text style={styles.summaryLabel}>AUTHORIZING TRANSFER</Text>
                <Text style={styles.summaryAmount}>₹{amount}</Text>
                <Text style={styles.summaryReceiver}>to {receiver.name}</Text>
            </View>
        </LinearGradient>
      )}

      {step === 'FACE' && (
        <View style={styles.content}>
           <View style={styles.cameraFrame}>
                <FaceCamera 
                inline={true} 
                onFaceCaptured={handleFaceCaptured} 
                onCancel={() => navigation.goBack()} 
                />
           </View>
           <Text style={styles.instruction}>Position your face in the frame for biometric handshake.</Text>
        </View>
      )}

      {step === 'OTP' && (
        <View style={styles.otpSection}>
           <View style={styles.otpCard}>
                <Text style={styles.otpTitle}>Final Handshake Required</Text>
                <Text style={styles.otpSubtitle}>A secure key has been broadcast to your registered email: {receiverEmail}</Text>
                
                <OTPInput onVerify={handleOTPVerify} loading={loading} />

                <TouchableOpacity style={styles.retryBtn} onPress={() => setStep('FACE')}>
                    <Text style={styles.retryText}>Restart Biometric Process</Text>
                </TouchableOpacity>
           </View>
        </View>
      )}

      {step === 'SUCCESS' && (
        <LinearGradient colors={['#00b09b', '#96c93d']} style={styles.successScreen}>
           <View style={styles.successRing}>
                <Text style={styles.successIcon}>✓</Text>
           </View>
           <Text style={styles.successTitle}>Handshake Successful</Text>
           <Text style={styles.successText}>Assets have been transferred securely.</Text>
           <View style={styles.txnIdCard}>
                <Text style={styles.txnIdLabel}>TRANSACTION REFERENCE</Text>
                <Text style={styles.txnIdValue}>{transaction_id}</Text>
           </View>
           <View style={styles.loadingBox}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.redirectText}>Finalizing ledger entries...</Text>
           </View>
        </LinearGradient>
      )}

      {loading && step !== 'SUCCESS' && (
        <View style={styles.loadingOverlay}>
            <View style={styles.loaderContent}>
                 <ActivityIndicator size="large" color="#FFD700" />
                 <Text style={styles.loaderMsg}>VALIDATING IDENTITY...</Text>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    ...theme.shadows.premium,
  },
  txnSummary: {
    alignItems: 'center',
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '900',
    letterSpacing: 2,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginVertical: 5,
  },
  summaryReceiver: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFrame: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    backgroundColor: '#000',
    borderRadius: 30,
    overflow: 'hidden',
    ...theme.shadows.premium,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignSelf: 'center',
  },
  instruction: {
    marginTop: 25,
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  otpSection: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  otpCard: {
    backgroundColor: '#1e272e',
    borderRadius: 30,
    padding: 30,
    ...theme.shadows.premium,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  otpSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 30,
  },
  retryBtn: {
    marginTop: 30,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFD700',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  successRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 30,
  },
  successIcon: {
    fontSize: 80,
    color: '#fff',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  successText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  txnIdCard: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: 20,
      borderRadius: 15,
      marginTop: 40,
      width: '100%',
      alignItems: 'center',
  },
  txnIdLabel: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.5)',
      fontWeight: '900',
      letterSpacing: 2,
  },
  txnIdValue: {
      color: '#fff',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
      marginTop: 8,
      fontSize: 13,
  },
  loadingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 40,
      gap: 10,
  },
  redirectText: {
      color: '#fff',
      fontWeight: '600',
  },
  loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 20, 40, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  loaderContent: {
      alignItems: 'center',
  },
  loaderMsg: {
      color: '#FFD700',
      fontWeight: '900',
      letterSpacing: 2,
      marginTop: 20,
  }
});
