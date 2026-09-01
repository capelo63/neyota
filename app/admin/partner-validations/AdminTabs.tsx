'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PartnerValidationsList from './PartnerValidationsList';
import RegistrationsList from './RegistrationsList';
import type { PartnerApplication } from './page';

type Props = {
  applications: PartnerApplication[];
};

export default function AdminTabs({ applications }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'validations' | 'inscriptions'>(
    searchParams.get('tab') === 'inscriptions' ? 'inscriptions' : 'validations'
  );

  return (
    <div>
      {/* Onglets */}
      <div className="flex border-b border-neutral-200 mb-8">
        <button
          onClick={() => setActiveTab('validations')}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'validations'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Demandes partenaires
          {applications.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {applications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('inscriptions')}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'inscriptions'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Inscriptions
        </button>
      </div>

      {activeTab === 'validations' && <PartnerValidationsList applications={applications} />}
      {activeTab === 'inscriptions' && <RegistrationsList />}
    </div>
  );
}
