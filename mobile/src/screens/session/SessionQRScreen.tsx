/**
 * SessionQRScreen - QR Code pour le check-in des sessions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../theme';
import { getSessionById, checkInSession } from '../../services/sessions';
import { useAuth } from '../../contexts/AuthContext';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';

interface Session {
  id: string;
  creator_id: string;
  title: string;
  sport_id: string;
  status: string;
  scheduled_at: string;
  participants?: Array<{
    user_id: string;
    username: string;
    checked_in: boolean;
  }>;
}

export default function SessionQRScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'show' | 'scan'>('show');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  async function loadSession() {
    setLoading(true);
    try {
      const data = await getSessionById(sessionId);
      setSession(data);

      // Auto-select mode based on role
      if (data.creator_id === user?.id) {
        setMode('show'); // Creator shows QR code
      } else {
        setMode('scan'); // Participants scan QR code
      }
    } catch (error) {
      console.error('Error loading session:', error);
      Alert.alert('Erreur', 'Impossible de charger la session.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);

      if (qrData.sessionId !== sessionId) {
        Alert.alert('Erreur', 'Ce QR code ne correspond pas à cette session.');
        setScanned(false);
        return;
      }

      // Validate check-in code
      if (!qrData.checkInCode) {
        Alert.alert('Erreur', 'QR code invalide.');
        setScanned(false);
        return;
      }

      // Perform check-in
      const result = await checkInSession(sessionId, qrData.checkInCode);

      if (result) {
        Alert.alert(
          '✅ Check-in validé !',
          'Tu es bien enregistré(e) pour cette session. Bon entraînement !',
          [
            {
              text: 'OK',
              onPress: () => {
                loadSession();
                setScanned(false);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de valider le check-in. Réessaie.'
      );
      setScanned(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  const isCreator = session.creator_id === user?.id;
  const qrCodeData = JSON.stringify({
    sessionId: session.id,
    checkInCode: `${session.id}-${Date.now()}`, // Simple check-in code (should be generated server-side in production)
    timestamp: new Date().toISOString(),
  });

  const checkedInCount = session.participants?.filter((p) => p.checked_in).length || 0;
  const totalParticipants = session.participants?.length || 0;

  return (
    <View style={styles.container}>
      {/* Mode Toggle */}
      {isCreator && (
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'show' && styles.modeButtonActive]}
            onPress={() => setMode('show')}
          >
            <Text
              style={[styles.modeButtonText, mode === 'show' && styles.modeButtonTextActive]}
            >
              Afficher QR Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'scan' && styles.modeButtonActive]}
            onPress={() => setMode('scan')}
          >
            <Text
              style={[styles.modeButtonText, mode === 'scan' && styles.modeButtonTextActive]}
            >
              Scanner QR Code
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Show QR Code Mode */}
      {mode === 'show' && (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>QR Code de la session</Text>
            <Text style={styles.subtitle}>{session.title}</Text>
          </View>

          <View style={styles.qrContainer}>
            <QRCode value={qrCodeData} size={250} />
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>
              {isCreator ? '👥 Instructions pour l\'organisateur' : '📱 Instructions'}
            </Text>
            <Text style={styles.instructionText}>
              {isCreator
                ? '• Montre ce QR code aux participants\n• Ils doivent le scanner pour valider leur présence\n• Le check-in confirme que la session a bien eu lieu'
                : '• Demande à l\'organisateur de montrer le QR code\n• Scanne-le pour valider ta présence\n• Cela te permettra de gagner des MoovCoins !'}
            </Text>
          </View>

          {isCreator && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Check-ins validés</Text>
              <Text style={styles.statsValue}>
                {checkedInCount} / {totalParticipants}
              </Text>
              {session.participants && session.participants.length > 0 && (
                <View style={styles.participantsList}>
                  {session.participants.map((participant) => (
                    <View key={participant.user_id} style={styles.participantRow}>
                      <Text style={styles.participantName}>{participant.username}</Text>
                      <Text style={styles.participantStatus}>
                        {participant.checked_in ? '✅' : '⏳'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setMode('scan')}
          >
            <Text style={styles.switchButtonText}>
              📷 Passer au mode scanner
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scan QR Code Mode */}
      {mode === 'scan' && (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Scanner le QR Code</Text>
            <Text style={styles.subtitle}>
              Scanne le QR code de l'organisateur pour valider ta présence
            </Text>
          </View>

          {hasPermission === null && (
            <View style={styles.permissionContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.permissionText}>
                Demande de permission caméra...
              </Text>
            </View>
          )}

          {hasPermission === false && (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionTitle}>⚠️ Permission refusée</Text>
              <Text style={styles.permissionText}>
                Active l'accès à la caméra dans les paramètres de ton téléphone pour
                scanner le QR code.
              </Text>
            </View>
          )}

          {hasPermission === true && (
            <>
              <View style={styles.scannerContainer}>
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerFrame} />
                </View>
              </View>

              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanButtonText}>
                    Cliquer pour scanner à nouveau
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.scanInstructions}>
                <Text style={styles.scanInstructionText}>
                  Place le QR code dans le cadre pour le scanner
                </Text>
              </View>
            </>
          )}

          {isCreator && (
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setMode('show')}
            >
              <Text style={styles.switchButtonText}>
                📱 Afficher mon QR code
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    ...Typography.body,
    color: Colors.gray700,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: 16,
    ...Shadows.medium,
    marginBottom: Spacing.xl,
  },
  instructions: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    width: '100%',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  instructionTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    width: '100%',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  statsTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  participantsList: {
    marginTop: Spacing.md,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  participantName: {
    ...Typography.body,
    color: Colors.gray900,
  },
  participantStatus: {
    fontSize: 20,
  },
  switchButton: {
    backgroundColor: Colors.gray200,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    marginTop: 'auto',
  },
  switchButtonText: {
    ...Typography.body,
    color: Colors.gray700,
    fontWeight: '600',
  },
  scannerContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  rescanButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  rescanButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  scanInstructions: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 12,
    width: '100%',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  scanInstructionText: {
    ...Typography.body,
    color: Colors.gray700,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    ...Typography.h3,
    color: Colors.gray900,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
