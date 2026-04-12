# Migration de la page d'accueil vers Carbon Design System

## Vue d'ensemble

La page d'accueil a été migrée pour utiliser les composants du **IBM Carbon Design System** tout en conservant la possibilité de revenir à l'ancien design.

## Fichiers

- **`app/page.tsx`** : Page principale avec système de bascule entre les deux designs
- **`app/page.carbon.tsx`** : Nouvelle version utilisant les composants Carbon
- **`app/page.legacy.tsx`** : Ancienne version (design original)

## Comment basculer entre les designs

### Nouveau design Carbon (par défaut)

Accédez simplement à la page d'accueil :
```
http://localhost:3000
```

Le nouveau design Carbon sera affiché par défaut.

### Ancien design (legacy)

Pour revenir à l'ancien design, ajoutez le paramètre `?design=legacy` à l'URL :
```
http://localhost:3000?design=legacy
```

## Différences entre les deux designs

### Nouveau design Carbon

Le nouveau design utilise les composants du Carbon Design System pour une expérience plus moderne et professionnelle :

1. **Carbon Tiles** :
   - Les projets sont affichés dans des `ClickableTile` avec des effets hover élégants
   - Les statistiques utilisent des `Tile` pour une présentation structurée
   - Les avantages sont présentés dans des `Tile` avec fond layer-01

2. **Carbon Tags** :
   - Les badges de valeurs (100% gratuit, 100% local, etc.) utilisent des `Tag` Carbon avec variantes colorées
   - Les phases de projet utilisent des `Tag` pour une meilleure cohérence visuelle

3. **Système de layers** :
   - Utilisation des layers Carbon (`layer-01`, `layer-02`) pour créer de la profondeur visuelle
   - Meilleure hiérarchie visuelle grâce au système de couches

4. **Espacement Carbon** :
   - Utilisation des variables d'espacement Carbon (`--spacing-05`, `--spacing-06`, etc.)
   - Espacement basé sur 2px pour une précision maximale

### Ancien design (legacy)

- Design original avec composants shadcn/ui standards
- Cards classiques pour les projets
- Badges standard pour les phases

## Composants Carbon utilisés

- **ClickableTile** : Projets cliquables avec états hover/active
- **Tile** : Statistiques et avantages
- **Tag** : Badges, phases de projet, et valeurs
- **Button** : Boutons d'action (inchangés)

## Recommandations

Le nouveau design Carbon est recommandé pour :
- ✅ Une meilleure cohérence avec le design system global
- ✅ Une expérience utilisateur plus professionnelle
- ✅ Une maintenance facilitée grâce aux composants réutilisables
- ✅ Une meilleure accessibilité (WCAG 2.1)

L'ancien design peut être conservé temporairement pour :
- ⚠️ Comparaison A/B testing
- ⚠️ Transition progressive des utilisateurs
- ⚠️ Compatibilité avec d'anciennes intégrations

## Migration future

Une fois le nouveau design validé et testé, l'ancien design pourra être supprimé :

1. Supprimer `app/page.legacy.tsx`
2. Renommer `app/page.carbon.tsx` en contenu de `app/page.tsx`
3. Supprimer le système de bascule

## Notes techniques

- Les deux versions utilisent les mêmes données (fonction `getHomeData()`)
- Le revalidate ISR est configuré à 60 secondes pour les deux versions
- Les deux versions sont compatibles avec le callback d'authentification email
