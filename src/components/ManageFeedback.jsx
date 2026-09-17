import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageFeedback() {
  // 🟢 FIXED: හාඩ්කෝඩ් කළ පරණ Fake Data සියල්ල අයින් කර පිරිසිදු ඩේටාබේස් ඇරේ එකක් භාවිතය
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 🟢 ඩේටාබේස් එකෙන් ලයිව් දත්ත ලබාගැනීම
  const fetchFeedbacks = () => {
    axios.get('http://localhost:8082/api/feedbacks')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setFeedbacks(res.data);
        }
      })
      .catch(err => console.error("Error connecting to feedback repository:", err));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // 🟢 Counts ගණනය කිරීම
  const isArrayValid = Array.isArray(feedbacks);
  const totalCount = isArrayValid ? feedbacks.length : 0;
  const pendingCount = isArrayValid ? feedbacks.filter(f => f.status === 'Pending').length : 0;
  const averageRating = totalCount > 0 
    ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalCount).toFixed(1) 
    : "0.0";

  // 🟢 Search and Filter Logic
  const filteredFeedbacks = isArrayValid 
    ? feedbacks.filter(f => {
        const matchesSearch = (f.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (f.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const handleMarkAsReviewed = (id) => {
    setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'Reviewed' } : f));
    setSelectedFeedback(null);
    alert("✅ Feedback successfully marked as Reviewed!");
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this feedback record?")) {
      setFeedbacks(feedbacks.filter(f => f.id !== id));
      alert("🗑️ Feedback record deleted successfully!");
    }
  };

  const renderStars = (rating) => "⭐".repeat(rating || 0);

  return (
    <div style={{ padding: '10px 0', fontFamily: 'sans-serif' }}>
      
      {/* ANALYTICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
        <div style={{...styles.statCard, borderLeft: '4px solid #145c2e'}}>
          <div style={styles.cardInfo}><span>Total Feedbacks</span><h2>{totalCount}</h2></div>
          <div style={styles.cardIcon}>💬</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #ea580c'}}>
          <div style={styles.cardInfo}><span>Action Required (Pending)</span><h2>{pendingCount}</h2></div>
          <div style={styles.cardIcon2}>⏳</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #eab308'}}>
          <div style={styles.cardInfo}><span>Average Satisfaction</span><h2>{averageRating} / 5.0</h2></div>
          <div style={styles.cardIcon3}>✨</div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>🗣️ Student Testimonials & App Feedbacks</h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder="Search student or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.filterInput} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
              <option value="All">All Feedbacks</option>
              <option value="Pending">Pending Action</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Student Name</th>
              <th style={styles.th}>Grade</th>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Rating</th>
              <th style={styles.th}>Message Snippet</th>
              <th style={styles.th}>Status</th>
              <th style={{...styles.th, textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map((f) => (
              <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={styles.td}>{f.created_at || 'Recently'}</td>
                <td style={{...styles.td, fontWeight: 'bold', color: '#1e293b'}}>{f.student_name}</td>
                <td style={styles.td}>{f.grade || 'General'}</td>
                <td style={{...styles.td, color: '#145c2e', fontWeight: '600'}}>{f.subject}</td>
                <td style={{...styles.td, fontSize: '12px'}}>{renderStars(f.rating)}</td>
                <td style={{...styles.td, color: '#64748b', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{f.message}</td>
                <td style={styles.td}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                    backgroundColor: f.status === 'Reviewed' ? '#dcfce7' : '#fff7ed',
                    color: f.status === 'Reviewed' ? '#15803d' : '#c2410c'
                  }}>{f.status || 'Pending'}</span>
                </td>
                <td style={{...styles.td, textAlign: 'center'}}>
                  <button onClick={() => setSelectedFeedback(f)} style={styles.viewBtn}>👁️ View</button>
                  <button onClick={() => handleDelete(f.id)} style={styles.deleteBtn}>🗑️</button>
                </td>
              </tr>
            ))}
            
            {/* 🟢 FIXED: ඩේටාබේස් එකේ කිසිම feedback එකක් නැතිවිට පෙන්වන Clean Message එක */}
            {filteredFeedbacks.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic', fontSize: '13.5px' }}>
                  No student feedback records registered in the database repository yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILED VIEW MODAL */}
      {selectedFeedback && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Detailed Feedback Review</h3>
              <button onClick={() => setSelectedFeedback(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✖</button>
            </div>
            <p style={{ margin: '5px 0' }}><strong>Student:</strong> {selectedFeedback.student_name} ({selectedFeedback.grade || 'General'})</p>
            <p style={{ margin: '5px 0' }}><strong>Course Node:</strong> {selectedFeedback.subject}</p>
            <p style={{ margin: '5px 0' }}><strong>Rating Given:</strong> <span style={{ fontSize: '12px' }}>{renderStars(selectedFeedback.rating)}</span></p>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '15px 0', fontSize: '14px', lineHeight: '1.6', color: '#334155', fontStyle: 'italic' }}>
              "{selectedFeedback.message}"
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              {selectedFeedback.status === 'Pending' && (
                <button onClick={() => handleMarkAsReviewed(selectedFeedback.id)} style={styles.modalActionBtn}>✔️ Mark as Reviewed</button>
              )}
              <button onClick={() => setSelectedFeedback(null)} style={styles.modalCloseBtn}>Close View</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '4px', span: { fontSize: '12px', color: '#64748b' }, h2: { margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: '800' } },
  cardIcon: { fontSize: '22px', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#145c2e', backgroundColor: '#dcfce7' },
  cardIcon2: { fontSize: '22px', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', backgroundColor: '#fff7ed' },
  cardIcon3: { fontSize: '22px', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', backgroundColor: '#fef9c3' },
  th: { padding: '12px 10px', color: '#64748b', fontWeight: 'bold', fontSize: '12.5px' },
  td: { padding: '14px 10px', fontSize: '13px', color: '#334155', verticalAlign: 'middle' },
  filterInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', width: '220px' },
  filterSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #145c2e', fontSize: '13px', backgroundColor: 'white', color: '#145c2e', fontWeight: 'bold' },
  viewBtn: { padding: '5px 12px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginRight: '6px' },
  deleteBtn: { padding: '5px 8px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalBox: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  modalActionBtn: { padding: '8px 15px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  modalCloseBtn: { padding: '8px 15px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }
};