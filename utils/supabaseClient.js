// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// ตรวจสอบให้แน่ใจว่าได้ตั้งค่า Environment Variables เหล่านี้ในไฟล์ .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);