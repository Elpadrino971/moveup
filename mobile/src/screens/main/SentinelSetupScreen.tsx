/**
 * SentinelSetupScreen - Configuration Mode Sentinel
 * Gestion des contacts d'urgence
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import {
  getEmergencyContacts,
  addEmergencyContact,
  EmergencyContact,
} from '../services/sentinel';

export default function SentinelSetupScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notifyBefore, setNotifyBefore] = useState(true);
  const [notifyDuring, setNotifyDuring] = useState(true);
  const [notifyOnSOS, setNotifyOnSOS] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddContact() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Erreur', 'Le nom et le téléphone sont obligatoires.');
      return;
    }

    try {
      const priority = contacts.length + 1;

      await addEmergencyContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim() || undefined,
        priority,
        notify_before_session: notifyBefore,
        notify_during_session: notifyDuring,
        notify_on_sos: notifyOnSOS,
      });

      // Reset form
      setName('');
      setPhone('');
      setRelationship('');
      setShowAddForm(false);

      // Reload
      await loadContacts();

      Alert.alert('✅ Contact ajouté', 'Ton contact d\'urgence a été enregistré.');
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le contact.');
    }
  }

  function getRelationshipEmoji(rel: string | undefined) {
    if (!rel) return '👤';
    const lower = rel.toLowerCase();
    if (lower.includes('parent') || lower.includes('maman') || lower.includes('papa')) return '👨‍👩‍👧';
    if (lower.includes('partner') || lower.includes('conjoint')) return '❤️';
    if (lower.includes('friend') || lower.includes('ami')) return '👥';
    if (lower.includes('sibling') || lower.includes('frère') || lower.includes('soeur')) return '👫';
    return '👤';
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🆘 Mode Sentinel</Text>
        <Text style={styles.headerSubtitle}>Configure tes contacts d'urgence</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Explanation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comment ça marche ?</Text>

          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>📍</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Localisation en temps réel</Text>
              <Text style={styles.featureDesc}>
                Tes contacts peuvent suivre ta session en direct
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>⏰</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Check-ins automatiques</Text>
              <Text style={styles.featureDesc}>
                Toutes les 30 min, on vérifie que tout va bien
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>🚨</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>SOS instantané</Text>
              <Text style={styles.featureDesc}>
                Alerte tes contacts en 1 seconde (secouer le téléphone)
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>🤖</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Détection d'anomalies IA</Text>
              <Text style={styles.featureDesc}>
                Alerte auto si déplacement suspect ou immobilité
              </Text>
            </View>
          </View>
        </View>

        {/* Existing Contacts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Contacts d'urgence ({contacts.length}/3)
          </Text>

          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucun contact d'urgence configuré.{'\n'}Ajoute au moins 1 contact pour activer le
                Mode Sentinel.
              </Text>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactEmoji}>
                    {getRelationshipEmoji(contact.relationship)}
                  </Text>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    {contact.relationship && (
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    )}
                  </View>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>
                      {index === 0 ? '★ Principal' : `#${contact.priority}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.contactNotifs}>
                  <Text style={styles.contactNotifsTitle}>Notifications :</Text>
                  {contact.notify_before_session && (
                    <Text style={styles.contactNotifItem}>✓ Avant session</Text>
                  )}
                  {contact.notify_during_session && (
                    <Text style={styles.contactNotifItem}>✓ Pendant session</Text>
                  )}
                  {contact.notify_on_sos && (
                    <Text style={styles.contactNotifItem}>✓ SOS</Text>
                  )}
                </View>
              </View>
            ))
          )}

          {contacts.length < 3 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(!showAddForm)}
            >
              <Text style={styles.addButtonText}>
                {showAddForm ? '− Annuler' : '+ Ajouter un contact'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add Contact Form */}
        {showAddForm && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nouveau contact</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Maman"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ex: 06 12 34 56 78"
                placeholderTextColor={Colors.gray400}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Relation (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={relationship}
                onChangeText={setRelationship}
                placeholder="Ex: Parent, Ami, Conjoint"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quand notifier ce contact ?</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Avant chaque session (15 min avant)</Text>
                <Switch
                  value={notifyBefore}
                  onValueChange={setNotifyBefore}
                  trackColor={{ false: Colors.gray300, true: Colors.primary + '50' }}
                  thumbColor={notifyBefore ? Colors.primary : Colors.gray500}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Pendant la session (check-ins)</Text>
                <Switch
                  value={notifyDuring}
                  onValueChange={setNotifyDuring}
                  trackColor={{ false: Colors.gray300, true: Colors.primary + '50' }}
                  thumbColor={notifyDuring ? Colors.primary : Colors.gray500}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>En cas de SOS</Text>
                <Switch
                  value={notifyOnSOS}
                  onValueChange={setNotifyOnSOS}
                  trackColor={{ false: Colors.gray300, true: Colors.primary + '50' }}
                  thumbColor={notifyOnSOS ? Colors.primary : Colors.gray500}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleAddContact}>
              <Text style={styles.buttonPrimaryText}>✓ Enregistrer le contact</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Activation Info */}
        {contacts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✅ Activation automatique</Text>

            <Text style={styles.infoText}>
              Le Mode Sentinel s'active automatiquement pour :
            </Text>

            <View style={styles.autoActivateList}>
              <Text style={styles.autoActivateItem}>• Sessions 1-on-1</Text>
              <Text style={styles.autoActivateItem}>
                • Avec personne Trust Level &lt; 3
              </Text>
              <Text style={styles.autoActivateItem}>• Horaires sensibles (après 20h, avant 7h)</Text>
              <Text style={styles.autoActivateItem}>• Premier rendez-vous avec un binôme</Text>
            </View>

            <Text style={styles.infoTextSecondary}>
              Tu peux aussi l'activer manuellement pour n'importe quelle session.
            </Text>
          </View>
        )}

        {/* Privacy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔒 Privacy</Text>

          <Text style={styles.privacyText}>
            • Localisation partagée UNIQUEMENT pendant session active{'\n'}
            • Supprimée automatiquement après la session{'\n'}
            • Données chiffrées AES-256{'\n'}
            • Aucun accès par des tiers
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.gray900,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.medium,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  featureDesc: {
    ...Typography.small,
    color: Colors.gray600,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
  },
  contactItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contactEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  contactPhone: {
    ...Typography.small,
    color: Colors.gray600,
    marginTop: 2,
  },
  contactRelationship: {
    ...Typography.small,
    color: Colors.primary,
    marginTop: 2,
  },
  priorityBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  contactNotifs: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  contactNotifsTitle: {
    ...Typography.small,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  contactNotifItem: {
    ...Typography.small,
    color: Colors.success,
    marginLeft: Spacing.sm,
  },
  addButton: {
    backgroundColor: Colors.gray100,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  formLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.gray50,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    color: Colors.gray900,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    ...Typography.body,
    color: Colors.gray700,
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonPrimaryText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  infoText: {
    ...Typography.body,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  infoTextSecondary: {
    ...Typography.small,
    color: Colors.gray600,
    marginTop: Spacing.sm,
  },
  autoActivateList: {
    marginLeft: Spacing.md,
    marginVertical: Spacing.sm,
  },
  autoActivateItem: {
    ...Typography.body,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  privacyText: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 24,
  },
});
