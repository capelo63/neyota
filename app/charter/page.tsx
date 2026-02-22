import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Charte éthique',
  description: 'La charte éthique TERRII : nos engagements pour protéger les idées, garantir la transparence et promouvoir la collaboration locale responsable.',
};

export default function CharterPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="container-custom py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Charte Éthique TERRII
            </h1>
            <p className="text-xl text-neutral-600">
              Les valeurs et engagements qui fondent notre communauté
            </p>
            <div className="mt-4 text-sm text-neutral-500">
              Version 1.0 - Dernière mise à jour : Février 2026
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 space-y-8">
            {/* Intro */}
            <section>
              <p className="text-lg text-neutral-700 leading-relaxed">
                En rejoignant TERRII, vous vous engagez à respecter cette charte éthique.
                Elle garantit un environnement sain, bienveillant et respectueux pour tous les membres
                de notre communauté, qu'ils soient entrepreneurs ou talents.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🤝</span>
                1. Respect et bienveillance
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  <strong>Je m'engage à :</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Traiter tous les membres avec respect et courtoisie</li>
                  <li>Communiquer de manière constructive et professionnelle</li>
                  <li>Accepter les refus et les différences d'opinion avec maturité</li>
                  <li>Ne jamais tenir de propos discriminatoires, offensants ou harcelants</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🔒</span>
                2. Protection des idées et confidentialité
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  <strong>Je m'engage à :</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Respecter la confidentialité des projets qui me sont présentés</li>
                  <li>Ne jamais utiliser, copier ou divulguer les idées d'autrui sans autorisation explicite</li>
                  <li>Signer un accord de confidentialité (NDA) si l'entrepreneur le demande</li>
                  <li>Signaler immédiatement tout comportement de vol d'idée ou de détournement</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">✅</span>
                3. Honnêteté et transparence
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  <strong>Je m'engage à :</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Fournir des informations exactes et à jour sur mon profil</li>
                  <li>Présenter mes compétences et expériences de manière honnête</li>
                  <li>Être transparent sur mes disponibilités et mes intentions</li>
                  <li>Respecter mes engagements et mes délais</li>
                  <li>Communiquer rapidement en cas d'imprévu ou de difficulté</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🌍</span>
                4. Engagement territorial
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  <strong>Je m'engage à :</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Privilégier les collaborations locales et territoriales</li>
                  <li>Contribuer au développement économique et social de mon territoire</li>
                  <li>Partager mes connaissances et mon expérience avec la communauté locale</li>
                  <li>Respecter l'esprit de solidarité et d'entraide de TERRII</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                5. Qualité et professionnalisme
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  <strong>Je m'engage à :</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Fournir un travail de qualité correspondant à mes compétences</li>
                  <li>Respecter les standards professionnels de mon domaine</li>
                  <li>Communiquer régulièrement sur l'avancement des missions</li>
                  <li>Accepter et donner des retours constructifs</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚖️</span>
                6. Respect des règles de la plateforme
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  <strong>Je m'engage à :</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Ne pas utiliser TERRII à des fins illégales ou contraires à l'éthique</li>
                  <li>Ne pas créer de faux profils ou usurper l'identité d'autrui</li>
                  <li>Ne pas envoyer de spam ou de messages non sollicités</li>
                  <li>Ne pas tenter de contourner les systèmes de sécurité</li>
                  <li>Signaler tout comportement abusif ou contraire à cette charte</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🚨</span>
                7. Signalement et sanctions
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>
                  TERRII se réserve le droit de :
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Enquêter sur tout signalement de non-respect de cette charte</li>
                  <li>Suspendre ou supprimer le compte d'un membre en cas de manquement grave</li>
                  <li>Bannir définitivement les utilisateurs récidivistes</li>
                  <li>Prendre des mesures légales en cas de fraude, vol d'idée ou comportement illégal</li>
                </ul>
                <p className="mt-4">
                  <strong>Pour signaler un comportement inapproprié :</strong> Utilisez le bouton
                  "Signaler" présent sur chaque profil et projet, ou contactez-nous à{' '}
                  <a href="mailto:ethique@neyota.fr" className="text-primary-600 hover:text-primary-700 font-medium">
                    ethique@neyota.fr
                  </a>
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">
                💡 Acceptation de la charte
              </h2>
              <p className="text-neutral-700 mb-3">
                En créant un compte sur TERRII, vous acceptez de respecter cette charte éthique
                dans toutes vos interactions sur la plateforme.
              </p>
              <p className="text-neutral-700">
                Cette charte peut être mise à jour. Les membres seront informés de tout changement
                significatif et devront accepter la nouvelle version pour continuer à utiliser TERRII.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Créer un compte
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg">
                En savoir plus sur TERRII
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
