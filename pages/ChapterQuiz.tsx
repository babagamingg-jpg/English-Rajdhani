import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

interface Question {
  question: string;
  options: string[];
  answer?: string;
  correct_answer?: number; // Index of correct answer
  explanation?: string;
}

type QuizStatus = 'loading' | 'active' | 'result' | 'solution';

interface QuizState {
  answers: Record<number, number>; // qIndex -> optionIndex
  visited: Set<number>;
  markedForReview: Set<number>;
  timeTaken: Record<number, number>; // seconds per question
}

const ChapterQuiz: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Data State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('loading');
  const [quizMeta, setQuizMeta] = useState<{ title?: string; author?: string }>({});
  
  // Quiz Session State
  const [currentQ, setCurrentQ] = useState(0);
  const [state, setState] = useState<QuizState>({
    answers: {},
    visited: new Set([0]),
    markedForReview: new Set(),
    timeTaken: {}
  });
  
  // Timer State (Total Quiz Time)
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // UI State
  const [showPalette, setShowPalette] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Constants
  const POSITIVE_MARK = 1.0;
  const NEGATIVE_MARK = 0;

  // --- Initialization ---

  useEffect(() => {
    const fetchQuiz = async () => {
      setQuizStatus('loading');
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('title, quiz')
          .eq('id', chapterId)
          .single();

        if (data?.quiz) {
            let quizData = data.quiz;
            
            // Handle double stringification or string format
            if (typeof quizData === 'string') {
                try {
                    quizData = JSON.parse(quizData);
                    // Check if it's nested again (common in some upload scripts)
                    if (typeof quizData === 'string') {
                        quizData = JSON.parse(quizData);
                    }
                } catch (e) {
                    console.error("Error parsing quiz JSON:", e);
                    quizData = { questions: [] };
                }
            }

            const qArray = Array.isArray(quizData) ? quizData : (quizData.questions || []);
            setQuizMeta({ title: quizData.chapter || data.title, author: quizData.author });
            
            // Normalize questions
            const normalizedQuestions = qArray.map((q: any) => {
                // Case 1: Options is an Object map {"A": "Text", "B": "Text"}
                if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                    // Sort keys to ensure A, B, C, D order
                    const keys = Object.keys(q.options).sort(); 
                    const optionsArray = keys.map(key => q.options[key]);
                    
                    // Resolve correct answer index from letter (e.g., "A" -> 0)
                    let correctIdx = -1;
                    if (typeof q.correct_answer === 'string') {
                        const ansKey = q.correct_answer.trim();
                        correctIdx = keys.indexOf(ansKey);
                    } else if (typeof q.correct_answer === 'number') {
                        correctIdx = q.correct_answer;
                    }

                    return {
                        question: q.question,
                        options: optionsArray,
                        correct_answer: correctIdx,
                        explanation: q.explanation
                    };
                }

                // Case 2: Standard Array Options
                let correctIdx = q.correct_answer;
                
                // Legacy: String match "Answer Text" === "Answer Text"
                if (typeof correctIdx !== 'number' && q.answer && Array.isArray(q.options)) {
                    correctIdx = q.options.findIndex((opt: string) => opt === q.answer);
                }
                
                // Legacy: Letter match "A" -> 0 for array options
                if (typeof correctIdx !== 'number' && typeof q.correct_answer === 'string' && Array.isArray(q.options)) {
                    const charCode = q.correct_answer.toUpperCase().charCodeAt(0);
                    // 'A' is 65
                    if (charCode >= 65 && charCode < 65 + q.options.length) {
                        correctIdx = charCode - 65;
                    }
                }

                return { ...q, correct_answer: correctIdx };
            });

            // Filter out invalid questions
            const validQuestions = normalizedQuestions.filter((q: any) => 
                q.options && q.options.length > 0 && typeof q.correct_answer === 'number' && q.correct_answer >= 0
            );

            setQuestions(validQuestions);
            setQuizStatus(validQuestions.length > 0 ? 'active' : 'result');
        } else {
            setQuestions([]);
            setQuizStatus('result');
        }
      } catch (err) {
          console.error("Quiz fetch error:", err);
          setQuestions([]);
          setQuizStatus('result');
      }
    };

    if (chapterId) fetchQuiz();
    
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [chapterId]);

  // --- Timer Logic ---

  useEffect(() => {
    if (quizStatus === 'active' && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
        
        // Update time taken for current question
        setState(prev => ({
            ...prev,
            timeTaken: {
                ...prev.timeTaken,
                [currentQ]: (prev.timeTaken[currentQ] || 0) + 1
            }
        }));
      }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStatus, isPaused, currentQ]);


  // --- Event Handlers ---

  const handleOptionSelect = (optionIdx: number) => {
     if (quizStatus !== 'active') return;
     setState(prev => ({
         ...prev,
         answers: { ...prev.answers, [currentQ]: optionIdx }
     }));
  };

  const handleNext = () => {
      const nextQ = currentQ + 1;
      if (nextQ < questions.length) {
          setCurrentQ(nextQ);
          setState(prev => ({
              ...prev,
              visited: new Set(prev.visited).add(nextQ)
          }));
      }
  };

  const handleSaveAndNext = () => {
      handleNext();
  };

  const handlePrev = () => {
      if (currentQ > 0) {
          setCurrentQ(currentQ - 1);
      }
  };

  const handleClear = () => {
      setState(prev => {
          const newAnswers = { ...prev.answers };
          delete newAnswers[currentQ];
          return { ...prev, answers: newAnswers };
      });
  };

  const handleMarkReview = () => {
      setState(prev => {
          const newMarked = new Set(prev.markedForReview);
          if (newMarked.has(currentQ)) {
              newMarked.delete(currentQ);
          } else {
              newMarked.add(currentQ);
          }
          return { ...prev, markedForReview: newMarked };
      });
  };

  const handleSubmit = () => {
      setQuizStatus('result');
      setShowPalette(false);
  };

  const handleBack = () => {
    const state = location.state as { backPath?: string } | null;
    if (state?.backPath) {
        navigate(state.backPath);
    } else {
        navigate(-1);
    }
  };

  // --- Helper Functions ---

  const formatTime = (totalSeconds: number) => {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (idx: number) => {
      if (idx === currentQ) return 'current';
      if (state.markedForReview.has(idx)) return 'review';
      if (state.answers.hasOwnProperty(idx)) return 'answered';
      if (state.visited.has(idx)) return 'visited';
      return 'not_visited';
  };

  const calculateScore = () => {
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      let score = 0;

      questions.forEach((q, idx) => {
          if (state.answers.hasOwnProperty(idx)) {
              if (state.answers[idx] === q.correct_answer) {
                  correct++;
                  score += POSITIVE_MARK;
              } else {
                  wrong++;
                  score -= NEGATIVE_MARK;
              }
          } else {
              skipped++;
          }
      });

      return { correct, wrong, skipped, score, totalQuestions: questions.length };
  };

  // --- Renderers ---

  if (quizStatus === 'loading') {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  // 1. RESULT VIEW
  if (quizStatus === 'result') {
      const stats = calculateScore();
      // Avoid division by zero
      const maxScore = stats.totalQuestions * POSITIVE_MARK;
      const scorePercent = maxScore > 0 
          ? Math.max(0, Math.round((stats.score / maxScore) * 100))
          : 0;
      
      return (
          <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-y-auto no-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                      <button onClick={handleBack} className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</button>
                      <h1 className="text-lg font-bold text-gray-800 dark:text-white">Performance</h1>
                  </div>
                  <button onClick={handleBack} className="material-symbols-outlined text-gray-400">close</button>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 flex flex-col items-center">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Keep Practicing</h2>
                  <p className="text-gray-500 text-sm mb-8">Assessment Complete</p>

                  {/* Circular Progress */}
                  <div className="relative w-48 h-48 mb-10">
                      <svg className="w-full h-full transform -rotate-90">
                          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-slate-800" />
                          <circle 
                              cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" 
                              className="text-amber-500 transition-all duration-1000 ease-out"
                              strokeDasharray={283}
                              strokeDashoffset={283 - (283 * (scorePercent / 100))}
                              strokeLinecap="round"
                          />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-amber-500">{scorePercent}%</span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Score</span>
                      </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                      {/* Correct */}
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <span className="material-symbols-outlined text-green-500 mb-1">check_circle</span>
                          <span className="text-xs font-bold text-gray-400 uppercase mb-1">Correct</span>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">{stats.correct}</span>
                      </div>
                      
                      {/* Wrong */}
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <span className="material-symbols-outlined text-red-500 mb-1">cancel</span>
                          <span className="text-xs font-bold text-gray-400 uppercase mb-1">Wrong</span>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">{stats.wrong}</span>
                      </div>

                      {/* Skipped */}
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <span className="material-symbols-outlined text-amber-500 mb-1">error</span>
                          <span className="text-xs font-bold text-gray-400 uppercase mb-1">Skipped</span>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">{stats.skipped}</span>
                      </div>

                      {/* Time */}
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <span className="material-symbols-outlined text-blue-500 mb-1">schedule</span>
                          <span className="text-xs font-bold text-gray-400 uppercase mb-1">Time</span>
                          <span className="text-xl font-bold text-gray-800 dark:text-white">{Math.floor(secondsElapsed / 60)}m {secondsElapsed % 60}s</span>
                      </div>
                  </div>

                  {/* Solutions Button */}
                  <button 
                      onClick={() => setQuizStatus('solution')}
                      className="w-full max-w-sm bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                      Detailed Solutions
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
              </div>
          </div>
      );
  }

  // 2. QUIZ & SOLUTION VIEW
  // Reuse structure but vary data/styles
  const isSolution = quizStatus === 'solution';
  const currentQuestion = questions[currentQ];
  const totalQuestions = questions.length;
  
  if (!currentQuestion) return null; // Safety

  // Solution Mode Specifics
  const userAns = state.answers[currentQ];
  const correctAns = currentQuestion.correct_answer;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-900 font-display">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 shadow-sm z-20">
          <div className="flex items-center justify-between px-4 py-3">
              {isSolution ? (
                 <div className="flex items-center gap-3">
                     <button onClick={() => setQuizStatus('result')} className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</button>
                     <span className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">Solutions: {quizMeta.title || 'Chapter Quiz'}</span>
                 </div>
              ) : (
                 <>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsPaused(!isPaused)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                             <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-lg">{isPaused ? 'play_arrow' : 'pause'}</span>
                         </button>
                         <span className="font-bold text-gray-800 dark:text-white font-mono text-lg">{formatTime(secondsElapsed)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-md">
                             <span className="material-symbols-outlined text-gray-500 text-sm">translate</span>
                             <span className="text-xs font-bold text-gray-600 dark:text-gray-300">EN</span>
                         </div>
                         <button onClick={() => setShowPalette(true)} className="material-symbols-outlined text-gray-600 dark:text-gray-300">menu</button>
                    </div>
                 </>
              )}
          </div>
          
          {/* Question Info Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold">
                      {currentQ + 1}
                  </span>
                  
                  {!isSolution && (
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        <span>{formatTime(state.timeTaken[currentQ] || 0)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                      <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">+{POSITIVE_MARK}</span>
                  </div>
              </div>
              
              {!isSolution && (
                  <button onClick={handleMarkReview}>
                      <span className={`material-symbols-outlined text-[20px] ${state.markedForReview.has(currentQ) ? 'text-purple-500 filled-icon' : 'text-gray-300'}`}>star</span>
                  </button>
              )}
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
          
          {/* Question Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 mb-4 relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
             <p className="text-gray-800 dark:text-white font-medium text-lg leading-relaxed">
                {currentQuestion.question}
             </p>
          </div>

          {/* Options List */}
          <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                  let statusClass = "bg-white dark:bg-slate-800 border-transparent text-gray-700 dark:text-gray-200";
                  let badgeClass = "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400";
                  let icon = null;

                  if (isSolution) {
                      if (idx === correctAns) {
                          // Correct Answer
                          statusClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-300";
                          badgeClass = "bg-emerald-500 text-white";
                          icon = "check_circle";
                      } else if (idx === userAns && idx !== correctAns) {
                          // User Wrong Selection
                          statusClass = "bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-800 dark:text-rose-300";
                          badgeClass = "bg-rose-500 text-white";
                          icon = "cancel";
                      } else {
                          // Unselected Options
                          statusClass = "opacity-60 bg-white dark:bg-slate-800 border-transparent";
                      }
                  } else {
                      // Quiz Mode
                      if (state.answers[currentQ] === idx) {
                          statusClass = "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300";
                          badgeClass = "bg-blue-500 text-white";
                      }
                  }

                  return (
                    <button
                        key={idx}
                        disabled={isSolution}
                        onClick={() => handleOptionSelect(idx)}
                        className={`w-full relative flex items-center p-4 rounded-xl border-2 shadow-sm transition-all duration-200 text-left ${statusClass}`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 ${badgeClass}`}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-1 font-medium">{option}</span>
                        {icon && (
                            <span className={`material-symbols-outlined ml-2 ${icon === 'check_circle' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {icon}
                            </span>
                        )}
                    </button>
                  );
              })}
          </div>
          
          {/* Solution Explanation */}
          {isSolution && currentQuestion.explanation && (
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide">
                      <span className="material-symbols-outlined filled-icon text-lg">check_box</span>
                      Explanation
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {currentQuestion.explanation}
                  </p>
              </div>
          )}

      </div>

      {/* FOOTER NAV */}
      <div className="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 p-4 fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
               {isSolution ? (
                   <>
                     <button 
                        onClick={handlePrev} 
                        disabled={currentQ === 0}
                        className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-bold disabled:opacity-50"
                     >
                        Previous
                     </button>
                     <button 
                        onClick={handleNext} 
                        disabled={currentQ === totalQuestions - 1}
                        className="flex-1 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                     >
                        Next
                     </button>
                   </>
               ) : (
                   <>
                     <button 
                        onClick={handlePrev}
                        disabled={currentQ === 0}
                        className="flex items-center gap-1 px-4 py-2 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 disabled:opacity-30"
                     >
                        <span className="material-symbols-outlined">chevron_left</span>
                        Prev
                     </button>
                     
                     <button 
                        onClick={handleClear}
                        className="px-4 py-2 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800"
                     >
                        Clear
                     </button>
                     
                     <button 
                        onClick={handleSaveAndNext}
                        className="flex-1 max-w-[180px] bg-primary text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-transform"
                     >
                        Save & Next
                     </button>
                   </>
               )}
          </div>
      </div>

      {/* PALETTE DRAWER (Overlay) */}
      {showPalette && !isSolution && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPalette(false)}></div>
            <div className="relative w-full max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Palette Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined">list</span>
                        Question Palette
                    </h2>
                    <button onClick={() => setShowPalette(false)} className="material-symbols-outlined text-gray-500">close</button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-5 gap-3">
                        {questions.map((_, idx) => {
                            const status = getQuestionStatus(idx);
                            let btnClass = "border-2 border-gray-200 dark:border-slate-700 text-gray-500";
                            
                            if (status === 'answered') btnClass = "bg-primary border-primary text-white";
                            if (status === 'current') btnClass = "border-primary text-primary border-2"; // Override
                            if (status === 'review') btnClass = "bg-purple-500 border-purple-500 text-white";
                            if (status === 'visited') btnClass = "border-red-400 text-red-400 border-2"; // Assuming 'Not Answered' but visited
                            
                            // Specific Override logic based on precedence
                            if (state.markedForReview.has(idx)) {
                                btnClass = "bg-purple-500 border-purple-500 text-white";
                                if (idx === currentQ) btnClass += " ring-2 ring-offset-2 ring-purple-500";
                            } else if (state.answers.hasOwnProperty(idx)) {
                                btnClass = "bg-primary border-primary text-white";
                                if (idx === currentQ) btnClass += " ring-2 ring-offset-2 ring-primary";
                            } else if (idx === currentQ) {
                                btnClass = "border-2 border-primary text-primary";
                            } else if (state.visited.has(idx)) {
                                // Visited but not answered (Red/Orange usually in these apps)
                                btnClass = "border-2 border-red-400 text-red-400 bg-red-50 dark:bg-red-900/10";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentQ(idx); setShowPalette(false); }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${btnClass}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 text-xs">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-gray-600 dark:text-gray-400">Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Review</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-red-400"></div>
                            <span className="text-gray-600 dark:text-gray-400">Visited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                            <span className="text-gray-600 dark:text-gray-400">Not Visited</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg"
                    >
                        Submit Test
                    </button>
                </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default ChapterQuiz;