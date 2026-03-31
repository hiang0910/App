import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles';

export const AppFooter = () => {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.line} />
      <Text style={styles.footerBrand}>Music App v1.0</Text>
      <Text style={styles.footerDesc}>
        Made with <Ionicons name="heart" size={12} color={THEME.primary} /> for Music Lovers
      </Text>
      <Text style={styles.footerDesc}>© 2026 All Rights Reserved</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 50, // Space for Minibar
    marginTop: 10,
  },
  line: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 15,
  },
  footerBrand: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 6,
    letterSpacing: 1,
  },
  footerDesc: { 
    color: '#6E7480', 
    fontSize: 12, 
    marginTop: 4,
  }
});
