import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import AiTutor from './pages/AiTutor';
import ClassDetails from './pages/ClassDetails';
import SelectTextbook from './pages/SelectTextbook';
import SelectRainbowSection from './pages/SelectRainbowSection';
import BookChapters from './pages/BookChapters';
import GrammarTopics from './pages/GrammarTopics';
import ChapterSummary from './pages/ChapterSummary';
import ChapterQuiz from './pages/ChapterQuiz';
import ChapterRead from './pages/ChapterRead';

// Component to ensure window scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Placeholder components for routes not fully implemented
const PlaceholderPage: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in w-full max-w-4xl mx-auto">
    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
      <span className="material-icons text-blue-500 text-5xl">{icon}</span>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
    <p className="text-gray-500 dark:text-gray-400 text-lg">This section is currently under development for the Windows & Mobile platform.</p>
  </div>
);

const App: React.FC = () => {
  // Manual Loader Cleanup
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      // Small delay to ensure render is painted, then fade out
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        
        // Remove from DOM after transition completes (0.5s match CSS)
        setTimeout(() => {
          loader.remove();
        }, 500);
      }, 100);
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-zinc-900 dark:text-zinc-100 font-display selection:bg-primary selection:text-white">
        
        {/* Main App Header (Desktop & Mobile) */}
        <Header />
        
        {/* Main Content Area - fills remaining space */}
        <main className="flex-grow overflow-hidden relative w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<PlaceholderPage title="All Classes" icon="library_books" />} />
            
            <Route path="/class/:classId" element={<ClassDetails />} />
            
            {/* Textbook Flow */}
            <Route path="/class/:classId/textbook-select" element={<SelectTextbook />} />
            
            {/* Rainbow Section Selection */}
            <Route path="/class/:classId/rainbow-sections" element={<SelectRainbowSection />} />
            
            {/* Book Chapters - now handles optional sectionType for rainbow prose/poetry */}
            <Route path="/class/:classId/book/:bookType/:sectionType?" element={<BookChapters />} />
            
            {/* Fallback for old route, redirect to selection or default to rainbow */}
            <Route path="/class/:classId/book" element={<Navigate to="rainbow" relative="path" replace />} />

            <Route path="/class/:classId/grammar" element={<GrammarTopics />} />
            
            {/* New Routes for Database Content */}
            <Route path="/chapter/:chapterId/read" element={<ChapterRead />} />
            <Route path="/chapter/:chapterId/summary" element={<ChapterSummary />} />
            <Route path="/chapter/:chapterId/quiz" element={<ChapterQuiz />} />

            <Route path="/ai-tutor" element={<AiTutor />} />
            <Route path="/profile" element={<PlaceholderPage title="User Profile" icon="account_circle" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;