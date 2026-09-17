import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeacherQuiz({ userName, subject, qualifications, teacherGrades, timetable }) {
  const [quizzes, setQuizzes] = useState([]);
  const [paperQuestions, setPaperQuestions] = useState([]); 
  const [centralBankPool, setCentralBankPool] = useState([]); 

  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30); // ⏱️ New Duration State
  const [selectedBankIds, setSelectedBankIds] = useState([]);

  const [dbTimetable, setDbTimetable] = useState([]);
  const [activeSubject, setActiveSubject] = useState(subject || 'Mathematics');
  const [bankFilterGrade, setBankFilterGrade] = useState('Grade 8');
  const [bankFilterSubject, setBankFilterSubject] = useState(subject || 'Mathematics');

  const [editingBankId, setEditingBankId] = useState(null); 
  const [editingId, setEditingId] = useState(null); 
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('A');
  const [qMarks, setQMarks] = useState(2);

  const refreshData = () => {
    axios.get('http://localhost:8082/api/quizzes')
      .then(res => setQuizzes(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.log("Quiz load error:", err));
    
    axios.get('http://localhost:8082/api/question-bank')
      .then(res => setPaperQuestions(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.log("Paper questions load error:", err));

    axios.get('http://localhost:8082/api/get-bank')
      .then(res => {
        const bankData = Array.isArray(res.data) ? res.data : [];
        setCentralBankPool(bankData.filter(q => q.question_purpose === 'EXAM' || !q.question_purpose));
      })
      .catch(err => console.log("Master bank load error:", err));

    axios.get('http://localhost:8082/api/timetable')
      .then(res => { if (Array.isArray(res.data)) setDbTimetable(res.data); })
      .catch(() => {});
  };

  useEffect(() => { refreshData(); }, []);

  useEffect(() => { setSelectedBankIds([]); }, [bankFilterGrade, bankFilterSubject, selectedQuizId]);

  const myUniqueSubjects = [subject || 'Mathematics'];

  const availableGrades = Array.from(new Set([
    ...(teacherGrades && teacherGrades.length > 0 ? teacherGrades : []),
    'Grade 6', 'Grade 7', 'Grade 8'
  ])).filter(g => ['Grade 6', 'Grade 7', 'Grade 8'].includes(g));

  const [formPaperGrade, setFormPaperGrade] = useState('Grade 8');

  useEffect(() => {
    if (availableGrades.length > 0 && !formPaperGrade) {
      setFormPaperGrade(availableGrades[0]);
      setBankFilterGrade(availableGrades[0]);
    }
  }, [availableGrades]);

  const activeQuizDetails = quizzes.find(qz => qz.id === parseInt(selectedQuizId));
  const isEnabled = (quiz) => quiz.is_enabled === 1 || quiz.is_enabled === true;
  const isCurrentQuizEnabled = activeQuizDetails && isEnabled(activeQuizDetails);

  // 🟢 CREATE PAPER WITH DURATION
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    const paperTitle = quizTitle.trim() || '1st Term Evaluation';

    const payload = { 
      title: paperTitle, 
      grade: formPaperGrade, 
      duration_minutes: parseInt(durationMinutes) || 30,
      subject: activeSubject || 'Mathematics', 
      teacher_name: userName || 'Buddhika Darshani', 
      is_enabled: 0 
    };

    try {
      const res = await axios.post('http://localhost:8082/api/add-quiz', payload);
      
      if (res.data && res.data.status === "Error") {
        alert("⚠️ Database Error: " + res.data.error);
        return;
      }

      const newInsertId = res.data && res.data.insertId ? res.data.insertId : Date.now();
      const newQuizObj = { id: newInsertId, title: paperTitle, grade: formPaperGrade, duration_minutes: durationMinutes, is_enabled: 0 };

      setQuizzes(prev => [newQuizObj, ...prev]);
      setSelectedQuizId(String(newInsertId));
      setQuizTitle('');
      setDurationMinutes(30);
      
      alert(`✅ Quiz Paper "${paperTitle}" created successfully with ${durationMinutes} mins duration!`);
      refreshData();
    } catch (err) {
      console.error("Quiz paper creation error:", err);
      alert("⚠️ Connection Error: Please check backend server.");
    }
  };

  const handleToggleEnable = (quiz) => {
    const updatedStatus = isEnabled(quiz) ? 0 : 1;
    axios.put(`http://localhost:8082/api/toggle-quiz/${quiz.id}`, { ...quiz, is_enabled: updatedStatus })
      .then(() => {
        alert(`💡 Quiz status updated successfully!`);
        refreshData();
      })
      .catch(err => alert("Error updating status: " + err.message));
  };

  const handleDeleteQuiz = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this quiz paper?")) {
      axios.delete(`http://localhost:8082/api/delete-quiz/${id}`)
        .then(() => {
          if (selectedQuizId === String(id)) setSelectedQuizId('');
          refreshData();
        })
        .catch(err => alert("Error deleting quiz: " + err.message));
    }
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (selectedQuizId && isCurrentQuizEnabled) {
      alert("⚠️ Active exam paper cannot be edited!");
      return;
    }
    if (editingBankId) {
      const payloadBank = { question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: correctOpt, grade: bankFilterGrade, subject: bankFilterSubject, teacher_name: userName };
      axios.put(`http://localhost:8082/api/edit-bank-question/${editingBankId}`, payloadBank)
        .then(() => { alert("✅ Question updated successfully!"); clearForm(); refreshData(); })
        .catch(err => alert("Error: " + err.message));
      return;
    }
    if (editingId) {
      const payloadPaperEdit = { quiz_id: parseInt(selectedQuizId), question_text: qText, marks: parseInt(qMarks), option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: correctOpt };
      axios.put(`http://localhost:8082/api/edit-question/${editingId}`, payloadPaperEdit)
        .then(() => { alert("✅ Paper question updated successfully!"); clearForm(); refreshData(); })
        .catch(err => alert("Error: " + err.message));
      return;
    }
    if (!selectedQuizId) {
      const payloadNewBank = { question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: correctOpt, grade: bankFilterGrade, subject: bankFilterSubject, teacher_name: userName, question_purpose: 'EXAM' };
      axios.post('http://localhost:8082/api/question-bank', payloadNewBank)
        .then(() => { alert("✅ Question added to Question Bank!"); clearForm(); refreshData(); })
        .catch(err => alert("Error: " + err.message));
    } else {
      const payloadNewPaper = { quiz_id: parseInt(selectedQuizId), question_text: qText, marks: parseInt(qMarks), option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: correctOpt };
      axios.post('http://localhost:8082/api/add-question', payloadNewPaper)
        .then(() => { alert("✅ Question added to Exam Paper!"); clearForm(); refreshData(); })
        .catch(err => alert("Error: " + err.message));
    }
  };

  const handleBulkLinkQuestions = () => {
    if (!selectedQuizId || isCurrentQuizEnabled || selectedBankIds.length === 0) return;
    
    const existingQuestionTexts = activePaperQuestions.map(q => q.question_text.trim().toLowerCase());
    
    const questionsToLink = filteredBankQuestions.filter(q => 
      selectedBankIds.includes(q.id) && !existingQuestionTexts.includes(q.question_text.trim().toLowerCase())
    );

    if (questionsToLink.length === 0) {
      alert("⚠️ All selected questions are already linked to this exam paper!");
      setSelectedBankIds([]);
      return;
    }

    if (window.confirm(`Are you sure you want to link ${questionsToLink.length} selected questions to this exam paper?`)) {
      const promises = questionsToLink.map(bq => {
        return axios.post('http://localhost:8082/api/add-question', {
          quiz_id: parseInt(selectedQuizId),
          question_text: bq.question_text,
          marks: 2,
          option_a: bq.option_a,
          option_b: bq.option_b,
          option_c: bq.option_c,
          option_d: bq.option_d,
          correct_option: bq.correct_option
        });
      });
      Promise.all(promises).then(() => {
        alert("➕ Selected questions linked successfully!");
        setSelectedBankIds([]);
        refreshData();
      }).catch(err => alert("Bulk link error: " + err.message));
    }
  };

  const handleDeletePaperQuestion = (id) => {
    if (isCurrentQuizEnabled) return;
    if (window.confirm("Remove this question from the paper?")) {
      axios.delete(`http://localhost:8082/api/delete-question/${id}`).then(() => { refreshData(); });
    }
  };

  const handleDeleteFromCentralBank = (id) => {
    if (window.confirm("Permanently delete this question from the Question Bank?")) {
      axios.delete(`http://localhost:8082/api/question-bank/${id}`).then(() => { refreshData(); });
    }
  };

  const handleStartBankEdit = (q) => { setEditingBankId(q.id); setEditingId(null); setQText(q.question_text); setOptA(q.option_a); setOptB(q.option_b); setOptC(q.option_c); setOptD(q.option_d); setCorrectOpt(q.correct_option); };
  const clearForm = () => { setQText(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setCorrectOpt('A'); setEditingId(null); setEditingBankId(null); };
  const handleStartEdit = (q) => { if (isCurrentQuizEnabled) return; setEditingId(q.id); setEditingBankId(null); setQText(q.question_text); setOptA(q.option_a); setOptB(q.option_b); setOptC(q.option_c); setOptD(q.option_d); setCorrectOpt(q.correct_option); setQMarks(q.marks); };

  const isSubjectLooseMatch = (dbSub, filterSub) => {
    if (!dbSub || !filterSub) return true;
    return dbSub.toLowerCase().replace(/s$/, '') === filterSub.toLowerCase().replace(/s$/, '');
  };

  const filteredQuizzes = quizzes;
  const activePaperQuestions = paperQuestions.filter(q => q.quiz_id === parseInt(selectedQuizId));
  
  const filteredBankQuestions = selectedQuizId 
    ? centralBankPool.filter(q => {
        const isGradeMatch = String(q.grade).toLowerCase() === bankFilterGrade.toLowerCase();
        const isSubMatch = isSubjectLooseMatch(q.subject || q.subject_name, bankFilterSubject);
        return isGradeMatch && isSubMatch;
      })
    : [];

  const isAllSelected = filteredBankQuestions.length > 0 && filteredBankQuestions.every(q => selectedBankIds.includes(q.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) { setSelectedBankIds([]); } 
    else { setSelectedBankIds(filteredBankQuestions.map(q => q.id)); }
  };

  const handleToggleSelectQuestion = (id) => {
    if (selectedBankIds.includes(id)) { setSelectedBankIds(selectedBankIds.filter(item => item !== id)); } 
    else { setSelectedBankIds([...selectedBankIds, id]); }
  };

  const isLinkBtnDisabled = !selectedQuizId || isCurrentQuizEnabled || selectedBankIds.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', fontFamily: 'sans-serif' }}>
      
      <div style={styles.topBar}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>📝 MCQ Exam Dashboard Management</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Active Subject:</span>
          <select value={activeSubject} onChange={e => { setActiveSubject(e.target.value); setBankFilterSubject(e.target.value); setSelectedQuizId(''); }} style={styles.selectBtn}>
            {myUniqueSubjects.map(subName => <option key={subName} value={subName}>{subName}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={styles.card('#15803d')}>
          <h4 style={styles.stepTitle('#15803d')}>Step 1: Create a New Quiz Paper</h4>
          <form onSubmit={handleCreatePaper} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Type Title (e.g., 1st Term Evaluation)" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} style={styles.fullInput} />
            <select value={formPaperGrade} onChange={e => setFormPaperGrade(e.target.value)} style={styles.fullInput}>
              {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            
            {/* ⏱️ Duration Input Field Added Here */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>Exam Duration (Minutes):</span>
              <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} min="5" max="180" style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }} />
            </div>

            <button type="submit" style={{ ...styles.btn, backgroundColor: '#15803d' }}>Create Paper Schema</button>
          </form>
        </div>

        <div style={styles.card('#2563eb')}>
          <h4 style={styles.stepTitle('#2563eb')}>Step 2: Active Exam Paper Target</h4>
          <select value={selectedQuizId} onChange={e => { setSelectedQuizId(e.target.value); clearForm(); }} style={styles.fullInput}>
            <option value="">-- Choose Target Exam Paper --</option>
            {filteredQuizzes.map(q => <option key={q.id} value={q.id}>{q.title} ({q.grade}) - {q.duration_minutes || 30} mins</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '25px', alignItems: 'start' }}>
        
        <div style={styles.card(editingId || editingBankId ? '#ea580c' : '#475569')}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b' }}>{editingBankId ? '✏️ Edit Bank Question' : editingId ? '✏️ Edit Paper Question' : '➕ Add Custom Question'}</h3>
          <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea placeholder="Type question..." value={qText} onChange={e => setQText(e.target.value)} required style={styles.textArea} />
            <div style={styles.optRow}><input type="radio" checked={correctOpt === 'A'} onChange={() => setCorrectOpt('A')} /><input type="text" placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} required style={styles.fullInput} /></div>
            <div style={styles.optRow}><input type="radio" checked={correctOpt === 'B'} onChange={() => setCorrectOpt('B')} /><input type="text" placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} required style={styles.fullInput} /></div>
            <div style={styles.optRow}><input type="radio" checked={correctOpt === 'C'} onChange={() => setCorrectOpt('C')} /><input type="text" placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} required style={styles.fullInput} /></div>
            <div style={styles.optRow}><input type="radio" checked={correctOpt === 'D'} onChange={() => setCorrectOpt('D')} /><input type="text" placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} required style={styles.fullInput} /></div>
            <button type="submit" style={{ ...styles.btn, backgroundColor: '#475569' }}>Save Question 💾</button>
          </form>
        </div>

        <div style={styles.card('#6b21a8')}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b' }}>📚 Central Question Bank</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <select value={bankFilterGrade} onChange={e => setBankFilterGrade(e.target.value)} style={styles.fullInput}>
              {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={bankFilterSubject} onChange={e => setBankFilterSubject(e.target.value)} style={styles.fullInput}>
              {myUniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={styles.bulkHeader}>
            <label style={styles.bulkLabel}>
              <input type="checkbox" checked={isAllSelected} onChange={handleToggleSelectAll} disabled={!selectedQuizId} style={{ cursor: selectedQuizId ? 'pointer' : 'not-allowed' }} /> Select All ({filteredBankQuestions.length})
            </label>
            <button 
              onClick={handleBulkLinkQuestions} 
              disabled={isLinkBtnDisabled} 
              style={{ 
                ...styles.bulkBtn, 
                backgroundColor: isLinkBtnDisabled ? '#cbd5e1' : '#16a34a',
                cursor: isLinkBtnDisabled ? 'not-allowed' : 'pointer'
              }}
              title={!selectedQuizId ? "Please select a target Exam Paper from Step 2 first!" : ""}
            >
              Link Selected ({selectedBankIds.length})
            </button>
          </div>

          <div style={styles.scrollArea}>
            {filteredBankQuestions.map((q, idx) => (
              <div key={q.id || idx} style={styles.bankItem}>
                <input type="checkbox" checked={selectedBankIds.includes(q.id)} onChange={() => handleToggleSelectQuestion(q.id)} style={{ transform: 'scale(1.1)', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <h5 style={{ margin: '0 0 5px 0', fontSize: '13.5px', color: '#1e293b' }}>{q.question_text}</h5>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <button type="button" onClick={() => handleStartBankEdit(q)} style={styles.miniActionBtn('#2563eb', '#dbeafe')}>Edit</button>
                    <button type="button" onClick={() => handleDeleteFromCentralBank(q.id)} style={styles.miniActionBtn('#b91c1c', '#fee2e2')}>Delete</button>
                  </div>
                </div>
              </div>
            ))}

            {!selectedQuizId && (
              <p style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '12.5px', textAlign: 'center', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px dashed #93c5fd' }}>
                👉 Please select an Exam Paper from Step 2 to view and link questions.
              </p>
            )}

            {selectedQuizId && filteredBankQuestions.length === 0 && (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px', textAlign: 'center' }}>📭 No questions available for this grade.</p>
            )}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '25px' }}>
        <div style={styles.card('#e11d48')}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b' }}>📂 Quiz Papers & Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredQuizzes.map((qz, i) => (
              <div key={qz.id || i} style={styles.paperRow}>
                <span style={{ fontSize: '13.5px', fontWeight: '500', color: '#1e293b' }}>{qz.title} ({qz.grade}) - ⏱️ {qz.duration_minutes || 30}m</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button onClick={() => handleToggleEnable(qz)} style={{ ...styles.statusBtn, backgroundColor: isEnabled(qz) ? '#16a34a' : '#dc2626' }}>
                    {isEnabled(qz) ? 'Enabled' : 'Disabled'}
                  </button>
                  <button onClick={() => handleDeleteQuiz(qz.id)} title="Delete Quiz Paper" style={styles.deletePaperBtn}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {filteredQuizzes.length === 0 && (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px', textAlign: 'center', padding: '15px 0', margin: 0 }}>
                No quiz papers created yet.
              </p>
            )}
          </div>
        </div>

        <div style={styles.blueprintCard}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
            {selectedQuizId && activeQuizDetails ? `${activeQuizDetails.title} (Duration: ${activeQuizDetails.duration_minutes || 30} mins)` : "Active Examination Blueprint Sheet"}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activePaperQuestions.map((q, idx) => {
              const editColor = isCurrentQuizEnabled ? '#cbd5e1' : '#2563eb';
              const delColor = isCurrentQuizEnabled ? '#cbd5e1' : '#ef4444';
              return (
                <div key={q.id || idx} style={styles.blueprintItem}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13.5px' }}>({idx + 1})</span>
                    <p style={{ margin: 0, flex: 1, fontSize: '13.5px', color: '#334155' }}>{q.question_text}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleStartEdit(q)} disabled={isCurrentQuizEnabled} style={{ color: editColor, border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>[Edit]</button>
                      <button onClick={() => handleDeletePaperQuestion(q.id)} disabled={isCurrentQuizEnabled} style={{ color: delColor, border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>[Delete]</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {activePaperQuestions.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px', textAlign: 'center' }}>📭 No questions added to this exam paper yet.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  card: (color) => ({ backgroundColor: 'white', padding: '24px', borderRadius: '15px', borderTop: `5px solid ${color}`, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }),
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1' },
  selectBtn: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold', outline: 'none', cursor: 'pointer' },
  stepTitle: (color) => ({ margin: '0 0 12px 0', color: color, fontWeight: 'bold', fontSize: '14px' }),
  fullInput: { width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc', fontSize: '13px', marginBottom: '5px' },
  btn: { color: 'white', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  textArea: { width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc', fontSize: '13px', resize: 'none' },
  optRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  bulkHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '10px 15px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #cbd5e1' },
  bulkLabel: { fontSize: '12.5px', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' },
  bulkBtn: { color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  scrollArea: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' },
  bankItem: { backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', display: 'flex', gap: '12px', border: '1px solid #e2e8f0', alignItems: 'flex-start' },
  miniActionBtn: (color, bgColor) => ({ padding: '2px 8px', border: 'none', backgroundColor: bgColor, color: color, borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }),
  paperRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', alignItems: 'center' },
  statusBtn: { color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' },
  deletePaperBtn: { backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' },
  blueprintCard: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #cbd5e1' },
  blueprintItem: { borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px' }
};