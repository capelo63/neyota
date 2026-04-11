'use client';

import { useState } from 'react';

interface Value {
  icon: string;
  title: string;
  description: string;
}

const VALUES: Value[] = [
  {
    icon: '🎯',
    title: 'Agir localement, créer utile',
    description: 'Nous croyons en la force des territoires et des initiatives de proximité. Chaque projet mérite de se développer là où il peut avoir le plus d\'impact.'
  },
  {
    icon: '🤝',
    title: 'Confiance et respect',
    description: 'Nous construisons un cadre où chacun peut partager ses idées et ses compétences en toute confiance. L\'écoute, la bienveillance et l\'engagement mutuel sont essentiels à des collaborations durables.'
  },
  {
    icon: '🌍',
    title: 'Accessible à tous',
    description: 'Nous défendons un accès ouvert à l\'accompagnement et aux compétences. Quels que soient votre parcours ou vos moyens, vous devez pouvoir être aidé ou contribuer.'
  },
  {
    icon: '✨',
    title: 'Des rencontres qui font avancer',
    description: 'Nous facilitons des mises en relation utiles et pertinentes entre personnes qui peuvent réellement s\'apporter mutuellement, pour transformer une rencontre en collaboration concrète.'
  },
  {
    icon: '🌱',
    title: 'Un impact concret et visible',
    description: 'Nous valorisons les projets qui créent de la valeur réelle : économique, sociale ou environnementale. Chaque action compte et chaque réussite mérite d\'être visible.'
  },
  {
    icon: '🚀',
    title: 'Donner envie d\'agir',
    description: 'Nous encourageons le passage à l\'action et l\'engagement dans la durée, en valorisant les contributions de chacun au service des projets et des territoires.'
  }
];

export default function ValuesAccordion() {
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-4">
      {VALUES.map((value, index) => (
        <div
          key={index}
          className="border border-neutral-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
        >
          <button
            className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            onClick={() => toggleItem(index)}
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-4xl">{value.icon}</span>
              <span className="text-xl font-semibold text-neutral-900">{value.title}</span>
            </div>
            <svg
              className={`w-6 h-6 text-primary-600 flex-shrink-0 transition-transform ${
                openItems[index] ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems[index] && (
            <div className="px-6 py-5 bg-neutral-50 border-t border-neutral-200">
              <p className="text-neutral-700 leading-relaxed pl-14">
                {value.description}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
