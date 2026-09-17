import React, { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div style={{ padding: '60px 20px', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#14532d', fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Get in Touch with Us</h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Have questions about classes or admissions? We are here to help!</p>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Contact Details Card */}
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #16a34a' }}>
            <h3 style={{ color: '#0f172a', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Contact Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#475569', fontSize: '15px' }}>
              <div>
                <strong>📍 Address:</strong>
                <p style={{ margin: '4px 0 0 0' }}>Opposite Bandaranayaka College, Mirigama, Sri Lanka</p>
              </div>
              <div>
                <strong>📞 Phone Number:</strong>
                <p style={{ margin: '4px 0 0 0' }}>075-0898391</p>
              </div>
              <div>
                <strong>✉️ Email Address:</strong>
                <p style={{ margin: '4px 0 0 0' }}>info@aurapensaku.lk</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ flex: '1.2', minWidth: '320px', backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '4px solid #22c55e' }}>
            <h3 style={{ color: '#0f172a', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Send Us a Message</h3>

            {submitted && (
              <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>
                ✅ Thank you! Your inquiry has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Your Full Name" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              <input type="email" placeholder="Your Email Address" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              <input type="text" placeholder="Subject / Grade" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              <textarea rows="4" placeholder="Write your question or message here..." required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none' }}></textarea>

              <button type="submit" style={{ backgroundColor: '#15803d', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit Inquiry 🚀
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}