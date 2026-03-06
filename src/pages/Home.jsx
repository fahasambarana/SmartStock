import React from "react";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartStock
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition">
              Fonctionnalités
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-gray-900 transition">
              À propos
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-gray-900 transition">
              Contact
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition">
              Connexion
            </a>
            <a
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              S'inscrire
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Plateforme intelligente
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bienvenue sur SmartStock
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              Votre plateforme de gestion intelligente qui révolutionne la façon
              dont vous gérez vos projets et vos équipes.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="/register"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/demo"
                className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-md hover:shadow-lg border border-gray-200">
                Voir la démo
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-gray-800">10k+</div>
                <div className="text-sm text-gray-500">Utilisateurs actifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">98%</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">24/7</div>
                <div className="text-sm text-gray-500">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="flex-1 relative">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>

              {/* Main illustration */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl"></div>
                    <div className="h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-xl"></div>
                    <div className="h-24 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl"></div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart
            </span>
            ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚀",
                title: "Performance",
                description:
                  "Optimisez votre productivité avec des outils puissants et intuitifs",
              },
              {
                icon: "🔒",
                title: "Sécurité",
                description:
                  "Vos données sont protégées avec un cryptage de bout en bout",
              },
              {
                icon: "💡",
                title: "Innovation",
                description:
                  "Des fonctionnalités innovantes pour rester en avance",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm">
              © 2024 Smart. Tous droits réservés.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition">
                Mentions légales
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition">
                Confidentialité
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition">
                CGU
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
