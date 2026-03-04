import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Post } from '../lib/supabase';
import { format } from 'date-fns';
import { Eye, EyeOff, Plus, Search, ChevronRight, Filter, Layers, Trash2, Heart, Users, MousePointerClick, TrendingUp, Archive, Pin, PinOff, User, ExternalLink, Github, Cpu, Database, Smartphone, LayoutGrid, List, ChevronDown, Clock, X, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, calculateReadingTime } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { useLanguage } from '../lib/language';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export default function Repository() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // State for Accordion (Expanded Panels)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  
  // Analytics State
  const [siteVisits, setSiteVisits] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
    fetchPosts();
    fetchAnalytics();
    
    // Read URL params for initial tab
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
        setActiveTab(tabParam);
    }
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAdmin(!!user);
  };

  const fetchAnalytics = async () => {
    const { data: visits } = await supabase
        .from('site_visits')
        .select('count')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
    
    if (visits) setSiteVisits(visits.count);

    const { data: postsStats } = await supabase
        .from('posts')
        .select('view_count, likes');
    
    if (postsStats) {
        const views = postsStats.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
        const likes = postsStats.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        setTotalViews(views);
        setTotalLikes(likes);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setPosts(data);
        setFilteredPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Accordion Panel
  const toggleExpand = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      const newSet = new Set(expandedPosts);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setExpandedPosts(newSet);
  };

  // Quick Copy Link
  const handleCopyLink = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}/post/${id}`;
      navigator.clipboard.writeText(url);
      toast(t('post.linkCopied'), "success");
  };

  // Admin Actions
  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
        const { error } = await supabase.from('posts').delete().eq('id', deleteId);
        if (error) throw error;
        
        toast("Post deleted successfully", "success");
        setPosts(posts.filter(p => p.id !== deleteId));
        setDeleteId(null);
    } catch (err: any) {
        toast("Failed to delete post", "error");
    }
  };

  const toggleVisibility = async (e: React.MouseEvent, post: Post) => {
    e.preventDefault();
    e.stopPropagation();
    const newIsPublic = !post.is_public;

    try {
        const { error } = await supabase
            .from('posts')
            .update({ is_public: newIsPublic })
            .eq('id', post.id);

        if (error) throw error;

        const updatedPosts = posts.map(p => 
            p.id === post.id ? { ...p, is_public: newIsPublic } : p
        );
        setPosts(updatedPosts);
        
        toast(newIsPublic ? "Post is now Public" : "Post is now Private", "info");
    } catch (err: any) {
        toast(`Failed to update visibility: ${err.message}`, "error");
    }
  };

  const togglePin = async (e: React.MouseEvent, post: Post) => {
    e.preventDefault();
    e.stopPropagation();
    const newIsPinned = !post.is_pinned;

    try {
        const { error } = await supabase
            .from('posts')
            .update({ is_pinned: newIsPinned })
            .eq('id', post.id);

        if (error) throw error;

        const updatedPosts = posts.map(p => 
            p.id === post.id ? { ...p, is_pinned: newIsPinned } : p
        ).sort((a, b) => {
            const aPinned = a.is_pinned ? 1 : 0;
            const bPinned = b.is_pinned ? 1 : 0;
            if (aPinned !== bPinned) return bPinned - aPinned;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setPosts(updatedPosts);
        toast(newIsPinned ? t('repo.pinSuccess') : t('repo.unpinSuccess'), "info");
    } catch (err: any) {
        toast(`Failed to update pin status: ${err.message}`, "error");
    }
  };

  useEffect(() => {
    let filtered = posts;
    
    if (!isAdmin && !loading) {
        filtered = filtered.filter(p => p.is_public);
    }

    if (activeTab === 'Drafts') {
        filtered = filtered.filter(p => p.status === 'draft');
    } else if (activeTab !== 'All') {
        filtered = filtered.filter(p => p.category === activeTab);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) || 
        post.excerpt?.toLowerCase().includes(lowerQuery) ||
        post.category?.toLowerCase().includes(lowerQuery) ||
        post.subcategory?.toLowerCase().includes(lowerQuery)
      );
    }
    setFilteredPosts(filtered);
  }, [searchQuery, posts, isAdmin, loading, activeTab]);

  const stats = {
    total: posts.length,
    public: posts.filter(p => p.is_public).length,
    drafts: posts.filter(p => p.status === 'draft').length,
    research: posts.filter(p => p.category === 'Penelitian').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
            <div className="h-4 w-32 bg-secondary rounded-full"></div>
        </div>
      </div>
    );
  }

  const tabs = [
      { id: 'All', label: t('repo.tabs.all') },
      { id: 'Catatan', label: t('repo.tabs.notes') },
      { id: 'Penelitian', label: t('repo.tabs.research') },
      { id: 'Bahasan', label: t('repo.tabs.discussion') }
  ];
  if (isAdmin) tabs.push({ id: 'Drafts', label: t('repo.tabs.drafts') });

  return (
    <div className="min-h-screen pt-32 px-5 md:px-8 max-w-7xl mx-auto pb-20">
      <ConfirmDialog 
        isOpen={!!deleteId}
        title={t('repo.deleteTitle')}
        message={t('repo.deleteMsg')}
        confirmText={t('editor.confirm')}
        cancelText={t('editor.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-4 rounded-full bg-secondary text-foreground text-[10px] font-bold tracking-[0.2em] uppercase border border-border/50">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
                        Digital Garden
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-3 tracking-tight">
                        {t('repo.title')}
                    </h1>
                    <p className="text-muted-foreground max-w-md text-sm md:text-base leading-relaxed">
                        A curation of technical notes, system architecture research, and philosophical inquiries.
                    </p>
                </div>
                
                {isAdmin && (
                    <Link to="/editor/new" className="flex items-center gap-2 px-6 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20 group shrink-0">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
                        {t('repo.newEntry')}
                    </Link>
                )}
            </div>

            {/* Filters & Search - Floating Dock */}
            <div className="bg-card/90 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-3 shadow-lg shadow-black/5 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-[6.5rem] z-30 transition-all">
                
                {/* Segmented Control Style Tabs */}
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1 bg-secondary/30 rounded-[1.5rem] no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-5 py-2 rounded-[1.2rem] text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64 flex items-center">
                        <Search className="absolute left-4 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('repo.search')} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-secondary/50 border border-transparent rounded-full py-3 pl-12 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 p-1.5 rounded-full bg-background text-muted-foreground hover:text-foreground shadow-sm"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="hidden md:flex bg-secondary/30 rounded-full p-1 border border-border/50">
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={cn("p-2 rounded-full transition-colors", viewMode === 'list' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                        >
                            <List size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={cn("p-2 rounded-full transition-colors", viewMode === 'grid' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts List / Grid */}
            <div className={cn(
                viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-4"
            )}>
                <AnimatePresence>
                    {filteredPosts.map((post, index) => {
                        const isExpanded = expandedPosts.has(post.id);
                        const readTime = calculateReadingTime(post.content);

                        return (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            className={cn(
                                "bg-card border rounded-[2rem] transition-all duration-300 relative overflow-hidden flex flex-col",
                                post.status === 'draft' ? "border-orange-500/30 bg-orange-500/5" : "border-border hover:border-primary/30",
                                viewMode === 'list' ? "p-5 md:p-6" : "p-6 md:p-8 hover:shadow-xl hover:shadow-primary/5 h-full"
                            )}
                        >
                            {post.status === 'draft' && (
                                <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-2xl">
                                    Draft
                                </div>
                            )}

                            {/* Pinned Post Indicator & Note */}
                            {post.is_pinned && (
                                <div className="mb-5 bg-primary/5 border border-primary/20 rounded-[1.5rem] p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                                        <Pin size={14} className="fill-current" /> Pinned
                                    </div>
                                    {post.summary && (
                                        <p className="text-sm text-foreground/80 italic border-l-2 border-primary/50 pl-3 py-0.5">
                                            "{post.summary}"
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Compact Header (Always Visible) */}
                            <div 
                                className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group", viewMode === 'grid' && "mb-5")}
                                onClick={(e) => viewMode === 'list' ? toggleExpand(e, post.id) : null}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        post.category === 'Catatan' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                        post.category === 'Penelitian' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                                        "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {post.category || 'Umum'}
                                    </span>
                                    
                                    {post.subcategory && (
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-secondary/50 px-3 py-1.5 rounded-full">
                                            {post.subcategory}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={12} /> {format(new Date(post.created_at), 'MMM d, yyyy')}
                                    </span>
                                    {viewMode === 'list' && (
                                        <button className="p-1.5 rounded-full bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <ChevronDown size={16} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Title - Clickable to go to post */}
                            <Link to={`/post/${post.id}`} className={cn("block mt-3", viewMode === 'grid' && "flex-grow")}>
                                <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                {viewMode === 'grid' && (
                                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mt-3">
                                        {post.excerpt || post.content.substring(0, 150) + "..."}
                                    </p>
                                )}
                            </Link>

                            {/* Expandable Body (List View) or Static Footer (Grid View) */}
                            <AnimatePresence>
                                {(isExpanded || viewMode === 'grid') && (
                                    <motion.div
                                        initial={viewMode === 'list' ? { height: 0, opacity: 0, marginTop: 0 } : false}
                                        animate={viewMode === 'list' ? { height: 'auto', opacity: 1, marginTop: 16 } : false}
                                        exit={viewMode === 'list' ? { height: 0, opacity: 0, marginTop: 0 } : false}
                                        className="overflow-hidden"
                                    >
                                        <div className={cn("flex flex-col gap-4", viewMode === 'grid' ? "mt-6 pt-5 border-t border-border/50" : "pt-4 border-t border-border/50")}>
                                            
                                            {viewMode === 'list' && (
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {post.excerpt || post.content.substring(0, 200) + "..."}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between w-full flex-wrap gap-4">
                                                <div className="flex items-center gap-3 text-muted-foreground">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium bg-secondary/50 px-3 py-1.5 rounded-full" title="Views">
                                                        <Eye size={14} /> {post.view_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-medium bg-secondary/50 px-3 py-1.5 rounded-full" title="Likes">
                                                        <Heart size={14} /> {post.likes || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-medium bg-secondary/50 px-3 py-1.5 rounded-full" title="Est. Read Time">
                                                        <Clock size={14} /> {readTime} min
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {/* Quick Copy Link Button */}
                                                    <button 
                                                        onClick={(e) => handleCopyLink(e, post.id)}
                                                        className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                        title={t('post.copyLink')}
                                                    >
                                                        <LinkIcon size={14} />
                                                    </button>

                                                    {isAdmin && (
                                                        <div className="flex items-center gap-1 border-x border-border px-2 mx-1">
                                                            <button 
                                                                onClick={(e) => togglePin(e, post)}
                                                                className={cn("p-2 rounded-full hover:bg-secondary transition-colors", post.is_pinned ? "text-primary bg-primary/10" : "text-muted-foreground")}
                                                                title={post.is_pinned ? t('repo.unpin') : t('repo.pin')}
                                                            >
                                                                {post.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                                                            </button>
                                                            <button 
                                                                onClick={(e) => toggleVisibility(e, post)}
                                                                className={cn("p-2 rounded-full hover:bg-secondary transition-colors", post.is_public ? "text-emerald-500 bg-emerald-500/10" : "text-orange-500 bg-orange-500/10")}
                                                                title={post.is_public ? t('repo.makePrivate') : t('repo.makePublic')}
                                                            >
                                                                {post.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                                                            </button>
                                                            <button 
                                                                onClick={(e) => confirmDelete(e, post.id)}
                                                                className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                                title={t('repo.delete')}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    <Link to={`/post/${post.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full transition-colors">
                                                        Read Full <ChevronRight size={14} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredPosts.length === 0 && (
                    <div className="col-span-full text-center py-24 text-muted-foreground bg-secondary/20 rounded-[2.5rem] border border-dashed border-border">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Filter size={24} />
                        </div>
                        <p className="font-medium">{t('repo.noEntries')}</p>
                        {isAdmin && (
                            <Link to="/editor/new" className="text-primary text-sm font-bold mt-2 inline-block hover:underline">
                                {t('repo.newEntry')}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <User size={120} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <User size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground leading-tight">Bias Fajar Khaliq</h3>
                            <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">Industrial Pro & Dev</p>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                        Specializing in <strong>Water Treatment Technology</strong> and <strong>Android System Development</strong>. Driven by efficiency, HSE compliance, and open-source collaboration.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 text-[10px] font-bold text-foreground"><Cpu size={12} /> AutoCAD</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 text-[10px] font-bold text-foreground"><Database size={12} /> Data Analysis</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 text-[10px] font-bold text-foreground"><Smartphone size={12} /> Android Dev</span>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-border/50">
                        <a href="https://xdaforums.com/m/khaliq-morpheus.13212421/" target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 text-xs font-bold text-foreground bg-secondary/50 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors border border-transparent hover:border-primary/20">
                            XDA Profile <ExternalLink size={12} />
                        </a>
                        <a href="https://github.com/Bias8145" target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 text-xs font-bold text-foreground bg-secondary/50 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors border border-transparent hover:border-primary/20">
                            GitHub <Github size={12} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Public Stats Overview */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" /> Repository Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-5 rounded-[1.5rem] border border-border/50">
                        <p className="text-3xl font-serif font-bold text-foreground">{stats.public}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">Public Entries</p>
                    </div>
                    <div className="bg-secondary/30 p-5 rounded-[1.5rem] border border-border/50">
                        <p className="text-3xl font-serif font-bold text-foreground">{stats.research}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">Research Papers</p>
                    </div>
                    <div className="bg-secondary/30 p-5 rounded-[1.5rem] border border-border/50">
                        <p className="text-3xl font-serif font-bold text-foreground">{totalViews}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">Total Reads</p>
                    </div>
                    <div className="bg-secondary/30 p-5 rounded-[1.5rem] border border-border/50">
                        <p className="text-3xl font-serif font-bold text-foreground">{totalLikes}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">Appreciations</p>
                    </div>
                </div>
            </div>

            {/* Admin Extra Stats */}
            {isAdmin && (
                <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Layers size={18} /> Admin Overview
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-background p-4 rounded-2xl border border-border/50 shadow-sm">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Drafts</span>
                            <span className="text-lg font-bold text-orange-500">{stats.drafts}</span>
                        </div>
                        <div className="flex items-center justify-between bg-background p-4 rounded-2xl border border-border/50 shadow-sm">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Visitors Today</span>
                            <span className="text-lg font-bold text-blue-500">{siteVisits}</span>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
      </div>
    </div>
  );
}
