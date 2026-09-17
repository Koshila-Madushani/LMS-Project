import React from 'react';

export default function Sidebar({ currentSubPage, setCurrentSubPage, onLogoutClick, role = 'admin' }) {
  
  // 1️⃣ Admin Menu Items (Screenshot 1 Exact Names)
  const adminMenuItems = [
    { name: 'Overview', icon: '🏠' },
    { name: 'Manage Teachers', icon: '🧑‍🏫' },
    { name: 'Manage Students', icon: '🧑‍🎓' },
    { name: 'Manage Subjects', icon: '📚' }, 
    { name: 'Manage Timetable', icon: '🏫' },
    { name: 'Reports', icon: '📊' },
    { name: 'Feedback', icon: '💬' },
    { name: 'Settings', icon: '⚙️' },
  ];

  // 2️⃣ Teacher Menu Items (Screenshot 2 Exact Names)
  const teacherMenuItems = [
    { name: 'Dashboard Overview', icon: '🏠' },
    { name: 'Content Manager', icon: '📂' },
    { name: 'Quiz & Exam Manager', icon: '📝' },
    { name: 'Question Bank', icon: '📚' },
    { name: 'Forum & Activity Hub', icon: '🧩' },
    { name: 'View Reports', icon: '📊' },
    { name: 'Student Feedback', icon: '💬' },
    { name: 'My Profile Settings', icon: '👤' },
  ];

  // 3️⃣ Student Menu Items (Screenshot 3 Exact Names)
  const studentMenuItems = [
    { name: 'Overview', icon: '🏠' },
    { name: 'Study Materials', icon: '📚' },
    { name: 'Lesson Activities', icon: '🧩' },
    { name: 'Exams & Quizzes', icon: '📝' },
    { name: 'Feedback', icon: '💬' },
    { name: 'Settings', icon: '⚙️' },
  ];

  // 🔄 Role එක අනුව Menu Items තේරීම
  let menuItems = adminMenuItems;
  if (role === 'teacher') menuItems = teacherMenuItems;
  if (role === 'student') menuItems = studentMenuItems;

  return (
    <aside style={styles.sidebar}>
      
      {/* 🟢 Header Title Section */}
      <div style={styles.brandContainer}>
        <h2 style={styles.brandTitle}>Aura Pen Saku</h2>
        <span style={styles.roleSubtext}>
          {role === 'teacher' ? 'TEACHER DASHBOARD' : role === 'student' ? 'STUDENT PORTAL' : 'ADMIN PORTAL'}
        </span>
      </div>

      {/* 🟢 Dynamic Navigation Menu */}
      <div style={styles.menuList}>
        {menuItems.map((item) => {
          const isActive = currentSubPage === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setCurrentSubPage(item.name)}
              style={{
                ...styles.navButton,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* 🔴 Bottom Logout Button */}
      <div style={styles.logoutContainer}>
        <button onClick={onLogoutClick} style={styles.logoutBtn}>
          Logout 🚪
        </button>
      </div>

    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    height: '100%',            // 🎯 Parent Container එකේ උසට විතරක් හිටිනවා
    maxHeight: '100vh',        // Screen එකෙන් එළියට යන්න දෙන්නේ නැහැ
    backgroundColor: '#0d5c2e', // Original Deep Green
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    boxSizing: 'border-box',
  },
  brandContainer: {
    paddingBottom: '12px',
    marginBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  },
  brandTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
  },
  roleSubtext: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#bbf7d0',
    letterSpacing: '0.8px',
    display: 'block',
    marginTop: '2px',
  },
  menuList: {
    flex: 1,                   // 🎯 ඉතිරි ඉඩ විතරක් ගන්නවා
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowY: 'auto',         // Menu items වැඩි වුණොත් විතරක් scroll වෙනවා
  },
  navButton: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',      // පොඩ්ඩක් Compact කළා ලස්සනට පේන්න
    border: 'none',
    outline: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.15s ease',
  },
  logoutContainer: {
    paddingTop: '10px',
    marginTop: 'auto',        // 🎯 අනිවාර්යයෙන්ම යටටම Lock වෙනවා
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
  },
  logoutBtn: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};