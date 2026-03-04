import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Post } from '../lib/supabase';
import { format } from 'date-fns';
import { ArrowLeft, Edit3, Clock, Share2, Heart, Link as LinkIcon, Twitter, Linkedin, MessageCircle, Download, ImageIcon, X, Loader2, Feather, Send, Moon, Sun, RefreshCw, Maximize, Smartphone, Square, Layout, MousePointerClick, TextCursorInput, Globe, Microscope, Book, MessageSquareQuote, FileText, Pin, Maximize2, Minimize2, ShieldCheck, Lock, Eye, Share, Facebook, Mail } from 'lucide-react';
import { calculateReadingTime } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Visual Share State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto');
  const [cardTheme, setCardTheme] = useState<CardTheme>('light'); 
  const [customExcerpt, setCustomExcerpt] = useState('');
  const [isSelectingText, setIsSelectingText] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

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
        
        // --- DYNAMIC SEO META TAGS ---
        document.title = `${data.title} | Bias Fajar Khaliq`;
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", data.excerpt || "A digital archive of notes, research, and discussions.");
        
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", data.title);
        
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute("content", data.excerpt || "A digital archive of notes, research, and discussions.");
        // -----------------------------

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

    return () => { 
        document.title = 'Bias Fajar Khaliq | Digital Garden & Repository'; 
    }
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

  // Native Device Share
  const handleDeviceShare = async () => {
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
      toast("Fitur share bawaan tidak didukung di perangkat ini", "info");
    }
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    toast(t('post.linkCopied'), "success");
    setShowShareMenu(false);
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'linkedin' | 'telegram' | 'facebook' | 'email') => {
    const shareUrl = getShareUrl();
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(post?.title || '');
    let finalLink = '';

    switch (platform) {
        case 'whatsapp': finalLink = `https://wa.me/?text=${text}%20${url}`; break;
        case 'twitter': finalLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
        case 'linkedin': finalLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
        case 'telegram': finalLink = `https://t.me/share/url?url=${url}&text=${text}`; break;
        case 'facebook': finalLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
        case 'email': finalLink = `mailto:?subject=${text}&body=${url}`; break;
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
            backgroundColor: cardTheme === 'dark' ? '#141414' : '#FAFAFA',
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
            handleDeviceShare();
        }
    } catch (error) {
        console.error("Smart share failed", error);
        handleDeviceShare();
    } finally {
        setGeneratingImage(false);
    }
  };

  const startSelectionMode = () => {
    setShowVisualShare(false);
    setShowShareMenu(false);
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
      <div className="min-h-screen pt-28 px-5 md:px-8 max-w-6xl mx-auto pb-48 md:pb-40">
        <Link to="/repo" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group text-sm font-bold bg-secondary px-5 py-2.5 rounded-full no-print border border-border">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('post.back')}
        </Link>

        <div className={cn("grid grid-cols-1 gap-10 transition-all duration-500", isFocusMode ? "max-w-4xl mx-auto" : "lg:grid-cols-12")}>
            
            {/* Main Content */}
            <article className={cn("transition-all duration-500 animate-in fade-in slide-in-from-bottom-4", isFocusMode ? "col-span-1" : "lg:col-span-8")}>
                <header className="mb-12 relative">
                    {post.is_pinned && (
                        <div className="absolute -top-4 right-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider no-print">
                            <Pin size={12} className="fill-current" /> Pinned
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6 no-print">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                            {post.category || 'General'}
                        </span>
                        {post.subcategory && (
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 py-1.5 rounded-full bg-secondary border border-border">
                                {post.subcategory}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.15] mb-6 relative tracking-tight">
                        <span className="relative z-10">{post.title}</span>
                    </h1>
                    
                    {post.is_pinned && post.summary && (
                        <div className="mb-8 pl-5 border-l-4 border-primary/40">
                            <p className="text-lg md:text-xl text-muted-foreground italic font-serif leading-relaxed">
                                "{post.summary}"
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-b border-border pb-8 mt-6">
                        <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-full border border-border">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">B</div>
                            <span className="font-bold text-foreground">Bias Fajar Khaliq</span>
                        </div>
                        <span className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border border-border">
                            <Clock size={14} /> {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full border border-border">
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
                    
                    {canEdit && (
                        <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} /> Admin Insights
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-card/80 backdrop-blur-sm rounded-[1.5rem] p-4 text-center border border-border/50 shadow-sm">
                                    <Eye size={20} className="mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-2xl font-bold text-foreground">{post.view_count}</p>
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Views</p>
                                </div>
                                <div className="bg-card/80 backdrop-blur-sm rounded-[1.5rem] p-4 text-center border border-border/50 shadow-sm">
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

                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">{t('post.onThisPage')}</h3>
                        <TableOfContents content={post.content} />
                    </div>

                    {relatedPosts.length > 0 && (
                        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">{t('post.related')}</h3>
                            <div className="space-y-3">
                                {relatedPosts.map(related => (
                                    <Link key={related.id} to={`/post/${related.id}`} className="block p-4 rounded-[1.5rem] bg-secondary hover:bg-border/50 border border-transparent transition-all group">
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

        {/* Floating Action Bar */}
        <AnimatePresence>
            {!isSelectingText && (
                <div className="fixed bottom-6 md:bottom-10 inset-x-0 z-[80] flex justify-center pointer-events-none px-4 no-print">
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        className="pointer-events-auto flex items-center gap-1 md:gap-2 p-2 bg-card/80 backdrop-blur-xl border border-border/50 rounded-full shadow-md max-w-full overflow-x-auto no-scrollbar"
                    >
                        <button 
                            onClick={handleLike} 
                            className={cn(
                                "flex items-center gap-2 px-4 md:px-6 py-3 rounded-full transition-all text-sm font-bold shrink-0",
                                liked ? "bg-red-500/10 text-red-500" : "hover:bg-secondary/80 text-muted-foreground hover:text-red-500"
                            )}
                        >
                            <Heart size={20} className={cn(liked && "fill-current")} />
                            <span>{post.likes}</span>
                        </button>
                        
                        <div className="w-px h-6 bg-border mx-1 shrink-0" />
                        
                        <button 
                            onClick={() => setShowShareMenu(!showShareMenu)} 
                            className={cn(
                                "p-3 rounded-full transition-colors shrink-0",
                                showShareMenu ? "bg-primary text-primary-foreground" : "hover:bg-secondary/80 text-muted-foreground"
                            )}
                        >
                            <Share2 size={20} />
                        </button>

                        <button 
                            onClick={() => setIsFocusMode(!isFocusMode)} 
                            className={cn(
                                "p-3 rounded-full transition-colors shrink-0", 
                                isFocusMode ? "bg-primary text-primary-foreground" : "hover:bg-secondary/80 text-muted-foreground"
                            )}
                        >
                            {isFocusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>

                        {canEdit && (
                            <>
                                <div className="w-px h-6 bg-border mx-1 shrink-0" />
                                <Link 
                                    to={`/editor/${post.id}`} 
                                    className="p-3 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground shrink-0"
                                >
                                    <Edit3 size={20} />
                                </Link>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Share Menu Dropdown with Blur Backdrop */}
        <AnimatePresence>
            {showShareMenu && (
                <>
                    {/* Esthetic Frosted Glass Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[85] bg-background/60 backdrop-blur-md transition-all" 
                        onClick={() => setShowShareMenu(false)} 
                    />
                    
                    <div className="fixed bottom-24 md:bottom-28 inset-x-0 z-[90] flex justify-center pointer-events-none px-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            className="pointer-events-auto w-72 max-w-full bg-card/90 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-xl p-3 origin-bottom"
                        >
                            {/* Primary Actions */}
                            <div className="space-y-2 mb-3">
                                <button 
                                    onClick={() => { setShowVisualShare(true); setShowShareMenu(false); }} 
                                    className="w-full flex items-center justify-between px-4 py-3.5 bg-primary/10 hover:bg-primary/20 rounded-[1.2rem] text-sm font-bold text-primary transition-colors"
                                >
                                    <span className="flex items-center gap-3"><ImageIcon size={18} /> {t('post.visualShare')}</span>
                                    <ArrowLeft size={14} className="rotate-135" />
                                </button>
                                
                                <button 
                                    onClick={handleDeviceShare} 
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/80 rounded-[1.2rem] text-sm font-bold text-foreground transition-colors"
                                >
                                    <Share size={18} className="text-muted-foreground" /> Share via Device
                                </button>
                            </div>

                            <div className="h-px bg-border/50 my-2"></div>

                            {/* Social Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                <button onClick={() => shareToSocial('whatsapp')} className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-secondary/80 rounded-xl transition-colors">
                                    <MessageCircle size={22} className="text-green-500" />
                                    <span className="text-[10px] font-medium text-muted-foreground">WA</span>
                                </button>
                                <button onClick={() => shareToSocial('telegram')} className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-secondary/80 rounded-xl transition-colors">
                                    <Send size={22} className="text-blue-500" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Telegram</span>
                                </button>
                                <button onClick={() => shareToSocial('twitter')} className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-secondary/80 rounded-xl transition-colors">
                                    <Twitter size={22} className="text-foreground" />
                                    <span className="text-[10px] font-medium text-muted-foreground">X</span>
                                </button>
                                <button onClick={() => shareToSocial('facebook')} className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-secondary/80 rounded-xl transition-colors">
                                    <Facebook size={22} className="text-blue-600" />
                                    <span className="text-[10px] font-medium text-muted-foreground">FB</span>
                                </button>
                                <button onClick={() => shareToSocial('linkedin')} className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-secondary/80 rounded-xl transition-colors">
                                    <Linkedin size={22} className="text-blue-700" />
                                    <span className="text-[10px] font-medium text-muted-foreground">LinkedIn</span>
                                </button>
                                <button onClick={() => shareToSocial('email')} className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-secondary/80 rounded-xl transition-colors">
                                    <Mail size={22} className="text-orange-500" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Email</span>
                                </button>
                            </div>

                            <div className="h-px bg-border/50 my-2"></div>
                            
                            <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-secondary/80 rounded-[1.2rem] text-sm font-bold text-foreground transition-colors">
                                <LinkIcon size={16} /> {t('post.copyLink')}
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>

        {/* Selection Mode Floating Bar */}
        <AnimatePresence>
            {isSelectingText && (
                <div className="fixed bottom-8 md:bottom-10 inset-x-0 z-[100] flex justify-center pointer-events-none px-4">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        className="pointer-events-auto w-full max-w-md bg-foreground/95 backdrop-blur-md text-background rounded-full shadow-md p-2 pl-4 flex items-center justify-between border border-border/50 gap-3"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <TextCursorInput size={18} className="text-primary shrink-0" />
                            <span className="text-xs md:text-sm font-bold truncate">{t('post.selectionInstruction')}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button 
                                onClick={cancelSelection}
                                className="p-2.5 rounded-full hover:bg-background/20 transition-colors text-muted-foreground hover:text-background shrink-0"
                            >
                                <X size={16} />
                            </button>
                            <button 
                                onClick={captureSelection}
                                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                            >
                                {t('post.captureSelection')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Visual Share Modal */}
        <AnimatePresence>
            {showVisualShare && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                >
                    <div className="relative w-full max-w-2xl flex flex-col items-center my-auto py-8">
                        {/* Controls */}
                        <div className="w-full bg-card/90 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-6 mb-6 shadow-md space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Size Selector */}
                                <div className="space-y-3">
                                    <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                        <Maximize size={14} /> {t('post.cardSize')}
                                    </span>
                                    <div className="grid grid-cols-4 gap-2 bg-secondary/80 rounded-full p-1 border border-border/50">
                                        <button onClick={() => setAspectRatio('auto')} className={cn("py-2.5 rounded-full transition-all flex justify-center", aspectRatio === 'auto' ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.auto')}>
                                            <Layout size={18} />
                                        </button>
                                        <button onClick={() => setAspectRatio('portrait')} className={cn("py-2.5 rounded-full transition-all flex justify-center", aspectRatio === 'portrait' ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.portrait')}>
                                            <Smartphone size={18} />
                                        </button>
                                        <button onClick={() => setAspectRatio('square')} className={cn("py-2.5 rounded-full transition-all flex justify-center", aspectRatio === 'square' ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.square')}>
                                            <Square size={18} />
                                        </button>
                                        <button onClick={() => setAspectRatio('story')} className={cn("py-2.5 rounded-full transition-all flex justify-center", aspectRatio === 'story' ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground")} title={t('post.sizes.story')}>
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
                                        <div className="flex bg-secondary/80 rounded-full p-1 gap-1 border border-border/50">
                                            <button 
                                                onClick={() => setCardTheme('dark')}
                                                className={cn("flex-1 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2", cardTheme === 'dark' ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground")}
                                            >
                                                <Moon size={14} /> Dark
                                            </button>
                                            <button 
                                                onClick={() => setCardTheme('light')}
                                                className={cn("flex-1 py-2 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2", cardTheme === 'light' ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground")}
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
                                            className="w-full bg-secondary/80 border border-border/50 rounded-[1.5rem] p-4 text-sm focus:border-primary outline-none transition-all resize-none h-24"
                                            placeholder="Enter text to display on card..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REBUILT SHARE CARD - Solid Gold Theme */}
                        <div className="w-full flex justify-center mb-8">
                            <div 
                                ref={cardRef}
                                className={cn(
                                    "relative w-full flex flex-col justify-between overflow-hidden p-10 transition-colors duration-300",
                                    aspectRatio === 'square' ? "aspect-square" : 
                                    aspectRatio === 'portrait' ? "aspect-[4/5]" : 
                                    aspectRatio === 'story' ? "aspect-[9/16]" : 
                                    "min-h-[500px] h-auto",
                                    cardTheme === 'dark' ? "bg-[#141414] text-[#E5E5E5]" : "bg-[#FAFAFA] text-[#1A1A1A]"
                                )}
                                style={{ 
                                    borderRadius: '32px',
                                    border: cardTheme === 'dark' ? '1px solid #2E2E2E' : '1px solid #E0E0E0',
                                }}
                            >
                                <div className={cn("absolute inset-0", cardTheme === 'dark' ? "bg-[#141414]" : "bg-[#FAFAFA]")}></div>
                                
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.03] pointer-events-none">
                                    <BackgroundIcon size={400} className={cn("rotate-[-10deg]", cardTheme === 'dark' ? "text-white" : "text-black")} />
                                </div>
                                
                                <div className="relative z-10 flex items-center gap-4 mb-12">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full border flex items-center justify-center",
                                        cardTheme === 'dark' ? "border-[#CBAE70]/30 bg-[#CBAE70]/10 text-[#CBAE70]" : "border-[#B39559]/30 bg-[#B39559]/10 text-[#B39559]"
                                    )}>
                                        <Feather size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-sm font-bold tracking-widest uppercase", cardTheme === 'dark' ? "text-[#E5E5E5]" : "text-[#1A1A1A]")}>
                                            Khaliq Repository
                                        </span>
                                        <span className={cn("text-[10px] tracking-wider uppercase opacity-60", cardTheme === 'dark' ? "text-[#E5E5E5]" : "text-[#1A1A1A]")}>
                                            Digital Garden & Archive
                                        </span>
                                    </div>
                                </div>

                                <div className="relative z-10 flex-grow flex flex-col justify-center mb-8">
                                    <h2 className={cn(
                                        "text-4xl md:text-5xl font-bold tracking-tight mb-8 font-sans leading-[1.1]", 
                                        cardTheme === 'dark' ? "text-[#E5E5E5]" : "text-[#1A1A1A]"
                                    )}>
                                        {post.title}
                                    </h2>
                                    
                                    <div className={cn(
                                        "pl-6 border-l-4",
                                        cardTheme === 'dark' ? "border-[#CBAE70]/50" : "border-[#B39559]/50"
                                    )}>
                                        <p className={cn(
                                            "text-xl md:text-2xl leading-relaxed italic font-serif whitespace-pre-wrap", 
                                            cardTheme === 'dark' ? "text-[#A3A3A3]" : "text-[#666666]"
                                        )}>
                                            "{customExcerpt}"
                                        </p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "relative z-10 pt-8 border-t flex items-end justify-between w-full", 
                                    cardTheme === 'dark' ? "border-[#2E2E2E]" : "border-[#E0E0E0]"
                                )}>
                                    <div className="flex items-center gap-3">
                                         <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            cardTheme === 'dark' ? "bg-[#E5E5E5] text-[#141414]" : "bg-[#1A1A1A] text-[#FAFAFA]"
                                         )}>
                                            <Globe size={16} />
                                         </div>
                                         <span className={cn("text-sm font-bold tracking-wide", cardTheme === 'dark' ? "text-[#E5E5E5]" : "text-[#1A1A1A]")}>
                                            khaliq-repos.pages.dev
                                         </span>
                                    </div>

                                    <div className="text-right">
                                        <p className={cn("text-xs uppercase tracking-wider opacity-60 mb-1", cardTheme === 'dark' ? "text-[#E5E5E5]" : "text-[#1A1A1A]")}>
                                            {format(new Date(post.created_at), 'MMMM d, yyyy')}
                                        </p>
                                        <p className={cn("text-sm font-bold", cardTheme === 'dark' ? "text-[#CBAE70]" : "text-[#B39559]")}>
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
                                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-3 text-sm"
                            >
                                {generatingImage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Share Card & Link
                            </button>
                            
                            <button 
                                onClick={handleDownloadImage}
                                disabled={generatingImage}
                                className="px-8 py-4 bg-secondary/80 text-foreground font-bold rounded-full hover:bg-secondary transition-colors flex items-center justify-center gap-3 text-sm"
                            >
                                {generatingImage ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                {t('post.downloadImage')}
                            </button>

                            <button 
                                onClick={() => setShowVisualShare(false)}
                                className="px-8 py-4 bg-transparent border border-border/50 text-muted-foreground hover:text-foreground font-bold rounded-full hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-sm"
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
