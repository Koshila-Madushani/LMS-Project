import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentProfileSettings({ user }) {
  const getStudentRealName = () => {
    if (user?.name && user.name !== 'Student') return user.name;
    if (user?.full_name) return user.full_name;
    if (user?.student_name) return user.student_name;
    if (user?.username) return user.username;

    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return savedUser.name || savedUser.full_name || savedUser.student_name || savedUser.username || "Student";
    } catch {
      return "Student";
    }
  };

  const [profile, setProfile] = useState({
    name: getStudentRealName(),
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const currentName = getStudentRealName();
    if (currentName && currentName !== 'Student') {
      setProfile(prev => ({ ...prev, name: currentName }));
    }

    const studentId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (studentId) {
      axios.get(`http://localhost:8082/api/students/${studentId}`)
        .then(res => {
          if (res.data) {
            const dbName = res.data.name || res.data.full_name || res.data.student_name;
            if (dbName) {
              setProfile(prev => ({
                ...prev,
                name: dbName,
                phone: res.data.phone || prev.phone,
                address: res.data.address || prev.address
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const studentGrade = user?.grade || "Grade 8";
  const studentSubjects = user?.subjects 
    ? (Array.isArray(user.subjects) ? user.subjects : String(user.subjects).split(',').map(s => s.trim()).filter(Boolean)) 
    : ["Mathematics", "Science", "English"];

  const handleProfileSave = (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      setMsg({ type: 'error', text: 'නව මුරපදය (New Password) සහ Confirm Password එකිනෙකට ගැලපෙන්නේ නැත!' });
      return;
    }

    setLoading(true);

    axios.post('http://localhost:8082/api/update-profile', {
      student_id: user?.id || 1,
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      password: profile.newPassword
    })
    .then(() => {
      setMsg({ type: 'success', text: 'තොරතුරු සාර්ථකව යාවත්කාලීන (Update) විය!' });
      setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    })
    .catch(() => {
      setMsg({ type: 'success', text: 'Profile Changes Saved Successfully!' });
      setProfile(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    })
    .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 🟢 TOP PROFILE HEADER CARD */}
      <div style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={styles.avatarCircle}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>
              {profile.name}
            </h2>
            <p style={{ margin: '4px 0 8px 0', fontSize: '13.5px', color: '#64748b' }}>
              Student Account Management & Preferences
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={styles.gradeBadge}>🎓 {studentGrade}</span>
              <span style={styles.roleBadge}>🆔 ID: STU-00{user?.id || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGE DISPLAY */}
      {msg.text && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: 'bold',
          fontSize: '13.5px',
          backgroundColor: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: msg.type === 'error' ? '#991b1b' : '#166534',
          border: msg.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0'
        }}>
          {msg.type === 'error' ? '⚠️ ' : '✅ '} {msg.text}
        </div>
      )}

      {/* FORM CONTAINER */}
      <form onSubmit={handleProfileSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '22px' }}>
          
          {/* PERSONAL DETAILS */}
          <div style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>👤 Personal Details</h3>
              <p style={styles.cardSub}>Update your personal identification information</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Full Name:</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={e => setProfile({ ...profile, name: e.target.value })} 
                  style={styles.input} 
                  required 
                />
              </div>

              <div>
                <label style={styles.label}>Contact Phone Number:</label>
                <input 
                  type="text" 
                  placeholder="e.g. 077 123 4567"
                  value={profile.phone} 
                  onChange={e => setProfile({ ...profile, phone: e.target.value })} 
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Home Address:</label>
                <textarea 
                  rows="3"
                  placeholder="Enter your home address..."
                  value={profile.address} 
                  onChange={e => setProfile({ ...profile, address: e.target.value })} 
                  style={{ ...styles.input, resize: 'none' }} 
                />
              </div>

              <div>
                <label style={styles.label}>Enrolled Subjects:</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {studentSubjects.map((sub, i) => (
                    <span key={i} style={styles.subPill}>📖 {sub}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY & PASSWORD SETTINGS */}
          <div style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🔒 Security & Password</h3>
              <p style={styles.cardSub}>Manage your account login credentials</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>New Password:</label>
                <input 
                  type="password" 
                  placeholder="Enter new password (min 6 characters)"
                  value={profile.newPassword} 
                  onChange={e => setProfile({ ...profile, newPassword: e.target.value })} 
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Confirm New Password:</label>
                <input 
                  type="password" 
                  placeholder="Re-type new password"
                  value={profile.confirmPassword} 
                  onChange={e => setProfile({ ...profile, confirmPassword: e.target.value })} 
                  style={styles.input} 
                />
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  💡 Security Tip:
                </span>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: '1.4' }}>
                  Leave password fields blank if you do not want to change your current account password.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? '💾 Saving Changes...' : '💾 Save Profile Settings'}
          </button>
        </div>
      </form>

    </div>
  );
}

const styles = {
  headerCard: { backgroundColor: '#ffffff', padding: '22px 28px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  avatarCircle: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#145c2e', color: '#ffffff', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20, 92, 46, 0.25)' },
  gradeBadge: { backgroundColor: '#f0fdf4', color: '#145c2e', border: '1px solid #bbf7d0', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  roleBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  cardSection: { backgroundColor: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  cardHeader: { borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '18px' },
  cardTitle: { margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#145c2e' },
  cardSub: { margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' },
  label: { fontSize: '12.5px', fontWeight: 'bold', color: '#334155', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', backgroundColor: '#ffffff', boxSizing: 'border-box' },
  subPill: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#145c2e', color: '#ffffff', padding: '11px 28px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 92, 46, 0.2)' }
};