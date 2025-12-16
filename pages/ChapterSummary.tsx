import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity, GrammarSection } from '../types';

const ChapterSummary: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [chapter, setChapter] = useState<ChapterEntity | null>(null);
  const [loading, setLoading] = useState(true);

  // Reader Mode State
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // Default to index 2 (Normal/Medium)
  const [theme, setTheme] = useState<'default' | 'sepia' | 'dark'>('default');
  const themeMenuRef = useRef<HTMLDivElement>(null);

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

  const getParsedContent = (rawContent: any) => {
     let parsed = rawContent;
     if (typeof rawContent === 'string') {
        try {
            if (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('[')) {
                parsed = JSON.parse(rawContent);
            } else {
                return { text: rawContent };
            }
        } catch (e) {
            console.warn("Failed to parse content JSON, treating as text", e);
            return { text: rawContent };
        }
     } 
     if (!parsed) parsed = {};
     if (parsed.chapter_info && Array.isArray(parsed.content)) {
         return { ...parsed, isGrammar: true };
     }
     if (parsed.summary && typeof parsed.summary === 'string') {
         try {
             const trimmedSummary = parsed.summary.trim();
             if (trimmedSummary.startsWith('{')) {
                 const nestedSummary = JSON.parse(trimmedSummary);
                 if (nestedSummary.chapter_summary) {
                     return { ...nestedSummary.chapter_summary, isNewFormat: true };
                 }
                 if (nestedSummary.sections || nestedSummary.heading_en) {
                    return { ...nestedSummary, isNewFormat: true };
                 }
             }
         } catch (e) { }
     }
     if (parsed.chapter_summary) {
         return { ...parsed.chapter_summary, isNewFormat: true };
     }
     if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.some((s: any) => s.content_en || s.heading_en)) {
         return { ...parsed, isNewFormat: true };
     }
     return parsed;
  };

  const parseLegacyContentToLines = (content: string) => {
    if (!content) return [];
    const text = content.replace(/\r\n/g, '\n');
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

  // --- Renderers ---

  const renderContent = () => {
    if (!chapter) return <p className="opacity-60 text-center py-10">No content available.</p>;

    const data = getParsedContent(chapter.content);
    
    // Typography Colors - Darkened for visibility
    const textHeading = theme === 'default' ? 'text-gray-950 dark:text-white' : '';
    const textBody = theme === 'default' ? 'text-gray-900 dark:text-slate-200' : '';
    const textHindi = theme === 'default' ? 'text-blue-800 dark:text-blue-400' : '';
    
    // --- GRAMMAR RENDERER ---
    if (data.isGrammar) {
        return (
            <div className="space-y-12 max-w-3xl mx-auto pb-20">
                {/* Intro / Objective */}
                {data.chapter_info && (
                    <div className="text-center space-y-2 mb-8 animate-in slide-in-from-bottom-4">
                        <div className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-amber-200 dark:border-amber-800">
                            {data.chapter_info.objective}
                        </div>
                    </div>
                )}

                {/* Sections Loop */}
                {data.content && data.content.map((section: GrammarSection, sIdx: number) => (
                    <div key={sIdx} className="animate-in slide-in-from-bottom-4" style={{ animationDelay: `${sIdx * 100}ms` }}>
                        <div className="flex items-center gap-4 mb-5">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                                {sIdx + 1}
                            </span>
                            <h2 className={`text-xl font-bold leading-tight ${textHeading}`}>
                                {section.title}
                            </h2>
                        </div>
                        
                        <div className={`space-y-6 ${section.note || section.description ? 'mt-2' : ''}`}>
                            
                            {/* Section Note */}
                            {(section.note || section.description) && (
                                <p className="text-gray-800 dark:text-gray-200 italic bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border-l-4 border-amber-400 shadow-sm font-medium">
                                    {section.note || section.description}
                                </p>
                            )}

                            {/* 1. Concepts */}
                            {section.concepts && section.concepts.map((concept: any, cIdx: number) => (
                                <div key={cIdx} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    {concept.type && (
                                        <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400 mb-1">{concept.type}</h3>
                                    )}
                                    {concept.concept_name && (
                                        <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400 mb-2">{concept.concept_name}</h3>
                                    )}

                                    <div className="space-y-3">
                                        {concept.english_text && <p className={`font-bold ${textBody}`}>{concept.english_text}</p>}
                                        {concept.hindi_explanation && <p className={`text-sm font-semibold ${textHindi}`}>{concept.hindi_explanation}</p>}
                                        {concept.meaning && <p className={`font-bold ${textBody}`}>{concept.meaning}</p>}
                                        {concept.hindi && <p className={`text-sm font-semibold ${textHindi}`}>{concept.hindi}</p>}
                                    </div>

                                    {(concept.examples || concept.example) && (
                                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-2">Ex:</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 italic">
                                                {Array.isArray(concept.examples) ? concept.examples.join(', ') : (concept.examples || concept.example)}
                                            </span>
                                        </div>
                                    )}

                                    {concept.types && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {concept.types.map((t: any, tIdx: number) => (
                                                <div key={tIdx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-200">{t.type}</div>
                                                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-1 font-bold">({t.hindi_meaning})</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{t.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* 2. Types/Classifications */}
                            {section.types && (
                                <div className="grid gap-4">
                                    {section.types.map((type: any, tIdx: number) => (
                                        <div key={tIdx} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-base text-gray-950 dark:text-white">{type.type_name || type.name}</span>
                                                    {(type.hindi_name || type.hindi) && <span className="ml-2 text-sm text-blue-700 dark:text-blue-400 font-bold">({type.hindi_name || type.hindi})</span>}
                                                </div>
                                            </div>
                                            
                                            <div className="p-5 space-y-3">
                                                {(type.definition || type.explanation) && (
                                                    <p className={`text-base font-bold leading-relaxed ${textBody}`}>
                                                        {type.definition || type.explanation}
                                                    </p>
                                                )}
                                                {type.hindi_explanation && (
                                                    <p className={`text-sm font-semibold italic ${textHindi}`}>
                                                        {type.hindi_explanation}
                                                    </p>
                                                )}
                                                {type.rule && (
                                                    <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                        <span className="material-symbols-outlined text-sm">info</span>
                                                        {type.rule}
                                                    </div>
                                                )}

                                                {type.key_rules && (
                                                    <div className="space-y-2 mt-2 pl-2 border-l-2 border-amber-200 dark:border-amber-800">
                                                        {type.key_rules.map((rule: any, rIdx: number) => (
                                                            <div key={rIdx} className="pl-2">
                                                                <div className="text-slate-900 dark:text-slate-200 font-bold text-sm">{rule.rule_en}</div>
                                                                <div className="text-blue-700 dark:text-blue-400 text-xs font-semibold">{rule.rule_hi}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {type.difference_trick && (
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 mt-2">
                                                        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">lightbulb</span> Tip: {type.difference_trick.concept}
                                                        </div>
                                                        <p className="text-sm text-slate-900 dark:text-slate-200 font-semibold">{type.difference_trick.explanation}</p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{type.difference_trick.hindi_explanation}</p>
                                                    </div>
                                                )}
                                                
                                                {type.examples && (
                                                    <div className="pt-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {(Array.isArray(type.examples) ? type.examples : type.examples.split(',')).map((ex: string, eIdx: number) => (
                                                                <span key={eIdx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                    {ex.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 3. Golden Rules */}
                            {section.golden_rules_for_number && (
                                <div className="space-y-3">
                                    {section.golden_rules_for_number.map((rule: any, rIdx: number) => (
                                        <div key={rIdx} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border-l-4 border-purple-500 shadow-sm">
                                            <p className="font-bold text-slate-900 dark:text-white text-base mb-1">{rule.rule}</p>
                                            {rule.hindi_explanation && <p className="text-sm text-blue-700 dark:text-blue-400 mb-2 font-semibold">{rule.hindi_explanation}</p>}
                                            <div className="text-xs font-mono bg-slate-50 dark:bg-zinc-800 p-2 rounded text-purple-700 dark:text-purple-400">
                                                {rule.example}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 4. Exam Rules */}
                            {section.rules && (
                                <div className="space-y-4">
                                    {section.rules.map((rule: any, rIdx: number) => (
                                        <div key={rIdx} className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <span className="material-symbols-outlined text-5xl text-rose-500">warning</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">RULE {rule.rule_id}</span>
                                                    <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm uppercase tracking-wide">{rule.concept}</h3>
                                                </div>
                                                <p className="text-slate-900 dark:text-slate-200 font-bold text-base mb-1">{rule.hindi_explanation}</p>
                                                {rule.usage && <p className="text-sm text-slate-600 mb-3">{rule.usage}</p>}
                                                
                                                {rule.examples && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {rule.examples.map((ex: string, exIdx: number) => (
                                                            <span key={exIdx} className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{ex}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {(rule.sentence || rule.correction) && (
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm border-l-2 border-rose-400">
                                                        {rule.sentence && <div className="font-mono text-slate-800 dark:text-slate-300 font-semibold">❌ {rule.sentence}</div>}
                                                        {rule.correction && <div className="font-mono text-green-800 dark:text-green-400 mt-1 font-bold">✅ {rule.correction}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- LITERATURE RENDERER ---
    const isNewFormat = !!data.isNewFormat;
    const cardClass = theme === 'default' 
        ? 'bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800' 
        : 'border border-current border-opacity-20 bg-transparent';
    
    // Fix: Define sepiaProse before usage
    const sepiaProse = {
        '--tw-prose-body': '#5b4636',
        '--tw-prose-headings': '#433422',
    } as React.CSSProperties;

    const containerStyle = { 
        fontSize: `${FONT_SIZES[fontSizeIndex]}px`, 
        lineHeight: '1.7',
        ...(theme === 'sepia' ? sepiaProse : {})
    };

    const iconMap: Record<string, string> = {
        author: 'person',
        type_of_prose: 'category',
        famous_quote: 'format_quote',
        core_theme: 'topic',
        definition_of_civilization: 'history_edu'
    };

    return (
        <div 
          className={`space-y-10 max-w-3xl mx-auto transition-all duration-200 pb-24`}
          style={containerStyle}
        >
            {data.author && typeof data.author === 'string' && (
              <div className="text-center opacity-70 italic -mt-4 mb-8">
                By {data.author}
              </div>
            )}
            
            {/* Key Highlights */}
            {isNewFormat && data.key_highlights && (
                <div className={`rounded-3xl p-6 md:p-8 ${cardClass}`}>
                    <h3 className={`font-bold mb-6 flex items-center gap-2 ${theme === 'default' ? 'text-indigo-700 dark:text-indigo-400' : 'opacity-80'}`} style={{ fontSize: '1.2em' }}>
                       <span className="material-symbols-outlined" style={{ fontSize: '1.2em' }}>lightbulb</span> Key Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(data.key_highlights).map(([key, value]: [string, any], idx: number) => {
                            const isQuote = key === 'famous_quote';
                            const isLong = (typeof value === 'string' && value.length > 50) || isQuote;
                            const icon = iconMap[key] || 'label';
                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                            return (
                                <div 
                                    key={idx} 
                                    className={`${isLong ? 'md:col-span-2' : ''} ${isQuote ? 'bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30' : ''}`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`material-symbols-outlined text-[18px] ${theme === 'default' ? 'text-indigo-400 opacity-70' : 'opacity-50'}`}>{icon}</span>
                                        <span className={`text-[0.75em] font-bold uppercase tracking-widest ${theme === 'default' ? 'text-slate-400 dark:text-slate-500' : 'opacity-60'}`}>{label}</span>
                                    </div>
                                    <p className={`${isQuote ? 'font-serif italic text-lg text-slate-900 dark:text-white leading-relaxed' : 'font-semibold text-slate-800 dark:text-slate-200 leading-relaxed'}`}>
                                        {isQuote ? `“${value}”` : value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sections */}
            {isNewFormat && data.sections && data.sections.map((section: any, idx: number) => (
                <div key={idx} className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-4">
                         {section.heading_en && (
                             <h3 className={`font-bold ${textHeading}`} style={{ fontSize: '1.3em' }}>
                                {section.heading_en}
                             </h3>
                         )}
                         {section.heading_hi && (
                             <h4 className={`font-medium mt-1 ${theme === 'default' ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'}`} style={{ fontSize: '1em' }}>
                                {section.heading_hi}
                             </h4>
                         )}
                    </div>
                    
                    <div className={`p-6 rounded-2xl ${cardClass} hover:shadow-md transition-shadow space-y-4`}>
                        {section.content_en && (
                            <p className={`leading-relaxed font-display text-justify font-bold ${textBody}`}>{section.content_en}</p>
                        )}
                        {section.content_hi && (
                            <div className={`mt-4 pt-4 border-t border-dashed ${theme === 'default' ? 'border-slate-100 dark:border-zinc-800' : 'border-current border-opacity-20'}`}>
                                <p className={`text-[0.95em] leading-relaxed font-body text-justify font-semibold ${textHindi}`}>
                                    {section.content_hi}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Legacy Text */}
            {!isNewFormat && (data.summary || data.text) && !data.sections && (
              <div className={`p-6 rounded-2xl ${cardClass}`}>
                  <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`} style={{ fontSize: '1em' }}>
                      {data.summary ? (
                          <p className={`font-bold leading-relaxed ${textBody}`}>{data.summary}</p>
                      ) : (
                          data.text && typeof data.text === 'string' && data.text.split('\n').map((para: string, i: number) => (
                              <p key={i} className={`mb-4 font-bold leading-relaxed ${textBody}`}>{para}</p>
                          ))
                      )}
                  </div>
              </div>
            )}

            {/* Legacy Sections */}
            {!isNewFormat && data.sections && Array.isArray(data.sections) && data.sections.length > 0 && (
              <div className="space-y-12 mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800">
                {data.sections.map((section: any, idx: number) => {
                  let lines = section.lines;
                  if (!lines && section.content && typeof section.content === 'string') {
                      lines = parseLegacyContentToLines(section.content);
                  }
                  if (!lines || lines.length === 0) return null;
                  return (
                    <div key={idx} className="animate-in slide-in-from-bottom-4 duration-500">
                      <h3 className={`font-bold mb-4 flex items-center gap-2 ${textHeading}`} style={{ fontSize: '1.2em' }}>
                        {section.title}
                      </h3>
                      <div className="space-y-4">
                        {lines.map((line: any, lIdx: number) => (
                          <div key={lIdx} className={`p-6 rounded-2xl ${cardClass}`}>
                            <p className={`mb-2 leading-relaxed font-display font-bold ${textBody}`}>{line.englishLine}</p>
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
            )}
        </div>
    );
  };

  let contentTitle = "";
  if (chapter) {
      const parsed = getParsedContent(chapter.content);
      if (parsed.chapter_info?.topic) {
          contentTitle = parsed.chapter_info.topic;
      } else {
          contentTitle = parsed.title || chapter.title;
      }
  }

  return (
    <div className={`relative h-full overflow-y-auto no-scrollbar transition-colors duration-700 ease-in-out ${getPageBaseColor()}`}>
       
       {/* GRADIENT HEADER */}
       <div className={`relative z-10 pt-4 pb-8 px-4 bg-gradient-to-br shadow-lg mb-8 transition-colors duration-700 ${
            contentTitle.includes('Noun') || location.state?.backPath?.includes('grammar')
            ? 'from-amber-500 via-orange-500 to-amber-600'
            : 'from-blue-600 via-indigo-600 to-indigo-700'
         }`}>
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <button 
                    onClick={handleBack} 
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${getHeaderButtonBg()} ${getHeaderTextColor()}`}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className={`text-lg font-bold truncate ${getHeaderTextColor()}`}>
                    {contentTitle || chapter?.title}
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

export default ChapterSummary;