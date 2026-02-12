import type { Metadata } from "next";
import "./globals.css";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL('https://neyota.vercel.app'),
  title: {
    default: "NEYOTA - Ensemble, faisons vivre nos territoires",
    template: "%s | NEYOTA"
  },
  description: "Plateforme de mise en relation entre porteurs de projets entrepreneuriaux et talents locaux. 100% gratuit • 100% territorial • 100% impact. Trouvez les compétences près de chez vous.",
  keywords: [
    "entrepreneuriat local",
    "talents territoriaux",
    "mise en relation",
    "projets locaux",
    "économie territoriale",
    "compétences locales",
    "startup française",
    "impact territorial",
    "collaboration locale",
    "économie de proximité"
  ],
  authors: [{ name: "NEYOTA" }],
  creator: "NEYOTA",
  publisher: "NEYOTA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://neyota.vercel.app',
    siteName: 'NEYOTA',
    title: 'NEYOTA - Ensemble, faisons vivre nos territoires',
    description: 'Plateforme de mise en relation entre porteurs de projets entrepreneuriaux et talents locaux. 100% gratuit • 100% territorial • 100% impact.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NEYOTA - Plateforme territoriale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEYOTA - Ensemble, faisons vivre nos territoires',
    description: 'Plateforme de mise en relation entre porteurs de projets et talents locaux. 100% gratuit • 100% territorial • 100% impact.',
    images: ['/og-image.png'],
    creator: '@neyota',
  },
  alternates: {
    canonical: 'https://neyota.vercel.app',
  },
  verification: {
    google: 'verification_token_here', // À remplacer par votre token Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
