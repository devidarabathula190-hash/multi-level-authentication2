import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import api from '../../services/apiService';
import Header from '../../components/Header';
import { theme } from '../../theme';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('USERS'); // USERS, TRANSACTIONS
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'USERS') {
        const response = await api.get('/users/admin/users/');
        setUsers(response.data);
      } else {
        const response = await api.get('/transactions/admin/history/');
        setTransactions(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", `Could not fetch ${activeTab.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchData();
      setRefreshing(false);
  }

  const handleAction = async (userId, action) => {
    const performAction = async () => {
      try {
        const response = await api.put(`/users/admin/users/${userId}/${action}/`);
        if (response.data.success) {
          Alert.alert("Action Successful", response.data.message);
          fetchData();
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.response?.data?.error || "Action failed");
      }
    };

    if (action === 'delete') {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
        if (confirmed) performAction();
      } else {
        Alert.alert(
          "Critical Action",
          "Are you sure you want to permanently delete this user? This cannot be reversed.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: performAction }
          ]
        );
      }
    } else {
      performAction();
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userId}>@{item.login_id}</Text>
        <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.statusSuccess : styles.statusPending]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {!item.is_staff && (
          <>
            {item.status === 'INACTIVE' ? (
              <TouchableOpacity style={[styles.actionBtn, styles.activateBtn]} onPress={() => handleAction(item.id, 'activate')}>
                <Text style={styles.btnText}>ACTIVATE</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.actionBtn, styles.deactivateBtn]} onPress={() => handleAction(item.id, 'deactivate')}>
                <Text style={styles.btnText}>DEACTIVATE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleAction(item.id, 'delete')}>
              <Text style={styles.btnText}>DELETE</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderTransactionItem = ({ item }) => (
    <View style={styles.txnCard}>
      <View style={styles.txnHeader}>
        <Text style={styles.txnId}>{item.transaction_id.substring(0, 15)}...</Text>
        <Text style={[styles.txnStatus, item.status === 'COMPLETED' ? styles.successText : styles.failedText]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.txnDetails}>
        <View style={styles.txnParty}>
          <Text style={styles.label}>SENDER</Text>
          <Text style={styles.value}>{item.sender_name}</Text>
        </View>
        <View style={styles.txnArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        <View style={styles.txnParty}>
          <Text style={styles.label}>RECEIVER</Text>
          <Text style={styles.value}>{item.receiver_name}</Text>
        </View>
      </View>
      <View style={styles.txnFooter}>
        <Text style={styles.txnAmount}>₹{item.amount}</Text>
        <Text style={styles.txnTime}>{item.date} • {item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.adminHeader}>
        <View style={styles.headerRow}>
            <View>
                <Text style={styles.headerTitle}>ADMIN PANEL</Text>
                <Text style={styles.headerSubtitle}>System Control Center</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>SHUTDOWN</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
            <TouchableOpacity 
            style={[styles.tab, activeTab === 'USERS' && styles.activeTab]} 
            onPress={() => setActiveTab('USERS')}
            >
            <Text style={[styles.tabText, activeTab === 'USERS' && styles.activeTabText]}>User Registry</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            style={[styles.tab, activeTab === 'TRANSACTIONS' && styles.activeTab]} 
            onPress={() => setActiveTab('TRANSACTIONS')}
            >
            <Text style={[styles.tabText, activeTab === 'TRANSACTIONS' && styles.activeTabText]}>Global Logs</Text>
            </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.listSection}>
        {loading ? (
            <View style={styles.loaderCenter}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loaderText}>Syncing Data...</Text>
            </View>
        ) : (
            <FlatList
            data={activeTab === 'USERS' ? users : transactions}
            renderItem={activeTab === 'USERS' ? renderUserItem : renderTransactionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🛡️</Text>
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} recorded.</Text>
                </View>
            }
            />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  adminHeader: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...theme.shadows.premium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 75, 43, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 43, 0.4)',
  },
  logoutText: {
    color: '#ff4b2b',
    fontWeight: '900',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    ...theme.shadows.gold,
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
  },
  activeTabText: {
    color: '#1a2a6c',
  },
  listSection: {
    flex: 1,
    padding: 20,
    marginTop: -10,
  },
  listContent: {
    paddingBottom: 50,
  },
  loaderCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100,
  },
  loaderText: {
      marginTop: 20,
      color: '#666',
      fontWeight: '600',
  },
  // User Card
  userCard: {
    backgroundColor: '#1e272e', // Professional Dark
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.gold,
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
  },
  userId: {
    fontSize: 14,
    color: '#FFD700', // Gold accents
    marginVertical: 4,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },
  statusSuccess: {
      backgroundColor: 'rgba(46, 204, 113, 0.3)',
      borderWidth: 1,
      borderColor: '#2ecc71',
  },
  statusPending: {
      backgroundColor: 'rgba(243, 156, 18, 0.3)',
      borderWidth: 1,
      borderColor: '#f39c12',
  },
  actions: {
    marginLeft: 15,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 115,
    alignItems: 'center',
  },
  activateBtn: {
    backgroundColor: '#2ecc71',
    ...theme.shadows.gold,
    shadowColor: '#2ecc71',
  },
  deactivateBtn: {
    backgroundColor: '#f39c12',
  },
  deleteBtn: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  // Txn Card
  txnCard: {
    backgroundColor: '#1e272e',
    borderRadius: 25,
    padding: 22,
    marginBottom: 18,
    ...theme.shadows.gold,
    shadowColor: '#FFD700',
    shadowOpacity: 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 15,
  },
  txnId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  txnStatus: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  txnDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  txnParty: {
    flex: 1,
    alignItems: 'center',
  },
  txnArrow: {
    paddingHorizontal: 15,
  },
  arrowText: {
      fontSize: 22,
      color: '#FFD700',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  txnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  txnAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700', // Gold Amount
  },
  txnTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  successText: {
    color: '#2ecc71',
  },
  failedText: {
    color: '#e74c3c',
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 100,
  },
  emptyIcon: {
      fontSize: 60,
      marginBottom: 20,
  },
  emptyText: {
      color: '#666',
      fontSize: 18,
  }
});
