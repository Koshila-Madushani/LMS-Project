import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageReports() {
  const [activeTab, setActiveTab] = useState('students');
  
  // 🟢 100% Pure Database States (Zero Mock Initial Data)
  const [results, setResults] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch live relational database records strictly via Port 8082
    axios.get('http://localhost:8082/api/student-results')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setResults(res.data);
        } else {
          setResults([]);
        }
      })
      .catch(() => setResults([]));

    axios.get('http://localhost:8082/api/view-teachers')
      .then(res => setTeachers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTeachers([]));

    axios.get('http://localhost:8082/api/timetable')
      .then(res => setTimetable(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTimetable([]));

    axios.get('http://localhost:8082/api/quizzes')
      .then(res => setQuizzes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setQuizzes([]));

    axios.get('http://localhost:8082/api/view-students')
      .then(res => setTotalStudents(Array.isArray(res.data) ? res.data.length : 0))
      .catch(() => setTotalStudents(0));

    axios.get('http://localhost:8082/api/view-teachers')
      .then(res => setTotalTeachers(Array.isArray(res.data) ? res.data.length : 0))
      .catch(() => setTotalTeachers(0));

    axios.get('http://localhost:8082/api/view-subjects')
      .then(res => setTotalSubjects(Array.isArray(res.data) ? res.data.length : 0))
      .catch(() => setTotalSubjects(0));
  }, []);

  // Dynamic Teacher Analytics driven strictly by DB joins
  const dynamicTeacherAnalytics = teachers.map(t => {
    const classesCount = timetable.filter(slot => slot.teacher === t.name).length;
    const quizzesCount = quizzes.filter(q => q.teacher_id === t.id).length;
    return {
      id: t.id,
      name: t.name,
      subject: t.Subject || 'General',
      classes_count: classesCount,
      quizzes_published: quizzesCount,
      status: 'Active'
    };
  });

  const filteredResults = results.filter(r => 
    (r.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) && 
    (statusFilter === 'All' || r.status === statusFilter)
  );
  
  const filteredTeachers = dynamicTeacherAnalytics.filter(t => 
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🟢 DIRECT SILENT PDF AUTO-DOWNLOAD
  const handleDownloadPDF = () => {
    const reportTitle = activeTab === 'students' ? 'Student Academic Performance Report' : 'Faculty Operational Log Report';
    const fileName = activeTab === 'students' ? 'AuraPen_Student_Academic_Report.pdf' : 'AuraPen_Faculty_Operational_Report.pdf';
    
    let tableHeaders = activeTab === 'students' 
      ? `<tr><th>No.</th><th>Student Name</th><th>Grade</th><th>Subject</th><th>Quiz Title</th><th>Marks</th><th>Percentage</th><th>Status</th></tr>`
      : `<tr><th>No.</th><th>Faculty Name</th><th>Assigned Subject</th><th>Managed Classes</th><th>Quizzes Published</th><th>Status</th></tr>`;
    
    let tableRows = '';
    if (activeTab === 'students') {
      if (filteredResults.length === 0) {
        tableRows = `<tr><td colSpan="8" style="text-align:center; padding:20px; color:#94a3b8;">No evaluation records registered in the database repository.</td></tr>`;
      } else {
        filteredResults.forEach((r, index) => {
          const mark = parseInt(r.marks_obtained || r.score || 0, 10);
          const total = parseInt(r.total_marks, 10) || 100;
          const percentage = Math.round((mark / total) * 100);
          const isPass = mark >= 40;
          tableRows += `<tr>
            <td style="text-align:center;">${index + 1}</td>
            <td style="font-weight:bold;">${r.student_name}</td>
            <td>${r.grade || 'General'}</td>
            <td style="color:#145c2e; font-weight:bold;">${r.subject_name || 'Mathematics'}</td>
            <td>${r.quiz_title || 'N/A'}</td>
            <td style="font-weight:bold;">${mark} / ${total}</td>
            <td>${percentage}%</td>
            <td style="font-weight:bold; color:${isPass ? '#15803d' : '#b91c1c'};">${isPass ? 'Pass' : 'Fail'}</td>
          </tr>`;
        });
      }
    } else {
      if (filteredTeachers.length === 0) {
        tableRows = `<tr><td colSpan="6" style="text-align:center; padding:20px; color:#94a3b8;">No faculty operational records found.</td></tr>`;
      } else {
        filteredTeachers.forEach((t, index) => {
          tableRows += `<tr>
            <td style="text-align:center;">${index + 1}</td>
            <td style="font-weight:bold;">${t.name}</td>
            <td style="color:#145c2e; font-weight:bold;">${t.subject}</td>
            <td>${t.classes_count} Active Classes</td>
            <td>${t.quizzes_published} Published</td>
            <td style="color:#15803d; font-weight:bold;">${t.status}</td>
          </tr>`;
        });
      }
    }

    const reportElement = document.createElement('div');
    reportElement.style.padding = '30px';
    reportElement.style.fontFamily = 'Arial, sans-serif';
    reportElement.style.color = '#1e293b';
    reportElement.style.background = '#ffffff';

    reportElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #145c2e; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 20px; color: #145c2e; margin: 0; text-transform: uppercase;">AuraPen 'Saku' Education Institute</h1>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Opposite Bandaranaike Maha Vidyalaya, Mirigama | Hotline: 076 612 7786</p>
        </div>
        <div style="text-align: right; font-size: 10px; color: #475569;">
          <b>OFFICIAL LMS SYSTEM REPORT</b><br/>
          Date: ${new Date().toLocaleDateString()}<br/>
          Ref: AP-REP-${Math.floor(100000 + Math.random() * 900000)}
        </div>
      </div>

      <div style="font-size: 13px; font-weight: bold; background: #f1f5f9; padding: 10px 15px; border-left: 5px solid #145c2e; margin-bottom: 20px;">
        ${reportTitle.toUpperCase()}
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #145c2e; color: white;">
            ${tableHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>AuraPen LMS Academic Repository System &copy; 2026</span>
        <span>Verified System Document</span>
      </div>

      <style>
        th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        tr:nth-child(even) { background-color: #f8fafc; }
      </style>
    `;

    const triggerDownload = () => {
      const opt = {
        margin:       10,
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(reportElement).save();
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => triggerDownload();
      document.body.appendChild(script);
    } else {
      triggerDownload();
    }
  };

  return (
    <div style={{ padding: '10px 0', fontFamily: 'sans-serif' }}>
      
      {/* OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
        <div style={{...styles.statCard, borderLeft: '4px solid #145c2e'}}>
          <div style={styles.cardInfo}><span style={styles.cardSpan}>Total Students</span><h2 style={styles.cardH2}>{totalStudents}</h2></div>
          <div style={{...styles.cardIcon, color: '#145c2e', backgroundColor: '#dcfce7'}}>👨‍🎓</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #0284c7'}}>
          <div style={styles.cardInfo}><span style={styles.cardSpan}>Active Teachers</span><h2 style={styles.cardH2}>{totalTeachers}</h2></div>
          <div style={{...styles.cardIcon, color: '#0284c7', backgroundColor: '#e0f2fe'}}>🧑‍🏫</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #ea580c'}}>
          <div style={styles.cardInfo}><span style={styles.cardSpan}>Total Subjects</span><h2 style={styles.cardH2}>{totalSubjects}</h2></div>
          <div style={{...styles.cardIcon, color: '#ea580c', backgroundColor: '#fff7ed'}}>📚</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #7c3aed'}}>
          <div style={styles.cardInfo}><span style={styles.cardSpan}>Quiz Submissions</span><h2 style={styles.cardH2}>{results.length}</h2></div>
          <div style={{...styles.cardIcon, color: '#7c3aed', backgroundColor: '#f3e8ff'}}>📊</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => { setActiveTab('students'); setSearchQuery(''); }} style={{...styles.tabBtn, backgroundColor: activeTab === 'students' ? '#145c2e' : '#ffffff', color: activeTab === 'students' ? '#ffffff' : '#475569', borderColor: '#145c2e' }}>👨‍🎓 Student Academic Performance</button>
        <button onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }} style={{...styles.tabBtn, backgroundColor: activeTab === 'teachers' ? '#145c2e' : '#ffffff', color: activeTab === 'teachers' ? '#ffffff' : '#475569', borderColor: '#145c2e' }}>🧑‍🏫 Staff Activity & Teacher Analytics</button>
      </div>

      {/* TABLE CONTAINER */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 'bold' }}>{activeTab === 'students' ? '📝 Student Evaluation Data Matrix' : '🏢 Institutional Faculty Operational Logs'}</h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder={activeTab === 'students' ? "Search student..." : "Search teacher or subject..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.filterInput} />
            
            {activeTab === 'students' && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
                <option value="All">All Status</option>
                <option value="Pass">Passed Only</option>
                <option value="Fail">Failed Only</option>
              </select>
            )}
            <button onClick={handleDownloadPDF} style={styles.pdfBtn}>📋 Download PDF Report</button>
          </div>
        </div>

        {activeTab === 'students' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={styles.th}>No.</th><th style={styles.th}>Student Name</th><th style={styles.th}>Grade</th><th style={styles.th}>Subject</th><th style={styles.th}>Quiz Title</th><th style={styles.th}>Marks</th><th style={styles.th}>Percentage</th><th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? filteredResults.map((r, index) => {
                const mark = parseInt(r.marks_obtained || r.score || 0, 10);
                const total = parseInt(r.total_marks, 10) || 100;
                const percentage = Math.round((mark / total) * 100);
                const isPass = mark >= 40;

                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={{...styles.td, fontWeight: 'bold', color: '#1e293b'}}>{r.student_name}</td>
                    <td style={styles.td}>{r.grade || 'General'}</td>
                    <td style={{...styles.td, color: '#145c2e', fontWeight: 'bold'}}>{r.subject_name || 'Mathematics'}</td>
                    <td style={{...styles.td, fontStyle: 'italic'}}>{r.quiz_title || 'N/A'}</td>
                    <td style={{...styles.td, fontWeight: 'bold'}}>{mark} / {total}</td>
                    <td style={styles.td}>{percentage}%</td>
                    <td style={styles.td}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: isPass ? '#dcfce7' : '#fee2e2', color: isPass ? '#15803d' : '#b91c1c' }}>
                        {isPass ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13.5px' }}>No student evaluation records registered in the database repository.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={styles.th}>No.</th><th style={styles.th}>Teacher Name</th><th style={styles.th}>Assigned Core Subject</th><th style={styles.th}>Managed Classes</th><th style={styles.th}>Quizzes Published</th><th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? filteredTeachers.map((t, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#1e293b'}}>{t.name}</td>
                  <td style={{...styles.td, color: '#145c2e', fontWeight: 'bold'}}>{t.subject}</td>
                  <td style={styles.td}>{t.classes_count} Active Classes</td>
                  <td style={styles.td}>{t.quizzes_published} Quizzes</td>
                  <td style={styles.td}><span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#dcfce7', color: '#15803d' }}>{t.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13.5px' }}>No faculty operational records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  cardSpan: { fontSize: '12px', color: '#64748b' },
  cardH2: { margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: '800' },
  cardIcon: { fontSize: '22px', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabBtn: { padding: '10px 18px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' },
  th: { padding: '12px 10px', color: '#64748b', fontWeight: 'bold', fontSize: '12.5px', textAlign: 'left' },
  td: { padding: '14px 10px', fontSize: '13px', color: '#334155' },
  filterInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', width: '200px', outline: 'none' },
  filterSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white', outline: 'none' },
  pdfBtn: { padding: '8px 16px', backgroundColor: '#145c2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(20, 92, 46, 0.15)' }
};