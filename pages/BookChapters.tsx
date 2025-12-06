import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity } from '../types';

const BookChapters: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [chapters, setChapters] = useState<ChapterEntity[]>([]);
  const [className, setClassName] = useState<string>(`Class ${classId}`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        
        // 1. Get the class UUID and Name based on the grade
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('grade', classId)
          .single();

        if (classError || !classData) {
          console.warn("Class not found:", classError?.message);
          setChapters([]);
          return;
        }
        
        if (classData.name) {
            setClassName(classData.name);
        }

        // 2. Fetch chapters (excluding Grammar)
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('class_id', classData.id)
          .neq('section_type', 'grammar') 
          .order('section_type', { ascending: false }) // Group Prose/Poetry
          .order('chapter_number', { ascending: true });

        if (error) {
          console.warn("Supabase fetch error:", error.message);
          setChapters([]); 
        } else {
          setChapters(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching chapters:", err);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [classId]);

  const handleSummaryClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    navigate(`/chapter/${chapterId}/summary`, { state: { backPath: `/class/${classId}/book` } });
  };

  const handleTestClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    navigate(`/chapter/${chapterId}/quiz`, { state: { backPath: `/class/${classId}/book` } });
  };

  // Helper to determine badge style based on section type
  const getSectionBadge = (sectionType: string) => {
    const type = sectionType.toLowerCase();
    if (type.includes('poetry') || type.includes('poem')) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-[10px] font-bold uppercase tracking-wide border border-pink-200 dark:border-pink-800/50">
                <span className="material-symbols-outlined text-[12px]">feather</span>
                Poetry
            </span>
        );
    }
    // Default to Prose
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide border border-blue-200 dark:border-blue-800/50">
            <span className="material-symbols-outlined text-[12px]">menu_book</span>
            Prose
        </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative">
      
      {/* Blue Header Section */}
      <div className="bg-gradient-to-b from-[#4facfe] to-[#00f2fe] dark:from-blue-900 dark:to-blue-700 pb-16 pt-6 px-6 relative z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-primary opacity-100 dark:opacity-80 z-[-1]"></div>

         <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-start mb-6">
                <button 
                    onClick={() => navigate(`/class/${classId}`)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                    <span className="text-xs font-semibold text-white tracking-wide">{className}</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg shadow-blue-900/10">
                    <span className="material-symbols-outlined text-white text-3xl">library_books</span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-sm font-display">Textbook</h1>
                    <p className="text-blue-50 text-sm font-medium opacity-90">Select a chapter to start reading</p>
                </div>
            </div>
         </div>
      </div>

      {/* White Content Sheet */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-t-[2.5rem] -mt-10 relative z-10 px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500">
            
            <div className="flex justify-between items-end mb-6 px-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">Chapters</h2>
                <div className="flex items-center gap-2">
                   {loading && <span className="text-xs text-blue-500 animate-pulse">Syncing...</span>}
                   <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                     {loading ? '...' : `${chapters.length} Items`}
                   </span>
                </div>
            </div>

            <div className="space-y-4 pb-8">
                {!loading && chapters.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                        <p className="text-sm">No chapters found in database</p>
                    </div>
                )}
                
                {chapters.map((chapter, index) => (
                    <div 
                        key={chapter.id || index}
                        className="group flex flex-col sm:flex-row sm:items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer gap-4 sm:gap-0"
                    >
                        <div className="flex items-center flex-grow min-w-0">
                            {/* Number Box */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-50 dark:bg-zinc-700/50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors border border-gray-100 dark:border-zinc-700">
                                <span className="font-display font-bold text-lg text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
                                    {chapter.chapter_number}
                                </span>
                            </div>
                            
                            <div className="flex-grow min-w-0 pr-2">
                                <div className="mb-1">
                                    {getSectionBadge(chapter.section_type)}
                                </div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {chapter.title}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 ml-16 sm:ml-2">
                            <button 
                                onClick={(e) => handleSummaryClick(e, chapter.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors border border-blue-100 dark:border-blue-800/50"
                            >
                                <span className="material-symbols-outlined text-[18px]">summarize</span>
                                <span className="text-[11px] font-bold">Summary</span>
                            </button>
                            
                            <button 
                                onClick={(e) => handleTestClick(e, chapter.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors border border-purple-100 dark:border-purple-800/50"
                            >
                                <span className="material-symbols-outlined text-[18px]">quiz</span>
                                <span className="text-[11px] font-bold">Test</span>
                            </button>
                        </div>
                    </div>
                ))}

                {chapters.length > 0 && (
                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-300 dark:text-zinc-700 font-medium">End of list</p>
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default BookChapters;