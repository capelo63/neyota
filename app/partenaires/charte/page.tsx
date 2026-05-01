import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function ChartePartenairesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <nav className="flex items-center gap-2 mb-8 text-sm text-neutral-500">
          <Link href="/partenaires" className="hover:text-neutral-800 transition-colors">Partenaires</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-medium">Charte partenaires</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Charte des partenaires Teriis</h1>
          <p className="text-neutral-500 text-sm">Dernière mise à jour : mai 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 prose prose-neutral max-w-none">

          <p className="text-neutral-600 leading-relaxed">
            En devenant partenaire Teriis, vous rejoignez une plateforme construite sur la confiance entre
            porteurs d'initiative, talents et acteurs du territoire. Cette charte définit les engagements que
            vous acceptez en accédant aux données de visibilité partenaire.
          </p>

          <hr className="border-neutral-100 my-8" />

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
              Respect du choix de visibilité des utilisateurs
            </h2>
            <p className="text-neutral-600 leading-relaxed ml-9">
              Seuls les porteurs d'initiative et les talents ayant <strong>explicitement activé leur visibilité partenaire</strong> apparaissent dans votre tableau de bord. Vous vous engagez à :
            </p>
            <ul className="ml-9 mt-3 space-y-2 text-neutral-600">
              <li>Ne pas contacter un utilisateur dont le profil ne vous est pas visible via la plateforme.</li>
              <li>Considérer le retrait de visibilité d'un utilisateur comme un refus définitif de contact pour la période concernée.</li>
              <li>Ne pas tenter de retrouver ou contacter des utilisateurs via des canaux externes à Teriis à partir d'informations obtenues sur la plateforme.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
              Interdiction de scraping et d'extraction massive de données
            </h2>
            <p className="text-neutral-600 leading-relaxed ml-9">
              Il est strictement interdit de :
            </p>
            <ul className="ml-9 mt-3 space-y-2 text-neutral-600">
              <li>Utiliser des outils automatisés, scripts ou bots pour collecter des données depuis la plateforme.</li>
              <li>Exporter, copier ou reproduire en masse les profils, projets ou informations accessibles dans votre tableau de bord.</li>
              <li>Constituer une base de données externe à partir des informations Teriis, à des fins commerciales ou autres.</li>
              <li>Partager les accès à votre compte partenaire avec des tiers non autorisés.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
              Interdiction du démarchage agressif
            </h2>
            <p className="text-neutral-600 leading-relaxed ml-9">
              L'accès partenaire est accordé pour faciliter des mises en relation à valeur ajoutée, non pour alimenter des campagnes commerciales. Sont interdits :
            </p>
            <ul className="ml-9 mt-3 space-y-2 text-neutral-600">
              <li>Les sollicitations non désirées, répétées ou sous pression (mails en masse, relances systématiques).</li>
              <li>L'utilisation des données de la plateforme à des fins de prospection commerciale non liée à l'objet du partenariat validé.</li>
              <li>Tout contact qui ne tient pas compte d'un refus ou d'une absence de réponse préalable.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
              Engagement à proposer des services à valeur ajoutée
            </h2>
            <p className="text-neutral-600 leading-relaxed ml-9">
              En tant que partenaire, vous vous engagez à ce que vos interventions auprès des porteurs d'initiative et des talents :
            </p>
            <ul className="ml-9 mt-3 space-y-2 text-neutral-600">
              <li>Soient pertinentes au regard du projet ou du profil identifié sur Teriis.</li>
              <li>Apportent un bénéfice concret à l'utilisateur contacté (accompagnement, financement, mise en réseau, formation…).</li>
              <li>Soient transparentes quant à votre identité et à l'origine de votre prise de contact.</li>
              <li>Respectent les lois en vigueur, notamment le RGPD et la réglementation sur la prospection commerciale.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">!</span>
              Conséquences en cas de manquement
            </h2>
            <p className="text-neutral-600 leading-relaxed ml-9">
              Tout manquement aux engagements de la présente charte peut entraîner :
            </p>
            <ul className="ml-9 mt-3 space-y-2 text-neutral-600">
              <li><strong>La suspension immédiate</strong> de l'accès partenaire, sans préavis ni remboursement.</li>
              <li><strong>La résiliation définitive</strong> du partenariat en cas de manquement grave ou répété.</li>
              <li>Le signalement aux autorités compétentes (CNIL, procureur) en cas d'infraction légale caractérisée.</li>
            </ul>
            <p className="text-neutral-600 leading-relaxed ml-9 mt-3">
              Teriis se réserve le droit de surveiller l'utilisation du tableau de bord partenaire afin de détecter tout usage abusif, dans le respect de sa propre politique de confidentialité.
            </p>
          </section>

          <hr className="border-neutral-100 my-8" />

          <p className="text-sm text-neutral-500 leading-relaxed">
            Pour toute question relative à cette charte, contactez-nous à{' '}
            <a href="mailto:cyril.hugon@gmail.com" className="text-primary-600 hover:underline">cyril.hugon@gmail.com</a>.
            En cochant la case d'acceptation lors de votre inscription, vous attestez avoir lu et accepté l'intégralité de la présente charte.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/partenaires/inscription"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Retour au formulaire d'inscription
          </Link>
        </div>
      </main>
    </div>
  );
}
