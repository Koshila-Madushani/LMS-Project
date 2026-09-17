import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentActivities({ user, selectedSubject: initialSubject, setSelectedSubject: setParentSubject }) {
  const [activities, setActivities] = useState([]);
  
  const studentSubjects = user?.subjects 
    ? (Array.isArray(user.subjects) ? user.subjects : String(user.subjects).split(',').map(s => s.trim()).filter(Boolean)) 
    : ["Mathematics", "Science", "English"];

  const [selectedSubject, setSelectedSubject] = useState(initialSubject || studentSubjects[0] || 'Mathematics');
  const [activityLessonFilter, setActivityLessonFilter] = useState('All');
  const [activityTypeFilter, setActivityTypeFilter] = useState('All');
  const [activityAnswers, setActivityAnswers] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8082/api/lesson-activities-list')
      .then(res => setActivities(res.data || []))
      .catch(() => setActivities([]));
  }, []);

  const cleanTxt = (str) => (str || '').replace(/\$|\{|\}/g, '');
  const parseNum = (str) => parseInt((str || '').replace(/\D/g, '')) || 0;

  const getActivityType = (act) => {
    const type = (act.question_type || '').toLowerCase();
    if (type.includes('true') || type.includes('tf')) return 'True/False';
    if (type.includes('mcq')) return 'MCQ';
    if (type.includes('short')) return 'Short Answer';

    const optA = (act.option_a || '').toUpperCase().trim();
    if (optA === 'TRUE' || !act.option_c) return 'True/False';
    if (act.option_c || act.option_d) return 'MCQ';
    return 'Short Answer';
  };

  const handleSubjectChange = (sub) => {
    setSelectedSubject(sub);
    if (setParentSubject) setParentSubject(sub);
    setActivityAnswers({});
  };

  // 🟢 Filter by Selected Subject
  const subjectActivities = activities.filter(a => 
    (a.subject || a.subject_name || '').toLowerCase().includes(selectedSubject.toLowerCase())
  );

  // 🟢 Available Lessons sorted Newest/Highest first (Lesson 03, 02, 01)
  const activityLessons = Array.from(
    new Set(subjectActivities.map(a => a.lesson_name?.trim()).filter(Boolean))
  ).sort((a, b) => parseNum(b) - parseNum(a));

  // 🟢 Filtered Activity List
  const filteredActivities = subjectActivities.filter(a => {
    if (activityLessonFilter !== 'All' && (a.lesson_name || '').toLowerCase() !== activityLessonFilter.toLowerCase()) return false;
    if (activityTypeFilter !== 'All' && getActivityType(a) !== activityTypeFilter) return false;
    return true;
  });

  return (
    <div style={styles.whiteBox}>
      {/* 🟢 TOP HEADER WITH SUBJECT TABS */}
      <div style={styles.tabHeader}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#145c2e', fontWeight: 'bold' }}>
            🧩 Lesson Activities - <span style={{ color: '#16a34a' }}>{selectedSubject}</span>
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Interactive practice tasks curated for {selectedSubject}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {studentSubjects.map(sub => (
            <button 
              key={sub} 
              onClick={() => handleSubjectChange(sub)} 
              style={{ ...styles.filterTab, backgroundColor: selectedSubject === sub ? '#145c2e' : '#f1f5f9', color: selectedSubject === sub ? '#fff' : '#475569' }}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 FILTER BAR FOR LESSONS & TYPES */}
      <div style={{ ...styles.filterBar, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#145c2e' }}>📘 Select Lesson:</span>
          <select value={activityLessonFilter} onChange={(e) => setActivityLessonFilter(e.target.value)} style={styles.selectInput}>
            <option value="All">All Lessons</option>
            {activityLessons.map(les => <option key={les} value={les}>{les}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'True/False', 'MCQ', 'Short Answer'].map(t => (
            <button 
              key={t} 
              onClick={() => setActivityTypeFilter(t)}
              style={{ ...styles.pillBtn, backgroundColor: activityTypeFilter === t ? '#145c2e' : '#fff', color: activityTypeFilter === t ? '#fff' : '#475569', border: '1px solid #cbd5e1' }}
            >
              {t === 'All' ? '📋 All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 QUESTIONS LIST (NO SCORE CARDS / NO ALERTS) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredActivities.map((act, index) => {
          const type = getActivityType(act);

          return (
            <div key={act.id} style={styles.activityCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#145c2e' }}>
                  Question {String(index + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '11.5px', backgroundColor: '#ecfdf5', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {type}
                </span>
              </div>

              <p style={{ fontSize: '15px', margin: '0 0 18px 0', color: '#1e293b', fontWeight: '500', lineHeight: '1.6' }}>
                {cleanTxt(act.question_text)}
              </p>

              {/* 1. True / False */}
              {type === 'True/False' && (
                <div style={{ display: 'flex', gap: '14px', maxWidth: '420px' }}>
                  {['TRUE', 'FALSE'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActivityAnswers({ ...activityAnswers, [act.id]: opt })}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13.5px',
                        border: activityAnswers[act.id] === opt ? '2px solid #145c2e' : '1px solid #cbd5e1',
                        backgroundColor: activityAnswers[act.id] === opt ? '#d1fae5' : '#ffffff',
                        color: activityAnswers[act.id] === opt ? '#145c2e' : '#475569'
                      }}
                    >
                      {opt === 'TRUE' ? '✅ TRUE' : '❌ FALSE'}
                    </button>
                  ))}
                </div>
              )}

              {/* 2. MCQ */}
              {type === 'MCQ' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '750px' }}>
                  {[
                    { k: 'A', txt: act.option_a }, { k: 'B', txt: act.option_b },
                    { k: 'C', txt: act.option_c }, { k: 'D', txt: act.option_d }
                  ].filter(o => Boolean(o.txt)).map(o => (
                    <div 
                      key={o.k}
                      onClick={() => setActivityAnswers({ ...activityAnswers, [act.id]: o.k })}
                      style={{
                        padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
                        border: activityAnswers[act.id] === o.k ? '2px solid #145c2e' : '1px solid #e2e8f0',
                        backgroundColor: activityAnswers[act.id] === o.k ? '#f0fdf4' : '#ffffff',
                        color: activityAnswers[act.id] === o.k ? '#145c2e' : '#334155',
                        fontWeight: activityAnswers[act.id] === o.k ? 'bold' : 'normal'
                      }}
                    >
                      <span style={{ backgroundColor: activityAnswers[act.id] === o.k ? '#145c2e' : '#f1f5f9', color: activityAnswers[act.id] === o.k ? '#fff' : '#64748b', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {o.k}
                      </span>
                      {cleanTxt(o.txt)}
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Short Answer */}
              {type === 'Short Answer' && (
                <input 
                  type="text" 
                  placeholder="Type your final answer here..."
                  value={activityAnswers[act.id] || ''}
                  onChange={(e) => setActivityAnswers({ ...activityAnswers, [act.id]: e.target.value })}
                  style={{ ...styles.inputLarge, maxWidth: '600px' }}
                />
              )}
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '30px', textAlign: 'center', fontSize: '14px' }}>
            No activities published for <b>{activityLessonFilter !== 'All' ? activityLessonFilter : selectedSubject}</b> yet.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  whiteBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '22px' },
  activityCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '5px solid #145c2e', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  pillBtn: { padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' },
  filterTab: { border: 'none', padding: '7px 16px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' },
  selectInput: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '12.5px', fontWeight: 'bold', backgroundColor: '#fff', color: '#1e293b', cursor: 'pointer' },
  inputLarge: { padding: '11px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13.5px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }
};