import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Post } from '../lib/supabase';
import { format } from 'date-fns';
import { ArrowLeft, Edit3, Clock, Share2, Printer, Heart, Link as LinkIcon, Twitter, Linkedin, MessageCircle, Download, ImageIcon, X, Loader2, Feather, Send, Moon, Sun, RefreshCw, Maximize, Smartphone, Square, Layout, MousePointerClick, TextCursorInput, Globe, Microscope, Book, MessageSquareQuote, FileText, Pin, Maximize2, Minimize2, ShieldCheck, Lock, Eye } from 'lucide-react';
import { calculateReadingTime } from '../lib/utils';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/language';
import html2canvas from 'html2canvas';

type AspectRatio = 'auto' | 'portrait' | 'square' | 'story';
type CardTheme = 'dark' | 'light';

export default function PostView() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showVisualShare, setShowVisualShare] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // Fitur Baru: Mode Fokus
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Visual Share State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto');
  const [cardTheme, setCardTheme] = useState<CardTheme>('light'); 
  const [customExcerpt, setCustomExcerpt] = useState('');
  const [isSelectingText, setIsSelectingText] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      let clientId = localStorage.getItem('khaliq_client_id');
      if (!clientId) {
        clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('khaliq_client_id', clientId);
      }

      const { data: likeData } = await supabase
        .from('post_likes_log')
        .select('id')
        .eq('post_id', id)
        .eq('client_id', clientId)
        .single();
      
      if (likeData) setLiked(true);

      const viewedKey = `viewed_post_${id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        await supabase.rpc('increment_view_count', { post_id: id });
        sessionStorage.setItem(viewedKey, 'true');
      }

      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      
      if (data) {
        setPost(data);
        setReadingTime(calculateReadingTime(data.content));
        setCustomExcerpt(data.excerpt || data.content.substring(0, 120).replace(/[#*`]/g, '') + "...");
        document.title = `${data.title} | Bias Fajar Khaliq`;

        if (data.category) {
            const { data: related } = await supabase
                .from('posts')
                .select('id, title, category, created_at')
                .eq('category', data.category)
                .neq('id', id)
                .eq('is_public', true)
                .limit(3);
            if (related) setRelatedPosts(related);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCanEdit(true);
    };
    fetchPost();

    return () => { document.title = 'Bias Fajar Khaliq | Repository'; }
  }, [id]);

  useEffect(() => {
    if (showVisualShare && !isSelectingText) {
        const selection = window.getSelection()?.toString().trim();
        if (selection && selection.length > 0) {
            setCustomExcerpt(selection);
            toast(t('post.tip'), "info");
        }
    }
  }, [showVisualShare, isSelectingText]);

  const getShareUrl = () => {
    if (!id) return window.location.href;
    return `${window.location.origin}/post/${id}`;
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || 'Check out this post from Khaliq Repository',
          url: shareUrl,
        });
        toast(t('post.sharedSuccess'), "success");
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    toast(t('post.linkCopied'), "success");
    setShowShareMenu(false);
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'linkedin') => {
    const shareUrl = getShareUrl();
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(post?.title || '');
    let finalLink = '';

    switch (platform) {
        case 'whatsapp': finalLink = `https://wa.me/?text=${text}%20${url}`; break;
        case 'twitter': finalLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
        case 'linkedin': finalLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
    }
    
    window.open(finalLink, '_blank');
    setShowShareMenu(false);
  };

  const handleLike = async () => {
    if (!id) return;
    
    const clientId = localStorage.getItem('khaliq_client_id') || 'unknown';
    
    const newLikedState = !liked;
    setLiked(newLikedState);
    if (post) {
        setPost({ ...post, likes: Math.max(0, (post.likes || 0) + (newLikedState ? 1 : -1)) });
    }

    try { 
        await supabase.rpc('toggle_like', { p_id: id, c_id: clientId }); 
    } catch (error) { 
        console.error(error); 
        setLiked(!newLikedState);
        if (post) setPost({ ...post, likes: Math.max(0, (post.likes || 0) + (newLikedState ? -1 : 1)) });
    }
  };

  const toggleVisibility = async () => {
    if (!post || !id) return;
    const newStatus = !post.is_public;
    
    try {
        const { error } = await supabase.from('posts').update({ is_public: newStatus }).eq('id', id);
        if (error) throw error;
        
        setPost({ ...post, is_public: newStatus });
        toast(`Postingan sekarang ${newStatus ? 'Publik' : 'Pribadi'}`, "success");
    } catch (error) {
        toast("Gagal mengubah visibilitas", "error");
    }
  };

  const generateImageBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const clone = cardRef.current.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = '600px'; 
    clone.style.height = 'auto';
    clone.style.zIndex = '-1';
    clone.style.transform = 'none';
    clone.style.borderRadius = '0';

    document.body.appendChild(clone);

    try {
        const canvas = await html2canvas(clone, {
            scale: 2, 
            backgroundColor: cardTheme === 'dark' ? '#0A0A0A' : '#FAFAFA',
            useCORS: true,
            logging: false,
            allowTaint: true,
            width: 600,
            windowWidth: 1200,
        });

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    } catch (err) {
        console.error("Capture failed:", err);
        return null;
    } finally {
        document.body.removeChild(clone);
    }
  };

  const handleDownloadImage = async () => {
    setGeneratingImage(true);
    try {
        const blob = await generateImageBlob();
        if (!blob) throw new Error("Failed to generate blob");

        const image = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = image;
        link.download = `khaliq-repo-${post?.title.slice(0, 20).replace(/\s+/g, '-')}.png`;
        link.click();
        toast("Image saved successfully", "success");
    } catch (error) {
        console.error("Image generation failed", error);
        toast("Failed to generate image", "error");
    } finally {
        setGeneratingImage(false);
    }
  };

  const handleSmartShare = async () => {
    if (!post) return;
    setGeneratingImage(true);
    try {
        const blob = await generateImageBlob();
        if (!blob) throw new Error("Failed to generate blob");

        const file = new File([blob], `khaliq-repo-${post.id}.png`, { type: 'image/png' });
        const shareData = {
            title: post.title,
            text: `${post.title}\n\nRead more at:`,
            url: getShareUrl(),
            files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            toast("Shared successfully", "success");
        } else {
            handleNativeShare();
        }
    } catch (error) {
        console.error("Smart share failed", error);
        handleNativeShare();
    } finally {
        setGeneratingImage(false);
    }
  };

  const startSelectionMode = () => {
    setShowVisualShare(false);
    setIsSelectingText(true);
  };

  const captureSelection = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
        setCustomExcerpt(selection);
        toast("Selection captured!", "success");
    } else {
        toast("No text selected. Using previous text.", "info");
    }
    setIsSelectingText(false);
    setShowVisualShare(true);
  };

  const cancelSelection = () => {
    setIsSelectingText(false);
    setShowVisualShare(true);
  };

  const getCategoryIcon = (category?: string) => {
    switch(category) {
        case 'Penelitian': return Microscope;
        case 'Catatan': return Book;
        case 'Bahasan': return MessageSquareQuote;
        default: return FileText;
    }
  };
  
  const BackgroundIcon = getCategoryIcon(post?.category);

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-t-4 border-primary rounded-full"></div>
    </div>
  );

  return (
    <>
      {/* Reading Progress Bar - Positioned below the navbar (top-20) */}
      <motion.div className="fixed top-20 left-0 right-0 h-1 bg-primary origin-left z-[40] no-print" style={{ scaleX }} />

      <div className="min-h-screen pt-28 px-5 md:px-8 max-w-6xl mx-auto pb-40 md:pb-32">
        <Link to="/repo" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group text-sm font-bold bg-secondary/50 px-5 py-2.5 rounded-full no-print">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('post.back')}
        </Link>

        <div className={cn("grid grid-cols-1 gap-10 transition-all duration-500", isFocusMode ? "max-w-4xl mx-auto" : "lg:grid-cols-12")}>
            
            {/* Main Content */}
            <article className={cn("transition-all duration-500 animate-in fade-in slide-in-from-bottom-4", isFocusMode ? "col-span-1" : "lg:col-span-8")}>
                <header className="mb-12">
                    <div className="flex flex-wrap gap-2 mb-6 no-print">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                            {post.category || 'General'}
                        </span>
                        {post.subcategory && (
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-1.5 rounded-full bg-secondary border border-border">
                                {post.subcategory}
                            </span>
                        )}
                        {post.is_pinned && (
                            <span className="text-xs font-bold uppercase tracking-wider text-primary px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1">
                                <Pin size={12} className="fill-current" /> Pinned
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.15] mb-8 relative tracking-tight">
                        <span className="relative z-10">{post.title}</span>
                        <div className="absolute -inset-4 bg-primary/5 blur-3xl -z-10 rounded-full opacity-50" />
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-b border-border pb-8">
                        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">B</div>
                            <span className="font-bold text-foreground">Bias Fajar Khaliq</span>
                        </div>
                        <span className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                            <Clock size={14} /> {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                            <Book size={14} /> {readingTime} {t('post.readTime')}
                        </span>
                    </div>
                </header>

                <div className="min-h-[300px] mb-16">
                    <MarkdownRenderer content={post.content} />
                </div>
            </article>

            {/* Sidebar: Table of Contents & Admin Insights */}
            <aside className={cn("space-y-8 no-print transition-all duration-500", isFocusMode ? "hidden opacity-0" : "lg:col-span-4 opacity-100")}>
                <div className="sticky top-28 space-y-8">
                    
                    {/* Admin Insights Panel */}
                    {canEdit && (
                        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} /> Admin Insights
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-background rounded-[1.5rem] p-4 text-center border border-border/50 shadow-sm">
                                    <Eye size={20} className="mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold text-foreground">{post.view_count}</p>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Views</p>
                                </div>
                                <div className="bg-background rounded-[1.5rem] p-4 text-center border border-border/50 shadow-sm">
                                    <Heart size={20} className="mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold text-foreground">{post.likes}</p>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Likes</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleVisibility}
                                className={cn(
                                    "w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm",
                                    post.is_public
                                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                        : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border border-orange-500/20"
                                )}
                            >
                                {post.is_public ? <Globe size={16} /> : <Lock size={16} />}
                                {post.is_public ? "Status: Publik" : "Status: Pribadi"}
                            </button>
                        </div>
                    )}

                    {/* Table of Contents */}
                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">{t('post.onThisPage')}</h3>
                        <TableOfContents content={post.content} />
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">{t('post.related')}</h3>
                            <div className="space-y-3">
                                {relatedPosts.map(related => (
                                    <Link key={related.id} to={`/post/${related.id}`} className="block p-4 rounded-[1.5rem] bg-secondary/30 hover:bg-secondary border border-transparent hover:border-border transition-all group">
                                        <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">{related.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(related.created_at), 'MMM d')}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>

        {/* Floating Action Bar (Material 3 Pill) */}
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1.5 md:gap-2 p-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)] no-print w-[90%] max-w-fit justify-center"
        >
            <button 
                onClick={handleLike} 
                className={cn(
                    "flex items-center gap-2 px-4 md:px-5 py-3 rounded-full transition-all text-sm font-bold",
                    liked ? "bg-red-500/10 text-red-500" : "hover:bg-secondary text-muted-foreground hover:text-red-500"
                )}
            >
                <Heart size={20} className={cn(liked && "fill-current")} />
                <span>{post.likes}</span>
            </button>
            
            <div className="w-px h-8 bg-border mx-1" />
            
            <button 
                onClick={() => setShowShareMenu(!showShareMenu)} 
                className={cn(
                    "p-3 rounded-full transition-colors",
                    showShareMenu ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"
                )}
                title={t('post.share')}
            >
                <Share2 size={20} />
            </button>

            <button 
                onClick={() => setIsFocusMode(!isFocusMode)} 
                className={cn(
                    "p-3 rounded-full transition-colors", 
                    isFocusMode ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"
                )}
                title="Mode Fokus"
            >
                {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {canEdit && (
                <>
                    <div className="w-px h-8 bg-border mx-1" />
                    <Link 
                        to={`/editor/${post.id}`} 
                        className="p-3 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                        title="Edit Postingan"
                    >
                        <Edit3 size={20} />
                    </Link>
                </>
            )}
        </motion.div>

        {/* Share Menu Dropdown - FIXED POSITIONING TO CENTER OF SCREEN */}
        <AnimatePresence>
            {showShareMenu && (
                <>
                    {/* Invisible backdrop to close menu when clicking outside */}
                    <div className="fixed inset-0 z-[85]" onClick={() => setShowShareMenu(false)} />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        // Fixed to the bottom center of the screen, just above the FAB
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 w-64 max-w-[90vw] bg-card border border-border rounded-[1.5rem] shadow-2xl p-2 z-[90] origin-bottom"
                    >
                        <button onClick={() => setShowVisualShare(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm font-bold text-primary transition-colors text-left">
                            <ImageIcon size={18} /> {t('post.visualShare')}
                        </button>
                        <div className="h-px bg-border my-1"></div>
                        <button onClick={() => shareToSocial('whatsapp')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm text-foreground transition-colors text-left">
                            <MessageCircle size={18} className="text-green-500" /> WhatsApp
                        </button>
                        <button onClick={() => shareToSocial('twitter')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm text-foreground transition-colors text-left">
                            <Twitter size={18} className="text-blue-400" /> X / Twitter
                        </button>
                        <button onClick={() => shareToSocial('linkedin')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm text-foreground transition-colors text-left">
                            <Linkedin size={18} className="text-blue-700" /> LinkedIn
                        </button>
                        <div className="h-px bg-border my-1"></div>
                        <button onClick={copyToClipboard} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl text-sm text-foreground transition-colors text-left">
                            <LinkIcon size={18} /> {t('post.copyLink')}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Selection Mode Floating Bar */}
        <AnimatePresence>
            {isSelectingText && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-24 left-0 right-0 z-[100] flex justify-center px-4"
                >
                    <div className="bg-foreground text-background rounded-full shadow-2xl px-6 py-4 flex items-center gap-6 max-w-md w-full justify-between">
                        <div className="flex items-center gap-3">
                            <TextCursorInput size={20} className="animate-pulse text-primary" />
                            <span className="text-sm font-bold">{t('post.selectionInstruction')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={cancelSelection}
                                className="p-2 rounded-full hover:bg-background/20 transition-colors"
                                title={t('post.cancelSelection')}
                            >
                                <X size={18} />
                            </button>
                            <button 
                                onClick={captureSelection}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-bold hover:scale-105 transition-transform"
                            >
                                {t('post.captureSelection')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Visual Share Modal */}
        <AnimatePresence>
            {showVisualShare && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                >
                    <div className="relative w-full max-w-2xl flex flex-col items-center my-auto py-8">
                        {/* Controls */}
                        <div className="w-full bg-card border border-border rounded-[2.5rem] p-6 mb-6 shadow-xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Size Selector */}
                                <div className="space-y-3">
                                    <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <Maximize size={14} /> {t('post.cardSize')}
                                    </span>
                                    <div className="grid grid-cols-4 gap-2 bg-secondary/50 rounded-3xl p-2">
                                        <button onClick={() => setAspectRatio('auto')} className={cn("py-3 rounded-2xl transition-all flex justify-center", aspectRatio === 'auto' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.auto')}>
                                            <Layout size={18} />
                                        </button>
                                        <button onClick={() => setAspectRatio('portrait')} className={cn("py-3 rounded-2xl transition-all flex justify-center", aspectRatio === 'portrait' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.portrait')}>
                                            <Smartphone size={18} />
                                        </button>
                                        <button onClick={() => setAspectRatio('square')} className={cn("py-3 rounded-2xl transition-all flex justify-center", aspectRatio === 'square' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.square')}>
                                            <Square size={18} />
                                        </button>
                                        <button onClick={() => setAspectRatio('story')} className={cn("py-3 rounded-2xl transition-all flex justify-center", aspectRatio === 'story' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.story')}>
                                            <Smartphone size={18} className="scale-y-110" />
                                        </button>
                                    </div>
                                </div>

                                {/* Theme & Text */}
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                            <Sun size={14} /> {t('post.cardTheme')}
                                        </span>
                                        <div className="flex bg-secondary/50 rounded-3xl p-2 gap-2">
                                            <button 
                                                onClick={() => setCardTheme('dark')}
                                                className={cn("flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2", cardTheme === 'dark' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                <Moon size={14} /> Dark
                                            </button>
                                            <button 
                                                onClick={() => setCardTheme('light')}
                                                className={cn("flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2", cardTheme === 'light' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                <Sun size={14} /> Light
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-muted-foreground">{t('post.customizeText')}</span>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={startSelectionMode}
                                                    className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline bg-primary/10 px-3 py-1.5 rounded-full"
                                                >
                                                    <MousePointerClick size={12} /> {t('post.selectFromPage')}
                                                </button>
                                                <button 
                                                    onClick={() => setCustomExcerpt(post.excerpt || post.content.substring(0, 120))}
                                                    className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 hover:text-foreground"
                                                >
                                                    <RefreshCw size={10} /> {t('post.reset')}
                                                </button>
                                            </div>
                                        </div>
                                        <textarea 
                                            value={customExcerpt}
                                            onChange={(e) => setCustomExcerpt(e.target.value)}
                                            className="w-full bg-secondary/50 border border-transparent rounded-[1.5rem] p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
                                            placeholder="Enter text to display on card..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REBUILT SHARE CARD */}
                        <div className="w-full flex justify-center mb-8">
                            <div 
                                ref={cardRef}
                                className={cn(
                                    "relative w-full flex flex-col justify-between overflow-hidden p-10 transition-colors duration-300",
                                    aspectRatio === 'square' ? "aspect-square" : 
                                    aspectRatio === 'portrait' ? "aspect-[4/5]" : 
                                    aspectRatio === 'story' ? "aspect-[9/16]" : 
                                    "min-h-[500px] h-auto",
                                    cardTheme === 'dark' ? "bg-[#0F0F0F] text-white" : "bg-[#FAFAFA] text-zinc-900"
                                )}
                                style={{ 
                                    borderRadius: '32px',
                                    border: cardTheme === 'dark' ? '1px solid #222' : '1px solid #EAEAEA',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                                }}
                            >
                                <div className={cn("absolute inset-0", cardTheme === 'dark' ? "bg-[#0F0F0F]" : "bg-[#FAFAFA]")}></div>
                                
                                <div className={cn(
                                    "absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-50",
                                    cardTheme === 'dark' ? "bg-[#D4AF37]/10" : "bg-[#D4AF37]/5"
                                )}></div>
                                
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.03] pointer-events-none">
                                    <BackgroundIcon size={400} className={cn("rotate-[-10deg]", cardTheme === 'dark' ? "text-white" : "text-black")} />
                                </div>
                                
                                <div className="relative z-10 flex items-center gap-4 mb-12">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full border flex items-center justify-center",
                                        cardTheme === 'dark' ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]" : "border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#B8860B]"
                                    )}>
                                        <Feather size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-sm font-bold tracking-widest uppercase", cardTheme === 'dark' ? "text-white" : "text-zinc-900")}>
                                            Khaliq Repository
                                        </span>
                                        <span className={cn("text-[10px] tracking-wider uppercase opacity-60", cardTheme === 'dark' ? "text-white" : "text-zinc-900")}>
                                            Digital Garden & Archive
                                        </span>
                                    </div>
                                </div>

                                <div className="relative z-10 flex-grow flex flex-col justify-center mb-8">
                                    <h2 className={cn(
                                        "text-4xl md:text-5xl font-bold tracking-tight mb-8 font-sans leading-[1.1]", 
                                        cardTheme === 'dark' ? "text-white" : "text-zinc-900"
                                    )}>
                                        {post.title}
                                    </h2>
                                    
                                    <div className={cn(
                                        "pl-6 border-l-4",
                                        cardTheme === 'dark' ? "border-[#D4AF37]/50" : "border-[#B8860B]/50"
                                    )}>
                                        <p className={cn(
                                            "text-xl md:text-2xl leading-relaxed italic font-serif", 
                                            cardTheme === 'dark' ? "text-zinc-300" : "text-zinc-600"
                                        )}>
                                            "{customExcerpt}"
                                        </p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "relative z-10 pt-8 border-t flex items-end justify-between w-full", 
                                    cardTheme === 'dark' ? "border-white/10" : "border-black/5"
                                )}>
                                    <div className="flex items-center gap-3">
                                         <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            cardTheme === 'dark' ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
                                         )}>
                                            <Globe size={16} />
                                         </div>
                                         <span className={cn("text-sm font-bold tracking-wide", cardTheme === 'dark' ? "text-white" : "text-zinc-900")}>
                                            khaliq-repos.pages.dev
                                         </span>
                                    </div>

                                    <div className="text-right">
                                        <p className={cn("text-xs uppercase tracking-wider opacity-60 mb-1", cardTheme === 'dark' ? "text-white" : "text-zinc-900")}>
                                            {format(new Date(post.created_at), 'MMMM d, yyyy')}
                                        </p>
                                        <p className={cn("text-sm font-bold", cardTheme === 'dark' ? "text-[#D4AF37]" : "text-[#B8860B]")}>
                                            {post.category || 'Bahasan'} • {readingTime} min read
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                            <button 
                                onClick={handleSmartShare}
                                disabled={generatingImage}
                                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center justify-center gap-3 text-sm"
                            >
                                {generatingImage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Share Card & Link
                            </button>
                            
                            <button 
                                onClick={handleDownloadImage}
                                disabled={generatingImage}
                                className="px-8 py-4 bg-secondary text-foreground font-bold rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3 text-sm"
                            >
                                {generatingImage ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                {t('post.downloadImage')}
                            </button>

                            <button 
                                onClick={() => setShowVisualShare(false)}
                                className="px-8 py-4 bg-transparent border border-border text-muted-foreground hover:text-foreground font-bold rounded-full hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <X size={18} />
                                {t('post.close')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Helper component to generate TOC
function TableOfContents({ content }: { content: string }) {
    const headings = content.match(/^#{1,3} (.*$)/gim);
    
    if (!headings || headings.length === 0) {
        return <p className="text-sm text-muted-foreground italic">Tidak ada daftar isi.</p>;
    }

    return (
        <nav className="flex flex-col gap-3">
            {headings.map((heading, index) => {
                const level = heading.match(/^#+/)?.[0].length || 1;
                const text = heading.replace(/^#+ /, '');
                
                return (
                    <a 
                        key={index} 
                        href={`#`} 
                        onClick={(e) => {
                            e.preventDefault();
                            const elements = document.querySelectorAll('h1, h2, h3');
                            for (const el of elements) {
                                if (el.textContent === text) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    break;
                                }
                            }
                        }}
                        className={cn(
                            "text-sm transition-colors hover:text-primary line-clamp-1 flex items-center gap-2",
                            level === 1 ? "font-bold text-foreground" : 
                            level === 2 ? "pl-4 text-muted-foreground" : 
                            "pl-8 text-muted-foreground/80 text-xs"
                        )}
                    >
                        {level === 1 && <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />}
                        {level === 2 && <div className="w-1 h-1 rounded-full bg-border" />}
                        {text}
                    </a>
                );
            })}
        </nav>
    );
}
