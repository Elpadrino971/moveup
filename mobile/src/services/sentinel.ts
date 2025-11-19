/**
 * Service: Mode Sentinel (Sécurité Renforcée)
 * Gestion du tracking sécurité, check-ins, alertes d'urgence
 */

import { supabase } from './supabase';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

// Types
export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship?: string;
  priority: number;
  notify_before_session: boolean;
  notify_during_session: boolean;
  notify_on_sos: boolean;
}

export interface SentinelSession {
  id: string;
  session_id: string;
  user_id: string;
  auto_activated: boolean;
  manually_enabled: boolean;
  tracking_active: boolean;
  tracking_url: string;
  check_in_frequency_minutes: number;
  last_check_in_at?: string;
  next_check_in_at?: string;
  missed_check_ins: number;
  status: 'active' | 'completed' | 'sos_triggered' | 'alert_sent';
  sos_triggered: boolean;
  planned_duration_minutes?: number;
  created_at: string;
}

export interface SentinelLocation {
  id?: string;
  sentinel_session_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  battery_level?: number;
  created_at?: string;
}

export interface CheckInResponse {
  id?: string;
  sentinel_session_id: string;
  user_id: string;
  check_in_type: 'auto_prompt' | 'manual' | 'auto_reminder';
  response: 'ok' | 'need_help_discreet' | 'sos' | 'no_response';
  response_time_seconds?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Ajouter un contact d'urgence
 */
export async function addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmergencyContact | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      user_id: user.id,
      ...contact,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding emergency contact:', error);
    return null;
  }

  return data;
}

/**
 * Obtenir les contacts d'urgence
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('priority');

  if (error) {
    console.error('Error fetching emergency contacts:', error);
    return [];
  }

  return data || [];
}

/**
 * Vérifier si Mode Sentinel doit s'auto-activer
 */
export async function shouldActivateSentinel(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('should_activate_sentinel', {
    p_session_id: sessionId,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
  });

  if (error) {
    console.error('Error checking sentinel activation:', error);
    return false;
  }

  return data || false;
}

/**
 * Activer Mode Sentinel pour une session
 */
export async function activateSentinel(
  sessionId: string,
  autoActivated: boolean,
  plannedDurationMinutes?: number
): Promise<SentinelSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Générer URL de tracking unique
  const trackingUrl = await generateTrackingURL();

  const { data, error } = await supabase
    .from('sentinel_sessions')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      auto_activated: autoActivated,
      manually_enabled: !autoActivated,
      tracking_url: trackingUrl,
      check_in_frequency_minutes: 30,
      next_check_in_at: calculateNextCheckIn(30),
      planned_duration_minutes: plannedDurationMinutes,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error activating sentinel:', error);
    return null;
  }

  // Notifier les contacts d'urgence
  await notifyContactsSessionStart(data.id);

  // Démarrer le tracking GPS
  await startLocationTracking(data.id);

  return data;
}

/**
 * Générer URL de tracking unique
 */
async function generateTrackingURL(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_tracking_url');

  if (error || !data) {
    // Fallback
    return Math.random().toString(36).substring(2, 18);
  }

  return data;
}

/**
 * Calculer prochaine check-in
 */
function calculateNextCheckIn(frequencyMinutes: number): string {
  const next = new Date();
  next.setMinutes(next.getMinutes() + frequencyMinutes);
  return next.toISOString();
}

/**
 * Notifier contacts au début de session
 */
async function notifyContactsSessionStart(sentinelSessionId: string): Promise<void> {
  const contacts = await getEmergencyContacts();
  const session = await getSentinelSession(sentinelSessionId);

  if (!session) return;

  for (const contact of contacts.filter(c => c.notify_before_session)) {
    await sendAlert(session, contact, 'session_start');
  }
}

/**
 * Obtenir une sentinel session
 */
async function getSentinelSession(id: string): Promise<SentinelSession | null> {
  const { data, error } = await supabase
    .from('sentinel_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching sentinel session:', error);
    return null;
  }

  return data;
}

/**
 * Envoyer une alerte
 */
async function sendAlert(
  session: SentinelSession,
  contact: EmergencyContact,
  alertType: 'session_start' | 'check_in_missed' | 'overtime' | 'sos' | 'anomaly'
): Promise<void> {
  const message = generateAlertMessage(session, alertType);
  const trackingURL = `https://moovup.app/track/${session.tracking_url}`;

  // TODO: Implémenter envoi réel SMS/Email
  console.log(`Alert ${alertType} sent to ${contact.name} (${contact.phone})`);
  console.log(`Message: ${message}`);
  console.log(`Tracking URL: ${trackingURL}`);

  // Logger l'alerte
  await supabase
    .from('sentinel_alerts')
    .insert({
      sentinel_session_id: session.id,
      user_id: session.user_id,
      contact_id: contact.id,
      alert_type: alertType,
      alert_method: 'sms',
      message,
      tracking_url: trackingURL,
      sent: true,
      sent_at: new Date().toISOString(),
    });
}

/**
 * Générer message d'alerte
 */
function generateAlertMessage(session: SentinelSession, alertType: string): string {
  switch (alertType) {
    case 'session_start':
      return `[MoovUp Sentinel 🛡️]\n\nSession sport débutée.\nSuivez en direct: https://moovup.app/track/${session.tracking_url}`;
    case 'check_in_missed':
      return `[MoovUp Sentinel ⚠️]\n\nPas de réponse au check-in.\nVérifiez: https://moovup.app/track/${session.tracking_url}`;
    case 'sos':
      return `[MoovUp Sentinel 🚨 URGENCE]\n\nSOS déclenché!\nLocalisation: https://moovup.app/track/${session.tracking_url}`;
    default:
      return `[MoovUp Sentinel]\n\nAlerte: ${alertType}`;
  }
}

/**
 * Démarrer le tracking GPS en temps réel
 */
export async function startLocationTracking(sentinelSessionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Demander permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Location permission not granted');
    return;
  }

  // Tracking toutes les 30 secondes pendant la session
  const locationInterval = setInterval(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const batteryLevel = await Battery.getBatteryLevelAsync();

      await saveLocation(sentinelSessionId, {
        sentinel_session_id: sentinelSessionId,
        user_id: user.id,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        speed: location.coords.speed ? location.coords.speed * 3.6 : undefined, // m/s → km/h
        battery_level: Math.round(batteryLevel * 100),
      });

      // Détection d'anomalies
      await detectAnomalies(sentinelSessionId);
    } catch (error) {
      console.error('Error tracking location:', error);
    }
  }, 30000); // 30 secondes

  // TODO: Stocker l'interval ID pour pouvoir l'arrêter plus tard
  // Idéalement dans un context global ou state manager
}

/**
 * Sauvegarder une localisation
 */
async function saveLocation(sentinelSessionId: string, location: SentinelLocation): Promise<void> {
  await supabase
    .from('sentinel_locations')
    .insert(location);
}

/**
 * Détecter les anomalies
 */
async function detectAnomalies(sentinelSessionId: string): Promise<void> {
  const { data, error } = await supabase.rpc('detect_sentinel_anomalies', {
    p_sentinel_session_id: sentinelSessionId,
  });

  if (error) {
    console.error('Error detecting anomalies:', error);
    return;
  }

  // Si anomalies détectées
  if (data && data.length > 0) {
    for (const anomaly of data) {
      await supabase
        .from('sentinel_anomalies')
        .insert({
          sentinel_session_id: sentinelSessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          anomaly_type: anomaly.anomaly_type,
          severity: anomaly.severity,
          description: anomaly.description,
          action_taken: 'none',
        });

      // Si critique, forcer un check-in
      if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
        await forceCheckIn(sentinelSessionId);
      }
    }
  }
}

/**
 * Forcer un check-in immédiat
 */
async function forceCheckIn(sentinelSessionId: string): Promise<void> {
  // TODO: Envoyer notification push pour demander check-in immédiat
  console.log('Force check-in for sentinel session:', sentinelSessionId);

  await supabase
    .from('sentinel_sessions')
    .update({
      next_check_in_at: new Date().toISOString(),
    })
    .eq('id', sentinelSessionId);
}

/**
 * Répondre à un check-in
 */
export async function respondToCheckIn(
  sentinelSessionId: string,
  response: 'ok' | 'need_help_discreet' | 'sos'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Enregistrer la réponse
  await supabase
    .from('sentinel_check_ins')
    .insert({
      sentinel_session_id: sentinelSessionId,
      user_id: user.id,
      check_in_type: 'auto_prompt',
      response,
      responded_at: new Date().toISOString(),
    });

  // Mettre à jour la session
  await supabase
    .from('sentinel_sessions')
    .update({
      last_check_in_at: new Date().toISOString(),
      next_check_in_at: calculateNextCheckIn(30),
      missed_check_ins: 0,
    })
    .eq('id', sentinelSessionId);

  // Actions selon réponse
  if (response === 'sos') {
    await triggerSOS(sentinelSessionId);
  } else if (response === 'need_help_discreet') {
    await triggerDiscreetHelp(sentinelSessionId);
  }
}

/**
 * Déclencher SOS
 */
export async function triggerSOS(sentinelSessionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Récupérer localisation actuelle
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  // Mettre à jour la session
  await supabase
    .from('sentinel_sessions')
    .update({
      status: 'sos_triggered',
      sos_triggered: true,
      sos_triggered_at: new Date().toISOString(),
      sos_location_lat: location.coords.latitude,
      sos_location_lng: location.coords.longitude,
    })
    .eq('id', sentinelSessionId);

  // Alerter TOUS les contacts d'urgence
  const contacts = await getEmergencyContacts();
  const session = await getSentinelSession(sentinelSessionId);

  if (session) {
    for (const contact of contacts.filter(c => c.notify_on_sos)) {
      await sendAlert(session, contact, 'sos');
    }
  }

  // TODO: Démarrer enregistrement audio/photo
  // TODO: Proposer appel 112
}

/**
 * Déclencher aide discrète
 */
async function triggerDiscreetHelp(sentinelSessionId: string): Promise<void> {
  // TODO: Simuler appel "faux" à l'utilisateur
  console.log('Discreet help triggered for:', sentinelSessionId);

  const contacts = await getEmergencyContacts();
  const session = await getSentinelSession(sentinelSessionId);

  if (session && contacts.length > 0) {
    // Alerter contact principal seulement
    await sendAlert(session, contacts[0], 'check_in_missed');
  }
}

/**
 * Terminer une session Sentinel
 */
export async function completeSentinelSession(sentinelSessionId: string): Promise<void> {
  await supabase
    .from('sentinel_sessions')
    .update({
      status: 'completed',
      tracking_active: false,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sentinelSessionId);

  // Notifier contacts que tout va bien
  const contacts = await getEmergencyContacts();
  const session = await getSentinelSession(sentinelSessionId);

  if (session) {
    for (const contact of contacts.filter(c => c.notify_during_session)) {
      await supabase
        .from('sentinel_alerts')
        .insert({
          sentinel_session_id: session.id,
          user_id: session.user_id,
          contact_id: contact.id,
          alert_type: 'session_start',
          alert_method: 'sms',
          message: `[MoovUp Sentinel ✅]\n\nSession terminée avec succès.`,
          sent: true,
          sent_at: new Date().toISOString(),
        });
    }
  }

  // TODO: Arrêter le tracking GPS
  // Supprimer les locations temps réel (garder juste le résumé)
}

/**
 * Obtenir la session Sentinel active
 */
export async function getActiveSentinelSession(): Promise<SentinelSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('sentinel_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active sentinel session:', error);
    return null;
  }

  return data;
}

/**
 * Obtenir les localisations d'une session (pour tracking URL public)
 */
export async function getSentinelLocations(trackingUrl: string): Promise<SentinelLocation[]> {
  // D'abord récupérer la session via l'URL
  const { data: session } = await supabase
    .from('sentinel_sessions')
    .select('id')
    .eq('tracking_url', trackingUrl)
    .single();

  if (!session) return [];

  const { data, error } = await supabase
    .from('sentinel_locations')
    .select('*')
    .eq('sentinel_session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(100); // Dernières 100 locations (≈50 min)

  if (error) {
    console.error('Error fetching sentinel locations:', error);
    return [];
  }

  return data || [];
}
