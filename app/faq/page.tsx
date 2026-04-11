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
    title: "Fonctionnement général",
    icon: "🎯",
    items: [
      {
        question: "Qu'est-ce que Teriis ?",
        answer: (
          <div>
            <p>Teriis est une plateforme gratuite de mise en relation entre porteurs de projets (entrepreneurs, créateurs) et talents locaux (développeurs, designers, marketeurs, etc.) souhaitant s'investir dans des initiatives à impact territorial.</p>
            <p className="mt-3">Notre mission : dynamiser les territoires en favorisant l'entrepreneuriat de proximité et la collaboration locale.</p>
          </div>
        )
      },
      {
        question: "Comment fonctionne la plateforme ?",
        answer: (
          <div>
            <p className="mb-3">Le fonctionnement de Teriis est simple et intuitif :</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Les porteurs de projets publient leurs projets avec les compétences recherchées</li>
              <li>Les talents créent leur profil et indiquent leurs compétences</li>
              <li>Notre algorithme suggère automatiquement des matchs basés sur la proximité géographique, les compétences et la phase du projet</li>
              <li>Les talents candidatent aux projets qui les intéressent</li>
              <li>Les porteurs de projets sélectionnent les talents et démarrent la collaboration</li>
            </ol>
          </div>
        )
      },
      {
        question: "Qui peut utiliser Teriis ?",
        answer: (
          <div>
            <p className="mb-3">Teriis est ouvert à tous !</p>
            <p className="mb-2"><strong>Porteurs de projets :</strong> entrepreneurs, créateurs, associatifs, indépendants</p>
            <p className="mb-2"><strong>Talents :</strong> salariés en quête de sens, freelances, étudiants, retraités actifs, experts bénévoles</p>
            <p className="mb-2"><strong>Toutes les phases :</strong> de l'idée sur papier au projet en croissance</p>
            <p><strong>Tous les secteurs :</strong> tech, social, environnemental, artisanat, services, etc.</p>
          </div>
        )
      },
      {
        question: "Est-ce que Teriis est vraiment 100% gratuit ?",
        answer: (
          <div>
            <p className="mb-3">Oui, absolument ! Teriis est et restera 100% gratuit pour les porteurs de projets et les talents.</p>
            <p className="mb-3">Cela inclut :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>La création et publication de projets (illimité)</li>
              <li>Les candidatures (illimitées)</li>
              <li>Toutes les fonctionnalités principales</li>
            </ul>
            <p>Notre modèle repose sur des subventions publiques, du mécénat d'entreprise et des partenariats avec des incubateurs et écoles, pas sur les utilisateurs.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Pour les porteurs de projets",
    icon: "💡",
    items: [
      {
        question: "Comment créer mon premier projet sur Teriis ?",
        answer: (
          <div>
            <p className="mb-3">Créer votre projet est simple :</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Connectez-vous à votre compte</li>
              <li>Allez dans "Mes projets" puis "Créer un projet"</li>
              <li>Remplissez les informations : titre, pitch court, description complète, phase du projet, compétences recherchées, localisation</li>
              <li>Publiez votre projet</li>
              <li>Les talents correspondant à votre recherche recevront une notification</li>
            </ol>
          </div>
        )
      },
      {
        question: "À quelle phase de mon projet puis-je utiliser la plateforme ?",
        answer: (
          <div>
            <p className="mb-3">Teriis accompagne votre projet à toutes les phases :</p>
            <ul className="space-y-2">
              <li><strong>💭 Idéation :</strong> Vous avez une idée et cherchez des co-fondateurs</li>
              <li><strong>🛠 MVP :</strong> Vous développez votre prototype</li>
              <li><strong>🚀 Lancement :</strong> Vous êtes prêt à lancer</li>
              <li><strong>📈 Croissance :</strong> Vous scalez votre activité</li>
              <li><strong>🏗 Structuration :</strong> Vous professionnalisez votre organisation</li>
            </ul>
          </div>
        )
      },
      {
        question: "Comment trouver les bons talents pour mon projet ?",
        answer: (
          <div>
            <p className="mb-3">Notre algorithme travaille pour vous de trois manières :</p>
            <p className="mb-2"><strong>Matching automatique :</strong> Les talents avec les compétences recherchées reçoivent une notification de votre projet</p>
            <p className="mb-2"><strong>Recherche manuelle :</strong> Vous pouvez chercher des talents par compétences et localisation</p>
            <p className="mb-3"><strong>Candidatures spontanées :</strong> Les talents peuvent candidater même s'ils ne matchent pas à 100%</p>
            <p className="text-sm italic">Astuce : Plus votre description est précise, plus vous attirerez les bons profils.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Pour les talents",
    icon: "🚀",
    items: [
      {
        question: "Quelles compétences puis-je proposer ?",
        answer: (
          <div>
            <p className="mb-3">Toutes les compétences sont bienvenues ! Voici quelques exemples par catégorie :</p>
            <p className="mb-1"><strong>💻 Tech & Digital :</strong> Développement web/mobile, Design UI/UX, Data science, DevOps</p>
            <p className="mb-1"><strong>📣 Marketing & Communication :</strong> Community management, Content marketing, SEO</p>
            <p className="mb-1"><strong>💼 Business & Stratégie :</strong> Business development, Levée de fonds, Juridique</p>
            <p className="mb-1"><strong>🎨 Créatif & Contenu :</strong> Vidéo, photo, Rédaction, Illustration</p>
            <p className="mt-3">Vous pouvez également ajouter des compétences personnalisées si elles n'apparaissent pas dans notre liste.</p>
          </div>
        )
      },
      {
        question: "Comment candidater à un projet ?",
        answer: (
          <div>
            <p className="mb-3">Le processus de candidature est simple :</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Explorez les projets suggérés ou utilisez la recherche</li>
              <li>Cliquez sur un projet pour voir le pitch court</li>
              <li>Si cela vous intéresse, cliquez sur "Candidater"</li>
              <li>Acceptez la charte éthique (respect de la confidentialité)</li>
              <li>Rédigez une lettre de motivation courte</li>
              <li>Validez votre candidature</li>
            </ol>
            <p className="mt-3">Le porteur de projet recevra une notification et pourra consulter votre profil.</p>
          </div>
        )
      },
      {
        question: "Les missions sont-elles rémunérées ?",
        answer: (
          <div>
            <p className="mb-3">Cela dépend du projet ! Teriis accueille tous les types de collaboration :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li><strong>Bénévolat / Pro bono :</strong> Vous aidez par passion ou pour l'impact</li>
              <li><strong>Rémunération :</strong> Salaire ou honoraires</li>
              <li><strong>Equity / Parts :</strong> Vous devenez associé(e)</li>
              <li><strong>Mixte :</strong> Petit salaire + equity</li>
              <li><strong>Troc de compétences :</strong> Échange de services</li>
            </ul>
            <p>Les modalités sont négociées librement entre vous et le porteur de projet.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Protection des idées et sécurité",
    icon: "🔒",
    items: [
      {
        question: "Comment mes idées de projet sont-elles protégées ?",
        answer: (
          <div>
            <p className="mb-3">La protection de vos idées est une priorité absolue. Nous avons mis en place plusieurs mécanismes :</p>
            <p className="mb-2"><strong>Visibilité progressive :</strong> Seul un pitch court (2-3 lignes) est visible publiquement. La description complète n'est accessible qu'aux talents ayant candidaté ET accepté la charte éthique.</p>
            <p className="mb-2"><strong>Charte éthique obligatoire :</strong> Avant de voir les détails d'un projet, les talents doivent s'engager au respect de la confidentialité, à l'interdiction de copier ou voler des idées, et à un engagement de bonne foi.</p>
            <p className="mb-2"><strong>Système de signalement :</strong> Si vous constatez un vol d'idée ou un comportement malveillant, vous pouvez signaler l'utilisateur.</p>
            <p><strong>NDA optionnel :</strong> Vous pouvez demander aux talents sélectionnés de signer un NDA avant d'échanger des informations sensibles.</p>
          </div>
        )
      },
      {
        question: "Qu'est-ce que la charte éthique ?",
        answer: (
          <div>
            <p className="mb-3">La charte éthique est un engagement moral que tous les utilisateurs acceptent.</p>
            <p className="mb-3"><strong>Pour les talents :</strong> Respect de la confidentialité des projets consultés, interdiction de copier ou détourner des idées, engagement de bonne foi dans les collaborations, professionnalisme et respect.</p>
            <p className="mb-3"><strong>Pour les porteurs de projets :</strong> Transparence sur les conditions de collaboration, respect des talents, reconnaissance du travail fourni.</p>
            <p>Teriis repose sur la confiance. Sans cette charte, la plateforme ne pourrait pas fonctionner sainement.</p>
          </div>
        )
      },
      {
        question: "Mes données personnelles sont-elles sécurisées ?",
        answer: (
          <div>
            <p className="mb-3">Absolument. Teriis respecte le RGPD et protège vos données avec soin.</p>
            <p className="mb-3"><strong>Sécurité technique :</strong> Hébergement sécurisé (Supabase + Vercel), chiffrement des données sensibles, authentification sécurisée, sauvegardes quotidiennes.</p>
            <p className="mb-3"><strong>Vos droits :</strong> Vous pouvez consulter, modifier, supprimer ou exporter vos données à tout moment.</p>
            <p className="font-semibold">Nous ne vendons JAMAIS vos données à des tiers.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Géolocalisation et territoire",
    icon: "📍",
    items: [
      {
        question: "Comment fonctionne le matching géographique ?",
        answer: (
          <div>
            <p className="mb-3">Notre système de géolocalisation repose sur trois éléments :</p>
            <p className="mb-2"><strong>Votre localisation :</strong> Ville ou région renseignée dans votre profil</p>
            <p className="mb-2"><strong>Rayon de recherche :</strong> Vous choisissez la distance maximale (10 km, 50 km, 100 km, région, France entière)</p>
            <p className="mb-3"><strong>Calcul de distance :</strong> Notre algorithme calcule la distance "à vol d'oiseau" entre vous et les projets ou talents</p>
            <p className="text-sm italic">Exemple : Vous êtes à Lyon et cherchez dans un rayon de 50 km → Les talents de Lyon, Villeurbanne et Vénissieux verront votre projet en priorité.</p>
          </div>
        )
      },
      {
        question: "Puis-je chercher des talents en dehors de ma région ?",
        answer: (
          <div>
            <p className="mb-3">Oui ! Vous avez le choix entre trois options :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li><strong>Local strict :</strong> Votre ville/agglomération (10-30 km)</li>
              <li><strong>Régional :</strong> Votre région administrative</li>
              <li><strong>National :</strong> Toute la France</li>
            </ul>
            <p>Privilégier le local facilite les rencontres physiques, favorise l'ancrage territorial et maximise l'impact local. Cependant, si vous cherchez une compétence rare, élargir géographiquement peut être pertinent (le télétravail est possible !).</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Positionnement",
    icon: "🆚",
    items: [
      {
        question: "Pourquoi Teriis alors qu'il existe déjà des incubateurs comme Alter'Incub ?",
        answer: (
          <div>
            <p className="mb-4">Excellente question ! Teriis ne cherche pas à concurrencer les incubateurs RSE territoriaux, mais à combler un vide spécifique.</p>

            <p className="font-semibold mb-2">Ce qui différencie Teriis des incubateurs :</p>
            <ul className="space-y-2 mb-4">
              <li><strong>✅ Accessible sans sélection :</strong> Pas de dossier, pas de jury. Inscription libre pour tous les projets.</li>
              <li><strong>⚡ Instantané :</strong> Trouvez des talents en quelques heures, sans attendre les appels à projets semestriels.</li>
              <li><strong>🎯 Matching de talents pairs :</strong> Mise en relation avec des talents locaux engagés, pas uniquement des mentors experts.</li>
              <li><strong>💚 100% gratuit, 0% equity :</strong> Aucuns frais, aucune prise de capital.</li>
              <li><strong>🌱 Dès l'idéation :</strong> Accepte les projets dès l'idée sur papier, sans exiger de MVP.</li>
            </ul>

            <p className="font-semibold mb-2">Complémentarité :</p>
            <p className="mb-3">Teriis ne remplace pas les incubateurs, il complète l'écosystème. Vous pouvez être incubé chez Alter'Incub ET utiliser Teriis pour recruter un développeur local. Les incubateurs peuvent d'ailleurs devenir partenaires de Teriis.</p>

            <p className="bg-primary-50 border-l-4 border-primary-600 p-3 italic">
              "Teriis ne concurrence personne, il comble un vide : le matching territorial instantané et gratuit entre projets et talents."
            </p>
          </div>
        )
      }
    ]
  },
  {
    title: "Modèle économique",
    icon: "💰",
    items: [
      {
        question: "Comment Teriis se finance-t-il ?",
        answer: (
          <div>
            <p className="mb-3">Teriis repose sur un modèle économique vertueux, sans faire payer les utilisateurs :</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li><strong>60%</strong> Subventions publiques (Régions, BPI, fonds européens)</li>
              <li><strong>25%</strong> Partenariats B2B (Incubateurs, écoles, cabinets)</li>
              <li><strong>10%</strong> Mécénat d'entreprise (RSE, fondations)</li>
              <li><strong>5%</strong> Services premium optionnels (boost visibilité, analytics)</li>
            </ul>
            <p>Les utilisateurs ne paient jamais pour les fonctionnalités essentielles.</p>
          </div>
        )
      },
      {
        question: "Pourquoi créer une plateforme gratuite ?",
        answer: (
          <div>
            <p className="mb-3">Parce que l'argent ne doit pas être un frein à l'entrepreneuriat et à l'engagement local.</p>
            <p className="mb-3">Notre conviction : Les talents ont des compétences, pas forcément de budget. Les porteurs de projets en phase idéation n'ont souvent pas de trésorerie. L'impact territorial bénéficie à tous, pas seulement aux utilisateurs.</p>
            <p>Notre modèle : Les bénéficiaires indirects (Régions, incubateurs, entreprises) financent la plateforme. Les utilisateurs en profitent gratuitement. Tout le monde y gagne.</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Utilisation pratique",
    icon: "⚙️",
    items: [
      {
        question: "Comment modifier mon profil ?",
        answer: (
          <div>
            <ol className="list-decimal list-inside space-y-2">
              <li>Connectez-vous à votre compte</li>
              <li>Cliquez sur votre avatar (en haut à droite) puis "Mon profil"</li>
              <li>Cliquez sur "Modifier"</li>
              <li>Changez les informations souhaitées : bio, compétences, localisation, photo, disponibilité</li>
              <li>Enregistrez les modifications</li>
            </ol>
            <p className="mt-3">Vos modifications sont instantanées et visibles par les autres utilisateurs.</p>
          </div>
        )
      },
      {
        question: "Puis-je supprimer mon compte ?",
        answer: (
          <div>
            <p className="mb-3">Oui, vous avez un droit à l'oubli (RGPD).</p>
            <p className="mb-3"><strong>Procédure :</strong> Allez dans "Paramètres" → "Mon compte" → "Supprimer mon compte". Cette action est irréversible.</p>
            <p className="mb-3"><strong>Conséquences :</strong> Votre profil sera supprimé, vos projets archivés (ou transférés si vous avez des co-fondateurs), vos candidatures annulées, et vos données personnelles effacées sous 30 jours.</p>
            <p><strong>Alternative :</strong> Vous pouvez désactiver temporairement votre compte (réactivable à tout moment).</p>
          </div>
        )
      },
      {
        question: "Teriis est-il disponible sur mobile ?",
        answer: (
          <div>
            <p className="mb-3"><strong>Actuellement :</strong> Teriis est une application web responsive, optimisée pour les navigateurs mobiles.</p>
            <p className="mb-3"><strong>Bientôt (Phase 2) :</strong> Application mobile native pour iOS et Android avec notifications push, mode hors ligne et géolocalisation automatique.</p>
            <p>En attendant, vous pouvez ajouter Teriis à votre écran d'accueil comme une PWA (Progressive Web App).</p>
          </div>
        )
      }
    ]
  },
  {
    title: "Aide et support",
    icon: "❓",
    items: [
      {
        question: "J'ai un problème technique, qui contacter ?",
        answer: (
          <div>
            <p className="mb-3"><strong>Support technique :</strong></p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li><strong>Email :</strong> support@teriis.fr</li>
              <li><strong>Chat :</strong> Bulle de chat en bas à droite (heures ouvrées 9h-18h)</li>
            </ul>
            <p className="mb-2"><strong>Délai de réponse :</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chat : 5-10 minutes (pendant les heures ouvrées)</li>
              <li>Email : 24-48h</li>
            </ul>
          </div>
        )
      },
      {
        question: "Comment proposer une nouvelle fonctionnalité ?",
        answer: (
          <div>
            <p className="mb-3">Nous adorons vos idées !</p>
            <p className="mb-3"><strong>Méthodes pour nous faire part de vos suggestions :</strong></p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Email : idees@teriis.fr</li>
              <li>Sondages réguliers où nous vous sollicitons pour co-construire la roadmap</li>
            </ul>
            <p className="italic">Votre avis compte : Teriis se construit avec vous !</p>
          </div>
        )
      }
    ]
  }
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
