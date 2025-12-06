import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-white dark:bg-slate-900">
      <div className="max-w-md mx-auto md:max-w-2xl px-6 pt-6 pb-28 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Top Choice Badge - Subtle Professional Look */}
          <div className="px-5 py-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-full inline-flex items-center gap-2 mb-4 shadow-sm">
             <span className="material-symbols-outlined text-amber-500 text-[20px] filled-icon">workspace_premium</span>
             <span className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wide">Bihar Board Top Choice</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white font-display">
             ENGLISH <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 animate-gradient-x">
               RAJDHANI
             </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
             Everything you need for English— <br/>
             free forever, <span className="text-slate-900 dark:text-white font-bold">100% free.</span>
          </p>

          {/* Custom SVG Illustration */}
          <div className="relative w-64 h-56 my-6 transform hover:scale-105 transition-transform duration-500">
             <div className="absolute top-10 -left-6 w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-40 animate-pulse"></div>
             <div className="absolute bottom-0 -right-6 w-24 h-24 bg-pink-300 rounded-full blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '1s'}}></div>
             
             <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-2xl relative z-10" xmlns="http://www.w3.org/2000/svg">
                {/* Stack of Books */}
                
                {/* Green Book (Bottom) */}
                <path d="M40 145 L160 145 L170 155 L50 155 Z" fill="#22c55e" /> {/* Top Cover */}
                <rect x="40" y="155" width="120" height="15" rx="2" fill="#4ade80" /> {/* Spine */}
                <path d="M40 162 L160 162" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.4"/> {/* Page Detail */}

                {/* Pink Book (Middle) */}
                <path d="M45 120 L165 120 L175 130 L55 130 Z" fill="#db2777" /> {/* Top Cover */}
                <rect x="45" y="130" width="120" height="15" rx="2" fill="#f472b6" /> {/* Spine */}
                <path d="M45 137 L165 137" stroke="#db2777" strokeWidth="2" strokeOpacity="0.4"/> {/* Page Detail */}

                {/* Blue Book (Top) */}
                <path d="M50 95 L170 95 L180 105 L60 105 Z" fill="#2563eb" /> {/* Top Cover */}
                <rect x="50" y="105" width="120" height="15" rx="2" fill="#3b82f6" /> {/* Spine */}
                <path d="M50 112 L170 112" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.4"/> {/* Page Detail */}
                
                {/* Graduation Cap */}
                {/* Cap Board */}
                <path d="M110 40 L170 70 L110 100 L50 70 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                {/* Cap Base */}
                <path d="M165 73 L165 90 C165 90 140 105 110 105 C 80 105 55 90 55 90 L 55 73" fill="#1e293b" />
                
                {/* Tassel */}
                <circle cx="110" cy="70" r="3" fill="#fbbf24" />
                <path d="M110 70 Q 140 85 160 105" stroke="#fbbf24" strokeWidth="2" fill="none" />
                <circle cx="160" cy="105" r="5" fill="#fbbf24" />
             </svg>
          </div>
        </div>

        {/* Selection Section */}
        <div className="w-full mt-2 animate-in slide-in-from-bottom-8 duration-700 delay-100">
           <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white font-display">Select Your Class</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-2"></div>
           </div>

           <div className="space-y-5">
              {/* Class 11 Button */}
              <button 
                 onClick={() => navigate('/class/11')}
                 className="group w-full relative overflow-hidden rounded-3xl p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"></div>
                 <div className="relative h-24 flex items-center justify-between px-8 py-4">
                    <span className="text-3xl font-bold text-white font-display tracking-tight drop-shadow-sm">Class 11</span>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:bg-white/30 transition-colors">
                       <span className="material-symbols-outlined text-white text-[32px] filled-icon">auto_stories</span>
                    </div>
                 </div>
                 {/* Decorative Icon Background */}
                 <span className="absolute -bottom-6 -left-4 text-white/10 material-symbols-outlined text-[120px] rotate-12">auto_stories</span>
              </button>

              {/* Class 12 Button */}
              <button 
                 onClick={() => navigate('/class/12')}
                 className="group w-full relative overflow-hidden rounded-3xl p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-[#c471f5] to-[#fa71cd]"></div>
                 <div className="relative h-24 flex items-center justify-between px-8 py-4">
                    <span className="text-3xl font-bold text-white font-display tracking-tight drop-shadow-sm">Class 12</span>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:bg-white/30 transition-colors">
                       <span className="material-symbols-outlined text-white text-[36px] filled-icon">school</span>
                    </div>
                 </div>
                 {/* Decorative Icon Background */}
                 <span className="absolute -bottom-6 -left-4 text-white/10 material-symbols-outlined text-[120px] rotate-12">school</span>
              </button>
           </div>
        </div>

        {/* YouTube Channel Section */}
        <div className="w-full mt-8 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Channel</span>
            </div>
            <a 
                href="https://www.youtube.com/@EnglishRajdhani/featured" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-700"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[120px] text-red-600 rotate-[-15deg]">smart_display</span>
                </div>
                
                <div className="p-5 flex items-center gap-5 relative z-10">
                    {/* YouTube Icon/Avatar */}
                    <div className="flex-shrink-0 w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-800/30 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-red-600 text-4xl filled-icon">play_arrow</span>
                    </div>

                    <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors truncate">
                            English Rajdhani
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            Watch video lessons, summaries & exam updates on YouTube.
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-700 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                           <span className="material-symbols-outlined text-lg">open_in_new</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>

      </div>
    </div>
  );
};

export default Home;