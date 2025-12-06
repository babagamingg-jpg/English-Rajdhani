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

// Supabase Database Types
export interface ClassEntity {
  id: string; // uuid
  name: string;
  grade: number;
  created_at?: string;
}

export interface ChapterEntity {
  id: string; // uuid
  class_id: string; // uuid
  section_type: string; // 'PROSE', 'POETRY', 'GRAMMAR' etc
  chapter_number: number;
  title: string;
  content: any; // jsonb - contains summary etc
  quiz: any; // jsonb - contains quiz questions
  created_at?: string;
  updated_at?: string;
}
