import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
  description: 'Conditions générales d\'utilisation de la plateforme TERRII',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-neutral-600 mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="prose prose-neutral max-w-none">
            {/* Article 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                1. Objet
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent
                l&apos;utilisation de la plateforme TERRII (ci-après « la Plateforme »), accessible
                à l&apos;adresse neyota.vercel.app.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                TERRII est une plateforme gratuite de mise en relation entre porteurs de projets
                entrepreneuriaux et talents locaux, dans une optique de développement territorial
                et d&apos;économie de proximité.
              </p>
            </section>

            {/* Article 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                2. Acceptation des CGU
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                L&apos;accès et l&apos;utilisation de la Plateforme impliquent l&apos;acceptation
                pleine et entière des présentes CGU. En créant un compte, vous acceptez sans
                réserve ces conditions.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Si vous n&apos;acceptez pas ces CGU, vous ne devez pas utiliser la Plateforme.
              </p>
            </section>

            {/* Article 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                3. Description du service
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                TERRII propose les services suivants :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Création et publication de projets entrepreneuriaux</li>
                <li>Recherche de talents et compétences locales</li>
                <li>Matching territorial basé sur la géolocalisation et les compétences</li>
                <li>Mise en relation entre porteurs de projets et talents</li>
                <li>Système de candidatures et de notifications</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                La Plateforme est <strong>entièrement gratuite</strong> pour tous les utilisateurs.
              </p>
            </section>

            {/* Article 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                4. Inscription et compte utilisateur
              </h2>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">4.1. Conditions d&apos;inscription</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                L&apos;inscription est ouverte à toute personne physique majeure disposant de la
                capacité juridique. Vous devez fournir des informations exactes, à jour et complètes.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">4.2. Sécurité du compte</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute
                activité effectuée depuis votre compte est présumée avoir été réalisée par vous.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">4.3. Charte éthique</h3>
              <p className="text-neutral-700 leading-relaxed">
                L&apos;inscription implique l&apos;acceptation de notre Charte éthique, qui vise à
                protéger les idées et favoriser une collaboration respectueuse entre les membres.
              </p>
            </section>

            {/* Article 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                5. Obligations des utilisateurs
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                En utilisant TERRII, vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Fournir des informations exactes et à jour</li>
                <li>Respecter la propriété intellectuelle d&apos;autrui</li>
                <li>Ne pas publier de contenu illicite, diffamatoire ou inapproprié</li>
                <li>Respecter la confidentialité des projets consultés</li>
                <li>Utiliser la Plateforme dans un but professionnel et éthique</li>
                <li>Ne pas tenter de contourner les systèmes de sécurité</li>
                <li>Ne pas utiliser la Plateforme pour du spam ou du démarchage abusif</li>
              </ul>
            </section>

            {/* Article 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                6. Propriété intellectuelle
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                La Plateforme, son contenu (textes, images, logos, code source) et sa structure sont
                protégés par les droits de propriété intellectuelle. Toute reproduction, adaptation
                ou exploitation non autorisée est interdite.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Les contenus publiés par les utilisateurs (projets, profils) restent leur propriété,
                mais vous accordez à TERRII une licence non exclusive pour les afficher sur la Plateforme.
              </p>
            </section>

            {/* Article 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                7. Protection des données personnelles
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Le traitement de vos données personnelles est détaillé dans notre{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Politique de Confidentialité
                </Link>
                .
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
                d&apos;effacement et de portabilité de vos données personnelles.
              </p>
            </section>

            {/* Article 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                8. Responsabilité
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                TERRII est une plateforme de mise en relation et n&apos;est pas partie aux accords
                conclus entre les utilisateurs. Nous ne pouvons être tenus responsables :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Du contenu publié par les utilisateurs</li>
                <li>Des relations et transactions entre les membres</li>
                <li>De l&apos;exactitude des informations fournies par les utilisateurs</li>
                <li>Des interruptions temporaires du service</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                Nous nous réservons le droit de supprimer tout contenu inapproprié et de suspendre
                ou supprimer les comptes en cas de violation des CGU.
              </p>
            </section>

            {/* Article 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                9. Modification et résiliation
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les
                utilisateurs seront informés des modifications significatives.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
              </p>
            </section>

            {/* Article 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                10. Droit applicable et juridiction
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Les présentes CGU sont soumises au droit français. En cas de litige, et après
                tentative de résolution amiable, les tribunaux français seront seuls compétents.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8 bg-neutral-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Contact
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Pour toute question concernant ces CGU, vous pouvez nous contacter via votre profil
                sur la Plateforme ou consulter notre page{' '}
                <Link href="/about" className="text-primary-600 hover:text-primary-700 font-medium">
                  À propos
                </Link>
                .
              </p>
            </section>
          </div>

          {/* Back button */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
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
