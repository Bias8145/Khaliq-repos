import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Terminal, User, GraduationCap, Github, Cpu, Database, Globe, Smartphone, ExternalLink, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 px-5 md:px-8 max-w-6xl mx-auto">
      
      {/* Hero Section - Professional & Humble */}
      <section className="mb-20 md:mb-28 text-center md:text-left relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto md:mx-0 relative z-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-6 md:mb-8 rounded-full bg-secondary/50 text-foreground text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase border border-border backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Bias Fajar Khaliq
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 md:mb-8 leading-[1.1] tracking-tight">
            Curating Knowledge, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 font-serif italic pr-2">
              Engineered Systems.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto md:mx-0 font-light">
            A digital archive bridging the gap between Industrial Water Treatment and Android System Architecture. 
            Documenting the pursuit of technical precision and philosophical inquiry.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/repo" className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-xl shadow-foreground/10 hover:-translate-y-1">
              Explore Repository <ArrowRight size={16} />
            </Link>
            <a href="#about" className="px-6 py-3 md:px-8 md:py-4 rounded-full border border-border text-foreground text-sm font-bold hover:bg-secondary/50 transition-all backdrop-blur-sm">
              About Author
            </a>
          </div>
        </motion.div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[80px] md:blur-[120px] -z-10 opacity-60 pointer-events-none"></div>
      </section>

      {/* Feature Grid - Minimalist */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 md:mb-28">
        <FeatureCard 
            icon={<BookOpen size={24} />} 
            title="Technical Research" 
            desc="In-depth analysis of industrial processes and engineering standards." 
            delay={0.1}
        />
        <FeatureCard 
            icon={<Terminal size={24} />} 
            title="System Development" 
            desc="Custom kernel optimization and device tree configurations for Android." 
            delay={0.2}
        />
        <FeatureCard 
            icon={<Layers size={24} />} 
            title="Critical Thought" 
            desc="Essays exploring the philosophical implications of modern technology." 
            delay={0.3}
        />
      </section>

      {/* Bento Grid - About Section */}
      <section id="about" className="mb-24 scroll-mt-32">
        <div className="flex items-end justify-between mb-8 md:mb-10">
            <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">The Author</h2>
                <p className="text-muted-foreground text-sm md:text-base">Professional Background & Contributions.</p>
            </div>
            <div className="hidden md:block h-px bg-border w-1/3 mb-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            
            {/* Main Profile Card - Large */}
            <div className="md:col-span-2 md:row-span-2 bg-card border border-border rounded-3xl p-6 md:p-10 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Feather size={200} className="text-primary rotate-12" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        {/* Animated Avatar */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary relative overflow-hidden">
                                <User size={32} className="relative z-10" />
                                <div className="absolute inset-0 bg-primary/10 blur-xl"></div>
                            </div>
                            <div className="flex flex-col">
                                <motion.div 
                                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                                    className="origin-bottom-right inline-block text-2xl md:text-3xl"
                                >
                                
                                </motion.div>
                                <span className="text-xs font-bold text-primary uppercase tracking-wider mt-1">Hello, I'm</span>
                            </div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Bias Fajar Khaliq</h3>
                        <p className="text-lg md:text-xl text-primary font-medium mb-6">Industrial Professional & Developer</p>
                        <p className="text-muted-foreground leading-relaxed text-base md:text-lg max-w-lg">
                            Based in Indonesia. I specialize in <strong>Water Treatment Technology</strong> and <strong>Android System Development</strong>. 
                            My work is driven by a commitment to efficiency, compliance (HSE), and open-source collaboration.
                            I am an active contributor to the XDA Developers community.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                        <TechBadge icon={<Cpu size={14} />} label="AutoCAD" />
                        <TechBadge icon={<Database size={14} />} label="Data Analysis" />
                        <TechBadge icon={<Globe size={14} />} label="HSE Compliance" />
                        <TechBadge icon={<Smartphone size={14} />} label="Android Dev" />
                    </div>
                </div>
            </div>

            {/* Education Card */}
            <div className="bg-secondary/30 border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-center hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-background text-foreground flex items-center justify-center mb-4 shadow-sm">
                    <GraduationCap size={20} />
                </div>
                <h4 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Education</h4>
                <h3 className="text-lg md:text-xl font-bold text-foreground">Universitas Nusa Putra</h3>
                <p className="text-primary font-medium text-sm mt-1">Class of 2022</p>
            </div>

            {/* Open Source / XDA Card - Updated for Relevance */}
            <div className="bg-gradient-to-br from-primary/10 to-background border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-4 right-4 text-primary/20 group-hover:text-primary/40 transition-colors">
                    <Terminal size={48} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Android Development</h4>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <p className="text-xs font-bold text-primary mb-1">Pixel 6 Series</p>
                            <p className="text-sm text-foreground font-medium">Oriole, Raven, Bluejay</p>
                            <p className="text-[10px] text-muted-foreground">Kernel & Device Tree Optimization</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary mb-1">Pixel 4 Series</p>
                            <p className="text-sm text-foreground font-medium">Flame, Coral, Sunfish</p>
                            <p className="text-[10px] text-muted-foreground">Custom ROM Maintainer</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <a href="https://xdaforums.com/m/khaliq-morpheus.13212421/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-foreground bg-secondary/80 px-3 py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                            XDA Profile <ExternalLink size={12} />
                        </a>
                        <a href="https://github.com/Bias8145" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-primary px-2 py-2 hover:underline">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>

        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay, duration: 0.5 }}
          className="p-6 md:p-8 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary rounded-2xl flex items-center justify-center text-foreground mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm">
            {icon}
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-3 font-serif">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {desc}
          </p>
        </motion.div>
    )
}

function TechBadge({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-[10px] md:text-xs font-bold text-foreground">
            {icon} {label}
        </span>
    )
}
