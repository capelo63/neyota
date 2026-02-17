import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez la mission de NEYOTA : connecter les porteurs de projets et les talents locaux pour dynamiser l\'économie territoriale française.',
};

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    projects: projectsCount || 0,
    talents: talentsCount || 0,
    entrepreneurs: entrepreneursCount || 0,
    collaborations: applicationsCount || 0,
  };
}

export default async function AboutPage() {
  const stats = await getStats();
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50/30 py-20 px-4">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">
              NEYOTA
            </h1>
            <p className="text-2xl md:text-3xl font-medium text-primary-600 mb-6">
              Need Your Talents
            </p>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              La plateforme qui reconnecte les territoires à leurs talents
              pour donner vie aux projets locaux.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container-custom max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Notre mission
              </h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="prose prose-lg mx-auto text-neutral-700">
              <p className="text-xl leading-relaxed mb-6">
                NEYOTA est née d&apos;un constat simple : <strong>chaque territoire regorge de talents
                et de porteurs de projets qui ne se rencontrent jamais</strong>. Les entrepreneurs
                cherchent des compétences, les talents cherchent des projets qui ont du sens,
                mais ces deux mondes restent trop souvent cloisonnés.
              </p>

              <p className="text-xl leading-relaxed mb-6">
                Notre mission est de <strong>créer des rencontres locales</strong> qui transforment
                les idées en réalité. En mettant l&apos;accent sur la <strong>proximité géographique</strong>,
                nous favorisons l&apos;émergence d&apos;une économie de territoire plus humaine,
                plus solidaire, et plus durable.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-primary-50/30">
          <div className="container-custom max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Nos valeurs
              </h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🌍',
                  title: 'Ancrage territorial',
                  description: 'Nous croyons en la force des territoires. Chaque projet doit contribuer à dynamiser son écosystème local et créer de la valeur là où elle est la plus utile.'
                },
                {
                  icon: '🤝',
                  title: 'Éthique et confiance',
                  description: 'La protection des idées est au cœur de notre plateforme. Chaque membre s\'engage à respecter une charte éthique pour garantir un environnement sain et bienveillant.'
                },
                {
                  icon: '💚',
                  title: 'Accessibilité totale',
                  description: 'NEYOTA est et restera 100% gratuit pour tous les entrepreneurs et talents. Nous ne créons pas de barrière financière à la réussite des projets locaux.'
                },
                {
                  icon: '🎯',
                  title: 'Matching intelligent',
                  description: 'Notre algorithme prend en compte vos compétences, votre localisation, vos valeurs et la phase du projet pour créer des connexions pertinentes et durables.'
                },
                {
                  icon: '🌱',
                  title: 'Impact mesurable',
                  description: 'Chaque collaboration, chaque projet lancé, chaque emploi créé contribue à l\'impact territorial. Nous rendons cet impact visible et célébrons les réussites locales.'
                },
                {
                  icon: '✨',
                  title: 'Gamification positive',
                  description: 'Les badges et le système de reconnaissance valorisent l\'engagement territorial et encouragent les membres à s\'investir durablement dans leur communauté.'
                }
              ].map((value, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container-custom max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Comment ça marche ?
              </h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* For Entrepreneurs */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Pour les entrepreneurs
                  </h3>
                </div>

                <ol className="space-y-6">
                  {[
                    {
                      step: '1',
                      title: 'Créez votre profil',
                      description: 'Présentez-vous, indiquez votre localisation et acceptez notre charte éthique.'
                    },
                    {
                      step: '2',
                      title: 'Publiez votre projet',
                      description: 'Décrivez votre idée, la phase actuelle, et les compétences dont vous avez besoin.'
                    },
                    {
                      step: '3',
                      title: 'Recevez des candidatures',
                      description: 'Les talents locaux qui correspondent à vos besoins vous contactent directement.'
                    },
                    {
                      step: '4',
                      title: 'Construisez votre équipe',
                      description: 'Échangez, sélectionnez vos talents, et lancez votre projet ensemble !'
                    }
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-neutral-600">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* For Talents */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Pour les talents
                  </h3>
                </div>

                <ol className="space-y-6">
                  {[
                    {
                      step: '1',
                      title: 'Créez votre profil',
                      description: 'Indiquez vos compétences, votre localisation et le rayon dans lequel vous souhaitez intervenir.'
                    },
                    {
                      step: '2',
                      title: 'Découvrez les projets',
                      description: 'Notre algorithme vous suggère des projets qui correspondent à votre profil et votre zone géographique.'
                    },
                    {
                      step: '3',
                      title: 'Postulez facilement',
                      description: 'Envoyez votre candidature avec un message personnalisé pour expliquer votre motivation.'
                    },
                    {
                      step: '4',
                      title: 'Contribuez localement',
                      description: 'Rejoignez des projets à impact près de chez vous et développez le territoire !'
                    }
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-neutral-600">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Why Free Section */}
        <section className="py-16 px-4 bg-primary-50/30">
          <div className="container-custom max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Pourquoi NEYOTA est-il gratuit ?
              </h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm">
              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                Nous croyons que <strong>l&apos;accès aux opportunités ne doit jamais être une question d&apos;argent</strong>.
                Un entrepreneur avec une idée brillante ou un talent avec des compétences rares
                ne doivent pas être freinés par une barrière financière.
              </p>

              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                NEYOTA génère ses revenus grâce à un <strong>modèle B2B et B2G</strong> :
              </p>

              <ul className="space-y-4 mb-6">
                <li className="flex gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Partenariats territoriaux</strong>
                    <p className="text-neutral-600">Collectivités locales, régions et métropoles qui souhaitent dynamiser leur écosystème entrepreneurial</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Subventions publiques</strong>
                    <p className="text-neutral-600">Programmes de soutien à l&apos;innovation et au développement économique local</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong className="text-neutral-900">Mécénat d&apos;entreprises</strong>
                    <p className="text-neutral-600">Entreprises engagées dans le développement territorial et l&apos;impact social</p>
                  </div>
                </li>
              </ul>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <p className="text-neutral-700 font-medium">
                  💡 <strong>Notre engagement :</strong> NEYOTA restera toujours 100% gratuit
                  pour les entrepreneurs et les talents. C&apos;est notre ADN et notre raison d&apos;être.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container-custom max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Notre impact territorial
              </h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mb-6"></div>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Ensemble, nous construisons une économie locale plus dynamique et plus solidaire
              </p>
            </div>

            {(stats.projects > 0 || stats.talents > 0) ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: stats.projects, label: `Projet${stats.projects > 1 ? 's' : ''} actif${stats.projects > 1 ? 's' : ''}`, icon: '🚀' },
                  { value: stats.talents, label: `Talent${stats.talents > 1 ? 's' : ''}`, icon: '🌟' },
                  { value: stats.collaborations, label: `Candidature${stats.collaborations > 1 ? 's' : ''}`, icon: '🤝' },
                  { value: stats.entrepreneurs, label: `Entrepreneur${stats.entrepreneurs > 1 ? 's' : ''}`, icon: '💼' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-5xl mb-3">{stat.icon}</div>
                    <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                    <div className="text-neutral-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-neutral-600">
                <p className="text-lg">Les statistiques apparaîtront au fur et à mesure que la communauté grandit!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="container-custom max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à rejoindre la communauté ?
            </h2>
            <p className="text-xl mb-10 text-primary-100">
              Que vous portiez un projet ou que vous cherchiez à vous investir localement,
              NEYOTA est fait pour vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="min-w-[220px] bg-white hover:bg-neutral-50 text-primary-600">
                  Créer un compte gratuit
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost" size="lg" className="min-w-[180px] text-white border-white hover:bg-primary-700">
                  Découvrir les projets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
