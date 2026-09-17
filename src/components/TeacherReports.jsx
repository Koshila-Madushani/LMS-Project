import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeacherReports({ subject }) {
  const [resultsList, setResultsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchLiveResults = () => {
    axios.get('http://localhost:8082/api/student-results')
      .then(res => setResultsList(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchLiveResults(); }, []);

  const totalRecords = resultsList.length;
  const classAverage = totalRecords > 0 ? Math.round(resultsList.reduce((sum, r) => sum + (parseInt(r.marks_obtained || r.score || 0, 10) || 0), 0) / totalRecords) : 0;
  const highestMark = totalRecords > 0 ? Math.max(...resultsList.map(r => parseInt(r.marks_obtained || r.score || 0, 10))) : 0;
  const totalPassed = resultsList.filter(r => (parseInt(r.marks_obtained || r.score || 0, 10) >= 40)).length;
  const overallPassRate = totalRecords > 0 ? Math.round((totalPassed / totalRecords) * 100) : 0;

  const filteredData = resultsList.filter(r => {
    const nameMatch = String(r.student_name).toLowerCase().includes(searchQuery.toLowerCase());
    const isPass = parseInt(r.marks_obtained || r.score || 0, 10) >= 40;
    const statusMatch = statusFilter === 'All' ? true : (statusFilter === 'Pass' ? isPass : !isPass);
    return nameMatch && statusMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 Header with Download PDF */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>Academic Performance Matrix</h2>
        </div>
        <button onClick={() => window.print()} style={styles.downloadBtn}>📥 Download PDF Report</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={styles.statCard('#3b82f6')}><div><p style={styles.statLabel}>AVG SCORE</p><h2 style={styles.statCount}>{classAverage}%</h2></div></div>
        <div style={styles.statCard('#145c2e')}><div><p style={styles.statLabel}>TOP SCORE</p><h2 style={styles.statCount}>{highestMark}%</h2></div></div>
        <div style={styles.statCard('#eab308')}><div><p style={styles.statLabel}>PASS RATE</p><h2 style={styles.statCount}>{overallPassRate}%</h2></div></div>
      </div>

      {/* 🟢 Split View: Table (Left) + Graph (Right) */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
        
        {/* Table Side */}
        <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={styles.searchBox} />
                <select onChange={e => setStatusFilter(e.target.value)} style={styles.selectBox}>
                    <option value="All">All Status</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                </select>
            </div>
            <table style={styles.matrixTable}>
              <thead>
                <tr style={styles.tableHeader}><th>Student</th><th>Marks</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => {
                  const mark = parseInt(row.marks_obtained || row.score || 0, 10);
                  return (
                    <tr key={idx} style={styles.tableRow}>
                      <td>{row.student_name}</td>
                      <td style={{fontWeight:'bold'}}>{mark}%</td>
                      <td><span style={{...styles.badge, backgroundColor: mark >= 40 ? '#dcfce7' : '#fee2e2'}}>{mark >= 40 ? 'Pass' : 'Fail'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
        </div>

        {/* Graph Side */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{fontSize: '14px', marginBottom: '15px'}}>Visual Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredData.map((row, idx) => {
                    const mark = parseInt(row.marks_obtained || row.score || 0, 10);
                    return (
                        <div key={idx} style={{ fontSize: '11px' }}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                                <span>{row.student_name}</span>
                                <span style={{fontWeight:'bold'}}>{mark}%</span>
                            </div>
                            <div style={{height:'8px', backgroundColor:'#f1f5f9', borderRadius:'4px', overflow:'hidden'}}>
                                <div style={{height:'100%', width:`${mark}%`, backgroundColor: mark >= 40 ? '#145c2e' : '#dc2626'}}></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  downloadBtn: { padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  statCard: (color) => ({ backgroundColor: 'white', padding: '20px', borderRadius: '16px', borderLeft: `5px solid ${color}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }),
  statLabel: { fontSize: '10px', color: '#64748b', fontWeight: 'bold' },
  statCount: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  matrixTable: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { fontSize: '12px', color: '#64748b', textAlign: 'left', padding: '10px' },
  tableRow: { fontSize: '13px', borderBottom: '1px solid #f1f5f9', height: '50px' },
  badge: { padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  searchBox: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1 },
  selectBox: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }
};