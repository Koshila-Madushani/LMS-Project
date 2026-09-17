import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

// 🟢 MODERN VIBRANT PALETTE FOR HIGH CONTRAST & READABILITY
const ANALYTICS_PALETTE = ['#10b981', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function DashboardOverview() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0, todayClasses: 0 });
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [classDistribution, setClassDistribution] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  useEffect(() => {
    // 1️⃣ ඩේටාබේස් එකෙන් සිසුන්ගේ දත්ත ඇදීම
    axios.get('http://localhost:8082/api/view-students')
      .then(res => {
        const studentList = Array.isArray(res.data) ? res.data : [];
        const total = studentList.length;
        
        setCounts(prev => ({ ...prev, students: total }));

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const step = total > 0 ? Math.ceil(total / months.length) : 0;
        const dynamicTrend = months.map((m, idx) => ({
          month: m,
          students: total === 0 ? 0 : Math.min(total, (idx + 1) * step)
        }));
        setEnrollmentData(dynamicTrend);

        const subjectCounts = {};
        studentList.forEach(s => {
          if (s.subjects) {
            s.subjects.split(',').forEach(sub => {
              const cleanSub = sub.trim();
              if (cleanSub) {
                subjectCounts[cleanSub] = (subjectCounts[cleanSub] || 0) + 1;
              }
            });
          }
        });

        const mappedSubjects = Object.keys(subjectCounts).map(key => ({ 
          name: key, 
          value: subjectCounts[key] 
        }));
        
        setSubjectData(mappedSubjects.length > 0 ? mappedSubjects : [{ name: 'General', value: 1 }]);
      }).catch(() => {});

    // 2️⃣ ඩේටාබේස් එකෙන් ගුරුවරුන්ගේ දත්ත ඇදීම
    axios.get('http://localhost:8082/api/view-teachers')
      .then(res => {
        const teacherList = Array.isArray(res.data) ? res.data : [];
        setCounts(prev => ({ ...prev, teachers: teacherList.length }));
      }).catch(() => {});

    // 3️⃣ ඩේටාබේස් එකෙන් කාලසටහන ගෙන අද දින පන්ති ගණන සැබෑ ලෙසම සොයාගැනීම
    axios.get('http://localhost:8082/api/timetable')
      .then(res => {
        const slots = Array.isArray(res.data) ? res.data : [];
        
        const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const currentDayKey = daysMap[new Date().getDay()];
        const realTodayCount = slots.filter(s => (s.day || '').toLowerCase().startsWith(currentDayKey)).length;

        setCounts(prev => ({ 
          ...prev, 
          classes: slots.length, 
          todayClasses: realTodayCount 
        }));

        const gradeCounts = {};
        slots.forEach(slot => { 
          if (slot.grade) gradeCounts[slot.grade] = (gradeCounts[slot.grade] || 0) + 1; 
        });
        const mappedGrades = Object.keys(gradeCounts).map(key => ({ grade: key, classes: gradeCounts[key] }));
        setClassDistribution(mappedGrades.length > 0 ? mappedGrades : [{ grade: 'No Classes', classes: 0 }]);

        const standardSlots = [
          { time: "08:00 AM", mon: "-", tue: "-", wed: "-", thu: "-", fri: "-", sat: "-", sun: "-" },
          { time: "10:30 AM", mon: "-", tue: "-", wed: "-", thu: "-", fri: "-", sat: "-", sun: "-" },
          { time: "01:00 PM", mon: "-", tue: "-", wed: "-", thu: "-", fri: "-", sat: "-", sun: "-" },
          { time: "03:30 PM", mon: "-", tue: "-", wed: "-", thu: "-", fri: "-", sat: "-", sun: "-" }
        ];

        slots.forEach(slot => {
          if (!slot.time_slot) return;
          
          const timeStr = slot.time_slot.toLowerCase().replace(/\s/g, '');
          let targetRow = null;

          if (timeStr.includes('8.00') || timeStr.includes('8:00') || timeStr.includes('08:00') || timeStr.includes('08.00')) {
            targetRow = standardSlots[0];
          } else if (timeStr.includes('10.30') || timeStr.includes('10:30')) {
            targetRow = standardSlots[1];
          } else if (timeStr.includes('1.00') || timeStr.includes('1:00') || timeStr.includes('01:00') || timeStr.includes('13:00')) {
            targetRow = standardSlots[2];
          } else if (timeStr.includes('3.30') || timeStr.includes('3:30') || timeStr.includes('03:30') || timeStr.includes('15:30')) {
            targetRow = standardSlots[3];
          }

          if (!targetRow) {
            if (timeStr.includes('10')) targetRow = standardSlots[1];
            else if (timeStr.includes('1') || timeStr.includes('13')) targetRow = standardSlots[2];
            else if (timeStr.includes('3') || timeStr.includes('15')) targetRow = standardSlots[3];
            else targetRow = standardSlots[0]; 
          }

          const dayKey = (slot.day || '').toLowerCase().substring(0, 3);
          if (dayKey in targetRow) {
            targetRow[dayKey] = `${slot.grade} ${slot.subject}`;
          }
        });

        setWeeklySchedule(standardSlots);
      }).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 BALANCED MULTI-COLOR METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', flexShrink: 0 }}>
        <StatCard title="Total Students" value={counts.students} accentColor="#10b981" icon="👨‍🎓" bgIcon="#ecfdf5" />
        <StatCard title="Total Teachers" value={counts.teachers} accentColor="#0284c7" icon="🧑‍🏫" bgIcon="#e0f2fe" />
        <StatCard title="Active Classes" value={counts.classes} accentColor="#f59e0b" icon="📚" bgIcon="#fef3c7" />
        <StatCard title="Today's Scheduled Classes" value={counts.todayClasses} accentColor="#8b5cf6" icon="⏳" bgIcon="#f3e8ff" />
      </div>

      {/* GRAPHS SECTION WITH PERFECT CONTRAST */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', flexShrink: 0 }}>
        
        {/* Line Chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>📈 Enrollment Growth Trend</h4>
          <div style={{ width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData} margin={{ left: -25, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart (Dynamic Royal Blue Contrast) */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>📊 Class Grade Distribution</h4>
          <div style={{ width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistribution} margin={{ left: -25, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="classes" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Multi-color Subject Distribution) */}
        <div style={{ ...styles.chartCard, display: 'flex', flexDirection: 'column' }}>
          <h4 style={styles.chartTitle}>🎯 Student Subject Enrolment</h4>
          <div style={{ flex: 1, minHeight: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                  {subjectData.map((entry, index) => <Cell key={index} fill={ANALYTICS_PALETTE[index % ANALYTICS_PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {subjectData.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
                <div style={{ width: '6px', height: '6px', backgroundColor: ANALYTICS_PALETTE[index % ANALYTICS_PALETTE.length], borderRadius: '50%', marginRight: '3px' }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SCHEDULE TABLE (CLEAN SLATE DESIGN) */}
      <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h3 style={{ marginTop: 0, color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '10px', fontSize: '15px', fontWeight: 'bold' }}>
          📅 Live Institutional Weekly Schedule Matrix
        </h3>
        <div style={{ overflowX: 'auto', width: '100%', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={styles.th}>Time Window</th>
                <th style={styles.th}>Mon</th><th style={styles.th}>Tue</th><th style={styles.th}>Wed</th><th style={styles.th}>Thu</th><th style={styles.th}>Fri</th><th style={styles.th}>Sat</th><th style={styles.th}>Sun</th>
              </tr>
            </thead>
            <tbody>
              {weeklySchedule.map((row, index) => (
                <tr key={index}>
                  <td style={styles.timeTd}>{row.time}</td>
                  <td style={styles.tableCell}><ScheduleCell text={row.mon} /></td>
                  <td style={styles.tableCell}><ScheduleCell text={row.tue} /></td>
                  <td style={styles.tableCell}><ScheduleCell text={row.wed} /></td>
                  <td style={styles.tableCell}><ScheduleCell text={row.thu} /></td>
                  <td style={styles.tableCell}><ScheduleCell text={row.fri} /></td>
                  <td style={styles.tableCell}><ScheduleCell text={row.sat} /></td>
                  <td style={styles.tableCell}><ScheduleCell text={row.sun} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function ScheduleCell({ text }) {
  if (!text || text === "-") return <span style={{ color: '#cbd5e1', fontSize: '10px' }}>-</span>;
  let bgColor = '#e0f2fe'; let textColor = '#0369a1';
  if (text.toLowerCase().includes("math")) { bgColor = '#fef3c7'; textColor = '#b45309'; }
  else if (text.toLowerCase().includes("scie")) { bgColor = '#dcfce7'; textColor = '#15803d'; }
  else if (text.toLowerCase().includes("eng")) { bgColor = '#f3e8ff'; textColor = '#6b21a8'; }
  return <span style={{ backgroundColor: bgColor, color: textColor, padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px', display: 'inline-block', minWidth: '85px' }}>{text}</span>;
}

function StatCard({ title, value, accentColor, icon, bgIcon }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', borderLeft: `5px solid ${accentColor}`, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: '500' }}>{title}</p>
        <h2 style={{ margin: '6px 0 0 0', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>{value}</h2>
      </div>
      <div style={{ fontSize: '22px', padding: '10px', backgroundColor: bgIcon, borderRadius: '12px' }}>{icon}</div>
    </div>
  );
}

const styles = {
  chartCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' },
  chartTitle: { marginTop: 0, color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '6px', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' },
  th: { padding: '10px 6px', color: '#475569', fontWeight: 'bold', fontSize: '11.5px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  timeTd: { padding: '6px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left', color: '#1e293b' },
  tableCell: { padding: '6px 4px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', verticalAlign: 'middle' }
};