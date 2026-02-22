import Link from 'next/link';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Button, Card, CardBody, Badge } from '@/components/ui';
import { createClient } from '@supabase/supabase-js';

async function getHomeData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch latest 3 active projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      short_pitch,
      city,
      postal_code,
      current_phase,
      is_remote_possible,
      created_at,
      owner_id
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3);

  if (projectsError) {
    console.error('[HOME] Error fetching projects:', projectsError);
  }

  // For each project, fetch owner info separately
  const projects = await Promise.all(
    (projectsData || []).map(async (project) => {
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', project.owner_id)
        .maybeSingle();

      return {
        ...project,
        owner: ownerData,
      };
    })
  );

  // Fetch real stats
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: talentsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'talent');

  const { count: entrepreneursCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'entrepreneur');

  const { count: applicationsCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });

  return {
    projects: projects || [],
    stats: {
      projects: projectsCount || 0,
      talents: talentsCount || 0,
      entrepreneurs: entrepreneursCount || 0,
      applications: applicationsCount || 0,
    },
  };
}

// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

const PHASE_LABELS: Record<string, string> = {
  ideation: 'Idéation',
  mvp_development: 'En construction',
  launch: 'Lancement',
  growth: 'Croissance',
  scaling: 'Structuration',
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Handle email confirmation callback
  const params = await searchParams;
  const code = params.code;

  if (code && typeof code === 'string') {
    // Redirect to auth callback to exchange code for session
    redirect(`/auth/callback?code=${code}`);
  }

  const { projects, stats } = await getHomeData();
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main>
        {/* Hero Section - Modern & Clean */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50/30 py-20 lg:py-32 px-4 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 -z-10"></div>

          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-8 animate-fade-in">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-neutral-700">
                  Plateforme 100% gratuite pour entrepreneurs et talents
                </span>
              </div>

              {/* TERRII Brand & Tagline */}
              <div className="mb-6 animate-slide-up">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-3">
                  TERRII
                </h1>
                <p className="text-xl md:text-2xl font-medium text-primary-600 mb-8">
                  Need Your Talents
                </p>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 animate-slide-up">
                Ensemble, faisons vivre{' '}
                <span className="text-primary-600">nos territoires</span>
              </h2>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up">
                TERRII connecte gratuitement les porteurs de projets et les talents locaux
                pour dynamiser l&apos;économie de proximité.
              </p>

              {/* Value Props */}
              <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-neutral-700">100% gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-neutral-700">100% local</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-neutral-700">100% impact</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                <Link href="/signup?role=entrepreneur">
                  <Button variant="primary" size="lg" className="min-w-[200px]">
                    💼 Je porte un projet
                  </Button>
                </Link>
                <Link href="/signup?role=talent">
                  <Button variant="secondary" size="lg" className="min-w-[200px]">
                    🌟 Je cherche un projet
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Projets récents près de chez vous
              </h2>
              <p className="text-neutral-600 text-lg">
                Découvrez des projets locaux qui ont besoin de vos talents
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                  Bientôt les premiers projets !
                </h3>
                <p className="text-neutral-600 mb-6">
                  Soyez parmi les premiers à rejoindre TERRII et faites vivre votre territoire.
                </p>
                <Link href="/signup">
                  <Button variant="primary" size="lg">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {projects.map((project: any) => {
                  const owner = Array.isArray(project.owner) ? project.owner[0] : project.owner;
                  return (
                    <Card key={project.id} className="group">
                      <CardBody>
                        {/* Location & Phase */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-primary-600 text-sm font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{project.city}</span>
                            {project.is_remote_possible && (
                              <span className="text-neutral-400">• Distanciel</span>
                            )}
                          </div>
                          <Badge variant="success">{PHASE_LABELS[project.current_phase]}</Badge>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                          {project.short_pitch}
                        </p>

                        {/* Owner */}
                        {owner && (
                          <p className="text-sm text-neutral-500 mb-4">
                            Par {owner.first_name} {owner.last_name}
                          </p>
                        )}

                        {/* CTA */}
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1 group"
                        >
                          Voir le projet
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* View All Button */}
            <div className="text-center mt-10">
              <Link href="/projects">
                <Button variant="ghost" size="lg">
                  Voir tous les projets →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-primary-50/50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Pourquoi TERRII ?
              </h2>
              <p className="text-neutral-600 text-lg">
                Une plateforme pensée pour l&apos;entrepreneuriat territorial
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: '⚡',
                  title: 'Rapide',
                  description: 'Trouvez les bons talents ou projets près de chez vous en quelques clics grâce à notre matching intelligent.'
                },
                {
                  icon: '🎯',
                  title: 'Ciblé',
                  description: 'Algorithme basé sur vos compétences, votre localisation, vos valeurs et la phase du projet.'
                },
                {
                  icon: '💚',
                  title: 'Humain',
                  description: 'Focus sur la compatibilité humaine, l&apos;engagement territorial et la création de valeur locale.'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">{benefit.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Notre impact territorial
              </h2>
              <p className="text-neutral-600 text-lg">
                Des chiffres qui témoignent de la dynamique locale
              </p>
            </div>

            {stats.projects > 0 || stats.talents > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stats.projects}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    Projet{stats.projects > 1 ? 's' : ''} actif{stats.projects > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stats.talents}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    Talent{stats.talents > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stats.entrepreneurs}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    Entrepreneur{stats.entrepreneurs > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stats.applications}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    Candidature{stats.applications > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-neutral-600 text-lg">
                  Les premières statistiques apparaîtront bientôt !
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à faire vivre votre territoire ?
              </h2>
              <p className="text-xl mb-10 text-primary-100">
                Rejoignez la communauté TERRII et donnez vie à vos projets locaux
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button variant="secondary" size="lg" className="min-w-[220px] bg-white hover:bg-neutral-50 text-primary-600">
                    Créer un compte gratuitement
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" size="lg" className="min-w-[180px] text-white border-white hover:bg-primary-700">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-900 text-neutral-300 py-12 px-4">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              {/* Footer Grid */}
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                {/* Brand */}
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">T</span>
                      </div>
                      <span className="text-2xl font-bold text-white">TERRII</span>
                    </div>
                    <p className="text-primary-400 font-medium text-sm ml-12">
                      Need Your Talents
                    </p>
                  </div>
                  <p className="text-neutral-400 mb-4">
                    La plateforme qui connecte les projets aux talents locaux.<br />
                    100% gratuite, 100% locale, 100% impact.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Plateforme</h4>
                  <ul className="space-y-2">
                    <li><Link href="/projects" className="hover:text-white transition-colors">Projets</Link></li>
                    <li><Link href="/talents" className="hover:text-white transition-colors">Talents</Link></li>
                    <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Légal</h4>
                  <ul className="space-y-2">
                    <li><Link href="/charter" className="hover:text-white transition-colors">Charte éthique</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                    <li><Link href="/terms" className="hover:text-white transition-colors">CGU</Link></li>
                    <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  </ul>
                </div>
              </div>

              {/* Copyright */}
              <div className="pt-8 border-t border-neutral-800 text-center text-sm text-neutral-400">
                <p>© 2026 TERRII. Tous droits réservés.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
