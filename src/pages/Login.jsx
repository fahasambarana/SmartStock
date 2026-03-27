import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin } from '../services/api';
import { Package, Loader2 } from 'lucide-react'; 
import FontLogin  from '../../public/image/login.jpg'
import logo from '../../public/image/Logo.png'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- ANIMATION PISTOLIER TRÈS LENTE ET STABLE ---
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
    const timer = setTimeout(handleTyping, isDeleting ? 150 : 400);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiLogin({ email, password });
      login(response.data.token, response.data.role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center overflow-hidden font-sans bg-[#1a1a1a]">
      
      {/* IMAGE DE FOND */}
      <div className="absolute inset-0 z-0">
        <img style={{ backgroundImage: `url(${FontLogin})` }} className="w-full h-full object-cover opacity-30 scale-105" alt="bg" />
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]"></div>
      </div>

      {/* PANNEAU LOGIN (Rounded Full visible) */}
      <div className="relative z-10 my-16 h-[80vh] w-full md:w-[42%] lg:w-[35%] bg-[#e0e0e0] 
                      rounded-r-full shadow-[40px_0px_80px_rgba(0,0,0,0.6)] 
                      flex flex-col justify-center px-16 md:px-24 border-r border-white/10
                      animate-[slowSlideLeft_1.5s_ease-in-out]">
        
        <div className="max-w-sm w-full">
          <h2 className="text-4xl font-semibold text-gray-700 mb-10" style={{ textShadow: '1px 1px 1px #ffffff' }}>CONNEXION</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="email" required className="w-full px-8 py-5 bg-[#e0e0e0] rounded-full shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] outline-none text-gray-700" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" required className="w-full px-8 py-5 bg-[#e0e0e0] rounded-full shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] outline-none text-gray-700" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button disabled={isLoading} type="submit" className="w-full py-5 bg-[#e0e0e0] rounded-full text-gray-600 font-bold shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] flex justify-center items-center">
              {isLoading ? <Loader2 className="animate-spin" /> : "Se connecter"}
            </button>
          </form>
          <div className="mt-10 text-center"><Link to="/register" className="text-xs text-gray-400 hover:text-blue-500 uppercase tracking-widest">Pas de compte ? Créer un compte</Link></div>
        </div>
      </div>

      {/* TEXTE ET LOGO (TAILLE RÉDUITE ET WHITESPACE-NOWRAP) */}
      <div className="hidden md:flex flex-col items-center ml-20 lg:ml-32 z-20">
          <img src={logo} className="w-40 h-40 object-cover  scale-105 rounded-full" />
 
        <div className="text-center">
          {/* whitespace-nowrap empêche le retour à la ligne */}
          <h1 className="text-5xl lg:text-7xl font-black text-white uppercase min-h-[1.2em]"
              style={{ textShadow: '3px 3px 0px #1e3a8a, 10px 10px 30px rgba(0,0,0,0.8)' }}>
           Smart-STOCK
          </h1>
          <p className="text-blue-200/60 text-lg font-light tracking-[0.3em] mt-4 uppercase whitespace-nowrap">
            Gestion de stock intelligent & Universel
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slowSlideLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};
export default Login;