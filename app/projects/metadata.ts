import { Metadata } from 'next';

export const projectsMetadata: Metadata = {
  title: 'Projets disponibles',
  description:
    'Découvrez les projets entrepreneuriaux de votre territoire. Proposez vos compétences et participez au développement local.',
  keywords: [
    'projets locaux',
    'opportunités entrepreneuriales',
    'compétences recherchées',
    'collaboration territoriale',
    'économie locale',
  ],
  openGraph: {
    title: 'Projets disponibles sur TERRII',
    description:
      'Découvrez les projets entrepreneuriaux de votre territoire et proposez vos compétences.',
    type: 'website',
    url: 'https://neyota.vercel.app/projects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projets disponibles sur TERRII',
    description:
      'Découvrez les projets entrepreneuriaux de votre territoire et proposez vos compétences.',
  },
  alternates: {
    canonical: 'https://neyota.vercel.app/projects',
  },
};
