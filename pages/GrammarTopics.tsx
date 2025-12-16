import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity } from '../types';

const GrammarTopics: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [topics, setTopics] = useState<ChapterEntity[]>([]);
  const [className, setClassName] = useState<string>(`Class ${classId}`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrammarTopics = async () => {
      try {
        setLoading(true);
        // 1. Get class UUID and Name
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('grade', classId)
          .single();

        if (classError || !classData) {
          console.warn("Class not found:", classError?.message);
          setTopics([]);
          return;
        }

        if (classData.name) {
            setClassName(classData.name);
        }

        // 2. Fetch Grammar chapters
        // According to the new schema, Grammar chapters have section_type = 'grammar'.
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('class_id', classData.id)
          .eq('section_type', 'grammar') 
          .order('chapter_number', { ascending: true });

        if (error) {
          console.warn("Fetch error:", error.message);
          setTopics([]);
        } else {
          setTopics(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrammarTopics();
  }, [classId]);

  const handleSummaryClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    // Pass backPath in state
    navigate(`/chapter/${chapterId}/summary`, { state: { backPath: `/class/${classId}/grammar` } });
  };

  const handleTestClick = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    // Pass backPath in state
    navigate(`/chapter/${chapterId}/quiz`, { state: { backPath: `/class/${classId}/grammar` } });
  };

  // Helper to extract the rich topic title from JSON content if available
  const getDisplayTitle = (topic: ChapterEntity) => {
    try {
      let content = topic.content;
      // Handle stringified JSON
      if (typeof content === 'string') {
        try {
           content = JSON.parse(content);
           // Handle double stringified if necessary
           if (typeof content === 'string') content = JSON.parse(content);
        } catch(e) { return topic.title; }
      }
      
      // Check for Grammar format topic
      if (content?.chapter_info?.topic) {
        return content.chapter_info.topic;
      }
      
      return topic.title;
    } catch (e) {
      return topic.title;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative">
      
      {/* Header Section (Amber Theme for Grammar) */}
      <div className="bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-900 dark:to-amber-700 pb-16 pt-6 px-6 relative z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-amber-300 to-orange-500 opacity-80 dark:opacity-60 z-[-1]"></div>

         <div className="max-w-2xl mx-auto w-full">
            {/* Nav Row */}
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

            {/* Hero Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg shadow-amber-900/10">
                    <span className="material-symbols-outlined text-white text-3xl">history_edu</span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-sm font-display">Grammar</h1>
                    <p className="text-amber-50 text-sm font-medium opacity-90">Rules & Exercises</p>
                </div>
            </div>
         </div>
      </div>

      {/* White Content Sheet */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-t-[2.5rem] -mt-10 relative z-10 px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-500">
            
            {/* List Header */}
            <div className="flex justify-between items-end mb-6 px-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">Topics</h2>
                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {loading ? '...' : `${topics.length} Units`}
                </span>
            </div>

            {/* Topics List */}
            <div className="space-y-4 pb-8">
                {!loading && topics.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">edit_off</span>
                        <p className="text-sm">No grammar topics found</p>
                    </div>
                )}

                {topics.map((topic, index) => (
                    <div 
                        key={topic.id || index}
                        className="group flex flex-col sm:flex-row sm:items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer gap-4 sm:gap-0"
                    >
                        {/* Left Side */}
                        <div className="flex items-center flex-grow min-w-0">
                            <div className="flex-shrink-0 w-12 h-12 bg-[#fff8e1] dark:bg-amber-900/30 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#ffecb3] dark:group-hover:bg-amber-800/40 transition-colors">
                                <span className="material-symbols-outlined text-gray-600 dark:text-amber-400 text-xl filled-icon">description</span>
                            </div>
                            
                            <div className="flex-grow min-w-0 pr-2">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                                    UNIT {topic.chapter_number}
                                </p>
                                <h3 className="text-base font-bold text-[#1f2937] dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {getDisplayTitle(topic)}
                                </h3>
                            </div>
                        </div>

                        {/* Right Side Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 ml-16 sm:ml-2">
                            <button 
                                onClick={(e) => handleSummaryClick(e, topic.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors border border-amber-100 dark:border-amber-800/50"
                            >
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                <span className="text-[11px] font-bold">Concepts</span>
                            </button>
                            
                            <button 
                                onClick={(e) => handleTestClick(e, topic.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 transition-colors border border-green-100 dark:border-green-800/50"
                            >
                                <span className="material-symbols-outlined text-[18px]">quiz</span>
                                <span className="text-[11px] font-bold">Test</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

    </div>
  );
};

export default GrammarTopics;