// Régions françaises métropolitaines et d'outre-mer

export const FRENCH_REGIONS = [
  // Métropole (13 régions)
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { value: 'corse', label: 'Corse' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'hauts-de-france', label: 'Hauts-de-France' },
  { value: 'ile-de-france', label: 'Île-de-France' },
  { value: 'normandie', label: 'Normandie' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { value: 'provence-alpes-cote-azur', label: 'Provence-Alpes-Côte d\'Azur' },

  // Outre-mer (DROM + COM)
  { value: 'guadeloupe', label: 'Guadeloupe' },
  { value: 'martinique', label: 'Martinique' },
  { value: 'guyane', label: 'Guyane' },
  { value: 'la-reunion', label: 'La Réunion' },
  { value: 'mayotte', label: 'Mayotte' },
  { value: 'saint-pierre-et-miquelon', label: 'Saint-Pierre-et-Miquelon' },
  { value: 'saint-barthelemy', label: 'Saint-Barthélemy' },
  { value: 'saint-martin', label: 'Saint-Martin' },
  { value: 'wallis-et-futuna', label: 'Wallis-et-Futuna' },
  { value: 'polynesie-francaise', label: 'Polynésie française' },
  { value: 'nouvelle-caledonie', label: 'Nouvelle-Calédonie' },
] as const;

export type FrenchRegion = typeof FRENCH_REGIONS[number]['value'];

// Mapping des codes postaux vers les régions d'outre-mer
export const OVERSEAS_POSTAL_CODES = {
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Réunion',
  '975': 'Saint-Pierre-et-Miquelon',
  '976': 'Mayotte',
  '977': 'Saint-Barthélemy',
  '978': 'Saint-Martin',
  '986': 'Wallis-et-Futuna',
  '987': 'Polynésie française',
  '988': 'Nouvelle-Calédonie',
} as const;

/**
 * Validates French postal codes (metropolitan and overseas)
 * Metropolitan: 01000-95999 (excluding 96-99 which don't exist except Corsica)
 * Overseas: 971xx-978xx, 986xx-988xx
 */
export function isValidFrenchPostalCode(postalCode: string): boolean {
  if (!/^\d{5}$/.test(postalCode)) {
    return false;
  }

  const prefix = parseInt(postalCode.substring(0, 2));
  const threeDigit = parseInt(postalCode.substring(0, 3));

  // Metropolitan France (01-95, excluding some ranges)
  if (prefix >= 1 && prefix <= 95) {
    // 20 = Corsica (valid), but no 96-99 in metropolitan
    return true;
  }

  // Overseas territories (971-978, 986-988)
  if (threeDigit >= 971 && threeDigit <= 978) {
    return true;
  }

  if (threeDigit >= 986 && threeDigit <= 988) {
    return true;
  }

  return false;
}

/**
 * Gets the error message for invalid postal codes
 */
export function getPostalCodeErrorMessage(): string {
  return 'Code postal invalide. Métropole : 01000-95999. Outre-mer : 971xx-978xx, 986xx-988xx.';
}
