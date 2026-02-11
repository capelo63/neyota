'use client';

import React from 'react';

interface ImpactStatsProps {
  stats: {
    projects_helped?: number;
    hours_contributed?: number;
    impact_score: number;
    average_rating?: number;
    total_ratings?: number;
    projects_created?: number;
    talents_recruited?: number;
  };
  role: 'entrepreneur' | 'talent';
}

export function ImpactStats({ stats, role }: ImpactStatsProps) {
  // Calculate impact level based on score
  const getImpactLevel = (score: number): { level: string; color: string; icon: string } => {
    if (score >= 200) return { level: 'Exceptionnel', color: 'text-orange-600', icon: '🌟' };
    if (score >= 150) return { level: 'Remarquable', color: 'text-purple-600', icon: '💫' };
    if (score >= 100) return { level: 'Élevé', color: 'text-blue-600', icon: '⭐' };
    if (score >= 50) return { level: 'Bon', color: 'text-green-600', icon: '✨' };
    if (score >= 20) return { level: 'En progression', color: 'text-teal-600', icon: '🌱' };
    return { level: 'Débutant', color: 'text-gray-600', icon: '🌿' };
  };

  const impactLevel = getImpactLevel(stats.impact_score);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Impact & Statistiques
      </h2>

      {/* Impact Score Card */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-medium">Score d'impact</span>
          <span className="text-2xl">{impactLevel.icon}</span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-orange-600">
            {stats.impact_score}
          </span>
          <span className="text-gray-600">points</span>
        </div>
        <div className={`text-sm font-medium ${impactLevel.color}`}>
          Niveau : {impactLevel.level}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {role === 'talent' ? (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.projects_helped || 0}
              </div>
              <div className="text-sm text-gray-600">
                Projets aidés
              </div>
            </div>

            {stats.average_rating !== undefined && stats.total_ratings !== undefined && stats.total_ratings > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-yellow-600">
                    {stats.average_rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">/ 5.0</span>
                </div>
                <div className="text-sm text-gray-600">
                  Note moyenne ({stats.total_ratings} avis)
                </div>
              </div>
            )}

            {stats.hours_contributed !== undefined && stats.hours_contributed > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.hours_contributed}h
                </div>
                <div className="text-sm text-gray-600">
                  Heures contribuées
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.projects_created || 0}
              </div>
              <div className="text-sm text-gray-600">
                Projets créés
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.talents_recruited || 0}
              </div>
              <div className="text-sm text-gray-600">
                Talents recrutés
              </div>
            </div>
          </>
        )}
      </div>

      {/* Progress hint */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>💡 Astuce :</strong>{' '}
          {role === 'talent'
            ? 'Participez à plus de projets locaux pour augmenter votre impact !'
            : 'Créez des projets et recrutez des talents pour booster votre score !'}
        </div>
      </div>
    </div>
  );
}
