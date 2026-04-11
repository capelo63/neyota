'use client';

import Link from 'next/link';
import { useState, ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';

interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface FAQSection {
  title: string;
  icon: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: "À propos de Teriis",
    icon: "💡",
    items: [
      {
        question: "Que signifie Teriis ?",
        answer: (
          <div>
            <p className="mb-3">Teriis signifie <strong>TERritoires, Initiatives et Innovation sociale</strong>.</p>
            <p className="mb-3">La plateforme est née d'une conviction simple : les projets qui font bouger les lignes émergent souvent au cœur des territoires, portés par des personnes engagées et des compétences prêtes à s'impliquer.</p>
            <p>Teriis facilite ces rencontres pour faire émerger des initiatives utiles, concrètes et positives.</p>
          </div>
        )
      },
      {
        question: "Quel est le but de Teriis ?",
        answer: (
          <div>
            <p className="mb-3">Teriis facilite la mise en relation entre des porteurs de projet et des talents qui souhaitent s'engager.</p>
            <p><strong>L'objectif :</strong> permettre à chacun de trouver simplement les bonnes personnes pour donner vie à une idée, faire avancer un projet, partager ses compétences et contribuer à des initiatives locales.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Accès et modèle",
    icon: "🆓",
    items: [
      {
        question: "L'inscription est-elle gratuite ?",
        answer: (
          <div>
            <p className="mb-3">Oui, l'inscription et l'utilisation de Teriis sont <strong>100% gratuites</strong> pour les porteurs de projet et les talents.</p>
            <p className="mb-3">Nous faisons le choix de rendre les opportunités accessibles à tous, sans barrière financière.</p>
            <p>La plateforme repose sur un modèle solide, en lien avec des acteurs engagés dans le développement des territoires, afin de garantir cet accès dans la durée.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Fonctionnement de la plateforme",
    icon: "⚙️",
    items: [
      {
        question: "Pourquoi faut-il s'inscrire pour accéder aux projets en détail ?",
        answer: (
          <div>
            <p className="mb-3">L'inscription permet de garantir un cadre de confiance pour tous les membres.</p>
            <p className="mb-3">Elle protège les projets et les informations partagées, tout en s'assurant que chaque personne s'inscrit dans une démarche sincère et respectueuse.</p>
            <p>Elle permet aussi de vous proposer des contenus et des mises en relation adaptés à votre profil.</p>
          </div>
        )
      },
      {
        question: "Comment Teriis peut m'aider en tant que porteur de projet ?",
        answer: (
          <div>
            <p className="mb-3">Teriis vous permet de :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Trouver des compétences adaptées à vos besoins</li>
              <li>Gagner du temps dans votre recherche</li>
              <li>Rencontrer des personnes proches de vous et engagées</li>
            </ul>
            <p>Quel que soit votre stade d'avancement, vous pouvez trouver un accompagnement concret pour faire avancer votre projet.</p>
          </div>
        )
      },
      {
        question: "Comment Teriis peut m'aider en tant que talent ?",
        answer: (
          <div>
            <p className="mb-3">Teriis vous permet de :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Vous engager sur des projets qui ont du sens ou qui vous tiennent à cœur</li>
              <li>Mettre vos compétences au service d'initiatives locales</li>
              <li>Choisir les projets qui vous motivent, près de chez vous</li>
            </ul>
            <p>C'est une manière concrète de contribuer et de s'impliquer.</p>
          </div>
        )
      },
      {
        question: "Suis-je obligé de m'engager si je prends contact ?",
        answer: (
          <div>
            <p className="mb-3">Non. Teriis facilite les rencontres mais chacun reste libre de ses engagements.</p>
            <p className="mb-3">En revanche, nous encourageons des échanges respectueux, honnêtes et engagés.</p>
            <p>Prendre contact implique une forme de considération envers l'autre.</p>
          </div>
        )
      },
      {
        question: "Puis-je participer à plusieurs projets ?",
        answer: (
          <div>
            <p>Oui, vous êtes libre de vous engager dans un ou plusieurs projets, selon votre disponibilité et vos envies.</p>
          </div>
        )
      },
      {
        question: "Puis-je modifier mon profil ou mes besoins ?",
        answer: (
          <div>
            <p>Oui, votre profil et vos besoins peuvent être mis à jour à tout moment, afin de rester en phase avec votre situation et vos objectifs.</p>
          </div>
        )
      },
      {
        question: "Comment sont proposés les profils et les projets ?",
        answer: (
          <div>
            <p className="mb-3">Teriis met en relation des personnes en fonction de plusieurs critères : besoins, compétences, localisation et affinités.</p>
            <p>L'objectif est de vous faire gagner du temps en vous proposant des mises en relation pertinentes et utiles, sans recherche complexe.</p>
          </div>
        )
      },
      {
        question: "Pourquoi définir un territoire lors de l'inscription ?",
        answer: (
          <div>
            <p className="mb-3">Teriis repose sur une logique de proximité.</p>
            <p className="mb-3">En définissant votre zone d'action, vous :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Recevez des projets et profils proches de vous</li>
              <li>Facilitez les échanges et les collaborations concrètes</li>
              <li>Contribuez au développement de votre territoire</li>
            </ul>
            <p>Vous pouvez ajuster ce périmètre à tout moment.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Confiance et éthique",
    icon: "🤝",
    items: [
      {
        question: "Pourquoi existe-t-il une charte éthique ?",
        answer: (
          <div>
            <p className="mb-3">La charte éthique permet de garantir un cadre sain et respectueux pour tous.</p>
            <p className="mb-3">Elle repose sur des principes essentiels :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Respect des personnes</li>
              <li>Transparence</li>
              <li>Engagement sincère</li>
            </ul>
            <p>Elle contribue à créer un environnement de confiance, indispensable à des collaborations de qualité.</p>
          </div>
        )
      },
      {
        question: "Pourquoi dois-je accepter la charte éthique ?",
        answer: (
          <div>
            <p className="mb-3">En rejoignant Teriis, vous faites partie d'une communauté.</p>
            <p className="mb-3">Accepter la charte, c'est :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>S'engager à respecter les autres</li>
              <li>Partager des intentions honnêtes</li>
              <li>Contribuer à une dynamique positive</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    title: "À qui s'adresse Teriis ?",
    icon: "👥",
    items: [
      {
        question: "Porteur de projet",
        answer: (
          <div>
            <p>Vous avez une idée ou un projet et vous cherchez à passer à l'étape suivante : être conseillé, structurer votre activité ou trouver les bonnes personnes pour avancer et concrétiser votre concept.</p>
          </div>
        )
      },
      {
        question: "Talent",
        answer: (
          <div>
            <p>Vous avez de l'expérience ou des compétences et vous voulez les transmettre : aider un projet à se lancer, apporter un regard extérieur ou vous engager concrètement près de chez vous.</p>
          </div>
        )
      }
    ]
  },
];

function AccordionItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
      <button
        className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        onClick={onClick}
      >
        <span className="font-semibold text-neutral-900 pr-8">{question}</span>
        <svg
          className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="text-neutral-700 leading-relaxed">
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
          item.question.toLowerCase().includes(searchQuery.toLowerCase())
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
              Toutes les réponses sur Teriis, le matching territorial efficace entre projets et talents
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
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Réinitialiser la recherche
                </button>
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

      <Footer />
    </div>
  );
}
