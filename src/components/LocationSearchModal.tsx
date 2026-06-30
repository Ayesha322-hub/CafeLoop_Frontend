import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { UserLocation } from '../hooks/useLocation';

interface SearchResult {
  latitude: number;
  longitude: number;
  label: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: UserLocation) => void;
  onUseCurrentLocation: () => void;
  currentLocationLoading: boolean;
}

const LocationSearchModal = ({
  visible,
  onClose,
  onSelect,
  onUseCurrentLocation,
  currentLocationLoading,
}: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearched(true);
    try {
      const matches = await Location.geocodeAsync(trimmed);

      const withLabels: SearchResult[] = [];
      for (const match of matches.slice(0, 6)) {
        let label = trimmed;
        try {
          const [place] = await Location.reverseGeocodeAsync({
            latitude: match.latitude,
            longitude: match.longitude,
          });
          if (place) {
            const area = place.district || place.subregion || place.street || place.name;
            const city = place.city || place.region;
            const formatted = [area, city].filter(Boolean).join(', ');
            if (formatted) label = formatted;
          }
        } catch {
          // keep fallback label (the search text) if reverse geocode fails
        }
        withLabels.push({ latitude: match.latitude, longitude: match.longitude, label });
      }

      setResults(withLabels);
    } catch (err) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setResults([]);
    setSearched(false);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
    setQuery('');
    setResults([]);
    setSearched(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Choose location</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Search area, street, or city…"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              {searching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchBtnText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.currentLocationRow}
            onPress={handleUseCurrentLocation}
            disabled={currentLocationLoading}
          >
            {currentLocationLoading ? (
              <ActivityIndicator size="small" color="#6B4226" />
            ) : (
              <Text style={styles.currentLocationText}>📍 Use my current location</Text>
            )}
          </TouchableOpacity>

          <FlatList
            data={results}
            keyExtractor={(item, idx) => `${item.latitude}-${item.longitude}-${idx}`}
            style={styles.resultsList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultRow} onPress={() => handleSelect(item)}>
                <Text style={styles.resultText}>📍 {item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searched && !searching ? (
                <Text style={styles.emptyText}>No matches found. Try a different search.</Text>
              ) : null
            }
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  closeBtn: { fontSize: 18, color: '#888', padding: 4 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  searchBtn: {
    backgroundColor: '#6B4226',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  currentLocationRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  currentLocationText: { color: '#6B4226', fontWeight: '600', fontSize: 14 },
  resultsList: { marginTop: 4 },
  resultRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  resultText: { fontSize: 14, color: '#1a1a1a' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 24, fontSize: 14 },
});

export default LocationSearchModal;