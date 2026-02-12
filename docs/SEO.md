# Guide SEO - NEYOTA

## ✅ Implémentations actuelles

### 1. Fichiers de base
- **robots.txt** - Configuré pour autoriser l'indexation des pages publiques
- **sitemap.xml** - Généré dynamiquement avec tous les projets actifs
- **Métadonnées complètes** - Titre, description, keywords

### 2. OpenGraph & Twitter Cards
- Images de partage social configurées (1200x630px)
- Métadonnées optimisées pour Facebook, Twitter, LinkedIn
- Card type: `summary_large_image` pour un affichage optimal

### 3. Structured Data (JSON-LD)
- **Organization Schema** - Informations sur NEYOTA
- **Website Schema** - Structure du site avec SearchAction
- **JobPosting Schema** - Pour chaque projet (à implémenter sur pages projets)

## 📋 Prochaines étapes

### Images OpenGraph
Créez une image `public/og-image.png` (1200x630px) avec:
- Logo NEYOTA
- Slogan: "Ensemble, faisons vivre nos territoires"
- Design épuré aux couleurs de la marque

### Google Search Console
1. Aller sur https://search.google.com/search-console
2. Ajouter la propriété `https://neyota.vercel.app`
3. Vérifier avec le meta tag (déjà en place dans layout.tsx)
4. Remplacer `verification_token_here` par votre token

### Bing Webmaster Tools
1. Aller sur https://www.bing.com/webmasters
2. Ajouter le site
3. Soumettre le sitemap: `https://neyota.vercel.app/sitemap.xml`

### Performance
- ✅ Next.js 15 avec optimisations automatiques
- ✅ Images optimisées avec next/image
- ⚠️ Vérifier Core Web Vitals sur PageSpeed Insights
- ⚠️ Ajouter un Service Worker si nécessaire

## 🎯 Mots-clés ciblés

### Principaux
- "plateforme entrepreneuriat local"
- "talents territoriaux France"
- "mise en relation projets locaux"
- "compétences proximité"

### Longue traîne
- "trouver des compétences près de chez moi"
- "projet entrepreneurial aide locale"
- "talents freelance [ville]"
- "collaboration entrepreneuriale territoriale"

## 📊 Suivi Analytics

### Google Analytics 4
Ajouter le script GA4 dans `app/layout.tsx`:
```tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

### Events à tracker
- Inscription (entrepreneur/talent)
- Création de projet
- Candidature à un projet
- Consultation de profil
- Utilisation du matching

## 🔍 Indexation

### Soumettre les URLs importantes
```bash
# Google
https://search.google.com/search-console

# Bing
https://www.bing.com/webmasters

# À soumettre:
- https://neyota.vercel.app/
- https://neyota.vercel.app/projects
- https://neyota.vercel.app/signup
```

## 💡 Conseils d'optimisation

1. **Contenu de qualité**
   - Descriptions de projets détaillées (>150 mots)
   - Titres uniques et descriptifs
   - Éviter le contenu dupliqué

2. **Liens internes**
   - Lier les projets connexes
   - Breadcrumbs sur les pages projets
   - Footer avec liens vers pages importantes

3. **Mobile-first**
   - Design responsive (déjà en place)
   - Temps de chargement <3s
   - Boutons et textes lisibles

4. **Sécurité**
   - HTTPS partout (via Vercel)
   - Pas de mixed content
   - Headers de sécurité configurés

## 🚀 Quick Wins

1. **Ajouter des balises alt** sur toutes les images
2. **Créer un blog** pour le contenu SEO
3. **Témoignages utilisateurs** sur la landing page
4. **FAQ** avec questions fréquentes
5. **Pages locales** par région/ville

## 📱 Réseaux sociaux

Ajouter dans `OrganizationStructuredData`:
```json
"sameAs": [
  "https://twitter.com/neyota",
  "https://linkedin.com/company/neyota",
  "https://facebook.com/neyota"
]
```

## 🎨 Design des métadonnées

### Longueurs optimales
- **Title**: 50-60 caractères
- **Description**: 150-160 caractères
- **OG Title**: 60-90 caractères
- **OG Description**: 200 caractères max

### Templates dynamiques
Pour les pages projets, utiliser:
```
Title: "[Titre du projet] | NEYOTA"
Description: "[Short pitch] - Projet à [ville] recherchant [compétences]"
```
