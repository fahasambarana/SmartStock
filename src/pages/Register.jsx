import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';
import { Package, Loader2, CheckCircle } from 'lucide-react';
import logo from '../../public/image/Logo.png'

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('utilisateur');
  const [status, setStatus] = useState('idle');
  const navigate = useNavigate();

  // --- ANIMATION PISTOLIER TRÈS LENTE ET STABILISÉE ---
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = "Smart-Stock";

  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        setDisplayText(fullText.substring(0, displayText.length + 1));
        if (displayText === fullText) setTimeout(() => setIsDeleting(true), 4000);
      } else {
        setDisplayText(fullText.substring(0, displayText.length - 1));
        if (displayText === "") setIsDeleting(false);
      }
    };
    // Vitesse très lente (400ms) pour un effet premium
    const timer = setTimeout(handleTyping, isDeleting ? 150 : 400);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await apiRegister({ username, email, password, role });
      setStatus('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden font-sans bg-[#1a1a1a]">
      
      {/* IMAGE DE FOND AVEC OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover opacity-30" 
          alt="bg" 
        />
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[3px]"></div>
      </div>

      {/* TEXTE ET LOGO À GAUCHE (Stabilisés) */}
      <div className="hidden md:flex flex-col items-center mr-auto ml-20 lg:ml-32 z-20">
        <img src={logo} className="w-40 h-40 object-cover  scale-105 rounded-full" />
        <div className="text-center">
          {/* whitespace-nowrap pour éviter le saut à la ligne */}
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter whitespace-nowrap min-h-[1.2em]"
              style={{ textShadow: '3px 3px 0px #1e3a8a, 10px 10px 30px rgba(0,0,0,0.8)' }}>
             Smart-STOCK
          </h1>
          <p className="text-blue-200/60 text-lg font-light tracking-[0.3em] mt-4 uppercase whitespace-nowrap">
            Gestion de stock intelligent & Universel
          </p>
        </div>
      </div>

      {/* PANNEAU REGISTER : COLLÉ À DROITE, ROUNDED FULL À GAUCHE */}
      <div className="relative z-10 my-16 h-[80vh] w-full md:w-[42%] lg:w-[38%] bg-[#e0e0e0] 
                      rounded-l-full shadow-[-40px_0px_80px_rgba(0,0,0,0.6)] 
                      flex flex-col justify-center px-12 md:px-24 border-l border-white/10
                      animate-[slowSlideRight_1.5s_ease-in-out]">
        
        <div className="max-w-md w-full">
          <h2 className="text-4xl font-serif text-gray-700 mb-8 text-right" 
              style={{ textShadow: '1px 1px 1px #ffffff' }}>Inscription</h2>
          
          {status === 'success' ? (
            <div className="flex flex-col items-center space-y-6 animate-[fadeIn_0.5s_ease-in]">
              <CheckCircle size={80} className="text-green-500 drop-shadow-lg" />
              <p className="text-gray-600 font-bold uppercase tracking-widest text-center">Bienvenue !</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <input type="text" required className="w-full px-6 py-4 bg-[#e0e0e0] rounded-full shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] outline-none text-gray-700" placeholder="Utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="email" required className="w-full px-6 py-4 bg-[#e0e0e0] rounded-full shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] outline-none text-gray-700" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                <select className="w-full px-6 py-4 bg-[#e0e0e0] rounded-full shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] outline-none text-gray-700 appearance-none cursor-pointer" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="utilisateur">Utilisateur</option>
                  <option value="fournisseur">Fournisseur</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <input type="password" required className="w-full px-6 py-4 bg-[#e0e0e0] rounded-full shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff] outline-none text-gray-700" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              
              <button type="submit" disabled={status === 'loading'} className="w-full py-5 mt-4 bg-[#e0e0e0] rounded-full text-gray-600 font-bold uppercase shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] flex justify-center items-center transition-all">
                {status === 'loading' ? <Loader2 className="animate-spin" /> : "Créer le compte"}
              </button>
            </form>
          )}
          
          <div className="mt-8 text-right">
            <Link to="/login" className="text-xs text-gray-400 hover:text-blue-500 uppercase tracking-widest transition-all">
              Déjà inscrit ? Connexion
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slowSlideRight { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
      `}</style>
    </div>
  );
};

export default Register;