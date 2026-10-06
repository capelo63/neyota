import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de la plateforme Teriis',
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="container-custom py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Mentions Légales
            </h1>
            <p className="text-xl text-neutral-600">
              Informations légales concernant la plateforme Teriis
            </p>
            <div className="mt-4 text-sm text-neutral-500">
              Dernière mise à jour : octobre 2026
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                1. Éditeur du site
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Le site teriis.fr est édité par Cyril Hugon et Cynthia Beausoleil, à titre non professionnel, dans le cadre du projet Teriis (association en cours de création).
                </p>
                <p>
                  <strong>Contact :</strong>{' '}<a href="mailto:contact@teriis.fr" className="text-primary-600 hover:text-primary-700">contact@teriis.fr</a>
                </p>
                <p>
                  <strong>Directeur de la publication :</strong> Cyril Hugon
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                2. Hébergement
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  <strong>Plateforme et site :</strong> Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis —{' '}<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">vercel.com</a>
                </p>
                <p>
                  <strong>Base de données :</strong> Supabase Inc., 65 Chulia Street, #38-02/03, OCBC Centre, Singapore 049513 —{' '}<a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">supabase.com</a>. Les données sont hébergées dans l&apos;Union européenne.
                </p>
                <p>
                  <strong>Géocodage des adresses :</strong> API Adresse, service public de la Base Adresse Nationale (<a href="https://data.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">data.gouv.fr</a>).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                3. Propriété intellectuelle
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Les textes, visuels, logos et la marque Teriis présents sur ce site sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation préalable est interdite.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                4. Données personnelles
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Les données personnelles collectées sur la plateforme sont traitées conformément au Règlement général sur la protection des données (RGPD). Les informations détaillées (données collectées, finalités, durées de conservation, droits) figurent dans notre Politique de confidentialité :{' '}<Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">www.teriis.fr/privacy</Link>
                </p>
                <p>
                  Pour exercer vos droits d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition ou de portabilité, écrivez à{' '}<a href="mailto:contact@teriis.fr" className="text-primary-600 hover:text-primary-700">contact@teriis.fr</a>. Vous pouvez également adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">www.cnil.fr</a>).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                5. Cookies
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Ce site utilise uniquement les cookies strictement nécessaires à son fonctionnement. Aucun cookie publicitaire ni traceur tiers n&apos;est utilisé.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                6. Responsabilité
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Teriis met en relation des porteurs de projets et des personnes souhaitant s&apos;impliquer. Les contenus publiés par les utilisateurs (profils, projets, messages) relèvent de leur seule responsabilité. Tout contenu inapproprié peut être signalé à{' '}<a href="mailto:contact@teriis.fr" className="text-primary-600 hover:text-primary-700">contact@teriis.fr</a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                7. Droit applicable et juridiction compétente
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d&apos;accord amiable, les tribunaux français seront compétents.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                Des questions ?
              </h3>
              <p className="text-neutral-700 mb-4">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <Link href="/contact">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Nous contacter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </section>
          </div>

          {/* Back button */}
          <div className="mt-8 text-center">
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

      <Footer />
    </div>
  );
}
