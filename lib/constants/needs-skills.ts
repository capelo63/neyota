// ============================================
// CONSTANTES: Système Besoins/Compétences
// ============================================

// ============================================
// BESOINS (pour porteurs de projets)
// ============================================

export const NEED_CATEGORIES = {
  structuring: {
    id: 'structuring',
    label: 'Clarifier et cadrer mon projet',
    icon: '🧠',
    description: 'Clarifier et organiser les fondations du projet',
  },
  launching: {
    id: 'launching',
    label: 'Passer à l\'action',
    icon: '🚀',
    description: 'Passer à l\'action et créer une première version',
  },
  finding_clients: {
    id: 'finding_clients',
    label: 'Attirer mes premiers utilisateurs',
    icon: '🎯',
    description: 'Identifier et atteindre la cible',
  },
  branding: {
    id: 'branding',
    label: 'Construire mon image',
    icon: '🎨',
    description: 'Développer l\'identité visuelle et la marque',
  },
  digital_tools: {
    id: 'digital_tools',
    label: 'Mettre en place des solutions numériques',
    icon: '💻',
    description: 'Créer ou améliorer les outils numériques',
  },
  finance: {
    id: 'finance',
    label: 'Piloter mes finances',
    icon: '💰',
    description: 'Piloter le budget et trouver des financements',
  },
  legal: {
    id: 'legal',
    label: 'Sécuriser mon cadre légal',
    icon: '⚖️',
    description: 'Structurer juridiquement et administrativement',
  },
  organization: {
    id: 'organization',
    label: 'Mieux m\'organiser et collaborer',
    icon: '🧩',
    description: 'Optimiser l\'organisation et le travail d\'équipe',
  },
  growth: {
    id: 'growth',
    label: 'Faire évoluer mon activité',
    icon: '📈',
    description: 'Faire grandir et structurer l\'activité',
  },
  impact: {
    id: 'impact',
    label: 'Amplifier mon impact',
    icon: '🌱',
    description: 'Ancrer territorialement et développer l\'impact',
  },
  mentoring: {
    id: 'mentoring',
    label: 'Bénéficier d\'un accompagnement',
    icon: '🧑',
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
    'Formaliser mon offre',
    'Créer une première version (produit/service)',
    'Tester mon idée',
  ],
  finding_clients: [
    'Définir ma cible',
    'Trouver mes premiers clients',
    'Gagner en visibilité',
    'Déployer ma communication',
  ],
  branding: [
    'Créer une identité visuelle',
    'Concevoir des supports de communication',
    'Renforcer mon image de marque',
    'Définir mon positionnement de marque',
  ],
  digital_tools: [
    'Créer un site web',
    'Concevoir une application',
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
    'Protéger mon projet (marque, propriété intellectuelle)',
    'Mettre mon activité en conformité',
  ],
  organization: [
    'Organiser mon fonctionnement',
    'Mieux gérer mon temps',
    'Mettre en place une gestion de projet',
    'Travailler en équipe',
  ],
  growth: [
    'Faire grandir mon activité',
    'Structurer ma croissance',
    'Changer d\'échelle',
    'Diversifier mes sources de revenus',
  ],
  impact: [
    'Clarifier mon impact social / environnemental',
    'M\'ancrer sur mon territoire',
    'Développer des partenariats',
    'Communiquer sur mon impact',
  ],
  mentoring: [
    'Être conseillé / mentoré',
    'Prendre du recul',
    'Monter en compétences',
    'Renforcer ma posture de dirigeant',
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

// Liste des compétences par catégorie (70 items au total)
export const SKILLS_BY_CATEGORY: Record<SkillCategoryId, string[]> = {
  strategy: [
    // Structuration & stratégie
    'Business model & stratégie',
    'Étude de marché & positionnement',
    'Business plan & pitch deck',
    'Définition de l\'offre de valeur',
    'Priorisation & roadmap',
    // Impact & ancrage territorial
    'Mesure d\'impact social/environnemental',
    'Développement de partenariats stratégiques',
    'Ancrage territorial & écosystème local',
    // Accompagnement
    'Accompagnement entrepreneurial / mentoring',
    'Coaching de dirigeant',
  ],
  marketing: [
    // Stratégie marketing
    'Stratégie marketing & communication',
    'Étude de cible & persona',
    'Positionnement & messaging',
    // Marketing digital
    'Marketing digital (SEO, SEA, réseaux sociaux)',
    'SEO / Référencement naturel',
    'SEA / Publicité en ligne (Google Ads, Meta Ads)',
    'Social media marketing',
    'Content marketing & stratégie éditoriale',
    'Community management',
    'Email marketing & automation',
    // Branding & création
    'Identité visuelle & branding',
    'Création de supports de communication',
    'Copywriting & rédaction',
    'Photographie & vidéo',
    'Design graphique',
  ],
  product: [
    // Product management
    'Product management',
    'UX/UI Design',
    'Prototypage & wireframing',
    'Tests utilisateurs & validation',
    // Développement web
    'Développement web (sites vitrine, e-commerce)',
    'Développement d\'applications web (SaaS, plateformes)',
    'Développement front-end (React, Vue, etc.)',
    'Développement back-end (Node, Python, PHP)',
    // Développement mobile
    'Développement mobile (iOS, Android)',
    'Développement mobile cross-platform (React Native, Flutter)',
    // No-code & automation
    'No-code / Low-code (Webflow, Bubble, Notion)',
    'Automatisation & workflows (Zapier, Make, n8n)',
    'Intégration d\'outils & API',
    // Tech avancée
    'Data science / Intelligence Artificielle',
    'DevOps / Infrastructure cloud',
  ],
  operations: [
    // Gestion de projet
    'Gestion de projet (Agile, Scrum, Kanban)',
    'Planification & pilotage de projet',
    'Coordination d\'équipe',
    // Organisation
    'Organisation & productivité',
    'Gestion du temps & priorisation',
    'Mise en place de processus & workflows',
    // Croissance & structuration
    'Pilotage de la croissance',
    'Structuration d\'équipe',
    'Change management',
    'Qualité & amélioration continue',
  ],
  finance_legal_hr: [
    // Finance
    'Budget & prévisionnel financier',
    'Comptabilité & trésorerie',
    'Analyse financière & rentabilité',
    'Recherche de financements (subventions, prêts)',
    'Levée de fonds / Fundraising',
    // Juridique
    'Choix de statut juridique',
    'Droit des affaires & contrats',
    'Propriété intellectuelle',
    'Gestion administrative',
    // RH
    'Ressources humaines & recrutement',
    'Formation & développement des compétences',
  ],
  commercial: [
    // Vente & développement commercial
    'Développement commercial B2B',
    'Développement commercial B2C',
    'Prospection & génération de leads',
    'Techniques de vente & négociation',
    // Stratégie commerciale
    'Stratégie de distribution',
    'Pricing & politique tarifaire',
    'Amélioration de la rentabilité',
    // Relation client
    'Relation client & customer success',
    'Service après-vente & support',
    'Fidélisation client',
  ],
  other: [
    // Champ libre - la compétence sera saisie par l'utilisateur
  ],
};

// Comptage total des skills
export const TOTAL_SKILLS = Object.values(SKILLS_BY_CATEGORY).reduce(
  (sum, skills) => sum + skills.length,
  0
);

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

// Obtenir toutes les skills d'une catégorie
export function getSkillsByCategory(categoryId: SkillCategoryId): string[] {
  return SKILLS_BY_CATEGORY[categoryId] || [];
}

// Obtenir toutes les needs d'une catégorie
export function getNeedsByCategory(categoryId: NeedCategoryId): string[] {
  return NEEDS_BY_CATEGORY[categoryId] || [];
}
