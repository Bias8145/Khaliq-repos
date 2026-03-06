import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, PenTool, Sun, Moon, Feather, Settings2, RefreshCw, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { usePreferences } from '../lib/preferences';
import { useLanguage } from '../lib/language';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = usePreferences();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
        subscription.unsubscribe();
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* Invisible backdrop to close settings when clicking outside */}
      <AnimatePresence>
        {showFontSettings && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm"
                onClick={() => setShowFontSettings(false)}
            />
        )}
      </AnimatePresence>

      {/* True Capsule Header (Floating Island) */}
      <nav className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out flex items-center",
          scrolled 
            ? "top-4 w-[92%] md:w-max md:min-w-[500px] bg-card/90 backdrop-blur-xl border border-border/80 shadow-sm rounded-full py-2.5 px-4" 
            : "top-6 w-[95%] md:w-max md:min-w-[600px] bg-card/50 backdrop-blur-md border border-border/40 shadow-none rounded-full py-3.5 px-6"
      )}>
        <div className="w-full flex items-center justify-between gap-4 md:gap-10">
          
          <Link to="/" className="flex items-center gap-3 group z-50 relative shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                <Feather size={18} strokeWidth={2.5} className="group-hover:-rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm md:text-base leading-none text-foreground tracking-tight group-hover:text-primary transition-colors">
                Khaliq Repository
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 relative">
                
                {/* Advanced Settings Toggle */}
                <div className="relative">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFontSettings(!showFontSettings);
                        }}
                        className={cn(
                            "p-2.5 rounded-full transition-colors relative group z-50",
                            showFontSettings ? "bg-primary text-primary-foreground" : "bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground"
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
                                className="absolute top-full right-0 mt-4 w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-md p-6 z-50 origin-top-right"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
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
                                        <div className="flex bg-secondary/80 rounded-full p-1 border border-border/50">
                                            <button 
                                                onClick={() => setLanguage('en')}
                                                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", language === 'en' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                EN
                                            </button>
                                            <button 
                                                onClick={() => setLanguage('id')}
                                                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", language === 'id' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
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
                                        <div className="flex items-center gap-4 bg-secondary/80 p-3 rounded-full border border-border/50">
                                            <span className="text-xs font-bold text-muted-foreground ml-2">A</span>
                                            <input 
                                                type="range" 
                                                min="4" 
                                                max="24" 
                                                step="1"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                            />
                                            <span className="text-lg font-bold text-foreground mr-2">A</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                        <span className="text-sm font-bold text-foreground">Theme</span>
                                        <button 
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 text-xs font-bold transition-colors"
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
                    <div className="flex items-center gap-2 border-l border-border/50 pl-2 ml-1">
                        <Link 
                            to="/editor/new" 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all hover:-translate-y-0.5"
                        >
                            <PenTool size={14} />
                            {t('nav.write')}
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="p-2.5 rounded-full bg-secondary/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title={t('nav.signOut')}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden z-50 shrink-0 relative">
             {user && (
                <>
                    <Link 
                        to="/editor/new" 
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
                        title={t('nav.write')}
                    >
                        <PenTool size={16} />
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-full transition-colors"
                        title={t('nav.signOut')}
                    >
                        <LogOut size={16} />
                    </button>
                </>
             )}
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowFontSettings(!showFontSettings);
                }}
                className={cn(
                    "p-2 rounded-full transition-colors relative z-50",
                    showFontSettings ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
                )}
             >
                <Settings2 size={18} />
             </button>

             {/* Mobile Settings Dropdown */}
             <AnimatePresence>
                {showFontSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-4 w-[calc(100vw-2.5rem)] max-w-[320px] z-[60] bg-card/95 backdrop-blur-xl border border-border/50 p-6 shadow-md rounded-[2rem] origin-top-right cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{t('nav.settings')}</span>
                            <button onClick={() => setFontSize(12)} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                                <RefreshCw size={10} /> Reset
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Mobile Language Switcher */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Languages size={16} /> {t('nav.language')}
                                </span>
                                <div className="flex bg-secondary/80 rounded-full p-1 border border-border/50">
                                    <button 
                                        onClick={() => setLanguage('en')}
                                        className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", language === 'en' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        EN
                                    </button>
                                    <button 
                                        onClick={() => setLanguage('id')}
                                        className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", language === 'id' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
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
                                <div className="flex items-center gap-4 bg-secondary/80 p-3 rounded-full border border-border/50">
                                    <span className="text-xs font-bold text-muted-foreground ml-2">A</span>
                                    <input 
                                        type="range" 
                                        min="4" 
                                        max="24" 
                                        step="1"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                        className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                    />
                                    <span className="text-lg font-bold text-foreground mr-2">A</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                <span className="text-sm font-bold text-foreground">Theme</span>
                                <button 
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 hover:bg-secondary border border-border/50 text-xs font-bold transition-colors"
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
        </div>
      </nav>
    </>
  );
}
