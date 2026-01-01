import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, PenTool, Home, BookOpen, Sun, Moon, Feather, Instagram, Github, ArrowRight, Type, Settings2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { usePreferences } from '../lib/preferences';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const fontSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Click outside to close font settings
    const handleClickOutside = (event: MouseEvent) => {
        if (fontSettingsRef.current && !fontSettingsRef.current.contains(event.target as Node)) {
            setShowFontSettings(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        subscription.unsubscribe();
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, desc: "Return to landing page" },
    { name: 'Repository', path: '/repo', icon: BookOpen, desc: "Browse notes & research" },
  ];

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-5 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group z-50 relative">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20 border border-primary/20">
              <Feather size={18} strokeWidth={2} className="group-hover:-rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base md:text-lg leading-none text-foreground tracking-tight group-hover:text-primary transition-colors">
                Khaliq Repository
              </span>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mt-1">
                Digital Garden
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/50 p-1.5 rounded-full border border-border/50 mr-4 backdrop-blur-md">
                {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                    key={item.path} 
                    to={item.path} 
                    className={cn(
                        "text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 px-5 py-2 rounded-full",
                        isActive 
                            ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                    >
                    {item.name}
                    </Link>
                );
                })}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-border/50 relative">
                
                {/* Advanced Font Settings Toggle */}
                <div className="relative" ref={fontSettingsRef}>
                    <button 
                        onClick={() => setShowFontSettings(!showFontSettings)}
                        className={cn(
                            "p-2.5 rounded-full transition-colors relative group",
                            showFontSettings ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                        title="Display Settings"
                    >
                        <Type size={18} />
                    </button>

                    <AnimatePresence>
                        {showFontSettings && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-4 w-72 bg-card border border-border rounded-2xl shadow-xl p-5 z-50"
                            >
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Display Settings</span>
                                    <button onClick={() => setFontSize(16)} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                        <RefreshCw size={10} /> Reset
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-foreground">Font Size</span>
                                            <span className="text-xs font-mono font-bold text-primary">{fontSize}px</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-lg">
                                            <span className="text-xs font-bold text-muted-foreground">A</span>
                                            <input 
                                                type="range" 
                                                min="12" 
                                                max="24" 
                                                step="1"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                                            />
                                            <span className="text-lg font-bold text-foreground">A</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-xs font-bold text-foreground">Theme</span>
                                        <button 
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-bold transition-colors"
                                        >
                                            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                                            {theme === 'dark' ? 'Light' : 'Dark'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {user && (
                    <div className="flex items-center gap-2">
                        <Link 
                            to="/editor/new" 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                        >
                            <PenTool size={14} />
                            Write
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="p-2.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
             <button 
                onClick={() => setShowFontSettings(!showFontSettings)}
                className="p-2 text-muted-foreground hover:bg-secondary rounded-full"
             >
                <Settings2 size={20} />
             </button>
             <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 text-foreground hover:bg-secondary rounded-full transition-colors relative z-50"
            >
                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Menu size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Font Settings Drawer */}
      <AnimatePresence>
        {showFontSettings && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-16 left-0 right-0 z-40 bg-card border-b border-border p-6 shadow-xl md:hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Display Settings</span>
                    <button onClick={() => setShowFontSettings(false)}><X size={18} className="text-muted-foreground" /></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                             <span className="text-sm font-bold text-foreground">Font Size</span>
                             <span className="text-xs font-mono text-primary">{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl">
                            <span className="text-xs text-muted-foreground">A</span>
                            <input 
                                type="range" 
                                min="12" 
                                max="24" 
                                step="1"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-secondary rounded-full appearance-none"
                            />
                            <span className="text-lg text-foreground">A</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm font-bold text-foreground">Dark Mode</span>
                        <button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 bg-secondary rounded-lg"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl md:hidden flex flex-col pt-24 px-6 pb-10 overflow-y-auto"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/50 rounded-full blur-[100px] -z-10"></div>

            <div className="flex flex-col gap-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (index * 0.1), type: "spring", stiffness: 100 }}
                  >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="group block"
                      >
                        <div className="flex items-center justify-between">
                            <span className={cn(
                                "text-3xl font-serif font-bold transition-colors duration-300",
                                location.pathname === item.path ? "text-primary" : "text-foreground group-hover:text-primary/50"
                            )}>
                                {item.name}
                            </span>
                            <ArrowRight className={cn(
                                "transition-all duration-300 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0",
                                location.pathname === item.path ? "opacity-100 translate-x-0 text-primary" : "text-muted-foreground"
                            )} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide pl-1">
                            {item.desc}
                        </p>
                      </Link>
                      <div className="h-px w-full bg-border/50 mt-4" />
                  </motion.div>
                ))}

                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link
                        to="/editor/new"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-xl shadow-primary/20 mt-2"
                        >
                        <PenTool size={20} />
                        Write New Entry
                        </Link>
                    </motion.div>
                )}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto space-y-6 pt-8"
            >
                <div className="grid grid-cols-2 gap-4">
                    <a href="https://instagram.com/2.khaliq" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors group">
                        <Instagram size={24} className="text-foreground group-hover:text-[#E1306C] transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">Instagram</span>
                    </a>
                    <a href="https://github.com/Bias8145" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors group">
                        <Github size={24} className="text-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">GitHub</span>
                    </a>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm font-bold text-muted-foreground">Khaliq Repository</span>
                    
                    {user ? (
                        <button onClick={handleLogout} className="text-sm font-bold text-destructive flex items-center gap-2">
                            <LogOut size={18} /> Sign Out
                        </button>
                    ) : (
                        <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm font-bold text-primary flex items-center gap-2">
                            Admin Login <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
