# Rapport de Test - Parcours Talent
**Date:** 16 février 2026
**Testeur:** Claude (Analyse de code)
**Type:** Test statique / Analyse fonctionnelle

---

## 📋 Parcours testé

1. Signup (création de compte - identique Entrepreneur)
2. Onboarding (configuration profil + compétences)
3. Matching territorial (découverte de projets)
4. Détail projet et candidature
5. Suivi des candidatures

---

## ✅ Points Positifs

### 1. Onboarding Talent (/onboarding)
- ✅ **Sélection compétences obligatoire** : Min 1 compétence pour les talents
- ✅ **Proficiency level automatique** : Défini à 'intermediate' par défaut
- ✅ **Géolocalisation identique** : Même logique robuste que pour entrepreneurs (✅ corrigée aujourd'hui)
- ✅ **Validation stricte** : Empêche progression sans compétence

**Code Review:**
```typescript
// ✅ Validation pour talents
const validateStep2 = () => {
  const newErrors: Record<string, string> = {};
  if (profile?.role === 'talent' && formData.selectedSkills.length === 0) {
    newErrors.skills = 'Sélectionnez au moins une compétence';
  }
  return Object.keys(newErrors).length === 0;
};

// ✅ Sauvegarde compétences avec niveau par défaut
const skillsToInsert = formData.selectedSkills.map(skillId => ({
  user_id: user.id,
  skill_id: skillId,
  proficiency_level: 'intermediate', // Défaut OK
}));
```

### 2. Matching Territorial (/matching) ⭐ USP PRINCIPAL
- ✅ **Algorithme sophistiqué** : Score sur 100 points
  - Distance : 40pts (plus proche = mieux)
  - Compétences : 40pts (% de match)
  - Remote : 10pts bonus
  - Récent : 10pts bonus (7j = 10pts, 30j = 5pts)
- ✅ **RPC Functions** : Utilise `get_talent_profile_with_coords` et `get_nearby_projects`
- ✅ **Calcul PostGIS** : Distance précise en km via géographie
- ✅ **Fallback gracieux** : Si RPC échoue, charge projets sans distance
- ✅ **Filtres multiples** : Phase, distance max, remote only
- ✅ **Tri par score** : Meilleurs matches en premier
- ✅ **Gestion GPS manquant** : Message clair si profil sans coordonnées

**Code Review (Algorithme):**
```typescript
// ✅ Scoring intelligent et équilibré
let score = 0;

// Distance (40pts max) - Linéaire inversé
if (project.distance_km !== undefined) {
  const distanceScore = Math.max(0, 40 - (project.distance_km / 2));
  score += distanceScore; // Ex: 10km = 35pts, 50km = 15pts
}

// Skills match (40pts max) - Pourcentage
if (projectSkills.length > 0) {
  const skillsScore = (matchingSkillsCount / projectSkills.length) * 40;
  score += skillsScore; // Ex: 3/5 skills = 24pts
}

// Bonus remote (10pts)
if (project.is_remote_possible) score += 10;

// Bonus récent (10pts max)
const daysSinceCreation = Math.floor(...);
if (daysSinceCreation < 7) score += 10;
else if (daysSinceCreation < 30) score += 5;

return Math.min(100, Math.round(score)); // Cap à 100
```

### 3. Détail Projet (/projects/[id])
- ✅ **Vérification ownership** : Détecte si l'utilisateur est propriétaire
- ✅ **Check candidature** : Détecte si déjà postulé
- ✅ **Compteur candidatures** : Affiche nombre de postulants
- ✅ **Protection détails complets** : Visibilité progressive (pitch court public, détails après candidature)
- ✅ **Bouton contextuel** : "Postuler" ou "Déjà postulé" ou "Gérer candidatures" selon rôle

### 4. Système de Candidature
- ✅ **Message motivation obligatoire** : Impossible de postuler sans texte
- ✅ **Dédoublonnage** : `UNIQUE(project_id, talent_id)` en base
- ✅ **Statuts clairs** : pending, accepted, rejected, more_info
- ✅ **Notification automatique** : Entrepreneur alerté de nouvelle candidature
- ✅ **Traçabilité** : Timestamps created_at, updated_at

---

## ⚠️ Points d'Attention

### 1. Matching - Dépendance RPC critique
**Fichier:** `app/matching/MatchingView.tsx:165`

```typescript
const { data: projectsData, error: projectsError } = await supabase.rpc(
  'get_nearby_projects',
  { user_lat: userLat, user_lng: userLng, search_radius_km: 1000 }
);

if (projectsError) {
  console.error('Projects error:', projectsError);
  // Fallback to simple query without distance
  const { data: fallbackData } = await supabase.from('projects')...
}
```

**Risque:** Si le RPC `get_nearby_projects` échoue, le fallback charge TOUS les projets actifs sans calcul de distance.
- **Impact** : Matching territorial complètement cassé (pas de tri par proximité)
- **Recommandation** : Afficher un message d'erreur à l'utilisateur plutôt que fallback silencieux

### 2. Proficiency Level figé à 'intermediate'
**Fichier:** `app/onboarding/OnboardingForm.tsx:275`

```typescript
proficiency_level: 'intermediate', // Toujours intermédiaire
```

**Problème:** Tous les talents sont considérés "intermédiaires" sur toutes leurs compétences.
- **Impact** : Impossible de valoriser expertise ou préciser niveau débutant
- **Recommandation** : Permettre sélection du niveau pour chaque compétence

### 3. Matching - Score sur 100 mais pas affiché clairement
**Fichier:** `app/matching/MatchingView.tsx:279`

Le score de matching est calculé mais peu visible dans l'UI (badge discret).
- **Recommandation** : Afficher % de match de façon proéminente (ex: "85% de match")

### 4. Distance - Pas de limite max
**Fichier:** `app/matching/MatchingView.tsx:170`

```typescript
search_radius_km: 1000, // 1000km !
```

**Problème:** Charge projets jusqu'à 1000km, même si talent a défini max_distance_km = 50km
- **Impact** : Charge inutilement des projets hors zone
- **Recommandation** : Utiliser `profile.max_distance_km` au lieu de 1000km

### 5. Pas de prévisualisation candidature
L'utilisateur ne peut pas prévisualiser sa candidature avant envoi.

---

## 🐛 Bugs Potentiels

### 1. Fallback Matching sans distance
**Fichier:** `app/matching/MatchingView.tsx:176-192`
**Sévérité:** 🔴 CRITIQUE

```typescript
if (projectsError) {
  // Fallback to simple query without distance
  const { data: fallbackData } = await supabase
    .from('projects')
    .select('...')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
}
```

**Problème:**
- Le fallback charge les projets mais `project.distance_km` sera `undefined`
- L'algorithme de scoring tentera quand même de calculer le distance_score
- Aucun tri par proximité (USP cassé)

**Solution proposée:**
```typescript
if (projectsError) {
  console.error('Projects RPC error:', projectsError);
  setError('Impossible de calculer les distances. Veuillez réessayer.');
  setIsLoading(false);
  return; // ✅ Bloquer plutôt que fallback cassé
}
```

### 2. Profil sans GPS bloque silencieusement
**Fichier:** `app/matching/MatchingView.tsx:135`

```typescript
if (!profile.lng || !profile.lat) {
  setError('Votre profil n\'a pas de coordonnées GPS...');
  setIsLoading(false);
  return; // Bloque TOUT le matching
}
```

**Problème:** Si le géocodage a échoué lors de l'onboarding, le talent ne peut PAS accéder au matching.
- **Impact** : Bloquant total pour utilisateurs avec codes postaux problématiques
- **Solution** : ✅ Déjà corrigé aujourd'hui (géocodage bloquant dans onboarding)

### 3. Compteur de caractères manquant
**Fichier:** Formulaire de candidature
**Problème:** Aucune indication sur longueur min/max du message de motivation
- **Recommandation** : Ajouter compteur en temps réel (min 50 caractères recommandé)

---

## 💡 Suggestions d'Amélioration (UX)

### 1. Matching UX
- ✅ Afficher **% de match** de façon proéminente (ex: badge "85%" sur chaque projet)
- ✅ Ajouter légende du score (explique comment il est calculé)
- ✅ Afficher **compétences matchées** en vert (visuellement)
- ✅ Icône distance (ex: "🏠 12 km")

### 2. Filtres Matching
- ✅ Slider interactif pour distance max (au lieu de input number)
- ✅ Filtre par compétence spécifique
- ✅ Filtre par catégorie de projet

### 3. Profil Compétences
- ✅ Permettre édition niveau de compétence (débutant/intermédiaire/expert)
- ✅ Suggérer compétences populaires basées sur localisation
- ✅ Limiter nombre max de compétences (éviter "je sais tout faire")

### 4. Candidatures
- ✅ Templates de motivation (pré-remplir avec suggestions)
- ✅ Prévisualisation avant envoi
- ✅ Historique des candidatures avec statuts
- ✅ Notification push quand entrepreneur répond

---

## 🎯 Comparaison Entrepreneur vs Talent

| Aspect | Entrepreneur | Talent | Note |
|--------|--------------|--------|------|
| **Onboarding** | ✅ Simple | ✅ + Compétences | OK |
| **Géolocalisation** | ✅ Corrigé | ✅ Corrigé | OK |
| **Fonctionnalité Core** | Créer projets | **Matching territorial** | ⭐ USP |
| **Complexité** | Moyenne | Plus complexe | OK |
| **Bugs critiques** | ✅ Corrigés | 1 restant (fallback) | Action |

---

## 📊 Checklist de Test Manuelle

### Onboarding Talent
- [ ] S'inscrire comme talent
- [ ] Compléter onboarding avec min 3 compétences
- [ ] Vérifier compétences sauvegardées dans `user_skills`
- [ ] Vérifier proficiency_level = 'intermediate'

### Matching
- [ ] Accéder à /matching
- [ ] Vérifier calcul de distance (projets triés par score)
- [ ] Tester filtre par phase
- [ ] Tester filtre par distance max
- [ ] Tester filtre remote only
- [ ] Vérifier que score est cohérent (40+40+10+10)

### Candidature
- [ ] Cliquer sur un projet avec bon score
- [ ] Rédiger message motivation (min 50 caractères)
- [ ] Soumettre candidature
- [ ] Vérifier notification entrepreneur
- [ ] Vérifier statut "pending" dans applications

### Edge Cases
- [ ] Matching sans GPS → doit bloquer avec message
- [ ] RPC get_nearby_projects échoue → devrait bloquer (pas fallback)
- [ ] Candidature en double → doit rejeter (UNIQUE constraint)

---

## 🚀 Résumé

### ✅ Ce qui fonctionne très bien
- **Algorithme de matching sophistiqué** (40+40+10+10 = 100pts)
- Intégration PostGIS pour calculs géographiques
- RPC functions optimisées
- Filtres multiples et tri par score
- Protection données (visibilité progressive)

### ⚠️ Ce qui nécessite attention
- Proficiency level figé à 'intermediate'
- Fallback matching sans distance (casse l'USP)
- Pas de prévisualisation candidature
- Search radius 1000km (devrait utiliser max_distance_km)

### 🐛 Bug critique restant
**#1 : Fallback Matching sans distance** 🔴
- Si RPC échoue, charge projets sans calcul distance
- **Solution** : Bloquer et afficher erreur plutôt que fallback silencieux

---

## 🎯 Score Global

**Parcours Talent:** 88/100

- **Fonctionnel** : ✅ 95% (1 bug critique restant)
- **UX** : ⚠️ 80% (quelques améliorations possibles)
- **Performance** : ✅ 90% (RPC optimisés, PostGIS)
- **Matching (USP)** : ⭐ 95% (excellent algorithme, fallback à corriger)

---

## 🔧 Actions Prioritaires

1. **Corriger fallback matching** (bloquer au lieu de continuer sans distance)
2. **Permettre sélection proficiency level** (débutant/intermédiaire/expert)
3. **Utiliser max_distance_km** au lieu de 1000km
4. **Afficher % match** de façon proéminente
5. **Tests manuels** avec vraies données

---

**Statut Global Parcours Talent:** ✅ Fonctionnel avec 1 bug critique à corriger
**Prochaine étape:** Corriger bug fallback matching puis tests manuels complets
