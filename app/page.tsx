/**
 * Page d'accueil avec système de bascule entre l'ancien design et le nouveau design Carbon
 *
 * Pour activer le nouveau design Carbon, ajoutez ?design=carbon à l'URL
 * Exemple : http://localhost:3000?design=carbon
 *
 * Pour revenir à l'ancien design, ajoutez ?design=legacy à l'URL
 * Exemple : http://localhost:3000?design=legacy
 */

import { redirect } from 'next/navigation';
import HomeCarbonPage from './page.carbon';

// Import dynamique de la page legacy pour éviter les imports inutiles
async function HomeLegacyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { default: LegacyPage } = await import('./page.legacy');
  return <LegacyPage searchParams={searchParams} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Vérifier si l'utilisateur veut utiliser le design Carbon
  const design = params.design;

  // Par défaut, utiliser le nouveau design Carbon
  // Pour revenir à l'ancien design, ajouter ?design=legacy à l'URL
  const useCarbonDesign = design !== 'legacy';

  if (useCarbonDesign) {
    return <HomeCarbonPage searchParams={searchParams} />;
  } else {
    return <HomeLegacyPage searchParams={searchParams} />;
  }
}

// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;
