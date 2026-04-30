import Navigation from '@/components/Navigation';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
