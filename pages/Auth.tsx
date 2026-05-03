import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../src/lib/supabase';
import { notifyError, notifySuccess } from '../src/lib/toast';
import { formValidators, validators } from '../src/lib/validation';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role');

  const handleForgotPassword = async () => {
    if (!email) {
      notifyError('Please enter your email address to reset your password.');
      return;
    }
    notifySuccess('Password reset link sent to your email (simulated).');
  };

  const isAdminMode = false; // Admin role removed
  const isMentorMode = initialRole === 'mentor';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Input validation
    const validation = formValidators.auth({ email, password, fullName }, isSignUp);
    if (!validation.valid) {
      setError(validation.errors[0]);
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up with Supabase
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('Registration blocked')) {
             throw new Error('Your application has not been approved. Please wait for Peter to review your request.');
          }
          throw new Error(signUpError.message);
        }

        notifySuccess('Account created successfully! You can now sign in.');
        setIsSignUp(false);
      } else {
        // Sign In with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw new Error('Invalid email or password.');
        }

        if (data.user) {
          // Fetch the profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
             console.warn('Profile fetch error:', profileError);
          }

          // Fallback to defaults if profile missing, but normally trigger creates it.
          const userRole = profile?.role || 'student';
          const userName = profile?.name || data.user.user_metadata?.full_name || 'User';

          // Security check for role-specific portals
          if (isAdminMode && userRole !== 'admin') {
            await supabase.auth.signOut();
            throw new Error('This account does not have admin privileges.');
          }
          if (isMentorMode && userRole !== 'mentor') {
            await supabase.auth.signOut();
            throw new Error('This account does not have mentor privileges.');
          }

          const currUser: User = {
            id: data.user.id,
            email: data.user.email!,
            name: userName,
            role: userRole,
            created_at: data.user.created_at
          };

          onLogin(currUser);
          notifySuccess('Signed in successfully!');
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      notifyError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-12 animate-in fade-in duration-700">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={14} /> BACK
      </Link>

      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg font-black mx-auto mb-4 shadow-xl shadow-black/10">M</div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 uppercase">
            {isAdminMode ? 'ADMIN PORTAL' : isMentorMode ? 'MENTOR PORTAL' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
            {isAdminMode 
              ? 'SECURE ACCESS FOR PETER MANNARINO'
              : isMentorMode ? 'MENTOR ACCESS TO MENTORINO WORKSPACE'
              : isSignUp ? 'JOIN THE MENTORINO COMMUNITY' : 'WELCOME BACK TO MENTORINO WORKSPACE'}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[40px] sm:rounded-[48px] border border-black/[0.03] shadow-2xl">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleAuth}>
            {isSignUp && !isLoading && (
              <div className="bg-indigo-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-100 flex flex-col items-center text-center gap-1 sm:gap-2">
                <p className="text-[8px] sm:text-[9px] font-black text-indigo-900 uppercase tracking-widest">INVITATION ONLY</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-indigo-700/70 uppercase leading-relaxed tracking-wider">
                  You must have an approved application on file to register. Peter will review your request first.
                </p>
              </div>
            )}
            
            {isSignUp && (
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">FULL NAME</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[20px] text-xs font-medium text-center focus:bg-white focus:border-black transition-all outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">EMAIL ADDRESS</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[20px] text-xs font-medium text-center focus:bg-white focus:border-black transition-all outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">PASSWORD</label>
                {!isSignUp && (
                  <button type="button" onClick={handleForgotPassword} className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-black">FORGOT?</button>
                )}
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[20px] text-xs font-medium text-center focus:bg-white focus:border-black transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="btn-normal bg-black text-white w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>

            {!isAdminMode && (
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-black transition-colors"
                >
                  {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;