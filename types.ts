export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: MessageRole;
  text: string;
  isError?: boolean;
}

export interface CourseCardProps {
  title: string;
  subtitle: string;
  iconName: string;
  accentColor: 'blue' | 'gray' | 'amber';
  onClick: () => void;
}

// --- Supabase Database Types ---

// Enums based on Database Definition
export type SectionType = 'textbook' | 'grammar';
export type BookSection = 'prose' | 'poetry' | 'grammar';

export interface ClassEntity {
  id: string; // uuid
  name: string;
  grade: number;
  created_at?: string;
}

export interface BookEntity {
  id: string; // uuid
  class_id: string; // uuid
  name: string;
  book_order: number;
  has_sections: boolean;
  created_at?: string;
}

// --- Grammar Specific Types ---
export interface GrammarSection {
  section_id: number;
  title: string;
  description?: string;
  note?: string;
  
  // Intro Concepts
  concepts?: {
    concept_name: string;
    english_text?: string;
    hindi_explanation?: string;
    examples?: string[];
    meaning?: string; // Number Concept
    hindi?: string;   // Number Concept
    example?: string; // Number Concept
    types?: {         // Nested Types (Visible/Invisible)
      type: string;
      hindi_meaning: string;
      description: string;
      hindi_desc: string;
    }[];
  }[];

  // Classifications (Proper, Common, etc.) & Gender
  types?: {
    type_name?: string; // 1. Proper Noun
    name?: string;      // Countable Noun / Masculine
    hindi_name?: string;
    hindi?: string;     // Gender
    definition?: string;
    hindi_explanation?: string;
    explanation?: string; // Gender
    rule?: string;      // Modern Classification
    key_rules?: {
      rule_en: string;
      rule_hi: string;
    }[];
    examples?: string[] | string;
    difference_trick?: {
      concept: string;
      explanation: string;
      hindi_explanation: string;
    };
  }[];

  // Number Rules
  golden_rules_for_number?: {
    rule: string;
    example: string;
    hindi_explanation?: string;
  }[];

  // Exam Rules
  rules?: {
    rule_id: number;
    concept: string;
    hindi_explanation: string;
    usage?: string;
    examples?: string[];
    sentence?: string;
    correction?: string;
  }[];
}

export interface GrammarChapterContent {
  chapter_info: {
    topic: string;
    target_audience: string;
    difficulty_level: string;
    objective: string;
  };
  content: GrammarSection[];
}

// Structure for the "Content Table" (JSONB)
export interface ChapterContent {
  // Support for nested full chapter structure
  fullChapter?: ChapterContent;

  chapter_metadata?: {
    title?: string;
    author?: string;
    source?: string;
  };
  
  // Grammar Content Root
  chapter_info?: {
    topic: string;
    target_audience: string;
    difficulty_level: string;
    objective: string;
  };

  // New Structure for Chapter Summary
  chapter_summary?: {
    title?: string;
    author?: string;
    sections?: {
      heading_en?: string;
      heading_hi?: string;
      content_en?: string;
      content_hi?: string;
    }[];
    key_highlights?: {
      [key: string]: string;
    };
  };

  // Full Chapter Data (Prose/Poetry/Story of English)
  // Supports new paragraph structure and legacy sections
  content?: {
    paragraph_number?: number;
    lines: {
      english?: string;
      hindi?: string;
      englishLine?: string; // legacy
      hindiTranslation?: string; // legacy
    }[];
  }[] | GrammarSection[] | any; // allow flexible array or object for legacy parsing

  sections?: {
    title: string;
    lines: {
      englishLine: string;
      hindiTranslation: string;
    }[];
    content?: string; // Fallback for raw text
  }[];
  
  // Simple Full Text Fallback
  text?: string;

  // Summary Table Data
  summary?: string;
  introduction?: string;
  author?: string; // Root level author
  keyPoints?: string[];
  
  // Vocabulary/Glossary
  glossary?: {
    word: string;
    meaning: string;
    hindi_meaning?: string;
  }[];
  
  vocabulary?: { 
    term: string; 
    definition?: string;
    englishMeaning?: string; 
    hindiMeaning?: string; 
  }[];
  
  // Legacy support
  importantTerms?: Record<string, string> | any[];
}

// Structure for the "Test Table" (JSONB)
export interface QuizContent {
  questions: {
    question: string;
    options: string[] | Record<string, string>; // Support Array or Dictionary {"A": "Opt1", ...}
    correct_answer: number | string; // Index (0) or Key ("A")
    explanation?: string;
    answer?: string; // Legacy string match support
  }[];
}

export interface ChapterEntity {
  id: string; // uuid
  class_id: string; // uuid
  book_id?: string; // uuid (nullable for grammar)
  
  section_type: SectionType; // 'textbook' | 'grammar'
  book_section?: BookSection; // 'prose' | 'poetry' | 'grammar'
  
  chapter_number: number;
  title: string;
  
  content: ChapterContent | any; // JSONB
  quiz: QuizContent | any;       // JSONB

  created_at?: string;
  updated_at?: string;
}
