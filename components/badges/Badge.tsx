'use client';

import React from 'react';

export type BadgeType =
  | 'local_ambassador'
  | 'territory_builder'
  | 'territory_pillar'
  | 'citizen_mentor'
  | 'recognized_expert'
  | 'local_legend';

interface BadgeConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  local_ambassador: {
    name: 'Ambassadeur Local',
    description: 'A complété son profil et rejoint la communauté',
    icon: '🌱',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  territory_builder: {
    name: 'Bâtisseur Territorial',
    description: 'Contribue activement aux projets locaux',
    icon: '🏗️',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  territory_pillar: {
    name: 'Pilier du Territoire',
    description: 'Soutien essentiel de plusieurs projets',
    icon: '🏛️',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  citizen_mentor: {
    name: 'Mentor Citoyen',
    description: 'Partage ses compétences et accompagne',
    icon: '🎓',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  recognized_expert: {
    name: 'Expert Reconnu',
    description: 'Excellence et expertise reconnues',
    icon: '⭐',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  local_legend: {
    name: 'Légende Locale',
    description: 'Impact exceptionnel sur le territoire',
    icon: '🏆',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
};

interface BadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  earnedAt?: string;
}

export function Badge({
  type,
  size = 'md',
  showDescription = false,
  earnedAt,
}: BadgeProps) {
  const config = BADGE_CONFIGS[type];

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      icon: 'text-base',
      name: 'text-xs',
      description: 'text-xs',
    },
    md: {
      container: 'px-3 py-2',
      icon: 'text-2xl',
      name: 'text-sm',
      description: 'text-xs',
    },
    lg: {
      container: 'px-4 py-3',
      icon: 'text-3xl',
      name: 'text-base',
      description: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  if (showDescription) {
    return (
      <div
        className={`${config.bgColor} rounded-lg ${classes.container} flex items-start gap-3`}
      >
        <div className={`${classes.icon} flex-shrink-0`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${config.color} ${classes.name}`}>
            {config.name}
          </div>
          <div className={`text-gray-600 ${classes.description} mt-0.5`}>
            {config.description}
          </div>
          {earnedAt && (
            <div className="text-xs text-gray-500 mt-1">
              Obtenu le{' '}
              {new Date(earnedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${config.bgColor} rounded-full ${classes.container} flex items-center gap-2`}
      title={`${config.name} - ${config.description}`}
    >
      <span className={classes.icon}>{config.icon}</span>
      <span className={`font-medium ${config.color} ${classes.name}`}>
        {config.name}
      </span>
    </div>
  );
}

interface BadgeGridProps {
  badges: Array<{
    badge_type: BadgeType;
    earned_at: string;
  }>;
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🏅</div>
        <p>Aucun badge obtenu pour le moment</p>
        <p className="text-sm mt-1">
          Complétez votre profil et participez pour gagner des badges !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {badges.map((badge) => (
        <Badge
          key={badge.badge_type}
          type={badge.badge_type}
          size="md"
          showDescription
          earnedAt={badge.earned_at}
        />
      ))}
    </div>
  );
}
