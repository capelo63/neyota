# Design System - IBM Carbon × shadcn/ui

## Vue d'ensemble

Ce design system combine les meilleures pratiques d'**IBM Carbon Design System** avec la flexibilité de **shadcn/ui**, créant une expérience utilisateur unique et différenciante pour Teriis/Neyota.

## 🎨 Éléments graphiques différenciants

### 1. Carbon Tiles
Composants de tuiles inspirés d'IBM Carbon avec plusieurs variantes :

```tsx
import { Tile, ClickableTile, SelectableTile, ExpandableTile } from "@/components/ui/carbon-tile"

// Tuile simple
<Tile>Contenu</Tile>

// Tuile cliquable
<ClickableTile onClick={() => console.log("clicked")}>
  Action
</ClickableTile>

// Tuile sélectionnable
<SelectableTile 
  selected={isSelected} 
  onSelectedChange={setIsSelected}
>
  Option
</SelectableTile>

// Tuile expandable
<ExpandableTile title="Titre">
  Contenu caché
</ExpandableTile>
```

**Variantes :**
- `default` - Tuile standard avec bordure
- `clickable` - Avec états hover/active
- `selectable` - Checkbox-like avec sélection
- `expandable` - Avec contenu dépliable
- `ghost` - Sans bordure

### 2. Carbon Tags
Tags compacts avec style IBM (font mono, petite taille) :

```tsx
import { Tag, TagGroup } from "@/components/ui/carbon-tag"

<TagGroup>
  <Tag variant="green">Succès</Tag>
  <Tag variant="blue" dismissible onDismiss={() => {}}>
    Dismissible
  </Tag>
</TagGroup>
```

**Variantes :** `default`, `red`, `green`, `blue`, `yellow`, `gray`, `outline`  
**Tailles :** `sm`, `default`, `lg`

### 3. Carbon Notifications
Notifications inline avec icônes et actions :

```tsx
import { Notification } from "@/components/ui/carbon-notification"

<Notification
  variant="success"
  title="Opération réussie"
  subtitle="Vos modifications ont été enregistrées"
  action={{ label: "Voir", onClick: () => {} }}
  onDismiss={() => {}}
/>
```

**Variantes :** `info`, `success`, `warning`, `error`

### 4. Carbon DataTable
Tableau de données avec tri, zebra stripes, hover states :

```tsx
import { DataTable, type Column } from "@/components/ui/carbon-data-table"

const columns: Column<User>[] = [
  {
    key: "name",
    header: "Nom",
    accessor: (row) => row.name,
    sortable: true,
  },
  // ...
]

<DataTable
  columns={columns}
  data={users}
  zebra
  hoverable
  stickyHeader
/>
```

**Props :**
- `zebra` - Rayures alternées
- `hoverable` - Effet hover sur les lignes
- `stickyHeader` - En-tête fixe lors du scroll
- `compact` - Version compacte
- `selectable` - Sélection de lignes

### 5. Loading States & Skeletons
Composants de chargement élégants :

```tsx
import {
  LoadingSpinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  LoadingBar,
  LoadingOverlay,
} from "@/components/ui/carbon-loading"

// Spinner
<LoadingSpinner size="lg" />

// Skeleton
<SkeletonText lines={3} />
<SkeletonCard />

// Loading bar
<LoadingBar progress={50} /> // 0-100
<LoadingBar /> // Indéterminée

// Overlay
<LoadingOverlay loading={isLoading}>
  <YourContent />
</LoadingOverlay>
```

### 6. Carbon Icon Buttons
Boutons d'icône avec support Carbon et Lucide :

```tsx
import { IconButton, IconButtonGroup } from "@/components/ui/carbon-icon-button"
import { Heart } from "lucide-react"

<IconButton 
  icon={<Heart />} 
  label="J'aime" 
  variant="ghost" 
/>

<IconButtonGroup attached>
  <IconButton icon={<Play />} label="Play" variant="outline" />
  <IconButton icon={<Pause />} label="Pause" variant="outline" />
</IconButtonGroup>
```

## 🎯 Système de grille Carbon

Grille à 16 colonnes inspirée d'IBM :

```tsx
<div className="carbon-grid-narrow">
  <div className="col-span-4">Contenu</div>
  <div className="col-span-12">Contenu</div>
</div>
```

**Breakpoints :**
- Mobile : 4 colonnes
- Tablette (672px+) : 8 colonnes
- Desktop (1056px+) : 16 colonnes

## 🎨 Système de layers

Les layers permettent de créer de la profondeur visuelle :

```tsx
<div className="layer-01">Base layer</div>
<div className="layer-02">Elevated</div>
<div className="layer-03">Most elevated</div>
```

## 📏 Système d'espacement IBM Carbon

Variables CSS basées sur 2px :

```css
--spacing-01: 0.125rem;  /* 2px */
--spacing-02: 0.25rem;   /* 4px */
--spacing-03: 0.5rem;    /* 8px */
--spacing-04: 0.75rem;   /* 12px */
--spacing-05: 1rem;      /* 16px */
--spacing-06: 1.5rem;    /* 24px */
--spacing-07: 2rem;      /* 32px */
--spacing-08: 2.5rem;    /* 40px */
--spacing-09: 3rem;      /* 48px */
--spacing-10: 4rem;      /* 64px */
```

Utilisation :

```tsx
<div className="p-[var(--spacing-05)]">
  Padding de 16px
</div>
```

## 🚀 Utilisation

### Installation

Les dépendances sont déjà installées :
- `@carbon/icons-react` - Icônes IBM Carbon
- `@carbon/colors` - Palette de couleurs IBM
- `@fontsource/ibm-plex-sans` - Typographie IBM
- `@fontsource/ibm-plex-mono` - Typographie monospace IBM

### Page de démonstration

Visitez `/design-system` pour voir tous les composants en action avec des exemples interactifs.

## 🎨 Philosophie de design

### IBM Carbon Design System
- **Précision** : Espacement basé sur 2px
- **Layers** : Système de profondeur avec layers
- **Grille 16 colonnes** : Flexibilité maximale
- **Typographie IBM Plex** : Police professionnelle et lisible
- **États interactifs** : Hover, active, focus bien définis

### shadcn/ui
- **Composable** : Composants facilement personnalisables
- **Accessible** : Radix UI pour l'accessibilité
- **Moderne** : Styles Tailwind CSS
- **Flexible** : Variants avec class-variance-authority

## 🔄 Différences avec shadcn/ui standard

### Améliorations apportées :
1. **Tuiles (Tiles)** - Nouveau composant non présent dans shadcn/ui
2. **Tags avec style Carbon** - Design plus compact et professionnel
3. **Notifications inline** - Style IBM avec icônes à gauche
4. **DataTable avancé** - Tri, zebra stripes, sticky header
5. **Loading states riches** - Multiples variantes de skeletons
6. **Système de grille 16 colonnes** - Alternative à la grille Tailwind
7. **Layers** - Système de profondeur visuelle
8. **Espacement Carbon** - Variables d'espacement 2px base

## 📱 Responsive Design

Tous les composants sont responsive par défaut :
- Mobile-first approach
- Breakpoints alignés avec Carbon Design System
- Grille adaptative (4/8/16 colonnes)

## ♿ Accessibilité

Tous les composants suivent les standards WCAG 2.1 :
- Navigation au clavier
- ARIA labels appropriés
- Focus visible
- Contraste des couleurs
- Lecteurs d'écran supportés

## 🎯 Cas d'usage

### Dashboard
Utilisez les **Tiles** et **DataTable** pour créer des dashboards riches.

### Filtres et tags
Les **Tags** et **SelectableTiles** sont parfaits pour les systèmes de filtrage.

### Feedback utilisateur
**Notifications** et **Loading states** pour une expérience fluide.

### Actions rapides
**IconButtons** pour les actions fréquentes sans surcharger l'interface.

## 📚 Ressources

- [IBM Carbon Design System](https://carbondesignsystem.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Page de démo](/design-system)

---

**Créé avec ❤️ pour Teriis/Neyota**
