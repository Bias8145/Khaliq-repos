import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, User, AlertCircle, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Default mapping for convenience, but allow override
  const DEFAULT_DOMAIN = '@bias-repo.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let email = input.trim();
    
    // Smart Email Detection: If no '@', assume it's a username and append default domain
    // BUT, if the user already has an account with a different email, they should type the full email.
    if (!email.includes('@')) {
        // Check if it's the specific admin user
        if (email === '2.khaliq') {
            email = `2.khaliq${DEFAULT_DOMAIN}`;
        } else {
            // Or just try appending the domain
            email = `${email}${DEFAULT_DOMAIN}`;
        }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
            throw new Error("Login blocked: Email confirmation is ON. Please disable it in Supabase Dashboard.");
        }
        if (error.message.includes("Invalid login credentials")) {
             throw new Error(`Failed to login as '${email}'. If your account uses a different email (e.g. gmail), please enter the FULL email address.`);
        }
        throw error;
      }
      
      navigate('/repo');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/5">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Admin Access
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                    Enter your credentials to manage the repository.
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Email or Username</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/50 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none font-medium"
                            placeholder="2.khaliq OR full email..."
                            required
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">
                        *If using just username, we assume <strong>@bias-repo.com</strong>
                    </p>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/50 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-destructive text-xs bg-destructive/5 border border-destructive/20 p-4 rounded-xl flex gap-3 items-start leading-relaxed"
                        >
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center">
                 <p className="text-xs text-muted-foreground">
                    Trouble logging in? Ensure your account exists in Supabase Auth.
                 </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
