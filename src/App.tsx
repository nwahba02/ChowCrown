import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  QrCode,
  Trophy,
  Star,
  Menu,
  X,
  ArrowRight,
  Utensils,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Users,
  Search,
  ChefHat,
  BarChart3,
  Instagram,
  Twitter,
  Layers,
  Flame,
  Camera,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import type { ApiCompetition, ApiRestaurant } from './types';
import { Button, Input, ToastProvider, useToast, ErrorBoundary } from './components/ui';
import { ScrollToTop } from './components/layout';
import { useResponsive } from './hooks';
import AboutImage from './public/About.png';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1700513971603-eda40374ba0a?auto=format&fit=crop&w=800&q=60';
const BURGER_IMAGES = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547584370-2cc96b4c87af?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=800&q=80',
];
const MotionLink = motion(Link);

// --- Navbar ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { path: '/competitions', label: 'Competitions' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/join', label: 'Join' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 safe-top bg-page nav-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[68px]">

          {/* Logo — left */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-[30px] h-[30px] rounded-[8px] bg-amber flex items-center justify-center">
              <Crown size={14} className="text-page" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-display font-bold tracking-tight text-fg">
              Chow Crown
            </span>
          </Link>

          {/* Nav links — centered */}
          <div className="hidden md:flex items-center gap-0.5">
            {[{ path: '/', label: 'Home' }, ...navItems].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-widest transition-colors rounded-full ${
                  isActive(item.path)
                    ? 'text-amber border border-amber'
                    : 'text-fg-muted hover:text-fg border border-transparent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right column — CTA on desktop, hamburger on mobile */}
          <div className="col-start-3 flex justify-end items-center">
            <button
              onClick={() => navigate('/competitions')}
              className="hidden md:block bg-amber text-white text-[11.5px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-amber-glow transition-colors"
            >
              Browse Now
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden w-9 h-9 items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-black/[0.05] transition-colors"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden bg-page border-t border-black/[0.07] overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 flex flex-col gap-0.5">
              {[{ path: '/', label: 'Home' }, ...navItems].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-full transition-colors ${
                    isActive(item.path)
                      ? 'text-amber border border-amber'
                      : 'text-fg-muted hover:text-fg border border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => { navigate('/competitions'); setIsOpen(false); }}
                className="mt-2 bg-amber text-white text-[12px] font-bold uppercase tracking-widest py-3 rounded-full hover:bg-amber-glow transition-colors"
              >
                Browse Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Footer ---
const Footer = () => (
  <footer className="bg-overlay pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-amber flex items-center justify-center">
              <Crown size={11} className="text-page" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base text-fg">Chow Crown</span>
          </div>
          <p className="text-sm text-fg-dim leading-relaxed mb-5 max-w-xs">
            The verified food competition platform. Real diners, real votes, real winners.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/thechowcrown/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="text-fg-dim hover:text-fg transition-colors"><Instagram size={18} /></a>
            <a href="https://x.com/TheChowCrown" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter" className="text-fg-dim hover:text-fg transition-colors"><Twitter size={18} /></a>
            <a href="https://www.tiktok.com/@thechowcrown" target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok" className="text-fg-dim hover:text-fg transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-4">Product</h4>
          <ul className="space-y-2.5 text-sm text-fg-muted">
            <li><Link to="/competitions" className="hover:text-fg transition-colors">Competitions</Link></li>
            <li><a href="/#how-it-works" className="hover:text-fg transition-colors">How It Works</a></li>
            <li><Link to="/join" className="hover:text-fg transition-colors">Join</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm text-fg-muted">
            <li><Link to="/about" className="hover:text-fg transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-fg transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm text-fg-muted">
            <li><Link to="/privacy" className="hover:text-fg transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-fg transition-colors">Terms of Service</Link></li>
            <li><Link to="/cookies" className="hover:text-fg transition-colors">Cookie Policy</Link></li>
            <li><Link to="/accessibility" className="hover:text-fg transition-colors">Accessibility</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/[0.06] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-fg-dim">
        <p>© 2026 Chow Crown Inc. All rights reserved.</p>
        <p>Los Angeles, CA</p>
      </div>
    </div>
  </footer>
);

// --- Landing Page ---
type ApiStats = { competitions: number; restaurants: number; votes: number; cities: number };

function formatCount(n: number): string {
  if (n === 0) return '—';
  if (n >= 10_000) return `${Math.floor(n / 1_000)}K+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n}+`;
}

const LandingPage = ({ setActivePage }: { setActivePage: (p: string) => void }) => {
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: ApiStats) => setApiStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const timer = setTimeout(() => {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const showcaseComps = [
    { name: 'Burger Crown', category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', status: 'live' as const },
    { name: 'Pizza Crown', category: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', status: 'soon' as const, eta: 'Q3 2026' },
    { name: 'Taco Crown', category: 'Tacos', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', status: 'soon' as const, eta: 'Q4 2026' },
    { name: 'Dessert Crown', category: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', status: 'soon' as const, eta: 'Q4 2026' },
  ];

  const steps = [
    { number: '01', icon: Search,   title: 'Find a Competition', desc: 'Browse active competitions in your city and pick the category that excites you.',    accent: 'amber' as const },
    { number: '02', icon: Utensils, title: 'Dine & Experience',  desc: 'Visit a participating restaurant and order the featured competition dish.',          accent: 'flame' as const },
    { number: '03', icon: QrCode,   title: 'Scan Your QR Code',  desc: 'Scan the QR code from your card to unlock verified voting access.',                  accent: 'live'  as const },
    { number: '04', icon: BarChart3,title: 'Rate & Crown',       desc: 'Score the dish across multiple criteria. Your vote shapes the live leaderboard.',          accent: 'amber' as const },
  ];

  const accentOklch = { amber: '0.764 0.157 65.8', flame: '0.655 0.183 43.1', live: '0.842 0.168 90.4' };
  const accentIconBg = { amber: 'bg-amber/[0.10]', flame: 'bg-flame/[0.10]', live: 'bg-live/[0.10]' };
  const accentIconText = { amber: 'text-amber', flame: 'text-flame', live: 'text-live' };

  const stats = apiStats ? [
    { value: formatCount(apiStats.restaurants),  label: 'Restaurants' },
    { value: formatCount(apiStats.votes),        label: 'Verified Votes' },
    { value: String(apiStats.cities),            label: 'Cities' },
    { value: formatCount(apiStats.competitions), label: 'Competitions' },
  ] : [
    { value: '—', label: 'Restaurants' },
    { value: '—', label: 'Verified Votes' },
    { value: '—', label: 'Cities' },
    { value: '—', label: 'Competitions' },
  ];

  const liveComp = showcaseComps.find(c => c.status === 'live')!;
  const upcomingComps = showcaseComps.filter(c => c.status === 'soon');

  return (
    <div>

      {/* ─── Hero: full-bleed image ─── */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden">

        {/* Full-bleed background image + orange brand tint + dark scrim for legibility */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1700513971603-eda40374ba0a?auto=format&fit=crop&w=1920&q=80"
            alt="Feast of burgers, pizza, fries and food spread across a restaurant table"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Brand orange multiply — shifts yellow tones toward #F15A29 */}
          <div className="absolute inset-0" style={{ backgroundColor: 'oklch(0.661 0.196 37 / 0.35)', mixBlendMode: 'multiply' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-10">

          {/* Stacked display headline */}
          <div className="max-w-4xl">
            {(['The City\'s', 'Best Food,', 'Crowned.'] as const).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -36 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: i * 0.11, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-bold leading-[0.88] tracking-[-0.03em] text-white"
                style={{ fontSize: 'clamp(3.8rem, 10vw, 8.5rem)', textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Subtext + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 md:mt-12"
          >
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8 max-w-[420px]" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
              Scan a QR code after your meal, rate the dish across multiple criteria, and help crown the best food in your city.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setActivePage('competitions')} variant="primary" size="lg">
                Browse Competitions
              </Button>
              <button
                onClick={() => setActivePage('join')}
                className="inline-flex items-center justify-center gap-2 text-white/70 hover:text-white font-medium transition-colors text-base h-12 px-2"
              >
                For Restaurants <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ─── Why Different: numbered callout list ─── */}
      <section className="relative py-24 md:py-32 bg-section overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-flame/[0.05] blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-start">

            {/* Left: heading — sticky on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-28"
            >
              <h2
                className="font-bold text-fg leading-[1.05] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Not your average<br />food review<br />platform.
              </h2>
              <p className="text-fg-muted text-base md:text-lg leading-relaxed max-w-[340px]">
                Every vote on Chow Crown is verified by a QR code received by the restaurant. No anonymous trolls, no fake accounts. Just real diners with honest opinions.
              </p>
            </motion.div>

            {/* Right: numbered callouts divided by hairline rules */}
            <div className="divide-y divide-black/[0.07]">
              {[
                { icon: ShieldCheck, title: 'Verified Votes Only', desc: 'Diners scan a QR code from their card before voting. No visit, no vote. Results you can actually trust.', accent: 'amber' as const, n: '01' },
                { icon: TrendingUp,  title: 'Live Rankings',       desc: 'Leaderboards update in real time. Watch restaurants rise and fall as votes come in throughout the competition.', accent: 'live' as const, n: '02' },
                { icon: Users,       title: 'Community Decided',   desc: 'No critics, no algorithms, no sponsored placements. The crowd picks the crown. Every vote carries equal weight.', accent: 'flame' as const, n: '03' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.09 }}
                  className="flex gap-7 py-9 first:pt-0 last:pb-0"
                >
                  <span
                    className="font-display font-bold select-none flex-shrink-0 leading-none mt-0.5"
                    style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: `oklch(${accentOklch[f.accent]} / 0.40)` }}
                  >
                    {f.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <h3 className="font-bold text-fg">{f.title}</h3>
                    </div>
                    <p className="text-sm text-fg-muted leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Competitions: featured live banner + upcoming row ─── */}
      <section className="py-24 md:py-32 bg-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-12 md:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-live live-dot" />
                <p className="text-live text-xs font-semibold uppercase tracking-widest">Live Now</p>
              </div>
              <h2
                className="font-bold text-fg tracking-tight"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
              >
                Competitions
              </h2>
            </div>
            <button
              onClick={() => setActivePage('competitions')}
              className="text-sm font-semibold text-fg-muted hover:text-fg flex items-center gap-1.5 transition-colors group"
            >
              View all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Live competition — cinematic banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="mb-4 group cursor-pointer"
            onClick={() => setActivePage('competitions')}
          >
            <div className="rounded-2xl overflow-hidden border border-black/[0.06]">
              <div className="overflow-hidden aspect-[4/3] sm:aspect-[21/8]">
                <img
                  src={liveComp.image}
                  alt={`${liveComp.name} — the live competition dish`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className="bg-card px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 bg-live/[0.12] border border-live/[0.25] text-live text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-live live-dot" />
                      Live Now
                    </span>
                    <p className="text-amber text-[11px] font-bold uppercase tracking-widest">{liveComp.category}</p>
                  </div>
                  <h3
                    className="font-display font-bold text-fg leading-tight"
                    style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}
                  >
                    {liveComp.name}
                  </h3>
                </div>
                <div className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-fg-muted group-hover:text-amber transition-colors">
                  Enter <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming — 3 columns (compact on mobile) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {upcomingComps.map((comp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="rounded-xl overflow-hidden border border-black/[0.06] bg-card">
                  <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden">
                    <img
                      src={comp.image}
                      alt={comp.name}
                      className="w-full h-full object-cover blur-sm scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ backgroundColor: 'rgb(128 128 128 / 0.6)', mixBlendMode: 'color' }} />
                  </div>
                  <div className="px-2 py-2 sm:px-4 sm:py-3.5">
                    <div className="hidden sm:flex items-center justify-between mb-1">
                      <p className="text-amber text-[10px] font-bold uppercase tracking-widest">{comp.category}</p>
                      <span className="text-fg-dim text-[10px] font-semibold uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <h3 className="font-bold text-fg leading-tight text-[11px] sm:text-sm">{comp.name}</h3>
                    {'eta' in comp && <p className="text-fg-dim text-[10px] sm:text-xs font-medium mt-0.5">{comp.eta}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works: editorial steps with connector line ─── */}
      <section id="how-it-works" className="relative py-24 md:py-32 bg-section overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-amber/[0.05] blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-16 md:mb-20"
          >
            <h2
              className="font-bold text-fg tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
            >
              How it works
            </h2>
          </motion.div>

          {/* Mobile / tablet grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.10 }}
                className="flex flex-col"
              >
                <span
                  className="font-display font-bold select-none leading-none mb-6 block"
                  style={{ fontSize: 'clamp(4rem, 9vw, 6rem)', letterSpacing: '-0.04em', color: `oklch(${accentOklch[step.accent]} / 0.40)` }}
                >
                  {step.number}
                </span>
                <h3 className="font-bold text-fg mb-2">{step.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: flex with connector lines sitting between the numbers */}
          <div className="hidden lg:flex items-start">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.10 }}
                  className="flex-1 min-w-0 flex flex-col"
                >
                  <span
                    className="font-display font-bold select-none leading-none mb-6 block"
                    style={{ fontSize: 'clamp(4rem, 9vw, 6rem)', letterSpacing: '-0.04em', color: `oklch(${accentOklch[step.accent]} / 0.40)` }}
                  >
                    {step.number}
                  </span>
                  <h3 className="font-bold text-fg mb-2">{step.title}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed">{step.desc}</p>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="flex-shrink-0 self-start flex items-center" style={{ paddingTop: '2.75rem', width: '10rem', marginLeft: '-2rem', marginRight: '1.5rem' }}>
                    <div className="w-full h-px bg-black/[0.12]" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Story ─── */}
      <section className="py-24 md:py-32 bg-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className="font-bold text-fg tracking-tight leading-tight mb-5"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
              >
                Built for people who actually care about food.
              </h2>
              <p className="text-fg-muted leading-relaxed mb-4">
                We got tired of anonymous review platforms where anyone can post anything. So we built something different: a competition platform where only verified diners vote and results update live.
              </p>
              <p className="text-fg-muted leading-relaxed mb-8">
                Whether you're hunting for the best smash burger in LA or you run the restaurant serving it, Chow Crown gives you a fair, transparent way to find out who's on top.
              </p>
              <button
                onClick={() => setActivePage('about')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber hover:gap-3 transition-all"
              >
                Learn more about us <ArrowRight size={15} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-black/[0.08]" style={{ boxShadow: '0 16px 48px oklch(0.13 0.025 35 / 0.10)' }}>
                <img
                  src={AboutImage}
                  alt="People dining together at a busy restaurant table"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA: typographic amber drench ─── */}
      <section className="py-28 md:py-44 bg-amber relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 12% 50%, oklch(0.07 0.025 30) 0%, transparent 52%), radial-gradient(circle at 88% 50%, oklch(0.07 0.025 30) 0%, transparent 52%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
          >
            {/* Large stacked headline */}
            <div className="mb-10 md:mb-12">
              {(['Crown Your', 'Favorites.'] as const).map((line, i) => (
                <p
                  key={i}
                  className="font-display font-bold text-page leading-[0.88] tracking-[-0.03em]"
                  style={{ fontSize: 'clamp(3.4rem, 11vw, 8rem)' }}
                >
                  {line}
                </p>
              ))}
            </div>

            <p className="text-page/60 text-base md:text-lg mb-10 max-w-sm mx-auto">
              Join thousands of food lovers already voting in competitions across the country.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => setActivePage('competitions')}
                whileTap={{ scale: 0.97 }}
                className="btn-touch px-8 py-4 rounded-xl bg-page text-amber font-bold text-base shadow-lg hover:bg-page/90 transition-colors"
              >
                Browse Competitions
              </motion.button>
              <button
                onClick={() => setActivePage('join')}
                className="text-page/60 hover:text-page font-medium text-sm transition-colors"
              >
                Partner with us →
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

// --- Competitions Page ---
const CompetitionsPage = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>('loading');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');

  useEffect(() => {
    fetch('/api/competitions')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: { competitions: ApiCompetition[] }) => {
        const list = data.competitions ?? [];
        setCompetitions(list);
        if (list.length > 0) {
          setSelectedCity(list[0].city);
          setSelectedQuarter(list[0].quarter);
        }
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  const cities = [...new Set(competitions.map((c) => c.city))];
  const quarters = [...new Set(competitions.map((c) => c.quarter))];
  const filteredCompetitions = competitions.filter(
    (c) => (!selectedCity || c.city === selectedCity) && (!selectedQuarter || c.quarter === selectedQuarter)
  );

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-10 md:pt-12 mb-10 border-b border-black/[0.07] pb-8"
        >
          <h1
            className="font-bold text-fg tracking-tight mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Active Competitions
          </h1>
          <p className="text-fg-muted max-w-lg text-sm md:text-base">
            Pick a competition to see the restaurants competing for the crown.
          </p>

          {status === 'loaded' && competitions.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className="flex items-center gap-2 bg-card border border-black/[0.08] px-3.5 py-2 rounded-xl min-h-[40px]">
                <MapPin size={14} className="text-fg-dim" />
                <select
                  aria-label="Filter by city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-fg text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {cities.map((city) => <option key={city} value={city} className="bg-card">{city}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-card border border-black/[0.08] px-3.5 py-2 rounded-xl min-h-[40px]">
                <Crown size={14} className="text-fg-dim" />
                <select
                  aria-label="Filter by quarter"
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="bg-transparent text-fg text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {quarters.map((q) => <option key={q} value={q} className="bg-card">{q}</option>)}
                </select>
              </div>
              <span className="text-xs text-fg-dim font-medium">
                {filteredCompetitions.length} competition{filteredCompetitions.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {status === 'loading' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-black/[0.06] overflow-hidden">
                <div className="aspect-[16/9] skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-4 skeleton rounded w-2/3" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-card border border-black/[0.07] flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-fg-dim" />
            </div>
            <h3 className="text-lg font-semibold text-fg-muted mb-1.5">Couldn't load competitions</h3>
            <p className="text-sm text-fg-dim max-w-sm mx-auto">
              Check that the API server is running, then refresh.
            </p>
          </div>
        )}

        {status === 'loaded' && filteredCompetitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCompetitions.map((comp, i) => (
              <MotionLink
                key={comp.id}
                to={`/competitions/${comp.id}`}
                state={{ competition: comp }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group block bg-card rounded-2xl border border-black/[0.07] overflow-hidden hover:border-amber/[0.25] transition-all duration-200 card-hover"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={comp.image || FALLBACK_IMAGE}
                    alt={comp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-page/60 via-transparent to-transparent" />
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="bg-page/80 backdrop-blur-sm text-fg text-xs font-semibold px-2.5 py-1 rounded-full border border-black/[0.10]">
                      {comp.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-live/[0.15] border border-live/[0.30] text-live text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-live live-dot" />
                      Live
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-fg group-hover:text-amber transition-colors">{comp.title}</h3>
                      <p className="text-sm text-fg-muted mt-0.5 line-clamp-1">{comp.description}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-black/[0.10] flex items-center justify-center flex-shrink-0 text-fg-muted group-hover:bg-amber group-hover:border-amber group-hover:text-page transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-black/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs text-fg-dim">
                      <MapPin size={12} />
                      <span className="font-medium">{comp.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-fg-dim ml-auto">
                      <span className="font-medium">{comp.quarter}</span>
                    </div>
                  </div>
                </div>
              </MotionLink>
            ))}
          </div>
        )}

        {status === 'loaded' && competitions.length > 0 && filteredCompetitions.length === 0 && (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-card border border-black/[0.07] flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-fg-dim" />
            </div>
            <h3 className="text-lg font-semibold text-fg-muted mb-1.5">No competitions here</h3>
            <p className="text-sm text-fg-dim max-w-sm mx-auto">
              We haven't launched in {selectedCity} for {selectedQuarter} yet. Try a different filter.
            </p>
          </div>
        )}

        {status === 'loaded' && competitions.length === 0 && (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-card border border-black/[0.07] flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-fg-dim" />
            </div>
            <h3 className="text-lg font-semibold text-fg-muted mb-1.5">No competitions yet</h3>
            <p className="text-sm text-fg-dim max-w-sm mx-auto">
              Check back soon. Competitions are coming to your city.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Competition Details Page ---
const CompetitionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState<ApiCompetition | null>(
    (location.state as { competition?: ApiCompetition } | null)?.competition ?? null
  );
  const [compStatus, setCompStatus] = useState<'loading' | 'error' | 'loaded'>(
    competition ? 'loaded' : 'loading'
  );
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

  useEffect(() => {
    if (competition) return;
    if (!id) { navigate('/competitions', { replace: true }); return; }
    fetch(`/api/competitions/${id}`)
      .then((r) => r.json())
      .then((data: { competition?: ApiCompetition }) => {
        if (!data.competition) { setCompStatus('error'); return; }
        setCompetition(data.competition);
        setCompStatus('loaded');
      })
      .catch(() => setCompStatus('error'));
  }, [id, competition, navigate]);

  useEffect(() => {
    if (!competition) return;
    fetch(`/api/competitions/${competition.id}/restaurants`)
      .then((r) => r.json())
      .then((data: { restaurants: ApiRestaurant[] }) => {
        const shuffled = [...data.restaurants];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setRestaurants(shuffled);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, [competition?.id]);

  if (compStatus === 'loading') return (
    <div className="pt-20 md:pt-24 pb-24 flex items-center justify-center min-h-[50vh]">
      <div role="status" aria-label="Loading competition" className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (compStatus === 'error' || !competition) return (
    <div className="pt-20 md:pt-24 pb-24 text-center">
      <p className="text-fg-muted mb-4">Competition not found.</p>
      <Button onClick={() => navigate('/competitions')} variant="outline" size="sm">Back to Competitions</Button>
    </div>
  );

  const onBack = () => navigate('/competitions');
  const onVote = (restaurant: ApiRestaurant) => navigate('/scan', { state: { competition, restaurant } });

  return (
    <div className="pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Banner — full bleed on mobile, rounded on md+ */}
        <motion.div
          className="relative overflow-hidden md:rounded-2xl md:mx-6 lg:mx-8 md:mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="aspect-[4/3] sm:aspect-[16/7] md:aspect-[3/1] mt-16 md:mt-0">
            <img
              src={competition.image || FALLBACK_IMAGE}
              alt={competition.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
          </div>

          {/* Back button — overlaid top-left */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white/90 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            <ArrowRight className="rotate-180" size={14} />
            Back
          </button>

          {/* Text overlay — bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="bg-black/20 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {competition.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-live/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
                    Live Now
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  {competition.title}
                </h1>
                <p className="text-sm text-white/50 mt-1.5 hidden md:block max-w-lg">{competition.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-white">{status === 'loaded' ? restaurants.length : '—'}</div>
                <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Competing</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-fg tracking-tight">Participating Restaurants</h2>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck size={13} className="text-fg-muted" />
              <span className="text-xs text-fg-muted font-medium">Results revealed at end of competition</span>
            </div>
          </div>

          {status === 'loading' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-card rounded-xl sm:rounded-2xl border border-black/[0.07] overflow-hidden">
                  <div className="aspect-[16/9] sm:aspect-[4/3] skeleton" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-4 skeleton rounded w-2/3" />
                    <div className="h-3 skeleton rounded w-1/2" />
                    <div className="h-3 skeleton rounded w-1/3" />
                    <div className="h-8 skeleton rounded hidden sm:block mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-16">
              <p className="text-sm text-fg-dim">Couldn't load restaurants. Check the API server is running.</p>
            </div>
          )}

          {status === 'loaded' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {restaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="group bg-card rounded-xl sm:rounded-2xl border border-black/[0.07] overflow-hidden hover:border-amber/[0.25] transition-all duration-200 card-hover cursor-pointer"
                  onClick={() => onVote(restaurant)}
                >
                  <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden">
                    <img
                      src={restaurant.image || BURGER_IMAGES[i % BURGER_IMAGES.length]}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-fg text-sm sm:text-base leading-tight">{restaurant.name}</h3>
                        {restaurant.dish && (
                          <p className="text-xs font-medium text-amber mt-0.5">"{restaurant.dish}"</p>
                        )}
                        {restaurant.location && (
                          <p className="text-xs text-fg-dim flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {restaurant.location}
                          </p>
                        )}
                      </div>
                      <span className="sm:hidden flex-shrink-0 inline-flex items-center bg-amber/10 text-amber text-[11px] font-bold px-2 py-1 rounded-full mt-0.5">
                        Vote
                      </span>
                    </div>
                    <div className="hidden sm:block mt-3">
                      <Button
                        onClick={(e) => { e.stopPropagation(); onVote(restaurant); }}
                        variant="primary"
                        fullWidth
                        size="md"
                        icon={QrCode}
                        iconPosition="left"
                      >
                        Vote for This Dish
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Scan QR Page ---
type ScanPhase = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

const ScanQRPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { competition?: ApiCompetition; restaurant?: ApiRestaurant } | null;
  if (!state?.competition || !state?.restaurant) return <Navigate to="/competitions" replace />;
  const { competition, restaurant } = state;
  return (
    <ScanQRContent
      competition={competition}
      restaurant={restaurant}
      onScanSuccess={(token) => navigate('/vote', { state: { competition, restaurant, voteToken: token } })}
      onBack={() => navigate(`/competitions/${competition.id}`, { state: { competition } })}
    />
  );
};

const ScanQRContent = ({
  competition,
  restaurant,
  onScanSuccess,
  onBack,
}: {
  competition: ApiCompetition;
  restaurant: ApiRestaurant;
  onScanSuccess: (voteToken: string) => void;
  onBack: () => void;
}) => {
  const { isMobile } = useResponsive();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const processedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const redeemAndAdvance = useCallback(async (raw: string) => {
    if (processedRef.current) return;
    processedRef.current = true;
    stopCamera();
    setPhase('processing');

    let token = raw;
    try {
      const url = new URL(raw);
      const t = url.searchParams.get('vote');
      if (t) token = t;
    } catch { /* raw string — use as-is */ }

    try {
      const res = await fetch('/api/tokens/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data: { ok: boolean; competitionId?: string; restaurantId?: string; error?: string } = await res.json();
      if (data.ok) {
        if (data.restaurantId !== restaurant.id || data.competitionId !== competition.id) {
          setPhase('error');
          setErrorMsg('Wrong restaurant QR code. Please scan the correct QR code for this restaurant.');
          return;
        }
        setPhase('success');
        setTimeout(() => onScanSuccess(token), 700);
      } else {
        setPhase('error');
        setErrorMsg(data.error ?? 'Invalid QR code.');
      }
    } catch {
      setPhase('error');
      setErrorMsg('Network error. Please try again.');
    }
  }, [stopCamera, onScanSuccess]);

  const startCamera = useCallback(async () => {
    processedRef.current = false;
    setErrorMsg('');
    setPhase('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setPhase('error');
      setErrorMsg('Camera access denied. Allow camera access and try again, or use Upload instead.');
    }
  }, []);

  // RAF decode loop — only runs while phase === 'scanning'
  useEffect(() => {
    if (phase !== 'scanning') return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      if (video.readyState >= video.HAVE_ENOUGH_DATA && !processedRef.current) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
        if (code) { redeemAndAdvance(code.data); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [phase, redeemAndAdvance]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processedRef.current = false;
    setErrorMsg('');
    setPhase('processing');

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      const code = jsQR(imageData.data, bitmap.width, bitmap.height);
      if (!code) {
        setPhase('error');
        setErrorMsg('No QR code found in the image. Try a clearer photo.');
        return;
      }
      await redeemAndAdvance(code.data);
    } catch {
      setPhase('error');
      setErrorMsg('Could not read the image. Try another file.');
    }
  }, [redeemAndAdvance]);

  const handleReset = () => {
    stopCamera();
    processedRef.current = false;
    setPhase('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDone = phase === 'success';
  const steps = [
    { label: 'Scan QR', icon: QrCode, active: true, done: isDone },
    { label: 'Rate Dish', icon: Star, active: false, done: false },
    { label: 'Done', icon: Trophy, active: false, done: false },
  ];

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-section">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-8">
        <button
          onClick={() => { stopCamera(); onBack(); }}
          className="inline-flex items-center text-sm text-fg-muted hover:text-fg font-medium mb-8 transition-colors group"
        >
          <ArrowRight className="rotate-180 mr-1.5 group-hover:-translate-x-0.5 transition-transform" size={15} />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Restaurant context */}
          <div className="flex items-center gap-3 mb-8 p-3.5 bg-card rounded-xl border border-black/[0.07]">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <img src={restaurant.image || FALLBACK_IMAGE} alt={restaurant.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-fg-dim font-semibold uppercase tracking-wider">{competition.title}</p>
              <h2 className="text-sm font-bold text-fg truncate">{restaurant.name}</h2>
              {restaurant.dish && <p className="text-xs text-amber font-medium truncate">"{restaurant.dish}"</p>}
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-8 px-2">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step.done ? 'bg-live text-page' :
                    step.active ? 'bg-card text-amber border-2 border-amber' :
                    'bg-card text-fg-dim border border-black/[0.10]'
                  }`}>
                    {step.done ? <ShieldCheck size={16} /> : <step.icon size={16} />}
                  </div>
                  <span className={`text-[11px] font-medium ${step.active || step.done ? 'text-fg' : 'text-fg-dim'}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-3 mb-5 ${step.done ? 'bg-live' : 'bg-black/[0.08]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Main card */}
          <div className="bg-card rounded-2xl border border-black/[0.07] overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center border-b border-black/[0.06]">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-fg mb-1.5">Verify Your Visit</h1>
              <p className="text-sm text-fg-muted max-w-sm mx-auto">
                Scan the QR code from <span className="font-semibold text-fg">{restaurant.name}</span> to unlock voting.
              </p>
            </div>

            {!isMobile && phase === 'idle' && (
              <div className="flex border-b border-black/[0.06]">
                {(['camera', 'upload'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); handleReset(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                      mode === m
                        ? 'text-amber border-b-2 border-amber -mb-px bg-amber/[0.05]'
                        : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {m === 'camera' ? <Camera size={15} /> : <Upload size={15} />}
                    {m === 'camera' ? 'Camera' : 'Upload Image'}
                  </button>
                ))}
              </div>
            )}

            <div className="p-6">
              {phase === 'idle' && (
                <div className="text-center">
                  {mode === 'camera' ? (
                    <>
                      <div className="w-40 h-40 mx-auto mb-6 rounded-2xl bg-page border-2 border-dashed border-black/[0.12] flex flex-col items-center justify-center">
                        <Camera size={40} className="text-fg-dim mb-2" />
                        <span className="text-xs text-fg-dim font-medium">Camera Preview</span>
                      </div>
                      <Button onClick={startCamera} variant="primary" size="lg" fullWidth icon={Camera} iconPosition="left">
                        Start Camera
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-40 h-40 mx-auto mb-6 rounded-2xl bg-page border-2 border-dashed border-black/[0.12] flex flex-col items-center justify-center">
                        <Upload size={40} className="text-fg-dim mb-2" />
                        <span className="text-xs text-fg-dim font-medium">Select image file</span>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="sr-only" id="qr-upload" />
                      <label
                        htmlFor="qr-upload"
                        className="inline-flex items-center justify-center gap-2 w-full cursor-pointer bg-amber text-page rounded-xl px-6 py-3 text-base font-semibold hover:bg-amber-glow active:scale-[0.98] transition-all shadow-sm select-none amber-glow-shadow"
                      >
                        <Upload size={18} />
                        Choose Image
                      </label>
                    </>
                  )}
                </div>
              )}

              {phase === 'scanning' && (
                <div className="text-center">
                  <div className="relative mx-auto mb-4 rounded-xl overflow-hidden bg-page border border-black/[0.10]"
                    style={{ width: '100%', maxWidth: 320, aspectRatio: '1' }}>
                    <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none">
                      {[['top-3 left-3 border-t-2 border-l-2', ''],
                        ['top-3 right-3 border-t-2 border-r-2', ''],
                        ['bottom-3 left-3 border-b-2 border-l-2', ''],
                        ['bottom-3 right-3 border-b-2 border-r-2', '']].map(([cls], i) => (
                        <div key={i} className={`absolute w-7 h-7 border-amber rounded-sm ${cls}`} />
                      ))}
                      <div className="absolute left-4 right-4 h-0.5 bg-amber/70 animate-scan-line" />
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <p className="text-sm text-fg-muted mb-4">Point at the QR code from {restaurant.name}</p>
                  <Button onClick={handleReset} variant="ghost" size="sm">Cancel</Button>
                </div>
              )}

              {phase === 'processing' && (
                <div className="text-center py-8">
                  <div role="status" aria-label="Verifying QR code" className="w-14 h-14 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-fg-muted">Verifying code…</p>
                </div>
              )}

              {phase === 'success' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-live/[0.15] border border-live/[0.30] flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={28} className="text-live" />
                  </div>
                  <p className="text-lg font-bold text-live">Verified!</p>
                  <p className="text-sm text-fg-muted mt-1">Heading to the voting form…</p>
                </motion.div>
              )}

              {phase === 'error' && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-error/[0.12] flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={26} className="text-error" />
                  </div>
                  <p className="text-sm font-semibold text-fg mb-1">Scan Failed</p>
                  <p className="text-sm text-fg-muted mb-5 max-w-xs mx-auto">{errorMsg}</p>
                  <Button onClick={handleReset} variant="primary" size="md">Try Again</Button>
                </div>
              )}
            </div>

            {phase === 'idle' && (
              <div className="mx-6 mb-6 flex items-start gap-3 bg-live/[0.07] border border-live/[0.15] rounded-xl p-3.5">
                <ShieldCheck size={16} className="text-live flex-shrink-0 mt-0.5" />
                <p className="text-xs text-fg-muted leading-relaxed">
                  <span className="font-semibold text-fg">Why verify?</span>{' '}
                  Only customers who dined at the restaurant can vote, keeping results fair and trustworthy.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Voting Page ---
const VotingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { competition?: ApiCompetition; restaurant?: ApiRestaurant; voteToken?: string } | null;
  if (!state?.competition || !state?.restaurant) return <Navigate to="/competitions" replace />;
  const { competition, restaurant, voteToken = null } = state;
  return (
    <VotingContent
      competition={competition}
      restaurant={restaurant}
      voteToken={voteToken}
      onVoteSuccess={() => navigate('/competitions')}
      onBack={() => navigate('/scan', { state: { competition, restaurant } })}
    />
  );
};

const VotingContent = ({
  competition,
  restaurant,
  voteToken,
  onVoteSuccess,
  onBack,
}: {
  competition: ApiCompetition;
  restaurant: ApiRestaurant;
  voteToken: string | null;
  onVoteSuccess: () => void;
  onBack: () => void;
}) => {
  const { isMobile } = useResponsive();
  const { showToast } = useToast();

  const [ratings, setRatings] = useState<Record<string, number>>({
    first_impressions: 0,
    visual_appeal: 0,
    protein: 0,
    build: 0,
    flavor: 0,
    value: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criteria = [
    { id: 'first_impressions', label: 'First Impressions' },
    { id: 'visual_appeal', label: 'Visual Appeal' },
    { id: 'protein', label: 'The Protein' },
    { id: 'build', label: 'Toppings & Build' },
    { id: 'flavor', label: 'Overall Flavor' },
    { id: 'value', label: 'Value for Money' },
  ];

  const handleRatingChange = (id: string, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
    if (isMobile) navigator.vibrate?.(8);
  };

  const totalScore = criteria.reduce((acc, c) => acc + (ratings[c.id] || 0), 0) / criteria.length;
  const isComplete = criteria.every((c) => (ratings[c.id] || 0) > 0);
  const ratedCount = criteria.filter((c) => (ratings[c.id] || 0) > 0).length;

  const handleSubmit = async () => {
    if (!isComplete) {
      showToast('warning', 'Please rate all criteria before submitting.');
      return;
    }
    setIsSubmitting(true);

    if (voteToken) {
      try {
        const res = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: voteToken, scores: ratings, notes: comment }),
        });
        const data = await res.json() as { ok: boolean; error?: string };
        if (!data.ok) {
          showToast('error', data.error ?? 'Failed to submit vote.');
          setIsSubmitting(false);
          return;
        }
      } catch {
        showToast('error', 'Could not reach the server. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    showToast('success', 'Your vote has been submitted!');
    onVoteSuccess();
  };

  return (
    <div className="pt-16 md:pt-24 pb-24 min-h-screen bg-section">
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-6 md:pt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-fg-muted hover:text-fg font-medium mb-6 transition-colors group"
        >
          <ArrowRight className="rotate-180 mr-1.5 group-hover:-translate-x-0.5 transition-transform" size={15} />
          Back
        </button>

        {/* Restaurant context */}
        <div className="flex items-center gap-3 mb-6 p-3.5 bg-card rounded-xl border border-black/[0.07]">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={restaurant.image || FALLBACK_IMAGE} alt={restaurant.name} className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-fg-dim font-semibold uppercase tracking-wider">{competition.title}</p>
            <h1 className="text-sm md:text-base font-bold text-fg truncate">{restaurant.name}</h1>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-amber font-bold">{ratedCount}/{criteria.length}</div>
            <div className="text-[10px] text-fg-dim font-medium">rated</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-black/[0.07] rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-amber rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(ratedCount / criteria.length) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Criteria */}
        <div className="space-y-4 mb-8">
          {criteria.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl border border-black/[0.07] p-4 md:p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-fg">{item.label}</h3>
                <motion.span
                  key={ratings[item.id]}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`text-2xl font-bold tracking-tight ${ratings[item.id] > 0 ? 'text-amber' : 'text-fg-dim'}`}
                >
                  {ratings[item.id] > 0 ? (
                    <>{ratings[item.id]}<span className="text-xs text-fg-dim font-normal">/10</span></>
                  ) : '—'}
                </motion.span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 md:grid-cols-10 md:gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleRatingChange(item.id, num)}
                    className={`h-10 md:h-10 rounded-lg font-bold text-sm transition-all duration-100 ${
                      ratings[item.id] === num
                        ? 'bg-amber text-page score-active'
                        : ratings[item.id] > num
                        ? 'bg-amber/[0.15] text-amber'
                        : 'bg-black/[0.05] text-fg-dim hover:bg-black/[0.09] hover:text-fg-muted'
                    }`}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Score + Submit */}
        <div className="bg-card rounded-2xl border border-black/[0.07] p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-fg-dim font-semibold uppercase tracking-wider mb-0.5">Average Score</p>
              <p className="text-xs text-fg-dim">Across all 6 criteria</p>
            </div>
            <motion.div
              key={isComplete ? totalScore : 0}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-5xl font-bold tracking-tight ${isComplete ? 'text-amber' : 'text-fg-dim'}`}
            >
              {isComplete ? totalScore.toFixed(1) : '—'}
            </motion.div>
          </div>

          <Input
            label="Notes (optional)"
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any thoughts on the dish..."
            className="mb-4"
          />

          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="lg"
            fullWidth
            icon={Crown}
            iconPosition="left"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Score'}
          </Button>

          {!isComplete && (
            <p className="text-center text-xs text-fg-dim mt-3">
              Rate all 6 criteria to submit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- About Page ---
const AboutPage = ({ setActivePage }: { setActivePage: (p: string) => void }) => {
  return (
    <div className="pt-20 md:pt-24 pb-0">

      {/* ── Hero: bold typographic statement ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-amber text-xs font-bold uppercase tracking-widest mb-5">Our Story</p>
          <h1
            className="font-bold tracking-tight leading-[1.05] text-fg mb-8"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            We got tired of<br />
            <span className="text-amber">fake reviews.</span>
          </h1>
          <p className="text-fg-muted text-base md:text-xl leading-relaxed max-w-2xl">
            Chow Crown started with one argument: who actually has the best burger in LA? Every review site gave a different answer, and half of them were bought. So we built something where only verified diners vote, and the results update live.
          </p>
        </motion.div>
      </section>

      {/* ── Full-width hero image ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20 md:mb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9]"
        >
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80"
            alt="Beautifully plated gourmet dish at a restaurant"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'oklch(0.661 0.196 37 / 0.18)', mixBlendMode: 'multiply' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 max-w-lg">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">Our Mission</p>
            <h2
              className="font-bold text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)' }}
            >
              Crown the best food in every city.
            </h2>
          </div>
        </motion.div>
      </section>


      {/* ── What makes us different ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h2
            className="font-bold text-fg tracking-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            What makes us different
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/[0.06] rounded-2xl overflow-hidden border border-black/[0.06]">
          {[
            {
              num: '01',
              icon: ShieldCheck,
              title: 'Verified Votes Only',
              desc: 'Every vote requires a QR scan at the restaurant. No visit, no vote. No fake reviews, no anonymous trolls — just real diners.',
            },
            {
              num: '02',
              icon: BarChart3,
              title: 'Multi-Criteria Scoring',
              desc: 'Diners rate across flavour, presentation, value and more. Restaurants get real feedback, not just a single number.',
            },
            {
              num: '03',
              icon: Users,
              title: 'Community Powered',
              desc: 'No editorial picks, no sponsored placements. Local gems compete on equal footing with established names. The community decides.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-page p-8 md:p-10 flex flex-col"
            >
              <span
                className="font-display font-bold text-amber/30 leading-none mb-6 select-none"
                style={{ fontSize: '4.5rem', letterSpacing: '-0.04em' }}
              >
                {item.num}
              </span>
              <h3 className="font-bold text-fg text-lg mb-3">{item.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Story section ── */}
      <section className="bg-section py-20 md:py-28 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-amber text-xs font-bold uppercase tracking-widest mb-5">How It Started</p>
              <h2
                className="font-bold tracking-tight leading-tight text-fg mb-6"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
              >
                From a late-night argument to a live platform.
              </h2>
              <div className="space-y-4 text-fg-muted leading-relaxed text-sm md:text-base">
                <p>
                  It started with a group of friends in Los Angeles who couldn't agree on the best smash burger. Yelp said one thing, Google said another, and TikTok changed its mind every week.
                </p>
                <p>
                  We wanted something transparent, verified, and competition-driven: a place where restaurants could actually prove they're the best, and where diners could trust what they read.
                </p>
              </div>
              <div className="flex items-center gap-2.5 mt-8">
                <p className="text-sm text-fg-muted font-medium">Founded 2026 — Los Angeles, CA</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1778694277039-5cbf0b9a1fcf?auto=format&fit=crop&w=900&q=80"
                  alt="Friends dining together"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ backgroundColor: 'oklch(0.661 0.196 37 / 0.15)', mixBlendMode: 'multiply' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 md:py-32 bg-amber overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-amber-glow/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-overlay/20 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Join the movement</p>
            <h2
              className="font-display font-bold text-white tracking-tight leading-none mb-5"
              style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
            >
              Be part of it.
            </h2>
            <p className="text-white/60 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Whether you're a foodie or a restaurant ready to compete, there's a place for you in Chow Crown.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setActivePage('competitions')}
                className="bg-white text-amber font-bold uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors text-sm"
              >
                Browse Competitions
              </button>
              <button
                onClick={() => setActivePage('join')}
                className="text-white/70 hover:text-white font-semibold text-sm transition-colors"
              >
                Partner with us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

// --- Contact Page ---
const ContactPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      showToast('success', "Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "w-full bg-white border border-black/[0.12] rounded-lg px-4 py-3 text-sm text-fg placeholder:text-fg-dim focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all";
  const labelClass = "block text-sm font-semibold text-fg mb-1.5";

  return (
    <div className="min-h-screen bg-page pt-20 md:pt-24 pb-24">

      {/* ── Hero header ── */}
      <section className="text-center pt-10 md:pt-14 px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Crown decoration row */}
          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="w-10 h-px bg-amber/40" />
            <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
              <Crown size={16} className="text-amber" strokeWidth={2} />
            </div>
            <div className="w-10 h-px bg-amber/40" />
          </div>

          {/* Giant CONTACT */}
          <h1
            className="font-display font-bold text-amber leading-none tracking-tight"
            style={{ fontSize: 'clamp(4.5rem, 16vw, 10rem)', letterSpacing: '-0.03em' }}
          >
            CONTACT
          </h1>

          {/* "us" script-style */}
          <p
            className="font-display text-fg-muted italic -mt-2 md:-mt-4"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.75rem)' }}
          >
            us
          </p>

          {/* Subtext */}
          <p className="text-fg-muted text-base md:text-lg leading-relaxed max-w-lg mx-auto mt-8">
            Have a question, want to partner, or just want to say hi? Fill out the form and we'll get back to you within one business day.
          </p>
        </motion.div>
      </section>

      {/* ── Form ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 mt-10">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          {/* Row 1: Name + Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className={fieldClass}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Subject</label>
              <select
                className={fieldClass}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option>General Inquiry</option>
                <option>Restaurant Partnership</option>
                <option>Technical Support</option>
                <option>Press & Media</option>
              </select>
            </div>
          </div>

          {/* Row 2: Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mobile Number <span className="text-fg-dim font-normal">(optional)</span></label>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                className={fieldClass}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className={fieldClass}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className={labelClass}>Message</label>
            <textarea
              rows={6}
              placeholder="Add any notes or special instructions"
              className={`${fieldClass} resize-none`}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber text-white font-bold uppercase tracking-widest px-14 py-3.5 rounded-full hover:bg-amber-glow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </motion.form>
      </section>
    </div>
  );
};

// --- Privacy Policy Page ---
const PrivacyPolicyPage = () => {
  const sections = [
    {
      title: 'Information We Collect',
      body: [
        'When you use Chow Crown, we collect information you provide directly — such as your name, email address, and phone number when you submit a contact form or sign up for competition updates.',
        'When you vote in a competition, we collect your vote submission along with the token issued at the restaurant (generated when your server scans a QR code). This token records that a real diner visit occurred; it does not store your identity unless you provide it voluntarily.',
        'We also collect standard server logs including IP address, browser type, and pages visited. These are used solely for security and operational purposes.',
      ],
    },
    {
      title: 'How We Use Your Information',
      body: [
        'Vote data is used exclusively to compute competition standings and update live leaderboards. We never sell or license individual vote records.',
        'Contact form submissions are used to respond to your inquiry. We do not add you to marketing lists without your explicit consent.',
        'Aggregate, anonymised statistics (e.g. total votes cast, number of participating restaurants) may be published publicly on the platform.',
      ],
    },
    {
      title: 'Sharing & Disclosure',
      body: [
        'We do not sell, trade, or rent your personal information to third parties.',
        'Restaurant partners receive only aggregate competition results — not individual voter identities or contact details.',
        'We may disclose information when required by law, court order, or to protect the rights and safety of Chow Crown, our users, or the public.',
      ],
    },
    {
      title: 'Data Retention',
      body: [
        'Contact form submissions are retained for up to 12 months and then deleted.',
        'Competition vote records are retained for the duration of the relevant competition season and up to 24 months thereafter for auditing purposes, then permanently deleted.',
        'You may request deletion of your personal data at any time by emailing us (see Contact section below).',
      ],
    },
    {
      title: 'Cookies & Local Storage',
      body: [
        'Chow Crown uses minimal browser storage. We store a session flag to remember your current page state and prevent duplicate vote attempts. No third-party advertising cookies are used.',
        'You can clear this data at any time through your browser settings without affecting your ability to use the site.',
      ],
    },
    {
      title: 'Your Rights',
      body: [
        'You have the right to access, correct, or delete personal information we hold about you. To exercise any of these rights, email us at thechowcrown@gmail.com with the subject line "Privacy Request".',
        'We will respond within 30 days. If you are located in the EU/EEA, you also have the right to lodge a complaint with your local data protection authority.',
      ],
    },
    {
      title: 'Changes to This Policy',
      body: [
        'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. Continued use of Chow Crown after changes are posted constitutes your acceptance of the updated policy.',
      ],
    },
    {
      title: 'Contact Us',
      body: [
        'If you have any questions or concerns about this Privacy Policy or how your data is handled, please reach out:',
        'Email: thechowcrown@gmail.com',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-page pt-20 md:pt-24 pb-24">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-amber text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
          <h1
            className="font-bold tracking-tight leading-tight text-fg mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-fg-dim text-sm">Last updated: June 2026</p>
          <p className="text-fg-muted text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
            Chow Crown is built on trust — between diners, restaurants, and us. This policy explains what data we collect, why we collect it, and how we protect it.
          </p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="divide-y divide-black/[0.06]">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="py-10 first:pt-0"
            >
              <h2 className="font-bold text-fg text-lg mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-fg-muted text-sm md:text-base leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Terms of Service Page ---
const TermsOfServicePage = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      body: [
        'By accessing or using Chow Crown (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Platform.',
        'We reserve the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.',
      ],
    },
    {
      title: 'Eligibility',
      body: [
        'You must be at least 13 years of age to use Chow Crown. By using the Platform you represent that you meet this requirement.',
        'If you are using the Platform on behalf of a business or organisation, you represent that you have the authority to bind that entity to these Terms.',
      ],
    },
    {
      title: 'The Voting System',
      body: [
        'Chow Crown operates a verified voting system. To cast a vote in a competition, you must scan a QR code issued by a participating restaurant at the time of your visit. Each token may only be used once.',
        'Votes are intended to reflect genuine dining experiences. Any attempt to generate, copy, share, or otherwise misuse vote tokens — or to automate, script, or otherwise manipulate vote counts — is strictly prohibited and may result in permanent disqualification from the Platform.',
        'Chow Crown reserves the right to invalidate votes, disqualify entries, or remove competition results at its sole discretion if it determines that manipulation has occurred.',
      ],
    },
    {
      title: 'Restaurant Partners',
      body: [
        'Restaurants that participate in Chow Crown competitions ("Partners") agree to distribute QR tokens only to genuine paying diners during the active competition period.',
        'Partners may not distribute tokens in bulk, sell tokens, or use any method designed to inflate their vote count. Violations may result in immediate removal from the competition and a permanent ban from future seasons.',
        'Competition results, including rankings and scores, are the property of Chow Crown and may be published, shared, or promoted at our discretion.',
      ],
    },
    {
      title: 'Intellectual Property',
      body: [
        'All content on the Platform — including the Chow Crown name, crown logo, design, copy, and software — is owned by Chow Crown Inc. and protected by applicable intellectual property laws.',
        'You may not reproduce, distribute, or create derivative works from any Platform content without our express written permission.',
        'User-submitted content (such as contact form messages) remains yours, but by submitting it you grant Chow Crown a limited licence to use it to respond to your inquiry.',
      ],
    },
    {
      title: 'Prohibited Conduct',
      body: [
        'You agree not to: (a) use the Platform for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the Platform or its backend systems; (c) interfere with or disrupt the integrity or performance of the Platform; (d) scrape, crawl, or systematically extract data from the Platform without permission; (e) impersonate any person or entity.',
      ],
    },
    {
      title: 'Disclaimers',
      body: [
        'The Platform is provided "as is" and "as available" without warranties of any kind, express or implied. Chow Crown does not warrant that the Platform will be uninterrupted, error-free, or free of viruses.',
        'Competition rankings reflect the votes submitted through our verified system. Chow Crown makes no representation that rankings constitute an endorsement of any restaurant or food product.',
      ],
    },
    {
      title: 'Limitation of Liability',
      body: [
        'To the fullest extent permitted by law, Chow Crown Inc. and its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.',
        'Our total liability to you for any claim arising out of these Terms shall not exceed $100 USD.',
      ],
    },
    {
      title: 'Governing Law',
      body: [
        'These Terms are governed by the laws of the State of California, United States, without regard to its conflict-of-law provisions. Any disputes shall be resolved in the state or federal courts located in Los Angeles County, California.',
      ],
    },
    {
      title: 'Contact',
      body: [
        'Questions about these Terms? Reach us at:',
        'Email: thechowcrown@gmail.com',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-page pt-20 md:pt-24 pb-24">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-amber text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
          <h1
            className="font-bold tracking-tight leading-tight text-fg mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
          >
            Terms of Service
          </h1>
          <p className="text-fg-dim text-sm">Last updated: June 2026</p>
          <p className="text-fg-muted text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
            These terms govern your use of the Chow Crown platform. Please read them carefully before participating in any competition or submitting any content.
          </p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="divide-y divide-black/[0.06]">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="py-10 first:pt-0"
            >
              <h2 className="font-bold text-fg text-lg mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-fg-muted text-sm md:text-base leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Cookie Policy Page ---
const CookiePolicyPage = () => {
  const sections = [
    {
      title: 'What Are Cookies?',
      body: [
        'Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites work efficiently and to provide information to website owners.',
        'Chow Crown also uses similar browser-based storage technologies such as localStorage and sessionStorage, which this policy covers collectively under the term "cookies".',
      ],
    },
    {
      title: 'Cookies We Use',
      body: [
        'Strictly Necessary — These are required for the Platform to function. They include a session flag that tracks your current page state and a one-time-use vote token that prevents duplicate submissions after you scan a restaurant QR code. You cannot opt out of these without disabling the site entirely.',
        'Functional — We store lightweight preferences (such as whether you have dismissed an in-app notice) to improve your experience across visits. No personally identifiable information is stored in these.',
        'Analytics — We do not currently use any third-party analytics cookies (e.g. Google Analytics). If we introduce them in the future, this policy will be updated and you will be asked for consent.',
        'Advertising — We do not use advertising or tracking cookies. No data from Chow Crown is shared with ad networks.',
      ],
    },
    {
      title: 'Third-Party Cookies',
      body: [
        'Chow Crown does not load third-party scripts that set cookies on your device. Any external resources (such as fonts or images) are loaded in a way that does not result in third-party cookie placement.',
      ],
    },
    {
      title: 'How Long Cookies Last',
      body: [
        'Session cookies — deleted automatically when you close your browser tab.',
        'Functional preference cookies — expire after 90 days.',
        'Vote tokens stored in sessionStorage — cleared when the browser tab is closed.',
      ],
    },
    {
      title: 'Managing Cookies',
      body: [
        'You can control and delete cookies through your browser settings. Most browsers allow you to refuse new cookies, delete existing cookies, or be notified when a new cookie is set.',
        'Please note that disabling strictly necessary cookies will prevent core features — such as voting — from working correctly.',
        'For guidance on managing cookies in your specific browser, visit the browser\'s help documentation or a resource like www.allaboutcookies.org.',
      ],
    },
    {
      title: 'Changes to This Policy',
      body: [
        'We may update this Cookie Policy as the Platform evolves. The "Last updated" date at the top of this page will reflect any changes. We encourage you to review this page periodically.',
      ],
    },
    {
      title: 'Contact',
      body: [
        'Questions about our use of cookies? Get in touch:',
        'Email: thechowcrown@gmail.com',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-page pt-20 md:pt-24 pb-24">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-amber text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
          <h1
            className="font-bold tracking-tight leading-tight text-fg mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
          >
            Cookie Policy
          </h1>
          <p className="text-fg-dim text-sm">Last updated: June 2026</p>
          <p className="text-fg-muted text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
            This policy explains what cookies and similar technologies Chow Crown uses, why we use them, and how you can control them.
          </p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="divide-y divide-black/[0.06]">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="py-10 first:pt-0"
            >
              <h2 className="font-bold text-fg text-lg mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-fg-muted text-sm md:text-base leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Accessibility Page ---
const AccessibilityPage = () => {
  const sections = [
    {
      title: 'Our Commitment',
      body: [
        'Chow Crown is committed to ensuring that our platform is accessible to everyone, including people with disabilities. We aim to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.',
        'We continuously review and improve our platform to remove barriers and make the experience as inclusive as possible for all users.',
      ],
    },
    {
      title: 'Keyboard Navigation',
      body: [
        'All interactive elements on Chow Crown — including navigation, forms, buttons, and voting flows — are fully accessible via keyboard alone.',
        'Focus states are clearly visible on all interactive elements. You can use Tab to move forward through the page, Shift+Tab to move backward, Enter or Space to activate buttons and links, and Escape to close modals or overlays.',
      ],
    },
    {
      title: 'Screen Reader Support',
      body: [
        'We use semantic HTML throughout the platform so that screen readers can accurately convey the structure and purpose of each page.',
        'Images and icons include descriptive alt text or aria-label attributes. Dynamic content updates — such as live leaderboard changes and toast notifications — are announced appropriately.',
      ],
    },
    {
      title: 'Colour & Contrast',
      body: [
        'Text and interactive elements are designed to meet WCAG AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text).',
        'We do not rely on colour alone to convey meaning. Status indicators such as "Live Now" badges include text labels in addition to colour.',
      ],
    },
    {
      title: 'Text & Zoom',
      body: [
        'The platform is fully responsive and supports browser-level text resizing up to 200% without loss of content or functionality.',
        'We use relative font sizing (rem/em) to respect user browser preferences for default text size.',
      ],
    },
    {
      title: 'Motion & Animation',
      body: [
        'Chow Crown uses subtle animations throughout the interface. If you have enabled the "Reduce Motion" preference in your operating system, our animations will be minimised or disabled automatically via the prefers-reduced-motion media query.',
      ],
    },
    {
      title: 'Known Limitations',
      body: [
        'We are aware that some older content and third-party embedded elements may not yet fully meet our accessibility standards. We are actively working to address these gaps.',
        'If you encounter a specific barrier that is preventing you from using any part of Chow Crown, please contact us and we will prioritise a fix.',
      ],
    },
    {
      title: 'Feedback & Contact',
      body: [
        'Accessibility is an ongoing effort and we welcome your feedback. If you experience any difficulty accessing content or using a feature, please reach out:',
        'Email: thechowcrown@gmail.com',
        'We aim to respond to accessibility-related enquiries within 2 business days.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-page pt-20 md:pt-24 pb-24">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-amber text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
          <h1
            className="font-bold tracking-tight leading-tight text-fg mb-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}
          >
            Accessibility
          </h1>
          <p className="text-fg-dim text-sm">Last updated: June 2026</p>
          <p className="text-fg-muted text-base md:text-lg leading-relaxed mt-6 max-w-2xl">
            Chow Crown believes great food is for everyone — and so is our platform. Here is how we work to make it accessible to all.
          </p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="divide-y divide-black/[0.06]">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="py-10 first:pt-0"
            >
              <h2 className="font-bold text-fg text-lg mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-fg-muted text-sm md:text-base leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Join Page ---
const JoinPage = ({ setActivePage }: { setActivePage: (p: string) => void }) => {
  const [activeCities, setActiveCities] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/competitions')
      .then((r) => r.json())
      .then((data: { competitions: ApiCompetition[] }) => {
        setActiveCities([...new Set(data.competitions.map((c) => c.city))]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-16">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 mb-16 md:mb-20 border-b border-black/[0.07] pb-10 md:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-4">Restaurant Partnerships</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            Put your best dish to the test.
          </h1>
          <p className="text-base md:text-lg text-fg-muted leading-relaxed mb-8 max-w-xl">
            Chow Crown competitions bring verified diners straight to your restaurant. No ads, no sponsored posts. Just real people voting on real food.
          </p>
          <Button
            onClick={() => setActivePage('contact')}
            variant="primary"
            size="lg"
            icon={ArrowRight}
          >
            Apply as a Restaurant
          </Button>
        </motion.div>
      </section>

      {/* Benefits + How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">Why restaurants join</h2>
            <div className="space-y-5">
              {[
                { title: 'Drive Foot Traffic', desc: 'Competitions bring thousands of motivated diners to your door over a 4-week period.' },
                { title: 'Verified Feedback', desc: 'Every vote comes from someone who actually ate your food. No bots, no fakes.' },
                { title: 'Real-Time Standings', desc: 'Track how you stack up against competitors with live data you can act on.' },
                { title: 'Win the Crown', desc: 'Winners get featured across our platform, social channels, and local press coverage.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-amber/[0.10] text-amber flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* How it works for restaurants */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">How it works</h2>
            <div className="space-y-3">
              {[
                { icon: Utensils, label: 'Select Your Dish', desc: 'Choose the signature dish you want to enter into competition.' },
                { icon: QrCode, label: 'Get Your QR Codes', desc: 'We provide table-ready QR codes so diners can scan and vote on-site.' },
                { icon: BarChart3, label: 'Watch the Votes', desc: 'Track your scores across multiple rating categories in your restaurant dashboard.' },
                { icon: Trophy, label: 'Claim the Crown', desc: 'Top-scoring restaurants are crowned winners at the end of each quarter.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 bg-card rounded-xl border border-black/[0.07] p-4">
                  <div className="w-9 h-9 rounded-lg bg-section flex items-center justify-center flex-shrink-0">
                    <step.icon size={16} className="text-amber" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">{step.label}</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open spots */}
      <section className="py-14 md:py-16 bg-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl mb-8"
          >
            <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-3">Now Accepting</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Q2 2026 Applications</h2>
            <p className="text-sm text-fg-muted mt-2">Spots are limited per category per city.</p>
          </motion.div>

          {activeCities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {activeCities.map((city, i) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-black/[0.07] p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={13} className="text-amber" />
                    <h3 className="text-sm font-semibold">{city}</h3>
                  </div>
                  <p className="text-xs text-fg-muted font-medium">Now accepting applicants</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

// --- Admin Page ---
interface AdminVote {
  id: string;
  tokenId: string;
  competitionId: string;
  restaurantId: string;
  scores: Record<string, number>;
  notes: string;
  submittedAt: string;
}

const AdminCompetitionsTab = ({ adminKey }: { adminKey: string }) => {
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', city: '', quarter: '', description: '' });
  const [formError, setFormError] = useState('');

  const h = useCallback(() => ({ 'Content-Type': 'application/json', 'x-admin-key': adminKey }), [adminKey]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/competitions', { headers: h() });
      const data = await res.json();
      setCompetitions(data.competitions ?? []);
    } finally {
      setLoading(false);
    }
  }, [h]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.title || !form.category || !form.city || !form.quarter || !form.description) {
      setFormError('All fields are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST', headers: h(), body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: '', category: '', city: '', quarter: '', description: '' });
        setFormError('');
        await load();
      } else {
        const d = await res.json();
        setFormError(d.error ?? 'Failed to create.');
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/competitions/${id}`, {
      method: 'PATCH', headers: h(), body: JSON.stringify({ active }),
    });
    setCompetitions((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
  };

  if (loading) return <div className="py-16 text-center text-fg-muted">Loading…</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" icon={Plus} iconPosition="left" onClick={() => { setShowCreate(true); setFormError(''); }}>
          New Competition
        </Button>
      </div>

      <div className="space-y-3">
        {competitions.length === 0 && (
          <p className="text-center py-16 text-fg-muted">No competitions yet.</p>
        )}
        {competitions.map((c) => (
          <div key={c.id} className="bg-card rounded-2xl px-5 py-4 flex items-center gap-4 border border-black/[0.07] shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-fg">{c.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {c.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-fg-muted mt-0.5">{c.category} · {c.city} · {c.quarter}</p>
            </div>
            <button
              onClick={() => toggleActive(c.id, !c.active)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                c.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {c.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-overlay/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-card rounded-3xl p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-black uppercase italic mb-6">New Competition</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-1.5">Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Best Burger NYC" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-1.5">Category</label>
                  <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Burger" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-1.5">City</label>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. New York" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-1.5">Quarter</label>
                <input value={form.quarter} onChange={(e) => setForm((f) => ({ ...f, quarter: e.target.value }))} placeholder="e.g. Q2 2026" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description…" rows={3} className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none resize-none" />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <Button fullWidth loading={creating} onClick={create}>Create</Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminRestaurantsTab = ({ adminKey }: { adminKey: string }) => {
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', dish: '', location: '' });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const h = useCallback(() => ({ 'Content-Type': 'application/json', 'x-admin-key': adminKey }), [adminKey]);

  useEffect(() => {
    fetch('/api/admin/competitions', { headers: h() })
      .then((r) => r.json())
      .then((d) => {
        const comps: ApiCompetition[] = d.competitions ?? [];
        setCompetitions(comps);
        if (comps.length > 0) setSelectedCompId(comps[0].id);
      });
  }, [h]);

  useEffect(() => {
    if (!selectedCompId) return;
    setLoading(true);
    fetch(`/api/admin/restaurants?competitionId=${selectedCompId}`, { headers: h() })
      .then((r) => r.json())
      .then((d) => setRestaurants(d.restaurants ?? []))
      .finally(() => setLoading(false));
  }, [selectedCompId, h]);

  const addRestaurant = async () => {
    if (!form.name || !form.location) { setFormError('Name and location are required.'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'POST', headers: h(),
        body: JSON.stringify({ name: form.name, dish: form.dish, location: form.location, competitionId: selectedCompId }),
      });
      if (res.ok) {
        const d = await res.json();
        setRestaurants((prev) => [...prev, d.restaurant]);
        setForm({ name: '', dish: '', location: '' });
        setFormError('');
      } else {
        const d = await res.json();
        setFormError(d.error ?? 'Failed to add.');
      }
    } finally {
      setAdding(false);
    }
  };

  const removeRestaurant = async (id: string) => {
    await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE', headers: h() });
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-2">Competition</label>
        <select
          value={selectedCompId}
          onChange={(e) => setSelectedCompId(e.target.value)}
          className="bg-card border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg focus:border-amber outline-none"
        >
          {competitions.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-black/[0.07] shadow-sm mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-fg-muted mb-4">Add Restaurant</h3>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-36">
            <label className="block text-xs font-semibold text-fg-muted mb-1.5">Restaurant Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addRestaurant()} placeholder="e.g. Goldburger" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
          </div>
          <div className="flex-1 min-w-36">
            <label className="block text-xs font-semibold text-fg-muted mb-1.5">Competition Dish</label>
            <input value={form.dish} onChange={(e) => setForm((f) => ({ ...f, dish: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addRestaurant()} placeholder="e.g. The Classic Smash Burger" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
          </div>
          <div className="flex-1 min-w-36">
            <label className="block text-xs font-semibold text-fg-muted mb-1.5">Location</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addRestaurant()} placeholder="Neighborhood / address" className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg placeholder:text-fg-muted focus:border-amber outline-none" />
          </div>
          <Button size="sm" icon={Plus} iconPosition="left" loading={adding} disabled={!selectedCompId} onClick={addRestaurant}>Add</Button>
        </div>
        {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}
      </div>

      {loading ? (
        <div className="py-16 text-center text-fg-muted">Loading…</div>
      ) : (
        <div className="space-y-2">
          {restaurants.length === 0 && (
            <p className="text-center py-12 text-fg-muted">No restaurants in this competition yet.</p>
          )}
          {restaurants.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl px-5 py-3 flex items-center gap-3 border border-black/[0.07] shadow-sm">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-fg">{r.name}</span>
                {r.dish && <span className="text-xs text-amber font-medium ml-2">"{r.dish}"</span>}
                <span className="text-xs text-fg-muted ml-2">{r.location}</span>
              </div>
              {confirmDelete === r.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-red-500 font-medium">Remove?</span>
                  <button onClick={() => removeRestaurant(r.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 transition-colors">Yes</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs bg-section text-fg-muted px-3 py-1.5 rounded-lg font-semibold hover:bg-black/[0.07] transition-colors">No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(r.id)} className="p-2 text-fg-dim hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminVotesTab = ({ adminKey }: { adminKey: string }) => {
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [votes, setVotes] = useState<AdminVote[]>([]);
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const h = useCallback(() => ({ 'Content-Type': 'application/json', 'x-admin-key': adminKey }), [adminKey]);

  useEffect(() => {
    fetch('/api/admin/competitions', { headers: h() })
      .then((r) => r.json())
      .then((d) => {
        const comps: ApiCompetition[] = d.competitions ?? [];
        setCompetitions(comps);
        if (comps.length > 0) setSelectedCompId(comps[0].id);
      });
  }, [h]);

  useEffect(() => {
    if (!selectedCompId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/votes?competitionId=${selectedCompId}`, { headers: h() }).then((r) => r.json()),
      fetch(`/api/admin/restaurants?competitionId=${selectedCompId}`, { headers: h() }).then((r) => r.json()),
    ]).then(([vd, rd]) => {
      setVotes(vd.votes ?? []);
      setRestaurants(rd.restaurants ?? []);
    }).finally(() => setLoading(false));
  }, [selectedCompId, h]);

  const restMap = Object.fromEntries(restaurants.map((r) => [r.id, r]));

  const leaderboard = restaurants.map((r) => {
    const rv = votes.filter((v) => v.restaurantId === r.id);
    if (rv.length === 0) return { ...r, voteCount: 0, avgScore: null as number | null };
    const avg = rv.reduce((sum, v) => {
      const vals = Object.values(v.scores) as number[];
      return sum + vals.reduce((a, b) => a + b, 0) / vals.length;
    }, 0) / rv.length;
    return { ...r, voteCount: rv.length, avgScore: avg };
  }).sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1));

  return (
    <div>
      <div className="mb-6 flex items-end gap-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-fg-muted mb-2">Competition</label>
          <select value={selectedCompId} onChange={(e) => setSelectedCompId(e.target.value)} className="bg-card border border-black/[0.10] rounded-xl px-4 py-2.5 text-fg focus:border-amber outline-none">
            {competitions.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        {votes.length > 0 && (
          <p className="text-sm text-fg-muted pb-2.5">{votes.length} vote{votes.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-fg-muted">Loading…</div>
      ) : (
        <>
          {leaderboard.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-fg-muted mb-3">Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((r, i) => (
                  <div key={r.id} className="bg-card rounded-2xl px-5 py-3 flex items-center gap-4 border border-black/[0.07] shadow-sm">
                    <span className="text-sm font-black text-fg-dim w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-fg">{r.name}</span>
                      <span className="text-xs text-fg-muted ml-2">{r.location}</span>
                    </div>
                    <span className="text-xs text-fg-muted">{r.voteCount} vote{r.voteCount !== 1 ? 's' : ''}</span>
                    <span className="text-lg font-black text-amber w-12 text-right">
                      {r.avgScore != null ? r.avgScore.toFixed(1) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {votes.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-fg-muted mb-3">All Votes</h3>
              <div className="bg-card rounded-2xl border border-black/[0.07] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/[0.07] text-left">
                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wide text-fg-muted">Restaurant</th>
                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wide text-fg-muted">Scores</th>
                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wide text-fg-muted">Avg</th>
                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wide text-fg-muted">Notes</th>
                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wide text-fg-muted">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05]">
                      {votes.map((v) => {
                        const vals = Object.values(v.scores) as number[];
                        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                        return (
                          <tr key={v.id} className="hover:bg-section/60 transition-colors">
                            <td className="px-5 py-3 font-medium text-fg">{restMap[v.restaurantId]?.name ?? v.restaurantId}</td>
                            <td className="px-5 py-3 text-xs text-fg-muted">
                              {Object.entries(v.scores).map(([k, val]) => `${k}: ${val}`).join(' · ')}
                            </td>
                            <td className="px-5 py-3 font-bold text-amber">{avg.toFixed(1)}</td>
                            <td className="px-5 py-3 text-xs text-fg-muted max-w-48">
                              <span className="truncate block">{v.notes || '—'}</span>
                            </td>
                            <td className="px-5 py-3 text-xs text-fg-muted whitespace-nowrap">
                              {new Date(v.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {votes.length === 0 && (
            <p className="text-center py-16 text-fg-muted">No votes yet for this competition.</p>
          )}
        </>
      )}
    </div>
  );
};

const AdminTokensTab = ({ adminKey }: { adminKey: string }) => {
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [compId, setCompId] = useState('');
  const [restId, setRestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const h = useCallback(() => ({ 'Content-Type': 'application/json', 'x-admin-key': adminKey }), [adminKey]);

  useEffect(() => {
    fetch('/api/competitions', { headers: h() })
      .then((r) => r.json())
      .then((data: { competitions: ApiCompetition[] }) => setCompetitions(data.competitions ?? []))
      .catch(() => {});
  }, [h]);

  useEffect(() => {
    if (!compId) { setRestaurants([]); setRestId(''); return; }
    fetch(`/api/competitions/${compId}/restaurants`, { headers: h() })
      .then((r) => r.json())
      .then((data: { restaurants: ApiRestaurant[] }) => { setRestaurants(data.restaurants ?? []); setRestId(''); })
      .catch(() => {});
  }, [compId, h]);

  const generate = async () => {
    setError('');
    setGeneratedUrl('');
    if (!compId || !restId) { setError('Select a competition and restaurant first.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: h(),
        body: JSON.stringify({ competitionId: compId, restaurantId: restId, count: 1 }),
      });
      const data = await res.json() as { tokens?: { url: string }[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate token');
      setGeneratedUrl(data.tokens![0].url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating token');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fieldClass = "w-full bg-white border border-black/[0.12] rounded-lg px-4 py-2.5 text-sm text-fg focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all";

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="text-xs font-semibold text-fg-dim uppercase tracking-widest mb-4">Generate a Test Vote Token</p>
        <p className="text-sm text-fg-muted mb-6">Creates a single-use vote URL. Open it in a browser to simulate a diner scanning a QR code.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-fg mb-1.5">Competition</label>
        <select className={fieldClass} value={compId} onChange={(e) => setCompId(e.target.value)}>
          <option value="">Select a competition…</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.title} — {c.city} {c.quarter}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-fg mb-1.5">Restaurant</label>
        <select className={fieldClass} value={restId} onChange={(e) => setRestId(e.target.value)} disabled={!compId}>
          <option value="">Select a restaurant…</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-error font-medium">{error}</p>}

      <Button variant="primary" onClick={generate} disabled={loading || !compId || !restId}>
        {loading ? 'Generating…' : 'Generate Token'}
      </Button>

      {generatedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/[0.08] border border-success/[0.25] rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-bold text-success uppercase tracking-widest">Token ready</p>
          <p className="text-sm font-mono text-fg break-all">{generatedUrl}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
            <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Open in Browser</Button>
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

type AdminTab = 'competitions' | 'restaurants' | 'votes' | 'tokens';

const AdminPage = () => {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('chowcrown_admin') ?? '');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<AdminTab>('competitions');

  const signIn = async () => {
    try {
      const res = await fetch('/api/admin/competitions', { headers: { 'x-admin-key': keyInput } });
      if (res.ok) {
        sessionStorage.setItem('chowcrown_admin', keyInput);
        setAdminKey(keyInput);
        setAuthError('');
      } else {
        setAuthError('Invalid admin key.');
      }
    } catch {
      setAuthError('Network error. Please try again.');
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('chowcrown_admin');
    setAdminKey('');
    setKeyInput('');
  };

  if (!adminKey) {
    return (
      <div className="pt-20 md:pt-24 min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-sm border border-black/[0.07]">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={22} className="text-amber" />
            <h1 className="text-2xl font-display font-black uppercase italic">Admin</h1>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && signIn()}
                placeholder="Admin key"
                className="w-full bg-section border border-black/[0.10] rounded-xl px-4 py-3 text-fg placeholder:text-fg-muted focus:border-amber outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg transition-colors"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <Button fullWidth onClick={signIn}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-16">
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield size={26} className="text-amber" />
          <h1 className="text-3xl font-display font-black uppercase italic">Admin</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
      </div>

      <div className="flex gap-1 mb-8 bg-card rounded-xl p-1 shadow-sm border border-black/[0.07] w-fit">
        {(['competitions', 'restaurants', 'votes', 'tokens'] as AdminTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-amber text-page shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'competitions' && <AdminCompetitionsTab adminKey={adminKey} />}
      {tab === 'restaurants' && <AdminRestaurantsTab adminKey={adminKey} />}
      {tab === 'votes' && <AdminVotesTab adminKey={adminKey} />}
      {tab === 'tokens' && <AdminTokensTab adminKey={adminKey} />}
    </div>
    </div>
  );
};

// --- Root App ---
function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Maps legacy page-key strings (used by LandingPage/AboutPage/JoinPage) to URL paths.
  const setActivePage = useCallback((page: string) => {
    const paths: Record<string, string> = {
      home: '/', competitions: '/competitions', about: '/about',
      contact: '/contact', join: '/join',
    };
    navigate(paths[page] ?? `/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // On mount: handle ?vote=TOKEN QR code URL entry point.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('vote');
    if (!token) return;

    window.history.replaceState({}, '', window.location.pathname);

    fetch('/api/tokens/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then(async (data: { ok: boolean; competitionId?: string; restaurantId?: string; error?: string }) => {
        if (!data.ok || !data.competitionId || !data.restaurantId) {
          showToast('error', data.error ?? 'Invalid QR code.');
          return;
        }

        const [compRes, restRes] = await Promise.all([
          fetch(`/api/competitions/${data.competitionId}`).then((r) => r.json()),
          fetch(`/api/competitions/${data.competitionId}/restaurants`).then((r) => r.json()),
        ]);

        const competition: ApiCompetition = compRes.competition;
        const restaurant: ApiRestaurant | undefined = (restRes.restaurants as ApiRestaurant[]).find(
          (r) => r.id === data.restaurantId
        );

        if (!competition || !restaurant) {
          showToast('error', 'Could not load competition data.');
          return;
        }

        navigate('/vote', { state: { competition, restaurant, voteToken: token } });
        window.scrollTo({ top: 0, behavior: 'instant' });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-amber focus:text-page focus:rounded-lg focus:font-semibold focus:text-sm">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage setActivePage={setActivePage} />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:id" element={<CompetitionDetailsPage />} />
              <Route path="/about" element={<AboutPage setActivePage={setActivePage} />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/join" element={<JoinPage setActivePage={setActivePage} />} />
              <Route path="/scan" element={<ScanQRPage />} />
              <Route path="/vote" element={<VotingPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </ErrorBoundary>
  );
}
