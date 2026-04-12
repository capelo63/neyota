import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Charte de confiance Teriis',
  description: 'La charte de confiance Teriis : les principes qui font vivre notre communauté fondée sur la confiance, le respect et l\'envie de faire avancer des projets utiles.',
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
              Charte de confiance Teriis
            </h1>
            <p className="text-xl text-neutral-600">
              Les principes qui font vivre la communauté
            </p>
            <div className="mt-4 text-sm text-neutral-500">
              Version 2.0 - Dernière mise à jour : Avril 2026
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 space-y-8">
            {/* Intro */}
            <section>
              <p className="text-lg text-neutral-700 leading-relaxed mb-4">
                Rejoindre Teriis, c&apos;est entrer dans une communauté fondée sur la confiance, le respect et l&apos;envie de faire avancer des projets utiles.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                Cette charte n&apos;a pas vocation à être contraignante. Elle pose simplement un cadre pour que chacun puisse échanger, collaborer et contribuer sereinement.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🤝</span>
                1. Respect et bienveillance
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>Sur Teriis, chacun veille à :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>échanger avec respect et courtoisie</li>
                  <li>communiquer de manière constructive</li>
                  <li>accueillir les différences d&apos;opinion avec ouverture</li>
                  <li>éviter tout propos offensant, discriminatoire ou inapproprié</li>
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
                <p>Les projets partagés méritent d&apos;être respectés. Chaque membre est invité à :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>respecter la confidentialité des échanges</li>
                  <li>ne pas utiliser ou diffuser une idée sans accord</li>
                  <li>formaliser un cadre (type accord de confidentialité) si nécessaire</li>
                  <li>signaler tout comportement inapproprié</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">✅</span>
                3. Honnêteté et clarté
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>Pour faciliter des collaborations de qualité :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>chacun présente son profil et ses compétences avec sincérité</li>
                  <li>précise ses disponibilités et ses intentions</li>
                  <li>fait de son mieux pour tenir ses engagements</li>
                  <li>informe les autres en cas d&apos;imprévu</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🌍</span>
                4. Esprit local et entraide
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>Teriis encourage une dynamique de proximité et de coopération :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>participer, à son échelle, à des initiatives locales</li>
                  <li>favoriser les échanges et les collaborations de proximité</li>
                  <li>partager ses connaissances et ses expériences</li>
                  <li>contribuer à une dynamique positive autour de soi</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                5. Contribution et qualité
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>Chaque participation, quelle que soit sa forme, compte. Les membres sont invités à :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>partager leurs compétences avec sérieux et bonne volonté</li>
                  <li>s&apos;impliquer selon leurs possibilités</li>
                  <li>communiquer pour faire avancer les projets</li>
                  <li>donner et recevoir des retours constructifs</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚖️</span>
                6. Utilisation responsable de la plateforme
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>Pour garantir un cadre sain :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>les usages doivent rester légaux et respectueux</li>
                  <li>les profils doivent être authentiques</li>
                  <li>les échanges doivent rester pertinents (pas de spam)</li>
                  <li>les règles de sécurité doivent être respectées</li>
                  <li>les comportements abusifs peuvent être signalés</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🚨</span>
                7. En cas de problème
              </h2>
              <div className="space-y-3 text-neutral-700 pl-12">
                <p>Teriis veille au bon fonctionnement de la communauté. En cas de non-respect de ces principes, la plateforme peut :</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>analyser les situations signalées</li>
                  <li>limiter ou suspendre un compte si nécessaire</li>
                  <li>prendre des mesures adaptées en cas de comportement grave</li>
                </ul>
                <p className="mt-4">
                  <strong>Un bouton de signalement est accessible sur les profils et projets</strong> pour alerter facilement.
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">
                💡 En rejoignant Teriis
              </h2>
              <p className="text-neutral-700 mb-3">
                Vous contribuez à faire vivre un espace de confiance, d&apos;entraide et de collaboration.
              </p>
              <p className="text-neutral-700">
                Chacun est libre de s&apos;impliquer à son rythme, dans le respect des autres et des projets.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="default" size="lg">
                Créer un compte
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg">
                En savoir plus sur Teriis
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
