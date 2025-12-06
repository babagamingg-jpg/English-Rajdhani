import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity } from '../types';

const ChapterSummary: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [chapter, setChapter] = useState<ChapterEntity | null>(null);
  const [loading, setLoading] = useState(true);

  // Reader Mode State
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  // Scale: 0 (Small) to 6 (Huge)
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // Default to index 2 (Normal/Medium)
  const [theme, setTheme] = useState<'default' | 'sepia' | 'dark'>('default');
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Font size mapping (in pixels for reliable scaling)
  const FONT_SIZES = [14, 16, 18, 22, 26, 32, 40]; 

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();
      
      if (!error && data) {
        setChapter(data);
      } else {
        console.error("Error fetching summary:", error?.message);
      }
      setLoading(false);
    };

    if (chapterId) fetchContent();
  }, [chapterId]);

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = () => {
    const state = location.state as { backPath?: string } | null;
    if (state?.backPath) {
        navigate(state.backPath);
    } else {
        navigate(-1);
    }
  };

  const handleZoomOut = () => {
    setFontSizeIndex(prev => Math.max(0, prev - 1));
  };

  const handleZoomIn = () => {
    setFontSizeIndex(prev => Math.min(FONT_SIZES.length - 1, prev + 1));
  };

  // --- Dynamic Styles Helpers ---

  // Main page background (behind everything)
  const getPageBaseColor = () => {
    switch (theme) {
      case 'sepia': return 'bg-[#f4ecd8]';
      case 'dark': return 'bg-[#121212]';
      default: return 'bg-gray-50 dark:bg-background-dark';
    }
  };

  // Content Sheet style
  const getSheetStyle = () => {
    switch (theme) {
      case 'sepia': 
        // Seamless blending for reader mode
        return 'bg-[#f4ecd8] text-[#5b4636] shadow-none';
      case 'dark': 
        // Seamless blending for reader mode
        return 'bg-[#121212] text-[#e5e5e5] shadow-none';
      default: 
        // Card look for default mode
        return 'bg-white dark:bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] text-gray-800 dark:text-gray-100';
    }
  };

  // Text color for header elements (Back button, Settings button)
  const getHeaderTextColor = () => {
    if (theme === 'default') return 'text-white';
    if (theme === 'sepia') return 'text-[#5b4636]';
    return 'text-gray-200';
  };

  // Button background for header elements
  const getHeaderButtonBg = () => {
    if (theme === 'default') return 'bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/20';
    if (theme === 'sepia') return 'bg-[#e9e0c9] hover:bg-[#ded4bb] border-transparent';
    return 'bg-white/10 hover:bg-white/20 border-transparent';
  };

  // --- Content Renderers ---

  // Sepia color palette for Typography to override Tailwind Prose defaults
  const sepiaProse = {
    '--tw-prose-body': '#5b4636',
    '--tw-prose-headings': '#433422',
    '--tw-prose-lead': '#5b4636',
    '--tw-prose-links': '#8B5E3C',
    '--tw-prose-bold': '#433422',
    '--tw-prose-counters': '#6d5a4b',
    '--tw-prose-bullets': '#6d5a4b',
    '--tw-prose-hr': '#e6dcc6',
    '--tw-prose-quotes': '#433422',
    '--tw-prose-quote-borders': '#e6dcc6',
    '--tw-prose-captions': '#5b4636',
    '--tw-prose-code': '#433422',
    '--tw-prose-pre-code': '#5b4636',
    '--tw-prose-pre-bg': '#e6dcc6',
    '--tw-prose-th-borders': '#dcd1b8',
    '--tw-prose-td-borders': '#dcd1b8',
    '--tw-prose-invert-body': '#5b4636', // Fallbacks just in case
    '--tw-prose-invert-headings': '#433422',
  } as React.CSSProperties;

  const renderContent = () => {
    if (!chapter?.content) return <p className="opacity-60 text-center py-10">No content available.</p>;

    const contentData = typeof chapter.content === 'string' 
      ? JSON.parse(chapter.content) 
      : chapter.content;

    const { summary, keyPoints, importantTerms, text } = contentData;

    // Helper for cards inside the content
    const cardClass = theme === 'default' 
        ? 'bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50' 
        : 'border border-current border-opacity-20 bg-transparent';

    // Current pixel size for inline style
    const currentPixelSize = FONT_SIZES[fontSizeIndex];
    
    // We apply fontSize via style to ensure exact sizing beyond tailwind limits
    // We also inject the sepia color variables if needed
    const containerStyle = { 
        fontSize: `${currentPixelSize}px`, 
        lineHeight: '1.6',
        ...(theme === 'sepia' ? sepiaProse : {})
    };

    return (
        <div 
          className={`space-y-10 max-w-3xl mx-auto transition-all duration-200`}
          style={containerStyle}
        >
            
            {/* Main Summary Text */}
            <div 
              className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''} transition-colors duration-500`}
              // We set explicit 1em here so it respects the parent's pixel size
              style={{ fontSize: '1em' }}
            >
                 {summary ? (
                     <p className="opacity-90 leading-relaxed">
                        <span className="text-[1.5em] font-bold mr-1 float-left leading-none">
                            {summary.charAt(0)}
                        </span>
                        {summary.slice(1)}
                     </p>
                 ) : (
                    text && text.split('\n').map((para: string, i: number) => (
                        <p key={i} className="mb-4 opacity-90 leading-relaxed">{para}</p>
                    ))
                 )}
            </div>

            {/* Key Points Section */}
            {keyPoints && Array.isArray(keyPoints) && keyPoints.length > 0 && (
                <div className={`rounded-3xl p-6 md:p-8 ${cardClass} transition-colors duration-500`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'default' ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-80'}`} style={{ fontSize: '1.2em' }}>
                       <span className="material-symbols-outlined" style={{ fontSize: '1.2em' }}>lightbulb</span> Key Highlights
                    </h3>
                    <ul className="space-y-4">
                        {keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex gap-4 items-start">
                                <span className={`flex-shrink-0 mt-[0.6em] w-2 h-2 rounded-full ${theme === 'default' ? 'bg-indigo-400' : 'bg-current opacity-60'}`}></span>
                                <span className="opacity-90 leading-relaxed">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Vocabulary Section */}
            {importantTerms && typeof importantTerms === 'object' && Object.keys(importantTerms).length > 0 && (
                <div>
                    <h3 className={`font-bold mb-6 flex items-center gap-2 ${theme === 'default' ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-80'}`} style={{ fontSize: '1.2em' }}>
                       <span className="material-symbols-outlined" style={{ fontSize: '1.2em' }}>school</span> Vocabulary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(importantTerms).map(([term, def]: [string, any], idx) => (
                            <div key={idx} className={`rounded-2xl p-5 ${cardClass} transition-colors duration-500`}>
                                <span className={`block font-bold mb-1 ${theme === 'default' ? 'text-emerald-700 dark:text-emerald-400' : ''}`} style={{ fontSize: '1.1em' }}>
                                    {term}
                                </span>
                                <span className="opacity-80 leading-relaxed text-[0.9em]">{String(def)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="h-20"></div>
        </div>
    );
  };

  return (
    <div className={`relative h-full overflow-y-auto no-scrollbar transition-colors duration-700 ease-in-out ${getPageBaseColor()}`}>
       
       {/* GRADIENT LAYER - Independently animated for smoothness */}
       <div 
         className={`absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-500 transition-opacity duration-700 ease-in-out z-0 pointer-events-none ${
             theme === 'default' ? 'opacity-100' : 'opacity-0'
         }`}
       />

       {/* HEADER SECTION */}
       <div className="relative z-10 pt-4 pb-16 px-4">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <button 
                    onClick={handleBack} 
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${getHeaderButtonBg()} ${getHeaderTextColor()}`}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                
                <h1 
                    className={`text-lg font-bold truncate transition-opacity duration-500 ${getHeaderTextColor()} ${theme !== 'default' ? 'opacity-90' : 'opacity-0'}`}
                >
                    {chapter?.title}
                </h1>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
                
                {/* DIRECT ZOOM BUTTONS */}
                <button
                    onClick={handleZoomOut}
                    disabled={fontSizeIndex === 0}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border ${getHeaderButtonBg()} ${getHeaderTextColor()} ${fontSizeIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Decrease font size"
                >
                    <span className="material-symbols-outlined filled-icon">remove</span>
                </button>

                <button
                    onClick={handleZoomIn}
                    disabled={fontSizeIndex === FONT_SIZES.length - 1}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border ${getHeaderButtonBg()} ${getHeaderTextColor()} ${fontSizeIndex === FONT_SIZES.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Increase font size"
                >
                    <span className="material-symbols-outlined filled-icon">add</span>
                </button>

                {/* THEME MENU TOGGLE */}
                <div className="relative" ref={themeMenuRef}>
                    <button 
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${getHeaderButtonBg()} ${getHeaderTextColor()} ${showThemeMenu ? 'ring-2 ring-white/50' : ''}`}
                    >
                        <span className="material-symbols-outlined filled-icon">palette</span>
                    </button>

                    {/* Theme Dropdown */}
                    {showThemeMenu && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50 text-gray-800 dark:text-gray-100">
                            
                            {/* Color Themes */}
                            <div className="">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Color Mode</span>
                                <div className="flex gap-2">
                                    {/* Default Theme */}
                                    <button 
                                        onClick={() => setTheme('default')} 
                                        className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'default' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                                        title="Default"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-sm"></div>
                                    </button>
                                    
                                    {/* Sepia Theme */}
                                    <button 
                                        onClick={() => setTheme('sepia')} 
                                        className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'sepia' ? 'border-[#8B5E3C] bg-[#f4ecd8]' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                                        title="Sepia"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[#f4ecd8] border border-amber-900/10 shadow-sm"></div>
                                    </button>
                                    
                                    {/* Dark Theme */}
                                    <button 
                                        onClick={() => setTheme('dark')} 
                                        className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'dark' ? 'border-gray-400 bg-zinc-800' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                                        title="Dark"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-zinc-900 border border-gray-600 shadow-sm"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </div>

         {/* Immersive Title (Only in Default Theme) */}
         <div 
            className={`max-w-4xl mx-auto mt-6 text-center text-white transition-all duration-700 ${
                theme === 'default' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
         >
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                Chapter {chapter?.chapter_number}
             </div>
             <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-md font-display px-2">
                {chapter?.title}
             </h1>
         </div>
       </div>

       {/* CONTENT SHEET */}
       <div className={`relative z-10 -mt-8 rounded-t-[2.5rem] px-6 py-10 min-h-[85vh] transition-colors duration-700 ease-in-out ${getSheetStyle()}`}>
          {loading ? (
             <div className="max-w-3xl mx-auto space-y-6 opacity-50">
                <div className="h-4 bg-current rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-current rounded w-full animate-pulse"></div>
                <div className="h-4 bg-current rounded w-5/6 animate-pulse"></div>
             </div>
          ) : (
             <div className="animate-in slide-in-from-bottom-8 duration-500 delay-100">
                {renderContent()}
             </div>
          )}
       </div>

    </div>
  );
};

export default ChapterSummary;