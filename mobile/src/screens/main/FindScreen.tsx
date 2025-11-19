/**
 * MoovUp Now - Find Screen (Sessions List)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius, Shadows } from '../../theme';
import { SessionCard } from '../../components/sessions';
import { getNearbySessions } from '../../services/sessions';
import { Session, Sport } from '../../types';
import { supabase } from '../../services/supabase';

export default function FindScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'one-on-one' | 'group'>('all');

  // Simulated location (Paris center for demo)
  const [userLocation] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
  });

  useEffect(() => {
    loadData();
  }, [selectedSport, selectedType]);

  const loadData = async () => {
    try {
      // Load sports for filters
      const { data: sportsData } = await supabase
        .from('sports')
        .select('*')
        .order('name');
      setSports(sportsData || []);

      // Load sessions
      const filters: any = {};
      if (selectedSport) filters.sport_id = selectedSport;
      if (selectedType !== 'all') filters.session_type = selectedType;

      const sessionsData = await getNearbySessions(
        userLocation.latitude,
        userLocation.longitude,
        20, // 20km radius
        filters
      );

      setSessions(sessionsData);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSessionPress = (session: Session) => {
    // TODO: Navigate to SessionDetail screen
    Alert.alert(
      session.title,
      `Session de ${session.sport?.name}\nPar @${session.creator?.username}\n\nDétails à venir...`
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Trouver une session</Text>
        <View style={styles.locationBadge}>
          <Text style={styles.locationText}>📍 Paris</Text>
        </View>
      </View>

      {/* Sport Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: null, name: 'Tous', emoji: '🎯' }, ...sports.slice(0, 10)]}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.sportFilter,
              selectedSport === item.id && styles.sportFilterActive,
            ]}
            onPress={() => setSelectedSport(item.id)}
          >
            <Text style={styles.sportEmoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.sportFilterText,
                selectedSport === item.id && styles.sportFilterTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.sportFilters}
        contentContainerStyle={styles.sportFiltersContent}
      />

      {/* Type Filters */}
      <View style={styles.typeFilters}>
        <TouchableOpacity
          style={[
            styles.typeFilter,
            selectedType === 'all' && styles.typeFilterActive,
          ]}
          onPress={() => setSelectedType('all')}
        >
          <Text
            style={[
              styles.typeFilterText,
              selectedType === 'all' && styles.typeFilterTextActive,
            ]}
          >
            Tout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilter,
            selectedType === 'one-on-one' && styles.typeFilterActive,
          ]}
          onPress={() => setSelectedType('one-on-one')}
        >
          <Text
            style={[
              styles.typeFilterText,
              selectedType === 'one-on-one' && styles.typeFilterTextActive,
            ]}
          >
            👥 1-on-1
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilter,
            selectedType === 'group' && styles.typeFilterActive,
          ]}
          onPress={() => setSelectedType('group')}
        >
          <Text
            style={[
              styles.typeFilterText,
              selectedType === 'group' && styles.typeFilterTextActive,
            ]}
          >
            👨‍👩‍👧‍👦 Groupe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {sessions.length} session{sessions.length > 1 ? 's' : ''} disponible{sessions.length > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>Aucune session trouvée</Text>
      <Text style={styles.emptySubtitle}>
        Essaye de changer les filtres ou crée ta propre session !
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Recherche de sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => handleSessionPress(item)}
            showDistance
            distance={5.2} // TODO: Calculate real distance
          />
        )}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    ...TextPresets.h2,
    color: Colors.text.primary,
  },
  locationBadge: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  locationText: {
    ...TextPresets.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  sportFilters: {
    marginBottom: Spacing.md,
  },
  sportFiltersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sportFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  sportFilterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sportEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  sportFilterText: {
    ...TextPresets.small,
    color: Colors.text.primary,
  },
  sportFilterTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  typeFilters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeFilter: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  typeFilterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeFilterText: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
  },
  typeFilterTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
  },
  resultsCount: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...TextPresets.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
