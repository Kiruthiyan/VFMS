"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Fuel,
  Globe,
  MapPin,
  Menu,
  Play,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Truck,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = ["Features", "Solutions", "Process", "Access"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const roleCopy = {
  admin:
    "Manage users, vehicles, fuel, maintenance, rentals, reports, and full system oversight from one dashboard.",
  staff:
    "Review requests, assign vehicles and drivers, manage documents, and coordinate daily fleet operations.",
  "system user":
    "Request trips, track approval status, and view your own fleet service activity without manual paperwork.",
  driver:
    "View assigned trips, update journey progress, and complete required driver actions from your dashboard.",
} as const;

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative text-sm font-semibold text-slate-600 transition-colors hover:text-black group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-amber-500 transition-all group-hover:w-full" />
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-4xl font-black tracking-tighter text-slate-900">
        {value}
      </span>
      <span className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-600">
        {label}
      </span>
    </div>
  );
}

function DashboardPreview() {
  const cards = [
    { label: "Active Trips", value: "12", color: "text-amber-300" },
    { label: "Drivers Ready", value: "18", color: "text-emerald-300" },
    { label: "Fuel Logs", value: "36", color: "text-sky-300" },
    { label: "Pending Tasks", value: "05", color: "text-orange-300" },
  ];

  return (
    <div className="relative bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-4 overflow-hidden">
      <div className="rounded-xl bg-slate-950 p-6 text-white">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-300">Fleet Overview</span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className={cn("text-3xl font-black", card.color)}>{card.value}</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {["Colombo to Kandy", "Galle to Colombo", "Jaffna to Colombo"].map((route, index) => (
            <div key={route} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="text-xs font-medium text-slate-300">{route}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  index === 0 && "bg-emerald-500/15 text-emerald-300",
                  index === 1 && "bg-amber-500/15 text-amber-300",
                  index === 2 && "bg-sky-500/15 text-sky-300"
                )}
              >
                {index === 0 ? "ONGOING" : index === 1 ? "APPROVED" : "PENDING"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 -left-10 flex items-center gap-4 rounded-2xl border border-slate-50 bg-white p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <TrendingUp />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">Status</p>
          <p className="text-xl font-black text-slate-900">Ready</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof roleCopy>("admin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen scroll-smooth bg-white text-slate-900 selection:bg-amber-200">
      <motion.div
        className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-amber-500"
        style={{ scaleX }}
      />

      <nav
        className={cn(
          "fixed top-0 z-50 w-full px-6 py-4 transition-all duration-500",
          isScrolled
            ? "border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex cursor-pointer items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 transition-transform group-hover:rotate-12">
              <Truck className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-xl font-black tracking-tighter">
              FLEETPRO<span className="text-amber-500">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <NavLink key={item} href={`#${item.toLowerCase()}`}>
                {item}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden font-bold hover:bg-slate-50 sm:flex">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="rounded-full bg-slate-900 px-6 font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm sm:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="mx-auto mt-4 max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:hidden">
            <div className="grid gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </NavLink>
              ))}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-bold">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-slate-900 font-bold text-white hover:bg-slate-800">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="relative overflow-hidden pb-20 pt-32 lg:pb-32 lg:pt-48">
        <div className="absolute left-1/2 top-0 -z-10 h-full w-full -translate-x-1/2">
          <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-amber-100/50 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] h-[40%] w-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div
                variants={itemVariants}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                Vehicle Fleet Management System
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mb-8 text-6xl font-black leading-[0.9] tracking-tight text-slate-900 lg:text-8xl"
              >
                Run your <br />
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-amber-600 bg-clip-text text-transparent">
                  Fleet with Control.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mb-10 max-w-lg text-xl font-medium leading-relaxed text-slate-600"
              >
                A secure fleet management platform for trips, vehicles, fuel, maintenance,
                rentals, drivers, users, and reporting.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    className="h-16 rounded-2xl bg-slate-900 px-8 text-lg font-bold text-white hover:bg-black group"
                  >
                    Open Dashboard
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-16 rounded-2xl border-2 px-8 text-lg font-bold hover:bg-slate-50"
                  >
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Staff Signup
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-8"
              >
                <Stat value="8" label="Core Modules" />
                <div className="h-10 w-px bg-slate-100" />
                <Stat value="4" label="Role Portals" />
                <div className="h-10 w-px bg-slate-100" />
                <div className="flex flex-col">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="mt-1 text-xs font-bold uppercase tracking-tighter text-slate-400">
                    Production Ready
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-amber-500">
              The Platform
            </h2>
            <h3 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Everything your fleet team needs.
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-10 shadow-sm group md:col-span-2"
            >
              <div className="relative z-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 transition-transform group-hover:rotate-6">
                  <MapPin className="text-amber-400" />
                </div>
                <h4 className="mb-4 text-3xl font-black">Trip Booking & Scheduling</h4>
                <p className="max-w-sm font-medium leading-relaxed text-slate-500">
                  Submit requests, approve trips, assign vehicles and drivers, and follow trip
                  progress from one workflow.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 opacity-10 transition-opacity group-hover:opacity-20">
                <Globe className="h-64 w-64 translate-x-10 translate-y-10" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="flex flex-col justify-between rounded-[2.5rem] bg-slate-900 p-10 text-white"
            >
              <Fuel className="h-12 w-12 text-amber-400" />
              <div>
                <h4 className="mb-2 text-2xl font-bold">Fuel Management</h4>
                <p className="text-sm font-medium text-slate-400">
                  Record fuel logs, monitor usage, and support accurate operational cost tracking.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="flex flex-col justify-between rounded-[2.5rem] bg-amber-400 p-10"
            >
              <Shield className="h-12 w-12 text-slate-900" />
              <div>
                <h4 className="mb-2 text-2xl font-bold text-slate-900">User Authentication</h4>
                <p className="text-sm font-medium text-slate-800 opacity-80">
                  Verified signup, secure login, password reset, and role-based access.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-10 rounded-[2.5rem] border border-slate-200/60 bg-white p-10 shadow-sm md:col-span-2 md:flex-row"
            >
              <div className="flex-1">
                <h4 className="mb-4 text-3xl font-black">Fleet Records & Reports</h4>
                <p className="mb-6 font-medium text-slate-500">
                  Track vehicles, maintenance, rental records, driver performance, fuel usage,
                  and admin reports clearly.
                </p>
                <Link href="/auth/login">
                  <Button variant="link" className="p-0 text-lg font-bold text-amber-600">
                    Open dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="w-full rounded-2xl bg-slate-50 p-6 md:w-1/3">
                <div className="space-y-4">
                  {[72, 84, 63].map((width) => (
                    <div key={width} className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${width}%` }}
                        viewport={{ once: true }}
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

      <section id="solutions" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-amber-500">
              Solutions
            </h2>
            <h3 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Built for every role.
            </h3>
          </div>

          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex w-full flex-col gap-3 md:w-1/3">
              {(Object.keys(roleCopy) as Array<keyof typeof roleCopy>).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveTab(role)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                    activeTab === role
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full font-bold uppercase",
                      activeTab === role
                        ? "bg-amber-400 text-slate-900"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {role.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold uppercase tracking-wide text-slate-900">{role}</div>
                    <div className="text-xs font-medium capitalize text-slate-500">{role} Portal</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative flex min-h-[400px] w-full flex-col justify-center overflow-hidden rounded-[3rem] bg-slate-900 p-10 text-center text-white md:w-2/3 md:p-16 md:text-left">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <h4 className="mb-6 text-3xl font-black capitalize text-amber-400">
                    {activeTab} Dashboard
                  </h4>
                  <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-300">
                    {roleCopy[activeTab]}
                  </p>
                  <Link href="/auth/login">
                    <Button className="h-12 rounded-full bg-white px-8 font-bold text-slate-900 hover:bg-amber-50">
                      Open Dashboard
                    </Button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="overflow-hidden bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-xl">
              <h2 className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-amber-500">
                The Process
              </h2>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Built for daily <span className="text-6xl text-amber-500">Control.</span>
              </h2>
              <p className="mt-6 text-lg font-medium text-slate-500">
                A clear journey from trip request to approval, assignment, completion, and reporting.
              </p>
            </div>
          </div>

          <div className="relative grid gap-12 md:grid-cols-3">
            <div className="absolute left-0 top-1/2 -z-10 hidden h-px w-full bg-slate-200 md:block" />

            {[
              {
                title: "Request & Approve",
                icon: Zap,
                desc: "Users submit requests and staff approve or reject them with clear operational context.",
              },
              {
                title: "Assign & Track",
                icon: MapPin,
                desc: "Vehicles, rentals, and drivers are assigned while teams follow trip progress.",
              },
              {
                title: "Review & Report",
                icon: BarChart3,
                desc: "Admins review cost, utilization, driver performance, fuel, and maintenance reports.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
                  <step.icon className="h-8 w-8 text-amber-600" />
                </div>
                <h4 className="mb-4 text-2xl font-black">{step.title}</h4>
                <p className="font-medium leading-relaxed text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-amber-500">
              Access
            </h2>
            <h3 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Secure access for every user.
            </h3>
          </div>

          <div className="grid items-start gap-8 md:grid-cols-3">
            {[
              {
                title: "Login",
                value: "Secure",
                href: "/auth/login",
                action: "Log In",
                features: ["Company email login", "Role-based dashboard", "Protected routes", "Session handling"],
              },
              {
                title: "Staff Signup",
                value: "Verified",
                href: "/auth/signup",
                action: "Create Account",
                featured: true,
                features: ["Company email check", "Staff profile validation", "Employee ID verification", "Email activation"],
              },
              {
                title: "Recovery",
                value: "Reset",
                href: "/auth/forgot-password",
                action: "Reset Password",
                features: ["Forgot password flow", "Secure reset link", "Email verification", "Clear user messages"],
              },
            ].map((card) => (
              <div
                key={card.title}
                className={cn(
                  "rounded-[2.5rem] p-8",
                  card.featured
                    ? "relative bg-slate-900 text-white shadow-2xl shadow-slate-900/20 md:-translate-y-4 md:p-10"
                    : "border border-slate-200 bg-white"
                )}
              >
                {card.featured ? (
                  <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-[2.5rem] bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900">
                    VERIFIED
                  </div>
                ) : null}
                <h4 className={cn("mb-2 text-xl font-bold", card.featured ? "text-amber-400" : "text-slate-900")}>
                  {card.title}
                </h4>
                <div className="mb-6 text-4xl font-black">{card.value}</div>
                <ul className="mb-8 space-y-4">
                  {card.features.map((feature) => (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        card.featured ? "text-slate-300" : "text-slate-600"
                      )}
                    >
                      <Check className={cn("h-4 w-4", card.featured ? "text-amber-400" : "text-green-500")} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={card.href}>
                  <Button
                    variant={card.featured ? "default" : "outline"}
                    className={cn(
                      "h-12 w-full rounded-xl font-bold",
                      card.featured && "h-14 bg-amber-400 text-slate-900 hover:bg-amber-300"
                    )}
                  >
                    {card.action}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-center md:p-24">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="mb-8 text-4xl font-black tracking-tighter text-white md:text-7xl">
                Ready to manage <br /> your fleet?
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-xl font-medium leading-relaxed text-slate-400">
                Continue to your FleetPro dashboard or create a verified staff account to begin
                using the system.
              </p>
              <div className="flex flex-col justify-center gap-6 sm:flex-row">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="h-16 rounded-2xl bg-amber-400 px-12 text-lg font-black text-slate-900 hover:bg-amber-300"
                  >
                    Create Staff Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-16 rounded-2xl border-white/20 px-12 text-lg font-black text-white hover:bg-white/5"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 grid grid-cols-2 gap-12 md:grid-cols-5">
            <div className="col-span-2">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                  <Truck className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-lg font-black uppercase tracking-tighter">FleetPro</span>
              </div>
              <p className="mb-8 max-w-xs font-medium text-slate-500">
                Vehicle Fleet Management System for secure daily fleet operations.
              </p>
              <div className="flex gap-4">
                {[Globe, Smartphone, Star].map((Icon, index) => (
                  <div
                    key={index}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "Solutions", href: "#solutions" },
                  { label: "Access", href: "#access" },
                ],
              },
              {
                title: "Account",
                links: [
                  { label: "Log In", href: "/auth/login" },
                  { label: "Staff Signup", href: "/auth/signup" },
                  { label: "Reset Password", href: "/auth/forgot-password" },
                ],
              },
              {
                title: "Modules",
                links: [
                  { label: "Trips", href: "#process" },
                  { label: "Fuel", href: "#features" },
                  { label: "Reports", href: "#features" },
                ],
              },
            ].map((column) => (
              <div key={column.title}>
                <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-bold text-slate-500 transition-colors hover:text-amber-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 md:flex-row">
            <p className="text-sm font-bold text-slate-400">
              (c) 2026 FleetPro VFMS. Vehicle Fleet Management System.
            </p>
            <div className="flex gap-8">
              <Link href="/auth/login" className="text-sm font-bold text-slate-400 hover:text-slate-900">
                Login
              </Link>
              <Link href="/auth/signup" className="text-sm font-bold text-slate-400 hover:text-slate-900">
                Signup
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
