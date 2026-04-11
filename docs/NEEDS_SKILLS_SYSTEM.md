# 📚 Documentation : Système Besoins / Compétences

**Date de création** : 2026-04-11  
**Migration** : 033_refactor_needs_skills_system.sql

## 🎯 Vue d'ensemble

Teriis utilise un système **dual** pour faciliter le matching entre porteurs de projets et talents :

- **BESOINS** (Needs) : Ce que les porteurs de projets recherchent
- **COMPÉTENCES** (Skills) : Ce que les talents peuvent apporter

Un **système de mapping automatique** fait le lien entre les deux pour proposer des matchings pertinents.

---

## 📊 Architecture du système

### Tables principales

```
needs (11 catégories, 44 items)
  ↓
need_skill_mapping (table de correspondance avec score de pertinence)
  ↓
skills (7 types d'intervention)
```

### 1. **Table `needs`** - Besoins des porteurs de projets

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | TEXT | Nom du besoin (ex: "Créer un site web") |
| category | need_category | Catégorie (11 types) |
| description | TEXT | Description optionnelle |
| sort_order | INTEGER | Ordre d'affichage |

**11 catégories de besoins :**

1. **structuring** - Structurer le projet (4 besoins)
2. **launching** - Lancer le projet (4 besoins)
3. **finding_clients** - Trouver des clients / bénéficiaires (4 besoins)
4. **branding** - Créer une image (3 besoins)
5. **digital_tools** - Développer des outils digitaux (4 besoins)
6. **finance** - Gérer les finances (4 besoins)
7. **legal** - Cadre légal et administratif (3 besoins)
8. **organization** - Organisation et collaboration (4 besoins)
9. **growth** - Développer le projet (3 besoins)
10. **impact** - Renforcer l'impact du projet (3 besoins)
11. **mentoring** - Accompagnement du projet (3 besoins)

**Total : 44 besoins**

---

### 2. **Table `skills`** - Compétences des talents

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | TEXT | Nom de la compétence |
| category | skill_type | Type d'intervention (7 types) |
| is_custom | BOOLEAN | Si c'est une compétence custom |
| created_by | UUID | Créateur (si custom) |

**7 types d'intervention :**

1. **strategy** - 🎯 Stratégie / Business / Impact
2. **marketing** - 📣 Marketing / Communication
3. **product** - 💻 Produit / Tech
4. **operations** - ⚙️ Opérations / Gestion de projet
5. **finance_legal_hr** - 💰 Finance / Juridique / RH
6. **commercial** - 🤝 Commercial / Relation client
7. **other** - 🔧 Autre expertise (à préciser avec champ libre)

---

### 3. **Table `need_skill_mapping`** - Correspondance intelligente

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| need_id | UUID | Référence vers needs |
| skill_id | UUID | Référence vers skills |
| relevance_score | INTEGER | Score de pertinence (1-10) |

**Exemple de mapping :**

| Besoin | Compétence | Score |
|--------|------------|-------|
| "Créer un site web" | Produit / Tech | 10 |
| "Créer un site web" | Opérations | 5 |
| "Améliorer ma visibilité" | Marketing | 10 |
| "Améliorer ma visibilité" | Commercial | 10 |

---

### 4. **Table `project_needs`** - Besoins d'un projet

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| project_id | UUID | Référence vers projects |
| need_id | UUID | Référence vers needs |
| priority | need_priority | Essential ou nice_to_have |

---

### 5. **Table `user_skills`** - Compétences d'un talent

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID | Référence vers profiles |
| skill_id | UUID | Référence vers skills |
| custom_detail | TEXT | Détail pour "Autre expertise" |

---

## 🔄 Fonctionnement du matching

### Algorithme de matching

1. **Récupérer les besoins du projet** depuis `project_needs`
2. **Trouver les compétences correspondantes** via `need_skill_mapping`
3. **Chercher les talents** possédant ces compétences dans `user_skills`
4. **Calculer un score** basé sur :
   - Pertinence du mapping (relevance_score)
   - Nombre de besoins matchés
   - Distance géographique

### Fonctions SQL utilitaires

**get_talents_for_need(need_uuid)** : Retourne les talents qui peuvent répondre à un besoin spécifique

```sql
SELECT * FROM get_talents_for_need('uuid-du-besoin');
-- Retourne : user_id, skill_name, relevance_score
```

**get_needs_for_skill(skill_uuid)** : Retourne les besoins qu'une compétence peut satisfaire

```sql
SELECT * FROM get_needs_for_skill('uuid-de-la-compétence');
-- Retourne : need_id, need_name, need_category, relevance_score
```

---

## 💻 Utilisation dans le code

### Constantes TypeScript

```typescript
import { 
  NEED_CATEGORIES, 
  SKILL_CATEGORIES,
  NEEDS_BY_CATEGORY,
  getNeedCategoryLabel,
  getSkillCategoryLabel
} from '@/lib/constants/needs-skills';
```

### Exemple : Afficher les besoins dans un formulaire

```typescript
{Object.entries(NEED_CATEGORIES).map(([categoryKey, categoryInfo]) => (
  <div key={categoryKey}>
    <h3>{categoryInfo.icon} {categoryInfo.label}</h3>
    <p>{categoryInfo.description}</p>
    {NEEDS_BY_CATEGORY[categoryKey].map(need => (
      <Checkbox key={need} label={need} />
    ))}
  </div>
))}
```

### Exemple : Charger les besoins depuis Supabase

```typescript
const { data: needsData } = await supabase
  .from('needs')
  .select('*')
  .order('category, sort_order');
```

### Exemple : Sauvegarder les besoins d'un projet

```typescript
const needsToInsert = selectedNeeds.map(needId => ({
  project_id: projectId,
  need_id: needId,
  priority: 'essential',
}));

await supabase
  .from('project_needs')
  .insert(needsToInsert);
```

---

## 🎨 Interface utilisateur

### Formulaire de création de projet (Porteurs)

**Étape 2 : Besoins**

- Affichage par catégories (accordéons)
- Icônes pour chaque catégorie
- Possibilité de sélectionner plusieurs besoins
- Compteur de besoins sélectionnés

### Formulaire d'onboarding (Talents)

**Étape 2 : Types d'intervention**

- Liste des 7 types d'intervention
- Champ libre pour "Autre expertise"
- Design carte cliquable
- Indication du nombre de types sélectionnés

---

## 🔍 Différences avec l'ancien système

| Aspect | Ancien système | Nouveau système |
|--------|----------------|-----------------|
| **Porteurs de projet** | Sélectionnent des "compétences" (75 items) | Sélectionnent des "besoins" (44 items) |
| **Talents** | Sélectionnent des "compétences" détaillées avec niveau | Sélectionnent des "types d'intervention" (7 items) |
| **Matching** | Basique (simple correspondance) | Intelligent (mapping avec score de pertinence) |
| **Structure** | Mono-table `skills` | Dual : `needs` + `skills` + `mapping` |
| **Terminologie** | "Compétences" pour tous | "Besoins" (porteurs) / "Compétences" (talents) |

---

## 🚀 Migration

### Appliquer la migration

```bash
# Via Supabase CLI
supabase db push

# Ou via Supabase Dashboard
# SQL Editor → Copier/Coller le contenu de 033_refactor_needs_skills_system.sql
```

### Tables de sauvegarde

L'ancienne structure est préservée dans des tables `*_old` :
- `skills_old`
- `project_skills_needed_old`
- `user_skills_old`

**⚠️ NE PAS LES SUPPRIMER** tant que la migration n'est pas validée en production.

### Nettoyer après validation (optionnel)

```sql
-- Uniquement après validation complète en production
DROP TABLE IF EXISTS skills_old CASCADE;
DROP TABLE IF EXISTS project_skills_needed_old CASCADE;
DROP TABLE IF EXISTS user_skills_old CASCADE;
DROP TYPE IF EXISTS skill_category CASCADE;
DROP TYPE IF EXISTS proficiency_level CASCADE;
DROP TYPE IF EXISTS skill_priority CASCADE;
```

---

## 📝 Exemples concrets

### Exemple 1 : Porteur cherche à "Créer un site web"

1. Le porteur sélectionne le besoin "Créer un site web" (category: digital_tools)
2. Le système trouve dans `need_skill_mapping` :
   - Compétence "Produit / Tech" → score 10
   - Compétence "Opérations" → score 5
3. Le système cherche les talents avec ces compétences
4. Résultat : talents avec "Produit / Tech" apparaissent en premier

### Exemple 2 : Talent "Stratégie"

1. Le talent sélectionne "Stratégie / Business / Impact"
2. Cette compétence correspond à de nombreux besoins :
   - Structurer le projet (score 10)
   - Lancer le projet (score 9)
   - Finances (score 7)
   - Développer le projet (score 10)
   - Impact (score 10)
   - Accompagnement (score 9)
3. Le talent verra des projets de toutes ces catégories

---

## 🎯 Bonnes pratiques

### Pour les porteurs de projets

✅ **À faire :**
- Sélectionner **tous** les besoins pertinents (pas juste 1 ou 2)
- Être précis : "Créer un site web" plutôt que générique
- Utiliser les priorités (essential vs nice_to_have)

❌ **À éviter :**
- Sélectionner trop peu de besoins (réduit le matching)
- Sélectionner des besoins non pertinents (bruit)

### Pour les talents

✅ **À faire :**
- Sélectionner **tous** les types d'intervention où vous pouvez aider
- Être spécifique dans "Autre expertise"
- Couvrir large pour maximiser les opportunités

❌ **À éviter :**
- Se limiter à un seul type (réduit les matchings)
- Laisser "Autre expertise" vague ("Tout", "Divers")

---

## 🔧 Dépannage

### "Aucun talent trouvé"

- Vérifier que les besoins sont bien enregistrés dans `project_needs`
- Vérifier le mapping dans `need_skill_mapping`
- Vérifier qu'il existe des talents avec les compétences correspondantes

### "Le mapping ne fonctionne pas"

```sql
-- Vérifier le mapping pour un besoin
SELECT 
  n.name as need,
  s.name as skill,
  nsm.relevance_score
FROM needs n
JOIN need_skill_mapping nsm ON nsm.need_id = n.id
JOIN skills s ON s.id = nsm.skill_id
WHERE n.id = 'uuid-du-besoin';
```

### "Les formulaires ne chargent pas les données"

- Vérifier que la migration a bien été appliquée
- Vérifier les RLS (Row Level Security) : `needs` et `skills` doivent être lisibles publiquement
- Vérifier les noms de colonnes (pas de typos)

---

## 📞 Support

Pour toute question sur ce système :
1. Consulter cette documentation
2. Vérifier les constantes dans `/lib/constants/needs-skills.ts`
3. Vérifier la migration dans `/supabase/migrations/033_refactor_needs_skills_system.sql`

---

**Dernière mise à jour** : 2026-04-11  
**Version** : 1.0
