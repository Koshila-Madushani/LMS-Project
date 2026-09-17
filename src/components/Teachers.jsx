import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Teachers() {
  const [teachersList, setTeachersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8082/api/view-teachers')
      .then(res => {
        setTeachersList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.log("Public Teachers Fetch Error:", err));
  }, []);

  // 🟢 INTER-MODULE COMMUNICATION DETECTOR: ටයිම් ටේබල් එකෙන් ක්ලික් කරලා ආපු නම අල්ලගැනීම
  useEffect(() => {
    const savedTeacherFilter = localStorage.getItem('filterTeacherName');
    if (savedTeacherFilter) {
      setSearchQuery(savedTeacherFilter); // සර්ච් එකට නම දමයි
      localStorage.removeItem('filterTeacherName'); // ක්ලීන් කරයි
    }
  }, [teachersList]);

  // 🎨 UI AVATAR GENERATION LOGIC: නම අනුව ඔටෝම ප්‍රොෆයිල් පික්චර් එකක් සහ වර්ණයක් හැදීම
  const getAvatarColor = (name) => {
    const colors = ['#15803d', '#0284c7', '#ea580c', '#7c3aed', '#eab308', '#64748b'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return '🧑';
    return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredTeachers = teachersList.filter(t => 
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.Subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '60px 20px', backgroundColor: '#f8fafc', flex: 1, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        <h1 style={{ color: '#15803d', fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Meet Our Expert Lecturers</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 30px 0' }}>Highly Qualified Panel of Teachers at Aura Pen Education</p>

        {/* Search & Reset Controller Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
          <input 
            type="text" 
            placeholder="🔍 Type Teacher Name or Subject to filter..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            style={{ padding: '12px 20px', width: '380px', borderRadius: '30px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }} 
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ padding: '10px 18px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              Clear Filter ❌
            </button>
          )}
        </div>

        {filteredTeachers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '25px', textAlign: 'left' }}>
            {filteredTeachers.map((t) => (
              <div key={t.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', borderTop: `6px solid ${getAvatarColor(t.name)}`, display: 'flex', flexDirection: 'column', gap: '10px', transition: '0.3s' }}>
                
                {/* Header Container with Dynamic Profile Avatar Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: getAvatarColor(t.name), color: 'white', display: 'flex', alignItems: 'center', justifyAxios: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
                    {getInitials(t.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '17px', fontWeight: 'bold' }}>{t.name}</h3>
                    <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>
                      {t.Subject || 'Faculty'}
                    </span>
                  </div>
                </div>
                
                <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '4px', paddingLeft: '5px' }}>
                  🎓 {t.qualifications || 'Expert Educator'}
                </div>
                
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '8px 0' }}></div>
                
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '5px' }}>
                  📞 <span style={{ color: '#1e293b', fontWeight: '500' }}>{t.phone_number}</span>
                </div>
                
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '5px' }}>
                  ✉️ <span style={{ color: '#64748b' }}>{t.email || 'No official email'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', color: '#94a3b8', fontSize: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            🧑‍🏫 No matching expert lecturers found for your selection.
          </div>
        )}

      </div>
    </div>
  );
}