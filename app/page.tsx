export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo/Brand */}
          <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-4">
            NEYOTA
          </h1>

          {/* Baseline */}
          <p className="text-2xl md:text-3xl text-gray-700 mb-6">
            Ensemble, faisons vivre nos territoires
          </p>

          {/* Manifesto */}
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-xl font-semibold text-green-700 mb-4">
              L&apos;entrepreneuriat qui fait vivre votre territoire
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous croyons que chaque territoire possède les talents nécessaires pour créer son avenir.
              NEYOTA connecte gratuitement les porteurs de projets et les talents locaux pour dynamiser
              l&apos;économie de proximité.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-green-700">
              <span className="flex items-center gap-2">
                <span className="text-2xl">✓</span> 100% gratuit
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">✓</span> 100% local
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">✓</span> 100% impact
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/signup?role=entrepreneur"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 text-lg"
            >
              💼 Je porte un projet
            </a>
            <a
              href="/signup?role=talent"
              className="bg-white hover:bg-gray-50 text-green-600 font-semibold py-4 px-8 rounded-lg shadow-lg border-2 border-green-600 transition-all transform hover:scale-105 text-lg"
            >
              🌟 Je cherche un projet
            </a>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Projets récents près de chez vous
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="text-sm text-green-600 font-medium mb-2">
                  📍 Rennes (35) • À 5 km
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Projet exemple #{i}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Description courte du projet qui permet de comprendre rapidement de quoi il s&apos;agit...
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Développement
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Design
                  </span>
                </div>
                <a href="#" className="text-green-600 font-medium hover:text-green-700">
                  Voir le projet →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Pourquoi NEYOTA ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Rapide</h3>
              <p className="text-gray-600">
                Trouvez les bons talents ou projets près de chez vous en quelques clics
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ciblé</h3>
              <p className="text-gray-600">
                Matching intelligent basé sur vos compétences, localisation et valeurs
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Humain</h3>
              <p className="text-gray-600">
                Focus sur la compatibilité humaine et l&apos;engagement territorial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Notre impact territorial
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">127</div>
              <div className="text-gray-600">Projets créés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">543</div>
              <div className="text-gray-600">Talents engagés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">284</div>
              <div className="text-gray-600">Collaborations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">89</div>
              <div className="text-gray-600">Emplois créés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à faire vivre votre territoire ?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Rejoignez la communauté NEYOTA et donnez vie à vos projets locaux
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Créer un compte gratuitement
            </a>
            <a
              href="/about"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">
            © 2026 NEYOTA - Ensemble, faisons vivre nos territoires
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="/about" className="hover:text-white">À propos</a>
            <a href="/charter" className="hover:text-white">Charte éthique</a>
            <a href="/privacy" className="hover:text-white">Confidentialité</a>
            <a href="/contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
