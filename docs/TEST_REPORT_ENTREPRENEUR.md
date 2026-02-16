# Rapport de Test - Parcours Entrepreneur
**Date:** 16 février 2026
**Testeur:** Claude (Analyse de code)
**Type:** Test statique / Analyse fonctionnelle

---

## 📋 Parcours testé

1. Signup (création de compte)
2. Onboarding (configuration du profil)
3. Création de projet
4. Visibilité et candidatures

---

## ✅ Points Positifs

### 1. Signup (/signup)
- ✅ **Validation robuste** : Email regex, mot de passe min 8 caractères, confirmation mdp
- ✅ **Sélection de rôle** : Peut venir via URL param (`?role=entrepreneur`)
- ✅ **Processus multi-étapes** : Role → Info → Charte → Confirmation email
- ✅ **Charte éthique obligatoire** : Enregistrée dans `user_charter_acceptances` avec IP et timestamp
- ✅ **Gestion email confirmation** : Détecte si Supabase a une session ou nécessite confirmation
- ✅ **RPC pour profil** : Utilise `create_user_profile` RPC pour bypasser RLS lors de la création
- ✅ **Messages d'erreur clairs** : "Cet email est déjà utilisé", validation en temps réel

**Code Review:**
```typescript
// ✅ Bonne pratique : Validation côté client avant soumission
const validateInfoStep = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
  if (formData.password.length < 8) newErrors.password = 'Au moins 8 caractères';
  // ...
}

// ✅ Bonne pratique : Enregistrement de la charte avec IP et version
await supabase.from('user_charter_acceptances').insert({
  user_id: authData.user.id,
  charter_version: 'v1.0',
  ip_address: clientIp, // Récupéré via API /api/get-client-ip
});
```

### 2. Onboarding (/onboarding)
- ✅ **3 étapes structurées** : Localisation → Compétences (si talent) → Présentation
- ✅ **Géolocalisation automatique** : Utilise l'API gouvernementale `api-adresse.data.gouv.fr`
- ✅ **PostGIS intégration** : Appelle `update_profile_location` RPC pour stocker les coordonnées
- ✅ **Validation stricte** : Code postal français (5 chiffres), bio min 50 caractères
- ✅ **Rayon de déplacement** : Configurable (défaut 50km)
- ✅ **Gestion d'erreur gracieuse** : Ne bloque pas si le geocoding échoue

**Code Review:**
```typescript
// ✅ Excellente pratique : Géocodage avec API gouvernementale
const geoResponse = await fetch(
  `https://api-adresse.data.gouv.fr/search/?q=${formData.postalCode}&type=municipality&limit=1`
);
const [lng, lat] = geoData.features[0].geometry.coordinates;

// ✅ Bonne pratique : Séparation des responsabilités (update profile puis location)
await supabase.from('profiles').update(updateData).eq('id', user.id);
await supabase.rpc('update_profile_location', { user_id, lng, lat });
```

### 3. Création de Projet (/projects/new)
- ✅ **Formulaire multi-étapes** : Info projet → Compétences → Localisation
- ✅ **16 catégories de projets** : Du tech à l'agriculture, bien exhaustif
- ✅ **5 phases de projet** : Idéation → Structuration
- ✅ **Compétences groupées par catégorie** : Technique, Business, Créatif, Opérationnel, Expertise
- ✅ **Géolocalisation du projet** : Même logique que profil (API gouvernementale)
- ✅ **Travail à distance** : Option `isRemotePossible`
- ✅ **Rayon préféré** : Configurable (défaut 30km)

**Code Review:**
```typescript
// ✅ Bonne organisation : Phases clairement définies
const PROJECT_PHASES = [
  { value: 'ideation', label: '💡 Idéation - Je concrétise mon idée' },
  { value: 'mvp_development', label: '🛠️ Développement MVP - Je construis mon prototype' },
  // ...
];

// ✅ Bonne UX : Catégories visuelles avec emojis
const PROJECT_CATEGORIES = [
  { value: 'agriculture', label: '🌾 Agriculture / Agroalimentaire' },
  // ...
];
```

---

## ⚠️ Points d'Attention

### 1. Signup
- ⚠️ **Pas de validation force du mot de passe** : Min 8 caractères OK, mais pas de complexité (majuscule, chiffre, caractère spécial)
- ⚠️ **IP fallback par défaut** : Si `/api/get-client-ip` échoue, utilise `'0.0.0.0'` (acceptable mais suboptimal)
- ⚠️ **Erreur charter ignorée** : Si l'insert dans `user_charter_acceptances` échoue, on log mais on continue (pourrait être bloquant pour conformité RGPD)

**Recommandation:**
```typescript
// ❌ Actuel : Erreur ignorée
if (charterError) {
  console.error('Charter acceptance error:', charterError);
}

// ✅ Proposé : Bloquer si échec critique
if (charterError) {
  console.error('Charter acceptance error:', charterError);
  setErrors({ general: 'Erreur lors de l\'enregistrement de la charte. Veuillez réessayer.' });
  setIsLoading(false);
  return;
}
```

### 2. Onboarding
- ⚠️ **Géocodage silencieux** : Si le géocodage échoue, le profil est quand même créé sans coordonnées GPS
  - **Impact** : Le matching territorial ne fonctionnera pas pour cet utilisateur
  - **Solution** : Avertir l'utilisateur ou proposer une saisie manuelle de la ville

- ⚠️ **Pas de prévisualisation** : L'utilisateur ne voit pas son profil avant validation finale

- ⚠️ **Bio min 50 caractères** : Peut être contraignant pour certains utilisateurs
  - **Recommandation** : Réduire à 30 caractères ou afficher un compteur en temps réel

### 3. Création de Projet
- ⚠️ **Validation du pitch court** : Pas de limite de caractères visible
  - **Recommandation** : Ajouter un compteur (max 280 caractères type Twitter)

- ⚠️ **Compétences non limitées** : Un entrepreneur peut sélectionner toutes les compétences
  - **Recommandation** : Limiter à 10-15 compétences max pour clarifier les besoins

- ⚠️ **Pas de prévisualisation** : L'entrepreneur ne voit pas comment son projet apparaîtra aux talents

---

## 🐛 Bugs Potentiels

### 1. Race Condition Possible (Signup)
**Fichier:** `app/signup/SignupForm.tsx:143`

```typescript
// Appel RPC après création auth
const { error: profileError } = await supabase.rpc('create_user_profile', {
  user_id: authData.user.id,
  first_name: formData.firstName,
  last_name: formData.lastName,
  role: role,
});
```

**Risque:** Si l'utilisateur rafraîchit la page entre la création auth et le profil, le profil ne sera jamais créé.

**Solution:** Utiliser un trigger Supabase `on_auth_user_created` ou vérifier l'existence du profil côté backend.

### 2. Géocodage - Limite de requêtes
**Fichier:** `app/onboarding/OnboardingForm.tsx:167`

```typescript
const geoResponse = await fetch(
  `https://api-adresse.data.gouv.fr/search/?q=${formData.postalCode}&type=municipality&limit=1`
);
```

**Risque:** L'API gouvernementale peut avoir des limites de rate-limiting. Si plusieurs utilisateurs s'inscrivent en même temps, des appels peuvent échouer.

**Solution:**
1. Implémenter un cache côté serveur pour les codes postaux populaires
2. Ajouter un retry avec backoff exponentiel
3. Permettre une saisie manuelle en fallback

### 3. Validation Postal Code
**Fichier:** `app/onboarding/OnboardingForm.tsx:100`

```typescript
if (!/^\d{5}$/.test(formData.postalCode)) {
  newErrors.postalCode = 'Code postal invalide (5 chiffres)';
}
```

**Problème:** La regex accepte n'importe quels 5 chiffres, même invalides (ex: `00000`, `99999`)

**Solution:** Valider contre une liste de codes postaux français valides ou vérifier via l'API de géocodage en amont.

---

## 💡 Suggestions d'Amélioration (UX)

### 1. Feedback Visuel
- ✅ Ajouter une barre de progression dans signup et onboarding
- ✅ Afficher un compteur de caractères pour bio et descriptions
- ✅ Ajouter des tooltips explicatifs sur les champs complexes

### 2. Prévisualisation
- ✅ Ajouter un bouton "Prévisualiser mon profil" avant validation finale (onboarding)
- ✅ Ajouter un bouton "Prévisualiser mon projet" avant publication (création projet)

### 3. Géolocalisation
- ✅ Proposer l'autocomplétion de ville basée sur code postal en temps réel
- ✅ Afficher une carte avec le rayon de déplacement/recherche
- ✅ Permettre de ajuster le rayon visuellement sur la carte

### 4. Compétences
- ✅ Ajouter une recherche/filtre dans la liste des compétences
- ✅ Suggérer des compétences populaires basées sur la phase du projet
- ✅ Limiter le nombre de compétences sélectionnables (max 10-15)

---

## 📊 Checklist de Test Manuelle

Pour compléter cette analyse statique, voici les tests manuels à effectuer :

### Signup
- [ ] S'inscrire avec un email valide
- [ ] Vérifier la réception de l'email de confirmation
- [ ] Tester avec un email déjà existant (erreur attendue)
- [ ] Tester avec un mot de passe < 8 caractères (erreur attendue)
- [ ] Vérifier que la charte est obligatoire
- [ ] Vérifier l'enregistrement dans `user_charter_acceptances`

### Onboarding
- [ ] Compléter avec un code postal valide (ex: 75001)
- [ ] Vérifier que les coordonnées GPS sont bien enregistrées
- [ ] Tester avec un code postal invalide (ex: 00000)
- [ ] Vérifier le min 50 caractères pour la bio
- [ ] Tester avec différents rayons de déplacement

### Création de Projet
- [ ] Créer un projet dans chaque phase (idéation → structuration)
- [ ] Sélectionner plusieurs catégories
- [ ] Sélectionner 5-10 compétences
- [ ] Vérifier la géolocalisation du projet
- [ ] Tester l'option "Travail à distance"
- [ ] Vérifier que le projet apparaît dans la liste publique

### Candidatures (à tester avec un compte Talent)
- [ ] Vérifier qu'un talent peut voir le projet
- [ ] Postuler au projet
- [ ] Vérifier que l'entrepreneur reçoit la notification
- [ ] Accepter/refuser une candidature

---

## 🎯 Résumé

### ✅ Ce qui fonctionne bien
- Architecture solide et bien structurée
- Validations côté client robustes
- Intégration Supabase + PostGIS pour géolocalisation
- Charte éthique bien implémentée
- UI claire avec étapes progressives

### ⚠️ Ce qui nécessite attention
- Gestion des erreurs de géocodage (fallback)
- Validation stricte du code postal français
- Feedback visuel (compteurs, progression)
- Prévisualisation avant validation

### 🐛 Bugs à corriger
1. **Erreur charter ignorée** : Bloquer si échec
2. **Géocodage sans fallback** : Ajouter validation manuelle
3. **Validation code postal faible** : Vérifier contre liste valide

---

## 🚀 Prochaines Étapes

1. **Tests manuels** : Exécuter la checklist ci-dessus en environnement de dev
2. **Corrections critiques** : Traiter les bugs identifiés (charter, géocodage)
3. **Amélioration UX** : Ajouter compteurs et prévisualisations
4. **Tests Talent** : Analyser le parcours talent et matching

---

**Statut Global Parcours Entrepreneur:** ✅ Fonctionnel mais nécessite quelques ajustements avant production
