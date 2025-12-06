
import { createClient } from '@supabase/supabase-js';

// Credentials for the 'english' project
const supabaseUrl = 'https://fsrygcwnxvxerqylxxyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcnlnY3dueHZ4ZXJxeWx4eHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzI3NzksImV4cCI6MjA4MDQwODc3OX0.8fxMuH5U0irZRhOti5eyhe6UU1VBroC0J3Avqrq8bmE';

export const supabase = createClient(supabaseUrl, supabaseKey);
