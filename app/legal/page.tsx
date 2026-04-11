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
              Dernière mise à jour : Avril 2026
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 space-y-8">
            {/* Section 1: Éditeur */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                1. Éditeur du site
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  <strong>Raison sociale :</strong> [À compléter]
                </p>
                <p>
                  <strong>Forme juridique :</strong> [À compléter]
                </p>
                <p>
                  <strong>Capital social :</strong> [À compléter]
                </p>
                <p>
                  <strong>Siège social :</strong> [Adresse à compléter]
                </p>
                <p>
                  <strong>SIRET :</strong> [Numéro à compléter]
                </p>
                <p>
                  <strong>RCS :</strong> [Numéro à compléter]
                </p>
                <p>
                  <strong>Directeur de la publication :</strong> [Nom à compléter]
                </p>
                <p>
                  <strong>Contact :</strong>{' '}
                  <a href="mailto:contact@teriis.fr" className="text-primary-600 hover:text-primary-700">
                    contact@teriis.fr
                  </a>
                </p>
              </div>
            </section>

            {/* Section 2: Hébergeur */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                2. Hébergement
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Le site Teriis est hébergé par :
                </p>
                <p>
                  <strong>Vercel Inc.</strong><br />
                  440 N Barranca Ave #4133<br />
                  Covina, CA 91723<br />
                  États-Unis<br />
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    https://vercel.com
                  </a>
                </p>
                <p>
                  <strong>Base de données hébergée par :</strong><br />
                  Supabase, Inc.<br />
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    https://supabase.com
                  </a>
                </p>
              </div>
            </section>

            {/* Section 3: Propriété intellectuelle */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                3. Propriété intellectuelle
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, etc.)
                  est la propriété exclusive de Teriis, sauf mention contraire.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, adaptation de tout
                  ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé,
                  est interdite, sauf autorisation écrite préalable de Teriis.
                </p>
                <p>
                  La marque « Teriis » ainsi que tous les signes distinctifs reproduits sur le site
                  sont la propriété de Teriis et ne peuvent être utilisés sans autorisation.
                </p>
              </div>
            </section>

            {/* Section 4: Protection des données */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                4. Protection des données personnelles
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous
                  disposez d'un droit d'accès, de rectification, de suppression et de portabilité
                  de vos données personnelles.
                </p>
                <p>
                  Pour exercer ces droits ou pour toute question sur le traitement de vos données,
                  vous pouvez nous contacter à l'adresse :{' '}
                  <a href="mailto:contact@teriis.fr" className="text-primary-600 hover:text-primary-700">
                    contact@teriis.fr
                  </a>
                </p>
                <p>
                  Pour plus d'informations sur la collecte et le traitement de vos données, consultez
                  notre{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Politique de Confidentialité
                  </Link>.
                </p>
              </div>
            </section>

            {/* Section 5: Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                5. Cookies
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Le site Teriis utilise des cookies pour améliorer l'expérience utilisateur,
                  réaliser des statistiques de visite et assurer le bon fonctionnement de la plateforme.
                </p>
                <p>
                  Vous pouvez à tout moment désactiver les cookies depuis les paramètres de votre navigateur.
                  Toutefois, cela peut affecter certaines fonctionnalités du site.
                </p>
              </div>
            </section>

            {/* Section 6: Responsabilité */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                6. Limitation de responsabilité
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Teriis s'efforce d'assurer au mieux de ses possibilités, l'exactitude et la mise
                  à jour des informations diffusées sur ce site.
                </p>
                <p>
                  Toutefois, Teriis ne peut garantir l'exactitude, la précision ou l'exhaustivité
                  des informations mises à disposition sur ce site.
                </p>
                <p>
                  En conséquence, Teriis décline toute responsabilité pour toute imprécision,
                  inexactitude ou omission portant sur des informations disponibles sur le site.
                </p>
              </div>
            </section>

            {/* Section 7: Liens externes */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                7. Liens hypertextes
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Le site Teriis peut contenir des liens hypertextes vers d'autres sites. Teriis
                  n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à
                  leur contenu.
                </p>
                <p>
                  La création de liens hypertextes vers le site Teriis est soumise à l'accord
                  préalable écrit de Teriis.
                </p>
              </div>
            </section>

            {/* Section 8: Droit applicable */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                8. Droit applicable et juridiction compétente
              </h2>
              <div className="space-y-3 text-neutral-700">
                <p>
                  Les présentes mentions légales sont régies par le droit français.
                </p>
                <p>
                  En cas de litige et à défaut d'accord amiable, le tribunal compétent sera celui
                  du siège social de Teriis.
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
