import React from 'react';
import { 
  Text, View, Image, TouchableOpacity, 
  SafeAreaView, ScrollView, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALBUMS, width } from '../constants';
import { styles } from '../styles';

const AlbumScreen = ({ setCurrentScreen }: any) => {
  const numColumns = 2;
  const itemWidth = (width - 48) / numColumns; // Tính toán độ rộng để chia 2 cột

  const renderAlbumItem = ({ item }: any) => (
    <TouchableOpacity 
      style={{ width: itemWidth, marginBottom: 20, marginRight: 16 }}
      onPress={() => alert(`Bạn đã chọn album: ${item.title}`)} // Sau này làm trang chi tiết album sau
    >
      <View style={styles.albumGridShadow}>
        <Image source={{ uri: item.artwork }} style={{ width: itemWidth, height: itemWidth, borderRadius: 15 }} />
      </View>
      <Text style={[styles.recentCardTitle, { marginTop: 10 }]} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.recentCardArtist}>{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => setCurrentScreen('home')}>
          <Ionicons name="arrow-back" size={24} color="#D1D5DF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ALL ALBUMS</Text>
        <View style={{ width: 48 }} /> 
      </View>

      <FlatList
        data={ALBUMS}
        renderItem={renderAlbumItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default AlbumScreen;