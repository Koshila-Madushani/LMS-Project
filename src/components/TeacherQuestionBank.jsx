import React, { useState, useEffect } from 'react';
import axios from 'axios';

const normalizeLessonTitle = (rawTitle) => {
  if (!rawTitle) return 'General Practice';
  const match = String(rawTitle).match(/(lesson\s*\d+|chapter\s*\d+)/i);
  if (match) {
    const num = match[1].match(/\d+/)[0];
    return `Lesson ${num.padStart(2, '0')}`;
  }
  const clean = rawTitle.replace(/\s*(video|pdf|handout|doc|link|recording)\s*/gi, '').trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'General Practice';
};

// 🟢 Grade Numbers Extracting Helper (Matches "8" with "Grade 8")
const extractGradeNum = (val) => {
  if (!val) return '';
  const match = String(val).match(/\d+/);
  return match ? match[0] : String(val).trim().toLowerCase();
};

export default function TeacherQuestionBank({ teacherCode, subjectCode, userName, teachingSubject }) {
  const [bankQuestions, setBankQuestions] = useState([]);
  const [assignedGrades, setAssignedGrades] = useState([]); 
  const [publishedLessons, setPublishedLessons] = useState([]); 
  
  const [questionText, setQuestionText] = useState('');
  const [questionPurpose, setQuestionPurpose] = useState('EXAM'); 
  const [targetLesson, setTargetLesson] = useState('Lesson 01'); 
  const [questionType, setQuestionType] = useState('MCQ'); 
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [targetGrade, setTargetGrade] = useState('Grade 8');

  const [filterCategory, setFilterCategory] = useState('ALL'); 
  const [filterLesson, setFilterLesson] = useState('ALL'); 
  const [filterGrade, setFilterGrade] = useState('ALL');

  const activeTeacherCode = teacherCode || 'TC_002'; 
  const activeSubjectCode = subjectCode || 'Sub_001'; 
  const displaySubjectName = teachingSubject || 'Mathematics';

  useEffect(() => {
    axios.get('http://localhost:8082/api/teacher-assigned-grades', { params: { teacher_code: activeTeacherCode } })
      .then(res => {
        const gradesData = Array.isArray(res.data) ? res.data : [];
        setAssignedGrades(gradesData);
        if (gradesData.length > 0) {
          setTargetGrade(gradesData[0].grade);
        }
      })
      .catch(err => console.error(err));
  }, [activeTeacherCode]);

  useEffect(() => {
    if (!targetGrade) return;
    axios.get('http://localhost:8082/api/learning-materials')
      .then(res => {
        const allMaterials = Array.isArray(res.data) ? res.data : [];
        const gradeFiltered = allMaterials.filter(m => extractGradeNum(m.grade) === extractGradeNum(targetGrade));

        const uniqueLessons = Array.from(
          new Set(gradeFiltered.map(m => normalizeLessonTitle(m.title)))
        ).sort();

        setPublishedLessons(uniqueLessons);
        if (uniqueLessons.length > 0) {
          setTargetLesson(uniqueLessons[0]);
        }
      })
      .catch(err => console.error(err));
  }, [targetGrade]);

  const fetchBankQuestions = () => {
    axios.get('http://localhost:8082/api/question-bank', { params: { teacher_code: activeTeacherCode } })
      .then(res => setBankQuestions(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBankQuestions();
  }, [activeTeacherCode]);

  const handleAddQuestion = (e) => {
    e.preventDefault();

    const payload = {
      teacher_code: activeTeacherCode,
      subject_code: activeSubjectCode,
      grade: targetGrade,
      question_purpose: questionPurpose, // 'EXAM' or 'ACTIVITY'
      lesson_name: questionPurpose === 'ACTIVITY' ? targetLesson : 'General Practice',
      question_type: questionType,
      question_text: questionText,
      option_a: questionType === 'MCQ' ? optA : (questionType === 'TRUE_FALSE' ? 'TRUE' : null),
      option_b: questionType === 'MCQ' ? optB : (questionType === 'TRUE_FALSE' ? 'FALSE' : null),
      option_c: questionType === 'MCQ' ? optC : null,
      option_d: questionType === 'MCQ' ? optD : null,
      correct_option: correctAnswer.trim().toUpperCase()
    };

    axios.post('http://localhost:8082/api/question-bank', payload)
      .then(() => {
        alert("Success: Master question saved into relational repository!");
        setQuestionText(''); setCorrectAnswer('');
        setOptA(''); setOptB(''); setOptC(''); setOptD('');
        fetchBankQuestions();
      })
      .catch(err => alert("Error: " + err.message));
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Delete this question from database?")) {
      axios.delete(`http://localhost:8082/api/question-bank/${id}`).then(() => fetchBankQuestions());
    }
  };

  // 🟢 SMART ALL-MATCH FILTER LOGIC
  const filteredDisplayQuestions = bankQuestions
    .filter(q => {
      const dbGradeNum = extractGradeNum(q.grade);
      const filterGradeNum = extractGradeNum(filterGrade);
      
      const isGradeMatch = filterGrade === 'ALL' || dbGradeNum === filterGradeNum || !filterGradeNum;

      const rawPurpose = String(q.question_purpose || '').toUpperCase();
      
      let categoryPass = true;
      if (filterCategory === 'EXAM') {
        categoryPass = rawPurpose.includes('EXAM') || rawPurpose === '';
      }
      if (filterCategory === 'ACTIVITY') {
        categoryPass = rawPurpose.includes('ACT') || rawPurpose.includes('LESSON') || (q.lesson_name && q.lesson_name !== 'General Practice');
      }

      let lessonPass = true;
      if (filterCategory === 'ACTIVITY' && filterLesson !== 'ALL') {
        lessonPass = (normalizeLessonTitle(q.lesson_name) === filterLesson);
      }

      return isGradeMatch && categoryPass && lessonPass;
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={styles.topHeaderDock}>
        <div>
          <h2 style={styles.mainTitle}>Centralized Question Bank Repository</h2>
          <p style={styles.subTitle}>Subject Stream: <span style={{ color: '#15803d', fontWeight: 'bold' }}>{displaySubjectName}</span> | Instructor: <b>{userName || 'Buddhika Darshani'}</b></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '25px', alignItems: 'start' }}>
        
        {/* LEFT COMPONENT: FORM */}
        <div style={styles.card('#145c2e')}>
          <h3 style={styles.formTitle}>Create Master Question</h3>
          <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={styles.fieldLabel}>Question Purpose</label>
                <select value={questionPurpose} onChange={e => setQuestionPurpose(e.target.value)} style={styles.premiumInput}>
                  <option value="EXAM">🎯 Online Exam Question</option>
                  <option value="ACTIVITY">🧩 Lesson Activity Question</option>
                </select>
              </div>
              
              {questionPurpose === 'ACTIVITY' ? (
                <div>
                  <label style={styles.fieldLabel}>Target Lesson Module</label>
                  <select value={targetLesson} onChange={e => setTargetLesson(e.target.value)} style={styles.premiumInput}>
                    {publishedLessons.map((lTitle, idx) => (
                      <option key={idx} value={lTitle}>{lTitle}</option>
                    ))}
                    {publishedLessons.length === 0 && <option value="Lesson 01">Lesson 01</option>}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={styles.fieldLabel}>Question Structure</label>
                  <select value={questionType} onChange={e => setQuestionType(e.target.value)} style={styles.premiumInput}>
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="SHORT_ANSWER">Short Written Answer</option>
                    <option value="TRUE_FALSE">True / False Statement</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={styles.fieldLabel}>Target Grade</label>
                <select value={targetGrade} onChange={e => setTargetGrade(e.target.value)} style={styles.premiumInput}>
                  {assignedGrades.map((g, idx) => (
                    <option key={idx} value={g.grade}>{g.grade}</option>
                  ))}
                  {assignedGrades.length === 0 && <option value="Grade 8">Grade 8</option>}
                </select>
              </div>
              
              {questionPurpose === 'ACTIVITY' && (
                <div>
                  <label style={styles.fieldLabel}>Question Structure</label>
                  <select value={questionType} onChange={e => setQuestionType(e.target.value)} style={styles.premiumInput}>
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="SHORT_ANSWER">Short Written Answer</option>
                    <option value="TRUE_FALSE">True / False Statement</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label style={styles.fieldLabel}>Question Content</label>
              <textarea placeholder="Type question here..." value={questionText} onChange={e => setQuestionText(e.target.value)} required style={styles.premiumTextArea} />
            </div>

            {questionType === 'MCQ' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <input type="text" placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} required style={styles.premiumInput} />
                <input type="text" placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} required style={styles.premiumInput} />
                <input type="text" placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} required style={styles.premiumInput} />
                <input type="text" placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} required style={styles.premiumInput} />
              </div>
            )}

            {questionType === 'TRUE_FALSE' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div><label style={styles.fieldLabel}>Choice A</label><input type="text" value="TRUE" disabled style={styles.premiumInput} /></div>
                <div><label style={styles.fieldLabel}>Choice B</label><input type="text" value="FALSE" disabled style={styles.premiumInput} /></div>
              </div>
            )}

            <div>
              <label style={styles.fieldLabel}>Correct Evaluation Key</label>
              <input type="text" placeholder="e.g., A / B / C / D or TRUE/FALSE" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} required style={styles.premiumInput} />
            </div>

            <button type="submit" style={styles.submitBtn('#145c2e')}>Commit to Relational Bank 💾</button>
          </form>
        </div>

        {/* RIGHT PANEL: INVENTORY */}
        <div style={styles.card('#145c2e')}>
          <h3 style={styles.formTitle}>Live Repository Inventory</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={styles.premiumInput}>
              <option value="ALL">All Grades</option>
              {assignedGrades.map((g, idx) => (
                <option key={idx} value={g.grade}>{g.grade}</option>
              ))}
              {assignedGrades.length === 0 && <option value="Grade 8">Grade 8</option>}
            </select>
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterLesson('ALL'); }} style={styles.premiumInput}>
              <option value="ALL">All Purposes</option>
              <option value="EXAM">🎯 Online Exams Only</option>
              <option value="ACTIVITY">🧩 Lesson Activities Only</option>
            </select>
          </div>

          {filterCategory === 'ACTIVITY' && (
            <div style={{ marginBottom: '15px' }}>
              <select value={filterLesson} onChange={e => setFilterLesson(e.target.value)} style={{ ...styles.premiumInput, border: '1px solid #145c2e', fontWeight: 'bold' }}>
                <option value="ALL">Filter By Lesson: All Active Content</option>
                {publishedLessons.map((lTitle, idx) => (
                  <option key={idx} value={lTitle}>{lTitle}</option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.scrollContainer}>
            {filteredDisplayQuestions.map((q, index) => {
              const rawP = String(q.question_purpose || '').toUpperCase();
              const isActivity = rawP.includes('ACT') || rawP.includes('LESSON') || (q.lesson_name && q.lesson_name !== 'General Practice');
              const purposeTag = isActivity ? 'ACTIVITY' : 'EXAM';

              return (
                <div key={q.id || index} style={styles.itemRow}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>DB Key Ref: #{q.id} ({q.grade || 'Grade 8'})</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {isActivity && (
                        <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#145c2e' }}>
                          📌 {normalizeLessonTitle(q.lesson_name)}
                        </span>
                      )}
                      <span style={styles.badgePurpose(purposeTag)}>{purposeTag}</span>
                      <span style={styles.badgeType(q.question_type || 'MCQ')}>{q.question_type === 'TRUE_FALSE' ? 'T/F' : (q.question_type || 'MCQ')}</span>
                    </div>
                  </div>

                  <p style={styles.qTextDisplay}><b>({index + 1})</b> {q.question_text}</p>
                  
                  {(q.question_type === 'MCQ' || !q.question_type) && (
                    <div style={styles.mcqGridOptions}>
                      <div>A) {q.option_a}</div><div>B) {q.option_b}</div>
                      <div>C) {q.option_c}</div><div>D) {q.option_d}</div>
                    </div>
                  )}

                  <div style={styles.itemFooter}>
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Key: {q.correct_option}</span>
                    <button type="button" onClick={() => handleDeleteQuestion(q.id)} style={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              );
            })}
            {filteredDisplayQuestions.length === 0 && <p style={styles.emptyText}>No matching master records found.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  topHeaderDock: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '15px 20px', borderRadius: '12px', border: '1px solid #cbd5e1' },
  mainTitle: { margin: 0, fontSize: '19px', fontWeight: 'bold', color: '#1e293b' },
  subTitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' },
  card: (color) => ({ backgroundColor: 'white', padding: '24px', borderRadius: '16px', borderTop: `5px solid ${color}`, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }),
  formTitle: { margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b', fontWeight: 'bold' },
  fieldLabel: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '3px' },
  premiumInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', outline: 'none' },
  premiumTextArea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', boxSizing: 'border-box', height: '55px', resize: 'none', outline: 'none' },
  submitBtn: (color) => ({ color: 'white', backgroundColor: color, border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '5px', width: '100%' }),
  scrollContainer: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto' },
  itemRow: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  qTextDisplay: { margin: '8px 0', fontSize: '13.5px', fontWeight: '600', color: '#334155' },
  mcqGridOptions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '8px', paddingLeft: '5px' },
  itemFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', fontSize: '12.5px' },
  deleteBtn: { padding: '5px 12px', border: 'none', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  badgePurpose: (cat) => ({ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: cat === 'EXAM' ? '#ffe2e2' : '#dcfce7', color: cat === 'EXAM' ? '#991b1b' : '#145c2e' }),
  badgeType: (type) => ({ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#334155' }),
  emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px', textAlign: 'center', padding: '30px' }
};