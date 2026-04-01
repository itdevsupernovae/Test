# CLAUDE.md — PostureFix Project Memory

> Ce fichier est la source de vérité unique du projet PostureFix.
> Il doit être lu en premier par tout agent IA ou développeur qui rejoint le projet.

---

## 1. VISION & CONCEPT

**PostureFix** est une app mobile (iOS + Android) qui **force** les utilisateurs à faire de courtes routines d'étirement quotidiennes pour soigner les douleurs de dos, cou et épaules.

**Ce n'est PAS une app fitness** — c'est une **app de discipline avec un angle médical**.

**Promesse core :** "3 minutes par jour pour sauver ton dos."

**Positionnement :** Strict, minimal, efficace. Pas de bullshit. Le ton est direct, légèrement autoritaire. Différenciateur vs la concurrence : notifications persistantes, pression du streak, validation stricte, tracking de douleur qui prouve les résultats.

---

## 2. STACK TECHNIQUE

```
Frontend    : Expo (React Native) SDK 55 + TypeScript
Navigation  : Expo Router (file-based)
Backend     : Supabase (Auth + PostgreSQL + RLS)
Paiements   : RevenueCat (App Store + Google Play)
Analytics   : PostHog ou Mixpanel (à ajouter post-MVP)
Notifs      : expo-notifications (local) + Supabase Edge Functions (remote push)
Animations  : lottie-react-native (stubs en place, vraies animations à faire)
Charts      : react-native-chart-kit + react-native-svg
Stockage    : @react-native-async-storage/async-storage (offline-first)
i18n        : i18next + react-i18next + expo-localization
Auth        : Supabase Auth (email + Apple + Google — à compléter)
```

### Versions clés (package.json)
```
expo                      ~55.0.9
expo-router               ^55.0.8
react-native              ^0.79.2
react                     ^19.0.0
@supabase/supabase-js     ^2.101.1
react-native-reanimated   ^4.3.0
lottie-react-native       ^7.3.6
react-native-purchases    ^9.15.0 (RevenueCat)
i18next                   ^26.0.3
react-i18next             ^17.0.2
react-native-chart-kit    ^6.12.0
react-native-svg          ^15.15.4
@react-native-community/slider ^4.x
expo-notifications        ^55.0.14
expo-haptics              ^55.0.9
expo-av                   ^16.0.8
```

---

## 3. VARIABLES D'ENVIRONNEMENT REQUISES

Copier `.env.example` → `.env` et remplir :

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxxxxxx
```

---

## 4. STRUCTURE DU PROJET

```
posturefix/
├── app/                          # Expo Router — toutes les pages
│   ├── _layout.tsx               # Root layout (fonts, i18n init, nav gate)
│   ├── (tabs)/                   # Navigation par onglets
│   │   ├── _layout.tsx           # Config tab bar
│   │   ├── index.tsx             # Écran Today/Accueil
│   │   ├── progress.tsx          # Écran Progrès
│   │   └── settings.tsx          # Écran Paramètres
│   ├── onboarding/               # Flux d'onboarding (affiché une seule fois)
│   │   ├── welcome.tsx           # Écran 1 : Bienvenue
│   │   ├── pain-zones.tsx        # Écran 2 : Sélection zones douloureuses
│   │   ├── pain-level.tsx        # Écran 3 : Niveau de douleur initial (1-10)
│   │   ├── time-preference.tsx   # Écran 4 : Durée préférée (3 ou 5 min)
│   │   ├── notifications.tsx     # Écran 5 : Heure de rappel
│   │   └── commit.tsx            # Écran 6 : Engagement + disclaimer médical
│   ├── routine/                  # Flux routine (modal fullscreen)
│   │   ├── exercise.tsx          # Timer + animation Lottie (NO SKIP)
│   │   ├── pain-check.tsx        # Slider douleur post-routine
│   │   └── complete.tsx          # Écran de complétion + streak update
│   └── paywall.tsx               # Écran paywall RevenueCat
│
├── components/                   # Composants réutilisables
│   ├── Timer.tsx                 # Cercle de compte à rebours (Reanimated + SVG)
│   ├── PainSlider.tsx            # Slider 1-10 avec emoji
│   ├── StreakBadge.tsx           # Badge feu 🔥 + compteur
│   ├── ExerciseCard.tsx          # Carte exercice (nom, durée, zone)
│   ├── PainChart.tsx             # Graphique linéaire douleur (react-native-chart-kit)
│   ├── StreakCalendar.tsx        # Calendrier heatmap style GitHub
│   └── PaywallCard.tsx           # Carte option tarifaire
│
├── lib/                          # Logique métier
│   ├── supabase.ts               # Client Supabase (singleton)
│   ├── auth.ts                   # Helpers auth (signIn, signOut, signUp)
│   ├── routine-generator.ts      # Algorithme sélection exercices
│   ├── streak.ts                 # Calcul et mise à jour streak
│   ├── score.ts                  # Calcul Back Health Score (0-100)
│   ├── notifications.ts          # Scheduling notifications locales
│   ├── purchases.ts              # Wrapper RevenueCat
│   └── storage.ts                # AsyncStorage typé (offline-first)
│
├── data/
│   └── exercises.json            # 20 exercices bilingues (FR/EN)
│
├── assets/
│   ├── animations/               # 20 fichiers Lottie (STUBS — à remplacer)
│   │   ├── neck-side-stretch.json
│   │   ├── chin-tucks.json
│   │   └── ... (18 autres)
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
│
├── i18n/
│   ├── index.ts                  # Init i18next avec détection langue device
│   ├── fr.json                   # Toutes les chaînes françaises
│   └── en.json                   # Toutes les chaînes anglaises
│
├── theme/
│   ├── colors.ts                 # Palette de couleurs
│   ├── typography.ts             # Tailles et poids de police
│   └── spacing.ts                # Grille d'espacement (4pt)
│
├── hooks/
│   ├── useRoutine.ts             # Génération et état de la routine du jour
│   ├── useStreak.ts              # Données streak depuis AsyncStorage
│   ├── useSubscription.ts        # État abonnement RevenueCat + trial
│   └── usePainHistory.ts         # Historique douleur + Back Health Score
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schéma complet + RLS + seed 20 exercices
│
├── .env.example                  # Template variables d'environnement
├── .gitignore                    # Inclut .env, node_modules, .expo, dist
├── app.json                      # Config Expo (scheme, plugins, dark mode)
├── package.json                  # Dépendances (main = "expo-router/entry")
└── tsconfig.json                 # Strict mode + path alias @/*
```

---

## 5. FICHIERS QUI N'EXISTENT PAS DANS LE REPO (à régénérer)

Ces fichiers/dossiers sont dans `.gitignore` ou auto-générés — **ils n'existent pas après un `git clone`** :

| Fichier/Dossier | Comment le régénérer | Obligatoire pour démarrer ? |
|---|---|---|
| `node_modules/` | `npm install` | ✅ Oui |
| `.env` | Copier `.env.example` → `.env` et remplir | ✅ Oui (app crash sans Supabase) |
| `.expo/` | Auto-créé par `npx expo start` | Auto |
| `dist/` | `npx expo export` (build web) | Non |
| `ios/` | `npx expo prebuild` (si nécessaire) | Non (managed workflow) |
| `android/` | `npx expo prebuild` (si nécessaire) | Non (managed workflow) |

> **Note importante sur `App.tsx` :** Ce fichier est **volontairement absent**. Expo Router utilise `app/_layout.tsx` comme point d'entrée via `"main": "expo-router/entry"` dans `package.json`. Ajouter un `App.tsx` briserait la navigation.

---

## 6. COMMANDES POUR DÉMARRER

```bash
# 1. Cloner et installer
git clone <repo-url> posturefix
cd posturefix
git checkout claude/posturefix-mvp-SEPTz
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec les vraies valeurs Supabase + RevenueCat

# 3. Lancer en développement
npx expo start          # QR code → app Expo Go sur téléphone
npx expo start --ios    # Simulateur iOS (macOS requis)
npx expo start --android # Émulateur Android

# 4. Build production
npx eas build --platform ios
npx eas build --platform android
```

---

## 7. SCHÉMA BASE DE DONNÉES (Supabase)

Tables créées par `supabase/migrations/001_initial_schema.sql` :

```sql
users       -- Profil utilisateur (pain_zones, initial_pain, subscription_status, phase)
sessions    -- Sessions quotidiennes (exercises JSONB, pain_before, pain_after)
streaks     -- Cache streak (current_streak, longest_streak, last_completed_date)
pain_logs   -- Historique douleur dénormalisé pour charts
exercises   -- Bibliothèque exercices (seeded, 20 entrées)
```

RLS activé sur toutes les tables. Chaque user ne voit que ses propres données.

---

## 8. SYSTÈME DE COULEURS

```typescript
background:  '#0F172A'  // Bleu marine foncé
surface:     '#1E293B'  // Carte/fond élevé
primary:     '#4ADE80'  // Vert — actions principales, progrès
accent:      '#F97316'  // Orange — streaks, urgence, feu
danger:      '#EF4444'  // Rouge — jours manqués, douleur haute
textPrimary: '#F8FAFC'  // Blanc cassé
textMuted:   '#94A3B8'  // Gris
```

---

## 9. LOGIQUE MÉTIER CLÉ

### Génération de routine (`lib/routine-generator.ts`)
- 2 exercices ciblant la/les zone(s) primaire(s) de douleur
- 1 exercice complémentaire
- Filtre par phase (1-4) de l'utilisateur
- Exclut les exercices de la veille
- Ajuste les durées pour tenir dans 3 ou 5 minutes

### Back Health Score (`lib/score.ts`)
```
score = (consistency_30d × 0.4) + (pain_improvement × 0.3) + (streak_bonus × 0.3)

consistency_30d  = (sessions_30j / 30) × 100, plafonné à 100
pain_improvement = ((douleur_initiale - moy_récente) / douleur_initiale) × 100
streak_bonus     = min(streak_actuel / 30, 1) × 100
```

### Trial gratuit (`hooks/useSubscription.ts`)
- Jours 1-5 : accès complet gratuit
- Jour 6+ : paywall obligatoire si pas premium
- Basé sur `account_created_at` dans AsyncStorage

### Streak (`lib/streak.ts`)
- Stocké localement dans AsyncStorage (offline-first)
- Mis à jour sur `updateStreakOnCompletion()`
- Si `last_completed_date` = hier → streak + 1
- Si > hier → streak repart à 1

---

## 10. MONÉTISATION

### Tarifs RevenueCat
| Plan | Prix | Notes |
|---|---|---|
| Weekly | 2,99€/semaine | Affiché en premier (conversion 2-3× meilleure) |
| Monthly | 5,99€/mois | Ancre de valeur |
| Annual | 29,99€/an | "Économise 58%" |

### Fonctionnalités premium (gating dans `hooks/useSubscription.ts`)
- Strict Mode notifications
- Graphiques progrès 30 jours (gratuit = 7 jours)
- Routines multiples (matin + soir)
- Progression de phase (Phase 2+)

### Déclencheurs paywall
- Jour 6 au démarrage
- Clic sur Strict Mode dans Paramètres
- Clic sur graphiques bloqués

---

## 11. SYSTÈME DE NOTIFICATIONS

| Type | Timing | Ton |
|---|---|---|
| Rappel quotidien | Heure choisie par l'user | Motivant |
| Rappel manqué | +3h après heure choisie | Ferme |
| Fin de journée | 21h00 si pas fait | Strict |
| Streak en danger | Lendemain matin | Urgent |
| Milestone | Après 7, 14, 30 jours | Célébration |
| Ré-engagement | Après 3 jours inactif | Direct (remote push) |

Implémentation : `lib/notifications.ts` + Supabase Edge Functions (remote).

---

## 12. ANIMATIONS LOTTIE (À FAIRE)

Les 20 fichiers dans `assets/animations/` sont des **stubs de placeholder** (cercle animé vert). Ils sont fonctionnels mais doivent être remplacés par de vraies animations avant le lancement.

**Fichiers à remplacer :**
```
neck-side-stretch.json        chin-tucks.json
neck-rotation.json            upper-trapezius-stretch.json
neck-flexion-extension.json   shoulder-rolls.json
cross-body-shoulder.json      doorway-chest-stretch.json
shoulder-blade-squeezes.json  arm-circles.json
cat-cow.json                  thoracic-rotation.json
thread-needle.json            seated-spinal-twist.json
upper-back-opening.json       childs-pose.json
knee-to-chest.json            pelvic-tilts.json
supine-spinal-twist.json      standing-forward-fold.json
```

**Ressources recommandées :** LottieFiles.com, Fiverr (motion designers)

---

## 13. PLAN DE DÉVELOPPEMENT (5 PHASES)

### ✅ Phase 1 — Fondation (COMPLÈTE)
- Initialisation projet Expo SDK 55 + TypeScript
- Expo Router (navigation tabs + modals)
- Système de thème (dark mode first)
- i18n FR/EN complet
- Client Supabase
- Structure de navigation complète

### ✅ Phase 2 — Routine Core (COMPLÈTE)
- Timer circulaire Reanimated (pas de skip)
- 20 exercices (JSON + stubs Lottie)
- Générateur de routine
- Flux complet : exercise → pain-check → complete
- Enregistrement session offline-first (AsyncStorage)

### ✅ Phase 3 — Engagement (COMPLÈTE)
- Calcul streak (offline-first)
- Écran Home (3 états : à faire / complété / raté hier)
- Écran Progress (chart, heatmap, Back Health Score)
- Écran Settings (notifs, langue, strict mode)
- Scheduling notifications locales

### ✅ Phase 4 — Monétisation (COMPLÈTE)
- Wrapper RevenueCat
- Écran Paywall avec données réelles user
- Logic trial 5 jours
- Gating features premium
- Restore purchases

### 🔲 Phase 5 — Finitions & Lancement (À FAIRE)
- [ ] Vraies animations Lottie (remplacer stubs)
- [ ] App icon + splash screen définitifs
- [ ] Gestion d'erreurs complète + états loading/vide
- [ ] Intégration Supabase Auth (email + Apple + Google Sign-In)
- [ ] Supabase Edge Functions (re-engagement push)
- [ ] Analytics (PostHog ou Mixpanel)
- [ ] Crash reporting (Sentry)
- [ ] TestFlight / tests internes
- [ ] Optimisation performance
- [ ] Screenshots App Store (FR + EN)
- [ ] Description App Store (ASO)
- [ ] Page web Privacy Policy + Terms of Service
- [ ] Soumission App Store + Google Play

---

## 14. LOCALISATION

- **Langues au lancement :** Français (primaire) + Anglais
- **Marché cible FR :** France, Belgique, Suisse, Québec, Afrique francophone
- Toutes les chaînes dans `i18n/fr.json` et `i18n/en.json`
- Détection automatique depuis la langue du device
- Override manuel dans Paramètres (persisté dans AsyncStorage)

---

## 15. MENTIONS LÉGALES REQUISES (App Store)

### Disclaimer médical (OBLIGATOIRE)
Affiché dans :
1. Onboarding (écran commit)
2. Paramètres > À propos
3. Description App Store

> "PostureFix ne remplace pas un avis médical. Consultez un professionnel de santé avant de commencer tout programme d'exercices. En cas de douleur intense ou chronique, arrêtez immédiatement et consultez un médecin."

### Autres requis
- Privacy Policy (page web à héberger)
- Terms of Service (page web à héberger)
- Formulaire Data Safety Google Play

---

## 16. RÈGLES MÉTIER IMMUABLES

1. **PAS DE SKIP** — Le timer doit atteindre zéro. Pause autorisée, pas de saut.
2. **PAS DE CHOIX D'EXERCICES** — L'app décide. L'user démarre ou ne démarre pas.
3. **MAX 5 MINUTES** — Aucune routine ne dépasse 5 minutes.
4. **OFFLINE FIRST** — La routine du jour fonctionne sans internet.
5. **SON DÉSACTIVÉ PAR DÉFAUT** — Optionnel.
6. **HAPTIQUES ACTIVÉS PAR DÉFAUT** — Optionnel.
7. **PAS DE PUB, JAMAIS** — Revenus = abonnements uniquement.
8. **DARK MODE FIRST** — Light mode = optionnel pour v2.

---

## 17. MÉTRIQUES DE SUCCÈS

| Métrique | Cible |
|---|---|
| Taux complétion onboarding | > 80% |
| Routine complétée Jour 1 | > 60% |
| Rétention Jour 5 | > 40% |
| Conversion paywall (début trial) | > 15% |
| Conversion trial → payant | > 40% |
| Rétention Jour 30 | > 20% |
| Durée moyenne session | 3-5 min |

---

## 18. BRANCHE GIT

- **Branche de développement :** `claude/posturefix-mvp-SEPTz`
- **Remote :** `itdevsupernovae/Test`
- **Premier commit :** `cacf37c` — "feat: initialize PostureFix MVP — full Phases 1–4"
