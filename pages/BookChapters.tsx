import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity } from '../types';

const BookChapters: React.FC = () => {
  const navigate = useNavigate();
  const { classId, bookType, sectionType } = useParams<{ classId: string; bookType: string; sectionType?: string }>();
  const [chapters, setChapters] = useState<ChapterEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive Display Info
  const isRainbow = bookType !== 'story-of-english';
  const rainbowPart = classId === '11' ? '1' : '2';
  
  let bookTitle = isRainbow ? `Rainbow Part - ${rainbowPart}` : 'Story of English';
  let bookSubtitle = 'Literature';
  
  if (isRainbow) {
    if (sectionType === 'prose') {
        bookSubtitle = 'Prose Section';
    } else if (sectionType === 'poetry') {
        bookSubtitle = 'Poetry Section';
    } else {
        bookSubtitle = 'Prose & Poetry';
    }
  }
  
  // Header Theme Gradients
  const headerGradient = isRainbow 
    ? (sectionType === 'poetry' 
        ? 'from-pink-500 to-rose-600 dark:from-pink-900 dark:to-rose-700' 
        : 'from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-700')
    : 'from-teal-500 to-emerald-600 dark:from-teal-900 dark:to-emerald-700';

  // Card Theme Helpers
  const getThemeStyles = () => {
    if (sectionType === 'poetry') {
      return {
        borderLeft: 'border-l-pink-500',
        numBoxBg: 'bg-pink-50 dark:bg-pink-900/20',
        numBoxText: 'text-pink-600 dark:text-pink-400',
        activeBtn: 'text-pink-600 bg-pink-50 hover:bg-pink-100',
        iconHeader: 'history_edu'
      };
    } else if (bookType === 'story-of-english') {
      return {
        borderLeft: 'border-l-teal-500',
        numBoxBg: 'bg-teal-50 dark:bg-teal-900/20',
        numBoxText: 'text-teal-600 dark:text-teal-400',
        activeBtn: 'text-teal-600 bg-teal-50 hover:bg-teal-100',
        iconHeader: 'menu_book'
      };
    }
    // Default Prose/Blue
    return {
      borderLeft: 'border-l-blue-500',
      numBoxBg: 'bg-blue-50 dark:bg-blue-900/20',
      numBoxText: 'text-blue-600 dark:text-blue-400',
      activeBtn: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
      iconHeader: 'auto_stories'
    };
  };

  const themeStyles = getThemeStyles();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        
        // 1. Get the class UUID
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('grade', classId)
          .single();

        if (classError || !classData) {
          console.warn("Class not found:", classError?.message);
          setChapters([]);
          setLoading(false);
          return;
        }

        // 2. Determine Book Name based on route params
        let targetBookName = '';
        if (bookType === 'story-of-english') {
            targetBookName = 'Story of English';
        } else {
            // Default to Rainbow
            targetBookName = classId === '11' ? 'Rainbow Part 1' : 'Rainbow Part 2';
        }

        // 3. Get Book ID
        const { data: bookData, error: bookError } = await supabase
            .from('books')
            .select('id')
            .eq('class_id', classData.id)
            .ilike('name', `%${targetBookName}%`)
            .single();

        if (bookError || !bookData) {
             console.warn("Book not found:", bookError?.message);
             setChapters([]);
             setLoading(false);
             return;
        }

        // 4. Fetch Chapters linked to this Book
        let query = supabase
          .from('chapters')
          .select('*')
          .eq('class_id', classData.id)
          .eq('book_id', bookData.id)
          .eq('section_type', 'textbook') // Explicitly ignore grammar
          .order('chapter_number', { ascending: true });

        // 5. Apply Book Section Filter (Prose vs Poetry)
        if (sectionType) {
            // Ensure sectionType matches enum values (lowercase)
            query = query.eq('book_section', sectionType.toLowerCase());
        }

        const { data, error } = await query;

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
  }, [classId, bookType, sectionType]);

  const handleBack = () => {
    if (isRainbow) {
        navigate(`/class/${classId}/rainbow-sections`);
    } else {
        navigate(`/class/${classId}/textbook-select`);
    }
  };

  const getCurrentPath = () => {
    const sectionPart = sectionType ? `/${sectionType}` : '';
    return `/class/${classId}/book/${bookType}${sectionPart}`;
  };

  const handleReadClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    navigate(`/chapter/${chapterId}/read`, { state: { backPath: getCurrentPath() } });
  };

  const handleSummaryClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    navigate(`/chapter/${chapterId}/summary`, { state: { backPath: getCurrentPath() } });
  };

  const handleTestClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    navigate(`/chapter/${chapterId}/quiz`, { state: { backPath: getCurrentPath() } });
  };

  // Helper to determine badge style based on section type
  const getSectionBadge = (section: string | undefined) => {
    const type = section?.toLowerCase() || '';
    
    if (type === 'poetry') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-[10px] font-bold uppercase tracking-wide">
                POETRY
            </span>
        );
    }
    
    if (bookType === 'story-of-english') {
       return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wide">
                SUPPLEMENTARY
            </span>
        );
    }

    // Default to Prose
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide">
            PROSE
        </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative">
      
      {/* Header Section */}
      <div className={`bg-gradient-to-b ${headerGradient} pb-16 pt-6 px-6 relative z-0 shadow-lg`}>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50 z-[-1]"></div>

         <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-start mb-6">
                <button 
                    onClick={handleBack}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/20"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                    <span className="text-xs font-semibold text-white tracking-wide">Class {classId}</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg shadow-black/10">
                    <span className="material-symbols-outlined text-white text-3xl filled-icon">
                       {themeStyles.iconHeader}
                    </span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-sm font-display">{bookTitle}</h1>
                    <p className="text-white/90 text-sm font-medium tracking-wide opacity-90">{bookSubtitle}</p>
                </div>
            </div>
         </div>
      </div>

      {/* White Content Sheet */}
      <div className="flex-1 bg-gray-50 dark:bg-zinc-900 rounded-t-[2.5rem] -mt-10 relative z-10 px-4 sm:px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500">
            
            <div className="flex justify-between items-end mb-6 px-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">
                    {sectionType === 'poetry' ? 'Poems' : 'Chapters'}
                </h2>
                <div className="flex items-center gap-2">
                   {loading && <span className="text-xs text-blue-500 animate-pulse">Syncing...</span>}
                   <span className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                     {loading ? '...' : `${chapters.length} Items`}
                   </span>
                </div>
            </div>

            <div className="space-y-4 pb-12">
                {!loading && chapters.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                        <p className="text-sm">No chapters found</p>
                    </div>
                )}
                
                {chapters.map((chapter, index) => (
                    <div 
                        key={chapter.id || index}
                        className={`group relative flex flex-col sm:flex-row sm:items-center p-5 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer gap-4 sm:gap-6 overflow-hidden border-l-[6px] ${themeStyles.borderLeft}`}
                        onClick={(e) => handleReadClick(e, chapter.id)}
                    >
                        {/* Number Box */}
                        <div className={`flex-shrink-0 w-14 h-14 ${themeStyles.numBoxBg} rounded-2xl flex items-center justify-center border border-current border-opacity-10`}>
                            <span className={`font-display font-bold text-2xl ${themeStyles.numBoxText}`}>
                                {chapter.chapter_number}
                            </span>
                        </div>
                            
                        {/* Text Content */}
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 opacity-80">
                                {getSectionBadge(chapter.book_section)}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                                {chapter.title}
                            </h3>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 sm:self-center w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-dashed border-gray-100 dark:border-zinc-700">
                            
                            {/* Full Chapter (Read) - First Position */}
                            <button 
                                onClick={(e) => handleReadClick(e, chapter.id)}
                                className={`flex-1 sm:flex-none flex flex-col items-center justify-center p-2 rounded-xl ${themeStyles.activeBtn} dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-colors group/btn`}
                                 title="Read Full Chapter"
                            >
                                 <span className="material-symbols-outlined text-[24px] mb-0.5 filled-icon group-hover/btn:scale-110 transition-transform">chrome_reader_mode</span>
                                 <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">Full Chapter</span>
                            </button>

                            {/* Summary - Second Position */}
                            <button 
                                onClick={(e) => handleSummaryClick(e, chapter.id)}
                                className="flex-1 sm:flex-none flex flex-col items-center justify-center p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 transition-colors group/btn"
                                title="Summary"
                            >
                                 <span className="material-symbols-outlined text-[24px] mb-0.5 group-hover/btn:scale-110 transition-transform">summarize</span>
                                 <span className="text-[9px] font-bold uppercase tracking-wider">Summary</span>
                            </button>
                            
                            {/* Test - Third Position */}
                            <button 
                                onClick={(e) => handleTestClick(e, chapter.id)}
                                className="flex-1 sm:flex-none flex flex-col items-center justify-center p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-400 hover:text-purple-600 transition-colors group/btn"
                                title="Quiz"
                            >
                                 <span className="material-symbols-outlined text-[24px] mb-0.5 group-hover/btn:scale-110 transition-transform">quiz</span>
                                 <span className="text-[9px] font-bold uppercase tracking-wider">Test</span>
                            </button>

                        </div>
                    </div>
                ))}

                {chapters.length > 0 && (
                    <div className="text-center pt-6 opacity-40">
                        <span className="material-symbols-outlined text-gray-400 text-xl">more_horiz</span>
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default BookChapters;