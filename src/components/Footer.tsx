import React from 'react';
import { Github, Instagram, Mail, ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-10 pb-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div>
                <Link to="/" className="text-lg font-bold text-foreground tracking-tight block mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <span className="font-bold text-base">K</span>
                    </div>
                    Khaliq Repository
                </Link>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
                    A digital archive dedicated to the intersection of Water Treatment Technology, Android Systems, and Philosophy. 
                    Curated with precision.
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <SocialLink href="https://instagram.com/2.khaliq" icon={<Instagram size={16} />} label="Instagram" />
                <SocialLink href="https://github.com/Bias8145" icon={<Github size={16} />} label="GitHub" />
                <SocialLink href="mailto:contact@biasfajarkhaliq.com" icon={<Mail size={16} />} label="Email" />
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Navigation</h4>
            <ul className="space-y-2">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/repo" label="Repository" />
              <FooterLink to="/repo?tab=Penelitian" label="Research" />
              <FooterLink to="/repo?tab=Catatan" label="Notes" />
            </ul>
          </div>

          {/* Info Column */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Location & Access</h4>
            <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-foreground">
                        <MapPin size={12} />
                    </div>
                    <div className="pt-1">
                        <span className="block font-bold text-foreground">Indonesia</span>
                        <span>Available for technical consultation.</span>
                    </div>
                </div>
                
                <div className="pt-1">
                    <Link to="/login" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        Admin Portal <ArrowUpRight size={10} />
                    </Link>
                </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-wider pt-6 border-t border-border/50">
          <p>&copy; {new Date().getFullYear()} Bias Fajar Khaliq. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
            title={label}
        >
            {icon}
        </a>
    )
}

function FooterLink({ to, label }: { to: string; label: string }) {
    return (
        <li>
            <Link to={to} className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors"></span>
                {label}
            </Link>
        </li>
    )
}
