import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/Header';
import transactionService from '../../services/transactionService';
import { theme } from '../../theme';

export default function SelectReceiverScreen({ navigation }) {
  const [receivers, setReceivers] = useState([]);
  const [filteredReceivers, setFilteredReceivers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReceivers = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getReceivers();
      setReceivers(response.data);
      setFilteredReceivers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivers();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const filtered = receivers.filter(user => 
        user.name.toLowerCase().includes(text.toLowerCase()) || 
        user.login_id.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredReceivers(filtered);
    } else {
      setFilteredReceivers(receivers);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.navigate('SendMoney', { receiver: item })}
    >
      <LinearGradient colors={['#FFD700', '#fdbb2d']} style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </LinearGradient>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userId}>@{item.login_id}</Text>
      </View>
      <View style={styles.arrowIcon}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#00082a']} style={styles.headerBox}>
         <Header title="SELECT SECURE RECEIVER" titleStyle={{ color: '#fff', fontSize: 18 }} showBack={true} />
         <View style={styles.searchSection}>
            <TextInput
            style={styles.searchInput}
            placeholder="Search by name or @id"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={handleSearch}
            />
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredReceivers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>No users found in the registry</Text>
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
  searchSection: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loader: {
    marginTop: 100,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#1e272e', // Premium Dark like Admin
    borderRadius: 24,
    marginBottom: 16,
    ...theme.shadows.gold,
    shadowColor: '#FFD700',
    shadowOpacity: 0.15,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1a2a6c',
    fontSize: 22,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userId: {
    color: '#FFD700',
    marginTop: 4,
    fontWeight: '700',
    fontSize: 13,
  },
  arrowIcon: {
      paddingHorizontal: 5,
  },
  arrowText: {
      fontSize: 20,
      color: '#bdc3c7',
  },
  emptyBox: {
      alignItems: 'center',
      marginTop: 100,
  },
  emptyIcon: {
      fontSize: 50,
      marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  }
});
