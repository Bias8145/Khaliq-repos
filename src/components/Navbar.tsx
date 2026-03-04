import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, PenTool, BookOpen, Sun, Moon, Feather, Settings2, RefreshCw, Languages, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { usePreferences } from '../lib/preferences';
import { useLanguage } from '../lib/language';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = usePreferences();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: t('nav.repository'), path: '/', icon: BookOpen, desc: t('nav.repoDesc') },
  ];

  return (
    <>
      {/* Invisible backdrop to close settings when clicking outside */}
      <AnimatePresence>
        {showFontSettings && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[2px]"
                onClick={() => setShowFontSettings(false)}
            />
        )}
      </AnimatePresence>

      {/* Material 3 Expressive Floating Pill Navbar */}
      <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 max-w-7xl mx-auto z-50 bg-card/80 backdrop-blur-xl border border-border/60 rounded-[2rem] transition-all duration-300 shadow-lg shadow-black/5">
        <div className="px-5 md:px-8 h-16 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group z-50 relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Feather size={20} strokeWidth={2} className="group-hover:-rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base md:text-lg leading-none text-foreground tracking-tight group-hover:text-primary transition-colors">
                Khaliq Repository
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-3 pl-4 relative">
                
                {/* Advanced Settings Toggle */}
                <div className="relative">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFontSettings(!showFontSettings);
                        }}
                        className={cn(
                            "p-2.5 rounded-full transition-colors relative group z-50",
                            showFontSettings ? "bg-primary text-primary-foreground" : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                        title={t('nav.settings')}
                    >
                        <Settings2 size={18} />
                    </button>

                    <AnimatePresence>
                        {showFontSettings && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-4 w-80 bg-card border border-border rounded-[2rem] shadow-2xl p-6 z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('nav.settings')}</span>
                                    <button onClick={() => setFontSize(16)} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                                        <RefreshCw size={10} /> Reset
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Language Switcher */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <Languages size={16} /> {t('nav.language')}
                                        </span>
                                        <div className="flex bg-secondary rounded-full p-1">
                                            <button 
                                                onClick={() => setLanguage('en')}
                                                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", language === 'en' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                EN
                                            </button>
                                            <button 
                                                onClick={() => setLanguage('id')}
                                                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", language === 'id' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                ID
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-px bg-border/50"></div>

                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <span className="text-sm font-bold text-foreground">Font Size</span>
                                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{fontSize}px</span>
                                        </div>
                                        <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-full">
                                            <span className="text-xs font-bold text-muted-foreground ml-2">A</span>
                                            <input 
                                                type="range" 
                                                min="12" 
                                                max="24" 
                                                step="1"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                                            />
                                            <span className="text-lg font-bold text-foreground mr-2">A</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border">
                                        <span className="text-sm font-bold text-foreground">Theme</span>
                                        <button 
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-bold transition-colors"
                                        >
                                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {user && (
                    <div className="flex items-center gap-2 border-l border-border/50 pl-3 ml-1">
                        <Link 
                            to="/editor/new" 
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                        >
                            <PenTool size={16} />
                            {t('nav.write')}
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="p-2.5 rounded-full bg-secondary/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title={t('nav.signOut')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden z-50">
             {user && (
                <>
                    <Link 
                        to="/editor/new" 
                        className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
                        title={t('nav.write')}
                    >
                        <PenTool size={18} />
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-full transition-colors"
                        title={t('nav.signOut')}
                    >
                        <LogOut size={18} />
                    </button>
                </>
             )}
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowFontSettings(!showFontSettings);
                }}
                className={cn(
                    "p-2.5 rounded-full transition-colors",
                    showFontSettings ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
             >
                <Settings2 size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Settings Drawer - Adjusted for Floating Navbar */}
      <AnimatePresence>
        {showFontSettings && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 left-4 right-4 z-[60] bg-card border border-border p-6 shadow-2xl md:hidden rounded-[2rem]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('nav.settings')}</span>
                    <button 
                        onClick={() => setShowFontSettings(false)}
                        className="p-2 bg-secondary/50 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        <X size={16} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Mobile Language Switcher */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Languages size={16} /> {t('nav.language')}
                        </span>
                        <div className="flex bg-secondary rounded-full p-1">
                            <button 
                                onClick={() => setLanguage('en')}
                                className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all", language === 'en' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => setLanguage('id')}
                                className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all", language === 'id' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                Indonesia
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-border/50"></div>

                    <div>
                        <div className="flex justify-between mb-3">
                             <span className="text-sm font-bold text-foreground">Font Size</span>
                             <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-full">
                            <span className="text-xs text-muted-foreground ml-2">A</span>
                            <input 
                                type="range" 
                                min="12" 
                                max="24" 
                                step="1"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                            />
                            <span className="text-lg text-foreground mr-2">A</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                        <span className="text-sm font-bold text-foreground">Dark Mode</span>
                        <button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-3 bg-secondary rounded-full text-foreground"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
