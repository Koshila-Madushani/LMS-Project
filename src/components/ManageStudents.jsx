import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', username: '', grade: 'Grade 10', subjects: '', 
    phone_number: '', email: '', address: '', password: 'ST@123' 
  });
  
  // 🚨 Validation Errors State
  const [errors, setErrors] = useState({});

  const fetchStudents = () => axios.get('http://localhost:8082/api/view-students').then(res => setStudents(res.data));
  const fetchSubjects = () => axios.get('http://localhost:8082/api/view-subjects').then(res => setAvailableSubjects(res.data));

  useEffect(() => { fetchStudents(); fetchSubjects(); }, []);

  // 🟢 SMART STUDENT VALIDATION SECTION
  const validateForm = () => {
    let formErrors = {};

    // 1. ශිෂ්‍යයාගේ නම
    if (!formData.name.trim()) {
      formErrors.name = "Student's full name is required!";
    }

    // 2. Username සහ Password (අලුතින් ඇතුළත් කරද්දී පමණි)
    if (!isEditing) {
      if (!formData.username.trim()) formErrors.username = "Login username is required!";
      if (!formData.password.trim()) {
        formErrors.password = "Password is required!";
      } else if (formData.password.length < 6) {
        formErrors.password = "Password must be at least 6 characters long!";
      }
    }

    // 3. විෂයන් අවම එකක්වත් තෝරාගෙන තිබේදැයි බැලීම
    if (!formData.subjects || formData.subjects.trim() === '') {
      formErrors.subjects = "Please select at least one course/subject for enrollment!";
    }

    // 4. ශ්‍රේණිය (Grade)
    if (!formData.grade.trim()) {
      formErrors.grade = "Grade level specification is required!";
    }

    // 5. 📱 Sri Lankan Mobile Validation
    const cleanPhone = formData.phone_number.replace(/[\s\-]/g, '');
    const phoneRegex = /^07[01245678][0-9]{7}$/;
    
    if (!formData.phone_number.trim()) {
      formErrors.phone_number = "Contact number is required!";
    } else if (!phoneRegex.test(cleanPhone)) {
      formErrors.phone_number = "Invalid number! Must be exactly 10 digits starting with 070-078.";
    }

    // 6. 📧 Smart Email Format Validation (@ සහ .com / valid domain අනිවාර්ය වේ)
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.email.trim()) {
      formErrors.email = "Student email address is required!";
    } else if (!emailRegex.test(formData.email)) {
      formErrors.email = "Invalid email format! Must include '@' and valid domain (e.g. student@gmail.com).";
    }

    // 7. ලිපිනය
    if (!formData.address.trim()) {
      formErrors.address = "Home address location is required!";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const apiPath = isEditing ? `http://localhost:8082/api/update-student/${editId}` : 'http://localhost:8082/api/add-student';
    const method = isEditing ? axios.put : axios.post;

    method(apiPath, formData).then((res) => { 
        if(res.data.status === "Error") {
          alert("Error: " + res.data.error);
        } else { 
          fetchStudents(); 
          resetForm(); 
        }
    }).catch(() => alert("Server Communication Error!"));
  };

  const handleEdit = (s) => {
    setIsEditing(true); 
    setEditId(s.id);
    setFormData({ 
      name: s.name || '', 
      grade: s.grade || '', 
      subjects: s.subjects || '', 
      phone_number: s.phone_number || '', 
      email: (s.email || '').toLowerCase().trim(), 
      address: s.address || '', 
      username: '', 
      password: '' 
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      axios.delete(`http://localhost:8082/api/delete-student/${id}`).then(() => fetchStudents());
    }
  };

  const resetForm = () => { 
    setShowForm(false); 
    setIsEditing(false); 
    setEditId(null); 
    setErrors({}); 
    setFormData({ 
      name: '', username: '', grade: 'Grade 10', subjects: '', 
      phone_number: '', email: '', address: '', password: 'ST@123' 
    }); 
  };

  const filteredStudents = students.filter(s => (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  // 🟢 Bulletproof Checkbox Verification logic
  const isSubjectChecked = (subjectName) => {
    if (!formData.subjects) return false;
    const currentList = formData.subjects.split(',').map(s => s.trim().toLowerCase());
    return currentList.includes(subjectName.trim().toLowerCase());
  };

  const handleCheckboxToggle = (subjectName, isChecked) => {
    let currentArray = formData.subjects ? formData.subjects.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    if (isChecked) {
      if (!currentArray.some(s => s.toLowerCase() === subjectName.toLowerCase())) {
        currentArray.push(subjectName);
      }
    } else {
      currentArray = currentArray.filter(s => s.toLowerCase() !== subjectName.toLowerCase());
    }
    
    setFormData({ ...formData, subjects: currentArray.join(', ') });
  };

  return (
    <div style={{ padding: '10px 0', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👨‍🎓 Manage Students
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
            <button onClick={() => {resetForm(); setShowForm(true);}} style={styles.primaryBtn}>+ Register Student</button>
          </div>
        </div>

        {/* DATA TABLE */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={styles.th}>No.</th>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Grade</th>
              <th style={{...styles.th, minWidth: '180px'}}>Enrolled Subjects</th>
              <th style={styles.th}>Phone Number</th>
              <th style={{...styles.th, minWidth: '220px'}}>Email</th>
              <th style={styles.th}>Address</th>
              <th style={{...styles.th, textAlign: 'center', width: '50px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredStudents].sort((a, b) => b.id - a.id).map((s, index) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={styles.td}>{filteredStudents.length - index}</td>
                <td style={{...styles.td, fontWeight: 'bold', color: '#145c2e', whiteSpace: 'nowrap'}}>{s.name}</td>
                <td style={{...styles.td, color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap'}}>{s.grade}</td>
                
                {/* 🟢 ENROLLED SUBJECTS BADGES */}
                <td style={styles.td}>
                  {s.subjects ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {s.subjects.split(',').map((sub, idx) => (
                        <span key={idx} style={styles.subjectBadge}>
                          {sub.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>No Enrolled Subjects</span>
                  )}
                </td>

                <td style={{...styles.td, whiteSpace: 'nowrap'}}>{s.phone_number}</td>
                <td style={{...styles.td, color: '#475569', fontSize: '13px', whiteSpace: 'nowrap'}}>{s.email || 'No Email'}</td>
                <td style={{...styles.td, color: '#475569'}}>{s.address || 'No Address'}</td>
                
                {/* ACTIONS */}
                <td style={{...styles.td, textAlign: 'center', verticalAlign: 'middle'}}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                    <button onClick={() => handleEdit(s)} title="Edit Student" style={styles.iconBtn}>✏️</button>
                    <button onClick={() => handleDelete(s.id)} title="Delete Student" style={styles.iconBtn}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13.5px' }}>
                  No student records registered in the database repository.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REGISTRATION & EDIT MODAL */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>
                {isEditing ? '✏️ Edit Student Profile' : '➕ Physical Student Registration'}
              </h3>
              <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>✖</button>
            </div>
            
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Name Block */}
              <div style={styles.inputWrapper}>
                <input type="text" placeholder="Student Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{...styles.input, border: errors.name ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {errors.name && <span style={styles.errorText}>⚠️ {errors.name}</span>}
              </div>
              
              {/* Credentials Grid Block (Add Mode Only) */}
              {!isEditing && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input type="text" placeholder="Login Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{...styles.input, border: errors.username ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                    {errors.username && <span style={styles.errorText}>⚠️ {errors.username}</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input type="text" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{...styles.input, border: errors.password ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                    {errors.password && <span style={styles.errorText}>⚠️ {errors.password}</span>}
                  </div>
                </div>
              )}
              
              {/* Grade Block */}
              <div style={styles.inputWrapper}>
                <input type="text" placeholder="Grade level (e.g., Grade 10)" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} style={{...styles.input, border: errors.grade ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {errors.grade && <span style={styles.errorText}>⚠️ {errors.grade}</span>}
              </div>
              
              {/* SUBJECT CHECKBOXES */}
              <div style={{ padding: '12px', border: errors.subjects ? '1px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#145c2e', fontWeight: 'bold' }}>Select Course Enrollment:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {availableSubjects.map(sub => (
                    <label key={sub.id} style={{ fontSize: '13px', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSubjectChecked(sub.subject_name)}
                        onChange={(e) => handleCheckboxToggle(sub.subject_name, e.target.checked)}
                        style={{ accentColor: '#145c2e', cursor: 'pointer' }}
                      /> {sub.subject_name}
                    </label>
                  ))}
                </div>
                {errors.subjects && <span style={{...styles.errorText, marginTop: '6px'}}>⚠️ {errors.subjects}</span>}
              </div>
              
              {/* Phone and Email */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input type="text" placeholder="Contact Number (07X...)" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} style={{...styles.input, border: errors.phone_number ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                  {errors.phone_number && <span style={styles.errorText}>⚠️ {errors.phone_number}</span>}
                </div>
                
                {/* 🟢 SMART AUTO-LOWERCASE & VALIDATED EMAIL INPUT */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input 
                    type="email" 
                    placeholder="Student Email Address" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value.toLowerCase().trim()})} 
                    style={{...styles.input, border: errors.email ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
                  />
                  {errors.email && <span style={styles.errorText}>⚠️ {errors.email}</span>}
                </div>
              </div>

              {/* Address */}
              <div style={styles.inputWrapper}>
                <input type="text" placeholder="Home Address Location" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{...styles.input, border: errors.address ? '1px solid #dc2626' : '1px solid #cbd5e1'}} />
                {errors.address && <span style={styles.errorText}>⚠️ {errors.address}</span>}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>{isEditing ? 'Update Details' : 'Register Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  searchInput: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', width: '220px', fontSize: '13px', backgroundColor: '#f8fafc' },
  primaryBtn: { padding: '8px 16px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  th: { padding: '12px 10px', color: '#64748b', fontWeight: 'bold', fontSize: '12.5px' },
  td: { padding: '12px 10px', fontSize: '13px', color: '#334155', verticalAlign: 'top' },
  subjectBadge: { backgroundColor: '#f0fdf4', color: '#145c2e', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '600', display: 'inline-block' },
  iconBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '13px', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '520px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  input: { padding: '9px 13px', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '13px', backgroundColor: '#f8fafc' },
  cancelBtn: { padding: '9px 18px', background: 'none', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  saveBtn: { padding: '9px 18px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' },
  errorText: { color: '#dc2626', fontSize: '11px', fontWeight: '500', marginTop: '1px', display: 'block', textAlign: 'left' }
};