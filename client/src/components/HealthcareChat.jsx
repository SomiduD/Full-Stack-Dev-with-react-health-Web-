// client/src/components/HealthcareChat.jsx
// Floating AI Healthcare Chatbot — rule-based, no API key required
import { useState, useRef, useEffect } from 'react';

// ─── Knowledge Base ────────────────────────────────────────────────────────────
const KB = [
  { patterns: ['hello','hi','hey','good morning','good afternoon','good evening','vanakkam','ayubowan'],
    response: "Hello! 👋 I'm MedBot, your MedCore healthcare assistant. How can I help you today? You can ask me about appointments, symptoms, medications, emergency contacts, or hospital services." },
  { patterns: ['appointment','book','schedule','reserve','fix appointment'],
    response: "📅 **Booking an Appointment**\nGo to the **Appointments** tab in your Patient Dashboard. You can select a doctor, choose a date and time slot, and confirm your booking. The doctor will receive a notification immediately." },
  { patterns: ['cancel appointment','reschedule'],
    response: "🔄 **Cancelling/Rescheduling**\nOpen the **Appointments** tab, find your appointment card, and click **Cancel**. To reschedule, cancel the current one and book a new slot." },
  { patterns: ['emergency','urgent','help','sos','critical'],
    response: "🚨 **Emergency Contacts — Sri Lanka**\n• **Suwa Seriya Ambulance**: 1990 (Free)\n• **Police Emergency**: 119\n• **Fire & Rescue**: 110\n• **Accident Service Colombo**: +94 11 269 1111\n\nFor an ambulance, go to the **🚑 Ambulance** tab in your dashboard and click **Request Ambulance** for fastest response." },
  { patterns: ['ambulance','ambulance request','call ambulance','need ambulance'],
    response: "🚑 **Requesting an Ambulance**\nGo to the **Ambulance** tab in your Patient Dashboard and click **Request Emergency Ambulance**. The system will alert Nawaloka Hospital dispatch immediately. ETA is typically 7–12 minutes.\n\nAlternatively, call **1990** (Suwa Seriya — 24/7, free)." },
  { patterns: ['fever','temperature','hot','chills'],
    response: "🌡️ **Fever Guidance**\n• Low grade (37–38°C): Rest, hydrate, paracetamol if uncomfortable\n• High (38–39°C): See a doctor within 24 hours\n• Very high (>39°C) or >3 days: **Seek immediate medical care**\n• Children under 3 months with fever: **Go to A&E immediately**\n\n⚠️ *This is general guidance, not medical advice.*" },
  { patterns: ['headache','head pain','migraine'],
    response: "🤕 **Headache Guidance**\n• **Tension headache**: Rest, hydrate, paracetamol/ibuprofen\n• **Migraine**: Dark/quiet room, triptan medication if prescribed\n• ⚠️ Seek emergency care if headache is: sudden & severe (thunderclap), with fever/stiff neck, after head injury, or with vision changes/weakness" },
  { patterns: ['chest pain','chest tightness','heart attack','cardiac'],
    response: "💔 **Chest Pain — Act Immediately**\nChest pain can indicate a **heart attack**. Call **1990** now.\n\nWhile waiting: sit upright, loosen tight clothing, chew aspirin (300mg) if not allergic.\n\n⚠️ Do NOT drive yourself. Call for help immediately." },
  { patterns: ['blood pressure','hypertension','bp','high blood pressure'],
    response: "❤️ **Blood Pressure**\n• Normal: < 120/80 mmHg\n• Elevated: 120–129/<80\n• Stage 1 High: 130–139/80–89\n• Stage 2 High: ≥140/≥90\n• Crisis (call 1990): >180/120\n\nBook an appointment with our Cardiology team for a proper evaluation." },
  { patterns: ['diabetes','blood sugar','sugar','glucose'],
    response: "🩸 **Diabetes & Blood Sugar**\n• Fasting normal: 70–99 mg/dL\n• Pre-diabetes: 100–125 mg/dL\n• Diabetes: ≥126 mg/dL\n\nSymptoms of low blood sugar: shaking, sweating, confusion — eat sugar immediately.\nFor HbA1c testing, visit our Lab Services." },
  { patterns: ['prescription','medicine','medication','tablet','drug'],
    response: "💊 **Prescriptions**\nYour active prescriptions are visible in the **Prescriptions** tab of your Patient Dashboard. Contact your doctor via the Appointments tab if you need a refill or have questions about a medication." },
  { patterns: ['visiting hours','visit','visiting time'],
    response: "🏥 **Nawaloka Hospital Visiting Hours**\n• General Wards: 4:00 PM – 6:00 PM daily\n• ICU/NICU: 10:00 AM – 11:00 AM & 4:00 PM – 5:00 PM\n• Maternity: Partner/immediate family anytime\n• Special visits: Contact reception at +94 11 254 4444" },
  { patterns: ['location','address','where is','how to get','directions','map'],
    response: "📍 **Nawaloka General Hospital**\n23 Deshamanya H. K. Dharmadasa Mw, Colombo 2, Sri Lanka\n\n🗺️ Check the **Hospitals Map** tab to see our location and get directions via Google Maps.\n📞 +94 11 254 4444" },
  { patterns: ['covid','coronavirus','covid-19','vaccination','vaccine'],
    response: "💉 **COVID-19 & Vaccination**\nVaccination records are stored in your **Health Vault** under vaccinations. If you need a COVID test or booster, please book an appointment with General Medicine." },
  { patterns: ['dengue','dengue fever'],
    response: "🦟 **Dengue Fever**\nSymptoms: High fever, severe headache, pain behind eyes, joint/muscle pain, rash.\n\nImportant: Stay hydrated, monitor platelet count daily, avoid aspirin/ibuprofen (use paracetamol only).\n\n⚠️ If fever persists >3 days or you develop bleeding/severe abdominal pain — **Go to A&E**." },
  { patterns: ['health record','medical record','report','lab result'],
    response: "📋 **Health Records**\nAll your lab results, imaging reports, discharge summaries, and vaccination records are in the **Health Vault** tab. You can filter by type and download individual records." },
  { patterns: ['doctor','specialist','physician','who should i see'],
    response: "👨‍⚕️ **Our Specialists at Nawaloka**\n• **Dr. Kasun Dissanayake** — Cardiology\n• **Dr. Amali Perera** — Paediatrics\n• **Dr. Ruwan Fernando** — General Medicine\n\nBook via the **Appointments** tab. Select the specialist most relevant to your concern." },
  { patterns: ['cost','fee','price','charge','payment','bill'],
    response: "💰 **Consultation Fees (approximate)**\n• General Practitioner: LKR 1,000–1,500\n• Specialist Consultation: LKR 2,000–4,000\n• Emergency A&E: LKR 500 registration + treatment\n• Lab tests vary — enquire at reception.\n\nWe accept cash, cards, and major insurance (AIA, Ceylinco, Union Assurance)." },
  { patterns: ['insurance','claim','coverage'],
    response: "📄 **Insurance**\nWe work with: AIA, Ceylinco Life, Union Assurance, Softlogic Life, and government NHDA.\n\nBring your insurance card on the day of your visit. Pre-authorization letters can be arranged for planned admissions." },
  { patterns: ['password','login','cannot login','access'],
    response: "🔐 **Login Issues**\nIf you cannot log in:\n1. Ensure you're on the correct portal (Patient/Doctor)\n2. Use the exact email you registered with\n3. If your doctor account shows 'Pending' — you are awaiting Super Admin verification (1–2 business days)\n4. Use **Forgot Password** on the login page to reset" },
  { patterns: ['thank','thanks','thank you','thx','appreciate'],
    response: "😊 You're welcome! Is there anything else I can help you with? For urgent medical needs, please call **1990** or visit your nearest A&E." },
  { patterns: ['bye','goodbye','exit','close'],
    response: "👋 Take care and stay healthy! Remember, for emergencies always call **1990**. Have a great day!" },
];

const findResponse = (input) => {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.response;
    }
  }
  return "🤔 I'm not sure about that. You can ask me about:\n• Appointments & booking\n• Symptoms & first aid\n• Emergency contacts\n• Hospital services & location\n• Health records & prescriptions\n\nOr call **1990** for a medical emergency.";
};

// ─── Markdown-like formatter ───────────────────────────────────────────────────
const formatMsg = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <span key={i} dangerouslySetInnerHTML={{ __html: bold + (i < lines.length - 1 ? '<br/>' : '') }} />;
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
const HealthcareChat = () => {
  const [open,     setOpen]     = useState(false);
  const [msgs,     setMsgs]     = useState([
    { id: 1, from: 'bot', text: "👋 Hi! I'm **MedBot**, your healthcare assistant.\n\nAsk me about appointments, symptoms, medications, emergencies, or hospital info!", time: new Date() },
  ]);
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const [unread,   setUnread]   = useState(0);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), from: 'user', text, time: new Date() };
    setMsgs((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = findResponse(text);
      setTyping(false);
      setMsgs((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: reply, time: new Date() }]);
      if (!open) setUnread((n) => n + 1);
    }, 900 + Math.random() * 600);
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const fmtTime = (d) => d.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });

  const quickPrompts = ['Book appointment', 'Emergency contacts', 'Ambulance request', 'Hospital location'];

  return (
    <>
      {/* ── Floating button ── */}
      <button
        id="chatbot-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open healthcare chatbot"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #00d4ff, #0080ff)',
          boxShadow: '0 4px 20px rgba(0,212,255,0.45)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: open ? 'rotate(45deg) scale(1.05)' : 'scale(1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = open ? 'rotate(45deg) scale(1.12)' : 'scale(1.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = open ? 'rotate(45deg) scale(1.05)' : 'scale(1)'; }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 20, height: 20,
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          id="chatbot-panel"
          style={{
            position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(520px, calc(100svh - 140px))',
            background: 'var(--bg-secondary, #0f1117)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s ease both',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,128,255,0.1))',
            borderBottom: '1px solid rgba(0,212,255,0.15)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d4ff, #0080ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
            }}>🏥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary, #fff)' }}>MedBot</div>
              <div style={{ fontSize: '0.72rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Online · Healthcare AI
              </div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted, #666)', background: 'rgba(0,212,255,0.1)', padding: '2px 8px', borderRadius: 20 }}>
              🇱🇰 Sri Lanka
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                {msg.from === 'bot' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0080ff)', display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'0.8rem' }}>🏥</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, #00d4ff, #0080ff)'
                    : 'var(--bg-elevated, #1a1d24)',
                  color: msg.from === 'user' ? '#fff' : 'var(--text-primary, #e2e8f0)',
                  borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 13px',
                  fontSize: '0.83rem',
                  lineHeight: 1.55,
                  border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  {formatMsg(msg.text)}
                  <div style={{ fontSize: '0.65rem', opacity: 0.55, marginTop: 4, textAlign: msg.from === 'user' ? 'right' : 'left' }}>
                    {fmtTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0080ff)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem' }}>🏥</div>
                <div style={{ background: 'var(--bg-elevated,#1a1d24)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px', padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map((i) => (
                      <span key={i} style={{ width: 6, height: 6, background: '#00d4ff', borderRadius: '50%', display:'inline-block', animation:`bounce 1.2s ${i*0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: '6px 14px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {quickPrompts.map((q) => (
              <button key={q} onClick={() => { setInput(q); setTimeout(send, 10); }}
                style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)', color: '#00d4ff', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; }}
              >{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px 14px', display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask a health question…"
              id="chatbot-input"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 24,
                border: '1px solid rgba(0,212,255,0.25)', outline: 'none',
                background: 'var(--bg-elevated,#1a1d24)',
                color: 'var(--text-primary,#e2e8f0)',
                fontSize: '0.85rem',
              }}
            />
            <button
              id="chatbot-send"
              onClick={send}
              disabled={!input.trim()}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: 'none',
                background: input.trim() ? 'linear-gradient(135deg,#00d4ff,#0080ff)' : 'var(--bg-elevated,#1a1d24)',
                color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default HealthcareChat;
