import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    subject: '', 
    qualifications: '', 
    email: '', 
    phone_number: '', 
    address: '', 
    password: 'TC@123' 
  });
  
  // 🚨 Validation Errors මතක තබා ගන්නා State එක
  const [errors, setErrors] = useState({});

  const fetchTeachers = () => axios.get('http://localhost:8082/api/view-teachers').then(res => setTeachers(res.data));
  const fetchSubjects = () => axios.get('http://localhost:8082/api/view-subjects').then(res => setSubjects(res.data));

  useEffect(() => { fetchTeachers(); fetchSubjects(); }, []);

  // 🟢 SMART VALIDATION SECTION
  const validateForm = () => {
    let formErrors = {};

    // 1. නම හිස්දැයි බැලීම
    if (!formData.name.trim()) {
      formErrors.name = "Teacher's full name is required!";
    }

    // 2. Username සහ Password (අලුතින් ඇතුළත් කරද්දී පමණි)
    if (!isEditing) {
      if (!formData.username.trim()) formErrors.username = "Username is required!";
      if (!formData.password.trim()) {
        formErrors.password = "Password is required!";
      } else if (formData.password.length < 6) {
        formErrors.password = "Password must be at least 6 characters long!";
      }
    }

    // 3. විෂයක් තෝරාගෙන තිබේදැයි බැලීම
    if (!formData.subject) {
      formErrors.subject = "Please select a teaching subject!";
    }

    // 4. 📱 Sri Lankan 10-Digit Mobile Phone Validation
    const cleanPhone = formData.phone_number.replace(/[\s\-]/g, '');
    const phoneRegex = /^07[01245678][0-9]{7}$/;
    
    if (!formData.phone_number.trim()) {
      formErrors.phone_number = "Phone number is required!";
    } else if (!phoneRegex.test(cleanPhone)) {
      formErrors.phone_number = "Invalid number! Must be exactly 10 digits starting with 070-078.";
    }

    // 5. 📧 Smart Email Format Validation (@ සහ .com/.lk අනිවාර්ය වේ)
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.email.trim()) {
      formErrors.email = "Email address is required!";
    } else if (!emailRegex.test(formData.email)) {
      formErrors.email = "Invalid email format! Must include '@' and valid domain (e.g. teacher@gmail.com).";
    }

    // 6. ලිපිනය හිස්දැයි බැලීම
    if (!formData.address.trim()) {
      formErrors.address = "Physical address location is required!";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const apiPath = isEditing ? `http://localhost:8082/api/edit-teacher/${editId}` : 'http://localhost:8082/api/add-teacher';
    const method = isEditing ? axios.put : axios.post;

    method(apiPath, formData).then((res) => { 
        if(res.data.status === "Error") alert("Error: " + res.data.error); 
        else { fetchTeachers(); resetForm(); }
    }).catch(() => alert("Server Error!"));
  };

  const handleEdit = (t) => {
    setIsEditing(true); setEditId(t.id);
    setFormData({ 
      name: t.name, 
      username: t.username || '', 
      subject: t.Subject || '', 
      qualifications: t.qualifications || '', 
      email: (t.email || '').toLowerCase().trim(), 
      phone_number: t.phone_number, 
      address: t.address || '', 
      password: 'TC@123' 
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      axios.delete(`http://localhost:8082/api/delete-teacher/${id}`).then(() => fetchTeachers());
    }
  };

  const resetForm = () => { 
    setShowForm(false); 
    setIsEditing(false); 
    setEditId(null); 
    setErrors({}); 
    setFormData({ name: '', username: '', subject: '', qualifications: '', email: '', phone_number: '', address: '', password: 'TC@123' }); 
  };

  const filteredTeachers = teachers.filter(t => (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>🧑‍🏫 Manage Teachers</h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <input type="text" placeholder="Search Teacher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
            <button onClick={() => {resetForm(); setShowForm(true);}} style={styles.primaryBtn}>+ Add New Teacher</button>
          </div>
        </div>

        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={styles.th}>No.</th>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Teaching Subject</th>
              <th style={{...styles.th, width: '200px'}}>Qualifications</th>
              <th style={styles.th}>Phone Number</th>
              <th style={{...styles.th, minWidth: '230px'}}>Email</th>
              <th style={styles.th}>Address</th>
              <th style={{...styles.th, textAlign: 'center', width: '60px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredTeachers].sort((a, b) => b.id - a.id).map((t, index) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={styles.td}>{filteredTeachers.length - index}</td>
                <td style={{...styles.td, fontWeight: 'bold', color: '#15803d', whiteSpace: 'nowrap'}}>{t.name}</td>
                <td style={{...styles.td, color: '#0369a1', fontSize: '13px', whiteSpace: 'nowrap'}}>{t.Subject || '-'}</td>
                
                {/* QUALIFICATIONS COLUMN WITH SAFE WRAP */}
                <td style={{
                  ...styles.td, 
                  color: '#64748b', 
                  fontSize: '12.5px', 
                  maxWidth: '200px', 
                  whiteSpace: 'normal', 
                  wordBreak: 'break-word',
                  lineHeight: '1.4'
                }}>
                  {t.qualifications || '-'}
                </td>
                
                <td style={{...styles.td, whiteSpace: 'nowrap'}}>{t.phone_number}</td>

                {/* 🟢 EMAIL COLUMN (NOW SINGLE LINE - NO WRAPPING) */}
                <td style={{
                  ...styles.td, 
                  color: '#475569', 
                  fontSize: '13px', 
                  whiteSpace: 'nowrap'
                }}>
                  {t.email || 'No Email'}
                </td>

                <td style={{...styles.td, color: '#475569', fontSize: '13px'}}>{t.address || 'No Address'}</td>
                
                {/* 🟢 VERTICALLY STACKED ACTION BUTTONS */}
                <td style={{ ...styles.td, textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                    <button onClick={() => handleEdit(t)} title="Edit Teacher" style={styles.iconBtn}>✏️</button>
                    <button onClick={() => handleDelete(t.id)} title="Delete Teacher" style={styles.iconBtn}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>{isEditing ? '✏️ Edit Teacher Details' : '➕ Register New Faculty'}</h3>
            
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Full Name Input Block */}
              <div style={styles.inputWrapper}>
                <input 
                  type="text" 
                  placeholder="Teacher Full Name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  style={{...styles.input, border: errors.name ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                />
                {errors.name && <span style={styles.errorText}>⚠️ {errors.name}</span>}
              </div>

              {/* Credentials Fields Group (Add Mode Only) */}
              {!isEditing && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Login Username" 
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value})} 
                      style={{...styles.input, border: errors.username ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                    />
                    {errors.username && <span style={styles.errorText}>⚠️ {errors.username}</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Password" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      style={{...styles.input, border: errors.password ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                    />
                    {errors.password && <span style={styles.errorText}>⚠️ {errors.password}</span>}
                  </div>
                </div>
              )}

              {/* Subject Dropdown Select Block */}
              <div style={styles.inputWrapper}>
                <select 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})} 
                  style={{...styles.input, border: errors.subject ? '1px solid #dc2626' : '1px solid #cbd5e1'}}
                >
                  <option value="">-- Select Teaching Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.subject_name}>{s.subject_name}</option>)}
                </select>
                {errors.subject && <span style={styles.errorText}>⚠️ {errors.subject}</span>}
              </div>

              {/* Qualifications Block */}
              <input 
                type="text" 
                placeholder="Qualifications (e.g., B.Sc. Physical Science)" 
                value={formData.qualifications} 
                onChange={e => setFormData({...formData, qualifications: e.target.value})} 
                style={styles.input} 
              />
              
              {/* Phone and Email Grid Blocks */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input 
                    type="text" 
                    placeholder="Phone Number" 
                    value={formData.phone_number} 
                    onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                    style={{...styles.input, border: errors.phone_number ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                  />
                  {errors.phone_number && <span style={styles.errorText}>⚠️ {errors.phone_number}</span>}
                </div>
                
                {/* SMART AUTO-LOWERCASE EMAIL INPUT */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input 
                    type="email" 
                    placeholder="Email (e.g. teacher@gmail.com)" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value.toLowerCase().trim()})} 
                    style={{...styles.input, border: errors.email ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                  />
                  {errors.email && <span style={styles.errorText}>⚠️ {errors.email}</span>}
                </div>
              </div>

              {/* Physical Address Block */}
              <div style={styles.inputWrapper}>
                <input 
                  type="text" 
                  placeholder="Physical Address" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  style={{...styles.input, border: errors.address ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                />
                {errors.address && <span style={styles.errorText}>⚠️ {errors.address}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>{isEditing ? 'Update Details' : 'Save Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  searchInput: { padding: '8px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', width: '220px', fontSize: '13px', backgroundColor: '#f8fafc' },
  primaryBtn: { padding: '8px 15px', backgroundColor: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  th: { padding: '12px 10px', color: '#64748b', fontWeight: 'bold', fontSize: '13px' },
  td: { padding: '12px 10px', fontSize: '14px', verticalAlign: 'top' },
  iconBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  input: { padding: '10px 15px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '13px', backgroundColor: '#f8fafc', transition: 'all 0.2s' },
  cancelBtn: { padding: '10px 20px', background: 'none', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  saveBtn: { padding: '10px 20px', backgroundColor: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' },
  errorText: { color: '#dc2626', fontSize: '11px', fontWeight: '500', marginTop: '1px', display: 'block', textAlign: 'left' }
};