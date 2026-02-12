import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe NEYOTA pour toute question ou suggestion',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-neutral-600">
              Une question ? Une suggestion ? Nous sommes là pour vous aider !
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* For Users */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-neutral-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Vous êtes utilisateur ?
              </h2>
              <p className="text-neutral-600 mb-6">
                Si vous avez une question sur votre compte, un projet ou une candidature,
                contactez-nous directement via votre profil sur la plateforme.
              </p>
              <Link href="/dashboard">
                <Button variant="primary" className="w-full">
                  Accéder à mon profil
                </Button>
              </Link>
            </div>

            {/* For Partners */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-neutral-200">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Partenariats & Institutions
              </h2>
              <p className="text-neutral-600 mb-6">
                Vous représentez une collectivité, une institution ou souhaitez devenir partenaire ?
                Découvrez notre démarche et notre impact territorial.
              </p>
              <Link href="/about">
                <Button variant="secondary" className="w-full">
                  En savoir plus sur NEYOTA
                </Button>
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
              Questions fréquentes
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Comment fonctionne NEYOTA ?
                </h3>
                <p className="text-neutral-600">
                  NEYOTA est une plateforme gratuite qui met en relation les porteurs de projets
                  entrepreneuriaux avec des talents locaux. Le matching se fait sur la base des
                  compétences et de la proximité géographique.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Est-ce vraiment gratuit ?
                </h3>
                <p className="text-neutral-600">
                  Oui, NEYOTA est 100% gratuit pour les entrepreneurs et les talents. Notre modèle
                  économique repose sur des partenariats avec des collectivités territoriales et
                  des institutions publiques.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Comment mes données sont-elles protégées ?
                </h3>
                <p className="text-neutral-600">
                  Nous prenons la protection de vos données très au sérieux. NEYOTA est conforme
                  au RGPD et utilise des protocoles de sécurité avancés. Consultez notre{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Politique de Confidentialité
                  </Link>{' '}
                  pour plus d&apos;informations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Puis-je travailler à distance avec un projet ?
                </h3>
                <p className="text-neutral-600">
                  Oui ! Bien que NEYOTA privilégie les collaborations territoriales, de nombreux
                  projets acceptent le travail à distance. Cette information est clairement indiquée
                  sur chaque fiche projet.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Comment signaler un problème ou un abus ?
                </h3>
                <p className="text-neutral-600">
                  Chaque profil et projet dispose d&apos;un système de signalement. En cas de
                  comportement inapproprié ou de non-respect de notre{' '}
                  <Link href="/charter" className="text-primary-600 hover:text-primary-700 font-medium">
                    Charte éthique
                  </Link>
                  , utilisez le bouton de signalement présent sur les pages concernées.
                </p>
              </div>
            </div>
          </div>

          {/* Social & Links */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-8 text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Rejoignez la communauté NEYOTA
            </h2>
            <p className="text-primary-100 mb-6">
              Commencez dès aujourd&apos;hui à faire vivre votre territoire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="min-w-[200px] bg-white text-primary-600 hover:bg-neutral-50">
                  Créer un compte
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost" size="lg" className="min-w-[200px] text-white border-white hover:bg-primary-700">
                  Voir les projets
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
        </div>
      </main>
    </div>
  );
}
