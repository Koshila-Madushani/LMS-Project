const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// GLOBAL CRASH PROTECTION ENGINE
process.on('uncaughtException', (err) => {
    console.error("🔴 Uncaught Exception Intercepted:", err.message);
});

process.on('unhandledRejection', (err) => {
    console.error("🔴 Unhandled Rejection Intercepted:", err);
});

// STATIC UPLOADS FOLDER SETUP
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// DATABASE CONFIGURATION & AUTOMATIC SCHEMA ADJUSTMENTS
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "aurapen_lms_db"
});

db.connect((err) => {
    if (err) {
        console.error("🔴 Database Connection Failed Details:", err.message);
    } else {
        console.log("🟢 Database Node linked successfully via 3NF Framework!");
        
        // Auto Create Announcements Table if not exists
        const createAnnouncementsTable = `
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        db.query(createAnnouncementsTable);

        // Safe Alter Table Executions
        db.query("SHOW COLUMNS FROM quizzes LIKE 'is_enabled'", (err, res) => {
            if (res && res.length === 0) {
                db.query("ALTER TABLE quizzes ADD COLUMN is_enabled TINYINT(1) DEFAULT 0");
            }
        });
        db.query("SHOW COLUMNS FROM quizzes LIKE 'duration_minutes'", (err, res) => {
            if (res && res.length === 0) {
                db.query("ALTER TABLE quizzes ADD COLUMN duration_minutes INT DEFAULT 30");
            }
        });
        db.query("SHOW COLUMNS FROM lesson_activities LIKE 'grade'", (err, res) => {
            if (res && res.length === 0) {
                db.query("ALTER TABLE lesson_activities ADD COLUMN grade VARCHAR(50)");
            }
        });
    }
});

// MULTER FILE UPLOAD CONFIGURATION
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// INPUT VALIDATORS
const validateSriLankanMobile = (phone) => {
    if (!phone) return true;
    const clean = String(phone).replace(/[\s\-]/g, ''); 
    const mobileRegex = /^07[01245678][0-9]{7}$/;
    const landlineRegex = /^0[12345689][0-9]{8}$/;
    return mobileRegex.test(clean) || landlineRegex.test(clean);
};

const validateLowercaseEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(email) && !/[A-Z]/.test(email);
};

// ==========================================
// --- ANNOUNCEMENTS / NOTICES API ---
// ==========================================
app.get('/api/announcements', (req, res) => {
    const query = "SELECT * FROM announcements ORDER BY id DESC LIMIT 10"; 
    db.query(query, (err, results) => {
        if (err) {
            return res.json({ status: "Error", error: err.sqlMessage });
        }
        res.json({ status: "Success", data: results });
    });
});

// ==========================================
// --- 1. LOGIN API (FULL STUDENT DATA LOAD) ---
// ==========================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, userResult) => {
        if (err) return res.json({ status: "Failed", message: "Database Error" });
        if (!userResult || userResult.length === 0) return res.json({ status: "Failed", message: "Invalid Credentials" });
        
        const user = userResult[0];
        if (user.role === 'admin') return res.json({ status: "Success", role: "admin", name: "Admin", username: user.username, id: user.id });
        
        if (user.role === 'teacher') {
            const teacherQuery = `
                SELECT t.*, s.subject_name 
                FROM teachers t 
                LEFT JOIN teacher_subjects ts ON t.teacher_code = ts.teacher_code 
                LEFT JOIN subjects s ON ts.subject_code = s.subject_code 
                WHERE t.user_id = ?
            `;
            db.query(teacherQuery, [user.id], (err, tRes) => {
                if (err || !tRes || tRes.length === 0) return res.json({ status: "Failed", message: "Teacher Profile Not Found" });
                const teacherData = tRes[0];
                return res.json({ 
                    status: "Success", role: 'teacher', username: user.username, id: user.id,
                    teacherCode: teacherData.teacher_code, subjectCode: teacherData.subject_code,
                    name: teacherData.full_name, full_name: teacherData.full_name, phone: teacherData.phone_number, 
                    address: teacherData.address, email: teacherData.email,
                    subject: teacherData.subject_name || 'Mathematics', qualifications: teacherData.qualifications
                });
            });
        } else if (user.role === 'student') {
            const studentQuery = `
                SELECT s.*, 
                (SELECT GROUP_CONCAT(sub.subject_name SEPARATOR ', ') 
                 FROM student_subjects ss 
                 JOIN subjects sub ON ss.subject_code = sub.subject_code 
                 WHERE ss.student_code = s.student_code) as subjects
                FROM students s 
                WHERE s.user_id = ?
            `;
            db.query(studentQuery, [user.id], (err, sRes) => {
                if (err || !sRes || sRes.length === 0) return res.json({ status: "Failed", message: "Student Profile Not Found" });
                const studentData = sRes[0];
                const studentRealName = studentData.full_name || user.username;

                return res.json({ 
                    status: "Success", 
                    role: 'student', 
                    id: studentData.id,
                    user_id: user.id,
                    username: user.username,
                    studentCode: studentData.student_code, 
                    name: studentRealName, 
                    full_name: studentRealName,
                    student_name: studentRealName,
                    phone: studentData.phone_number, 
                    address: studentData.address, 
                    grade: studentData.grade || "Grade 8",
                    subjects: studentData.subjects ? studentData.subjects.split(',').map(s => s.trim()) : ["Mathematics", "Science", "English"]
                });
            });
        } else {
            return res.json({ status: "Failed", message: "Unknown User Role" });
        }
    });
});

// ==========================================
// --- 2. STUDENT PROFILE FETCH & UPDATE API ---
// ==========================================
app.get('/api/students/:id', (req, res) => {
    const identifier = req.params.id;
    const query = `
        SELECT s.*, u.username,
        (SELECT GROUP_CONCAT(sub.subject_name SEPARATOR ', ') 
         FROM student_subjects ss 
         JOIN subjects sub ON ss.subject_code = sub.subject_code 
         WHERE ss.student_code = s.student_code) as subjects
        FROM students s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.id = ? OR s.user_id = ? OR u.username = ? OR s.student_code = ?
    `;
    
    db.query(query, [identifier, identifier, identifier, identifier], (err, result) => {
        if (err || !result || result.length === 0) return res.json(null);
        const s = result[0];
        const studentName = s.full_name || s.username || "Student";

        res.json({
            id: s.id,
            user_id: s.user_id,
            student_code: s.student_code,
            name: studentName,
            full_name: studentName,
            student_name: studentName,
            phone: s.phone_number,
            address: s.address,
            grade: s.grade || "Grade 8",
            subjects: s.subjects ? s.subjects.split(',').map(sub => sub.trim()) : ["Mathematics", "Science", "English"]
        });
    });
});

app.post('/api/update-profile', (req, res) => {
    const { student_id, name, phone, address, password } = req.body;
    const updateStudentSql = "UPDATE students SET full_name = ?, phone_number = ?, address = ? WHERE id = ? OR user_id = ?";
    
    db.query(updateStudentSql, [name, phone, address, student_id, student_id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });

        if (password && password.trim() !== '') {
            db.query("SELECT user_id FROM students WHERE id = ?", [student_id], (uErr, uRes) => {
                const targetUserId = (uRes && uRes.length > 0) ? uRes[0].user_id : student_id;
                db.query("UPDATE users SET password = ? WHERE id = ?", [password, targetUserId]);
            });
        }
        return res.json({ status: "Success", message: "Profile updated successfully!" });
    });
});

// ==========================================
// --- 3. TEACHERS API ---
// ==========================================
app.get('/api/view-teachers', (req, res) => {
    const query = `
        SELECT t.id, t.teacher_code, t.full_name as name, t.qualifications, t.phone_number, t.email, t.address, u.username,
        (SELECT s.subject_name FROM teacher_subjects ts JOIN subjects s ON ts.subject_code = s.subject_code WHERE ts.teacher_code = t.teacher_code LIMIT 1) as Subject
        FROM teachers t JOIN users u ON t.user_id = u.id ORDER BY t.id DESC
    `;
    db.query(query, (err, result) => res.json(result || []));
});

app.post('/api/add-teacher', (req, res) => {
    const { name, username, subject, qualifications, email, phone_number, address, password } = req.body;
    if (!validateSriLankanMobile(phone_number)) return res.json({ status: "Error", error: "Invalid Sri Lankan Phone Number Structure!" });
    if (!validateLowercaseEmail(email)) return res.json({ status: "Error", error: "Email must be strictly lowercase simple letters!" });

    const cleanPhone = phone_number ? phone_number.replace(/[\s\-]/g, '') : '';
    db.query("INSERT INTO users (username, password, role) VALUES (?, ?, 'teacher')", [username, password], (err, uRes) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        const userId = uRes.insertId;
        const teacherCode = `TC_${String(userId).padStart(3, '0')}`;
        db.query("INSERT INTO teachers (user_id, teacher_code, full_name, qualifications, email, phone_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [userId, teacherCode, name, qualifications, email ? email.toLowerCase() : '', cleanPhone, address], (err2) => {
            if (err2) return res.json({ status: "Error", error: err2.sqlMessage });
            db.query("SELECT subject_code FROM subjects WHERE subject_name = ? LIMIT 1", [subject], (err3, sRes) => {
                if (sRes && sRes.length > 0) {
                    db.query("INSERT INTO teacher_subjects (teacher_code, subject_code) VALUES (?, ?)", [teacherCode, sRes[0].subject_code]);
                }
            });
            return res.json({ status: "Success" });
        });
    });
});

app.put('/api/edit-teacher/:id', (req, res) => {
    const { name, phone_number, email, qualifications, address, subject } = req.body;
    if (!validateSriLankanMobile(phone_number)) return res.json({ status: "Error", error: "Invalid Sri Lankan Phone Number!" });
    if (!validateLowercaseEmail(email)) return res.json({ status: "Error", error: "Email must be lowercase!" });

    const cleanPhone = phone_number ? phone_number.replace(/[\s\-]/g, '') : '';
    db.query("UPDATE teachers SET full_name=?, phone_number=?, email=?, qualifications=?, address=? WHERE id=?",
        [name, cleanPhone, email ? email.toLowerCase() : '', qualifications, address, req.params.id], 
        (err) => {
            if (err) return res.json({ status: "Error", error: err.sqlMessage });
            db.query("SELECT teacher_code FROM teachers WHERE id = ?", [req.params.id], (errCode, tRes) => {
                if (tRes && tRes.length > 0) {
                    const teacherCode = tRes[0].teacher_code;
                    db.query("SELECT subject_code FROM subjects WHERE subject_name = ? LIMIT 1", [subject], (errSub, sRes) => {
                        if (sRes && sRes.length > 0) {
                            db.query("DELETE FROM teacher_subjects WHERE teacher_code = ?", [teacherCode], () => {
                                db.query("INSERT INTO teacher_subjects (teacher_code, subject_code) VALUES (?, ?)", [teacherCode, sRes[0].subject_code]);
                            });
                        }
                    });
                }
            });
            return res.json({ status: "Success" });
        }
    );
});

app.delete('/api/delete-teacher/:id', (req, res) => {
    db.query("SELECT user_id FROM teachers WHERE id = ?", [req.params.id], (err, result) => {
        if (result && result.length > 0) {
            db.query("DELETE FROM users WHERE id = ?", [result[0].user_id], (err2) => {
                if (err2) return res.json({ status: "Error", error: err2.sqlMessage });
                res.json({ status: "Success" });
            });
        } else {
            res.json({ status: "Error", message: "Teacher not found" });
        }
    });
});

// ==========================================
// --- 4. STUDENTS API ---
// ==========================================
app.get('/api/view-students', (req, res) => {
    const query = `
        SELECT s.id, s.student_code, s.full_name as name, s.grade, s.phone_number, s.email, s.address, u.username,
        (SELECT GROUP_CONCAT(sub.subject_name SEPARATOR ', ') FROM student_subjects ss JOIN subjects sub ON ss.subject_code = sub.subject_code WHERE ss.student_code = s.student_code) as subjects
        FROM students s JOIN users u ON s.user_id = u.id ORDER BY s.id DESC
    `;
    db.query(query, (err, result) => res.json(result || []));
});

app.post('/api/add-student', (req, res) => {
    const { name, username, grade, subjects, phone_number, email, address, password } = req.body;
    if (!validateSriLankanMobile(phone_number)) return res.json({ status: "Error", error: "Invalid Mobile Phone number pattern!" });
    if (!validateLowercaseEmail(email)) return res.json({ status: "Error", error: "Simple letters lowercase email only!" });

    const cleanPhone = phone_number ? phone_number.replace(/[\s\-]/g, '') : '';
    db.query("INSERT INTO users (username, password, role) VALUES (?, ?, 'student')", [username, password], (err, uRes) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        const userId = uRes.insertId;
        const studentCode = `ST_${String(userId).padStart(3, '0')}`;
        db.query("INSERT INTO students (user_id, student_code, full_name, grade, phone_number, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [userId, studentCode, name, grade, cleanPhone, email ? email.toLowerCase() : '', address], (err2) => {
            if (err2) return res.json({ status: "Error", error: err2.sqlMessage });
            
            let subjectArray = [];
            if (Array.isArray(subjects)) subjectArray = subjects;
            else if (typeof subjects === 'string' && subjects.trim() !== '') subjectArray = subjects.split(',').map(s => s.trim()).filter(Boolean);

            if (subjectArray.length > 0) {
                db.query("SELECT subject_code, subject_name FROM subjects", (sErr, allSubs) => {
                    if (allSubs && allSubs.length > 0) {
                        const matchedCodes = [];
                        subjectArray.forEach(subName => {
                            const match = allSubs.find(s => s.subject_name.trim().toLowerCase() === subName.trim().toLowerCase());
                            if (match) matchedCodes.push(match.subject_code);
                        });
                        if (matchedCodes.length > 0) {
                            const insertValues = matchedCodes.map(code => [studentCode, code]);
                            db.query("INSERT INTO student_subjects (student_code, subject_code) VALUES ?", [insertValues]);
                        }
                    }
                });
            }
            return res.json({ status: "Success" });
        });
    });
});

const handleStudentUpdate = (req, res) => {
    const { name, grade, phone_number, email, address, subjects } = req.body;
    const studentId = req.params.id;

    if (phone_number && !validateSriLankanMobile(phone_number)) {
        return res.json({ status: "Error", error: "Invalid Phone number structure!" });
    }

    const cleanPhone = phone_number ? String(phone_number).replace(/[\s\-]/g, '') : '';
    const cleanEmail = email ? String(email).toLowerCase().trim() : '';

    const sql = "UPDATE students SET full_name=?, grade=?, phone_number=?, email=?, address=? WHERE id=?";
    const params = [name, grade, cleanPhone, cleanEmail, address, studentId];

    db.query(sql, params, (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });

        db.query("SELECT student_code FROM students WHERE id = ?", [studentId], (errCode, sRes) => {
            if (errCode || !sRes || sRes.length === 0) {
                return res.json({ status: "Success", message: "Student updated" });
            }

            const studentCode = sRes[0].student_code;

            db.query("DELETE FROM student_subjects WHERE student_code = ?", [studentCode], (delErr) => {
                if (delErr) return res.json({ status: "Error", error: delErr.sqlMessage });

                let subjectArray = [];
                if (Array.isArray(subjects)) {
                    subjectArray = subjects;
                } else if (typeof subjects === 'string' && subjects.trim() !== '') {
                    subjectArray = subjects.split(',').map(s => s.trim()).filter(Boolean);
                }

                if (subjectArray.length === 0) {
                    return res.json({ status: "Success", message: "Updated with no subjects" });
                }

                db.query("SELECT subject_code, subject_name FROM subjects", (subErr, allSubjects) => {
                    if (subErr || !allSubjects || allSubjects.length === 0) {
                        return res.json({ status: "Success", message: "No subjects in DB" });
                    }

                    const matchedCodes = [];
                    subjectArray.forEach(inputName => {
                        const match = allSubjects.find(s => s.subject_name.trim().toLowerCase() === inputName.trim().toLowerCase());
                        if (match) {
                            matchedCodes.push(match.subject_code);
                        }
                    });

                    if (matchedCodes.length === 0) {
                        return res.json({ status: "Success", message: "No matching subjects" });
                    }

                    const insertValues = matchedCodes.map(code => [studentCode, code]);
                    db.query("INSERT INTO student_subjects (student_code, subject_code) VALUES ?", [insertValues], (iErr) => {
                        if (iErr) return res.json({ status: "Error", error: iErr.sqlMessage });
                        return res.json({ status: "Success", message: "Student and subjects updated successfully!" });
                    });
                });
            });
        });
    });
};

app.put('/api/update-student/:id', handleStudentUpdate);
app.put('/api/edit-student/:id', handleStudentUpdate);

app.delete('/api/delete-student/:id', (req, res) => {
    db.query("SELECT user_id FROM students WHERE id = ?", [req.params.id], (err, result) => {
        if (result && result.length > 0) {
            db.query("DELETE FROM users WHERE id = ?", [result[0].user_id], (err2) => {
                if (err2) return res.json({ status: "Error", error: err2.sqlMessage });
                res.json({ status: "Success" });
            });
        } else {
            res.json({ status: "Error", message: "Student not found" });
        }
    });
});

// ==========================================
// --- 5. TIMETABLE API ---
// ==========================================
app.get('/api/timetable', (req, res) => {
    const query = `
        SELECT t.id, t.day, t.time_slot, t.grade, COALESCE(s.subject_name, 'Mathematics') as subject, COALESCE(tc.full_name, 'Teacher') as teacher 
        FROM timetable t 
        LEFT JOIN subjects s ON t.subject_code = s.subject_code 
        LEFT JOIN teachers tc ON t.teacher_code = tc.teacher_code 
        ORDER BY t.id DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

app.post('/api/timetable', (req, res) => {
    const { day, grade, subject_id, time_slot, teacher_id } = req.body;
    db.query("SELECT subject_code FROM subjects WHERE id = ?", [subject_id], (err, sRes) => {
        db.query("SELECT teacher_code FROM teachers WHERE id = ?", [teacher_id], (err2, tRes) => {
            const subCode = (sRes && sRes.length > 0) ? sRes[0].subject_code : 'Sub_001';
            const teachCode = (tRes && tRes.length > 0) ? tRes[0].teacher_code : 'TC_001';
            db.query("INSERT INTO timetable (day, time_slot, grade, subject_code, teacher_code) VALUES (?, ?, ?, ?, ?)", 
            [day, time_slot, grade, subCode, teachCode], (err3) => {
                if (err3) return res.json({ status: "Error", error: err3.sqlMessage });
                res.json({ status: "Success" });
            });
        });
    });
});

app.put('/api/timetable/:id', (req, res) => {
    const { day, grade, subject_id, time_slot, teacher_id } = req.body;
    db.query("SELECT subject_code FROM subjects WHERE id = ?", [subject_id], (err, sRes) => {
        db.query("SELECT teacher_code FROM teachers WHERE id = ?", [teacher_id], (err2, tRes) => {
            const subCode = (sRes && sRes.length > 0) ? sRes[0].subject_code : 'Sub_001';
            const teachCode = (tRes && tRes.length > 0) ? tRes[0].teacher_code : 'TC_001';
            db.query("UPDATE timetable SET day=?, time_slot=?, grade=?, subject_code=?, teacher_code=? WHERE id=?", 
            [day, time_slot, grade, subCode, teachCode, req.params.id], (err3) => {
                if (err3) return res.json({ status: "Error", error: err3.sqlMessage });
                res.json({ status: "Success" });
            });
        });
    });
});

app.delete('/api/timetable/:id', (req, res) => {
    db.query("DELETE FROM timetable WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 6. SUBJECTS API ---
// ==========================================
app.get('/api/view-subjects', (req, res) => {
    db.query("SELECT * FROM subjects ORDER BY id DESC", (err, result) => res.json(result || []));
});

app.post('/api/add-subject', (req, res) => {
    db.query("INSERT INTO subjects (subject_code, subject_name) VALUES (?, ?)", 
    [req.body.subject_code, req.body.subject_name], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.put('/api/edit-subject/:id', (req, res) => {
    db.query("UPDATE subjects SET subject_code=?, subject_name=? WHERE id=?", 
    [req.body.subject_code, req.body.subject_name, req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

app.delete('/api/delete-subject/:id', (req, res) => {
    db.query("DELETE FROM subjects WHERE id=?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 7. LEARNING MATERIALS API ---
// ==========================================
app.get('/api/learning-materials', (req, res) => {
    const query = `
        SELECT lm.*, s.subject_name as subject 
        FROM learning_materials lm 
        LEFT JOIN subjects s ON lm.subject_id = s.id 
        ORDER BY lm.id DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

app.post('/api/add-material', upload.single('file'), (req, res) => {
    const { title, material_type, file_path, grade, subject, teacher_name } = req.body;
    const finalPath = req.file ? `uploads/${req.file.filename}` : file_path;

    db.query("SELECT id FROM subjects WHERE subject_name = ? LIMIT 1", [subject], (err, sRes) => {
        const subId = (sRes && sRes.length > 0) ? sRes[0].id : 1;
        db.query("SELECT id FROM teachers WHERE full_name = ? LIMIT 1", [teacher_name], (err2, tRes) => {
            const teachId = (tRes && tRes.length > 0) ? tRes[0].id : 1;
            const query = "INSERT INTO learning_materials (title, material_type, file_path, grade, subject_id, teacher_id) VALUES (?, ?, ?, ?, ?, ?)";
            
            db.query(query, [title, material_type, finalPath, grade, subId, teachId], (err3) => {
                if (err3) return res.json({ status: "Error", error: err3.sqlMessage });

                const noticeTitle = `New ${material_type || 'Study Material'} Uploaded`;
                const noticeDesc = `New learning material "${title}" for ${subject || 'your subject'} (${grade || ''}) is now available in Study Materials.`;
                db.query("INSERT INTO announcements (type, title, description) VALUES ('Learning Content', ?, ?)", [noticeTitle, noticeDesc]);

                res.json({ status: "Success" });
            });
        });
    });
});

app.delete('/api/delete-material/:id', (req, res) => {
    db.query("DELETE FROM learning_materials WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 8. QUIZ MANAGER API ---
// ==========================================
app.get('/api/quizzes', (req, res) => {
    db.query("SELECT * FROM quizzes ORDER BY id DESC", (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

app.put('/api/toggle-quiz/:id', (req, res) => {
    const { is_enabled } = req.body;
    db.query("UPDATE quizzes SET is_enabled = ? WHERE id = ?", [is_enabled, req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.post('/api/add-quiz', (req, res) => {
    const { title, grade, duration_minutes, subject, teacher_name, teacher_code } = req.body;
    const quizTitle = (title && title.trim()) ? title.trim() : '1st Term Evaluation';
    const quizGrade = grade || 'Grade 8';
    const duration = parseInt(duration_minutes) || 30;

    db.query("SELECT id, subject_name FROM subjects ORDER BY id ASC", (sErr, sRows) => {
        const subjectsList = sRows || [];
        const matchedSubject = subjectsList.find(s => s.subject_name === subject);
        const validSubjectId = matchedSubject ? matchedSubject.id : (subjectsList.length > 0 ? subjectsList[0].id : 1);

        db.query("SELECT id, full_name, teacher_code FROM teachers ORDER BY id ASC", (tErr, tRows) => {
            const teachersList = tRows || [];
            const searchName = teacher_name ? teacher_name.replace(/\s*\(Teacher\)/i, '').trim().toLowerCase() : '';
            
            let matchedTeacher = teachersList.find(t => 
                (searchName && t.full_name && t.full_name.toLowerCase().includes(searchName)) ||
                (teacher_code && t.teacher_code === teacher_code)
            );

            const validTeacherId = matchedTeacher ? matchedTeacher.id : (teachersList.length > 0 ? teachersList[0].id : 1);

            const insertSql = "INSERT INTO quizzes (title, grade, duration_minutes, is_enabled, subject_id, teacher_id) VALUES (?, ?, ?, 0, ?, ?)";
            
            db.query(insertSql, [quizTitle, quizGrade, duration, validSubjectId, validTeacherId], (err, result) => {
                if (err) return res.json({ status: "Error", error: err.sqlMessage });

                const noticeTitle = `New Exam/Quiz Created: ${quizTitle}`;
                const noticeDesc = `A new quiz "${quizTitle}" (${quizGrade}) has been created. Check Exams & Quizzes tab to participate.`;
                db.query("INSERT INTO announcements (type, title, description) VALUES ('Exam Notification', ?, ?)", [noticeTitle, noticeDesc]);

                return res.json({ status: "Success", insertId: result.insertId, title: quizTitle, grade: quizGrade });
            });
        });
    });
});

app.post('/api/submit-quiz', (req, res) => {
    const { student_id, quiz_id, answers } = req.body;

    if (!quiz_id) return res.json({ status: "Error", message: "Quiz ID missing" });

    db.query("SELECT id, correct_option, marks FROM questions WHERE quiz_id = ?", [quiz_id], (err, questions) => {
        if (err || !questions) return res.json({ status: "Error", message: "Failed to evaluate exam" });

        let score = 0;
        let totalPossibleMarks = 0;

        questions.forEach(q => {
            const marksForQuestion = q.marks || 2;
            totalPossibleMarks += marksForQuestion;
            
            if (answers && answers[q.id] && String(answers[q.id]).trim().toUpperCase() === String(q.correct_option).trim().toUpperCase()) {
                score += marksForQuestion;
            }
        });

        const finalScore = totalPossibleMarks > 0 ? Math.round((score / totalPossibleMarks) * 100) : 0;
        const validStudentId = student_id || 1;

        const insertResultSql = "INSERT INTO student_results (student_id, quiz_id, score) VALUES (?, ?, ?)";
        db.query(insertResultSql, [validStudentId, quiz_id, finalScore], (rErr) => {
            if (rErr) return res.json({ status: "Error", error: rErr.sqlMessage });
            return res.json({ 
                status: "Success", 
                score: finalScore, 
                message: `Exam submitted! Your score is ${finalScore}%` 
            });
        });
    });
});

app.delete('/api/delete-quiz/:id', (req, res) => {
    db.query("DELETE FROM quizzes WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

app.post('/api/add-question', (req, res) => {
    const { quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
    const query = "INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(query, [quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 2], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.put('/api/edit-question/:id', (req, res) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
    const query = "UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, marks=? WHERE id=?";
    db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option, marks, req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

app.delete('/api/delete-question/:id', (req, res) => {
    db.query("DELETE FROM questions WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 9. 3NF QUESTION BANK API (🎯 FIXED HERE!) ---
// ==========================================
app.get('/api/question-bank', (req, res) => {
    // 🟢 FIXED: Fetch data strictly from 'question_bank' table
    const sql = `
        SELECT qb.*, COALESCE(s.subject_name, 'Mathematics') as subject, COALESCE(s.subject_name, 'Mathematics') as subject_name 
        FROM question_bank qb 
        LEFT JOIN subjects s ON qb.subject_code = s.subject_code 
        ORDER BY qb.id DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

app.post('/api/question-bank', (req, res) => {
    const { teacher_code, subject_code, grade, question_purpose, lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
    const sqlInsert = "INSERT INTO question_bank (teacher_code, subject_code, grade, question_purpose, lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sqlInsert, [teacher_code, subject_code, grade, question_purpose, lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_option], (err, result) => {
        if (err) return res.json({ status: "Error", error: err.message });
        res.json({ status: "Success", insertId: result ? result.insertId : 0 });
    });
});

app.get('/api/get-bank', (req, res) => {
    const sql = `
        SELECT qb.*, COALESCE(s.subject_name, 'Mathematics') as subject, COALESCE(s.subject_name, 'Mathematics') as subject_name 
        FROM question_bank qb 
        LEFT JOIN subjects s ON qb.subject_code = s.subject_code 
        ORDER BY qb.id DESC
    `;
    db.query(sql, (err, data) => {
        if (err) return res.json([]);
        return res.json(data || []);
    });
});

app.put('/api/edit-bank-question/:id', (req, res) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_option, grade, question_purpose, lesson_name } = req.body;
    const query = "UPDATE question_bank SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, grade=?, question_purpose=?, lesson_name=? WHERE id=?";
    db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option, grade, question_purpose, lesson_name, req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.delete('/api/delete-bank-question/:id', (req, res) => {
    db.query("DELETE FROM question_bank WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.delete('/api/question-bank/:id', (req, res) => {
    db.query("DELETE FROM question_bank WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.message });
        res.json({ status: "Success" });
    });
});

app.get('/api/teacher-assigned-grades', (req, res) => {
    const { teacher_code } = req.query;
    const sqlQuery = "SELECT DISTINCT grade FROM timetable WHERE teacher_code = ?";
    db.query(sqlQuery, [teacher_code], (err, results) => {
        if (err) return res.json({ status: "Error", error: err.message });
        res.json(results || []);
    });
});

// ==========================================
// --- 10. LESSON ACTIVITIES API ---
// ==========================================
app.get('/api/lesson-activities-list', (req, res) => {
    db.query("SELECT * FROM lesson_activities ORDER BY id DESC", (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

app.post('/api/add-lesson-activity', (req, res) => {
    const { lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, subject, teacher_name, grade } = req.body;
    const sql = "INSERT INTO lesson_activities (lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, subject, teacher_name, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, subject, teacher_name, grade], (err, result) => {
        if (err) {
            const fallbackSql = "INSERT INTO lesson_activities (lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, subject, teacher_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(fallbackSql, [lesson_name, question_type, question_text, option_a, option_b, option_c, option_d, correct_answer, subject, teacher_name], (fErr, fRes) => {
                if (fErr) return res.json({ status: "Error", error: fErr.sqlMessage });
                res.json({ status: "Success", insertId: fRes.insertId });
            });
        } else {
            res.json({ status: "Success", insertId: result.insertId });
        }
    });
});

app.delete('/api/delete-lesson-activity/:id', (req, res) => {
    db.query("DELETE FROM lesson_activities WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error" });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 11. TEACHER CREDENTIALS UPDATE API ---
// ==========================================
app.post('/api/update-teacher-credentials', (req, res) => {
    const { currentUsername, newUsername, newPassword } = req.body;
    const query = "UPDATE users SET username = ?, password = ? WHERE username = ? AND role = 'teacher'";
    db.query(query, [newUsername, newPassword, currentUsername], (err, result) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        if (result && result.affectedRows === 0) return res.json({ status: "Failed", message: "Teacher record not found" });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 12. STUDENT RESULTS API ---
// ==========================================
app.get('/api/student-results', (req, res) => {
    const query = `
        SELECT sr.id, sr.score AS marks_obtained, 100 AS total_marks, IF(sr.score >= 40, 'Pass', 'Fail') AS status, 
        st.full_name AS student_name, st.grade, q.title AS quiz_title, s.subject_name
        FROM student_results sr
        LEFT JOIN students st ON sr.student_id = st.id
        LEFT JOIN quizzes q ON sr.quiz_id = q.id
        LEFT JOIN subjects s ON q.subject_id = s.id
        ORDER BY sr.id DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

// ==========================================
// --- 13. DYNAMIC FEEDBACK & INQUIRIES API ---
// ==========================================
const createFeedbacksTable = `
    CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        studentName VARCHAR(255) DEFAULT 'Anonymous Student',
        grade VARCHAR(50) DEFAULT 'General',
        subject VARCHAR(100) DEFAULT '',
        message TEXT NOT NULL,
        reply TEXT DEFAULT NULL,
        repliedBy VARCHAR(255) DEFAULT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.query(createFeedbacksTable);

app.get('/api/feedbacks', (req, res) => {
    db.query("SELECT * FROM feedbacks ORDER BY id DESC", (err, result) => {
        if (err) return res.json([]);
        res.json(result || []);
    });
});

app.post('/api/add-feedback', (req, res) => {
    const { studentName, grade, subject, message } = req.body;
    if (!message || !message.trim()) {
        return res.json({ status: "Error", message: "Message cannot be empty" });
    }
    const sql = "INSERT INTO feedbacks (studentName, grade, subject, message) VALUES (?, ?, ?, ?)";
    db.query(sql, [studentName || 'Student', grade || 'General', subject || 'General', message], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.put('/api/feedback/:id/reply', (req, res) => {
    const { reply, repliedBy } = req.body;
    if (!reply || !reply.trim()) {
        return res.json({ status: "Error", message: "Reply cannot be empty" });
    }
    const sql = "UPDATE feedbacks SET reply = ?, repliedBy = ? WHERE id = ?";
    db.query(sql, [reply, repliedBy || 'Teacher', req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

app.delete('/api/feedback/:id', (req, res) => {
    db.query("DELETE FROM feedbacks WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.json({ status: "Error", error: err.sqlMessage });
        res.json({ status: "Success" });
    });
});

// ==========================================
// --- 14. MASTER PORT LISTEN NODE ---
// ==========================================
const PORT = 8082; 
app.listen(PORT, () => {
    console.log(`\n==================================================================`);
    console.log(`🚀 AuraPen LMS Backend Server running successfully on Port ${PORT}!`);
    console.log(`==================================================================\n`);
});