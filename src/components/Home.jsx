import { useState, useEffect, useRef, useCallback } from 'react';

const LANGUAGES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese',
  ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi',
  tr: 'Turkish', nl: 'Dutch', pl: 'Polish', sv: 'Swedish',
  da: 'Danish', fi: 'Finnish', no: 'Norwegian', he: 'Hebrew',
  th: 'Thai', vi: 'Vietnamese',
};

const VOICE_LANGS = {
  en:'en-US', es:'es-ES', fr:'fr-FR', de:'de-DE', it:'it-IT',
  pt:'pt-PT', ru:'ru-RU', ja:'ja-JP', ko:'ko-KR', zh:'zh-CN',
  ar:'ar-EG', hi:'hi-IN', tr:'tr-TR', nl:'nl-NL', pl:'pl-PL',
  sv:'sv-SE', da:'da-DK', fi:'fi-FI', no:'no-NO', he:'he-IL',
  th:'th-TH', vi:'vi-VN',
};

const FEATURES = [
  { icon: '🌐', title: '22 Languages', desc: 'Covering major global languages with native accuracy' },
  { icon: '🎙️', title: 'Voice Input', desc: 'Speak naturally, translate instantly' },
  { icon: '🔊', title: 'Text-to-Speech', desc: 'Hear proper pronunciation in any language' },
  { icon: '⚡', title: 'Real-time', desc: 'Instant debounced translation as you type' },
];

export default function App() {
  // ─── theme (class on <html>) ───────────────────────────────────
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('lf-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('lf-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // ─── translator state ──────────────────────────────────────────
  const [srcText, setSrcText] = useState('');
  const [tgtText, setTgtText] = useState('');
  const [srcLang, setSrcLang] = useState('en');
  const [tgtLang, setTgtLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingSrc, setSpeakingSrc] = useState(false);
  const [speakingTgt, setSpeakingTgt] = useState(false);
  const [voiceOK, setVoiceOK] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const recogRef = useRef(null);

  // ─── scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ─── speech recognition ───────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceOK(false); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = VOICE_LANGS[srcLang] || 'en-US';
    r.onresult = e => { setSrcText(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
    return () => { r.abort(); };
  }, [srcLang]);

  // ─── translation ──────────────────────────────────────────────
  const translate = useCallback(async (text, from, to) => {
    if (!text.trim()) { setTgtText(''); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
      );
      const data = await res.json();
      const raw = data?.responseData?.translatedText || 'Translation unavailable';
      setTgtText(raw.replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
    } catch {
      setTgtText('Error — please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (srcText) translate(srcText, srcLang, tgtLang);
      else setTgtText('');
    }, 500);
    return () => clearTimeout(id);
  }, [srcText, srcLang, tgtLang, translate]);

  // ─── voice input ──────────────────────────────────────────────
  const handleVoice = () => {
    const r = recogRef.current;
    if (!r) return;
    if (listening) { r.stop(); return; }
    window.speechSynthesis.cancel();
    r.lang = VOICE_LANGS[srcLang] || 'en-US';
    r.start();
    setListening(true);
  };

  // ─── TTS ──────────────────────────────────────────────────────
  const speak = (text, lang, isSrc) => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    setSpeakingSrc(false); setSpeakingTgt(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANGS[lang] || 'en-US';
    u.rate = 0.9;
    const setOn = isSrc ? setSpeakingSrc : setSpeakingTgt;
    u.onstart = () => setOn(true);
    u.onend = () => setOn(false);
    u.onerror = () => setOn(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    setSpeakingSrc(false); setSpeakingTgt(false);
  };

  // ─── swap ─────────────────────────────────────────────────────
  const swap = () => {
    stopSpeak();
    setSrcLang(tgtLang); setTgtLang(srcLang);
    setSrcText(tgtText); setTgtText(srcText);
  };

  // ─── copy ─────────────────────────────────────────────────────
  const copy = async () => {
    await navigator.clipboard.writeText(tgtText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── inline styles (Tailwind-free, avoids build dependency) ───
  const s = {
    // layout shells
    app: {
      minHeight: '100vh',
      background: dark ? '#0e1117' : '#f5f7fa',
      color: dark ? '#e8eaf0' : '#1a1d23',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      transition: 'background 0.3s, color 0.3s',
    },
    nav: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled
        ? (dark ? 'rgba(14,17,23,0.85)' : 'rgba(245,247,250,0.85)')
        : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? `1px solid ${dark ? '#1f2533' : '#dde1ea'}` : 'none',
      transition: 'all 0.3s',
    },
    navInner: {
      maxWidth: 1100, margin: '0 auto', padding: '0 24px',
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    logo: { display: 'flex', alignItems: 'center', gap: 12 },
    logoIcon: {
      width: 40, height: 40, borderRadius: 12,
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20,
    },
    logoText: { fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' },
    logoSub: { fontSize: 11, color: dark ? '#6b7488' : '#8891a5', marginTop: -2 },
    themeBtn: {
      padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
      background: dark ? '#1a1f2e' : '#e8ecf4',
      color: dark ? '#a0a8bc' : '#4a5068', fontSize: 18,
      transition: 'background 0.2s',
    },
    hero: {
      paddingTop: 100, paddingBottom: 32, textAlign: 'center', padding: '100px 24px 32px',
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: 800, letterSpacing: '-0.04em',
      lineHeight: 1.1, marginBottom: 16,
      background: dark
        ? 'linear-gradient(135deg, #fff 0%, #86efac 50%, #fff 100%)'
        : 'linear-gradient(135deg, #111 0%, #16a34a 50%, #111 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    heroSub: {
      fontSize: 17, color: dark ? '#8891a5' : '#5a6174',
      maxWidth: 520, margin: '0 auto',
    },
    card: {
      maxWidth: 920, margin: '0 auto 48px',
      background: dark ? '#141926' : '#ffffff',
      borderRadius: 20,
      border: `1px solid ${dark ? '#1f2940' : '#dde1ea'}`,
      overflow: 'hidden',
      boxShadow: dark
        ? '0 32px 64px rgba(0,0,0,0.5)'
        : '0 8px 48px rgba(0,0,0,0.08)',
    },
    langRow: {
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '20px 24px',
      borderBottom: `1px solid ${dark ? '#1f2940' : '#dde1ea'}`,
      flexWrap: 'wrap',
    },
    langGroup: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 140 },
    label: { fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: dark ? '#4d5770' : '#9098b0' },
    select: {
      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
      background: dark ? '#0e1117' : '#f0f3f9',
      border: `1px solid ${dark ? '#1f2940' : '#dde1ea'}`,
      color: dark ? '#e8eaf0' : '#1a1d23',
      fontSize: 14, fontWeight: 500, outline: 'none',
      appearance: 'none',
    },
    swapBtn: {
      width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
      background: dark ? '#1a1f2e' : '#e8ecf4',
      color: dark ? '#6b7488' : '#4a5068',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, flexShrink: 0, transition: 'background 0.2s, transform 0.2s',
      marginTop: 18,
    },
    panels: { display: 'grid', gridTemplateColumns: '1fr 1fr' },
    panel: { padding: '20px 24px', position: 'relative' },
    panelRight: {
      padding: '20px 24px', position: 'relative',
      background: dark ? '#0f141e' : '#f7faf5',
      borderLeft: `1px solid ${dark ? '#1f2940' : '#dde1ea'}`,
    },
    textarea: {
      width: '100%', height: 180, padding: 14, boxSizing: 'border-box',
      borderRadius: 12, resize: 'none', outline: 'none',
      background: dark ? '#0e1117' : '#f0f3f9',
      border: `1px solid ${dark ? '#1f2940' : '#dde1ea'}`,
      color: dark ? '#e8eaf0' : '#1a1d23',
      fontSize: 15, lineHeight: 1.6,
      fontFamily: 'inherit',
      transition: 'border-color 0.2s',
    },
    textareaRO: {
      width: '100%', height: 180, padding: 14, boxSizing: 'border-box',
      borderRadius: 12, resize: 'none', outline: 'none',
      background: 'transparent', border: 'none',
      color: dark ? '#86efac' : '#166534',
      fontSize: 15, lineHeight: 1.6,
      fontFamily: 'inherit', fontWeight: 500,
    },
    toolRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 10,
    },
    charCount: { fontSize: 12, color: dark ? '#4d5770' : '#9098b0' },
    iconRow: { display: 'flex', gap: 6 },
    iconBtn: (active, danger) => ({
      width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      background: active
        ? (danger ? '#ef4444' : '#22c55e')
        : (dark ? '#1a1f2e' : '#e8ecf4'),
      color: active ? '#fff' : (dark ? '#6b7488' : '#4a5068'),
      transition: 'all 0.15s',
    }),
    loadOverlay: {
      position: 'absolute', inset: 0, borderRadius: 12,
      background: dark ? 'rgba(14,17,23,0.6)' : 'rgba(255,255,255,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    spinner: {
      width: 28, height: 28, borderRadius: '50%',
      border: '3px solid transparent',
      borderTop: '3px solid #22c55e',
      animation: 'spin 0.7s linear infinite',
    },
    tgtLang: { fontSize: 12, fontWeight: 700, color: '#22c55e', letterSpacing: '0.05em', textTransform: 'uppercase' },
    features: {
      padding: '48px 24px',
      background: dark ? '#0a0d14' : '#eef1f8',
    },
    featTitle: {
      textAlign: 'center', fontSize: 28, fontWeight: 800,
      letterSpacing: '-0.03em', marginBottom: 8,
    },
    featSub: { textAlign: 'center', color: dark ? '#6b7488' : '#6b7488', marginBottom: 32 },
    featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, maxWidth: 900, margin: '0 auto' },
    featCard: {
      background: dark ? '#141926' : '#ffffff',
      border: `1px solid ${dark ? '#1f2940' : '#dde1ea'}`,
      borderRadius: 16, padding: '24px 20px', textAlign: 'center',
    },
    featIcon: { fontSize: 32, marginBottom: 12 },
    featName: { fontWeight: 700, fontSize: 15, marginBottom: 6 },
    featDesc: { fontSize: 13, color: dark ? '#6b7488' : '#8891a5', lineHeight: 1.5 },
    toast: {
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: '#22c55e', color: '#fff',
      padding: '10px 20px', borderRadius: 100,
      fontSize: 14, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
      animation: 'fadeUp 0.25s ease',
      zIndex: 100,
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        select option { background: ${dark ? '#0e1117' : '#ffffff'}; }
        textarea::placeholder { color: ${dark ? '#3a4058' : '#b0b8cc'}; }
        textarea:focus { border-color: #22c55e !important; }
        @media (max-width: 640px) {
          .panels { grid-template-columns: 1fr !important; }
          .panel-right { border-left: none !important; border-top: 1px solid ${dark ? '#1f2940' : '#dde1ea'}; }
          .lang-row { flex-direction: column; }
          .swap-btn { margin-top: 0 !important; }
        }
      `}</style>

      <div style={s.app}>
        {/* NAV */}
        <nav style={s.nav}>
          <div style={s.navInner}>
            <div style={s.logo}>
              <div style={s.logoIcon}>🌍</div>
              <div>
                <div style={s.logoText}>LinguaFlow</div>
                <div style={s.logoSub}>AI Translator</div>
              </div>
            </div>
            <button style={s.themeBtn} onClick={() => setDark(d => !d)}>
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={s.hero}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h1 className='text-green-600 text-4xl font-bold'>Break Language Barriers</h1>
            <p style={s.heroSub}>Real-time AI translation with voice synthesis. Speak, type, and listen in 22+ languages.</p>
          </div>
        </section>

        {/* TRANSLATOR CARD */}
        <section style={{ padding: '0 24px 48px' }}>
          <div style={s.card}>
            {/* Language row */}
            <div style={s.langRow} className="lang-row">
              <div style={s.langGroup}>
                <span style={s.label}>From</span>
                <select style={s.select} value={srcLang} onChange={e => setSrcLang(e.target.value)}>
                  {Object.entries(LANGUAGES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                </select>
              </div>
              <button
                style={s.swapBtn}
                className="swap-btn"
                onClick={swap}
                title="Swap languages"
              >⇄</button>
              <div style={s.langGroup}>
                <span style={s.label}>To</span>
                <select style={s.select} value={tgtLang} onChange={e => setTgtLang(e.target.value)}>
                  {Object.entries(LANGUAGES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Text panels */}
            <div style={s.panels} className="panels">
              {/* Source */}
              <div style={s.panel}>
                <textarea
                  style={s.textarea}
                  value={srcText}
                  onChange={e => setSrcText(e.target.value)}
                  placeholder={`Type in ${LANGUAGES[srcLang]}…`}
                />
                <div style={s.toolRow}>
                  <span style={s.charCount}>{srcText.length} chars</span>
                  <div style={s.iconRow}>
                    {voiceOK && (
                      <button
                        style={s.iconBtn(listening, true)}
                        onClick={handleVoice}
                        title={listening ? 'Stop listening' : 'Voice input'}
                      >{listening ? '⏹' : '🎙'}</button>
                    )}
                    <button
                      style={s.iconBtn(speakingSrc, false)}
                      onClick={() => speakingSrc ? stopSpeak() : speak(srcText, srcLang, true)}
                      disabled={!srcText}
                      title="Listen"
                    >{speakingSrc ? '🔇' : '🔊'}</button>
                    <button
                      style={s.iconBtn(false, false)}
                      onClick={() => setSrcText('')}
                      title="Clear"
                    >✕</button>
                  </div>
                </div>
              </div>

              {/* Target */}
              <div style={s.panelRight} className="panel-right">
                <div style={{ position: 'relative' }}>
                  <textarea
                    style={s.textareaRO}
                    value={tgtText}
                    readOnly
                    placeholder="Translation appears here…"
                  />
                  {loading && (
                    <div style={s.loadOverlay}>
                      <div style={s.spinner} />
                    </div>
                  )}
                </div>
                <div style={s.toolRow}>
                  <span style={s.tgtLang}>{LANGUAGES[tgtLang]}</span>
                  <div style={s.iconRow}>
                    <button
                      style={s.iconBtn(speakingTgt, false)}
                      onClick={() => speakingTgt ? stopSpeak() : speak(tgtText, tgtLang, false)}
                      disabled={!tgtText}
                      title="Listen"
                    >{speakingTgt ? '🔇' : '🔊'}</button>
                    <button
                      style={s.iconBtn(copied, false)}
                      onClick={copy}
                      disabled={!tgtText}
                      title="Copy"
                    >{copied ? '✓' : '⧉'}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={s.features}>
          <h2 style={s.featTitle}>Powerful Features</h2>
          <p style={s.featSub}>Everything you need for seamless cross-language communication</p>
          <div style={s.featGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} style={s.featCard}>
                <div style={s.featIcon}>{f.icon}</div>
                <div style={s.featName}>{f.title}</div>
                <div style={s.featDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TOAST */}
        {copied && (
          <div style={s.toast}>
            <span>✓</span> Copied to clipboard!
          </div>
        )}
      </div>
    </>
  );
}