import React, { useState, useEffect } from 'react';
import axios from 'axios';

const normalizeLessonTitle = (rawTitle) => {
  if (!rawTitle) return 'Lesson 01';
  const match = String(rawTitle).match(/(lesson\s*\d+|chapter\s*\d+)/i);
  if (match) {
    const num = match[1].match(/\d+/)[0];
    return `Lesson ${num.padStart(2, '0')}`;
  }
  const clean = rawTitle.replace(/\s*(video|pdf|handout|doc|link|recording)\s*/gi, '').trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Lesson 01';
};

export default function TeacherActivities({ teacherCode, subjectCode, userName, teachingSubject }) {
  const [activeSubTab, setActiveSubTab] = useState('activities'); 
  const [publishedLessons, setPublishedLessons] = useState([]); 
  const [activitiesList, setActivitiesList] = useState([]); 
  const [assignedGrades, setAssignedGrades] = useState([]);
  const [activeGradeScope, setActiveGradeScope] = useState('Grade 8'); 

  // 🟢 QUESTION BANK DATA & SELECTION
  const [questionBankList, setQuestionBankList] = useState([]);
  const [selectedBankIds, setSelectedBankIds] = useState([]);
  const [creatorMode, setCreatorMode] = useState('BANK'); // 'BANK' or 'MANUAL'
  
  // 🟢 QUESTION BANK FILTERS
  const [bankLessonScopeFilter, setBankLessonScopeFilter] = useState('MATCH'); // 'MATCH' or 'ALL'
  const [bankTypeFilter, setBankTypeFilter] = useState('ALL'); // 'ALL', 'MCQ', 'BLANK', 'TRUE_FALSE'

  const [selectedLesson, setSelectedLesson] = useState('Lesson 01'); 
  const [activityType, setActivityType] = useState('MCQ'); 
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');

  // Right Side Inventory Filter
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState('ALL');

  // FORUM CHAT MESSAGES
  const [forumMessages, setForumMessages] = useState([]);
  const [typeText, setTypeText] = useState('');

  const activeTeacherCode = teacherCode || 'TC_002'; 
  const currentSubject = teachingSubject || 'Mathematics';

  useEffect(() => {
    axios.get('http://localhost:8082/api/teacher-assigned-grades', { params: { teacher_code: activeTeacherCode } })
      .then(res => {
        const gradesData = Array.isArray(res.data) ? res.data : [];
        setAssignedGrades(gradesData);
        if (gradesData.length > 0 && !gradesData.some(g => g.grade === activeGradeScope)) {
          setActiveGradeScope(gradesData[0].grade);
        }
      })
      .catch(err => console.error(err));
  }, [activeTeacherCode]);

  const fetchContentLessons = () => {
    axios.get('http://localhost:8082/api/learning-materials')
      .then(res => {
        const allData = Array.isArray(res.data) ? res.data : [];
        const gradeFiltered = allData.filter(m => String(m.grade).toLowerCase() === String(activeGradeScope).toLowerCase());
        
        const uniqueLessons = Array.from(
          new Set(gradeFiltered.map(m => normalizeLessonTitle(m.title)))
        ).sort();

        setPublishedLessons(uniqueLessons);
        if (uniqueLessons.length > 0 && !uniqueLessons.includes(selectedLesson)) {
          setSelectedLesson(uniqueLessons[0]);
        }
      })
      .catch(err => console.error(err));
  };

  // FETCH FROM QUESTION BANK
  const fetchQuestionBank = () => {
    axios.get('http://localhost:8082/api/get-bank')
      .then(res => {
        const allData = Array.isArray(res.data) ? res.data : [];
        setQuestionBankList(allData);
      })
      .catch(err => console.error(err));
  };

  // FETCH PUBLISHED LESSON ACTIVITIES
  const fetchActivitiesList = () => {
    axios.get('http://localhost:8082/api/lesson-activities-list')
      .then(res => {
        const allData = Array.isArray(res.data) ? res.data : [];
        setActivitiesList(allData);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchContentLessons();
    fetchQuestionBank();
    fetchActivitiesList();
  }, [activeGradeScope, activeSubTab]);

  // SEND FORUM CHAT MESSAGE
  const handleSend = (e) => {
    e.preventDefault();
    if (!typeText.trim()) return;
    setForumMessages([
      ...forumMessages, 
      { id: Date.now(), grade: activeGradeScope, sender: `${userName || 'Buddhika Darshani (Teacher)'}`, text: typeText, isMe: true }
    ]);
    setTypeText('');
  };

  // IMPORT SELECTED QUESTIONS FROM BANK TO LESSON ACTIVITIES
  const handleImportFromBank = () => {
    if (selectedBankIds.length === 0) {
      alert("කරුණාකර Question Bank එකෙන් අවම වශයෙන් එක ප්‍රශ්නයක්වත් තෝරන්න!");
      return;
    }

    const selectedQuestions = questionBankList.filter(q => selectedBankIds.includes(q.id));

    const importRequests = selectedQuestions.map(q => {
      return axios.post('http://localhost:8082/api/add-lesson-activity', {
        lesson_name: selectedLesson,
        question_type: q.question_type || 'MCQ',
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: (q.correct_option || q.correct_answer || 'A').trim().toUpperCase(),
        subject: currentSubject,
        teacher_name: userName || 'Teacher',
        grade: activeGradeScope
      });
    });

    Promise.all(importRequests)
      .then(() => {
        alert(`🎉 ප්‍රශ්න ${selectedBankIds.length}ක් ${selectedLesson} පාඩමට සාර්ථකව එකතු කරන ලදී!`);
        setSelectedBankIds([]);
        fetchActivitiesList();
      })
      .catch(err => alert("Error importing questions: " + err.message));
  };

  // MANUAL SAVE CUSTOM ACTIVITY
  const handleSaveActivity = (e) => {
    e.preventDefault();
    const payload = {
      lesson_name: selectedLesson,
      question_type: activityType,
      question_text: questionText,
      option_a: activityType === 'MCQ' ? optA : (activityType === 'TRUE_FALSE' ? 'TRUE' : null),
      option_b: activityType === 'MCQ' ? optB : (activityType === 'TRUE_FALSE' ? 'FALSE' : null),
      option_c: activityType === 'MCQ' ? optC : null,
      option_d: activityType === 'MCQ' ? optD : null,
      correct_answer: correctAnswer.trim().toUpperCase(),
      subject: currentSubject,
      teacher_name: userName || 'Teacher',
      grade: activeGradeScope
    };

    axios.post('http://localhost:8082/api/add-lesson-activity', payload)
      .then(() => {
        alert("✅ Lesson Activity ප්‍රශ්නය සාර්ථකව පළ කරන ලදී!");
        setQuestionText(''); setCorrectAnswer('');
        setOptA(''); setOptB(''); setOptC(''); setOptD('');
        fetchActivitiesList();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleDeleteActivity = (id) => {
    if (window.confirm("මෙම ප්‍රශ්නය මකා දැමීමට අවශ්‍යද?")) {
      axios.delete(`http://localhost:8082/api/delete-lesson-activity/${id}`)
        .then(() => fetchActivitiesList());
    }
  };

  const toggleSelectBankQuestion = (id) => {
    if (selectedBankIds.includes(id)) {
      setSelectedBankIds(selectedBankIds.filter(item => item !== id));
    } else {
      setSelectedBankIds([...selectedBankIds, id]);
    }
  };

  const handleSelectAllBank = (e) => {
    if (e.target.checked) {
      setSelectedBankIds(filteredBankList.map(q => q.id));
    } else {
      setSelectedBankIds([]);
    }
  };

  // 🟢 ENHANCED FILTER FOR QUESTION BANK (Excludes EXAMS, Filters by Lesson & Question Type)
  const filteredBankList = questionBankList.filter(q => {
    // 1. Grade Filter
    const isGradeMatch = !q.grade || String(q.grade).toLowerCase() === String(activeGradeScope).toLowerCase();
    
    // 2. EXCLUDE EXAM QUESTIONS COMPLETELY!
    const isNotExam = !q.question_purpose || String(q.question_purpose).toUpperCase() !== 'EXAM';

    // 3. Lesson Matching Logic
    let isLessonMatch = true;
    if (bankLessonScopeFilter === 'MATCH') {
      const qLesson = normalizeLessonTitle(q.lesson_name);
      const targetLesson = normalizeLessonTitle(selectedLesson);
      isLessonMatch = qLesson === targetLesson || String(q.lesson_name).toLowerCase() === String(selectedLesson).toLowerCase();
    }

    // 4. Question Type Filter (MCQ / BLANK / TRUE_FALSE)
    let isTypeMatch = true;
    if (bankTypeFilter !== 'ALL') {
      isTypeMatch = String(q.question_type).toUpperCase() === String(bankTypeFilter).toUpperCase();
    }

    return isGradeMatch && isNotExam && isLessonMatch && isTypeMatch;
  });

  // Filter Active Activities Inventory
  const filteredViewList = activitiesList.filter(act => {
    const isLessonMatch = normalizeLessonTitle(act.lesson_name) === normalizeLessonTitle(selectedLesson) || String(act.lesson_name).toLowerCase() === String(selectedLesson).toLowerCase();
    const isGradeMatch = !act.grade || String(act.grade).toLowerCase() === String(activeGradeScope).toLowerCase();
    const isTypeMatch = inventoryTypeFilter === 'ALL' || String(act.question_type).toUpperCase() === String(inventoryTypeFilter).toUpperCase();
    return isLessonMatch && isGradeMatch && isTypeMatch;
  });

  const currentFilteredMessages = forumMessages.filter(msg => msg.grade === activeGradeScope);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Top Workspace Bar */}
      <div style={styles.topIsolationDock}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>Active Grade Class Workspace Selector</h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>Select classroom grade to manage activities and forum.</p>
        </div>
        <select value={activeGradeScope} onChange={e => setActiveGradeScope(e.target.value)} style={styles.classSelectorDropdown}>
          {assignedGrades.map((g, idx) => (
            <option key={idx} value={g.grade}>📍 Active Context: {g.grade}</option>
          ))}
          {assignedGrades.length === 0 && (
            ['Grade 8', 'Grade 7', 'Grade 6'].map((g, i) => <option key={i} value={g}>{g}</option>)
          )}
        </select>
      </div>

      {/* Primary Sub Tabs */}
      <div style={styles.tabContainer}>
        <button onClick={() => setActiveSubTab('activities')} style={styles.tabButton(activeSubTab === 'activities', '#145c2e')}>
          🧩 Lesson Activities Hub
        </button>
        <button onClick={() => setActiveSubTab('forum')} style={styles.tabButton(activeSubTab === 'forum', '#145c2e')}>
          📢 {activeGradeScope} Forum Stream
        </button>
      </div>

      {/* TAB 1: LESSON ACTIVITIES HUB */}
      {activeSubTab === 'activities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', alignItems: 'start' }}>
          
          {/* LEFT CARD: Select from Question Bank OR Create Custom */}
          <div style={styles.interactiveCard('#145c2e')}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={styles.formTitle}>Add Activity to Lesson</h3>
              
              {/* Creator Mode Switcher */}
              <div style={{ display: 'flex', gap: '5px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setCreatorMode('BANK')} 
                  style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: creatorMode === 'BANK' ? '#145c2e' : 'transparent', color: creatorMode === 'BANK' ? 'white' : '#64748b' }}
                >
                  🏛️ From Question Bank
                </button>
                <button 
                  type="button" 
                  onClick={() => setCreatorMode('MANUAL')} 
                  style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: creatorMode === 'MANUAL' ? '#145c2e' : 'transparent', color: creatorMode === 'MANUAL' ? 'white' : '#64748b' }}
                >
                  ✏️ Create Custom
                </button>
              </div>
            </div>

            {/* Target Lesson Module Selector */}
            <div style={{ marginBottom: '15px', backgroundColor: '#e2e8f0', padding: '12px', borderRadius: '10px' }}>
              <label style={styles.fieldLabel}>🎯 Select Target Lesson Module:</label>
              <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} style={{ ...styles.premiumInput, fontWeight: 'bold', color: '#145c2e' }}>
                {publishedLessons.map((lTitle, idx) => (
                  <option key={idx} value={lTitle}>{lTitle}</option>
                ))}
                {publishedLessons.length === 0 && <option value="Lesson 01">Lesson 01</option>}
              </select>
            </div>

            {/* MODE 1: FROM QUESTION BANK */}
            {creatorMode === 'BANK' && (
              <div>
                
                {/* 🟢 LESSON SCOPE & QUESTION TYPE FILTERS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', backgroundColor: '#fafbfc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAllBank} 
                      checked={filteredBankList.length > 0 && selectedBankIds.length === filteredBankList.length} 
                      style={{ width: '16px', height: '16px' }}
                    />
                    Select All ({filteredBankList.length})
                  </label>

                  {/* Dual Filter Controls */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* Lesson Filter */}
                    <select 
                      value={bankLessonScopeFilter} 
                      onChange={e => setBankLessonScopeFilter(e.target.value)}
                      style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: 'bold', color: '#145c2e' }}
                    >
                      <option value="MATCH">🎯 {selectedLesson} Only</option>
                      <option value="ALL">🌐 All Lessons</option>
                    </select>

                    {/* Question Type Filter (MCQ / BLANK / TRUE_FALSE) */}
                    <select 
                      value={bankTypeFilter} 
                      onChange={e => setBankTypeFilter(e.target.value)}
                      style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: 'bold', color: '#0369a1' }}
                    >
                      <option value="ALL">🔍 All Types</option>
                      <option value="MCQ">MCQ Only</option>
                      <option value="BLANK">Short Answer Only</option>
                      <option value="TRUE_FALSE">True/False Only</option>
                    </select>
                  </div>
                </div>

                {/* Question Bank Items Scroller */}
                <div style={styles.bankScroller}>
                  {filteredBankList.map((q) => {
                    const isChecked = selectedBankIds.includes(q.id);
                    const qType = q.question_type || 'MCQ';
                    return (
                      <div 
                        key={q.id} 
                        onClick={() => toggleSelectBankQuestion(q.id)}
                        style={{ ...styles.bankSelectRow, backgroundColor: isChecked ? '#eafaf1' : '#f8fafc', borderColor: isChecked ? '#145c2e' : '#cbd5e1' }}
                      >
                        <input type="checkbox" checked={isChecked} onChange={() => {}} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px' }}>
                            <span style={{ fontSize: '9px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                              {normalizeLessonTitle(q.lesson_name)}
                            </span>
                            <span style={styles.typeBadge(qType)}>{qType}</span>
                          </div>
                          <p style={{ margin: '2px 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>{q.question_text}</p>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Correct Key: {q.correct_option || q.correct_answer}</span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredBankList.length === 0 && (
                    <p style={styles.emptyText}>
                      No matching questions found in Question Bank for this filter.
                    </p>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={handleImportFromBank} 
                  disabled={selectedBankIds.length === 0}
                  style={{ ...styles.actionSubmitBtn(selectedBankIds.length > 0 ? '#145c2e' : '#94a3b8'), cursor: selectedBankIds.length > 0 ? 'pointer' : 'not-allowed' }}
                >
                  Publish {selectedBankIds.length} Selected Question(s) to {selectedLesson} 🚀
                </button>
              </div>
            )}

            {/* MODE 2: MANUAL CREATION */}
            {creatorMode === 'MANUAL' && (
              <form onSubmit={handleSaveActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={styles.fieldLabel}>Question Structure Type</label>
                <select value={activityType} onChange={e => { setActivityType(e.target.value); setQuestionText(''); setCorrectAnswer(''); }} style={styles.premiumInput}>
                  <option value="MCQ">Multiple Choice Question (MCQ)</option>
                  <option value="BLANK">Fill in the Blanks (Short Answer)</option>
                  <option value="TRUE_FALSE">True / False Statement</option>
                </select>

                <label style={styles.fieldLabel}>Question Content Text</label>
                <textarea placeholder="Type question content..." value={questionText} onChange={e => setQuestionText(e.target.value)} required style={styles.premiumTextArea} />

                {activityType === 'MCQ' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <input type="text" placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} required style={styles.premiumInput} />
                    <input type="text" placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} required style={styles.premiumInput} />
                    <input type="text" placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} required style={styles.premiumInput} />
                    <input type="text" placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} required style={styles.premiumInput} />
                  </div>
                )}

                <label style={styles.fieldLabel}>Correct Answer Key</label>
                <input type="text" placeholder="e.g. A / B / C / D or TRUE/FALSE" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} required style={styles.premiumInput} />

                <button type="submit" style={styles.actionSubmitBtn('#145c2e')}>Publish Activity 🚀</button>
              </form>
            )}

          </div>

          {/* RIGHT CARD: Published Lesson Activities Inventory */}
          <div style={styles.interactiveCard('#145c2e')}>
            <h3 style={styles.formTitle}>Active Practice Items for {selectedLesson}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
              <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} style={styles.premiumInput}>
                {publishedLessons.map((lTitle, idx) => (
                  <option key={idx} value={lTitle}>{lTitle}</option>
                ))}
                {publishedLessons.length === 0 && <option value="Lesson 01">Lesson 01</option>}
              </select>

              <select value={inventoryTypeFilter} onChange={e => setInventoryTypeFilter(e.target.value)} style={styles.premiumInput}>
                <option value="ALL">🔍 All Types</option>
                <option value="MCQ">MCQ Only</option>
                <option value="BLANK">Short Answer Only</option>
                <option value="TRUE_FALSE">True/False Only</option>
              </select>
            </div>

            <div style={styles.listScroller}>
              {filteredViewList.map((act, idx) => (
                <div key={act.id || idx} style={styles.bankItemRow}>
                  <div style={{ flex: 1 }}>
                    <span style={styles.typeBadge(act.question_type)}>{act.question_type}</span>
                    <p style={styles.itemQuestionText}>{act.question_text}</p>
                    {act.question_type === 'MCQ' && (
                      <div style={styles.itemMcqGrid}>
                        <div>A) {act.option_a}</div><div>B) {act.option_b}</div>
                        <div>C) {act.option_c}</div><div>D) {act.option_d}</div>
                      </div>
                    )}
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                      Correct Key: {act.correct_answer || act.correct_option}
                    </span>
                  </div>
                  <button type="button" onClick={() => handleDeleteActivity(act.id)} style={styles.unlinkBtn}>Delete</button>
                </div>
              ))}
              {filteredViewList.length === 0 && (
                <p style={styles.emptyText}>No practice items published for {selectedLesson} yet. Select questions from Question Bank on the left and click Publish!</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INTERACTIVE FORUM STREAM */}
      {activeSubTab === 'forum' && (
        <div style={styles.workspaceCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h3 style={styles.cardSectionTitle}>Interactive Forum Stream ({activeGradeScope} - {currentSubject})</h3>
            <span style={{ fontSize: '12px', color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>Live Sync Operational</span>
          </div>

          <div style={styles.chatScroller}>
            {currentFilteredMessages.map(m => (
              <div key={m.id} style={{ alignSelf: m.isMe ? 'flex-start' : 'flex-end', backgroundColor: m.isMe ? '#f1f5f9' : '#eafaf1', padding: '12px 18px', borderRadius: '12px', maxWidth: '75%', fontSize: '13.5px', display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '11px', color: m.isMe ? '#475569' : '#145c2e', marginBottom: '4px' }}>
                  {m.isMe ? '👤' : '🎓'} {m.sender}
                </strong>
                <span style={{ color: '#1e293b' }}>{m.text}</span>
              </div>
            ))}
            {currentFilteredMessages.length === 0 && (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', margin: 'auto' }}>No discussion messages in this grade stream yet. Be the first to post!</p>
            )}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <input type="text" placeholder={`Type a message to send to ${activeGradeScope}...`} value={typeText} onChange={e => setTypeText(e.target.value)} style={styles.chatInput} />
            <button type="submit" style={styles.broadcastBtn}>Send 🚀</button>
          </form>
        </div>
      )}

    </div>
  );
}

const styles = {
  topIsolationDock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '15px 25px', borderRadius: '16px', border: '1px solid #cbd5e1' },
  classSelectorDropdown: { padding: '10px 18px', borderRadius: '10px', border: '1px solid #145c2e', backgroundColor: '#ffffff', fontSize: '13.5px', fontWeight: 'bold', color: '#145c2e', outline: 'none', cursor: 'pointer' },
  tabContainer: { display: 'flex', gap: '5px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' },
  tabButton: (isActive, color) => ({ padding: '11px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', backgroundColor: isActive ? color : 'transparent', color: isActive ? 'white' : '#64748b' }),
  workspaceCard: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
  cardSectionTitle: { margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e293b' },
  chatScroller: { border: '1px solid #e2e8f0', borderRadius: '12px', height: '320px', backgroundColor: '#fafbfc', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' },
  chatInput: { flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', backgroundColor: '#f8fafc' },
  broadcastBtn: { backgroundColor: '#145c2e', color: 'white', border: 'none', padding: '0 25px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px' },
  interactiveCard: (color) => ({ backgroundColor: 'white', padding: '22px', borderRadius: '15px', borderTop: `5px solid ${color}`, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }),
  formTitle: { margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e293b' },
  fieldLabel: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '3px' },
  premiumInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', outline: 'none' },
  premiumTextArea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13.5px', boxSizing: 'border-box', height: '55px', resize: 'none', outline: 'none' },
  actionSubmitBtn: (color) => ({ color: 'white', backgroundColor: color, border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '12px' }),
  bankScroller: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', backgroundColor: '#fafbfc' },
  bankSelectRow: { display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', alignItems: 'center', cursor: 'pointer' },
  listScroller: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' },
  bankItemRow: { display: 'flex', gap: '12px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' },
  typeBadge: (type) => ({ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: type === 'MCQ' ? '#e0f2fe' : '#f3e8ff', color: type === 'MCQ' ? '#0369a1' : '#145c2e' }),
  itemQuestionText: { margin: '6px 0', fontSize: '13.5px', fontWeight: '600', color: '#334155' },
  itemMcqGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  unlinkBtn: { backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px', textAlign: 'center', padding: '20px' }
};