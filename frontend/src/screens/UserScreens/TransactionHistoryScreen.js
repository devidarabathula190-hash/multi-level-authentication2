import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/Header';
import transactionService from '../../services/transactionService';
import { theme } from '../../theme';
import { useSelector } from 'react-redux';

export default function TransactionHistoryScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.txnItem}>
      <View style={styles.txnHeader}>
        <Text style={styles.txnId}>{item.transaction_id.substring(0, 15)}...</Text>
        <View style={[styles.statusBadge, item.status === 'COMPLETED' ? styles.statusSuccess : styles.statusPending]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.txnBody}>
        <View style={styles.txnParty}>
            <Text style={styles.label}>{item.sender === user?.id ? 'TO' : 'FROM'}</Text>
            <Text style={styles.nameText}>{item.sender === user?.id ? item.receiver_name : item.sender_name}</Text>
        </View>
        <View style={styles.txnAmountContainer}>
            <Text style={[styles.txnAmount, item.sender === user?.id ? styles.outText : styles.inText]}>
                {item.sender === user?.id ? '-' : '+'} ₹{item.amount}
            </Text>
        </View>
      </View>

      <View style={styles.txnFooter}>
        <Text style={styles.purpose}>{item.purpose}</Text>
        <Text style={styles.time}>{item.date} • {item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#00082a']} style={styles.headerBox}>
         <Header title="TRANSACTION HISTORY" titleStyle={{ color: '#fff', fontSize: 18 }} showBack={true} />
      </LinearGradient>

      {loading && !refreshing ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
              <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📂</Text>
                  <Text style={styles.emptyText}>No transaction records found</Text>
              </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  headerBox: {
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    ...theme.shadows.premium,
  },
  loader: {
    marginTop: 100,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  txnItem: {
    backgroundColor: '#1e272e', // Premium Dark
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.gold,
    shadowColor: '#FFD700',
    shadowOpacity: 0.15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
  },
  txnId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    borderColor: '#2ecc71',
  },
  statusPending: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderColor: '#f39c12',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
  txnBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  txnParty: {
      flex: 1,
  },
  label: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      fontWeight: '800',
      letterSpacing: 1,
  },
  nameText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 4,
  },
  txnAmountContainer: {
      alignItems: 'flex-end',
  },
  txnAmount: {
    fontSize: 22,
    fontWeight: '900',
  },
  outText: {
    color: '#ff4d4d',
  },
  inText: {
    color: '#2ecc71',
  },
  txnFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purpose: {
    fontSize: 13,
    color: '#FFD700', // Gold for purpose
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 100,
  },
  emptyIcon: {
      fontSize: 50,
      marginBottom: 20,
  },
  emptyText: {
      color: '#888',
      fontSize: 16,
      fontWeight: '600',
  }
});
