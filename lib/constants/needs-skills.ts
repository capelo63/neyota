// ============================================
// CONSTANTES: Système Besoins/Compétences
// ============================================

// ============================================
// BESOINS (pour porteurs de projets)
// ============================================

export const NEED_CATEGORIES = {
  structuring: {
    id: 'structuring',
    label: 'Structurer le projet',
    icon: '🎯',
    description: 'Clarifier et organiser les fondations du projet',
  },
  launching: {
    id: 'launching',
    label: 'Lancer le projet',
    icon: '🚀',
    description: 'Passer à l\'action et créer une première version',
  },
  finding_clients: {
    id: 'finding_clients',
    label: 'Trouver des clients / bénéficiaires',
    icon: '👥',
    description: 'Identifier et atteindre la cible',
  },
  branding: {
    id: 'branding',
    label: 'Créer une image',
    icon: '🎨',
    description: 'Développer l\'identité visuelle et la marque',
  },
  digital_tools: {
    id: 'digital_tools',
    label: 'Développer des outils digitaux',
    icon: '💻',
    description: 'Créer ou améliorer les outils numériques',
  },
  finance: {
    id: 'finance',
    label: 'Gérer les finances',
    icon: '💰',
    description: 'Piloter le budget et trouver des financements',
  },
  legal: {
    id: 'legal',
    label: 'Cadre légal et administratif',
    icon: '⚖️',
    description: 'Structurer juridiquement et administrativement',
  },
  organization: {
    id: 'organization',
    label: 'Organisation et collaboration',
    icon: '⚙️',
    description: 'Optimiser l\'organisation et le travail d\'équipe',
  },
  growth: {
    id: 'growth',
    label: 'Développer le projet',
    icon: '📈',
    description: 'Faire grandir et structurer l\'activité',
  },
  impact: {
    id: 'impact',
    label: 'Renforcer l\'impact du projet',
    icon: '🌱',
    description: 'Ancrer territorialement et développer l\'impact',
  },
  mentoring: {
    id: 'mentoring',
    label: 'Accompagnement du projet',
    icon: '🤝',
    description: 'Bénéficier de conseils et de recul',
  },
} as const;

export type NeedCategoryId = keyof typeof NEED_CATEGORIES;

// Liste des besoins par catégorie (44 items au total)
export const NEEDS_BY_CATEGORY: Record<NeedCategoryId, string[]> = {
  structuring: [
    'Clarifier mon idée',
    'Définir mon modèle économique',
    'Construire un business plan',
    'Prioriser mes actions',
  ],
  launching: [
    'Me lancer concrètement',
    'Structurer mon offre',
    'Créer une première version (produit/service)',
    'Tester mon idée',
  ],
  finding_clients: [
    'Définir ma cible',
    'Trouver mes premiers clients',
    'Améliorer ma visibilité',
    'Développer ma communication',
  ],
  branding: [
    'Créer une identité visuelle',
    'Concevoir des supports de communication',
    'Améliorer mon image de marque',
  ],
  digital_tools: [
    'Créer un site web',
    'Développer une application',
    'Mettre en place des outils numériques',
    'Automatiser certaines tâches',
  ],
  finance: [
    'Construire un budget',
    'Trouver des financements',
    'Améliorer la rentabilité',
    'Suivre ma trésorerie',
  ],
  legal: [
    'Choisir un statut juridique',
    'Gérer les aspects administratifs',
    'Protéger mon projet',
  ],
  organization: [
    'Structurer mon organisation',
    'Mieux gérer mon temps',
    'Mettre en place une gestion de projet',
    'Travailler en équipe',
  ],
  growth: [
    'Faire grandir mon activité',
    'Structurer mon développement',
    'Changer d\'échelle',
  ],
  impact: [
    'Clarifier mon impact',
    'M\'ancrer sur mon territoire',
    'Développer des partenariats',
  ],
  mentoring: [
    'Être conseillé / mentoré',
    'Prendre du recul',
    'Monter en compétences',
  ],
};

// Comptage total
export const TOTAL_NEEDS = Object.values(NEEDS_BY_CATEGORY).reduce(
  (sum, needs) => sum + needs.length,
  0
);

// ============================================
// COMPÉTENCES (pour talents)
// ============================================

export const SKILL_CATEGORIES = {
  strategy: {
    id: 'strategy',
    label: '🎯 Stratégie / Business / Impact',
    shortLabel: 'Stratégie',
    icon: '🎯',
    description: 'Aide à la stratégie, au business model et à l\'impact',
  },
  marketing: {
    id: 'marketing',
    label: '📣 Marketing / Communication',
    shortLabel: 'Marketing',
    icon: '📣',
    description: 'Marketing digital, communication et visibilité',
  },
  product: {
    id: 'product',
    label: '💻 Produit / Tech',
    shortLabel: 'Produit & Tech',
    icon: '💻',
    description: 'Développement produit, web, mobile et tech',
  },
  operations: {
    id: 'operations',
    label: '⚙️ Opérations / Gestion de projet',
    shortLabel: 'Opérations',
    icon: '⚙️',
    description: 'Gestion de projet, organisation et processus',
  },
  finance_legal_hr: {
    id: 'finance_legal_hr',
    label: '💰 Finance / Juridique / RH',
    shortLabel: 'Finance & Juridique',
    icon: '💰',
    description: 'Finance, comptabilité, juridique et ressources humaines',
  },
  commercial: {
    id: 'commercial',
    label: '🤝 Commercial / Relation client',
    shortLabel: 'Commercial',
    icon: '🤝',
    description: 'Vente, développement commercial et relation client',
  },
  other: {
    id: 'other',
    label: '🔧 Autre expertise (à préciser)',
    shortLabel: 'Autre',
    icon: '🔧',
    description: 'Autre domaine d\'expertise à préciser',
    hasCustomField: true,
  },
} as const;

export type SkillCategoryId = keyof typeof SKILL_CATEGORIES;

// Pour les formulaires
export const SKILL_CATEGORIES_OPTIONS = Object.values(SKILL_CATEGORIES).map(
  (cat) => ({
    value: cat.id,
    label: cat.label,
  })
);

export const NEED_CATEGORIES_OPTIONS = Object.values(NEED_CATEGORIES).map(
  (cat) => ({
    value: cat.id,
    label: `${cat.icon} ${cat.label}`,
  })
);

// ============================================
// PRIORITÉS
// ============================================

export const NEED_PRIORITIES = {
  essential: {
    id: 'essential',
    label: 'Essentiel',
    color: 'error' as const,
    icon: '🔴',
  },
  nice_to_have: {
    id: 'nice_to_have',
    label: 'Souhaité',
    color: 'info' as const,
    icon: '🔵',
  },
} as const;

export type NeedPriorityId = keyof typeof NEED_PRIORITIES;

// ============================================
// HELPERS
// ============================================

// Obtenir le label d'une catégorie de besoin
export function getNeedCategoryLabel(categoryId: NeedCategoryId): string {
  return NEED_CATEGORIES[categoryId]?.label || categoryId;
}

// Obtenir le label d'une catégorie de compétence
export function getSkillCategoryLabel(categoryId: SkillCategoryId): string {
  return SKILL_CATEGORIES[categoryId]?.label || categoryId;
}

// Obtenir l'icône d'une catégorie de besoin
export function getNeedCategoryIcon(categoryId: NeedCategoryId): string {
  return NEED_CATEGORIES[categoryId]?.icon || '📋';
}

// Obtenir l'icône d'une catégorie de compétence
export function getSkillCategoryIcon(categoryId: SkillCategoryId): string {
  return SKILL_CATEGORIES[categoryId]?.icon || '🔧';
}

// Vérifier si une compétence a un champ custom
export function hasCustomField(categoryId: SkillCategoryId): boolean {
  return categoryId === 'other';
}
