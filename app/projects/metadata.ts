import { Metadata } from 'next';

export const projectsMetadata: Metadata = {
  title: 'Projets disponibles',
  description:
    'Découvrez les projets d\'initiative de votre territoire. Proposez vos compétences et participez au développement local.',
  keywords: [
    'projets locaux',
    'opportunités d\'initiative',
    'compétences recherchées',
    'collaboration territoriale',
    'économie locale',
  ],
  openGraph: {
    title: 'Projets disponibles sur Terii',
    description:
      'Découvrez les projets d\'initiative de votre territoire et proposez vos compétences.',
    type: 'website',
    url: 'https://www.teriis.fr/projects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projets disponibles sur Terii',
    description:
      'Découvrez les projets d\'initiative de votre territoire et proposez vos compétences.',
  },
  alternates: {
    canonical: 'https://www.teriis.fr/projects',
  },
};
