import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* En-tête */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Accès partenaires
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4 leading-tight">
            Observez les dynamiques territoriales
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Teriis réunit des porteurs d'initiative et des talents locaux engagés dans leurs territoires.
            En tant que partenaire, vous pouvez, avec leur accord explicite, identifier les projets
            émergents et les profils actifs qui correspondent à votre périmètre d'intervention —
            dans le respect total du choix des utilisateurs.
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: '🏛️',
                title: 'Acteurs publics',
                desc: 'Collectivités, structures d\'accompagnement, chambres consulaires, incubateurs et fondations.',
              },
              {
                icon: '👁️',
                title: 'Visibilité opt-in',
                desc: 'Seuls les utilisateurs qui ont explicitement activé leur visibilité partenaire apparaissent dans votre tableau de bord.',
              },
              {
                icon: '📍',
                title: 'Ancrage territorial',
                desc: 'Filtrez par région ou département pour suivre les dynamiques de votre périmètre d\'intervention.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/partenaires/inscription"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Devenir partenaire
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Mention lancement */}
        <p className="text-center text-sm text-neutral-500">
          Les partenaires fondateurs bénéficient d'un accès gratuit pendant la phase de lancement.
        </p>
      </main>
    </div>
  );
}
