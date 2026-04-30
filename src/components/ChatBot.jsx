import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiCpu, FiUser, FiHelpCircle, FiMinimize2, FiMessageSquare } from 'react-icons/fi';
import { sendChatMessage, getChatSuggestions } from '../services/api';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Bonjour ! 👋 Je suis votre assistant IA de gestion de stock. Posez-moi des questions sur vos produits, zones ou mouvements.", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Styles neumorphismes
  const nmFlat = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_#0e1013,-6px_-6px_12px_rgba(255,255,255,0.05)]";
  const nmInset = "bg-[#e0e5ec] dark:bg-[#1a1d23] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1013,inset_-4px_-4px_8px_rgba(255,255,255,0.05)]";
  const nmButton = "active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition-all duration-200";

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await getChatSuggestions();
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Erreur chargement suggestions:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({ message: inputMessage });
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Désolé, je n'arrive pas à répondre. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Si minimisé, afficher seulement un petit bandeau
  if (isMinimized) {
    return (
      <div 
        className={`${nmFlat} rounded-2xl cursor-pointer p-3 flex items-center justify-between`}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <FiCpu className="text-indigo-600 dark:text-indigo-400" size={20} />
          <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Assistant IA</span>
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiMessageSquare size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#e0e5ec] dark:bg-[#1a1d23] rounded-2xl">
      {/* Header */}
      <div className={`${nmInset} p-4 flex justify-between items-center border-b border-gray-300/20 rounded-t-2xl`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <FiCpu className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Assistant IA Stock</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              En ligne
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            title="Minimiser"
          >
            <FiMinimize2 className="text-gray-500" size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            title="Fermer"
          >
            <FiX className="text-gray-500" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? `${nmInset} bg-indigo-500/10 text-gray-700 dark:text-gray-200`
                  : `${nmFlat} text-gray-700 dark:text-gray-200`
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.sender === 'bot' ? (
                  <FiCpu size={12} className="text-indigo-500" />
                ) : (
                  <FiUser size={12} className="text-gray-500" />
                )}
                <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={`${nmFlat} p-3 rounded-2xl`}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions rapides */}
      {suggestions.length > 0 && messages.length < 3 && (
        <div className="px-4 py-3 border-t border-gray-300/20">
          <div className="flex items-center gap-2 mb-2">
            <FiHelpCircle size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Suggestions rapides :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInputMessage(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className={`${nmInset} p-4 flex gap-2 rounded-b-2xl`}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Posez votre question..."
          className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 px-3 py-2"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className={`p-2.5 rounded-xl ${nmButton} ${
            isLoading || !inputMessage.trim()
              ? 'opacity-50 cursor-not-allowed'
              : 'text-indigo-600 dark:text-indigo-400 hover:scale-105'
          }`}
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;