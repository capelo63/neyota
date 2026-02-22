/**
 * Database types for TERRII
 *
 * These types represent the ENUM types defined in the PostgreSQL database.
 * They ensure type safety between the frontend and backend.
 */

// ============================================
// ENUMS (matching Supabase database)
// ============================================

export type UserRole = 'entrepreneur' | 'talent';

export type ProjectPhase =
  | 'ideation'          // Idée / Concept
  | 'mvp_development'   // Développement MVP
  | 'launch'            // Lancement
  | 'growth'            // Croissance
  | 'scaling';          // Structuration

/**
 * Project Status ENUM
 *
 * @migration 025_fix_project_status_enum.sql
 *
 * - active: Projet actif et visible, accepte les candidatures
 * - closed: Projet fermé, n'accepte plus de candidatures
 * - archived: Projet archivé, conservé pour historique
 */
export type ProjectStatus = 'active' | 'closed' | 'archived';

export type ApplicationStatus =
  | 'pending'     // En attente
  | 'accepted'    // Acceptée
  | 'rejected'    // Refusée
  | 'more_info';  // Plus d'informations demandées

export type SkillCategory =
  | 'technical'      // Technique
  | 'business'       // Business
  | 'creative'       // Créatif
  | 'operational'    // Opérationnel
  | 'expertise';     // Expertise métier

export type ProficiencyLevel =
  | 'beginner'       // Débutant
  | 'intermediate'   // Intermédiaire
  | 'expert';        // Expert

export type SkillPriority =
  | 'essential'      // Essentielle
  | 'nice_to_have';  // Souhaitée

export type ReportReason =
  | 'idea_theft'     // Vol d'idée
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'other';

export type BadgeType =
  | 'local_ambassador'   // Ambassadeur Local
  | 'territory_builder'  // Bâtisseur Territorial
  | 'territory_pillar'   // Pilier du Territoire
  | 'citizen_mentor'     // Mentor Citoyen
  | 'recognized_expert'  // Expert Reconnu
  | 'local_legend';      // Légende Locale

export type ProjectCategory =
  | 'agriculture'     // Agriculture / Agroalimentaire
  | 'mobility'        // Mobilité / Transport
  | 'industry'        // Industrie / Manufacturing
  | 'tech'            // Tech / Digital
  | 'health'          // Santé / Bien-être
  | 'education'       // Éducation / Formation
  | 'real_estate'     // Immobilier / Construction
  | 'environment'     // Environnement / Écologie
  | 'culture'         // Culture / Créatif
  | 'services'        // Services / Consulting
  | 'commerce'        // Commerce / Retail
  | 'hospitality'     // Restauration / Hôtellerie
  | 'finance'         // Finance / Fintech
  | 'energy'          // Énergie
  | 'entertainment'   // Divertissement / Loisirs
  | 'social';         // Social / Solidaire

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if a value is a valid ProjectStatus
 */
export function isValidProjectStatus(value: string): value is ProjectStatus {
  return ['active', 'closed', 'archived'].includes(value);
}

/**
 * Gets the default project status
 */
export function getDefaultProjectStatus(): ProjectStatus {
  return 'active';
}

/**
 * Human-readable labels for project statuses
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Actif',
  closed: 'Fermé',
  archived: 'Archivé',
};

/**
 * Human-readable labels for project phases
 */
export const PROJECT_PHASE_LABELS: Record<ProjectPhase, string> = {
  ideation: '💡 Idéation',
  mvp_development: '🛠️ Développement MVP',
  launch: '🚀 Lancement',
  growth: '📈 Croissance',
  scaling: '🌍 Structuration',
};

/**
 * Human-readable labels for application statuses
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  more_info: 'Informations demandées',
};
