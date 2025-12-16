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
  const FONT_SIZES = [14, 16, 18, 20, 24, 28, 32]; 

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
      default: return 'bg-slate-100 dark:bg-slate-950';
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

    let contentData: any = {};
    try {
        contentData = typeof chapter.content === 'string' 
          ? JSON.parse(chapter.content) 
          : chapter.content;
          
        // Handle double stringification if needed
        if (typeof contentData === 'string') {
            contentData = JSON.parse(contentData);
        }
    } catch (e) {
        console.error("Failed to parse content", e);
        return <p className="opacity-60 text-center py-10">Error loading content format.</p>;
    }

    // Unwrap 'fullChapter' if it exists (common in some data uploads)
    let dataToRender = contentData;
    if (contentData.fullChapter) {
        dataToRender = { ...contentData, ...contentData.fullChapter };
        // If metadata is at root but not in fullChapter, preserve it
        if (contentData.chapter_metadata && !dataToRender.chapter_metadata) {
            dataToRender.chapter_metadata = contentData.chapter_metadata;
        }
    }

    // High Contrast Card styling
    const cardClass = theme === 'default' 
        ? 'bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800' 
        : 'border border-current border-opacity-20 bg-transparent';
    
    // Typography Colors - INCREASED CONTRAST
    // English: Gray-950 (Almost Black)
    // Hindi: Blue-800 (Deep Blue)
    const textEnglish = theme === 'default' ? 'text-gray-950 dark:text-slate-100' : 'opacity-95';
    const textHindi = theme === 'default' ? 'text-blue-800 dark:text-blue-400' : 'opacity-85';

    const currentPixelSize = FONT_SIZES[fontSizeIndex];
    const containerStyle = { 
        fontSize: `${currentPixelSize}px`, 
        lineHeight: '1.6',
        ...(theme === 'sepia' ? sepiaProse : {})
    };

    // --- DETECT FORMATS ---

    // 1. New Format: { chapter_metadata, content: [{ paragraph_number, lines: [] }], glossary }
    if (Array.isArray(dataToRender.content)) {
        const { chapter_metadata, content, glossary } = dataToRender;
        
        // Define vibrant flashcard colors for glossary
        const vocabColors = [
            { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', pill: 'bg-blue-100 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200' },
            { bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-100 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', pill: 'bg-rose-100 dark:bg-rose-800/40 text-rose-800 dark:text-rose-200' },
            { bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', pill: 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200' },
            { bg: 'bg-violet-50 dark:bg-violet-900/10', border: 'border-violet-100 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300', pill: 'bg-violet-100 dark:bg-violet-800/40 text-violet-800 dark:text-violet-200' },
            { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', pill: 'bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200' },
            { bg: 'bg-cyan-50 dark:bg-cyan-900/10', border: 'border-cyan-100 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', pill: 'bg-cyan-100 dark:bg-cyan-800/40 text-cyan-800 dark:text-cyan-200' },
        ];

        return (
            <div className="space-y-10 max-w-3xl mx-auto transition-all duration-200 pb-24" style={containerStyle}>
                {/* Metadata Header */}
                <div className="text-center mb-8">
                     {chapter_metadata?.author && (
                        <div className={`font-serif italic text-[1.1em] ${theme === 'default' ? 'text-gray-700 dark:text-slate-400' : 'opacity-70'}`}>
                            By {chapter_metadata.author}
                        </div>
                     )}
                     {chapter_metadata?.source && (
                        <div className="text-xs opacity-50 mt-1 uppercase tracking-wide">{chapter_metadata.source}</div>
                     )}
                </div>

                {/* Paragraphs */}
                <div className="space-y-6">
                    {content.map((para: any, pIdx: number) => (
                        <div key={pIdx} className="animate-in slide-in-from-bottom-4 duration-500">
                             
                             {/* Paragraph Separator (Screenshot Style) */}
                             {para.paragraph_number && (
                                <div className="flex items-center gap-4 mb-4 mt-2 justify-center opacity-60">
                                    <span className="h-px w-12 bg-slate-400 dark:bg-slate-600"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                        PARA {para.paragraph_number}
                                    </span>
                                    <span className="h-px w-12 bg-slate-400 dark:bg-slate-600"></span>
                                </div>
                             )}

                             {/* Lines Card */}
                             <div className={`p-6 rounded-2xl ${cardClass} space-y-6`}>
                                 {para.lines && para.lines.map((line: any, lIdx: number) => {
                                     const enText = line.english || line.englishLine;
                                     const hiText = line.hindi || line.hindiTranslation;
                                     
                                     return (
                                         <div key={lIdx} className={`${lIdx > 0 ? 'pt-6 border-t border-dashed border-slate-100 dark:border-zinc-800' : ''}`}>
                                             {/* English - Bolder and Darker */}
                                             <p className={`mb-3 leading-relaxed font-display text-justify font-bold ${textEnglish}`}>
                                                 {enText}
                                             </p>
                                             {/* Hindi - Blue and Clear */}
                                             {hiText && (
                                                 <p className={`text-[0.95em] leading-relaxed font-body text-justify font-semibold ${textHindi}`}>
                                                     {hiText}
                                                 </p>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                        </div>
                    ))}
                </div>

                {/* Glossary - Colorful UI */}
                {glossary && Array.isArray(glossary) && glossary.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                                <span className="material-symbols-outlined text-xl">school</span>
                            </span>
                            <div>
                                <h3 className={`text-2xl font-bold font-display ${theme === 'default' ? 'text-gray-900 dark:text-white' : 'opacity-90'}`}>Vocabulary</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Key Words & Meanings</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {glossary.map((item: any, gIdx: number) => {
                                const color = vocabColors[gIdx % vocabColors.length];
                                const containerClass = theme === 'default'
                                    ? `${color.bg} ${color.border} border`
                                    : 'border border-current border-opacity-30';
                                
                                const wordColor = theme === 'default' ? color.text : 'text-current font-bold';
                                const pillClass = theme === 'default' ? color.pill : 'bg-current bg-opacity-10 border border-current border-opacity-10';

                                return (
                                    <div key={gIdx} className={`p-5 rounded-2xl shadow-sm ${containerClass}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className={`text-xl font-bold font-display tracking-tight ${wordColor}`}>
                                                {item.word}
                                            </h4>
                                        </div>
                                        <div className="text-[0.95em] opacity-90 mb-4 leading-snug font-medium">
                                            {item.meaning}
                                        </div>
                                        <div className={`h-px w-full mb-3 ${theme === 'default' ? 'bg-black/5 dark:bg-white/5' : 'bg-current opacity-20'}`}></div>
                                        <div className="flex justify-start">
                                            <div className={`px-3 py-1 rounded-lg text-[0.85em] font-body font-medium flex items-center gap-1.5 ${pillClass}`}>
                                                <span className="text-[10px] uppercase opacity-70 tracking-wider">Hindi:</span>
                                                {item.hindi_meaning}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 2. Fallback to Old Formats
    const { text, sections, author, introduction } = dataToRender;

    return (
        <div 
          className={`space-y-10 max-w-3xl mx-auto transition-all duration-200 pb-24`}
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
              <div className={`p-6 rounded-2xl ${theme === 'default' ? 'bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30' : 'border border-current border-opacity-30'}`}>
                 <h3 className="font-bold mb-2 opacity-90 text-[1.1em]">Introduction</h3>
                 <p className="opacity-85 leading-relaxed italic">{introduction}</p>
              </div>
            )}
            
            {/* SECTIONS: Line by Line Text */}
            {sections && Array.isArray(sections) && sections.length > 0 ? (
              <div className="space-y-12">
                {sections.map((section: any, idx: number) => {
                  let lines = section.lines;
                  if (!lines && section.content && typeof section.content === 'string') {
                      lines = parseContentToLines(section.content);
                  }

                  if (!lines || lines.length === 0) return null;

                  return (
                    <div key={idx} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'default' ? 'text-gray-900 dark:text-slate-200' : 'opacity-90'}`} style={{ fontSize: '1.2em' }}>
                        {section.title}
                      </h3>
                      
                      <div className="space-y-4">
                        {lines.map((line: any, lIdx: number) => (
                          <div key={lIdx} className={`p-6 rounded-2xl ${cardClass}`}>
                            <p className={`mb-2 leading-relaxed font-display font-bold ${textEnglish}`}>{line.englishLine}</p>
                            {line.hindiTranslation && (
                              <p className={`text-[0.9em] leading-relaxed font-body font-semibold ${textHindi}`}>
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
                /* Fallback to simple text */
                text && (
                  <div 
                    className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''} p-6 rounded-2xl ${cardClass}`}
                    style={{ fontSize: '1em' }}
                  >
                     {text.split('\n').map((para: string, i: number) => (
                        <p key={i} className="mb-4 opacity-90 leading-relaxed">{para}</p>
                     ))}
                  </div>
                )
            )}
        </div>
    );
  };

  // Safe Title Extraction logic
  let displayTitle = chapter?.title;
  try {
      if (chapter?.content) {
         let c = typeof chapter.content === 'string' ? JSON.parse(chapter.content) : chapter.content;
         if (typeof c === 'string') c = JSON.parse(c);
         
         if (c.fullChapter && c.fullChapter.chapter_metadata?.title) {
             displayTitle = c.fullChapter.chapter_metadata.title;
         } else if (c.chapter_metadata?.title) {
             displayTitle = c.chapter_metadata.title;
         }
      }
  } catch(e) {}

  return (
    <div className={`relative h-full overflow-y-auto no-scrollbar transition-colors duration-700 ease-in-out ${getPageBaseColor()}`}>
       
       {/* GRADIENT HEADER */}
       <div className="relative z-10 pt-4 pb-8 px-4 bg-gradient-to-b from-blue-600 via-indigo-600 to-indigo-800 shadow-lg mb-8">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <button 
                    onClick={handleBack} 
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${getHeaderButtonBg()} ${getHeaderTextColor()}`}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className={`text-lg font-bold truncate ${getHeaderTextColor()}`}>
                    {displayTitle}
                </h1>
            </div>

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
                                <button onClick={() => setTheme('default')} className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'default' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}>
                                    <div className="w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm"></div>
                                </button>
                                <button onClick={() => setTheme('sepia')} className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'sepia' ? 'border-[#8B5E3C] bg-[#f4ecd8]' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}>
                                    <div className="w-6 h-6 rounded-full bg-[#f4ecd8] border border-amber-900/10 shadow-sm"></div>
                                </button>
                                <button onClick={() => setTheme('dark')} className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${theme === 'dark' ? 'border-gray-400 bg-zinc-800' : 'border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}>
                                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-gray-600 shadow-sm"></div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </div>
       </div>

       {/* CONTENT AREA */}
       <div className="relative px-4 sm:px-6">
          {loading ? (
             <div className="max-w-3xl mx-auto space-y-6 opacity-50 pt-10">
                <div className="h-4 bg-current rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-current rounded w-full animate-pulse"></div>
                <div className="h-4 bg-current rounded w-5/6 animate-pulse"></div>
             </div>
          ) : (
             renderContent()
          )}
       </div>

    </div>
  );
};

export default ChapterRead;