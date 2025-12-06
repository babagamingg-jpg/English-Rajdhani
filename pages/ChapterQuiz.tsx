import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { ChapterEntity } from '../types';

interface Question {
  question: string;
  options: string[];
  answer?: string;
  correct_answer?: number;
  explanation?: string;
}

const ChapterQuiz: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chapters')
        .select('title, quiz')
        .eq('id', chapterId)
        .single();

      if (data?.quiz) {
        const quizData = typeof data.quiz === 'string' ? JSON.parse(data.quiz) : data.quiz;
        const qArray = Array.isArray(quizData) ? quizData : (quizData.questions || []);
        setQuestions(qArray);
      }
      setLoading(false);
    };

    if (chapterId) fetchQuiz();
  }, [chapterId]);

  // Helper to find correct index safely
  const getCorrectIndex = (q: Question) => {
    if (typeof q.correct_answer === 'number') return q.correct_answer;
    if (q.answer) {
        return q.options.findIndex(opt => opt === q.answer);
    }
    return 0; // Fallback
  };

  const handleAnswer = (selectedIndex: number) => {
    setSelectedOptionIndex(selectedIndex);
  };

  const handleNext = () => {
    if (selectedOptionIndex === null) return;

    // Check answer and update score (silently)
    const currentQuestion = questions[currentQ];
    const correctIndex = getCorrectIndex(currentQuestion);
    
    if (selectedOptionIndex === correctIndex) {
      setScore(prev => prev + 1);
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedOptionIndex(null);
  };

  const handleBack = () => {
    const state = location.state as { backPath?: string } | null;
    if (state?.backPath) {
        navigate(state.backPath);
    } else {
        navigate(-1);
    }
  };

  const getFeedback = () => {
    if (questions.length === 0) return { title: "Completed", color: "text-gray-500", gradient: "from-gray-400 to-gray-500", icon: "check_circle" };
    
    const percentage = (score / questions.length) * 100;
    
    if (percentage === 100) return { 
        title: "Perfect Score!", 
        subtitle: "You mastered this chapter!",
        color: "text-emerald-500", 
        gradient: "from-emerald-400 to-teal-500",
        bg: "bg-emerald-50",
        icon: "workspace_premium",
        confetti: true
    };
    if (percentage >= 80) return { 
        title: "Excellent Work!", 
        subtitle: "Great job, keep it up!",
        color: "text-blue-500", 
        gradient: "from-blue-400 to-indigo-500",
        bg: "bg-blue-50",
        icon: "emoji_events",
        confetti: true
    };
    if (percentage >= 50) return { 
        title: "Good Effort!", 
        subtitle: "You're getting there!",
        color: "text-amber-500", 
        gradient: "from-amber-400 to-orange-500",
        bg: "bg-amber-50",
        icon: "thumb_up",
        confetti: false
    };
    return { 
        title: "Don't Give Up!", 
        subtitle: "Review and try again.",
        color: "text-rose-500", 
        gradient: "from-rose-400 to-pink-500",
        bg: "bg-rose-50",
        icon: "psychology",
        confetti: false
    };
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading Quiz...</p>
        </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-slate-900">
       <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
           <span className="material-symbols-outlined text-4xl text-gray-400">quiz</span>
       </div>
       <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Quiz Available</h2>
       <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">This chapter does not have a quiz added yet. Please check back later.</p>
       <button 
           onClick={handleBack} 
           className="px-6 py-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50"
       >
           Go Back
       </button>
    </div>
  );

  const feedback = getFeedback();
  
  // Confetti CSS
  const confettiStyles = `
    @keyframes confetti-fall {
      0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    .confetti {
      position: absolute;
      top: -10px;
      width: 10px;
      height: 10px;
      animation: confetti-fall 3s linear infinite;
    }
  `;

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 font-display relative overflow-hidden">
       <style>{confettiStyles}</style>

       {/* Background Decoration */}
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-[80px] pointer-events-none"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 dark:bg-purple-900/10 rounded-full blur-[80px] pointer-events-none"></div>

       {/* Confetti Elements for High Scores (Result Screen Only) */}
       {showResult && feedback.confetti && (
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           {[...Array(30)].map((_, i) => (
             <div 
               key={i} 
               className="confetti"
               style={{
                 left: `${Math.random() * 100}%`,
                 backgroundColor: ['#FFC107', '#2196F3', '#E91E63', '#4CAF50'][Math.floor(Math.random() * 4)],
                 animationDelay: `${Math.random() * 2}s`,
                 animationDuration: `${2 + Math.random() * 3}s`
               }}
             />
           ))}
         </div>
       )}

       {/* Header */}
       <div className="relative z-10 flex items-center justify-between px-6 py-6">
         <button 
            onClick={handleBack} 
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
         >
            <span className="material-symbols-outlined">close</span>
         </button>
         
         {!showResult && (
             <div className="flex flex-col items-center">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
                 <span className="text-lg font-bold text-gray-800 dark:text-white">
                    <span className="text-blue-500">{currentQ + 1}</span>
                    <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
                    {questions.length}
                 </span>
             </div>
         )}
         
         {/* Invisible spacer for center alignment */}
         <div className="w-10"></div>
       </div>

       {/* Main Content */}
       <div className="flex-1 relative z-10 overflow-y-auto px-6 pb-24 flex items-center justify-center">
          
          {showResult ? (
             /* RESULT VIEW - Report Card Style */
             <div className="w-full max-w-md relative z-10 animate-in zoom-in duration-300">
                <div className="bg-white dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl shadow-purple-500/10 overflow-hidden border border-gray-100 dark:border-zinc-700">
                    
                    {/* Colorful Header */}
                    <div className={`bg-gradient-to-br ${feedback.gradient} p-8 pb-20 text-center relative overflow-hidden`}>
                         {/* Abstract Shapes */}
                         <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                         <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                         <h2 className="relative z-10 text-3xl font-black text-white font-display tracking-tight drop-shadow-md mb-1">{feedback.title}</h2>
                         <p className="relative z-10 text-white/90 font-medium text-sm">{feedback.subtitle}</p>
                    </div>

                    <div className="px-6 pb-8 relative">
                         {/* Floating Score Circle - overlapping header */}
                         <div className="absolute left-1/2 -translate-x-1/2 -top-16">
                              <div className="relative w-32 h-32 rounded-full bg-white dark:bg-zinc-800 p-2 shadow-xl ring-4 ring-white/50 dark:ring-zinc-700/50">
                                  {/* SVG Circle */}
                                  <svg className="w-full h-full transform -rotate-90">
                                        {/* Track */}
                                        <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-zinc-700" />
                                        {/* Progress */}
                                        <circle 
                                            cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                            className={`${feedback.color} transition-all duration-1000 ease-out`}
                                            strokeDasharray={283} // ~ 2 * pi * 45
                                            strokeDashoffset={283 - (283 * (score / questions.length))}
                                            strokeLinecap="round"
                                        />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className={`text-3xl font-black ${feedback.color}`}>{Math.round((score / questions.length) * 100)}%</span>
                                  </div>
                              </div>
                         </div>

                         {/* Stats Grid - Pushed down to clear the circle */}
                         <div className="mt-20 grid grid-cols-2 gap-4">
                             <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 flex flex-col items-center border border-emerald-100 dark:border-emerald-800/30">
                                 <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{score}</span>
                                 <span className="text-[10px] font-bold text-emerald-800/60 dark:text-emerald-400/60 uppercase tracking-wide mt-1">Correct</span>
                             </div>
                             <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 flex flex-col items-center border border-rose-100 dark:border-rose-800/30">
                                 <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{questions.length - score}</span>
                                 <span className="text-[10px] font-bold text-rose-800/60 dark:text-rose-400/60 uppercase tracking-wide mt-1">Incorrect</span>
                             </div>
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="mt-8 space-y-3">
                             <button onClick={handleBack} className={`w-full py-4 rounded-xl bg-gradient-to-r ${feedback.gradient} text-white font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}>
                                 <span className="material-symbols-outlined">done</span>
                                 Finish Review
                             </button>
                             <button onClick={resetQuiz} className="w-full py-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-zinc-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                 <span className="material-symbols-outlined">replay</span>
                                 Try Again
                             </button>
                         </div>

                    </div>
                </div>
             </div>
          ) : (
             /* QUESTION VIEW */
             <div className="w-full max-w-xl flex flex-col gap-6 pb-4">
                
                {/* Progress Bar (Visual) */}
                <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${(currentQ / questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 dark:shadow-black/20 border border-gray-100 dark:border-zinc-700/50 min-h-[160px] flex items-center justify-center text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-relaxed">
                        {questions[currentQ].question}
                    </h2>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                    {questions[currentQ].options.map((option, idx) => {
                        // Standard Selection UI (No right/wrong hint)
                        const isSelected = selectedOptionIndex === idx;
                        
                        let containerClass = "bg-white dark:bg-zinc-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-600";
                        let badgeClass = "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400";
                        let textClass = "text-gray-700 dark:text-gray-200";

                        if (isSelected) {
                            containerClass = "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-md shadow-blue-500/10";
                            badgeClass = "bg-blue-500 text-white";
                            textClass = "text-blue-700 dark:text-blue-300 font-bold";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`group w-full relative flex items-center p-4 rounded-2xl shadow-sm transition-all duration-200 ${containerClass} hover:scale-[1.01] active:scale-[0.99]`}
                            >
                                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors ${badgeClass}`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className={`relative text-left font-medium text-base md:text-lg ${textClass}`}>
                                    {option}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Next Button - Appears only when an option is selected */}
                <div className="pt-4 h-20">
                    {selectedOptionIndex !== null && (
                         <button
                            onClick={handleNext}
                            className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300"
                        >
                            <span>{currentQ + 1 === questions.length ? "Submit Quiz" : "Next Question"}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    )}
                </div>

             </div>
          )}

       </div>
    </div>
  );
};

export default ChapterQuiz;