import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navigation />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
