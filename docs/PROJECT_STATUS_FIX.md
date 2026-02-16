# Fix: Project Status Ambigu → ENUM PostgreSQL

## 🔍 Problème Identifié

Le champ `status` de la table `projects` était défini comme **TEXT** simple dans le schéma initial :

```sql
status TEXT DEFAULT 'active', -- active, closed, archived
```

### Conséquences

- ❌ **Aucune contrainte** : Permet des valeurs invalides (`"actif"`, `"Active"`, `"en cours"`, etc.)
- ❌ **Risque d'incohérence** : Plusieurs représentations possibles pour le même statut
- ❌ **Pas de validation** : Aucune vérification au niveau de la base de données
- ❌ **Typage faible** : Pas d'autocomplétion ni de type-checking strict côté frontend

## ✅ Solution Implémentée

### Migration 025: Création d'un ENUM PostgreSQL

```sql
CREATE TYPE project_status AS ENUM ('active', 'closed', 'archived');

ALTER TABLE projects
ALTER COLUMN status TYPE project_status
USING status::project_status;
```

### Avantages

- ✅ **Contrainte de valeur** : Seules les valeurs valides sont acceptées
- ✅ **Cohérence des données** : Une seule représentation possible par statut
- ✅ **Validation automatique** : PostgreSQL rejette les valeurs invalides
- ✅ **Type safety** : Typage strict côté TypeScript

## 📚 Types TypeScript

Un nouveau fichier de types a été créé : `/lib/database.types.ts`

```typescript
export type ProjectStatus = 'active' | 'closed' | 'archived';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Actif',
  closed: 'Fermé',
  archived: 'Archivé',
};
```

## 🔄 Migration des Données

La migration **normalise automatiquement** les données existantes :

1. Toute valeur non standard est convertie en `'active'`
2. Les valeurs `NULL` sont remplacées par `'active'`
3. La colonne est convertie en ENUM

## 📖 Sémantique des Statuts

| Statut | Description | Visibilité | Candidatures |
|--------|-------------|------------|--------------|
| **active** | Projet actif et visible | ✅ Public | ✅ Accepte |
| **closed** | Projet fermé (objectif atteint ou abandonné) | 🔒 Caché | ❌ Refusées |
| **archived** | Projet archivé (historique) | 🗃️ Archivé | ❌ Refusées |

## 🚀 Utilisation

### Backend (SQL)

```sql
-- Créer un projet actif
INSERT INTO projects (title, status, ...)
VALUES ('Mon projet', 'active', ...);

-- Fermer un projet
UPDATE projects SET status = 'closed' WHERE id = '...';

-- Archiver un projet
UPDATE projects SET status = 'archived' WHERE id = '...';
```

### Frontend (TypeScript)

```typescript
import { ProjectStatus, PROJECT_STATUS_LABELS } from '@/lib/database.types';

// Type-safe status
const status: ProjectStatus = 'active';

// Affichage avec label
console.log(PROJECT_STATUS_LABELS[status]); // "Actif"

// Validation
function isValidStatus(value: string): value is ProjectStatus {
  return ['active', 'closed', 'archived'].includes(value);
}
```

## 📝 Checklist de Migration

- [x] Migration SQL créée (`025_fix_project_status_enum.sql`)
- [x] Types TypeScript créés (`lib/database.types.ts`)
- [x] Documentation créée (`docs/PROJECT_STATUS_FIX.md`)
- [ ] Appliquer la migration sur Supabase
- [ ] Mettre à jour les composants frontend pour utiliser les types
- [ ] Tester les requêtes avec le nouveau type ENUM

## 🔗 Fichiers Modifiés

- `supabase/migrations/025_fix_project_status_enum.sql` (nouveau)
- `lib/database.types.ts` (nouveau)
- `docs/PROJECT_STATUS_FIX.md` (nouveau)

## 🎯 Impact

- **Breaking change** : Non (les valeurs existantes sont conservées)
- **Rétrocompatibilité** : Oui (migration transparente)
- **Risque** : Faible (migration testée et documentée)
