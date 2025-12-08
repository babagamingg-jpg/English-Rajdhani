import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ClassDetails: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // Determine styles based on class ID (11 vs 12)
  const isClass11 = classId === '11';

  // Gradients matching the Home screen and provided design
  const bgGradient = isClass11 
    ? 'bg-gradient-to-b from-[#4facfe] to-[#00f2fe]'  // Blue for Class 11
    : 'bg-gradient-to-b from-[#c471f5] to-[#fa71cd]'; // Purple/Pink for Class 12

  const shadowColor = isClass11 ? 'shadow-blue-500/30' : 'shadow-purple-500/30';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-background-dark font-display overflow-y-auto no-scrollbar">
      
      {/* Immersive Header Section */}
      <div className={`relative ${bgGradient} rounded-b-[2.5rem] pt-6 pb-24 px-6 shadow-xl z-0 transition-colors duration-500`}>
        <div className="max-w-2xl mx-auto">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-8">
             <button 
               onClick={() => navigate('/')}
               className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20"
             >
               <span className="material-symbols-outlined">arrow_back</span>
             </button>
             
             <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wide shadow-sm">
               Bihar Board
             </div>
          </div>

          {/* Centered Hero Content */}
          <div className="flex flex-col items-center text-center space-y-4">
             {/* Class Number Box */}
             <div className={`w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg ${shadowColor}`}>
                <span className="text-5xl font-bold text-white tracking-tight drop-shadow-sm">{classId}</span>
             </div>
             
             <div className="space-y-1">
               <h1 className="text-4xl font-bold text-white drop-shadow-sm">Class {classId}</h1>
               <p className="text-blue-50/90 font-medium text-sm">What would you like to study today?</p>
             </div>
          </div>

        </div>
      </div>

      {/* Cards Container - Overlapping Header */}
      <div className="flex-1 -mt-10 px-6 pb-6 z-10">
         <div className="max-w-2xl mx-auto space-y-4 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Textbook Card */}
            <button 
              onClick={() => navigate(`/class/${classId}/textbook-select`)}
              className="w-full bg-white dark:bg-zinc-800 rounded-2xl p-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex"
            >
              {/* Green Accent Strip */}
              <div className="w-2 bg-emerald-400 shrink-0"></div>
              
              <div className="flex items-center p-5 w-full">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-emerald-500 text-3xl filled-icon">auto_stories</span>
                </div>
                
                {/* Text */}
                <div className="text-left">
                   <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Textbook</h3>
                   <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Prose, Poetry & Stories</p>
                </div>

                {/* Arrow (Visual hint) */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                   <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                </div>
              </div>
            </button>

            {/* Grammar Card */}
            <button 
              onClick={() => navigate(`/class/${classId}/grammar`)}
              className="w-full bg-white dark:bg-zinc-800 rounded-2xl p-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex"
            >
              {/* Orange Accent Strip */}
              <div className="w-2 bg-amber-400 shrink-0"></div>
              
              <div className="flex items-center p-5 w-full">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-amber-500 text-3xl filled-icon">edit_note</span>
                </div>
                
                {/* Text */}
                <div className="text-left">
                   <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Grammar</h3>
                   <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rules, Practice & Examples</p>
                </div>

                {/* Arrow (Visual hint) */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                   <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                </div>
              </div>
            </button>

         </div>
      </div>

    </div>
  );
};

export default ClassDetails;