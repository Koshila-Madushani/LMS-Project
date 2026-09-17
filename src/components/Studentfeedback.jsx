import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Studentfeedback({ user }) {
  const [feedback, setFeedback] = useState({ subject: '', message: '' });
  const [myFeedbacks, setMyFeedbacks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8082/api/feedbacks')
      .then(res => setMyFeedbacks(res.data || []))
      .catch(() => setMyFeedbacks([]));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!feedback.subject || !feedback.message) {
      alert("Please fill in both fields.");
      return;
    }
    
    axios.post('http://localhost:8082/api/feedbacks', {
      studentName: user?.name || 'Student',
      subject: feedback.subject,
      message: feedback.message
    }).then(() => {
      alert("Feedback sent successfully!");
      setMyFeedbacks([...myFeedbacks, { id: Date.now(), subject: feedback.subject, message: feedback.message, status: 'Pending' }]);
      setFeedback({ subject: '', message: '' });
    }).catch(() => {
      alert("Feedback submitted locally.");
      setMyFeedbacks([...myFeedbacks, { id: Date.now(), subject: feedback.subject, message: feedback.message, status: 'Pending' }]);
      setFeedback({ subject: '', message: '' });
    });
  };

  return (
    <div style={styles.whiteBox}>
      <h2 style={{ marginTop: 0, fontSize: '20px', color: '#145c2e', fontWeight: 'bold' }}>💬 Teacher Feedback & Support Forum</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc', padding: '22px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
        <input type="text" placeholder="Subject / Query Title" value={feedback.subject} onChange={e => setFeedback({ ...feedback, subject: e.target.value })} style={styles.inputLarge} />
        <textarea rows="4" placeholder="Type your message for teachers..." value={feedback.message} onChange={e => setFeedback({ ...feedback, message: e.target.value })} style={{ ...styles.inputLarge, resize: 'none' }}></textarea>
        <button type="submit" style={styles.primaryBtn}>📩 Send Message to Teacher</button>
      </form>
    </div>
  );
}

const styles = {
  whiteBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' },
  primaryBtn: { backgroundColor: '#145c2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13.5px' },
  inputLarge: { padding: '11px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13.5px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }
};