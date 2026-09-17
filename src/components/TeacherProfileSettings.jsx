import React, { useState } from 'react';
import axios from 'axios';

export default function TeacherProfileSettings({ userName, userUsername, subject, qualifications, email, phone, address, handleLogout }) {
  
  // Local Form States
  const [newUsername, setNewUsername] = useState(userUsername || 'buddhika');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateCredentials = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      currentUsername: userUsername,
      newUsername: newUsername,
      newPassword: newPassword || 'Teacher@123'
    };

    // Update credential node parameters via Port 8082 bridge
    axios.post('http://localhost:8082/api/update-teacher-credentials', payload)
      .then(res => {
        if (res.data.status === "Success") {
          alert("✅ Profile Credentials Updated Successfully! Logging out...");
          handleLogout(); 
        } else {
          alert("❌ Update Failed: " + (res.data.message || "System error encountered during write."));
        }
      })
      .catch(err => {
        console.error("Profile Update Error:", err);
        alert("❌ Error: Could not connect to backend server.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* PAGE HEADER: 100% CLEAN ENGLISH */}
      <div>
        <h2 style={{ color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          👤 Account & Profile Management
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>
          Review your academic profile credentials and maintain system access security protocols.
        </p>
      </div>

      {/* 2-COLUMN MODERN GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: PROFESSIONAL PROFILE CARD */}
        <div style={styles.profileCard}>
          <div style={styles.cardBanner}></div>
          
          <div style={styles.avatarContainer}>
            <div style={styles.avatarCircle}>
              {userName ? userName.charAt(0) : 'B'}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px', padding: '0 20px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>
              {userName || 'Buddhika Darshani'}
            </h3>
            <span style={styles.badge}>
              {subject || 'Mathematics'} Senior Educator
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '20px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 15px' }}>
            <div>
              <label style={styles.metaLabel}>Academic Qualifications</label>
              <div style={styles.metaValue}>{qualifications || 'B.Sc. (Hons) in Mathematics, University of Colombo'}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={styles.metaLabel}>Email Address</label>
                <div style={{ ...styles.metaValue, fontSize: '12.5px', wordBreak: 'break-all' }}>{email || 'buddhika@aurapen.lk'}</div>
              </div>
              <div>
                <label style={styles.metaLabel}>Contact Mobile</label>
                <div style={styles.metaValue}>{phone || '0771234567'}</div>
              </div>
            </div>

            <div>
              <label style={styles.metaLabel}>Official Campus Address</label>
              <div style={styles.metaValue}>{address || 'Mirigama'}</div>
            </div>
          </div>

          <div style={styles.miniStatsContainer}>
            <div style={styles.miniStatBox}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#145c2e' }}>03</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned Grades</span>
            </div>
            <div style={styles.miniStatBox}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>Live</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>LMS Portal Status</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY CREDENTIALS FORM (DRESSED IN AURA GREEN) */}
        <div style={styles.card('#145c2e')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>
              🔒 Security Gateway & Login Records
            </h3>
            <span style={{ fontSize: '11px', color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
              Role: Teacher Account
            </span>
          </div>

          <form onSubmit={handleUpdateCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={styles.inputLabel}>Registered Full Name (Read-Only)</label>
              <input 
                type="text" 
                value={userName || 'Buddhika Darshani'} 
                disabled 
                style={{ ...styles.fullInput, backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', fontWeight: 'bold' }} 
              />
            </div>

            <div>
              <label style={styles.inputLabel}>LMS Username *</label>
              <input 
                type="text" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                required 
                placeholder="buddhika"
                style={styles.fullInput} 
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                The primary unique username used to authenticate and access the core LMS framework.
              </span>
            </div>

            <div>
              <label style={styles.inputLabel}>New Security Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Type new secure password to change..." 
                style={styles.fullInput} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                ...styles.btn, 
                backgroundColor: isSubmitting ? '#cbd5e1' : '#145c2e',
                marginTop: '10px',
                boxShadow: '0 4px 12px rgba(20, 92, 46, 0.15)' 
              }}
            >
              {isSubmitting ? 'Updating System Records...' : 'Save Profile Records 💾'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

const styles = {
  profileCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', paddingBottom: '25px', display: 'flex', flexDirection: 'column' },
  cardBanner: { height: '90px', background: 'linear-gradient(135deg, #145c2e 0%, #15803d 100%)', width: '100%' }, // 🟢 Updated to Brand Aura Green Gradient
  avatarContainer: { display: 'flex', justifyContent: 'center', marginTop: '-45px' },
  avatarCircle: { width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', color: 'white', fontSize: '36px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }, // 🟢 Updated to Green Gradient
  badge: { display: 'inline-block', backgroundColor: '#dcfce7', color: '#145c2e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginTop: '6px' }, // 🟢 Dressed in Mint Green Badge Accent
  metaLabel: { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' },
  metaValue: { fontSize: '13.5px', color: '#334155', fontWeight: '600', lineHeight: '1.4' },
  miniStatsContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 20px', marginTop: '25px' },
  miniStatBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' },
  card: (color) => ({ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.01)', borderTop: `6px solid ${color}`, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }),
  fullInput: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#334155', fontWeight: '500' },
  inputLabel: { display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' },
  btn: { color: 'white', border: 'none', padding: '13px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }
};