import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button, Badge } from '@/components/ui';
import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Talents disponibles',
  description: 'Découvrez les talents locaux prêts à rejoindre votre projet entrepreneurial',
};

async function getTalents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch talents with their skills
  const { data: talents, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      city,
      postal_code,
      bio,
      availability,
      max_distance_km,
      created_at
    `)
    .eq('role', 'talent')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[TALENTS] Error fetching:', error);
    console.error('[TALENTS] Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  console.log('[TALENTS] Raw talents fetched:', talents?.length || 0);
  if (talents && talents.length > 0) {
    console.log('[TALENTS] First talent:', JSON.stringify(talents[0], null, 2));
  }

  // For each talent, fetch their skills
  const talentsWithSkills = await Promise.all(
    (talents || []).map(async (talent) => {
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          skill:skills(id, name, category)
        `)
        .eq('user_id', talent.id);

      if (skillsError) {
        console.error(`[TALENTS] Error fetching skills for ${talent.id}:`, skillsError);
      }

      return {
        ...talent,
        skills: (skillsData || [])
          .map(s => s.skill)
          .filter(s => s !== null),
      };
    })
  );

  console.log('[TALENTS] Final talents with skills:', talentsWithSkills.length);

  return talentsWithSkills;
}

// Disable cache temporarily to force fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const AVAILABILITY_LABELS: Record<string, string> = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  freelance: 'Freelance',
  occasional: 'Ponctuel',
};

export default async function TalentsPage() {
  const talents = await getTalents();

  // Debug info
  const debugInfo = {
    totalTalents: talents.length,
    talentIds: talents.map(t => t.id).join(', ') || 'none',
    firstTalent: talents[0] ? {
      name: `${talents[0].first_name} ${talents[0].last_name}`,
      city: talents[0].city,
      skillsCount: talents[0].skills.length
    } : null
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      {/* Debug Info */}
      <div className="bg-yellow-100 border border-yellow-400 p-4 m-4 rounded">
        <h3 className="font-bold text-yellow-800">Debug Info:</h3>
        <pre className="text-xs text-yellow-900 mt-2 overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <main className="container-custom py-16 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Talents disponibles
          </h1>
          <p className="text-xl text-neutral-600 mb-6">
            Découvrez les talents locaux prêts à rejoindre votre projet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=talent">
              <Button variant="primary" size="lg">
                🌟 Devenir talent
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" size="lg">
                💼 Voir les projets
              </Button>
            </Link>
          </div>
        </div>

        {/* Talents List */}
        {talents.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              Les premiers talents arrivent bientôt !
            </h3>
            <p className="text-neutral-600 mb-6">
              Soyez parmi les premiers à rejoindre NEYOTA et mettez vos compétences
              au service de projets locaux.
            </p>
            <Link href="/signup?role=talent">
              <Button variant="primary" size="lg">
                Créer mon profil talent
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <div
                key={talent.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {talent.first_name} {talent.last_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{talent.city}</span>
                    </div>
                    {talent.availability && (
                      <Badge variant="info" className="text-xs">
                        {AVAILABILITY_LABELS[talent.availability] || talent.availability}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {talent.bio && (
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {talent.bio}
                  </p>
                )}

                {/* Skills */}
                {talent.skills && talent.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Compétences:</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.slice(0, 4).map((skill: any) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {talent.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{talent.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Distance */}
                {talent.max_distance_km && (
                  <p className="text-sm text-neutral-500 mb-4">
                    Rayon de déplacement: {talent.max_distance_km} km
                  </p>
                )}

                {/* CTA */}
                <Link href={`/profile/${talent.id}`}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Voir le profil →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {talents.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-neutral-600">
              <strong>{talents.length}</strong> talent{talents.length > 1 ? 's' : ''} disponible{talents.length > 1 ? 's' : ''} sur NEYOTA
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 max-w-3xl mx-auto bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Vous cherchez des talents pour votre projet ?
          </h2>
          <p className="text-primary-100 mb-6">
            Créez votre projet et laissez notre algorithme territorial vous mettre
            en relation avec les meilleurs talents près de chez vous
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=entrepreneur">
              <Button variant="secondary" size="lg" className="min-w-[200px] bg-white text-primary-600 hover:bg-neutral-50">
                Créer un projet
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="lg" className="min-w-[180px] text-white border-white hover:bg-primary-700">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
