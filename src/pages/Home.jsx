import React from "react";
import { ArrowRight } from "lucide-react";
import backgroundImage from '../../public/image/font1.jpg';
import sideImage from '../../public/image/Accueil.png';
import Logo from '../../public/image/Logo.png';

const Home = () => {
  return (
    <div
      className="min-h-screen  bg-cover bg-center overflow-hidden"
      
    >
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-60"
        >
          <source src="/image/bgvideo.mp4" type="video/mp4" />
        </video>
        {/* Overlay pour garantir la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-transparent to-slate-950/50"></div>
      </div>
     
      
      {/* Zone centrale agrandie */}
      <div className="relative z-10 items-center flex flex-col lg:flex-row   gap-16 ">
        {/* Texte à gauche */}
        <div className="text-left max-w-2xl ml-6 transform transition-transform duration-500 hover:translate-x-1 hover:translate-y-1">
          <h1 className="text-6xl md:text-8xl font-extrabold text-blue-900 mb-6 animate-typewriter-loop tracking-tight relative">
            Smart-STOCK
          </h1>

          <p className="text-2xl font-semibold text-gray-900 mb-8 animate-fadeInUp">
            Votre plateforme de gestion intelligente qui révolutionne la façon dont
            vous gérez vos projets et vos équipes.
          </p>

          <div className="flex flex-col sm:flex-row justify-start gap-6 animate-fadeI-nUp">
            <a
              href="/login"
              className="relative group py-4 px-10 rounded-2xl border border-white/30 bg-blue-900 backdrop-blur-md text-white font-semibold hover:bg-blue-900/60 transition-all duration-300 flex items-center justify-center overflow-hidden"
            >
              <span className="relative z-10">Connexion</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
            </a>

            <a
              href="/register"
              className="relative py-4 px-10 rounded-2xl  backdrop-blur text-white backdrop-blur2-md bg-slate-900 font-semibold hover:bg-blue-900/60 flex items-center justify-center overflow-hidden"
            >
              <span className="relative z-10">Inscription</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
            </a>
          </div>
        </div>
 
        {/* Image à droite avec mouvement subtil */}
        <div className="flex-1 bg-blue-900 h-[650px] shadow-2xl border-l-slate-900 border-l-[30px] rounded-ss-full transform  transition-transform duration-500 hover:scale-105 hover:rotate-1 animate-fadeInRight">
          <img 
            src={sideImage} 
            alt="SmartStock Illustration" 
            className="w-full h-auto bg-cover" 
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Typewriter rapide (1s) + pause 60s */
        @keyframes typewriter-loop {
          0% { width: 0; }
          5.2% { width: 100%; } /* 1s pour écrire le texte */
          10% { width: 100%; }  /* pause 60s */
        }

        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: white; }
        }

        .animate-fadeInUp { animation: fadeInUp 1s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 1s ease-out forwards; }

        .animate-typewriter-loop {
          overflow: hidden;
          white-space: nowrap;
          border-right: 0.15em solid white;
          animation: typewriter-loop 61s steps(11) infinite;
          animation-timing-function: linear;
          position: relative;
        }

        .animate-typewriter-loop::after {
          content: "";
          display: inline-block;
          width: 0.15em;
          background-color: white;
          margin-left: 2px;
          animation: blink-caret 1s step-start infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;