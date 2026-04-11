import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12 px-4">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* Footer Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">T</span>
                  </div>
                  <span className="text-2xl font-bold text-white">Teriis</span>
                </div>
                <p className="text-primary-400 font-medium text-sm ml-12">
                  TERritoires, Initiatives et Innovation sociale
                </p>
              </div>
              <div className="text-neutral-400 text-sm space-y-2">
                <p>Mettre en relation celles et ceux qui veulent faire avancer des projets utiles, là où ils comptent vraiment.</p>
                <p>Mobiliser des personnes éloignées des opportunités et faciliter leur mise en relation avec des projets locaux.</p>
                <p>Connecter les initiatives, valoriser les compétences locales et encourager les rencontres.</p>
                <p className="font-medium text-neutral-300">Faire vivre les territoires, aujourd&apos;hui et pour demain.</p>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-white mb-3">Navigation</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold text-white mb-3">Suivre Teriis</h4>
              <ul className="space-y-2">
                <li className="text-neutral-400">LinkedIn</li>
                <li className="text-neutral-400">Instagram</li>
                <li className="text-neutral-400">Facebook</li>
                <li className="text-neutral-400">Bluesky</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-3">Informations</h4>
              <ul className="space-y-2">
                <li><Link href="/legal" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/charter" className="hover:text-white transition-colors">Charte éthique</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-neutral-800 text-center text-sm text-neutral-400">
            <p>© 2026 Teriis. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
