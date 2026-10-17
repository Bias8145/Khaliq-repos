import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Link2, Twitter, Facebook, Linkedin, Mail, MessageCircle, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from './Toast';

interface ShareButtonsProps {
  url: string;
  title: string;
  excerpt?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export function ShareButtons({ 
  url, 
  title, 
  excerpt = '', 
  className,
  variant = 'default'
}: ShareButtonsProps) {
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard', 'success');
    } catch (err) {
      toast('Failed to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-full bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Copy link"
        >
          <Link2 size={16} aria-hidden="true" />
        </button>
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Share"
        >
          <Share2 size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <ShareButton icon={<Link2 size={14} />} onClick={handleCopyLink} label="Copy link" />
        <ShareButton icon={<Twitter size={14} />} href={shareLinks.twitter} label="Twitter" />
        <ShareButton icon={<Facebook size={14} />} href={shareLinks.facebook} label="Facebook" />
        <ShareButton icon={<Linkedin size={14} />} href={shareLinks.linkedin} label="LinkedIn" />
        <ShareButton icon={<MessageCircle size={14} />} href={shareLinks.whatsapp} label="WhatsApp" />
      </div>
    );
  }

  return (
    <div 
      className={cn("grid grid-cols-4 md:grid-cols-7 gap-2", className)}
      role="group"
      aria-label="Share options"
    >
      <ShareButtonLarge 
        icon={<Link2 size={18} />} 
        onClick={handleCopyLink} 
        label="Copy Link"
        color="bg-secondary"
      />
      <ShareButtonLarge 
        icon={<Twitter size={18} />} 
        href={shareLinks.twitter} 
        label="Twitter"
        color="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]"
      />
      <ShareButtonLarge 
        icon={<Facebook size={18} />} 
        href={shareLinks.facebook} 
        label="Facebook"
        color="bg-[#4267B2]/10 hover:bg-[#4267B2]/20 text-[#4267B2]"
      />
      <ShareButtonLarge 
        icon={<Linkedin size={18} />} 
        href={shareLinks.linkedin} 
        label="LinkedIn"
        color="bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5]"
      />
      <ShareButtonLarge 
        icon={<MessageCircle size={18} />} 
        href={shareLinks.whatsapp} 
        label="WhatsApp"
        color="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]"
      />
      <ShareButtonLarge 
        icon={<Send size={18} />} 
        href={shareLinks.telegram} 
        label="Telegram"
        color="bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc]"
      />
      <ShareButtonLarge 
        icon={<Mail size={18} />} 
        href={shareLinks.email} 
        label="Email"
        color="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500"
      />
    </div>
  );
}

function ShareButton({ 
  icon, 
  onClick, 
  href, 
  label 
}: { 
  icon: React.ReactNode; 
  onClick?: () => void; 
  href?: string; 
  label: string;
}) {
  const className = "p-2.5 rounded-full bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        aria-label={`Share on ${label}`}
      >
        {icon}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={className}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function ShareButtonLarge({ 
  icon, 
  onClick, 
  href, 
  label,
  color
}: { 
  icon: React.ReactNode; 
  onClick?: () => void; 
  href?: string; 
  label: string;
  color: string;
}) {
  const className = cn(
    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
    color
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Share on ${label}`}
      >
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={label}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </motion.button>
  );
}
