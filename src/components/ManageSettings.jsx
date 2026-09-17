import React, { useState } from 'react';

export default function ManageSettings() {
  // 🏫 Real Institution Profile & Branding States
  const [instituteName, setInstituteName] = useState("AuraPen 'Saku' Education Institute");
  const [contactEmail, setContactEmail] = useState('info@aurapen.lk');
  const [contactPhone, setContactPhone] = useState('076 612 7786'); 
  const [address, setAddress] = useState('Opposite Bandaranaike Maha Vidyalaya, Mirigama'); 

  // 🔒 Admin Password Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 🌐 System Control Knobs (Toggles)
  const [allowStudentLogin, setAllowStudentLogin] = useState(true);
  const [allowTeacherLogin, setAllowTeacherLogin] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // 🚨 Validation Errors States
  const [profileErrors, setProfileErrors] = useState({});
  const [securityErrors, setSecurityErrors] = useState({});

  // 🟢 Profile Form Validation
  const handleSaveProfile = (e) => {
    e.preventDefault();
    let errors = {};

    if (!instituteName.trim()) {
      errors.name = "Institute name cannot be empty!";
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!contactEmail.trim()) {
      errors.email = "Email address is required!";
    } else if (/[A-Z]/.test(contactEmail)) {
      errors.email = "Email must contain lowercase (simple) letters only!";
    } else if (!emailRegex.test(contactEmail)) {
      errors.email = "Invalid email format!";
    }

    const cleanPhone = contactPhone.replace(/[\s\-]/g, '');
    const mobileRegex = /^07[01245678][0-9]{7}$/;
    const landlineRegex = /^0[12345689][0-9]{8}$/;
    
    if (!contactPhone.trim()) {
      errors.phone = "Phone number is required!";
    } else if (!mobileRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
      errors.phone = "Invalid Sri Lankan phone number format!";
    }

    if (!address.trim()) {
      errors.address = "Physical address location is required!";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
    } else {
      setProfileErrors({});
      alert("✅ Institution Profile updated successfully!");
    }
  };

  // 🟢 Admin Password Form Validation
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    let errors = {};

    if (!currentPassword) {
      errors.current = "Current admin password is required!";
    }
    if (!newPassword) {
      errors.new = "New password cannot be empty!";
    } else if (newPassword.length < 6) {
      errors.new = "Password must be at least 6 characters long!";
    }
    if (!confirmPassword) {
      errors.confirm = "Please re-type new password!";
    } else if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match!";
    }

    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
    } else {
      setSecurityErrors({});
      alert("🔒 Admin Password Rotated Successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div style={{ padding: '10px 0', fontFamily: 'sans-serif', color: '#334155' }}>
      
      <h2 style={{ margin: '0 0 25px 0', color: '#1e293b', fontSize: '22px', fontWeight: 'bold' }}>
        ⚙️ Master System Settings Desk
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
        
        {/* LEFT COLUMN: GENERAL CONFIGURATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Institute Profile Card */}
          <div style={styles.settingsCard}>
            <h3 style={styles.cardTitle}>🏫 Institution Metadata & Branding</h3>
            <p style={styles.cardSubtitle}>Configure official data fields extracted by the document layout generators.</p>
            
            <form onSubmit={handleSaveProfile} noValidate style={styles.formGrid}>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Institute Registered Name</label>
                <input type="text" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} style={{...styles.input, border: profileErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {profileErrors.name && <span style={styles.errorText}>⚠️ {profileErrors.name}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Official Communication Email</label>
                <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={{...styles.input, border: profileErrors.email ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {profileErrors.email && <span style={styles.errorText}>⚠️ {profileErrors.email}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Helpdesk Hotline</label>
                <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{...styles.input, border: profileErrors.phone ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {profileErrors.phone && <span style={styles.errorText}>⚠️ {profileErrors.phone}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Physical Address Location</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={{...styles.input, width: '100%', border: profileErrors.address ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {profileErrors.address && <span style={styles.errorText}>⚠️ {profileErrors.address}</span>}
              </div>

              <button type="submit" style={styles.saveBtn}>Save Institution Profile</button>
            </form>
          </div>

          {/* Core System Knobs */}
          <div style={styles.settingsCard}>
            <h3 style={styles.cardTitle}>🌐 Operational Environment Knobs</h3>
            <p style={styles.cardSubtitle}>Toggle network gateways and active student portal authorization blocks.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <div style={styles.toggleRow}>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>Allow Student Portal Login Access</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>If disabled, physically registered students cannot log in to check timetables.</p>
                </div>
                <input type="checkbox" checked={allowStudentLogin} onChange={(e) => setAllowStudentLogin(e.target.checked)} style={styles.checkbox} />
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>Allow Teacher Portal Database Modifications</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Controls whether faculty handles grading sheets online.</p>
                </div>
                <input type="checkbox" checked={allowTeacherLogin} onChange={(e) => setAllowTeacherLogin(e.target.checked)} style={styles.checkbox} />
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#b91c1c' }}>🚨 Server Maintenance Overhaul Mode</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Locks frontend routing modules down entirely for urgent internal testing schedules.</p>
                </div>
                <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} style={styles.checkbox} />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ADMIN SECURITY & TECHNICAL ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Admin Security Card */}
          <div style={styles.settingsCard}>
            <h3 style={styles.cardTitle}>🔒 Administrative Password & Security</h3>
            <p style={styles.cardSubtitle}>Update system administrator account login password.</p>
            
            <form onSubmit={handleUpdatePassword} noValidate style={{ ...styles.formGrid, marginTop: '20px' }}>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Active Admin Password</label>
                <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{...styles.input, border: securityErrors.current ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {securityErrors.current && <span style={styles.errorText}>⚠️ {securityErrors.current}</span>}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', margin: '5px 0' }}></div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>New Admin Password</label>
                <input type="password" placeholder="Minimum 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{...styles.input, border: securityErrors.new ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {securityErrors.new && <span style={styles.errorText}>⚠️ {securityErrors.new}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Re-Type New Admin Password</label>
                <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{...styles.input, border: securityErrors.confirm ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {securityErrors.confirm && <span style={styles.errorText}>⚠️ {securityErrors.confirm}</span>}
              </div>

              <button type="submit" style={{ ...styles.saveBtn, backgroundColor: '#1e293b' }}>Update Admin Password 🔑</button>
            </form>
          </div>

          {/* Technical Diagnostics Utilities (DRESSED IN BRAND GREEN) */}
          <div style={styles.settingsCard}>
            <h3 style={styles.cardTitle}>🛠️ Core System Utilities</h3>
            <p style={styles.cardSubtitle}>Trigger low-level system diagnostic queries manually.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
              <button onClick={() => alert("🔄 Sync Complete!")} style={styles.utilBtnPrimary}>
                🔄 Flush App Buffers & Sync Cache
              </button>
              <button onClick={() => alert("📂 Backup successful!")} style={styles.utilBtnSecondary}>
                📁 Backup System Log Tables
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

const styles = {
  settingsCard: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' },
  cardTitle: { margin: '0 0 5px 0', fontSize: '15px', color: '#1e293b', fontWeight: 'bold' },
  cardSubtitle: { margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12.5px', color: '#475569', fontWeight: '600' },
  input: { padding: '10px 12px', borderRadius: '8px', outline: 'none', fontSize: '13px', backgroundColor: '#f8fafc', color: '#334155', transition: 'all 0.2s', boxSizing: 'border-box' },
  saveBtn: { padding: '10px 15px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginTop: '5px' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#145c2e' },
  
  // 🟢 FIXED: Updated Core System Utilities button colors to match Aura Green Theme
  utilBtnPrimary: { width: '100%', padding: '11px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center', boxShadow: '0 4px 10px rgba(20, 92, 46, 0.15)' },
  utilBtnSecondary: { width: '100%', padding: '11px', backgroundColor: '#ffffff', color: '#145c2e', border: '1px solid #145c2e', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' },
  
  errorText: { color: '#dc2626', fontSize: '11.5px', fontWeight: '500', marginTop: '3px', display: 'flex', alignItems: 'center' }
};