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

// Mapping département code → region label (same as CityAutocomplete)
export const DEPT_TO_REGION: Record<string, string> = {
  '01': 'Auvergne-Rhône-Alpes', '03': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes',
  '15': 'Auvergne-Rhône-Alpes', '26': 'Auvergne-Rhône-Alpes', '38': 'Auvergne-Rhône-Alpes',
  '42': 'Auvergne-Rhône-Alpes', '43': 'Auvergne-Rhône-Alpes', '63': 'Auvergne-Rhône-Alpes',
  '69': 'Auvergne-Rhône-Alpes', '73': 'Auvergne-Rhône-Alpes', '74': 'Auvergne-Rhône-Alpes',
  '21': 'Bourgogne-Franche-Comté', '25': 'Bourgogne-Franche-Comté', '39': 'Bourgogne-Franche-Comté',
  '58': 'Bourgogne-Franche-Comté', '70': 'Bourgogne-Franche-Comté', '71': 'Bourgogne-Franche-Comté',
  '89': 'Bourgogne-Franche-Comté', '90': 'Bourgogne-Franche-Comté',
  '22': 'Bretagne', '29': 'Bretagne', '35': 'Bretagne', '56': 'Bretagne',
  '18': 'Centre-Val de Loire', '28': 'Centre-Val de Loire', '36': 'Centre-Val de Loire',
  '37': 'Centre-Val de Loire', '41': 'Centre-Val de Loire', '45': 'Centre-Val de Loire',
  '2A': 'Corse', '2B': 'Corse',
  '08': 'Grand Est', '10': 'Grand Est', '51': 'Grand Est', '52': 'Grand Est',
  '54': 'Grand Est', '55': 'Grand Est', '57': 'Grand Est', '67': 'Grand Est',
  '68': 'Grand Est', '88': 'Grand Est',
  '02': 'Hauts-de-France', '59': 'Hauts-de-France', '60': 'Hauts-de-France',
  '62': 'Hauts-de-France', '80': 'Hauts-de-France',
  '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France',
  '91': 'Île-de-France', '92': 'Île-de-France', '93': 'Île-de-France',
  '94': 'Île-de-France', '95': 'Île-de-France',
  '14': 'Normandie', '27': 'Normandie', '50': 'Normandie', '61': 'Normandie', '76': 'Normandie',
  '16': 'Nouvelle-Aquitaine', '17': 'Nouvelle-Aquitaine', '19': 'Nouvelle-Aquitaine',
  '23': 'Nouvelle-Aquitaine', '24': 'Nouvelle-Aquitaine', '33': 'Nouvelle-Aquitaine',
  '40': 'Nouvelle-Aquitaine', '47': 'Nouvelle-Aquitaine', '64': 'Nouvelle-Aquitaine',
  '79': 'Nouvelle-Aquitaine', '86': 'Nouvelle-Aquitaine', '87': 'Nouvelle-Aquitaine',
  '09': 'Occitanie', '11': 'Occitanie', '12': 'Occitanie', '30': 'Occitanie',
  '31': 'Occitanie', '32': 'Occitanie', '34': 'Occitanie', '46': 'Occitanie',
  '48': 'Occitanie', '65': 'Occitanie', '66': 'Occitanie', '81': 'Occitanie', '82': 'Occitanie',
  '44': 'Pays de la Loire', '49': 'Pays de la Loire', '53': 'Pays de la Loire',
  '72': 'Pays de la Loire', '85': 'Pays de la Loire',
  '04': "Provence-Alpes-Côte d'Azur", '05': "Provence-Alpes-Côte d'Azur",
  '06': "Provence-Alpes-Côte d'Azur", '13': "Provence-Alpes-Côte d'Azur",
  '83': "Provence-Alpes-Côte d'Azur", '84': "Provence-Alpes-Côte d'Azur",
  // Outre-mer
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '975': 'Saint-Pierre-et-Miquelon',
  '976': 'Mayotte', '977': 'Saint-Barthélemy', '978': 'Saint-Martin',
};

/**
 * Returns the region label from a French postal code.
 * Falls back to empty string if not found.
 */
export function getRegionLabelFromPostal(postalCode: string): string {
  if (!postalCode) return '';
  const dept3 = postalCode.substring(0, 3);
  if (dept3 in DEPT_TO_REGION) return DEPT_TO_REGION[dept3];
  const dept2 = postalCode.substring(0, 2);
  return DEPT_TO_REGION[dept2] || '';
}

/** Strips diacritics and normalizes apostrophes for robust comparison. */
function normalizeForCompare(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc]/g, "'"); // curly/modifier apostrophes → straight
}

/**
 * Returns the region slug (e.g. 'provence-alpes-cote-azur') from a postal code.
 * Comparison is done on normalized strings to be immune to accent/apostrophe variants.
 * Falls back to empty string if not found.
 */
export function getRegionSlugFromPostal(postalCode: string): string {
  const label = getRegionLabelFromPostal(postalCode);
  if (!label) return '';
  const normLabel = normalizeForCompare(label);
  const entry = (FRENCH_REGIONS as readonly { value: string; label: string }[])
    .find(r => normalizeForCompare(r.label) === normLabel);
  return entry?.value ?? '';
}

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
