'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: "🎯 Fonctionnement général",
    icon: "🎯",
    items: [
      {
        question: "Qu'est-ce que Teriis ?",
        answer: "Teriis est une plateforme gratuite de mise en relation entre **porteurs de projets** (entrepreneurs, créateurs) et **talents locaux** (développeurs, designers, marketeurs, etc.) souhaitant s'investir dans des initiatives locales à impact. Notre mission : dynamiser les territoires en favorisant l'entrepreneuriat de proximité et la collaboration locale."
      },
      {
        question: "Comment fonctionne la plateforme ?",
        answer: `C'est simple :
1. **Les porteurs de projets** publient leurs projets avec les compétences recherchées
2. **Les talents** créent leur profil et indiquent leurs compétences
3. **Notre algorithme** suggère automatiquement des matchs basés sur la proximité géographique, les compétences et la phase du projet
4. Les talents candidatent aux projets qui les intéressent
5. Les porteurs de projets sélectionnent les talents et démarrent la collaboration`
      },
      {
        question: "Qui peut utiliser Teriis ?",
        answer: `**Tout le monde !** Teriis est ouvert à :
- **Porteurs de projets** : entrepreneurs, créateurs, associatifs, indépendants
- **Talents** : salariés en quête de sens, freelances, étudiants, retraités actifs, experts bénévoles
- **Toutes les phases** : de l'idée sur papier au projet en croissance
- **Tous les secteurs** : tech, social, environnemental, artisanat, services, etc.`
      },
      {
        question: "Est-ce que Teriis est vraiment 100% gratuit ?",
        answer: `**Oui, absolument !** Teriis est et restera **100% gratuit** pour :
- Les porteurs de projets (création et publication de projets illimitée)
- Les talents (candidatures illimitées)
- Toutes les fonctionnalités principales

Notre modèle repose sur des **subventions publiques**, du **mécénat d'entreprise** et des **partenariats B2B** (incubateurs, écoles), pas sur les utilisateurs.`
      }
    ]
  },
  {
    title: "💡 Pour les porteurs de projets",
    icon: "💡",
    items: [
      {
        question: "Comment créer mon premier projet sur Teriis ?",
        answer: `1. Connectez-vous à votre compte
2. Allez dans **"Mes projets"** → **"Créer un projet"**
3. Remplissez les informations : titre, pitch court, description complète, phase du projet, compétences recherchées, localisation
4. Publiez votre projet
5. Les talents correspondant à votre recherche recevront une notification`
      },
      {
        question: "À quelle phase de mon projet puis-je utiliser la plateforme ?",
        answer: `**À toutes les phases !** Teriis accompagne votre projet de A à Z :
- **💭 Idéation** : Vous avez une idée et cherchez des co-fondateurs
- **🛠 MVP** : Vous développez votre prototype
- **🚀 Lancement** : Vous êtes prêt à lancer
- **📈 Croissance** : Vous scalez
- **🏗 Structuration** : Vous professionnalisez`
      },
      {
        question: "Comment trouver les bons talents pour mon projet ?",
        answer: `Notre algorithme travaille pour vous :
1. **Matching automatique** : Les talents avec les compétences recherchées reçoivent une notification
2. **Recherche manuelle** : Vous pouvez chercher des talents par compétences et localisation
3. **Candidatures spontanées** : Les talents peuvent candidater même s'ils ne matchent pas à 100%

**Astuce** : Plus votre description est précise, plus vous attirerez les bons profils.`
      }
    ]
  },
  {
    title: "🚀 Pour les talents",
    icon: "🚀",
    items: [
      {
        question: "Quelles compétences puis-je proposer ?",
        answer: `**Toutes les compétences sont bienvenues !**

**💻 Tech & Digital** : Développement web/mobile, Design UI/UX, Data science, DevOps
**📣 Marketing & Communication** : Community management, Content marketing, SEO
**💼 Business & Stratégie** : Business development, Levée de fonds, Juridique
**🎨 Créatif & Contenu** : Vidéo, photo, Rédaction, Illustration
**🔧 Autres** : Gestion de projet, RH, Logistique, Artisanat`
      },
      {
        question: "Comment candidater à un projet ?",
        answer: `1. Explorez les projets suggérés ou utilisez la recherche
2. Cliquez sur un projet pour voir le **pitch court**
3. Cliquez sur **"Candidater"**
4. **Acceptez la charte éthique** (respect de la confidentialité)
5. Rédigez une **lettre de motivation** courte
6. Validez votre candidature

Le porteur de projet recevra une notification et pourra consulter votre profil.`
      },
      {
        question: "Les missions sont-elles rémunérées ?",
        answer: `**Ça dépend du projet !** Teriis accueille tous les types de collaboration :
- **Bénévolat / Pro bono**
- **Rémunération** (salaire ou honoraires)
- **Equity / Parts** (associé·e)
- **Mixte** (petit salaire + equity)
- **Troc de compétences**

Les modalités sont **négociées librement** entre vous et le porteur de projet.`
      }
    ]
  },
  {
    title: "🔒 Protection des idées",
    icon: "🔒",
    items: [
      {
        question: "Comment mes idées de projet sont-elles protégées ?",
        answer: `La protection de vos idées est une **priorité absolue** :

**1. Visibilité progressive** : Seul un pitch court est visible publiquement. La description complète n'est accessible qu'aux talents ayant candidaté ET accepté la charte éthique.

**2. Charte éthique obligatoire** : Respect de la confidentialité, interdiction de copier/voler des idées, engagement de bonne foi.

**3. Système de signalement** : Si vous constatez un vol d'idée, vous pouvez signaler l'utilisateur.

**4. NDA optionnel** : Vous pouvez demander aux talents de signer un NDA avant d'échanger des informations sensibles.`
      },
      {
        question: "Qu'est-ce que la charte éthique ?",
        answer: `La **charte éthique** est un engagement moral que tous les utilisateurs acceptent :

**Pour les talents** : Respect de la confidentialité, interdiction de copier/détourner des idées, engagement de bonne foi, professionnalisme.

**Pour les porteurs de projets** : Transparence sur les conditions de collaboration, respect des talents, reconnaissance du travail fourni.

**Pourquoi ?** Teriis repose sur la **confiance**. Sans cette charte, la plateforme ne pourrait pas fonctionner sainement.`
      },
      {
        question: "Mes données personnelles sont-elles sécurisées ?",
        answer: `**Absolument.** Teriis respecte le **RGPD** et protège vos données :

**Sécurité technique** : Hébergement sécurisé (Supabase + Vercel), chiffrement des données, authentification sécurisée, sauvegardes quotidiennes.

**Vos droits** : Consulter, modifier, supprimer ou exporter vos données.

**Nous ne vendons JAMAIS vos données** à des tiers.`
      }
    ]
  },
  {
    title: "📍 Géolocalisation",
    icon: "📍",
    items: [
      {
        question: "Comment fonctionne le matching géographique ?",
        answer: `Notre système de **géolocalisation** repose sur :

1. **Votre localisation** : Ville ou région renseignée dans votre profil
2. **Rayon de recherche** : Distance maximale (10 km, 50 km, 100 km, région, France entière)
3. **Calcul de distance** : Distance "à vol d'oiseau" entre vous et les projets/talents

**Exemple** : Vous êtes à Lyon et cherchez dans un rayon de 50 km → Les talents de Lyon, Villeurbanne, Vénissieux verront votre projet en priorité.`
      },
      {
        question: "Puis-je chercher des talents en dehors de ma région ?",
        answer: `**Oui !** Vous avez 3 options :
1. **Local strict** : Votre ville/agglomération (10-30 km)
2. **Régional** : Votre région administrative
3. **National** : Toute la France

**Pourquoi privilégier le local ?** Rencontres physiques, ancrage territorial, impact local. Mais si vous cherchez une compétence rare, élargir géographiquement peut être pertinent.`
      }
    ]
  },
  {
    title: "🆚 Positionnement",
    icon: "🆚",
    items: [
      {
        question: "Pourquoi Teriis alors qu'il existe déjà des incubateurs comme Alter'Incub ?",
        answer: `**Teriis vs Incubateurs RSE** :

**✅ Accessible sans sélection** (vs dossier + jury)
**⚡ Instantané** (vs appels à projets 1-2 fois/an)
**🎯 Matching talents pairs** (vs mentors experts seniors)
**💚 0€, 0% equity** (vs frais ou prise de capital)
**🌱 Dès l'idéation** (vs MVP minimum requis)
**🔄 Complémentarité** : Teriis ne remplace pas les incubateurs, il complète l'écosystème

**Message clé** : "Teriis ne concurrence personne, il comble un vide : le matching territorial instantané et gratuit entre projets et talents."`
      }
    ]
  },
  {
    title: "💰 Modèle économique",
    icon: "💰",
    items: [
      {
        question: "Comment Teriis se finance-t-il ?",
        answer: `Teriis repose sur un **modèle économique vertueux** :

**60%** Subventions publiques (Régions, BPI, fonds européens)
**25%** Partenariats B2B (Incubateurs, écoles, cabinets)
**10%** Mécénat d'entreprise (RSE, fondations)
**5%** Services premium optionnels (boost visibilité, analytics)

**Principe** : Les utilisateurs ne paient **jamais** pour les fonctionnalités essentielles.`
      },
      {
        question: "Pourquoi créer une plateforme gratuite ?",
        answer: `Parce que **l'argent ne doit pas être un frein** à l'entrepreneuriat et à l'engagement local.

**Notre conviction** : Les talents ont des compétences, pas forcément de budget. Les porteurs de projets en phase idéation n'ont souvent pas de trésorerie. L'impact territorial bénéficie à tous.

**Notre modèle** : Les bénéficiaires indirects (Régions, incubateurs, entreprises) financent la plateforme, les utilisateurs en profitent gratuitement.`
      }
    ]
  },
  {
    title: "⚙️ Utilisation",
    icon: "⚙️",
    items: [
      {
        question: "Comment modifier mon profil ?",
        answer: `1. Connectez-vous à votre compte
2. Cliquez sur votre **avatar** → **"Mon profil"**
3. Cliquez sur **"Modifier"**
4. Changez les informations : bio, compétences, localisation, photo, disponibilité
5. **Enregistrez**

Vos modifications sont **instantanées** et visibles par les autres utilisateurs.`
      },
      {
        question: "Puis-je supprimer mon compte ?",
        answer: `**Oui.** Vous avez un **droit à l'oubli** (RGPD).

**Procédure** : Allez dans **"Paramètres"** → **"Mon compte"** → **"Supprimer mon compte"**

**Conséquences** : Votre profil est supprimé, vos projets archivés, vos candidatures annulées, vos données effacées sous 30 jours.

**Alternative** : Vous pouvez **désactiver temporairement** votre compte.`
      },
      {
        question: "Teriis est-il disponible sur mobile ?",
        answer: `**Actuellement** : Teriis est une **application web responsive**, optimisée pour mobile (navigateur).

**Phase 2** : Application mobile native (iOS + Android) avec notifications push, mode hors ligne, géolocalisation automatique.

**En attendant** : Ajoutez Teriis à votre écran d'accueil (PWA).`
      }
    ]
  },
  {
    title: "❓ Aide et support",
    icon: "❓",
    items: [
      {
        question: "J'ai un problème technique, qui contacter ?",
        answer: `**Support technique** :
- **Email** : support@teriis.fr
- **Chat** : Bulle de chat en bas à droite (9h-18h)

**Délai de réponse** :
- Chat : 5-10 minutes (heures ouvrées)
- Email : 24-48h`
      },
      {
        question: "Comment proposer une nouvelle fonctionnalité ?",
        answer: `Nous adorons vos idées ! 🚀

**Méthodes** :
1. **Forum communautaire** : forum.teriis.fr → Section "Idées & Suggestions"
2. **Email** : idees@teriis.fr
3. **Sondages réguliers** : Nous vous sollicitons pour co-construire la roadmap

**Votre avis compte** : Teriis se construit avec vous !`
      }
    ]
  }
];

function AccordionItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <button
        className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        onClick={onClick}
      >
        <span className="font-semibold text-neutral-900 pr-8">{question}</span>
        <svg
          className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-line">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = searchQuery
    ? faqData.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : faqData;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50/30 py-20 px-4">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Foire Aux Questions
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
              Toutes les réponses sur Teriis, le matching territorial entre projets et talents
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-lg"
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 px-4">
          <div className="container-custom max-w-4xl mx-auto">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-neutral-600">Aucune question ne correspond à votre recherche.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {filteredData.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                      <span className="text-3xl">{section.icon}</span>
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <AccordionItem
                          key={itemIndex}
                          question={item.question}
                          answer={item.answer}
                          isOpen={!!openItems[`${sectionIndex}-${itemIndex}`]}
                          onClick={() => toggleItem(sectionIndex, itemIndex)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="container-custom max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-xl mb-10 text-primary-100">
              Notre équipe est là pour vous aider
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="min-w-[200px] bg-white hover:bg-neutral-50 text-primary-600">
                  Nous contacter
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="ghost" size="lg" className="min-w-[200px] text-white border-white hover:bg-primary-700">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
