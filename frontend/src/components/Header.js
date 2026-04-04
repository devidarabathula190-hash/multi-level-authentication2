import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Header({ title, showBack = true, titleStyle = {} }) {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>{'←'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={styles.right} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  left: {
      flex: 1,
      alignItems: 'flex-start',
  },
  right: {
      flex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'web' ? -3 : 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flex: 2,
    textAlign: 'center',
  },
});
