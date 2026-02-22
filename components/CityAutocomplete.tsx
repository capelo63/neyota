'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AddressSuggestion {
  label: string;       // "Paris 8e Arrondissement (75008)"
  city: string;        // "Paris 8e Arrondissement"
  postalCode: string;  // "75008"
  region: string;      // "Île-de-France" (when available)
  lat: number;
  lng: number;
}

interface CityAutocompleteProps {
  cityValue: string;
  postalCodeValue: string;
  onSelect: (suggestion: AddressSuggestion) => void;
  cityLabel?: string;
  postalLabel?: string;
  cityPlaceholder?: string;
  postalPlaceholder?: string;
  cityError?: string;
  postalError?: string;
  layout?: 'row' | 'column';
}

// Map departement codes to regions
const DEPT_TO_REGION: Record<string, string> = {
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

function getRegionFromPostal(postalCode: string): string {
  const deptCode = postalCode.substring(0, 3);
  if (deptCode in DEPT_TO_REGION) return DEPT_TO_REGION[deptCode];
  const deptCode2 = postalCode.substring(0, 2);
  return DEPT_TO_REGION[deptCode2] || '';
}

export default function CityAutocomplete({
  cityValue,
  postalCodeValue,
  onSelect,
  cityLabel = 'Ville',
  postalLabel = 'Code postal',
  cityPlaceholder = 'Entrez votre ville...',
  postalPlaceholder = '75001',
  cityError,
  postalError,
  layout = 'row',
}: CityAutocompleteProps) {
  const [cityInput, setCityInput] = useState(cityValue);
  const [postalInput, setPostalInput] = useState(postalCodeValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<'city' | 'postal' | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external value changes
  useEffect(() => {
    setCityInput(cityValue);
  }, [cityValue]);

  useEffect(() => {
    setPostalInput(postalCodeValue);
  }, [postalCodeValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveField(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string, type: 'city' | 'postal') => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchType = type === 'postal' ? 'postcode' : 'municipality';
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=${searchType}&limit=8&autocomplete=1`;
      const response = await fetch(url);
      const data = await response.json();

      const results: AddressSuggestion[] = (data.features || []).map((feature: any) => {
        const props = feature.properties;
        const postalCode = props.postcode || props.citycode || '';
        const region = getRegionFromPostal(postalCode);
        return {
          label: `${props.city} (${postalCode})`,
          city: props.city || props.label,
          postalCode,
          region,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
        };
      });

      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCityChange = (value: string) => {
    setCityInput(value);
    setActiveField('city');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value, 'city'), 300);
  };

  const handlePostalChange = (value: string) => {
    setPostalInput(value);
    setActiveField('postal');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value, 'postal'), 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setCityInput(suggestion.city);
    setPostalInput(suggestion.postalCode);
    setIsOpen(false);
    setActiveField(null);
    setSuggestions([]);
    onSelect(suggestion);
  };

  const containerClass = layout === 'row'
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
    : 'flex flex-col gap-4';

  return (
    <div ref={containerRef} className="relative">
      <div className={containerClass}>
        {/* City Input */}
        <div>
          {cityLabel && (
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {cityLabel}
            </label>
          )}
          <div className="relative">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => handleCityChange(e.target.value)}
              onFocus={() => {
                setActiveField('city');
                if (cityInput.length >= 2) fetchSuggestions(cityInput, 'city');
              }}
              placeholder={cityPlaceholder}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                cityError
                  ? 'border-error-500 bg-error-50'
                  : 'border-neutral-300 bg-white hover:border-neutral-400'
              }`}
              autoComplete="off"
            />
            {isLoading && activeField === 'city' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {cityError && (
            <p className="mt-1 text-xs text-error-600">{cityError}</p>
          )}
        </div>

        {/* Postal Code Input */}
        <div>
          {postalLabel && (
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {postalLabel}
            </label>
          )}
          <div className="relative">
            <input
              type="text"
              value={postalInput}
              onChange={(e) => handlePostalChange(e.target.value)}
              onFocus={() => {
                setActiveField('postal');
                if (postalInput.length >= 2) fetchSuggestions(postalInput, 'postal');
              }}
              placeholder={postalPlaceholder}
              maxLength={5}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                postalError
                  ? 'border-error-500 bg-error-50'
                  : 'border-neutral-300 bg-white hover:border-neutral-400'
              }`}
              autoComplete="off"
            />
            {isLoading && activeField === 'postal' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {postalError && (
            <p className="mt-1 text-xs text-error-600">{postalError}</p>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur before click
                handleSelect(suggestion);
              }}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 focus:bg-primary-50 transition-colors border-b border-neutral-100 last:border-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-neutral-900 text-sm">
                    {suggestion.city}
                  </span>
                  <span className="ml-2 text-xs text-neutral-500 font-mono">
                    {suggestion.postalCode}
                  </span>
                </div>
                {suggestion.region && (
                  <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    {suggestion.region}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
