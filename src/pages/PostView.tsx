import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Post } from '../lib/supabase';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Eye, Clock, Share2, Check, Printer, ArrowRight, Heart, Link as LinkIcon, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { calculateReadingTime } from '../lib/utils';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export default function PostView() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  
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
      
      const likedKey = `liked_post_${id}`;
      if (localStorage.getItem(likedKey)) setLiked(true);

      const viewedKey = `viewed_post_${id}`;
      if (!localStorage.getItem(viewedKey)) {
        await supabase.rpc('increment_view_count', { post_id: id });
        localStorage.setItem(viewedKey, 'true');
      }

      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      
      if (data) {
        setPost(data);
        setReadingTime(calculateReadingTime(data.content));
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || 'Check out this post from Khaliq Repository',
          url: window.location.href,
        });
        toast("Shared successfully", "success");
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard", "success");
    setShowShareMenu(false);
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post?.title || '');
    let shareUrl = '';

    switch (platform) {
        case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
        case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
        case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
    }
    
    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleLike = async () => {
    if (!id || liked) return;
    setLiked(true);
    if (post) setPost({ ...post, likes: (post.likes || 0) + 1 });
    localStorage.setItem(`liked_post_${id}`, 'true');
    try { await supabase.rpc('increment_likes', { post_id: id }); } catch (error) { console.error(error); }
  };

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-t-2 border-primary rounded-full"></div>
    </div>
  );

  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[60] no-print" style={{ scaleX }} />

      <div className="min-h-screen pt-24 px-6 max-w-5xl mx-auto pb-20">
        <Link to="/repo" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group text-sm font-medium no-print">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Repository
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Main Content */}
            <article className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="mb-10">
                    <div className="flex gap-2 mb-6 no-print">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10">
                            {post.category || 'General'}
                        </span>
                        {post.subcategory && (
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 rounded-full bg-secondary">
                                {post.subcategory}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">{post.title}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6">
                        <span className="font-bold text-foreground">Bias Fajar Khaliq</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                        <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {readingTime} min read</span>
                    </div>
                </header>

                <div className="min-h-[300px] mb-16">
                    <MarkdownRenderer content={post.content} />
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center justify-between py-6 border-t border-border no-print">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLike}
                        disabled={liked}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold",
                            liked ? "bg-red-50 text-red-500" : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-red-500"
                        )}
                    >
                        <Heart size={18} className={cn(liked && "fill-current")} />
                        {liked ? "Liked" : "Like"} {post.likes > 0 && <span className="opacity-70">({post.likes})</span>}
                    </motion.button>

                    <div className="flex gap-2 relative">
                         {canEdit && (
                            <Link to={`/editor/${post.id}`} className="p-2.5 bg-secondary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Edit size={18} />
                            </Link>
                        )}
                        <button onClick={() => window.print()} className="p-2.5 bg-secondary rounded-full hover:bg-foreground hover:text-background transition-colors">
                            <Printer size={18} />
                        </button>
                        
                        <div className="relative">
                            <button 
                                onClick={handleNativeShare}
                                className="px-4 py-2.5 bg-foreground text-background rounded-full hover:opacity-90 transition-colors flex items-center gap-2 text-sm font-bold"
                            >
                                <Share2 size={18} /> Share
                            </button>

                            <AnimatePresence>
                                {showShareMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-0 mb-2 w-48 bg-card border border-border rounded-xl shadow-xl p-2 z-50 origin-bottom-right"
                                    >
                                        <button onClick={() => shareToSocial('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors text-left">
                                            <MessageCircle size={16} className="text-green-500" /> WhatsApp
                                        </button>
                                        <button onClick={() => shareToSocial('twitter')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors text-left">
                                            <Twitter size={16} className="text-blue-400" /> X / Twitter
                                        </button>
                                        <button onClick={() => shareToSocial('linkedin')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors text-left">
                                            <Linkedin size={16} className="text-blue-700" /> LinkedIn
                                        </button>
                                        <div className="h-px bg-border my-1"></div>
                                        <button onClick={copyToClipboard} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors text-left">
                                            <LinkIcon size={16} /> Copy Link
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </article>

            {/* Sidebar: Table of Contents & Related */}
            <aside className="lg:col-span-4 space-y-8 no-print">
                <div className="sticky top-24 space-y-8">
                    {/* Table of Contents */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">On this page</h3>
                        <TableOfContents content={post.content} />
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Related</h3>
                            <div className="space-y-3">
                                {relatedPosts.map(related => (
                                    <Link key={related.id} to={`/post/${related.id}`} className="block p-4 rounded-xl bg-secondary/30 hover:bg-secondary border border-transparent hover:border-border transition-all group">
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
      </div>
    </>
  );
}

// Helper component to generate TOC
function TableOfContents({ content }: { content: string }) {
    const headings = content.match(/^#{1,3} (.*$)/gim);
    
    if (!headings || headings.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No sections found.</p>;
    }

    return (
        <nav className="flex flex-col gap-2">
            {headings.map((heading, index) => {
                const level = heading.match(/^#+/)?.[0].length || 1;
                const text = heading.replace(/^#+ /, '');
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                
                // We need to ensure the MarkdownRenderer actually adds these IDs to headings
                // For now, we'll just link to top if IDs aren't there, but ideally MarkdownRenderer handles this
                
                return (
                    <a 
                        key={index} 
                        href={`#`} // In a real app, we'd add IDs to headers
                        onClick={(e) => {
                            e.preventDefault();
                            // Simple scroll to text match
                            const elements = document.querySelectorAll('h1, h2, h3');
                            for (const el of elements) {
                                if (el.textContent === text) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    break;
                                }
                            }
                        }}
                        className={cn(
                            "text-sm transition-colors hover:text-primary line-clamp-1",
                            level === 1 ? "font-bold text-foreground" : 
                            level === 2 ? "pl-3 text-muted-foreground" : 
                            "pl-6 text-muted-foreground/80 text-xs"
                        )}
                    >
                        {text}
                    </a>
                );
            })}
        </nav>
    );
}
