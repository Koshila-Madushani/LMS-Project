import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentExams({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const studentGrade = user?.grade || "Grade 8";

  useEffect(() => {
    axios.get('http://localhost:8082/api/quizzes')
      .then(res => setQuizzes(res.data || []))
      .catch(() => setQuizzes([]));
  }, []);

  const cleanTxt = (str) => (str || '').replace(/\$|\{|\}/g, '');

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setUserAnswers({});
    setQuizResult(null);
    axios.get('http://localhost:8082/api/question-bank')
      .then(res => setQuizQuestions((res.data || []).filter(q => q.quiz_id === quiz.id || q.grade === studentGrade)))
      .catch(() => setQuizQuestions([]));
  };

  return (
    <div style={styles.whiteBox}>
      <h2 style={{ marginTop: 0, fontSize: '20px', color: '#145c2e', fontWeight: 'bold' }}>📝 Online Formal Exams & Evaluations</h2>

      {!activeQuiz ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px', marginTop: '20px' }}>
          {quizzes.map(q => (
            <div key={q.id} style={{ border: '1px solid #bbf7d0', padding: '22px', borderRadius: '14px', backgroundColor: '#f0fdf4' }}>
              <h3 style={{ margin: '0 0 6px 0', color: '#145c2e', fontSize: '17px' }}>{q.title}</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#15803d' }}>Grade: {q.grade} | Duration: {q.duration_minutes || 30} Mins</p>
              <button onClick={() => handleStartQuiz(q)} style={styles.primaryBtn}>🚀 Start Exam Now</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: '20px', padding: '22px', border: '2px solid #145c2e', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '17px' }}>Exam: {activeQuiz.title}</h3>
            <button onClick={() => setActiveQuiz(null)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Exit Exam</button>
          </div>

          {quizResult ? (
            <div style={{ textAlign: 'center', padding: '35px 0' }}>
              <h2 style={{ color: '#145c2e', margin: 0 }}>🎉 Exam Submitted!</h2>
              <h1 style={{ fontSize: '54px', margin: '10px 0', color: '#145c2e' }}>{quizResult.score}%</h1>
              <button onClick={() => setActiveQuiz(null)} style={{ ...styles.primaryBtn, marginTop: '18px' }}>Back to Exams List</button>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {quizQuestions.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: '18px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 12px 0', fontSize: '14.5px' }}>Q{idx + 1}. {cleanTxt(q.question_text)}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px' }}>
                        <input type="radio" name={`q_${q.id}`} value={opt} checked={userAnswers[q.id] === opt} onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })} style={{ accentColor: '#145c2e' }} />
                        <b>{opt})</b> {cleanTxt(q[`option_${opt.toLowerCase()}`])}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setQuizResult({ score: 85 })} style={{ ...styles.primaryBtn, width: '100%', padding: '14px', fontSize: '15px' }}>Submit Exam Answers 📤</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  whiteBox: { backgroundColor: '#fff', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' },
  primaryBtn: { backgroundColor: '#145c2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', textAlign: 'center', fontSize: '13.5px' }
};