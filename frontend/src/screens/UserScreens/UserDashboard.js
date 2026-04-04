import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl, Animated, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUser } from '../../store/authSlice';
import api from '../../services/apiService';
import transactionService from '../../services/transactionService';
import { theme } from '../../theme';

export default function UserDashboard({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  // Anim
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile/');
      dispatch(updateUser(response.data));
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await transactionService.getHistory();
      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHistory(), fetchProfile()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#00082a']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>VIRTUAL ASSETS</Text>
              <Text style={styles.userName}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
               <Text style={styles.logoutText}>EXIT</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <View style={styles.amountRow}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.balanceAmount}>{user?.balance || '0.00'}</Text>
            </View>
            <View style={styles.goldLine} />
          </Animated.View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('SelectReceiver')}
            >
              <LinearGradient colors={['#FFD700', '#fdbb2d']} style={styles.btnGradient}>
                <Text style={styles.actionBtnText}>SEND MONEY</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
               <LinearGradient colors={['#1d976c', '#00b09b']} style={styles.btnGradient}>
                <Text style={styles.actionBtnText}>HISTORY</Text>
               </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={onRefresh}>
                <Text style={styles.refreshText}>{refreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No activity recorded yet</Text>
            </View>
          ) : (
            history.slice(0, 8).map((item) => (
              <TouchableOpacity key={item.id} style={styles.txnItem}>
                <View style={styles.txnIconBox}>
                    <Text style={styles.txnIconText}>
                        {item.sender === user?.id ? 'OUT' : 'IN'}
                    </Text>
                </View>
                <View style={styles.txnLeft}>
                  <Text style={styles.txnUser}>{item.sender === user?.id ? `To: ${item.receiver_name}` : `From: ${item.sender_name}`}</Text>
                  <Text style={styles.txnDate}>{item.date} • {item.time}</Text>
                </View>
                <View style={styles.txnRight}>
                  <Text style={[styles.txnAmount, item.sender === user?.id ? styles.outText : styles.inText]}>
                    {item.sender === user?.id ? '-' : '+'}₹{item.amount}
                  </Text>
                  <View style={[styles.statusBadge, item.status === 'COMPLETED' ? styles.statusSuccess : styles.statusPending]}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...theme.shadows.premium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  logoutBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  balanceCard: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  currency: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
    marginRight: 5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 52,
    fontWeight: 'bold',
  },
  goldLine: {
    width: 60,
    height: 3,
    backgroundColor: '#FFD700',
    marginTop: 15,
    borderRadius: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  actionBtn: {
    width: '48%',
    height: 65,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.gold,
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  historySection: {
    flex: 1,
    padding: 24,
    marginTop: -10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a2a6c',
  },
  refreshText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  historyList: {
    flex: 1,
  },
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#1e272e', // Premium Dark
    borderRadius: 24,
    marginBottom: 16,
    ...theme.shadows.premium,
    shadowColor: '#FFD700',
    shadowOpacity: 0.15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  txnIconBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  txnIconText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFD700', // Gold icon text
  },
  txnLeft: {
    flex: 1,
  },
  txnUser: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff', // White for name
  },
  txnDate: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontSize: 13,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    fontSize: 19,
    fontWeight: '900',
  },
  outText: {
    color: '#ff4d4d',
  },
  inText: {
    color: '#2ecc71',
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    borderColor: 'rgba(46, 204, 113, 0.4)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: 'rgba(255, 152, 0, 0.4)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  }
});
