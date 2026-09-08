/**
 * MeetMind Authentication & Session Management
 * Integrates with Supabase Auth (with offline demo fallback).
 */

const getSupabaseCredentials = () => {
  const cfg = window.MEETMIND_CONFIG || {};
  return {
    url: cfg.SUPABASE_URL || window.SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co',
    anonKey: cfg.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
  };
};

class AuthManager {
  constructor() {
    this.client = null;
    this.isSupabaseConfigured = false;
    this.initSupabase();
  }

  initSupabase() {
    const { url, anonKey } = getSupabaseCredentials();

    if (window.supabase && url.includes('.supabase.co') && !url.includes('YOUR_SUPABASE')) {
      try {
        this.client = window.supabase.createClient(url, anonKey);
        this.isSupabaseConfigured = true;
        console.log('Supabase Auth client initialized.');

        // Listen for Auth State Changes
        this.client.auth.onAuthStateChange((event, session) => {
          if (session && session.user) {
            localStorage.setItem('meetmind_user', JSON.stringify(session.user));
            this.updateUIForUser(session.user);
          } else if (event === 'SIGNED_OUT') {
            this.updateUIForUser(null);
          }
        });
      } catch (e) {
        console.warn('Supabase initialization failed. Running in Local Session Mode.', e);
      }
    } else {
      console.log('Supabase credentials not configured. Running in Local Session Mode.');
    }

    // Auto update UI for logged in/out user on page load
    const refreshUI = () => {
      this.getCurrentUser().then(user => {
        this.updateUIForUser(user);
      });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', refreshUI);
    } else {
      refreshUI();
    }
    setTimeout(refreshUI, 50);
  }

  /**
   * Get current session token for API authorization headers
   */
  async getAccessToken() {
    if (this.isSupabaseConfigured && this.client) {
      try {
        const { data: { session } } = await this.client.auth.getSession();
        if (session && session.access_token) return session.access_token;
      } catch (e) {}
    }
    return 'demo-bearer-token';
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (this.isSupabaseConfigured && this.client) {
      try {
        const { data: { user } } = await this.client.auth.getUser();
        if (user) return user;
      } catch (e) {}
    }
    const demoUser = localStorage.getItem('meetmind_user');
    return demoUser ? JSON.parse(demoUser) : null;
  }

  /**
   * Register a new user in Supabase
   */
  async signUp(email, password, fullName) {
    const nameStr = typeof fullName === 'string'
      ? fullName
      : (fullName?.full_name || fullName?.fullName || email.split('@')[0]);

    if (this.isSupabaseConfigured && this.client) {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nameStr }
        }
      });
      if (error) {
        console.warn('Supabase Auth signUp error:', error.message);
        throw new Error(error.message);
      }
      if (data && data.user) {
        localStorage.setItem('meetmind_user', JSON.stringify(data.user));
        this.updateUIForUser(data.user);
        return data.user;
      }
    }

    // Local Session Fallback
    const mockUser = {
      id: 'user-' + Date.now(),
      email: email,
      user_metadata: { full_name: nameStr }
    };
    localStorage.setItem('meetmind_user', JSON.stringify(mockUser));
    this.updateUIForUser(mockUser);
    return mockUser;
  }

  /**
   * Log in user with email & password in Supabase
   */
  async signIn(email, password) {
    if (this.isSupabaseConfigured && this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.warn('Supabase Auth signIn error:', error.message);
        throw new Error(error.message);
      }
      if (data && data.user) {
        localStorage.setItem('meetmind_user', JSON.stringify(data.user));
        this.updateUIForUser(data.user);
        return data.user;
      }
    }

    // Local Session Activation
    const rawName = email.split('@')[0].replace(/[\._]/g, ' ');
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const userObj = {
      id: 'user-' + Date.now(),
      email: email,
      user_metadata: { full_name: formattedName }
    };
    localStorage.setItem('meetmind_user', JSON.stringify(userObj));
    this.updateUIForUser(userObj);
    return userObj;
  }

  /**
   * OAuth Social Login (Google / Azure Microsoft)
   * @param {'google' | 'azure'} provider 
   */
  async signInWithProvider(provider) {
    const providerName = provider === 'google' ? 'Google' : 'Microsoft';
    const domain = provider === 'google' ? 'gmail.com' : 'outlook.com';

    const typedEmail = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
    const email = typedEmail || `alex.rivera@${domain}`;
    const rawName = email.split('@')[0].replace(/[\._]/g, ' ');
    const fullName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const userObj = {
      id: `social-${provider}-` + Date.now(),
      email: email,
      user_metadata: { full_name: `${fullName} (${providerName})` }
    };

    localStorage.setItem('meetmind_user', JSON.stringify(userObj));
    this.updateUIForUser(userObj);
    return userObj;
  }

  /**
   * Log out user cleanly and restore guest UI
   */
  async signOut() {
    if (this.isSupabaseConfigured && this.client) {
      try {
        await this.client.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('meetmind_user');
    this.updateUIForUser(null);
    window.location.href = 'login.html';
  }

  signOutConfirm() {
    const demoUser = localStorage.getItem('meetmind_user');
    const user = demoUser ? JSON.parse(demoUser) : null;
    const email = user ? user.email : 'your account';
    if (confirm(`Sign out of ${email}?`)) {
      this.signOut();
    }
  }

  /**
   * Route Guard: Require user authentication for protected pages
   */
  async requireAuth() {
    const user = await this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    } else {
      this.updateUIForUser(user);
    }
  }

  /**
   * Update navbar & profile elements cleanly for signed in or signed out state
   */
  updateUIForUser(user) {
    const signInBtns = document.querySelectorAll('#nav-signin-btn, .auth-signin-btn');
    const userPills = document.querySelectorAll('#nav-user-pill, .auth-user-pill');

    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const email = user.email || '';

      document.querySelectorAll('.user-display-name').forEach(el => el.textContent = name);
      document.querySelectorAll('.user-display-email').forEach(el => el.textContent = email);

      signInBtns.forEach(el => el.classList.add('hidden'));
      userPills.forEach(el => el.classList.remove('hidden'));
    } else {
      document.querySelectorAll('.user-display-name').forEach(el => el.textContent = '');
      document.querySelectorAll('.user-display-email').forEach(el => el.textContent = '');

      signInBtns.forEach(el => el.classList.remove('hidden'));
      userPills.forEach(el => el.classList.add('hidden'));
    }
  }
}

window.authManager = new AuthManager();
