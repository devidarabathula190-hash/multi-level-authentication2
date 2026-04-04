import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function OTPInput({ onVerify, loading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleInput = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    onVerify(otp.join(''));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter 6-digit OTP</Text>
      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            style={[styles.input, digit ? styles.activeInput : null]}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            autoFocus={i === 0}
            onChangeText={(text) => handleInput(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            ref={(ref) => inputs.current[i] = ref}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading || otp.join('').length < 6}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Pay</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    color: '#888',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  input: {
    width: 45,
    height: 55,
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#eee',
    color: '#333',
  },
  activeInput: {
    borderColor: '#007bff',
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  verifyBtn: {
    backgroundColor: '#007bff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
