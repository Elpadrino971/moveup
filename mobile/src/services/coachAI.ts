/**
 * Service: Coach IA "Moov"
 * Chat avec IA contextuel, function calling, messages proactifs
 */

import { supabase } from './supabase';
import OpenAI from 'openai';

// Types
export interface AIMessage {
  id: string;
  user_id: string;
  message: string;
  is_user: boolean;
  tokens_used?: number;
  model?: string;
  function_called?: string;
  created_at: string;
}

export interface AIAction {
  id: string;
  conversation_id: string;
  user_id: string;
  action_type: string;
  action_data: any;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface AIPreferences {
  user_id: string;
  response_style: 'motivating' | 'analytical' | 'friendly' | 'professional';
  tone: 'casual' | 'formal';
  proactive_messages: boolean;
  voice_enabled: boolean;
  nutrition_tracking: boolean;
  glucose_tracking: boolean;
  daily_message_limit: number;
  messages_today: number;
}

export interface ProactiveMessage {
  id: string;
  user_id: string;
  message_type: string;
  message_content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  sent: boolean;
  read: boolean;
  suggested_actions?: any;
  created_at: string;
}

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

/**
 * Vérifier la limite de messages quotidiens
 */
export async function checkDailyMessageLimit(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('check_daily_message_limit', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error checking message limit:', error);
    return false;
  }

  return data || false;
}

/**
 * Obtenir le contexte utilisateur pour l'IA
 */
async function getUserContext(): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_user_context_for_ai', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error fetching user context:', error);
    return {};
  }

  return data || {};
}

/**
 * Construire le system prompt
 */
function buildSystemPrompt(context: any, preferences: AIPreferences): string {
  const profile = context.profile || {};
  const sessions = context.recent_sessions || [];
  const objectives = context.active_objectives || [];

  let prompt = `Tu es Moov, le coach personnel IA de ${profile.username} sur MoovUp Now.

PROFIL UTILISATEUR:
- Âge: ${profile.age || '?'} ans
- Genre: ${profile.gender || 'non spécifié'}
- Objectif principal: ${profile.main_goal || 'forme générale'}
- Trust Level: ${profile.trust_level || 0}
- Abonnement: ${profile.subscription_tier || 'free'}
${profile.has_diabetes ? '- ⚠️ DIABÉTIQUE (surveiller glycémie)' : ''}

STATS RÉCENTES (30 jours):
- Sessions: ${sessions.length}
- Sports: ${sessions.map((s: any) => s.sport).join(', ') || 'aucun'}

CO-OBJECTIFS ACTIFS:
${objectives.map((o: any) => `- ${o.title} (${o.status})`).join('\n') || 'Aucun'}

TON RÔLE:
1. Motiver et encourager de manière positive
2. Donner des conseils personnalisés basés sur les données
3. Prévenir les blessures et promouvoir la sécurité
4. Aider à atteindre les objectifs
5. Gamifier l'expérience (MoovCoins, badges, défis)
${profile.has_diabetes ? '6. PRIORITÉ: Sécurité diabète - alerter si glycémie problématique' : ''}

STYLE:
- ${preferences.response_style === 'motivating' ? 'Amical et motivant' : preferences.response_style}
- ${preferences.tone === 'casual' ? 'Ton casual avec emojis OK' : 'Ton professionnel'}
- Concis et actionnable (max 150 mots)
- Empathique si difficulté
- Célèbre les victoires

INTERDICTIONS:
- Ne JAMAIS donner de diagnostics médicaux
- Toujours recommander médecin si blessure/douleur persistante
- Ne pas pousser à l'overtraining
- Respecter les jours de repos`;

  return prompt;
}

/**
 * Obtenir les préférences IA de l'utilisateur
 */
async function getUserPreferences(): Promise<AIPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ai_user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching AI preferences:', error);
  }

  return data || {
    user_id: user.id,
    response_style: 'motivating',
    tone: 'casual',
    proactive_messages: true,
    voice_enabled: false,
    nutrition_tracking: false,
    glucose_tracking: false,
    daily_message_limit: 10,
    messages_today: 0,
  };
}

/**
 * Obtenir l'historique de conversation
 */
async function getConversationHistory(limit: number = 10): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('message, is_user')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }

  // Inverser l'ordre (plus ancien au plus récent)
  const reversed = (data || []).reverse();

  return reversed.map((msg: any) => ({
    role: msg.is_user ? 'user' : 'assistant',
    content: msg.message,
  }));
}

/**
 * Envoyer un message au Coach IA
 */
export async function chat(userMessage: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Vérifier la limite
  const canSend = await checkDailyMessageLimit();
  if (!canSend) {
    return "❌ Limite quotidienne atteinte (10 messages/jour en Free).\n\nPasse à Premium pour des messages illimités ! 🚀";
  }

  // Incrémenter compteur
  await supabase.rpc('increment_message_count', {
    p_user_id: user.id,
  });

  // Récupérer contexte et préférences
  const context = await getUserContext();
  const preferences = await getUserPreferences();
  const history = await getConversationHistory();

  // Construire le system prompt
  const systemPrompt = buildSystemPrompt(context, preferences);

  // Sauvegarder le message utilisateur
  await supabase
    .from('ai_conversations')
    .insert({
      user_id: user.id,
      message: userMessage,
      is_user: true,
    });

  try {
    // Appel à OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
      functions: getAvailableFunctions(),
    });

    const response = completion.choices[0].message;
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Calculer coût
    const costUSD = calculateCost('gpt-4-turbo', tokensUsed);

    // Logger le coût
    await supabase.rpc('log_ai_cost', {
      p_model: 'gpt-4-turbo',
      p_tokens: tokensUsed,
      p_cost_usd: costUSD,
    });

    // Si function call
    if (response.function_call) {
      await handleFunctionCall(response.function_call);
    }

    const aiMessage = response.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    // Sauvegarder la réponse
    await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        message: aiMessage,
        is_user: false,
        tokens_used: tokensUsed,
        model: 'gpt-4-turbo',
        function_called: response.function_call?.name || null,
      });

    return aiMessage;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return "❌ Désolé, j'ai rencontré une erreur. Réessaie dans quelques instants.";
  }
}

/**
 * Calculer le coût d'un appel API
 */
function calculateCost(model: string, tokens: number): number {
  // Prix approximatifs (à jour 2025)
  const prices: { [key: string]: { input: number; output: number } } = {
    'gpt-4-turbo': { input: 0.01, output: 0.03 }, // $/1000 tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  const price = prices[model] || prices['gpt-4-turbo'];

  // Estimer 50/50 input/output
  const inputTokens = tokens * 0.5;
  const outputTokens = tokens * 0.5;

  return (inputTokens / 1000 * price.input) + (outputTokens / 1000 * price.output);
}

/**
 * Functions disponibles pour le Coach IA
 */
function getAvailableFunctions(): OpenAI.Chat.ChatCompletionCreateParams.Function[] {
  return [
    {
      name: 'book_session',
      description: 'Réserver une session sportive pour l\'utilisateur',
      parameters: {
        type: 'object',
        properties: {
          session_id: { type: 'string', description: 'ID de la session à réserver' },
        },
        required: ['session_id'],
      },
    },
    {
      name: 'create_objective',
      description: 'Créer un nouvel objectif pour l\'utilisateur',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Titre de l\'objectif' },
          target_value: { type: 'number', description: 'Valeur cible (ex: 10000 pas)' },
          duration_days: { type: 'number', description: 'Durée en jours' },
        },
        required: ['title', 'target_value'],
      },
    },
    {
      name: 'award_moovcoins',
      description: 'Donner des MoovCoins à l\'utilisateur pour un accomplissement',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Nombre de coins (max 100)' },
          reason: { type: 'string', description: 'Raison du bonus' },
        },
        required: ['amount', 'reason'],
      },
    },
    {
      name: 'send_glucose_alert',
      description: 'Envoyer une alerte glycémie si diabétique et valeur problématique',
      parameters: {
        type: 'object',
        properties: {
          glucose_value: { type: 'number', description: 'Valeur en mg/dL' },
          alert_type: { type: 'string', enum: ['hypo', 'hyper'] },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Liste de recommandations',
          },
        },
        required: ['glucose_value', 'alert_type'],
      },
    },
  ];
}

/**
 * Gérer les function calls
 */
async function handleFunctionCall(functionCall: OpenAI.Chat.ChatCompletionMessage.FunctionCall): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const name = functionCall.name;
  const args = JSON.parse(functionCall.arguments || '{}');

  let success = true;
  let errorMessage: string | undefined;

  try {
    switch (name) {
      case 'book_session':
        // TODO: Implémenter booking
        console.log('Booking session:', args.session_id);
        break;

      case 'create_objective':
        // TODO: Implémenter création objectif
        console.log('Creating objective:', args);
        break;

      case 'award_moovcoins':
        const amount = Math.min(args.amount, 100); // Max 100 coins par call
        await supabase.rpc('add_moovcoins', {
          p_user_id: user.id,
          p_amount: amount,
          p_reason: args.reason || 'Bonus Coach Moov',
        });
        break;

      case 'send_glucose_alert':
        // TODO: Envoyer alerte glycémie
        console.log('Glucose alert:', args);
        break;

      default:
        console.warn('Unknown function call:', name);
        success = false;
        errorMessage = 'Unknown function';
    }
  } catch (error: any) {
    success = false;
    errorMessage = error.message;
    console.error('Error executing function call:', error);
  }

  // Logger l'action
  await supabase
    .from('ai_actions')
    .insert({
      user_id: user.id,
      action_type: name,
      action_data: args,
      success,
      error_message: errorMessage,
    });
}

/**
 * Obtenir l'historique de conversation
 */
export async function getConversations(limit: number = 50): Promise<AIMessage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtenir les messages proactifs non lus
 */
export async function getProactiveMessages(): Promise<ProactiveMessage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ai_proactive_messages')
    .select('*')
    .eq('user_id', user.id)
    .eq('read', false)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching proactive messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Marquer un message proactif comme lu
 */
export async function markProactiveMessageAsRead(messageId: string): Promise<void> {
  await supabase
    .from('ai_proactive_messages')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', messageId);
}

/**
 * Mettre à jour les préférences IA
 */
export async function updateAIPreferences(preferences: Partial<AIPreferences>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase
    .from('ai_user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    });
}

/**
 * Obtenir les suggestions rapides (quick actions)
 */
export function getQuickSuggestions(): string[] {
  return [
    "Trouve-moi une session ce soir",
    "Analyse ma semaine",
    "Que manger après ma session ?",
    "Crée-moi un défi 7 jours",
    "Compare-moi à la communauté",
  ];
}
