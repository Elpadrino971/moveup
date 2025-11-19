# 🛡️ MoovUp Now - Système de Modération

## 🎯 Vision : Plateforme Sportive SAFE & CLEAN

**MoovUp Now = Sport, santé, communauté**  
❌ **PAS** une app de rencontres déguisée  
❌ **PAS** de dérive "sports de lit"  
✅ **Modération stricte** pour garder l'ADN sportif

---

## ⚠️ Contenus Interdits

### Catégories Bannies Automatiquement

#### 🔞 Contenu Sexuel / Suggestif
- ❌ Propositions à caractère sexuel
- ❌ Messages avec sous-entendus
- ❌ Photos suggestives ou dénudées
- ❌ "Sports de lit" ou euphémismes similaires
- ❌ Invitations chez soi (sauf groupes validés)
- ❌ Demandes de photos intimes

#### 💰 Contenu Commercial Non-Autorisé
- ❌ Vente de produits non-sportifs
- ❌ MLM / Pyramides
- ❌ Publicité personnelle
- ❌ Liens externes suspects

#### 🚫 Harcèlement & Discrimination
- ❌ Insultes, harcèlement
- ❌ Discrimination (sexe, origine, religion, etc.)
- ❌ Messages répétés non désirés
- ❌ Stalking / Contact obsessionnel

#### 🎭 Faux Profils
- ❌ Profils fake / catfishing
- ❌ Usurpation d'identité
- ❌ Fausses photos
- ❌ Bots / Spam automatisé

---

## 🤖 Modération Automatique (IA + Règles)

### Détection de Mots-Clés Suspects

#### Niveau 1 - Auto-Rejet
Mots déclenchant **rejet immédiat** du message :
- Vocabulaire sexuel explicite
- "Rencontre intime", "coquin", etc.
- Sites de rencontre / OnlyFans
- Numéros de téléphone dans messages initiaux
- URLs suspectes

#### Niveau 2 - Flag pour Review Humaine
Expressions ambiguës nécessitant vérification :
- "Viens chez moi" (seul)
- "On se voit en privé"
- "Massage", "relaxation"
- Invitations répétées à même personne
- Changement soudain de ton

#### Niveau 3 - Analyse de Pattern
Comportements suspects :
- Messages identiques à plusieurs personnes
- Création de sessions "privées" répétitives
- Photos de profil changées fréquemment
- Taux de signalement > 5%

### IA de Détection de Contexte

```python
# Exemple de détection contextuelle
def analyze_message(message, user_history, context):
    # Check mots-clés interdits
    if contains_banned_words(message):
        return "REJECT", "Contenu inapproprié"
    
    # Analyse sémantique IA
    intent = ai_model.classify_intent(message)
    if intent == "SEXUAL_ADVANCE":
        return "REJECT", "Proposition non-sportive"
    
    # Pattern de comportement
    if is_repetitive_invitation(user_history, message):
        return "FLAG", "Comportement suspect - review"
    
    # Contexte de conversation
    if is_derailing_from_sport(context, message):
        return "WARNING", "Hors sujet sportif"
    
    return "APPROVE", None
```

---

## 👮 Modération Humaine

### Équipe de Modération

#### Structure
- **Lead Moderator** (1) - temps plein
- **Moderators** (3-5) - temps plein
- **Community Moderators** (volontaires niveau 4+)
- **IA Support** - triage automatique

#### Horaires
- Couverture 7j/7, 16h-2h (heures de pic)
- Review flagged content < 2h
- Urgences (harcèlement) < 30 min

### Process de Review

#### Signalement Utilisateur
```
User signale un message/profil
↓
[Auto-Modération IA]
↓
Si suspect → Queue Modérateur
↓
Review humaine (contexte complet)
↓
Décision: Approve / Warn / Suspend / Ban
↓
Notification à l'utilisateur
```

#### Niveaux de Sanction

| Gravité | Sanction | Durée | Conséquence |
|---------|----------|-------|-------------|
| **Mineur** | Warning | - | Email + notification |
| **Moyen** | Suspension | 7j | Pas de sessions ni messages |
| **Grave** | Ban temporaire | 30j | Compte gelé |
| **Très grave** | Ban définitif | Permanent | Compte supprimé + IP ban |

---

## 🔒 Protections Spécifiques

### Invitations "Chez Soi"

#### Règles Strictes
- ❌ **Interdit** pour sessions 1-on-1 niveau < 3
- ⚠️ **Flagged** si détecté dans messages privés
- ✅ **Autorisé** UNIQUEMENT :
  - Groupes de 3+ personnes
  - Trust Level 4+
  - Historique propre
  - Après validation mutuelle explicite

#### Message d'Alerte Auto
```
"⚠️ Rappel de Sécurité :

MoovUp Now recommande de toujours se retrouver
dans des LIEUX PUBLICS pour les sessions.

- Parcs, terrains de sport, salles
- Lieux avec présence publique
- Jamais seul chez quelqu'un au premier RDV

Ta sécurité est notre priorité ! 🛡️"
```

### Photos de Profil

#### Validation Manuelle
- **Toutes les photos** passent par modération (24h max)
- IA détecte : nudité, contenu sexuel, armes
- Modérateur valide : visage identifiable, sportif, approprié

#### Interdictions
- ❌ Torse nu (sauf contexte sportif clair : piscine, plage, compétition)
- ❌ Poses suggestives
- ❌ Selfies miroir salle de bain
- ❌ Photos de groupe ambiguës
- ❌ Absence de visage clair

### Messages Privés

#### Détection en Temps Réel
- IA scan 100% des messages
- Algorithme pattern matching
- Score de suspicion automatique

#### Limitations Trust Level 1
- Max 5 conversations simultanées
- Max 20 messages/jour
- Délai 10min entre messages à nouvelles personnes
- Review automatique si signalement

---

## 📊 KPIs de Modération

### Metrics de Qualité

| Métrique | Cible | Action si dépassé |
|----------|-------|-------------------|
| Taux de signalement | < 1% des messages | Renforcer filtres IA |
| Temps de review | < 2h | Embaucher modérateurs |
| Faux positifs IA | < 5% | Réentraîner modèle |
| Bans définitifs | < 0.1% users | OK |
| Récidive post-warning | < 10% | Durcir sanctions |

### Reporting Hebdomadaire
- Nombre de signalements
- Catégories de violations
- Comptes bannis
- Efficacité IA vs humain
- Faux positifs/négatifs

---

## 🎓 Éducation Utilisateurs

### Onboarding - Message Clair

```
┌──────────────────────────────────┐
│  🏃 MoovUp Now = Sport & Santé  │
│                                  │
│  ✅ Sessions sportives           │
│  ✅ Motivation mutuelle          │
│  ✅ Communauté saine             │
│                                  │
│  ❌ Pas de rencontres amoureuses │
│  ❌ Pas de contenu sexuel        │
│  ❌ Pas de harcèlement           │
│                                  │
│  🛡️ Nous modérons activement    │
│  pour ta sécurité                │
│                                  │
│  [J'accepte la Charte]           │
└──────────────────────────────────┘
```

### Rappels Réguliers

#### In-App Messages
- Lors de première session : "Lieux publics recommandés"
- Avant premier message : "Reste respectueux et sportif"
- Si détection pattern : "Rappel : plateforme sportive"

#### Push Notifications Éducatives
```
💡 "Astuce Sécurité :
Toujours informer un proche de tes sessions
et partager ta localisation. 🛡️"
```

---

## 🚨 Cas d'Urgence

### Procédure Harcèlement

1. **Signalement urgent** → Modérateur alerté immédiat
2. **Review < 15 min**
3. **Suspension préventive** de l'accusé
4. **Contact** victime pour support
5. **Investigation** complète
6. **Décision finale** sous 24h
7. **Rapport** aux autorités si nécessaire

### Contact Urgence
- 📧 abuse@moovupnow.com
- 📱 Bouton "Urgence" dans app
- ⚡ Réponse garantie < 30 min

---

## 🔧 Outils de Modération

### Dashboard Modérateur

```
┌────────────────────────────────────┐
│  📊 Queue de Modération            │
│  ────────────────────────────────  │
│                                    │
│  🚨 URGENT (3)                     │
│  ⚠️  Flagged par IA (12)          │
│  📝 Signalements users (8)        │
│                                    │
│  [Trier par: Urgence ▼]           │
│                                    │
│  🚨 @user123 - Harcèlement sexuel │
│  Signalé par @victim456           │
│  Evidence: 4 messages + screenshot │
│  [Review] [Ban immédiat]          │
│                                    │
│  ⚠️ @user789 - IA: Contenu suspect│
│  "Massage relaxant chez moi..."   │
│  [Approuver] [Rejeter] [Warning]  │
└────────────────────────────────────┘
```

### Historique Complet
- Tous les messages d'un user
- Profils consultés
- Sessions créées/annulées
- Signalements reçus/faits
- Pattern d'activité

---

## 💰 Impact Business

### Protection de Marque
- **Réputation clean** = confiance parents
- **Sécurité prouvée** = adoption femmes
- **Pas de scandale** = investisseurs rassurés
- **Apple/Google approval** = pas de ban stores

### Coût vs Bénéfice

#### Coûts Modération
- Lead Moderator : 45k€/an
- 4 Moderators : 120k€/an
- IA tools (API) : 10k€/an
- **Total : ~175k€/an**

#### Économies Évitées
- Scandale presse : -500k€ (valeur détruite)
- Ban App Store : -100% revenus
- Procès utilisateurs : -50k€+/cas
- **ROI largement positif**

---

## 🎯 Résumé : "Soft Platform"

MoovUp Now = **Plateforme familiale et saine**

### Piliers
1. **Modération IA + Humaine** active 24/7
2. **Éducation utilisateurs** dès l'onboarding
3. **Sanctions progressives** mais fermes
4. **Transparence totale** sur les règles
5. **Support rapide** aux victimes

### Message Clair
> "MoovUp Now connecte les gens pour BOUGER,  
> pas pour autre chose.  
> Tout comportement non-sportif = ban.  
> Point final. 🛡️"

---

_Dernière mise à jour : 2025-01-19_
