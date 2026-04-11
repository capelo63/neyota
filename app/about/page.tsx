import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez la mission de Teriis : connecter les porteurs de projets et les talents locaux pour dynamiser l\'économie territoriale française.',
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
              Teriis
            </h1>
            <p className="text-2xl md:text-3xl font-medium text-primary-600 mb-6">
              TERritoires, Initiatives et Innovation sociale
            </p>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              La plateforme qui réunit les énergies d&apos;un même territoire
              pour faire naître des initiatives locales
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
                Teriis est née d&apos;un constat simple : <strong>partout, des talents et des porteurs
                de projets existent... mais se rencontrent trop peu</strong>. Les uns cherchent à s&apos;engager
                dans des projets utiles, les autres ont besoin de compétences pour avancer. Pourtant,
                ces dynamiques restent souvent séparées.
              </p>

              <p className="text-xl leading-relaxed mb-6">
                Notre mission est de <strong>simplifier la mise en relation entre porteurs de projets
                et experts</strong>, en identifiant pour chacun les personnes les plus pertinentes, au
                bon moment et sur leur territoire. Nous permettons ainsi de transformer plus rapidement
                les idées en projets concrets, utiles et ancrés localement. Et, dans le même temps, de
                mobiliser des personnes éloignées des opportunités.
              </p>

              <p className="text-xl leading-relaxed mb-6">
                Créer des liens simples, humains, pour permettre à des projets de voir le jour et de
                grandir, là où les gens vivent. L&apos;objectif n&apos;est pas d&apos;enfermer mais de
                permettre à chacun de participer, ponctuellement ou durablement, à des projets qui font sens.
              </p>

              <p className="text-xl leading-relaxed mb-6">
                En favorisant la proximité, Teriis contribue à faire émerger des initiatives plus ancrées,
                plus solidaires, et plus durables. <strong>Chaque projet est une opportunité de faire vivre
                son territoire, à son échelle.</strong>
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
                  icon: '🎯',
                  title: 'Agir localement, créer utile',
                  description: 'Nous croyons en la force des territoires et des initiatives de proximité. Chaque projet mérite de se développer là où il peut avoir le plus d\'impact.'
                },
                {
                  icon: '🤝',
                  title: 'Confiance et respect',
                  description: 'Nous construisons un cadre où chacun peut partager ses idées et ses compétences en toute confiance. L\'écoute, la bienveillance et l\'engagement mutuel sont essentiels à des collaborations durables.'
                },
                {
                  icon: '🌍',
                  title: 'Accessible à tous',
                  description: 'Nous défendons un accès ouvert à l\'accompagnement et aux compétences. Quels que soient votre parcours ou vos moyens, vous devez pouvoir être aidé ou contribuer.'
                },
                {
                  icon: '✨',
                  title: 'Des rencontres qui font avancer',
                  description: 'Nous facilitons des mises en relation utiles et pertinentes entre personnes qui peuvent réellement s\'apporter mutuellement, pour transformer une rencontre en collaboration concrète.'
                },
                {
                  icon: '🌱',
                  title: 'Un impact concret et visible',
                  description: 'Nous valorisons les projets qui créent de la valeur réelle : économique, sociale ou environnementale. Chaque action compte et chaque réussite mérite d\'être visible.'
                },
                {
                  icon: '🚀',
                  title: 'Donner envie d\'agir',
                  description: 'Nous encourageons le passage à l\'action et l\'engagement dans la durée, en valorisant les contributions de chacun au service des projets et des territoires.'
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
              {/* For Project Holders */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Pour les porteurs de projet
                  </h3>
                </div>

                <ol className="space-y-6">
                  {[
                    {
                      step: '1',
                      title: 'Créez votre profil',
                      description: 'Présentez votre projet, précisez votre localisation et ce que vous recherchez. En quelques minutes, vous êtes prêt à être mis en relation.'
                    },
                    {
                      step: '2',
                      title: 'Dites-nous de quoi vous avez besoin',
                      description: 'Décrivez simplement ce dont vous avez besoin pour avancer : compétences, stade du projet, objectifs.'
                    },
                    {
                      step: '3',
                      title: 'Rencontrez les bons talents',
                      description: 'Recevez rapidement des profils pertinents, proches de vous et alignés avec votre projet.'
                    },
                    {
                      step: '4',
                      title: 'Lancez la collaboration',
                      description: 'Échangez, choisissez les personnes qui vous correspondent et faites avancer votre projet ensemble.'
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
                      description: 'Mettez en avant vos compétences, vos expériences et les projets qui vous motivent, et engagez-vous à respecter notre charte éthique.'
                    },
                    {
                      step: '2',
                      title: 'Découvrez des projets qui comptent',
                      description: 'Accédez à des projets proches de vous, sélectionnés en fonction de votre profil et de vos envies.'
                    },
                    {
                      step: '3',
                      title: 'Proposez votre aide',
                      description: 'Contactez facilement les porteurs de projet qui vous inspirent et expliquez comment vous pouvez contribuer.'
                    },
                    {
                      step: '4',
                      title: 'Engagez-vous concrètement',
                      description: 'Participez à des projets utiles et contribuez au développement de votre territoire.'
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
                Pourquoi Teriis est-il gratuit ?
              </h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm">
              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                Nous croyons que <strong>l&apos;accès aux opportunités ne doit jamais dépendre de moyens financiers</strong>.
              </p>

              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                Un projet utile ou une compétence engagée méritent de trouver leur place, sans barrière.
              </p>

              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                Teriis est soutenu par des acteurs publics et privés engagés dans le développement des territoires.
                Ce modèle nous permet de rester 100% gratuit pour les porteurs de projet et les talents.
              </p>

              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                Teriis a vocation à s&apos;appuyer sur des acteurs engagés dans le développement des territoires,
                afin de rester accessible à tous.
              </p>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <p className="text-neutral-700 font-medium">
                  💡 <strong>C&apos;est un choix fort, et nous nous engageons à le préserver.</strong>
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
                Ensemble, nous faisons grandir des projets qui renforcent nos territoires
              </p>
            </div>

            {(stats.projects > 0 || stats.talents > 0) ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: stats.projects, label: `Projet${stats.projects > 1 ? 's' : ''} actif${stats.projects > 1 ? 's' : ''}`, icon: '🚀' },
                  { value: stats.talents, label: `Talent${stats.talents > 1 ? 's' : ''}`, icon: '🌟' },
                  { value: stats.collaborations, label: `Candidature${stats.collaborations > 1 ? 's' : ''}`, icon: '🤝' },
                  { value: stats.entrepreneurs, label: `Porteur${stats.entrepreneurs > 1 ? 's' : ''} d'initiative`, icon: '💼' }
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
              Vous avez un projet ou l&apos;envie de vous engager ? Rejoignez Teriis et passez à l&apos;action.
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

      <Footer />
    </div>
  );
}
