import Link from 'next/link';

export default function SettingsPage() {
  const items = [
    {
      href: '/settings/email-preferences',
      icon: (
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      title: 'Préférences emails',
      description: 'Gérez vos notifications et la fréquence des résumés envoyés par email.',
    },
    {
      href: '/settings/partner-visibility',
      icon: (
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Visibilité partenaires',
      description: 'Choisissez si des partenaires institutionnels ou commerciaux peuvent consulter votre profil.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">Paramètres</h1>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 flex items-start gap-4 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex-shrink-0 w-11 h-11 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                  {item.title}
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">{item.description}</p>
              </div>
              <svg className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-1 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
