import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, title = "STUDENT PORTAL" }) {
  const menuItems = [
    { id: 'dashboard', label: '🏠 Dashboard Overview' },
    { id: 'materials', label: '📚 Learning Materials' },
    { id: 'activities', label: '🧩 Lesson Activities' },
    { id: 'exams', label: '📝 Online Formal Exams' },
    { id: 'feedback', label: '💬 Teacher Feedback' },
    { id: 'settings', label: '⚙️ Profile Settings' }
  ];

  return (
    <div style={styles.sidebar}>
      <div>
        <div style={{ marginBottom: '28px', paddingLeft: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>Aura Pen Saku</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#bbf7d0', fontWeight: 'bold', letterSpacing: '1px' }}>
            {title}
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              style={{ ...styles.navBtn, backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.22)' : 'transparent' }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <button onClick={onLogout} style={styles.logoutBtn}>Logout Terminal 🚪</button>
    </div>
  );
}

const styles = {
  sidebar: { width: '280px', minWidth: '280px', backgroundColor: '#145c2e', color: '#fff', padding: '26px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100vh', boxSizing: 'border-box' },
  navBtn: { padding: '13px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' },
  logoutBtn: { padding: '13px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginTop: 'auto' }
};