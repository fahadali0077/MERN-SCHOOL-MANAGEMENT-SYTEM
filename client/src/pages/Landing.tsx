import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWindowTitle } from '../hooks';
School, Users, ClipboardList, BarChart3, DollarSign, Bell,
  QrCode, Shield, Zap, Globe, ArrowRight, CheckCircle, Star, ChevronRight
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Student Information System', desc: 'Complete student profiles, document uploads, academic history, and parent portal in one place.', color: '#0066FF', span: 'bento-span-2' },
  { icon: QrCode, title: 'QR Attendance', desc: 'Students scan to mark themselves present in seconds.', color: '#10B981' },
  { icon: BarChart3, title: 'Smart Grading', desc: 'Auto GPA, grade reports, and beautiful report cards.', color: '#8B5CF6' },
  { icon: DollarSign, title: 'Fee Management', desc: 'Automated invoices, payment tracking, and overdue reminders sent to parents automatically.', color: '#F59E0B', span: 'bento-span-2' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Parents notified instantly for absence, results, and dues.', color: '#EF4444' },
  { icon: Shield, title: 'Bank-grade Security', desc: 'JWT rotation, RBAC, tenant isolation, and encryption.', color: '#10B981' },
  { icon: Globe, title: 'Multi-School SaaS', desc: 'Manage hundreds of schools from a single admin panel with full tenant isolation.', color: '#0066FF', span: 'bento-span-2' },
  { icon: Zap, title: 'Blazing Fast', desc: 'Redis-cached APIs, lazy routes, < 200ms responses.', color: '#F59E0B' },
];

const stats = [
  { value: '500+', label: 'Schools' },
  { value: '2M+', label: 'Students' },
  { value: '10M+', label: 'Transactions' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'Principal, Oakwood Academy', text: 'SchoolMS transformed how we manage 1,200 students. Attendance alone saves us 2 hours daily.' },
  { name: 'James Okafor', role: 'IT Director, Lagos Unity School', text: 'The fee management module eliminated our overdue problem entirely. Parents pay on time now.' },
  { name: 'Priya Sharma', role: 'School Admin, Sunrise Public', text: 'Real-time parent notifications cut our absenteeism by 40%. Absolutely essential.' },
  { name: 'Carlos Mendez', role: 'Superintendent, Metro District', text: 'We manage 12 schools from one dashboard. The multi-school architecture is flawless.' },
  { name: 'Lisa Chen', role: 'Head Teacher, Greenfield High', text: 'Report card generation used to take 3 days. Now it takes 10 minutes. Game changer.' },
  { name: 'Ahmed Hassan', role: 'Principal, Al-Noor Academy', text: 'The QR attendance system is loved by both teachers and students. Modern and efficient.' },
];

// Infinite marquee component
const Marquee = ({ items, reverse = false }: { items: typeof testimonials; reverse?: boolean }) => (
  <div className="flex gap-4 overflow-hidden">
    <div className={`flex gap-4 flex-shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
      {[...items, ...items].map((t, i) => (
        <div key={i} className="w-72 flex-shrink-0 p-5 rounded-2xl bg-bg-secondary border border-white/5">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-warning fill-warning" />)}
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">"{t.text}"</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {t.name[0]}
            </div>
            <div>
              <p className="text-text-primary text-xs font-semibold">{t.name}</p>
              <p className="text-text-tertiary text-[10px]">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Landing() {
  useWindowTitle('SchoolMS — School Management');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Word-by-word reveal on hero headline
    const heading = document.querySelector('.hero-heading');
    if (!heading) return;
    const text = heading.textContent || '';
    const words = text.split(' ');
    heading.innerHTML = words.map((word, i) =>
      `<span style="display:inline-block;opacity:0;transform:translateY(20px);animation:fadeUp 0.5s ease forwards;animation-delay:${i * 0.08}s">${word}&nbsp;</span>`
    ).join('');
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-bg-primary/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-glow-sm">
            <School size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">
            <span className="text-text-primary">School</span><span className="text-accent">MS</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-text-primary transition-colors">Reviews</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
          <Link to="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 text-center overflow-hidden" ref={heroRef}>
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute top-40 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-[80px]" />
          <div className="absolute top-60 right-1/4 w-48 h-48 bg-success/8 rounded-full blur-[60px]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8 animate-fade-up">
            <Zap size={14} />
            <span>The #1 School Management Platform</span>
          </div>

          {/* Headline */}
          <h1 className="hero-heading display-hero text-text-primary mb-6 animate-fade-up animate-fade-up-delay-1">
            Run your school.<br />
            <span className="gradient-text">Not spreadsheets.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-up animate-fade-up-delay-2">
            SchoolMS is a production-grade SaaS platform for modern schools. Students, attendance, fees, exams, and parent communication — unified.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mt-10 animate-fade-up animate-fade-up-delay-3">
            <Link to="/auth/register" className="btn-primary text-base px-8 py-3.5 shadow-glow">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/auth/login" className="btn-secondary text-base px-8 py-3.5">
              Live Demo
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-6 text-xs text-text-tertiary animate-fade-up">
            No credit card required · Free for up to 100 students · 14-day trial
          </p>
        </div>

        {/* Dashboard preview */}
        <div className="relative z-10 max-w-5xl mx-auto mt-16 animate-fade-up">
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-card-hover">
            {/* Fake browser chrome */}
            <div className="bg-bg-secondary px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 mx-4 bg-bg-tertiary rounded-md px-3 py-1 text-xs text-text-tertiary font-mono">
                app.schoolms.com/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="bg-bg-secondary p-6 min-h-[320px]">
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Students', value: '1,247', color: '#0066FF' },
                  { label: 'Attendance', value: '94.2%', color: '#10B981' },
                  { label: 'Revenue', value: '$48,320', color: '#F59E0B' },
                  { label: 'Teachers', value: '68', color: '#8B5CF6' },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-xl border border-white/5" style={{ background: `${s.color}08` }}>
                    <p className="text-xs text-text-secondary">{s.label}</p>
                    <p className="text-xl font-display font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 rounded-xl border border-white/5 bg-bg-tertiary p-4 h-32">
                  <p className="text-xs text-text-tertiary mb-2">Attendance Trend</p>
                  <div className="flex items-end gap-1 h-16">
                    {[65, 80, 75, 90, 85, 94, 88, 92, 96, 89, 94, 97].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 11 ? '#0066FF' : 'rgba(0,102,255,0.3)' }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-bg-tertiary p-4 h-32 space-y-2">
                  <p className="text-xs text-text-tertiary">Notices</p>
                  {['Exam schedule released', 'Holiday on Friday', 'Fee due reminder'].map(n => (
                    <div key={n} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      <p className="text-[10px] text-text-secondary truncate">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 md:px-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.value}</p>
              <p className="text-text-secondary text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="h2 text-text-primary">Built for modern schools</h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">
              Every feature is production-ready, real-time connected, and designed to save your team hours every week.
            </p>
          </div>

          <div className="bento-grid">
            {features.map((f, i) => (
              <div key={f.title}
                className={`card p-6 animate-fade-up ${f.span || ''}`}
                style={{ animationDelay: `${i * 0.07}s`, background: i % 3 === 0 ? '#111111' : '#1A1A2E' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}18` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-display font-semibold text-text-primary text-lg mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials marquee */}
      <section id="testimonials" className="py-24 overflow-hidden">
        <div className="text-center mb-12 px-6 animate-fade-up">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">Loved by educators</p>
          <h2 className="h2 text-text-primary">What schools say</h2>
        </div>
        <div className="space-y-4">
          <Marquee items={testimonials} />
          <Marquee items={[...testimonials].reverse()} reverse />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">Transparent pricing</p>
            <h2 className="h2 text-text-primary">Simple plans for every school</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: '/forever', desc: 'Perfect to get started', features: ['Up to 100 students', '5 teachers', 'Basic attendance', 'Notice board', 'Email support'], highlight: false },
              { name: 'Pro', price: '$49', period: '/month', desc: 'For growing schools', features: ['Up to 1,000 students', 'Unlimited teachers', 'QR attendance', 'Fee management', 'SMS alerts', 'Priority support', 'Custom branding'], highlight: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'Multi-school & districts', features: ['Unlimited schools', 'Unlimited students', 'SLA guarantee', 'Dedicated support', 'Custom integrations', 'On-premise option'], highlight: false },
            ].map((plan, i) => (
              <div key={plan.name}
                className={`card p-7 animate-fade-up relative ${plan.highlight ? 'border-accent/40 shadow-glow' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-accent text-xs">Most Popular</div>
                )}
                <p className="text-text-secondary text-sm">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="text-4xl font-display font-bold text-text-primary">{plan.price}</span>
                  <span className="text-text-tertiary text-sm">{plan.period}</span>
                </div>
                <p className="text-text-tertiary text-xs mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle size={14} className="text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/register"
                  className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-all ${plan.highlight
                      ? 'bg-accent text-white hover:bg-accent-hover shadow-glow'
                      : 'bg-white/5 text-text-primary hover:bg-white/10 border border-white/10'
                    }`}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-card opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-accent/20 blur-[60px]" />
            <div className="relative z-10">
              <h2 className="h2 text-text-primary mb-4">Ready to modernize your school?</h2>
              <p className="text-text-secondary mb-8">Join 500+ schools already using SchoolMS. Setup takes less than 5 minutes.</p>
              <Link to="/auth/register" className="btn-primary text-base px-10 py-4 shadow-glow inline-flex">
                Start Free Today <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <School size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm">
              <span className="text-text-primary">School</span><span className="text-accent">MS</span>
            </span>
          </div>
          <p className="text-text-tertiary text-xs">© {new Date().getFullYear()} SchoolMS. Built with ❤️ for educators worldwide.</p>
          <div className="flex gap-6 text-xs text-text-tertiary">
            <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-secondary transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
