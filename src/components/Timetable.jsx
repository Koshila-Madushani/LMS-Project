import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Timetable({ setCurrentPage }) {
  const [classes, setClasses] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('All Grades');

  useEffect(() => {
    axios.get('http://localhost:8082/api/timetable')
      .then(res => setClasses(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.log("Public Timetable Fetch Error:", err));
  }, []);

  // 📊 ඩේටාබේස් එකෙන් එන පන්ති ටික Grade අනුව Group කරන ලොජික් එක
  const groupedClasses = classes.reduce((acc, currentClass) => {
    const gradeKey = currentClass.grade || 'Other Structures';
    if (!acc[gradeKey]) acc[gradeKey] = [];
    acc[gradeKey].push(currentClass);
    return acc;
  }, {});

  // 🧠 SMART SORTING MATRIX: ශ්‍රේණි 6 සිට A/L දක්වා සහ Streams නිවැරදිව පිළිවෙළ ගැස්වීම
  const sortGradesSequentially = (a, b) => {
    // ටෙක්ස්ට් එක ඇතුළෙන් ඉලක්කම විතරක් වෙන් කර ගැනීම (e.g. "Grade 10" -> 10, "Grade 6" -> 6)
    const numA = parseInt(a.replace(/^\D+/g, ''), 10);
    const numB = parseInt(b.replace(/^\D+/g, ''), 10);

    // ඉලක්කම් දෙක වෙනස් නම්, කුඩා ඉලක්කමේ සිට විශාල ඉලක්කමට පෙළගස්වයි (6, 7, 8...)
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    }
    
    // ඉලක්කම් සමාන නම් (e.g. Grade 12 Maths සහ Grade 12 Commerce), අකුරු පිළිවෙළට Streams එක ළඟ තබයි
    return a.localeCompare(b);
  };

  // 🔄 පිළිවෙළ ගැස්වූ සම්පූර්ණ ශ්‍රේණි ලැයිස්තුව
  const sortedGradeKeys = Object.keys(groupedClasses).sort(sortGradesSequentially);
  const dynamicGradeTabs = ['All Grades', ...sortedGradeKeys];

  // 🔄 ටීචර්ගේ නම ක්ලික් කරද්දී ප්‍රොෆයිල් එකට රීඩිරෙක්ට් වීම
  const handleTeacherRedirect = (teacherName) => {
    localStorage.setItem('filterTeacherName', teacherName);
    if (setCurrentPage) setCurrentPage('Teachers');
  };

  // 🎯 තෝරාගත් ටැබ් එක අනුව පෙන්විය යුතු ශ්‍රේණි
  const gradesToRender = selectedGrade === 'All Grades' 
    ? sortedGradeKeys 
    : [selectedGrade];

  return (
    <div style={{ padding: '50px 20px', backgroundColor: '#f8fafc', flex: 1, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        <h1 style={{ color: '#15803d', fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          Aura Pen Education
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 35px 0' }}>
          Official Live Class Timetable Portal
        </p>

        {/* 🟢 SEQUENCE CORRECTED DYNAMIC GRADE TABS ROW */}
        {Object.keys(groupedClasses).length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '35px' }}>
            {dynamicGradeTabs.map((grade) => {
              const isActive = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '25px',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: 'bold',
                    backgroundColor: isActive ? '#15803d' : 'white',
                    color: isActive ? 'white' : '#475569',
                    boxShadow: isActive ? '0 4px 12px rgba(21,128,61,0.2)' : '0 2px 5px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {grade === 'All Grades' ? '🌐 All Grades' : `🎓 ${grade}`}
                </button>
              );
            })}
          </div>
        )}

        {/* TABLES DISPLAY AREA */}
        {Object.keys(groupedClasses).length > 0 ? (
          gradesToRender.map((grade) => (
            groupedClasses[grade] && (
              <div key={grade} style={{ marginBottom: '35px', textAlign: 'left', animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ margin: '0 0 12px 5px', color: '#1e293b', fontSize: '17px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Aura Class Matrix: {grade} 
                  <span style={{ fontSize: '11.5px', fontWeight: 'normal', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                    {groupedClasses[grade].length} Classes Mapped
                  </span>
                </h3>
                
                <div style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                        <th style={{ padding: '12px 10px', fontWeight: 'bold' }}>Day</th>
                        <th style={{ padding: '12px 10px', fontWeight: 'bold' }}>Subject</th>
                        <th style={{ padding: '12px 10px', fontWeight: 'bold' }}>Time Window</th>
                        <th style={{ padding: '12px 10px', fontWeight: 'bold' }}>Assigned Lecturer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedClasses[grade].map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '14px 10px', fontWeight: 'bold', color: '#334155' }}>{c.day}</td>
                          <td style={{ padding: '14px 10px', color: '#0284c7', fontWeight: '600' }}>{c.subject}</td>
                          <td style={{ padding: '14px 10px', color: '#ea580c', fontWeight: '500', fontSize: '13.5px' }}>{c.time_slot}</td>
                          <td style={{ padding: '14px 10px' }}>
                            <span 
                              onClick={() => handleTeacherRedirect(c.teacher)}
                              style={{ color: '#15803d', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', display: 'inline-block' }}
                              onMouseOver={(e) => e.target.style.color = '#16a34a'}
                              onMouseOut={(e) => e.target.style.color = '#15803d'}
                            >
                              🧑‍🏫 {c.teacher}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ))
        ) : (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', color: '#94a3b8', fontSize: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            📭 No institutional classes scheduled in the live database matrix yet.
          </div>
        )}

      </div>
    </div>
  );
}