// /**
//  * MeetMind Environment & Supabase Configuration
//  * Replace the credentials below with your live project values from https://supabase.com/dashboard
//  */

// window.MEETMIND_CONFIG = {
//   // Supabase Project Settings
//   SUPABASE_URL: window.env?.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co',
//   SUPABASE_ANON_KEY: window.env?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',

//   // Backend API URL
//   API_BASE_URL: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
//     ? 'http://localhost:8080/api'
//     : '/api'
// };
window.MEETMIND_CONFIG = {
  // Replace these placeholders with your copied keys:
  SUPABASE_URL: 'https://njuepddiexdnpszurnro.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdWVwZGRpZXhkbnBzenVybnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODEyODgsImV4cCI6MjEwNDM1NzI4OH0.3qlNcxAafHc6Pa0xID8HK0BLTG_OKyD130R3QsMF5Tg',

  API_BASE_URL: window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:8080/api'
    : '/api'
};
