import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import TalentsFilter from '@/components/TalentsFilter';

export const metadata: Metadata = {
  title: 'Talents disponibles',
  description: 'Découvrez les talents locaux prêts à rejoindre votre projet entrepreneurial',
};

async function getTalentsAndSkills() {
  const supabase = await createClient();

  // Fetch all available skills
  const { data: allSkills } = await supabase
    .from('skills')
    .select('id, name, category')
    .order('name');

  // Fetch talents
  const { data: talents, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      city,
      postal_code,
      bio,
      max_distance_km,
      latitude,
      longitude,
      created_at
    `)
    .eq('role', 'talent')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[TALENTS] Error fetching:', error);
    return { talents: [], allSkills: [] };
  }

  // For each talent, fetch their skills
  const talentsWithSkills = await Promise.all(
    (talents || []).map(async (talent) => {
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select(`
          skill:skills(id, name, category)
        `)
        .eq('user_id', talent.id);

      return {
        ...talent,
        skills: (skillsData || [])
          .map((s: any) => s.skill)
          .filter((s: any) => s !== null) as Array<{ id: string; name: string; category: string }>,
      };
    })
  );

  return {
    talents: talentsWithSkills,
    allSkills: allSkills || [],
  };
}

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function TalentsPage() {
  const { talents, allSkills } = await getTalentsAndSkills();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

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

        {/* Talents with Filters */}
        {talents.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              Les premiers talents arrivent bientôt !
            </h3>
            <p className="text-neutral-600 mb-6">
              Soyez parmi les premiers à rejoindre TERRII et mettez vos compétences
              au service de projets locaux.
            </p>
            <Link href="/signup?role=talent">
              <Button variant="primary" size="lg">
                Créer mon profil talent
              </Button>
            </Link>
          </div>
        ) : (
          <TalentsFilter talents={talents} allSkills={allSkills} />
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
