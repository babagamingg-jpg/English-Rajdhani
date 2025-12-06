import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Check if current route is Class Details (including sub-pages like /book, /grammar) or Chapter Pages
  // Using .* ensures we catch /class/12, /class/12/book, etc.
  const isImmersivePage = /^\/class\/.*$/.test(location.pathname) || /^\/chapter\/.*$/.test(location.pathname);

  const navItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Classes', path: '/classes', icon: 'class' },
    { label: 'AI Tutor', path: '/ai-tutor', icon: 'smart_toy' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-50 dark:bg-blue-900/30 text-primary font-medium' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary'
    }`;
  };

  // Hide header completely for Immersive pages (Class Details, Summary, Quiz, Book, Grammar)
  if (isImmersivePage) {
    return null;
  }

  // Reusable Brand Logo Component JSX
  const brandLogo = (
    <div className="flex items-center gap-3">
       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 text-white transform group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined filled-icon" style={{ fontSize: '24px' }}>auto_stories</span>
       </div>
       <span className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-display">
         English
         <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500">
           Rajdhani
         </span>
       </span>
    </div>
  );

  // Custom Header for Home Page
  if (isHome) {
    return (
      <header className="bg-transparent pt-6 pb-2 px-4 z-20">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
           {/* Logo Area */}
           <div className="group cursor-pointer" onClick={() => navigate('/')}>
             {brandLogo}
           </div>
           
           {/* Free Badge */}
           <div className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-green-400/30 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm text-green-600 dark:text-green-400 font-bold text-xs shadow-sm cursor-default">
              <span className="material-symbols-outlined filled-icon" style={{ fontSize: '16px' }}>auto_awesome</span>
              FREE
           </div>
        </div>
      </header>
    );
  }

  // Standard Header for other pages
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm z-20 sticky top-0 border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            {brandLogo}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={getLinkClass(item.path)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Right Side (Placeholder) */}
          <div className="md:hidden">
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;