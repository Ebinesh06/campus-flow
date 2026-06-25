import React, { useState, useRef, useEffect } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import AttendanceForm from "../components/AttendanceForm";
import AIAssistant from "../components/AIAssistant";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "attendance", label: "Attendance", icon: "📊" },
  { id: "tasks", label: "Tasks", icon: "📋" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Browser history navigation ─────────────────────────────────────────
  const navigateTo = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ tab }, "", `/${tab}`);
  };

  useEffect(() => {
    // Set initial history state
    const currentTab = activeTab;
    window.history.replaceState({ tab: currentTab }, "", `/${currentTab}`);

    const onPop = (e) => {
      const tab = e.state?.tab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── Theme ──────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(true);

  // ── Mood ───────────────────────────────────────────────────────────────
  const [mood, setMood] = useState(null);
  const [showMoodPicker, setShowMoodPicker] = useState(true);
  const [moodCelebration, setMoodCelebration] = useState(null); // { moodId, quote }
  const [screenShake, setScreenShake] = useState(false);

  // ── Settings state ─────────────────────────────────────────────────────
  const defaultName = user?.email?.split("@")[0] || "Student";
  const [displayName, setDisplayName] = useState(defaultName);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);
  const [profilePic, setProfilePic] = useState(null); // base64 or null
  const [phone, setPhone]         = useState(user?.phone || "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(user?.phone || "");
  const fileInputRef = useRef(null);

  const avatar = displayName[0]?.toUpperCase() || "S";

  const handleMoodSelect = (moodId) => {
    const quotes = MOOD_QUOTES[moodId];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setMood(moodId);
    setShowMoodPicker(false);
    setScreenShake(true);
    setMoodCelebration({ moodId, quote });
    setTimeout(() => setScreenShake(false), 600);
    setTimeout(() => setMoodCelebration(null), 4000);
  };



  const handleTaskCreated = (task) => setTasks((prev) => [task, ...prev]);

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 86400000);
  const dueSoon = tasks.filter((t) => new Date(t.deadline) <= weekFromNow).length;

  // ── Theme colours (mood overrides dark/light) ──────────────────────────
  const moodTheme = mood ? MOOD_THEMES[mood] : null;
  const t = moodTheme ? (darkMode ? moodTheme.dark : moodTheme.light) : (darkMode ? DARK : LIGHT);
  const accent = moodTheme ? moodTheme.accent : "#2563EB";

  // ── Profile pic upload ─────────────────────────────────────────────────
  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.pageBg, fontFamily: "'Inter', sans-serif", transition: "background 0.5s" }} className={screenShake ? "screen-shake" : ""}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 240 : 70,
        background: "#1E293B",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          {sidebarOpen && (
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", whiteSpace: "nowrap", animation: "fadeIn 0.2s ease" }}>
              CampusFlow
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeTab === item.id ? `${accent}33` : "transparent",
                borderLeft: activeTab === item.id ? `3px solid ${accent}` : "3px solid transparent",
                transition: "all 0.2s ease",
                color: activeTab === item.id ? "#fff" : "rgba(255,255,255,0.55)",
                fontWeight: activeTab === item.id ? 600 : 400,
                fontSize: 14, whiteSpace: "nowrap", width: "100%", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ animation: "fadeIn 0.2s ease" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User + Collapse */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", marginBottom: 10, animation: "fadeIn 0.2s ease" }}>
              {/* avatar or pic */}
              {profilePic
                ? <img src={profilePic} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent, color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{avatar}</div>
              }
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Student</div>
              </div>
              <button onClick={onLogout} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }} title="Logout">↩</button>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: "100%", padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16, transition: "background 0.2s" }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: "auto", transition: "background 0.3s" }}>
        {/* Top bar */}
        <div style={{ background: t.cardBg, borderBottom: `1px solid ${t.border}`, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20, transition: "background 0.3s, border-color 0.3s" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: t.textPrimary, margin: 0 }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.icon} {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mood chip */}
            {mood && (
              <button onClick={() => setShowMoodPicker(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:999, border:`1.5px solid ${accent}44`, background:`${accent}12`, cursor:"pointer", transition:"all 0.2s" }}
                title="Change mood">
                <span style={{ fontSize:18 }}>{MOODS.find(m=>m.id===mood)?.emoji}</span>
                <span style={{ fontSize:12, fontWeight:700, color:accent }}>{MOODS.find(m=>m.id===mood)?.label}</span>
              </button>
            )}
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>🔔</div>
              {dueSoon > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{dueSoon}</div>}
            </div>
            {/* Profile photo */}
            <button onClick={() => mood ? handleMoodSelect(mood) : setShowMoodPicker(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, flexShrink:0, position:"relative" }} title="Click for motivation!">
              {profilePic
                ? <img src={profilePic} alt="profile" style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", border:`2px solid ${accent}`, transition:"transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)"; e.currentTarget.style.boxShadow=`0 0 0 3px ${accent}44`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="none";}}
                  />
                : <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${accent},${accent}99)`, color:"#fff", fontWeight:800, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${accent}`, transition:"transform 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                  >{avatar}</div>
              }
              <div style={{ position:"absolute", bottom:-2, right:-2, fontSize:9, background:accent, color:"#fff", borderRadius:99, padding:"1px 4px", fontWeight:700, pointerEvents:"none" }}>✨</div>
            </button>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          {/* ── Dashboard Tab ─────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div style={{ animation: "slideUp 0.4s ease" }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: t.textPrimary, margin: "0 0 4px" }}>
                  Good {getTimeOfDay()}, {displayName} 👋
                </h2>
                <p style={{ color: t.textMuted, fontSize: 14, margin: 0 }}>Here's your academic snapshot for today.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <StatCard icon="📊" label="Attendance" value="--%" sub="Overall average" color="#10B981" bg="#ECFDF5" t={t} />
                <StatCard icon="⏰" label="Deadlines" value={dueSoon} sub="Due this week" color="#F59E0B" bg="#FFFBEB" t={t} />
              </div>

              <div style={{ marginBottom: 20, background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden", animation: "slideUp 0.5s ease", transition: "background 0.3s" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
                    <div>
                      <div style={{ fontWeight: 700, color: t.textPrimary, fontSize: 15 }}>Today's Tasks</div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>{tasks.length} total tasks</div>
                    </div>
                  </div>
                  <button onClick={() => navigateTo("tasks")} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Task</button>
                </div>
                <TaskList tasks={tasks} compact />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden", animation: "slideUp 0.6s ease", transition: "background 0.3s" }}>
                  <div style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>🧠</span>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>AI Planner</div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>RAG · Groq powered</div>
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <AIAssistant compact />
                  </div>
                </div>

                <div style={{ borderRadius: 16, overflow: "hidden", animation: "slideUp 0.7s ease" }}>
                  <DashMiniFloral tasks={tasks} t={t} onOpenCalendar={() => navigateTo("calendar")} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <AttendancePage t={t} accent={accent} />
          )}

          {activeTab === "tasks" && (
            <TasksPage tasks={tasks} setTasks={setTasks} t={t} accent={accent} />
          )}

          {activeTab === "calendar" && (
            <div style={{ animation: "slideUp 0.4s ease" }}>
              <FloralCalendar t={t} tasks={tasks} setTasks={setTasks} />
            </div>
          )}

          {/* ── Settings Tab ──────────────────────────────────── */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: 520, animation: "slideUp 0.4s ease" }}>
              <div style={{ background: t.cardBg, borderRadius: 20, border: `1px solid ${t.border}`, overflow: "hidden", transition: "background 0.3s" }}>

                {/* Header */}
                <div style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)", padding: "28px 28px 60px" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>⚙️ Settings</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>Manage your profile &amp; preferences</div>
                </div>

                {/* Avatar overlapping header */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -48, padding: "0 28px 28px" }}>
                  {/* Profile picture */}
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    {profilePic
                      ? <img src={profilePic} alt="Profile" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: `4px solid ${t.cardBg}`, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }} />
                      : (
                        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#7C3AED)", border: `4px solid ${t.cardBg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#fff", fontWeight: 800, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                          {avatar}
                        </div>
                      )
                    }
                    {/* Camera button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{ position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: "50%", background: "#2563EB", border: "2px solid #fff", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Change photo"
                    >📷</button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePicChange} />
                  </div>

                  {/* Username edit */}
                  <div style={{ width: "100%", marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Display Name</label>
                    {editingName ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid #2563EB`, background: t.inputBg, color: t.textPrimary, fontSize: 14, outline: "none", transition: "background 0.3s" }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { setDisplayName(tempName); setEditingName(false); }
                            if (e.key === "Escape") { setTempName(displayName); setEditingName(false); }
                          }}
                        />
                        <button onClick={() => { setDisplayName(tempName); setEditingName(false); }} style={{ padding: "10px 16px", borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Save</button>
                        <button onClick={() => { setTempName(displayName); setEditingName(false); }} style={{ padding: "10px 14px", borderRadius: 10, background: t.iconBg, color: t.textMuted, border: "none", cursor: "pointer", fontSize: 13 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, transition: "background 0.3s" }}>
                        <span style={{ flex: 1, color: t.textPrimary, fontSize: 14, fontWeight: 500 }}>{displayName}</span>
                        <button onClick={() => { setTempName(displayName); setEditingName(true); }} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "2px 6px", borderRadius: 6 }}>✏️ Edit</button>
                      </div>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div style={{ width: "100%", marginBottom: 28 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Email</label>
                    <div style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.textMuted, fontSize: 14, transition: "background 0.3s" }}>
                      {user?.email || "student@example.com"}
                    </div>
                  </div>


                  {/* Phone number */}
                  <div style={{ width: "100%", marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>📱 Phone Number</label>
                    {editingPhone ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid #2563EB`, background: t.inputBg, color: t.textPrimary, fontSize: 14, outline: "none", transition: "background 0.3s" }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { setPhone(tempPhone); setEditingPhone(false); }
                            if (e.key === "Escape") { setTempPhone(phone); setEditingPhone(false); }
                          }}
                        />
                        <button onClick={() => { setPhone(tempPhone); setEditingPhone(false); }} style={{ padding: "10px 16px", borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Save</button>
                        <button onClick={() => { setTempPhone(phone); setEditingPhone(false); }} style={{ padding: "10px 14px", borderRadius: 10, background: t.iconBg, color: t.textMuted, border: "none", cursor: "pointer", fontSize: 13 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, transition: "background 0.3s" }}>
                        <span style={{ flex: 1, color: phone ? t.textPrimary : t.textMuted, fontSize: 14, fontWeight: 500 }}>{phone || "Not set — add for WhatsApp reminders"}</span>
                        <button onClick={() => { setTempPhone(phone); setEditingPhone(true); }} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "2px 6px", borderRadius: 6 }}>✏️ {phone ? "Edit" : "Add"}</button>
                      </div>
                    )}
                    {phone && (
                      <div style={{ fontSize: 11, color: "#10B981", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                        ✅ WhatsApp reminders enabled
                      </div>
                    )}
                    {!phone && (
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 5 }}>
                        Add your number to receive WhatsApp deadline reminders
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div style={{ width: "100%", height: 1, background: t.border, marginBottom: 24 }} />

                  {/* Theme toggle */}
                  <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 14, border: `1.5px solid ${t.border}`, background: t.inputBg, transition: "background 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{darkMode ? "🌙" : "☀️"}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{darkMode ? "Dark Mode" : "Light Mode"}</div>
                        <div style={{ fontSize: 12, color: t.textMuted }}>Switch to {darkMode ? "light" : "dark"} theme</div>
                      </div>
                    </div>
                    {/* Toggle switch */}
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      style={{
                        width: 52, height: 28, borderRadius: 14,
                        background: darkMode ? accent : "#CBD5E1",
                        border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0,
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", background: "#fff",
                        position: "absolute", top: 3,
                        left: darkMode ? 27 : 3,
                        transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      }} />
                    </button>
                  </div>

                  {/* Mood selector in settings */}
                  <div style={{ width:"100%", marginTop:16 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:10 }}>Current Mood</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                      {MOODS.map(m => (
                        <button key={m.id} onClick={() => setMood(m.id)} style={{
                          display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 6px",
                          borderRadius:12, border: mood===m.id ? `2px solid ${m.accent}` : `1.5px solid ${t.border}`,
                          background: mood===m.id ? `${m.accent}18` : t.inputBg,
                          cursor:"pointer", transition:"all 0.2s", fontFamily:"'Inter',sans-serif",
                        }}>
                          <span style={{ fontSize:22 }}>{m.emoji}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:m.accent }}>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logout */}
                  <div style={{ width: "100%", marginTop: 20 }}>
                    <button
                      onClick={onLogout}
                      style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#EF4444", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                      onMouseLeave={e => e.currentTarget.style.background = "#FEF2F2"}
                    >
                      ↩ Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Mood Picker Modal ───────────────────────────────────── */}
      {showMoodPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
          <div style={{ background: t.cardBg, borderRadius:24, padding:"36px 32px", maxWidth:440, width:"90%", boxShadow:"0 24px 60px rgba(0,0,0,0.3)", animation:"slideUp 0.35s ease", border:`1px solid ${t.border}` }}>
            <div style={{ textAlign:"center", marginBottom:8 }}>
              <div style={{ fontSize:40 }}>🌈</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:t.textPrimary, margin:"8px 0 4px" }}>How are you feeling today?</h2>
              <p style={{ fontSize:14, color:t.textMuted, margin:0 }}>Your dashboard will match your vibe ✨</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:24 }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => handleMoodSelect(m.id)}
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"16px 8px", borderRadius:16,
                    border: mood===m.id ? `2px solid ${m.accent}` : `1.5px solid ${t.border}`,
                    background: mood===m.id ? `${m.accent}18` : t.inputBg,
                    cursor:"pointer", transition:"all 0.2s", fontFamily:"'Inter',sans-serif" }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.06)"; e.currentTarget.style.borderColor=m.accent; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.borderColor= mood===m.id ? m.accent : t.border; }}
                >
                  <span style={{ fontSize:32 }}>{m.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:m.accent }}>{m.label}</span>
                  <span style={{ fontSize:10, color:t.textMuted, textAlign:"center" }}>{m.desc}</span>
                </button>
              ))}
            </div>
            {mood && (
              <button onClick={() => setShowMoodPicker(false)} style={{ width:"100%", marginTop:16, padding:"10px", borderRadius:12, background:"transparent", border:`1px solid ${t.border}`, color:t.textMuted, fontSize:13, cursor:"pointer" }}>
                Keep current mood
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Mood Celebration Overlay ─────────────────────────────────── */}
      {moodCelebration && (() => {
        const m = MOODS.find(x => x.id === moodCelebration.moodId);
        const mTheme = MOOD_THEMES[moodCelebration.moodId];
        const celebAccent = mTheme?.accent || "#2563EB";
        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 1100,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            {/* Ripple background */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at center, ${celebAccent}33 0%, transparent 70%)`,
              animation: "celebRipple 0.8s ease-out forwards",
            }} />

            {/* Main card */}
            <div style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              borderRadius: 28,
              padding: "40px 48px",
              maxWidth: 440,
              width: "90%",
              textAlign: "center",
              boxShadow: `0 32px 80px ${celebAccent}44, 0 0 0 2px ${celebAccent}33`,
              animation: "celebCard 0.5s cubic-bezier(.34,1.56,.64,1) forwards",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Coloured top strip */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 6,
                background: `linear-gradient(90deg, ${celebAccent}, ${celebAccent}88)`,
                borderRadius: "28px 28px 0 0",
              }} />

              {/* Mood emoji — BIG, zooms in */}
              <div style={{
                fontSize: 96,
                lineHeight: 1,
                margin: "0 auto 18px",
                display: "block",
                animation: "celebAvatar 0.6s cubic-bezier(.34,1.56,.64,1) forwards",
                filter: `drop-shadow(0 8px 24px ${celebAccent}66)`,
              }}>{m?.emoji}</div>

              <div style={{
                fontSize: 20, fontWeight: 800, color: celebAccent, marginBottom: 14,
                animation: "celebText 0.5s ease 0.2s both",
              }}>
                {m?.label} mode activated!
              </div>

              {/* Quote */}
              <div style={{
                fontSize: 15, color: "#475569", lineHeight: 1.6,
                fontStyle: "italic",
                animation: "celebText 0.5s ease 0.35s both",
                padding: "0 8px",
              }}>
                "{moodCelebration.quote}"
              </div>

              {/* Confetti dots */}
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  width: 10, height: 10, borderRadius: "50%",
                  background: celebAccent,
                  top: `${10 + Math.random() * 80}%`,
                  left: `${5 + Math.random() * 90}%`,
                  opacity: 0.4,
                  animation: `confettiFly ${0.6 + Math.random() * 0.8}s ease-out ${Math.random() * 0.3}s both`,
                  transform: "scale(0)",
                }} />
              ))}
            </div>
          </div>
        );
      })()}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito:wght@400;600;700;800;900&family=Pacifico&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse      { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes calPop     { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes calBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes calFade    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes zoomIn     { from { opacity:0; transform:scale(0.3) rotate(-10deg); } to { opacity:1; transform:scale(1) rotate(0deg); } }
        @keyframes spinRing   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes zoomRingPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.04);} }
        @keyframes sparkleFloat { 0%,100%{transform:translateY(0) scale(1); opacity:1;} 50%{transform:translateY(-12px) scale(1.3); opacity:0.7;} }
        @keyframes shuffleFlash { 0%{opacity:0;} 15%{opacity:1;} 60%{opacity:0.6;} 100%{opacity:0;} }

        @keyframes celebCard {
          from { opacity:0; transform:scale(0.4) translateY(40px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes celebAvatar {
          0%   { transform:scale(0) rotate(-25deg); opacity:0; filter:blur(6px); }
          55%  { transform:scale(1.22) rotate(8deg); opacity:1; filter:blur(0); }
          100% { transform:scale(1) rotate(0deg); opacity:1; filter:blur(0); }
        }
        @keyframes celebText {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes celebRipple {
          from { opacity:0.9; transform:scale(0.3); }
          to   { opacity:0;   transform:scale(2.8); }
        }
        @keyframes confettiFly {
          0%   { transform:scale(0) translateY(0) rotate(0deg);   opacity:0.9; }
          100% { transform:scale(1.6) translateY(-60px) rotate(180deg); opacity:0; }
        }
        @keyframes screenShakeAnim {
          0%,100% { transform:translate(0,0) rotate(0deg); }
          15%     { transform:translate(-7px, 5px) rotate(-0.6deg); }
          30%     { transform:translate(7px,-5px) rotate(0.6deg); }
          45%     { transform:translate(-5px, 7px) rotate(-0.4deg); }
          60%     { transform:translate(5px,-3px) rotate(0.4deg); }
          78%     { transform:translate(-3px, 4px) rotate(-0.2deg); }
        }
        .screen-shake { animation: screenShakeAnim 0.55s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}

// ── Mood definitions ────────────────────────────────────────────────────────
const MOODS = [
  { id:"happy",     emoji:"😄", label:"Happy",     desc:"Energetic & ready!", accent:"#F59E0B" },
  { id:"focused",   emoji:"🎯", label:"Focused",   desc:"In the zone",        accent:"#2563EB" },
  { id:"calm",      emoji:"😌", label:"Calm",      desc:"Peaceful & clear",   accent:"#10B981" },
  { id:"tired",     emoji:"😴", label:"Tired",     desc:"Need some rest",     accent:"#8B5CF6" },
  { id:"stressed",  emoji:"😰", label:"Stressed",  desc:"Under pressure",     accent:"#EF4444" },
  { id:"motivated", emoji:"🚀", label:"Motivated", desc:"Let's crush it!",    accent:"#EC4899" },
];

const MOOD_QUOTES = {
  happy: [
    "Happiness is not something ready-made. It comes from your own actions. — Dalai Lama",
    "The most wasted day of all is that in which we have not laughed. — Chamfort",
    "Joy is the simplest form of gratitude. — Karl Barth",
  ],
  focused: [
    "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus. — Alexander Graham Bell",
    "It is not enough to be busy. The question is: what are we busy about? — Thoreau",
    "Where focus goes, energy flows. — Tony Robbins",
  ],
  calm: [
    "Within you there is a stillness and a sanctuary to which you can retreat at any time. — Herman Hesse",
    "Calm mind brings inner strength and self-confidence. — Dalai Lama",
    "In the middle of difficulty lies opportunity. — Albert Einstein",
  ],
  tired: [
    "Rest is not idleness. It is the key to a brilliant mind. — John Lubbock",
    "Almost everything will work again if you unplug it for a few minutes — including you. — Anne Lamott",
    "Take rest; a field that has rested gives a bountiful crop. — Ovid",
  ],
  stressed: [
    "You don't have to control your thoughts — you just have to stop letting them control you. — Dan Millman",
    "One day at a time. One step at a time. You've got this.",
    "Tough times never last, but tough people do. — Robert H. Schuller",
  ],
  motivated: [
    "The secret of getting ahead is getting started. — Mark Twain",
    "Don't watch the clock; do what it does — keep going. — Sam Levenson",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
  ],
};

const MOOD_THEMES = {
  happy: {
    accent: "#F59E0B",
    light: { pageBg:"#FFFBEB", cardBg:"#FFFFFF", border:"#FDE68A", textPrimary:"#1C1917", textMuted:"#78716C", iconBg:"#FEF3C7", inputBg:"#FFFBEB" },
    dark:  { pageBg:"#1C1400", cardBg:"#2C1F00", border:"rgba(245,158,11,0.2)", textPrimary:"#FEF3C7", textMuted:"#D97706", iconBg:"rgba(245,158,11,0.15)", inputBg:"#1C1400" },
  },
  focused: {
    accent: "#2563EB",
    light: { pageBg:"#EFF6FF", cardBg:"#FFFFFF", border:"#BFDBFE", textPrimary:"#0F172A", textMuted:"#64748B", iconBg:"#DBEAFE", inputBg:"#EFF6FF" },
    dark:  { pageBg:"#0F172A", cardBg:"#1E293B", border:"rgba(37,99,235,0.2)", textPrimary:"#F1F5F9", textMuted:"#94A3B8", iconBg:"rgba(37,99,235,0.15)", inputBg:"#0F172A" },
  },
  calm: {
    accent: "#10B981",
    light: { pageBg:"#ECFDF5", cardBg:"#FFFFFF", border:"#A7F3D0", textPrimary:"#064E3B", textMuted:"#6B7280", iconBg:"#D1FAE5", inputBg:"#ECFDF5" },
    dark:  { pageBg:"#022C22", cardBg:"#064E3B", border:"rgba(16,185,129,0.2)", textPrimary:"#D1FAE5", textMuted:"#6EE7B7", iconBg:"rgba(16,185,129,0.15)", inputBg:"#022C22" },
  },
  tired: {
    accent: "#8B5CF6",
    light: { pageBg:"#F5F3FF", cardBg:"#FFFFFF", border:"#DDD6FE", textPrimary:"#2E1065", textMuted:"#6B7280", iconBg:"#EDE9FE", inputBg:"#F5F3FF" },
    dark:  { pageBg:"#1A0938", cardBg:"#2E1065", border:"rgba(139,92,246,0.2)", textPrimary:"#EDE9FE", textMuted:"#A78BFA", iconBg:"rgba(139,92,246,0.15)", inputBg:"#1A0938" },
  },
  stressed: {
    accent: "#EF4444",
    light: { pageBg:"#FFF1F2", cardBg:"#FFFFFF", border:"#FECDD3", textPrimary:"#1C0A0A", textMuted:"#6B7280", iconBg:"#FFE4E6", inputBg:"#FFF1F2" },
    dark:  { pageBg:"#1C0000", cardBg:"#3B0000", border:"rgba(239,68,68,0.2)", textPrimary:"#FFE4E6", textMuted:"#FCA5A5", iconBg:"rgba(239,68,68,0.15)", inputBg:"#1C0000" },
  },
  motivated: {
    accent: "#EC4899",
    light: { pageBg:"#FDF2F8", cardBg:"#FFFFFF", border:"#FBCFE8", textPrimary:"#500724", textMuted:"#6B7280", iconBg:"#FCE7F3", inputBg:"#FDF2F8" },
    dark:  { pageBg:"#2D0016", cardBg:"#500724", border:"rgba(236,72,153,0.2)", textPrimary:"#FCE7F3", textMuted:"#F9A8D4", iconBg:"rgba(236,72,153,0.15)", inputBg:"#2D0016" },
  },
};

// ── Theme tokens ────────────────────────────────────────────────────────────
const DARK = {
  pageBg: "#0F172A",
  cardBg: "#1E293B",
  border: "rgba(255,255,255,0.08)",
  textPrimary: "#F1F5F9",
  textMuted: "#94A3B8",
  iconBg: "rgba(255,255,255,0.08)",
  inputBg: "#0F172A",
};
const LIGHT = {
  pageBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textMuted: "#64748B",
  iconBg: "#F1F5F9",
  inputBg: "#F8FAFC",
};

// ── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg, t }) {
  return (
    <div style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, padding: 20, display: "flex", alignItems: "center", gap: 16, animation: "slideUp 0.4s ease", transition: "transform 0.2s, box-shadow 0.2s, background 0.3s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginTop: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function MiniCalendar({ tasks, t }) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const taskDays = new Set(tasks.map(tk => new Date(tk.deadline).getDate()));
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: "center", fontWeight: 700, color: t.textPrimary, fontSize: 13, marginBottom: 10 }}>
        {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center" }}>
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, padding: "4px 0" }}>{d}</div>
        ))}
        {days.map((d, i) => (
          <div key={i} style={{
            fontSize: 11, padding: "5px 0", borderRadius: 6, fontWeight: d === now.getDate() ? 700 : 400,
            background: d === now.getDate() ? "#2563EB" : taskDays.has(d) ? "#ECFDF5" : "transparent",
            color: d === now.getDate() ? "#fff" : taskDays.has(d) ? "#10B981" : t.textPrimary,
            position: "relative",
          }}>
            {d || ""}
            {taskDays.has(d) && d !== now.getDate() && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#10B981", margin: "2px auto 0" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}


// ── TasksPage ─────────────────────────────────────────────────────────────────
const TASK_SUBJECTS = ["Mathematics","Physics","Chemistry","English","Computer Science","Biology","History","Economics"];
const TASK_PRIORITIES = [
  { id:"high",   label:"High",   color:"#EF4444", bg:"#FEF2F2", icon:"🔥" },
  { id:"medium", label:"Medium", color:"#F59E0B", bg:"#FFFBEB", icon:"⚡" },
  { id:"low",    label:"Low",    color:"#10B981", bg:"#ECFDF5", icon:"🌿" },
];
const TASK_FILTERS = ["All","Pending","Completed","Due Soon","Overdue"];

function TasksPage({ tasks, setTasks, t, accent }) {
  const [title, setTitle]         = useState("");
  const [subject, setSubject]     = useState("");
  const [deadline, setDeadline]   = useState("");
  const [priority, setPriority]   = useState("medium");
  const [note, setNote]           = useState("");
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [saving, setSaving]       = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const [expandId, setExpandId]   = useState(null);

  const now = new Date();

  const addTask = () => {
    if (!title.trim() || !subject || !deadline) return;
    setSaving(true);
    setTimeout(() => {
      const newTask = { id: Date.now(), title: title.trim(), subject, deadline, priority, note, done: false, createdAt: new Date().toISOString() };
      setTasks(prev => [newTask, ...prev]);
      setJustAdded(newTask.id);
      setTimeout(() => setJustAdded(null), 1800);
      setTitle(""); setSubject(""); setDeadline(""); setPriority("medium"); setNote("");
      setSaving(false);
    }, 600);
  };

  const toggleDone = (id) => setTasks(prev => prev.map(tk => tk.id === id ? { ...tk, done: !tk.done } : tk));
  const deleteTask = (id) => setTasks(prev => prev.filter(tk => tk.id !== id));

  const getStatus = (task) => {
    if (task.done) return "Completed";
    const dl = new Date(task.deadline);
    if (dl < now) return "Overdue";
    const diff = (dl - now) / 86400000;
    if (diff <= 3) return "Due Soon";
    return "Pending";
  };

  const filtered = tasks.filter(task => {
    const status = getStatus(task);
    const matchFilter = filter === "All" || status === filter;
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) || task.subject.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    All: tasks.length,
    Pending: tasks.filter(tk => getStatus(tk) === "Pending").length,
    Completed: tasks.filter(tk => tk.done).length,
    "Due Soon": tasks.filter(tk => getStatus(tk) === "Due Soon").length,
    Overdue: tasks.filter(tk => getStatus(tk) === "Overdue").length,
  };

  const statusStyle = (s) => {
    if (s === "Completed") return { color:"#10B981", bg:"#ECFDF5", label:"✅ Done" };
    if (s === "Overdue")   return { color:"#EF4444", bg:"#FEF2F2", label:"🚨 Overdue" };
    if (s === "Due Soon")  return { color:"#F59E0B", bg:"#FFFBEB", label:"⚡ Due Soon" };
    return { color:"#6366F1", bg:"#EEF2FF", label:"📋 Pending" };
  };

  const pInfo = (id) => TASK_PRIORITIES.find(p => p.id === id) || TASK_PRIORITIES[1];
  const daysLeft = (dl) => Math.ceil((new Date(dl) - now) / 86400000);

  // Progress ring
  const done = tasks.filter(tk => tk.done).length;
  const total = tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const r = 28; const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  return (
    <div style={{ animation:"slideUp 0.4s ease" }}>

      {/* ── Top stats strip ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { icon:"📋", label:"Total Tasks", value:total, color:"#6366F1", bg:"#EEF2FF" },
          { icon:"✅", label:"Completed",   value:done,  color:"#10B981", bg:"#ECFDF5" },
          { icon:"⚡", label:"Due Soon",    value:counts["Due Soon"], color:"#F59E0B", bg:"#FFFBEB" },
          { icon:"🚨", label:"Overdue",     value:counts.Overdue, color:"#EF4444", bg:"#FEF2F2" },
        ].map((s,i) => (
          <div key={i} style={{ background:t.cardBg, borderRadius:16, padding:"16px 18px", border:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:14, animation:`slideUp ${0.3+i*0.07}s ease`, transition:"background 0.3s" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:12, color:t.textMuted, marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"420px 1fr", gap:22, alignItems:"start" }}>

        {/* LEFT — Add Task Form */}
        <div style={{ background:t.cardBg, borderRadius:20, overflow:"hidden", border:`1px solid ${t.border}`, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", transition:"background 0.3s" }}>
          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6)", padding:"22px 24px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.10)",top:-20,right:-20 }} />
            <div style={{ position:"absolute", width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.08)",bottom:-14,left:60 }} />
            <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
              <div style={{ width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>📝</div>
              <div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:17 }}>Add New Task</div>
                <div style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>Stay on top of your deadlines</div>
              </div>
            </div>
            {/* Progress ring */}
            {total > 0 && (
              <div style={{ position:"absolute", right:20, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", gap:8 }}>
                <svg width={70} height={70} style={{ transform:"rotate(-90deg)" }}>
                  <circle cx={35} cy={35} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={5} />
                  <circle cx={35} cy={35} r={r} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.6s ease" }} />
                </svg>
                <div style={{ position:"absolute", right:0, width:70, textAlign:"center" }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{pct}%</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.75)" }}>done</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:22 }}>
            {/* Title */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Task Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. DBMS Assignment Chapter 4"
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${title ? accent+"88" : t.border}`, background:t.inputBg, color:t.textPrimary, fontSize:14, outline:"none", boxSizing:"border-box", transition:"border 0.2s" }}
                onFocus={e=>e.target.style.borderColor=accent}
                onBlur={e=>e.target.style.borderColor=title?accent+"88":t.border}
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Subject</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)}
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:subject?t.textPrimary:t.textMuted, fontSize:14, outline:"none", cursor:"pointer", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center" }}
              >
                <option value="">Select subject...</option>
                {TASK_SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Deadline */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Deadline</label>
              <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPrimary, fontSize:14, outline:"none", boxSizing:"border-box", colorScheme:"dark" }}
              />
            </div>

            {/* Priority pills */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:8 }}>Priority</label>
              <div style={{ display:"flex", gap:8 }}>
                {TASK_PRIORITIES.map(p=>(
                  <button key={p.id} onClick={()=>setPriority(p.id)}
                    style={{ flex:1, padding:"9px 0", borderRadius:10, border:`2px solid ${priority===p.id ? p.color : t.border}`, background:priority===p.id ? p.bg : t.inputBg, color:priority===p.id ? p.color : t.textMuted, fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}
                  >{p.icon} {p.label}</button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Note <span style={{ fontWeight:400 }}>(optional)</span></label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Any extra details..." rows={2}
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPrimary, fontSize:13, outline:"none", boxSizing:"border-box", resize:"none", fontFamily:"inherit" }}
              />
            </div>

            <button onClick={addTask} disabled={!title.trim()||!subject||!deadline||saving}
              style={{ width:"100%", padding:"13px", borderRadius:12, background:(!title.trim()||!subject||!deadline)?"#CBD5E1":"linear-gradient(135deg,#6366F1,#8B5CF6)", border:"none", color:"#fff", fontWeight:700, fontSize:15, cursor:(!title.trim()||!subject||!deadline)?"not-allowed":"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            >
              {saving ? <><span style={{ animation:"spin 0.8s linear infinite", display:"inline-block" }}>⟳</span> Saving...</> : "＋ Save Task"}
            </button>
          </div>
        </div>

        {/* RIGHT — Task List */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Search + Filter bar */}
          <div style={{ background:t.cardBg, borderRadius:16, padding:"14px 16px", border:`1px solid ${t.border}`, transition:"background 0.3s" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search tasks..."
              style={{ width:"100%", padding:"9px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPrimary, fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:12 }}
            />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {TASK_FILTERS.map(f=>{
                const active = filter===f;
                return (
                  <button key={f} onClick={()=>setFilter(f)}
                    style={{ padding:"6px 14px", borderRadius:999, border:`1.5px solid ${active?accent:t.border}`, background:active?`${accent}18`:t.inputBg, color:active?accent:t.textMuted, fontWeight:active?700:500, fontSize:12, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:5 }}
                  >
                    {f}
                    <span style={{ background:active?accent:t.border, color:active?"#fff":t.textMuted, borderRadius:999, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{counts[f]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task cards */}
          {filtered.length === 0 ? (
            <div style={{ background:t.cardBg, borderRadius:20, padding:"48px 24px", textAlign:"center", border:`2px dashed ${t.border}`, transition:"background 0.3s" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{search ? "🔍" : "📭"}</div>
              <div style={{ fontSize:16, fontWeight:700, color:t.textPrimary, marginBottom:6 }}>{search ? "No matching tasks" : "No tasks yet"}</div>
              <div style={{ fontSize:13, color:t.textMuted }}>{search ? "Try a different search term" : "Add your first task using the form"}</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map((task,i) => {
                const status = getStatus(task);
                const ss = statusStyle(status);
                const pi = pInfo(task.priority);
                const dl = daysLeft(task.deadline);
                const expanded = expandId === task.id;

                return (
                  <div key={task.id} style={{ background:t.cardBg, borderRadius:16, border:`1.5px solid ${task.done ? t.border : justAdded===task.id ? accent : t.border}`, overflow:"hidden", transition:"all 0.3s", boxShadow: justAdded===task.id ? `0 0 0 3px ${accent}44` : "none", animation:`slideUp ${0.2+i*0.05}s ease`, opacity: task.done ? 0.7 : 1 }}>
                    <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setExpandId(expanded?null:task.id)}>
                      {/* Checkbox */}
                      <button onClick={e=>{e.stopPropagation();toggleDone(task.id);}}
                        style={{ width:24,height:24,borderRadius:"50%",border:`2px solid ${task.done?"#10B981":t.border}`,background:task.done?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.2s",color:"#fff",fontSize:12 }}
                      >{task.done?"✓":""}</button>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:t.textPrimary, textDecoration:task.done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</span>
                          {justAdded===task.id && <span style={{ fontSize:10, background:accent, color:"#fff", borderRadius:999, padding:"2px 8px", fontWeight:700, flexShrink:0 }}>NEW ✨</span>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:11, color:t.textMuted }}>📚 {task.subject}</span>
                          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999, background:ss.bg, color:ss.color }}>{ss.label}</span>
                          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999, background:pi.bg, color:pi.color }}>{pi.icon} {pi.label}</span>
                        </div>
                      </div>

                      {/* Deadline */}
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color: dl < 0 ? "#EF4444" : dl <= 3 ? "#F59E0B" : t.textPrimary }}>
                          {dl < 0 ? `${Math.abs(dl)}d late` : dl === 0 ? "Today!" : `${dl}d left`}
                        </div>
                        <div style={{ fontSize:10, color:t.textMuted }}>{new Date(task.deadline).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                      </div>

                      {/* Expand chevron */}
                      <span style={{ fontSize:12, color:t.textMuted, transition:"transform 0.2s", transform:expanded?"rotate(180deg)":"rotate(0deg)", flexShrink:0 }}>▾</span>
                    </div>

                    {/* Expanded details */}
                    {expanded && (
                      <div style={{ borderTop:`1px solid ${t.border}`, padding:"12px 16px 14px", background:`${accent}06`, animation:"slideUp 0.2s ease" }}>
                        {task.note && <div style={{ fontSize:13, color:t.textPrimary, marginBottom:10, fontStyle:"italic" }}>💬 {task.note}</div>}
                        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                          <button onClick={()=>toggleDone(task.id)}
                            style={{ padding:"7px 16px", borderRadius:9, border:`1.5px solid #10B981`, background:"#ECFDF5", color:"#10B981", fontWeight:700, fontSize:12, cursor:"pointer" }}
                          >{task.done?"↩ Reopen":"✅ Mark Done"}</button>
                          <button onClick={()=>deleteTask(task.id)}
                            style={{ padding:"7px 16px", borderRadius:9, border:"1.5px solid #EF4444", background:"#FEF2F2", color:"#EF4444", fontWeight:700, fontSize:12, cursor:"pointer" }}
                          >🗑 Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AttendancePage ────────────────────────────────────────────────────────────
const SUBJECTS = [
  { name: "Mathematics",       attended: 38, total: 48, color: "#6366F1" },
  { name: "Physics",           attended: 29, total: 42, color: "#EF4444" },
  { name: "Chemistry",         attended: 35, total: 45, color: "#10B981" },
  { name: "English",           attended: 40, total: 44, color: "#F59E0B" },
  { name: "Computer Science",  attended: 44, total: 46, color: "#EC4899" },
  { name: "Biology",           attended: 31, total: 50, color: "#14B8A6" },
];

const HEATMAP_DATA = (() => {
  const today = new Date();
  const data = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    let status = "none";
    if (!isWeekend) {
      const r = Math.random();
      status = r > 0.15 ? "present" : r > 0.06 ? "absent" : "holiday";
    }
    data.push({ date: d, status });
  }
  return data;
})();

function AttendancePage({ t, accent }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentPct, setCurrentPct]           = useState("");
  const [result, setResult]                   = useState(null);
  const [checking, setChecking]               = useState(false);

  // Build smart alert banners from subject data
  const alerts = SUBJECTS.map(s => {
    const pct = Math.round((s.attended / s.total) * 100);
    const needed75 = Math.ceil((0.75 * s.total - s.attended) / 0.25);
    if (pct < 65)  return { subject: s.name, pct, type: "danger",  color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: "🚨", msg: `${needed75} more class${needed75>1?"es":""} needed to reach 75%` };
    if (pct < 75)  return { subject: s.name, pct, type: "warning", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: "⚠️", msg: `${needed75} more class${needed75>1?"es":""} to reach 75%` };
    return null;
  }).filter(Boolean);

  const handleCheck = () => {
    if (!selectedSubject || !currentPct) return;
    setChecking(true);
    setTimeout(() => {
      const pct = parseFloat(currentPct);
      const sub = SUBJECTS.find(s => s.name === selectedSubject) || { total: 50 };
      const needed75 = Math.max(0, Math.ceil((0.75 * sub.total - (pct / 100) * sub.total) / 0.25));
      const canMiss  = Math.floor(((pct / 100) * sub.total - 0.75 * sub.total) / 1);
      if      (pct >= 85) setResult({ type: "safe",    label: "You're Safe! 🎉", color: "#10B981", msg: `You can afford to miss up to ${canMiss} more class${canMiss!==1?"es":""}!` });
      else if (pct >= 75) setResult({ type: "ok",      label: "On Track ✅",     color: "#F59E0B", msg: `Borderline safe — don't skip more than ${canMiss} class${canMiss!==1?"es":""}!` });
      else if (pct >= 60) setResult({ type: "warning", label: "At Risk ⚠️",      color: "#F97316", msg: `Attend ${needed75} more classes to reach 75%.` });
      else                setResult({ type: "danger",  label: "Danger Zone 🚨",  color: "#EF4444", msg: `Critical! Need ${needed75} consecutive classes to recover.` });
      setChecking(false);
    }, 700);
  };

  // Heatmap weeks
  const weeks = [];
  for (let i = 0; i < HEATMAP_DATA.length; i += 7) weeks.push(HEATMAP_DATA.slice(i, i + 7));
  const presentCount = HEATMAP_DATA.filter(d => d.status === "present").length;
  const absentCount  = HEATMAP_DATA.filter(d => d.status === "absent").length;

  const heatColor = (status) => {
    if (status === "present") return "#10B981";
    if (status === "absent")  return "#EF4444";
    if (status === "holiday") return "#94A3B8";
    return t.border;
  };

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>

      {/* ── Smart Alert Banners ── */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: a.bg, border: `1.5px solid ${a.border}`, animation: `slideUp ${0.3 + i * 0.08}s ease` }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: a.color, fontSize: 13 }}>{a.subject}</span>
                <span style={{ color: "#64748B", fontSize: 13 }}> — {a.pct}% • {a.msg}</span>
              </div>
              <div style={{ background: a.color, color: "#fff", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{a.pct}%</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 24, alignItems: "start" }}>

        {/* LEFT — Risk Check Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: t.cardBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "background 0.3s" }}>
            <div style={{ background: "linear-gradient(135deg, #E91E8C, #FF6B6B)", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📊</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Attendance Risk Check</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Know your risk before it's too late</div>
                </div>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>Subject</label>
                <select
                  value={selectedSubject}
                  onChange={e => { setSelectedSubject(e.target.value); setResult(null); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.textPrimary, fontSize: 14, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>Current Attendance (%)</label>
                <input
                  type="number" min="0" max="100" placeholder="e.g. 72"
                  value={currentPct}
                  onChange={e => { setCurrentPct(e.target.value); setResult(null); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.textPrimary, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <button
                onClick={handleCheck}
                disabled={!selectedSubject || !currentPct || checking}
                style={{ width: "100%", padding: "13px", borderRadius: 12, background: (!selectedSubject || !currentPct) ? "#CBD5E1" : "linear-gradient(135deg,#E91E8C,#FF6B6B)", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: (!selectedSubject || !currentPct) ? "not-allowed" : "pointer", transition: "all 0.2s" }}
              >
                {checking ? "Checking..." : "Check Risk"}
              </button>

              {result && (
                <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, background: `${result.color}15`, border: `1.5px solid ${result.color}44`, animation: "slideUp 0.3s ease" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: result.color, marginBottom: 6 }}>{result.label}</div>
                  <div style={{ fontSize: 13, color: t.textPrimary }}>{result.msg}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Attendance Heatmap ── */}
          <div style={{ background: t.cardBg, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, transition: "background 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: t.textPrimary }}>🗓️ Last 70 Days</div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: t.textMuted }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#10B981", display: "inline-block" }} />Present</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#EF4444", display: "inline-block" }} />Absent</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#94A3B8", display: "inline-block" }} />Holiday</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ width: 28, textAlign: "center", fontSize: 9, fontWeight: 700, color: t.textMuted, marginBottom: 3, flexShrink: 0 }}>{d}</div>
              ))}
              {HEATMAP_DATA.map((day, i) => (
                <div key={i} title={`${day.date.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} — ${day.status}`}
                  style={{ width: 28, height: 28, borderRadius: 6, background: heatColor(day.status), flexShrink: 0, cursor: "default", transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.25)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>{presentCount}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>Present</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#EF4444" }}>{absentCount}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>Absent</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{Math.round(presentCount / (presentCount + absentCount) * 100) || 0}%</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>Overall</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Subject-wise Bar Chart */}
        <div style={{ background: t.cardBg, borderRadius: 20, padding: 24, border: `1px solid ${t.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", transition: "background 0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: t.textPrimary }}>📚 Subject Attendance</div>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>75% minimum required per subject</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {SUBJECTS.map((s, i) => {
              const pct = Math.round((s.attended / s.total) * 100);
              const isSafe    = pct >= 75;
              const isWarning = pct >= 65 && pct < 75;
              const barColor  = pct >= 75 ? s.color : pct >= 65 ? "#F59E0B" : "#EF4444";
              const statusLabel = pct >= 75 ? "Safe" : pct >= 65 ? "At Risk" : "Danger";
              const statusBg    = pct >= 75 ? "#ECFDF5" : pct >= 65 ? "#FFFBEB" : "#FEF2F2";
              const statusColor = pct >= 75 ? "#10B981" : pct >= 65 ? "#D97706" : "#EF4444";

              return (
                <div key={i} style={{ animation: `slideUp ${0.3 + i * 0.07}s ease` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: barColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{s.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{s.attended}/{s.total} classes</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: statusBg, color: statusColor }}>{statusLabel}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: barColor, minWidth: 38, textAlign: "right" }}>{pct}%</span>
                    </div>
                  </div>
                  {/* Track */}
                  <div style={{ height: 10, borderRadius: 999, background: t.border, overflow: "hidden", position: "relative" }}>
                    {/* 75% marker */}
                    <div style={{ position: "absolute", left: "75%", top: 0, bottom: 0, width: 2, background: "rgba(0,0,0,0.2)", zIndex: 2 }} />
                    {/* Fill */}
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${barColor}99, ${barColor})`, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                  </div>
                  {/* 75% label under marker */}
                  <div style={{ position: "relative", height: 14 }}>
                    <div style={{ position: "absolute", left: "75%", transform: "translateX(-50%)", fontSize: 9, color: t.textMuted, fontWeight: 600, marginTop: 2 }}>75%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${t.border}`, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Safe Subjects",    value: SUBJECTS.filter(s => s.attended/s.total >= 0.75).length, color: "#10B981", bg: "#ECFDF5" },
              { label: "At Risk",          value: SUBJECTS.filter(s => { const p=s.attended/s.total; return p>=0.65&&p<0.75; }).length, color: "#F59E0B", bg: "#FFFBEB" },
              { label: "Danger",           value: SUBJECTS.filter(s => s.attended/s.total < 0.65).length,  color: "#EF4444", bg: "#FEF2F2" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 12, background: stat.bg }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ── DashMiniFloral — compact floral calendar for dashboard home ──────────────
function DashMiniFloral({ tasks, t, onOpenCalendar }) {
  const today = new Date();
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear]   = useState(today.getFullYear());

  const th = CAL_THEMES[curMonth];
  const sp = CAL_SPECIALITIES[curMonth];
  const decos = CAL_DECO[curMonth];
  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const taskDays = new Set(tasks.map(tk => new Date(tk.deadline).getDate()));

  const navMonth = (dir) => {
    let m = curMonth + dir, y = curYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setCurMonth(m); setCurYear(y);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ fontFamily:"'Nunito','Inter',sans-serif", borderRadius:16, overflow:"hidden", border:`1px solid ${t.border}`, background: t.cardBg, transition:"background 0.3s" }}>

      {/* Floral header */}
      <div style={{ background: th.bg, padding:"12px 14px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:60,height:60,borderRadius:"50%",background:"rgba(255,255,255,0.12)",top:-16,left:-14 }} />
        <div style={{ position:"absolute", width:35,height:35,borderRadius:"50%",background:"rgba(255,255,255,0.10)",bottom:-8,right:50 }} />
        <button onClick={() => navMonth(-1)} style={{ background:"rgba(255,255,255,0.5)", border:"none", borderRadius:"50%", width:26,height:26, cursor:"pointer", fontSize:14, fontWeight:900, display:"flex",alignItems:"center",justifyContent:"center", zIndex:2, flexShrink:0 }}>‹</button>
        <div style={{ textAlign:"center", zIndex:2, flex:1 }}>
          <div style={{ fontFamily:"'Pacifico',cursive", fontSize:16, color:"#fff", textShadow:"0 1px 4px rgba(0,0,0,0.18)", lineHeight:1 }}>{CAL_MONTHS[curMonth]}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.85)", fontWeight:600, marginTop:1 }}>{curYear}</div>
          <div style={{ fontSize:13, marginTop:3, letterSpacing:2 }}>{decos.slice(0,4).join(" ")}</div>
        </div>
        <button onClick={() => navMonth(1)} style={{ background:"rgba(255,255,255,0.5)", border:"none", borderRadius:"50%", width:26,height:26, cursor:"pointer", fontSize:14, fontWeight:900, display:"flex",alignItems:"center",justifyContent:"center", zIndex:2, flexShrink:0 }}>›</button>
      </div>

      {/* Speciality strip */}
      <div style={{ background: th.light, borderBottom:`1px solid ${th.dot}33`, padding:"6px 12px", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:18, animation:"calBounce 2s infinite", display:"inline-block" }}>{sp.emoji.split("")[0]}{sp.emoji.split("")[1]}</span>
        <span style={{ fontSize:11, fontWeight:700, color:th.accent, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sp.title}</span>
      </div>

      {/* Weekday labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"8px 10px 2px" }}>
        {CAL_WDAYS.map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:9, fontWeight:800, textTransform:"uppercase", color:th.accent, padding:"2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 10px 10px", gap:2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isTd = d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();
          const hasTask = taskDays.has(d);
          const dow = (firstDay + d - 1) % 7;
          const isWeekend = dow === 0 || dow === 6;
          return (
            <div key={i} style={{
              aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              borderRadius:"50%", fontSize:11, fontWeight: isTd ? 900 : 600,
              background: isTd ? th.bg : hasTask ? th.light : isWeekend ? `${th.dot}18` : "transparent",
              color: isTd ? "#fff" : isWeekend ? th.accent : t.textPrimary,
              boxShadow: isTd ? `0 1px 8px ${th.dot}88` : "none",
              position:"relative", transition:"transform 0.15s",
            }}
              onMouseEnter={e => { if(!isTd) e.currentTarget.style.transform="scale(1.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; }}
            >
              {d}
              {hasTask && !isTd && <div style={{ width:4,height:4,borderRadius:"50%",background:th.dot, position:"absolute", bottom:2 }} />}
            </div>
          );
        })}
      </div>

      {/* Open full calendar link */}
      <div style={{ borderTop:`1px solid ${t.border}`, padding:"8px 14px", display:"flex", justifyContent:"center" }}>
        <button onClick={onOpenCalendar} style={{ background:"none", border:"none", color:th.accent, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito','Inter',sans-serif" }}>
          View full calendar →
        </button>
      </div>
    </div>
  );
}

// ── Floral Calendar Data ─────────────────────────────────────────────────────
const CAL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const CAL_WDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CAL_THEMES = [
  { bg: "linear-gradient(135deg,#f9a8d4,#c084fc)", accent: "#7c3aed", light: "#fdf2f8", dot: "#e879f9", text: "#fff" },
  { bg: "linear-gradient(135deg,#67e8f9,#818cf8)", accent: "#4338ca", light: "#eef2ff", dot: "#6366f1", text: "#fff" },
  { bg: "linear-gradient(135deg,#86efac,#4ade80)", accent: "#166534", light: "#f0fdf4", dot: "#22c55e", text: "#fff" },
  { bg: "linear-gradient(135deg,#fda4af,#fb923c)", accent: "#c2410c", light: "#fff7ed", dot: "#f97316", text: "#fff" },
  { bg: "linear-gradient(135deg,#6ee7b7,#34d399)", accent: "#065f46", light: "#ecfdf5", dot: "#10b981", text: "#fff" },
  { bg: "linear-gradient(135deg,#fdba74,#fbbf24)", accent: "#92400e", light: "#fffbeb", dot: "#f59e0b", text: "#fff" },
  { bg: "linear-gradient(135deg,#c4b5fd,#818cf8)", accent: "#5b21b6", light: "#f5f3ff", dot: "#8b5cf6", text: "#fff" },
  { bg: "linear-gradient(135deg,#67e8f9,#38bdf8)", accent: "#0c4a6e", light: "#e0f2fe", dot: "#0ea5e9", text: "#fff" },
  { bg: "linear-gradient(135deg,#f9a8d4,#fb7185)", accent: "#9f1239", light: "#fff1f2", dot: "#f43f5e", text: "#fff" },
  { bg: "linear-gradient(135deg,#fcd34d,#f97316)", accent: "#7c2d12", light: "#fff7ed", dot: "#fb923c", text: "#fff" },
  { bg: "linear-gradient(135deg,#a7f3d0,#6ee7b7)", accent: "#064e3b", light: "#ecfdf5", dot: "#10b981", text: "#fff" },
  { bg: "linear-gradient(135deg,#c4b5fd,#f0abfc)", accent: "#6b21a8", light: "#faf5ff", dot: "#a855f7", text: "#fff" },
];

const CAL_SPECIALITIES = [
  { emoji: "❄️🎉", title: "New Year & Winter Magic",   desc: "Fresh beginnings, cozy snowfalls, and New Year celebrations!" },
  { emoji: "💝🌹", title: "Valentine's Month",          desc: "Love is in the air! Hearts, chocolates & sweet gestures." },
  { emoji: "🌸🌿", title: "Spring Awakening",           desc: "First flowers bloom — tulips, daffodils & cherry blossoms!" },
  { emoji: "🐣🌦️", title: "April Showers & Easter",   desc: "Spring rains bring flowers. Easter egg hunts and renewal!" },
  { emoji: "🌻👩‍👩‍👧", title: "Mother's Day & Flowers", desc: "Honor moms! Fields burst with wildflowers and sunshine." },
  { emoji: "🌊☀️", title: "Summer Begins!",             desc: "Longest days, warm nights — beaches, ice cream & adventures!" },
  { emoji: "🎆🌽", title: "Independence & Harvest",     desc: "Fireworks light the sky! Corn festivals and peak summer heat." },
  { emoji: "🌅🦋", title: "Late Summer Glory",          desc: "Golden sunsets, butterflies migrating, back-to-school vibes." },
  { emoji: "🍂🍎", title: "Autumn Harvest",             desc: "Apples, pumpkins and falling leaves paint the world orange!" },
  { emoji: "🎃🍁", title: "Halloween & Fall Foliage",  desc: "Spooky season! Maple trees turn crimson, gold, and amber." },
  { emoji: "🦃🍁", title: "Gratitude Season",           desc: "Thanksgiving feasts, gratitude, and the last warm days." },
  { emoji: "🎄⛄", title: "Winter Wonderland",          desc: "Christmas magic! Snowflakes, caroling, gifts & warm fireplaces." },
];

const CAL_DECO = [
  ["🌸","🌺","🍀","🌼","🌷","🌿"],
  ["❄️","🌙","💫","⭐","🌟","✨"],
  ["🌸","🌱","🍃","🐝","🌼","🦋"],
  ["🌷","🌧️","☂️","🐣","🌈","🌻"],
  ["🌺","🌻","🦋","🌼","🌸","🐦"],
  ["🌊","🌞","🐚","🌴","🦀","☀️"],
  ["🎆","🌽","🍉","🌻","🦅","🌾"],
  ["🌅","🦋","🌻","🍑","🌾","☀️"],
  ["🍂","🍎","🌾","🎃","🍁","🌰"],
  ["🎃","🍁","🦉","🕷️","🌙","🍬"],
  ["🦃","🍂","🌽","🍁","🥧","🌰"],
  ["⛄","🎄","❄️","🎁","🔔","🌟"],
];

// ── FloralCalendar Component ─────────────────────────────────────────────────
function FloralCalendar({ t, tasks, setTasks }) {
  const today = new Date();
  const [view, setView] = useState("month");
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // ── Add Event modal state ──────────────────────────────────────────────
  const [eventModalDate, setEventModalDate] = useState(null); // Date object or null
  const [eventTitle, setEventTitle] = useState("");
  const [eventPriority, setEventPriority] = useState("medium");

  const navMonth = (dir) => {
    let m = curMonth + dir, y = curYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCurMonth(m); setCurYear(y);
  };

  const jumpToMonth = (mi) => { setCurMonth(mi); setCurYear(viewYear); setView("month"); };

  const openEventModal = (day) => {
    setEventModalDate(new Date(curYear, curMonth, day));
    setEventTitle("");
    setEventPriority("medium");
  };
  const closeEventModal = () => setEventModalDate(null);

  const addEvent = () => {
    if (!eventTitle.trim() || !eventModalDate) return;
    const newEvent = {
      id: Date.now(),
      title: eventTitle.trim(),
      subject: "Event",
      deadline: eventModalDate.toISOString().slice(0, 10),
      priority: eventPriority,
      note: "",
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newEvent, ...prev]);
    closeEventModal();
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Inter', sans-serif" }}>
      {/* View toggle */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
        {[["month","Current Month"],["year","Full Year"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "9px 24px", borderRadius: 999, border: "2px solid #4fc3d0",
            background: view === v ? "#4fc3d0" : t.cardBg,
            color: view === v ? "#fff" : "#4fc3d0",
            fontFamily: "'Nunito','Inter',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {view === "month"
        ? <FloralMonthView curMonth={curMonth} curYear={curYear} today={today} tasks={tasks} t={t} onNav={navMonth} onDayClick={openEventModal} />
        : <FloralYearView viewYear={viewYear} today={today} tasks={tasks} t={t} onYearNav={d => setViewYear(y => y+d)} onJump={jumpToMonth} />
      }

      {/* ── Add Event Modal ── */}
      {eventModalDate && (
        <div onClick={closeEventModal} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: t.cardBg, borderRadius: 18, padding: 24, width: 340,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)", animation: "calPop 0.3s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.textPrimary, marginBottom: 4 }}>📌 Add Event</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>
              {eventModalDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>

            <label style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Event Title</label>
            <input
              autoFocus
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addEvent(); }}
              placeholder="e.g. Submit assignment"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`,
                background: t.pageBg, color: t.textPrimary, fontSize: 14, marginBottom: 14, boxSizing: "border-box",
                fontFamily: "'Nunito','Inter',sans-serif",
              }}
            />

            <label style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Priority</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {TASK_PRIORITIES.map(p => (
                <button key={p.id} onClick={() => setEventPriority(p.id)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  border: eventPriority === p.id ? `2px solid ${p.color}` : `2px solid ${t.border}`,
                  background: eventPriority === p.id ? p.bg : "transparent",
                  color: eventPriority === p.id ? p.color : t.textMuted,
                  transition: "all 0.15s",
                }}>{p.icon} {p.label}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={closeEventModal} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${t.border}`,
                background: "transparent", color: t.textMuted, fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={addEvent} disabled={!eventTitle.trim()} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                background: eventTitle.trim() ? "#4fc3d0" : "#9CA3AF", color: "#fff", fontWeight: 700, fontSize: 13,
                cursor: eventTitle.trim() ? "pointer" : "not-allowed",
              }}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FloralMonthView({ curMonth, curYear, today, tasks, t, onNav, onDayClick }) {
  const th = CAL_THEMES[curMonth];
  const sp = CAL_SPECIALITIES[curMonth];
  const decos = CAL_DECO[curMonth];
  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const taskDays = new Set(tasks.map(tk => new Date(tk.deadline).getDate()));
  const isToday = (d) => d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();

  const dayCells = [];
  for (let i = 0; i < firstDay; i++) dayCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) dayCells.push(d);

  return (
    <div style={{ animation: "calFade 0.4s ease", background: t.cardBg, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: `1px solid ${t.border}`, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{ background: th.bg, padding: "22px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", minHeight: 100 }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.12)",top:-25,left:-20 }} />
        <div style={{ position:"absolute", width:55,height:55,borderRadius:"50%",background:"rgba(255,255,255,0.10)",bottom:-12,right:80 }} />
        <button onClick={() => onNav(-1)} style={{ background:"rgba(255,255,255,0.55)", border:"none", borderRadius:"50%", width:38,height:38, cursor:"pointer", fontSize:18, fontWeight:900, display:"flex",alignItems:"center",justifyContent:"center", zIndex:2, flexShrink:0, transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.85)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.55)"}
        >‹</button>
        <div style={{ textAlign:"center", zIndex:2, flex:1 }}>
          <div style={{ fontFamily:"'Pacifico',cursive", fontSize:28, color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.18)", lineHeight:1 }}>
            {CAL_MONTHS[curMonth]}
          </div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.88)", fontWeight:600, marginTop:3 }}>{curYear}</div>
          <div style={{ fontSize:20, marginTop:6, letterSpacing:3 }}>{decos.join(" ")}</div>
        </div>
        <button onClick={() => onNav(1)} style={{ background:"rgba(255,255,255,0.55)", border:"none", borderRadius:"50%", width:38,height:38, cursor:"pointer", fontSize:18, fontWeight:900, display:"flex",alignItems:"center",justifyContent:"center", zIndex:2, flexShrink:0, transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.85)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.55)"}
        >›</button>
      </div>

      {/* Speciality card */}
      <div style={{ margin:"14px 16px 0", borderRadius:14, padding:"12px 16px", background: th.light, border:`2px solid ${th.dot}33`, display:"flex", alignItems:"center", gap:14, animation:"calPop 0.5s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ fontSize:38, animation:"calBounce 2s infinite", flexShrink:0 }}>{sp.emoji}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:th.accent }}>{sp.title}</div>
          <div style={{ fontSize:12, color:"#666", marginTop:2 }}>{sp.desc}</div>
        </div>
      </div>

      {/* Weekday labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"14px 16px 4px", gap:2 }}>
        {CAL_WDAYS.map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0", color:th.accent, padding:"4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 16px 18px", gap:4 }}>
        {dayCells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isTd = isToday(d);
          const hasTask = taskDays.has(d);
          const dow = (firstDay + d - 1) % 7;
          const isWeekend = dow === 0 || dow === 6;
          return (
            <div key={i}
              onClick={() => onDayClick && onDayClick(d)}
              title="Click to add an event"
              style={{
              aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              borderRadius:"50%", fontSize:13, fontWeight: isTd ? 900 : 600, cursor: onDayClick ? "pointer" : "default",
              background: isTd ? th.bg : hasTask ? th.light : isWeekend ? `${th.dot}18` : "transparent",
              color: isTd ? "#fff" : isWeekend ? th.accent : t.textPrimary,
              boxShadow: isTd ? `0 2px 12px ${th.dot}88` : "none",
              transition:"transform 0.15s",
              position:"relative",
            }}
              onMouseEnter={e => { if(!isTd) e.currentTarget.style.transform="scale(1.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; }}
            >
              {d}
              {hasTask && !isTd && (
                <div style={{ width:5,height:5,borderRadius:"50%",background:th.dot, position:"absolute", bottom:3 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloralYearView({ viewYear, today, tasks, t, onYearNav, onJump }) {
  return (
    <div style={{ animation:"calFade 0.4s ease" }}>
      {/* Year nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:20 }}>
        <button onClick={() => onYearNav(-1)} style={{ background: t.cardBg, border:"2px solid #4fc3d0", borderRadius:"50%", width:34,height:34, cursor:"pointer", fontWeight:900, fontSize:15, color:"#4fc3d0", display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
        <span style={{ fontFamily:"'Pacifico',cursive", fontSize:22, color:"#4fc3d0" }}>{viewYear}</span>
        <button onClick={() => onYearNav(1)} style={{ background: t.cardBg, border:"2px solid #4fc3d0", borderRadius:"50%", width:34,height:34, cursor:"pointer", fontWeight:900, fontSize:15, color:"#4fc3d0", display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
      </div>

      {/* 4×3 grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {CAL_MONTHS.map((name, mi) => {
          const th = CAL_THEMES[mi];
          const firstDay = new Date(viewYear, mi, 1).getDay();
          const daysInMonth = new Date(viewYear, mi + 1, 0).getDate();
          const isCurMonth = mi === today.getMonth() && viewYear === today.getFullYear();
          const cells = [];
          for (let i=0; i<firstDay; i++) cells.push(null);
          for (let d=1; d<=daysInMonth; d++) cells.push(d);

          return (
            <div key={mi} onClick={() => onJump(mi)} style={{
              borderRadius:14, overflow:"hidden", cursor:"pointer",
              border: isCurMonth ? `2px solid ${th.dot}` : `2px solid ${t.border}`,
              background: t.cardBg, transition:"transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="none"; }}
            >
              <div style={{ background:th.bg, padding:"6px 8px", textAlign:"center", fontFamily:"'Pacifico',cursive", fontSize:11, color:"#fff" }}>{name}</div>
              <div style={{ padding:4 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
                  {CAL_WDAYS.map((d,i) => <div key={i} style={{ fontSize:7, textAlign:"center", fontWeight:700, color:th.accent, padding:"1px 0" }}>{d}</div>)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1 }}>
                  {cells.map((d,i) => {
                    const isTd = d === today.getDate() && mi === today.getMonth() && viewYear === today.getFullYear();
                    return (
                      <div key={i} style={{
                        fontSize:7, textAlign:"center", padding:"1.5px 0", borderRadius:"50%",
                        fontWeight: isTd ? 800 : 500,
                        background: isTd ? th.bg : "transparent",
                        color: isTd ? "#fff" : d ? t.textPrimary : "transparent",
                      }}>{d || "."}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:t.textMuted }}>Click any month to view it in full</div>
    </div>
  );
}
