import React from 'react';

interface ProjectStructuredDataProps {
  project: {
    id: string;
    title: string;
    short_pitch: string;
    full_description: string;
    city: string;
    postal_code: string;
    created_at: string;
    owner: {
      first_name: string;
      last_name: string;
    };
  };
}

export function ProjectStructuredData({ project }: ProjectStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: project.title,
    description: project.full_description || project.short_pitch,
    datePosted: project.created_at,
    hiringOrganization: {
      '@type': 'Organization',
      name: `${project.owner.first_name} ${project.owner.last_name}`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.city,
        postalCode: project.postal_code,
        addressCountry: 'FR',
      },
    },
    employmentType: 'CONTRACTOR',
    url: `https://neyota.vercel.app/projects/${project.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NEYOTA',
    description:
      'Plateforme de mise en relation entre porteurs de projets entrepreneuriaux et talents locaux',
    url: 'https://neyota.vercel.app',
    logo: 'https://neyota.vercel.app/logo.png',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['French'],
    },
    sameAs: [
      // Ajoutez vos réseaux sociaux ici
      // 'https://twitter.com/neyota',
      // 'https://linkedin.com/company/neyota',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NEYOTA',
    url: 'https://neyota.vercel.app',
    description:
      'Plateforme de mise en relation entre porteurs de projets et talents locaux',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://neyota.vercel.app/projects?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
