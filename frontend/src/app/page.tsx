'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'framer-motion';
import {
  Shield, Fuel, Car, Users, Calendar, FileText, ArrowRight,
  BarChart3, CheckCircle2, Truck, MapPin, Layout, Star,
  Smartphone, Zap, Clock, ChevronRight, Play, Globe, Menu, X,
  TrendingUp, Check, Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// --- HELPER COMPONENTS ---

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link
    href={href}
    className="relative text-sm font-semibold text-slate-600 hover:text-black transition-colors group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full" />
  </Link>
);

const CountUp = ({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const timer = setInterval(() => {
        start += Math.ceil(end / 40);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col">
      <span className="text-4xl font-black text-slate-900 tracking-tighter">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
};

// --- MAIN PAGE ---

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-amber-200 scroll-smooth">

      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-[60]" style={{ scaleX }} />

      {/* --- NAVIGATION --- */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <Truck className="text-amber-400 w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter">FLEETPRO<span className="text-amber-500">.</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Solutions', 'Process', 'Pricing'].map((item) => (
              <NavLink key={item} href={`#${item.toLowerCase()}`}>{item}</NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-bold hidden sm:flex hover:bg-slate-50">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 font-bold shadow-lg shadow-slate-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-100/50 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-50/50 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                v2.0 is now live
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-8">
                Run your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-amber-600">
                  Fleet like Magic.
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-slate-600 max-w-lg leading-relaxed mb-10 font-medium">
                The world's most intuitive fleet management system. Automate dispatch, track fuel, and empower drivers with one platform.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-16 px-8 rounded-2xl bg-slate-900 text-white hover:bg-black text-lg font-bold group">
                    Start Free Trial
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-16 px-8 rounded-2xl border-2 text-lg font-bold hover:bg-slate-50">
                    <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-8">
                <CountUp value={2400} label="Active Fleets" suffix="+" />
                <div className="h-10 w-px bg-slate-100" />
                <CountUp value={99} label="Efficiency" suffix="%" />
                <div className="h-10 w-px bg-slate-100" />
                <div className="flex flex-col">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Top Rated G2</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative hidden lg:block perspective-1000"
            >
              <div className="relative bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1000"
                  alt="Dashboard"
                  className="rounded-xl w-full"
                />

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-slate-50 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <TrendingUp />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Saving</p>
                    <p className="text-xl font-black text-slate-900">+24%</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- BENTO FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">The Platform</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need, <br />nothing you don't.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Big Bento Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm overflow-hidden relative group"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                  <MapPin className="text-amber-400" />
                </div>
                <h4 className="text-3xl font-black mb-4">Precision GPS Tracking</h4>
                <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Real-time location intelligence with predictive ETA and route optimization. Know where your assets are, always.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-64 h-64 translate-x-10 translate-y-10" />
              </div>
            </motion.div>

            {/* Small Bento Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between"
            >
              <Fuel className="text-amber-400 w-12 h-12" />
              <div>
                <h4 className="text-2xl font-bold mb-2">Fuel Intelligence</h4>
                <p className="text-slate-400 text-sm font-medium">Detect theft, monitor idling, and optimize consumption patterns.</p>
              </div>
            </motion.div>

            {/* Small Bento Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-amber-400 rounded-[2.5rem] p-10 flex flex-col justify-between"
            >
              <Shield className="text-slate-900 w-12 h-12" />
              <div>
                <h4 className="text-2xl font-bold mb-2 text-slate-900">Elite Security</h4>
                <p className="text-slate-800 text-sm font-medium opacity-80">Enterprise-grade encryption and 24/7 system monitoring.</p>
              </div>
            </motion.div>

            {/* Medium Bento Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-10"
            >
              <div className="flex-1">
                <h4 className="text-3xl font-black mb-4">Automated Compliance</h4>
                <p className="text-slate-500 font-medium mb-6">Never miss a maintenance window or permit renewal. Our AI handles the paperwork for you.</p>
                <Link href="/auth/signup">
                  <Button variant="link" className="p-0 font-bold text-amber-600 text-lg">Learn more <ArrowRight className="ml-2 w-5 h-5" /></Button>
                </Link>
              </div>
              <div className="w-full md:w-1/3 bg-slate-50 rounded-2xl p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '70%' }}
                        className="h-full bg-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SOLUTIONS (Role-Based) SECTION --- */}
      <section id="solutions" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Solutions</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Built for every role.</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Role Buttons */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              {['admin', 'approver', 'staff', 'driver'].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl text-left border-2 transition-all",
                    activeTab === role
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase", activeTab === role ? "bg-amber-400 text-slate-900" : "bg-slate-100 text-slate-400")}>
                    {role.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 uppercase tracking-wide">{role}</div>
                    <div className="text-xs text-slate-500 font-medium capitalize">{role} Portal</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Role Content */}
            <div className="w-full md:w-2/3 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white text-center md:text-left min-h-[400px] flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <h4 className="text-3xl font-black mb-6 capitalize text-amber-400">{activeTab} Dashboard</h4>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg">
                    {activeTab === 'admin' && "Comprehensive control over every aspect of your fleet. Manage users, vehicles, and global settings from one central command center."}
                    {activeTab === 'approver' && "Streamline your approval workflow. Review trip requests, maintenance orders, and budget impacts with one-click actions."}
                    {activeTab === 'staff' && "Book trips easily, track request status in real-time, and manage your travel itinerary without the paperwork."}
                    {activeTab === 'driver' && "Your mobile companion on the road. View assigned routes, log fuel, and perform pre-trip inspections right from your phone."}
                  </p>
                  <Button className="bg-white text-slate-900 hover:bg-amber-50 font-bold rounded-full px-8 h-12">
                    Launch {activeTab} Demo
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROCESS / WORKFLOW SECTION --- */}
      <section id="process" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">The Process</h2>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Engineered for <span className="text-amber-500 text-6xl">Speed.</span></h2>
              <p className="text-slate-500 text-lg font-medium mt-6">A seamless journey from initial booking to final automated reporting.</p>
            </div>
            <div className="flex gap-4">
              {['01', '02', '03'].map(n => (
                <div key={n} className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center font-black text-slate-300">
                  {n}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10" />

            {[
              { title: 'Smart Dispatch', icon: Zap, desc: 'AI-driven trip assignment based on driver proximity and vehicle health.' },
              { title: 'Live Execution', icon: MapPin, desc: 'Real-time telemetry data streamed directly to your command center dashboard.' },
              { title: 'Deep Analytics', icon: BarChart3, desc: 'Automated cost-per-mile analysis and performance scorecards for every driver.' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 border border-amber-100">
                  <step.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="text-2xl font-black mb-4">{step.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Pricing</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Flexible Plans.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Starter */}
            <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Starter</h4>
              <div className="text-4xl font-black mb-6">$0<span className="text-sm font-medium text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['Up to 5 Vehicles', 'Basic GPS Tracking', 'Mobile App Access', 'Email Support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-600"><Check className="w-4 h-4 text-green-500" /> {f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-xl font-bold h-12">Start Free</Button>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white relative shadow-2xl shadow-slate-900/20 transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-[2.5rem]">RECOMMENDED</div>
              <h4 className="text-xl font-bold text-amber-400 mb-2">Professional</h4>
              <div className="text-5xl font-black mb-6">$49<span className="text-sm font-medium text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-10">
                {['Up to 50 Vehicles', 'Advanced Telematics', 'Fuel & Maintenance', 'Priority Support', 'API Access'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-300"><Check className="w-4 h-4 text-amber-400" /> {f}</li>
                ))}
              </ul>
              <Button className="w-full rounded-xl font-bold h-14 bg-amber-400 text-slate-900 hover:bg-amber-300">Get Started</Button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h4>
              <div className="text-4xl font-black mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                {['Unlimited Vehicles', 'Dedicated Account Mgr', 'Custom Integrations', 'On-Premise Option'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-600"><Check className="w-4 h-4 text-green-500" /> {f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-xl font-bold h-12">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                Ready to transform <br /> your operations?
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Join 2,000+ fleet managers who have switched to a smarter, more efficient way of working.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-amber-400 text-slate-900 hover:bg-amber-300 text-lg font-black">
                    Start My 14-Day Free Trial
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl border-white/20 text-white hover:bg-white/5 text-lg font-black">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Truck className="text-amber-400 w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-tighter uppercase">Fleetpro</span>
              </div>
              <p className="text-slate-500 font-medium max-w-xs mb-8">
                The next generation of logistics management. Data-driven, driver-focused, and ready for scale.
              </p>
              <div className="flex gap-4">
                {[Globe, Smartphone, Star].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: [{ l: 'Features', h: '#features' }, { l: 'Solutions', h: '#solutions' }, { l: 'Pricing', h: '#pricing' }] },
              { title: 'Company', links: [{ l: 'About', h: '#' }, { l: 'Careers', h: '#' }, { l: 'Blog', h: '#' }] },
              { title: 'Support', links: [{ l: 'Documentation', h: '#' }, { l: 'Help Center', h: '#' }, { l: 'Status', h: '#' }] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-slate-900">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link.l}><Link href={link.h} className="text-sm font-bold text-slate-500 hover:text-amber-600 transition-colors">{link.l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-400">© 2026 Fleetpro Management. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900">Privacy Policy</Link>
              <Link href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
