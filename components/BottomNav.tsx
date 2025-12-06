import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const baseClass = "flex flex-col items-center space-y-1 transition-colors cursor-pointer p-2 rounded-lg";
    const activeClass = "text-primary";
    const inactiveClass = "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/50";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="md:hidden bg-white dark:bg-slate-800/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 pb-safe pt-1 px-4 sticky bottom-0 z-50 shadow-lg-up">
      <div className="flex justify-around items-center h-16">
        <button className={getLinkClass('/')} onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button className={getLinkClass('/classes')} onClick={() => navigate('/classes')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="text-xs font-medium">Classes</span>
        </button>
        
        <button className={getLinkClass('/ai-tutor')} onClick={() => navigate('/ai-tutor')}>
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="text-xs font-medium">AI Tutor</span>
        </button>
        
        <button className={getLinkClass('/profile')} onClick={() => navigate('/profile')}>
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;