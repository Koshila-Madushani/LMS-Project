import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [subjectCode, setSubjectCode] = useState(''); 
  const [subjectName, setSubjectName] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // 🚨 Validation Errors මතක තබා ගන්නා අලුත් State එක
  const [errors, setErrors] = useState({});

  const fetchSubjects = () => axios.get('http://localhost:8082/api/view-subjects').then(res => setSubjects(res.data));
  
  useEffect(() => { fetchSubjects(); }, []);

  // 🟢 විෂය දත්ත පරික්ශා කරන වැලිඩේෂන් ෆන්ක්ෂන් එක
  const validateForm = () => {
    let formErrors = {};

    // 1. Subject Code Validation (හිස්දැයි බැලීම සහ දිග පරික්ශා කිරීම)
    if (!subjectCode.trim()) {
      formErrors.subjectCode = "Subject code is required!";
    } else if (subjectCode.trim().length > 10) {
      formErrors.subjectCode = "Code too long! Maximum 10 characters allowed.";
    }

    // 2. Subject Name Validation (හිස්දැයි බැලීම සහ ඉලක්කම් ඇතුළත් කර ඇත්දැයි බැලීම)
    if (!subjectName.trim()) {
      formErrors.subjectName = "Subject name cannot be empty!";
    } else if (/[0-9]/.test(subjectName)) {
      formErrors.subjectName = "Subject name cannot contain numeric digits!";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // වැලිඩේෂන් එක හරියටම පාස් වුණොත් විතරක් API එකට ඩේටා යවයි
    if (!validateForm()) return;

    const apiPath = isEditing ? `http://localhost:8082/api/edit-subject/${editId}` : 'http://localhost:8082/api/add-subject';
    const method = isEditing ? axios.put : axios.post;

    method(apiPath, { subject_code: subjectCode, subject_name: subjectName })
      .then((res) => {
        if (res.data.status === "Error") alert("Error: " + res.data.error);
        else { 
            fetchSubjects(); 
            resetForm(); 
        }
      }).catch(() => alert("Error saving subject!"));
  };

  const handleEdit = (s) => {
    setIsEditing(true);
    setEditId(s.id);
    setSubjectCode(s.subject_code);
    setSubjectName(s.subject_name);
    setErrors({}); // Edit කරද්දී පරණ වැරදි මැකීම
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      axios.delete(`http://localhost:8082/api/delete-subject/${id}`).then(() => fetchSubjects());
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setSubjectCode('');
    setSubjectName('');
    setErrors({}); // එරර් ස්ටේට් එක හිස් කිරීම
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📚 Manage Subjects
        </h2>
      </div>

      {/* Add / Edit Subject Form */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '16px' }}>
            {isEditing ? '✏️ Edit Subject Details' : '➕ Add New Subject'}
        </h3>
        
        {/* Native HTML tooltip වැළැක්වීමට noValidate යෙදුවා */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          
          {/* Subject Code Field Wrapper */}
          <div style={styles.inputWrapper}>
            <input 
              type="text" 
              placeholder="Subject Code (e.g. SUB05)" 
              value={subjectCode} 
              onChange={(e) => setSubjectCode(e.target.value)} 
              style={{...styles.input, border: errors.subjectCode ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
            />
            {errors.subjectCode && <span style={styles.errorText}>⚠️ {errors.subjectCode}</span>}
          </div>
          
          {/* Subject Name Field Wrapper */}
          <div style={{...styles.inputWrapper, flex: 1}}>
            <input 
              type="text" 
              placeholder="Enter subject name..." 
              value={subjectName} 
              onChange={(e) => setSubjectName(e.target.value)} 
              style={{...styles.input, width: '100%', border: errors.subjectName ? '1px solid #dc2626' : '1px solid #cbd5e1'}} 
            />
            {errors.subjectName && <span style={styles.errorText}>⚠️ {errors.subjectName}</span>}
          </div>

          <button type="submit" style={{...styles.saveBtn, marginTop: '0px'}}>
            {isEditing ? 'Update Subject' : '+ Add Subject'}
          </button>
          
          {isEditing && (
              <button type="button" onClick={resetForm} style={{...styles.cancelBtn, marginTop: '0px'}}>
                  Cancel
              </button>
          )}
        </form>
      </div>

      {/* Subjects Table */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={styles.th}>Subject ID</th>
              <th style={styles.th}>Subject Code</th>
              <th style={styles.th}>Subject Name</th>
              <th style={{...styles.th, textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? subjects.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{...styles.td, color: '#64748b'}}>#{s.id}</td>
                <td style={{...styles.td, fontWeight: 'bold', color: '#0369a1'}}>{s.subject_code}</td>
                <td style={{...styles.td, fontSize: '15px', fontWeight: 'bold', color: '#15803d'}}>{s.subject_name}</td>
                <td style={{...styles.td, textAlign: 'center'}}>
                  <button onClick={() => handleEdit(s)} style={styles.editBtn}>✏️ Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={styles.deleteBtn}>🗑️ Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  No subjects added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

const styles = {
  input: { padding: '12px 15px', borderRadius: '8px', outline: 'none', fontSize: '13px', width: '250px', backgroundColor: '#f8fafc', boxSizing: 'border-box', transition: 'all 0.2s' },
  saveBtn: { padding: '12px 25px', backgroundColor: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' },
  cancelBtn: { padding: '12px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  th: { padding: '12px 10px', color: '#64748b', fontWeight: 'bold', fontSize: '13px' },
  td: { padding: '15px 10px', fontSize: '14px', verticalAlign: 'middle' },
  editBtn: { padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginRight: '8px' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: '4px' },
  // 🔴 එරර් මැසේජ් පෙන්වීමට ස්ටයිල් එක
  errorText: { color: '#dc2626', fontSize: '11px', fontWeight: '500', marginTop: '2px', display: 'block', textAlign: 'left' }
};