import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/Header';
import transactionService from '../../services/transactionService';
import { theme } from '../../theme';

export default function SendMoneyScreen({ route, navigation }) {
  const { receiver } = route.params;
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitiate = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to proceed.");
      return;
    }

    setLoading(true);
    try {
      const response = await transactionService.initiate({
        receiver: receiver.id,
        amount: parseFloat(amount),
        purpose: purpose || 'Secure Money Transfer'
      });
      
      const { transaction_id } = response.data;
      navigation.navigate('TransactionVerification', { 
        transaction_id, 
        receiver, 
        amount: parseFloat(amount) 
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Transaction Failed", error.response?.data?.error || "Error initiating secure handshake");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#00082a']} style={styles.header}>
        <Header 
          title="TRANSFER ASSETS" 
          titleStyle={{ color: '#fff', fontSize: 18 }} 
          showBack={true} 
        />
        <View style={styles.receiverProfile}>
            <LinearGradient colors={['#FFD700', '#fdbb2d']} style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{receiver.name[0]}</Text>
            </LinearGradient>
            <Text style={styles.receiverName}>{receiver.name}</Text>
            <Text style={styles.receiverId}>@{receiver.login_id}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.content}>
            <View style={styles.amountCard}>
                <Text style={styles.subLabel}>SPECIFY AMOUNT (₹)</Text>
                <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#ccc"
                    autoFocus
                />
            </View>

            <View style={styles.purposeWrapper}>
                <Text style={styles.subLabel}>TRANSACTION PURPOSE</Text>
                <TextInput
                    style={styles.purposeInput}
                    value={purpose}
                    onChangeText={setPurpose}
                    placeholder="Enter reason for transfer"
                    placeholderTextColor="#999"
                />
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={handleInitiate} disabled={loading}>
                <LinearGradient 
                    colors={[theme.colors.success, '#1d976c']} 
                    style={styles.btnGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>INITIATE SECURE HANDSHAKE</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...theme.shadows.premium,
  },
  receiverProfile: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    ...theme.shadows.gold,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1a2a6c',
  },
  receiverName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  receiverId: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    ...theme.shadows.premium,
    marginTop: -20,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '900',
    color: '#1a2a6c',
    textAlign: 'center',
    width: '100%',
    marginTop: 10,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  purposeWrapper: {
    marginTop: 30,
  },
  purposeInput: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    fontSize: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
    color: '#333',
  },
  continueBtn: {
    height: 70,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
