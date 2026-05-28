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
import { Button } from '@/components/ui/button';

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
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

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
      const timer = setInterval(() => {
        start += Math.ceil(end / 40);
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(start);
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

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-[60]" style={{ scaleX }} />

      {/* NAVIGATION */}
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
            <Link href="/trips">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 font-bold shadow-lg shadow-slate-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-100/50 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-50/50 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
                <Link href="/trips">
                  <Button size="lg" className="h-16 px-8 rounded-2xl bg-slate-900 text-white hover:bg-black text-lg font-bold group">
                    Go to Dashboard
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-16 px-8 rounded-2xl border-2 text-lg font-bold hover:bg-slate-50">
                    <Play className="mr-2 w-5 h-5 fill-current" /> Learn More
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
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Top Rated</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-4 overflow-hidden">
                <div className="bg-slate-900 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-400">Fleet Overview</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">Live</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "Active Trips", value: "12", color: "text-amber-400" },
                      { label: "Drivers Online", value: "8", color: "text-green-400" },
                      { label: "Pending Approval", value: "3", color: "text-blue-400" },
                      { label: "Completed Today", value: "24", color: "text-purple-400" },
                    ].map(item => (
                      <div key={item.label} className="bg-white/5 rounded-xl p-3">
                        <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["Colombo → Kandy", "Galle → Colombo", "Jaffna → Colombo"].map((route, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-300">{route}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          i === 0 ? "bg-green-500/20 text-green-400" :
                          i === 1 ? "bg-amber-500/20 text-amber-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {i === 0 ? "ONGOING" : i === 1 ? "APPROVED" : "PENDING"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 -left-8 bg-white p-4 rounded-2xl shadow-2xl border border-slate-50 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Efficiency</p>
                    <p className="text-lg font-black text-slate-900">+24%</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">The Platform</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm overflow-hidden relative group">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <MapPin className="text-amber-400" />
              </div>
              <h4 className="text-3xl font-black mb-4">Trip Scheduling</h4>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Complete trip lifecycle management — from request to completion with real-time status tracking and conflict prevention.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between">
              <Fuel className="text-amber-400 w-12 h-12" />
              <div>
                <h4 className="text-2xl font-bold mb-2">Fuel Management</h4>
                <p className="text-slate-400 text-sm font-medium">Track consumption, detect anomalies, and optimize fuel usage.</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-amber-400 rounded-[2.5rem] p-10 flex flex-col justify-between">
              <Shield className="text-slate-900 w-12 h-12" />
              <div>
                <h4 className="text-2xl font-bold mb-2 text-slate-900">Driver Management</h4>
                <p className="text-slate-800 text-sm font-medium opacity-80">License tracking, performance monitoring, and assignment management.</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h4 className="text-3xl font-black mb-4">Analytics Dashboard</h4>
                <p className="text-slate-500 font-medium mb-6">Cost analysis, utilization reports, and driver performance insights exported to PDF or Excel.</p>
                <Link href="/trips">
                  <Button variant="link" className="p-0 font-bold text-amber-600 text-lg">Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" /></Button>
                </Link>
              </div>
              <div className="w-full md:w-1/3 bg-slate-50 rounded-2xl p-6">
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${60 + i * 10}%` }} className="h-full bg-amber-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Solutions</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Built for every role.</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              {['admin', 'staff', 'system_user', 'driver'].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl text-left border-2 transition-all",
                    activeTab === role ? "border-amber-400 bg-amber-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase", activeTab === role ? "bg-amber-400 text-slate-900" : "bg-slate-100 text-slate-400")}>
                    {role.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 uppercase tracking-wide">{role.replace('_', ' ')}</div>
                    <div className="text-xs text-slate-500 font-medium capitalize">{role.replace('_', ' ')} Portal</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="w-full md:w-2/3 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white min-h-[400px] flex flex-col justify-center relative overflow-hidden">
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
                  <h4 className="text-3xl font-black mb-6 capitalize text-amber-400">{activeTab.replace('_', ' ')} Dashboard</h4>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg">
                    {activeTab === 'admin' && "Full system control. Manage users, monitor all modules, and ensure compliance across the entire fleet."}
                    {activeTab === 'staff' && "Review trip requests, approve or reject with reasons, assign drivers and vehicles, and prevent double bookings."}
                    {activeTab === 'system_user' && "Request vehicles for trips, track your request status in real-time, and manage your travel schedule."}
                    {activeTab === 'driver' && "View your assigned trips, start and complete journeys, and access all trip details from one place."}
                  </p>
                  <Link href="/trips">
                    <Button className="bg-white text-slate-900 hover:bg-amber-50 font-bold rounded-full px-8 h-12">
                      Launch Dashboard
                    </Button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">The Process</h2>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">How it works.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { title: 'Request', icon: FileText, desc: 'System User submits a trip request with destination, time, and passenger details.', step: '01' },
              { title: 'Approve', icon: CheckCircle2, desc: 'Staff reviews the request and assigns a vehicle and driver with conflict prevention.', step: '02' },
              { title: 'Execute', icon: Truck, desc: 'Driver starts the trip, system tracks status in real-time until completion.', step: '03' },
              { title: 'Report', icon: BarChart3, desc: 'Analytics dashboard generates cost and performance reports automatically.', step: '04' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="text-4xl font-black text-slate-100 mb-4">{step.step}</div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 border border-amber-100">
                  <step.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="text-xl font-black mb-3">{step.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                Ready to manage <br /> your fleet?
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Your complete Vehicle Fleet Management System is ready to use.
              </p>
              <Link href="/trips">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-amber-400 text-slate-900 hover:bg-amber-300 text-lg font-black">
                  Open Dashboard
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Truck className="text-amber-400 w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">FleetPro</span>
          </div>
          <p className="text-sm font-bold text-slate-400">© 2026 VFMS — Vehicle Fleet Management System. University of Moratuwa.</p>
          <Link href="/trips">
            <Button variant="outline" className="font-bold rounded-full">Go to Dashboard</Button>
          </Link>
        </div>
      </footer>

    </div>
  );
}