import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles sur TERRII',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-neutral-600 mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="prose prose-neutral max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-neutral-700 leading-relaxed mb-4">
                La protection de vos données personnelles est une priorité pour TERRII. Cette
                politique de confidentialité explique quelles données nous collectons, pourquoi
                nous les collectons, et comment nous les utilisons.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Cette politique est conforme au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés.
              </p>
            </section>

            {/* Article 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                1. Responsable du traitement
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Le responsable du traitement des données personnelles est TERRII, accessible via
                la plateforme neyota.vercel.app.
              </p>
            </section>

            {/* Article 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                2. Données collectées
              </h2>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.1. Données d&apos;inscription</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Mot de passe (crypté)</li>
                <li>Rôle (entrepreneur ou talent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.2. Données de profil</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Localisation (code postal, ville, région)</li>
                <li>Coordonnées GPS (pour le matching territorial)</li>
                <li>Biographie professionnelle</li>
                <li>Compétences et domaines d&apos;expertise</li>
                <li>Distance maximale de déplacement</li>
                <li>Disponibilité</li>
              </ul>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.3. Données de projets (pour les entrepreneurs)</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Titre et description du projet</li>
                <li>Phase du projet</li>
                <li>Compétences recherchées</li>
                <li>Localisation du projet</li>
                <li>Possibilité de travail à distance</li>
              </ul>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">2.4. Données d&apos;utilisation</h3>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Historique des candidatures</li>
                <li>Notifications</li>
                <li>Dates de connexion</li>
                <li>Données techniques (adresse IP, navigateur, appareil)</li>
              </ul>
            </section>

            {/* Article 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                3. Finalités du traitement
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Nous collectons et traitons vos données pour les finalités suivantes :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Création et gestion de votre compte utilisateur</li>
                <li>Mise en relation entre porteurs de projets et talents</li>
                <li>Matching territorial basé sur la géolocalisation et les compétences</li>
                <li>Envoi de notifications relatives à votre activité</li>
                <li>Amélioration de nos services</li>
                <li>Respect de nos obligations légales</li>
                <li>Prévention de la fraude et abus</li>
              </ul>
            </section>

            {/* Article 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                4. Base légale du traitement
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Les traitements de données sont fondés sur :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>Votre consentement</strong> : acceptation des CGU et de la charte éthique</li>
                <li><strong>L&apos;exécution du contrat</strong> : fourniture des services TERRII</li>
                <li><strong>Notre intérêt légitime</strong> : amélioration de la plateforme et prévention des abus</li>
                <li><strong>Obligations légales</strong> : conservation des données pour des raisons juridiques</li>
              </ul>
            </section>

            {/* Article 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                5. Partage des données
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vos données personnelles sont partagées uniquement dans les cas suivants :
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">5.1. Avec les autres utilisateurs</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Certaines informations de votre profil (nom, prénom, ville, compétences, bio) sont
                visibles par les autres utilisateurs de la plateforme dans le cadre du matching et
                des candidatures.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">5.2. Avec nos prestataires</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Nous utilisons des prestataires de confiance pour :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li><strong>Supabase</strong> : hébergement de la base de données et authentification</li>
                <li><strong>Vercel</strong> : hébergement de la plateforme</li>
                <li><strong>API Adresse (data.gouv.fr)</strong> : géocodage des adresses</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                Ces prestataires sont conformes au RGPD et ne peuvent utiliser vos données qu&apos;aux
                fins pour lesquelles nous les leur communiquons.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">5.3. Pas de vente de données</h3>
              <p className="text-neutral-700 leading-relaxed">
                Nous ne vendons <strong>jamais</strong> vos données personnelles à des tiers.
              </p>
            </section>

            {/* Article 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                6. Durée de conservation
              </h2>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li><strong>Données de compte actif</strong> : tant que votre compte existe</li>
                <li><strong>Données de compte supprimé</strong> : 30 jours (délai de rétractation)</li>
                <li><strong>Données de connexion</strong> : 12 mois maximum</li>
                <li><strong>Données pour obligations légales</strong> : durée légale applicable</li>
              </ul>
            </section>

            {/* Article 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                7. Vos droits
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">7.1. Droit d&apos;accès</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous pouvez accéder à l&apos;ensemble de vos données personnelles via votre profil.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">7.2. Droit de rectification</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous pouvez modifier vos informations personnelles depuis les paramètres de votre compte.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">7.3. Droit d&apos;effacement</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous pouvez supprimer votre compte à tout moment. Vos données seront supprimées
                définitivement après 30 jours.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">7.4. Droit d&apos;opposition</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous pouvez vous opposer à certains traitements, notamment l&apos;envoi de notifications
                marketing.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">7.5. Droit à la portabilité</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Vous pouvez récupérer vos données dans un format structuré et lisible par machine.
              </p>

              <h3 className="text-xl font-semibold text-neutral-900 mb-3">7.6. Droit de réclamation</h3>
              <p className="text-neutral-700 leading-relaxed">
                Vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de
                l&apos;Informatique et des Libertés) à l&apos;adresse : www.cnil.fr
              </p>
            </section>

            {/* Article 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                8. Sécurité des données
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
                protéger vos données personnelles :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2">
                <li>Cryptage des mots de passe (bcrypt)</li>
                <li>Connexions sécurisées HTTPS</li>
                <li>Hébergement dans l&apos;Union Européenne (Supabase, Vercel)</li>
                <li>Contrôles d&apos;accès stricts (Row Level Security)</li>
                <li>Sauvegardes régulières</li>
                <li>Surveillance des accès et tentatives d&apos;intrusion</li>
              </ul>
            </section>

            {/* Article 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                9. Cookies et traceurs
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Nous utilisons des cookies essentiels pour :
              </p>
              <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                Nous n&apos;utilisons pas de cookies publicitaires ou de tracking tiers.
              </p>
            </section>

            {/* Article 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                10. Modifications
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Nous pouvons modifier cette politique de confidentialité à tout moment. Vous serez
                informé des modifications significatives via email ou notification sur la plateforme.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8 bg-neutral-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                Contact
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Pour toute question concernant vos données personnelles ou pour exercer vos droits,
                vous pouvez nous contacter via votre profil sur la plateforme.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Pour les demandes relatives à la protection des données, merci de préciser « RGPD »
                dans l&apos;objet de votre message.
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
