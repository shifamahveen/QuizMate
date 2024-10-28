const db = require('../config/db');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const mailService = require('../services/mailService')

// Render create quiz form
exports.renderCreateQuiz = (req, res) => {  
  if (!req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.redirect('/'); 
  }

  res.render('createQuiz', {user: req.session.user,csrfToken: req.csrfToken() });
};

// Handle quiz creation
exports.createQuiz = (req, res) => {
  const { quiz_name, description, send_email, allow_reattempt, questions } = req.body;

  // Insert quiz with description, send_email, and allow_reattempt
  db.query(
    'INSERT INTO quizzes (quiz_name, description, send_email, reattempt) VALUES (?, ?, ?, ?)',
    [quiz_name, description, send_email, allow_reattempt],
    (err, result) => {
      if (err) throw err;

      const quiz_id = result.insertId;

      // Insert each question
      questions.forEach((q) => {
        db.query(
          'INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [quiz_id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer],
          (err) => {
            if (err) throw err;
          }
        );
      });

      // Only send email if send_email is set to "yes"
      if (send_email === "1") {
        const userEmail = req.session.user.email;

        mailService.sendThresholdNotification(userEmail)
          .then(() => {
            console.log(`Notification sent to ${userEmail}`);
          })
          .catch((error) => {
            console.error(`Failed to send notification to ${userEmail}:`, error);
          });
      }

      res.redirect('/admin/quiz');
    }
  );
};

exports.listAllQuizzes = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;

  const query = `
    SELECT 
      q.id, q.quiz_name, q.description, 
      q.reattempt, qa.score AS user_score 
    FROM 
      quizzes q
    LEFT JOIN 
      quiz_attempts qa 
    ON 
      q.id = qa.quiz_id AND qa.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).send('Server error');
    }

    const quizzes = results;
    const totalQuizzes = quizzes.length;

    // Filter out only attempted quizzes with a numeric user_score
    const attemptedQuizzes = quizzes.filter(quiz => quiz.user_score !== null && !isNaN(quiz.user_score));
    const quizzesAttempted = attemptedQuizzes.length;
    
    // Calculate average accuracy only if there are attempted quizzes
    const averageAccuracy = quizzesAttempted > 0
      ? attemptedQuizzes.reduce((sum, quiz) => sum + Number(quiz.user_score), 0) / quizzesAttempted
      : 0;

    res.render('publicquiz', { 
      quizzes, 
      totalQuizzes, 
      quizzesAttempted, 
      averageAccuracy: averageAccuracy.toFixed(2), 
      user: req.session.user 
    });
  });
};

// admin method to list all quizzes
exports.listQuiz = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if(req.session.user.role === "user") {
    return res.redirect('/');
  }
  const query = 'SELECT * FROM quizzes';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).send('Server error');
    }

    // Render the view and pass the quizzes to the frontend
    res.render('quiz', { quizzes: results, user: req.session.user, csrfToken: req.csrfToken() });
  });
};

// Fetch quiz by ID for editing
exports.getQuizForEdit = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const quizId = req.params.id;

  // Fetch the quiz and its questions
  const query = `
    SELECT quizzes.id AS quiz_id, quizzes.quiz_name AS quiz_name, questions.id AS question_id, 
           questions.question, questions.option_a, questions.option_b, 
           questions.option_c, questions.option_d, questions.correct_answer
    FROM quizzes
    LEFT JOIN questions ON quizzes.id = questions.quiz_id
    WHERE quizzes.id = ?
  `;

  db.query(query, [quizId], (err, results) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send('Quiz not found');
    }

    const quiz = {
      quiz_name: results[0]?.quiz_name,
      questions: results.map((q) => ({
        question_id: q.question_id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
      }))
    };
    
    // Render the edit form with the quiz data and CSRF token
    res.render('editQuiz', { 
      quiz,
      quizId,
      csrfToken: req.csrfToken(),
      user: req.session.user,
    });
  });
};

// Update quiz with new data
exports.updateQuiz = (req, res) => {
  const quizId = req.params.id;
  const { quiz_name, description, send_email, questions } = req.body;

  // Update quiz name, description, and send_email
  db.query(
      'UPDATE quizzes SET quiz_name = ?, description = ?, send_email = ? WHERE id = ?',
      [quiz_name, description, send_email, quizId],
      (err) => {
          if (err) {
              console.error('Error updating quiz:', err);
              return res.status(500).send('Error updating quiz');
          }

          // Loop through each question
          questions.forEach((question) => {
              const { question_id, question: questionText, option_a, option_b, option_c, option_d, correct_answer } = question;

              if (question_id && question_id.trim() !== "") {
                  // Update existing question if question_id is not empty
                  db.query(
                      'UPDATE questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ? WHERE id = ? AND quiz_id = ?',
                      [questionText, option_a, option_b, option_c, option_d, correct_answer, question_id, quizId],
                      (err) => {
                          if (err) {
                              console.error(`Error updating question ${question_id}:`, err);
                          }
                      }
                  );
              } else {
                  // Insert new question when question_id is missing (empty string or undefined)
                  db.query(
                      'INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      [quizId, questionText, option_a, option_b, option_c, option_d, correct_answer],
                      (err) => {
                          if (err) {
                              console.error('Error inserting new question:', err);
                          }
                      }
                  );
              }
          });

          res.redirect("/admin/quiz");
      }
  );
};

// delete quiz
exports.deleteQuiz = (req, res) => {
  const quizId = req.params.id;

  // SQL query to delete questions associated with the quiz
  const deleteQuestionsQuery = `DELETE FROM questions WHERE quiz_id = ?`;
  db.query(deleteQuestionsQuery, [quizId], (err) => {
    if (err) {
      return res.status(500).send('Error deleting questions');
    }

    // SQL query to delete the quiz itself
    const deleteQuizQuery = `DELETE FROM quizzes WHERE id = ?`;
    db.query(deleteQuizQuery, [quizId], (err) => {
      if (err) {
        return res.status(500).send('Error deleting quiz');
      }

      res.redirect('/admin/quiz'); 
    });
  });
};

exports.showLeaderboard = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const query = `
    SELECT 
      u.id, u.name, 
      COALESCE(AVG(qa.score), 0) AS accuracy
    FROM 
      users u
    LEFT JOIN 
      quiz_attempts qa 
    ON 
      u.id = qa.user_id
    GROUP BY 
      u.id
    ORDER BY 
      accuracy DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching leaderboard:', err);
      return res.status(500).send('Server error');
    }

    res.render('result', { leaderboard: results, user: req.session.user });
  });
};