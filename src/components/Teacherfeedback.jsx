import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function Teacherfeedback({ userName, subject }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  // Fetch Feedbacks from Backend
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8082/api/feedbacks');
      
      // Filter feedbacks relevant to the teacher's subject or general inquiries
      const filtered = Array.isArray(res.data) 
        ? res.data.filter(f => !f.subject || f.subject === subject)
        : [];
      setFeedbacks(filtered);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Reply to Student Feedback
  const handleSendReply = async (id) => {
    const message = replyText[id];
    if (!message || !message.trim()) {
      alert("Please enter a reply message before sending!");
      return;
    }

    try {
      await axios.put(`http://localhost:8082/api/feedback/${id}/reply`, {
        reply: message,
        repliedBy: userName
      });
      alert("Reply sent successfully!");
      setReplyText(prev => ({ ...prev, [id]: '' }));
      fetchFeedbacks(); // Refresh Feedback List
    } catch (err) {
      console.error("Error replying to feedback:", err);
      alert("Failed to send reply. Please try again.");
    }
  };

  // Delete Feedback
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback inquiry?")) {
      try {
        await axios.delete(`http://localhost:8082/api/feedback/${id}`);
        fetchFeedbacks();
      } catch (err) {
        console.error("Error deleting feedback:", err);
      }
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      {/* Header Section */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '25px', borderLeft: '6px solid #15803d' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>💬 Student Feedbacks & Inquiries</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Manage and respond to student inquiries and feedback submitted for <strong>{subject || 'All Subjects'}</strong>.
        </p>
      </div>

      {/* Feedbacks List Section */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading student feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', color: '#94a3b8' }}>
          <span style={{ fontSize: '40px' }}>📬</span>
          <p style={{ marginTop: '10px', fontSize: '16px' }}>No student feedback or inquiries received yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {feedbacks.map((fb) => (
            <div 
              key={fb.id} 
              style={{ 
                backgroundColor: 'white', 
                padding: '25px', 
                borderRadius: '15px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Card Top Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>
                    🧑‍🎓 {fb.studentName || 'Anonymous Student'} 
                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px', fontWeight: 'normal' }}>
                      ({fb.grade || 'General'})
                    </span>
                  </h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>🕒 {fb.date || 'Recently'}</span>
                </div>
                <button 
                  onClick={() => handleDelete(fb.id)}
                  style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  Delete
                </button>
              </div>

              {/* Student Message */}
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', color: '#334155', fontSize: '14.5px', marginBottom: '15px', borderLeft: '3px solid #3b82f6' }}>
                {fb.message || fb.comment}
              </div>

              {/* Existing Reply (if available) */}
              {fb.reply && (
                <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '10px', color: '#166534', fontSize: '14px', marginBottom: '15px', borderLeft: '3px solid #22c55e' }}>
                  <strong>💬 Your Response ({fb.repliedBy || userName || 'Teacher'}):</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{fb.reply}</p>
                </div>
              )}

              {/* Reply Input Box */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Type your response here..."
                  value={replyText[fb.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [fb.id]: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleSendReply(fb.id)}
                  style={{
                    backgroundColor: '#15803d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Send Reply 🚀
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}