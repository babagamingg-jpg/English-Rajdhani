import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SelectTextbook: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  
  // Determine Rainbow Part based on class
  const rainbowPart = classId === '11' ? '1' : '2';

  const handleBookSelect = (bookType: 'rainbow' | 'story-of-english') => {
    if (bookType === 'rainbow') {
        navigate(`/class/${classId}/rainbow-sections`);
    } else {
        navigate(`/class/${classId}/book/${bookType}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar">
      
      {/* Header Section */}
      <div className="bg-gradient-to-b from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-800 pb-16 pt-6 px-6 relative z-0 rounded-b-[2.5rem] shadow-xl">
         <div className="absolute inset-0 bg-white/5 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent z-[-1]"></div>

         <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-start mb-8">
                <button 
                    onClick={() => navigate(`/class/${classId}`)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/20"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                    <span className="text-xs font-bold text-white tracking-wide">Class {classId}</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-3 mb-4">
                <h1 className="text-3xl font-bold text-white drop-shadow-md font-display">Select Textbook</h1>
                <p className="text-blue-100 text-sm font-medium opacity-90 max-w-xs">
                    Choose the book you want to study today
                </p>
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 -mt-8 pb-10 z-10">
         <div className="max-w-2xl mx-auto space-y-5 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Rainbow Book Card */}
            <button 
              onClick={() => handleBookSelect('rainbow')}
              className="w-full relative overflow-hidden bg-white dark:bg-zinc-800 rounded-3xl p-1 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 to-indigo-500"></div>
              <div className="p-6 pl-8 flex items-center justify-between">
                 <div className="flex-1 min-w-0 pr-4">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide mb-2">
                       Main Textbook
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                       Rainbow Part - {rainbowPart}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-1">
                       Prose & Poetry Collection
                    </p>
                 </div>
                 
                 <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-blue-500 text-3xl filled-icon">auto_stories</span>
                 </div>
              </div>
            </button>

            {/* Story of English Book Card */}
            <button 
              onClick={() => handleBookSelect('story-of-english')}
              className="w-full relative overflow-hidden bg-white dark:bg-zinc-800 rounded-3xl p-1 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-teal-400 to-emerald-500"></div>
              <div className="p-6 pl-8 flex items-center justify-between">
                 <div className="flex-1 min-w-0 pr-4">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wide mb-2">
                       Supplementary
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                       Story of English
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-1">
                       Literature & Drama
                    </p>
                 </div>
                 
                 <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-teal-500 text-3xl filled-icon">history_edu</span>
                 </div>
              </div>
            </button>

         </div>
      </div>
    </div>
  );
};

export default SelectTextbook;