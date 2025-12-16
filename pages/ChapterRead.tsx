import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity } from '../types';

const ChapterRead: React.FC = () => {
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
        console.error("Error fetching content:", error?.message);
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

  // Helper to parse content string if 'lines' array is missing
  const parseContentToLines = (content: string) => {
    if (!content) return [];
    // Normalize newlines
    const text = content.replace(/\r\n/g, '\n');
    // Split by separator '---' handling various spacings
    const parts = text.split(/\n\s*---\s*\n/);
    
    return parts.map(part => {
        const engMarker = "**English Line:**";
        const hindiMarker = "**Hindi Translation:**";
        
        const engIndex = part.indexOf(engMarker);
        const hindiIndex = part.indexOf(hindiMarker);
        
        if (engIndex === -1) return null;
        
        let englishLine = "";
        let hindiTranslation = "";
        
        if (hindiIndex !== -1) {
            englishLine = part.substring(engIndex + engMarker.length, hindiIndex).trim();
            hindiTranslation = part.substring(hindiIndex + hindiMarker.length).trim();
        } else {
            englishLine = part.substring(engIndex + engMarker.length).trim();
        }
        
        return { englishLine, hindiTranslation };
    }).filter(item => item !== null);
  };

  // --- Dynamic Styles Helpers ---

  const getPageBaseColor = () => {
    switch (theme) {
      case 'sepia': return 'bg-[#f4ecd8]';
      case 'dark': return 'bg-[#121212]';
      default: return 'bg-gray-50 dark:bg-background-dark';
    }
  };

  const getSheetStyle = () => {
    switch (theme) {
      case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636] shadow-none';
      case 'dark': return 'bg-[#121212] text-[#e5e5e5] shadow-none';
      default: return 'bg-white dark:bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] text-gray-800 dark:text-gray-100';
    }
  };

  const getHeaderTextColor = () => {
    if (theme === 'default') return 'text-white';
    if (theme === 'sepia') return 'text-[#5b4636]';
    return 'text-gray-200';
  };

  const getHeaderButtonBg = () => {
    if (theme === 'default') return 'bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/20';
    if (theme === 'sepia') return 'bg-[#e9e0c9] hover:bg-[#ded4bb] border-transparent';
    return 'bg-white/10 hover:bg-white/20 border-transparent';
  };

  // --- Content Renderers ---

  const sepiaProse = {
    '--tw-prose-body': '#5b4636',
    '--tw-prose-headings': '#433422',
  } as React.CSSProperties;

  const renderContent = () => {
    if (!chapter?.content) return <p className="opacity-60 text-center py-10">No content available.</p>;

    const contentData = typeof chapter.content === 'string' 
      ? JSON.parse(chapter.content) 
      : chapter.content;

    const { text, sections, author, introduction } = contentData;

    // Card styling
    const cardClass = theme === 'default' 
        ? 'bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50' 
        : 'border border-current border-opacity-20 bg-transparent';

    const currentPixelSize = FONT_SIZES[fontSizeIndex];
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
            {/* Author Name */}
            {author && (
              <div className="text-center opacity-70 italic -mt-4 mb-8">
                By {author}
              </div>
            )}

            {/* Introduction */}
            {introduction && (
              <div className={`p-6 rounded-2xl ${theme === 'default' ? 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30' : 'border border-current border-opacity-30'}`}>
                 <h3 className="font-bold mb-2 opacity-90 text-[1.1em]">Introduction</h3>
                 <p className="opacity-85 leading-relaxed italic">{introduction}</p>
              </div>
            )}
            
            {/* SECTIONS: Line by Line Text */}
            {sections && Array.isArray(sections) && sections.length > 0 ? (
              <div className="space-y-12">
                {sections.map((section: any, idx: number) => {
                  // Determine lines - either from 'lines' array or parsed from 'content' string
                  let lines = section.lines;
                  if (!lines && section.content && typeof section.content === 'string') {
                      lines = parseContentToLines(section.content);
                  }

                  if (!lines || lines.length === 0) return null;

                  return (
                    <div key={idx} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'default' ? 'text-indigo-700 dark:text-indigo-300' : 'opacity-90'}`} style={{ fontSize: '1.2em' }}>
                        {section.title}
                      </h3>
                      
                      <div className="space-y-4">
                        {lines.map((line: any, lIdx: number) => (
                          <div key={lIdx} className={`p-5 rounded-2xl ${cardClass} hover:bg-opacity-80 transition-colors`}>
                            <p className="font-medium mb-2 opacity-95 leading-relaxed font-display">{line.englishLine}</p>
                            {line.hindiTranslation && (
                              <p className={`text-[0.9em] ${theme === 'default' ? 'text-gray-600 dark:text-gray-400' : 'opacity-75'} leading-relaxed font-body`}>
                                {line.hindiTranslation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
                /* Fallback to simple text if no sections structure */
                text && (
                  <div 
                    className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''} transition-colors duration-500`}
                    style={{ fontSize: '1em' }}
                  >
                     {text.split('\n').map((para: string, i: number) => (
                        <p key={i} className="mb-4 opacity-90 leading-relaxed">{para}</p>
                     ))}
                  </div>
                )
            )}

            {!sections && !text && (
                 <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <span className="material-symbols-outlined text-5xl mb-2">menu_book</span>
                    <p>Full text not available for this chapter.</p>
                 </div>
            )}

            <div className="h-20"></div>
        </div>
    );
  };

  return (
    <div className={`relative h-full overflow-y-auto no-scrollbar transition-colors duration-700 ease-in-out ${getPageBaseColor()}`}>
       
       {/* GRADIENT LAYER */}
       <div 
         className={`absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 transition-opacity duration-700 ease-in-out z-0 pointer-events-none ${
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
                
                <button
                    onClick={handleZoomOut}
                    disabled={fontSizeIndex === 0}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border ${getHeaderButtonBg()} ${getHeaderTextColor()} ${fontSizeIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="material-symbols-outlined filled-icon">remove</span>
                </button>

                <button
                    onClick={handleZoomIn}
                    disabled={fontSizeIndex === FONT_SIZES.length - 1}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border ${getHeaderButtonBg()} ${getHeaderTextColor()} ${fontSizeIndex === FONT_SIZES.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="material-symbols-outlined filled-icon">add</span>
                </button>

                {/* THEME MENU */}
                <div className="relative" ref={themeMenuRef}>
                    <button 
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${getHeaderButtonBg()} ${getHeaderTextColor()} ${showThemeMenu ? 'ring-2 ring-white/50' : ''}`}
                    >
                        <span className="material-symbols-outlined filled-icon">palette</span>
                    </button>

                    {showThemeMenu && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50 text-gray-800 dark:text-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Color Mode</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setTheme('default')} 
                                    className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'default' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm"></div>
                                </button>
                                <button 
                                    onClick={() => setTheme('sepia')} 
                                    className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'sepia' ? 'border-[#8B5E3C] bg-[#f4ecd8]' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#f4ecd8] border border-amber-900/10 shadow-sm"></div>
                                </button>
                                <button 
                                    onClick={() => setTheme('dark')} 
                                    className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'dark' ? 'border-gray-400 bg-zinc-800' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-gray-600 shadow-sm"></div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </div>

         {/* Immersive Title (Default Theme Only) */}
         <div 
            className={`max-w-4xl mx-auto mt-6 text-center text-white transition-all duration-700 ${
                theme === 'default' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
         >
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-[16px]">chrome_reader_mode</span>
                Full Chapter
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

export default ChapterRead;