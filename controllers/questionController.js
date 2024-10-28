const db = require('../config/db');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const fetch = require('node-fetch');

// Render quiz for the user to attempt
exports.renderAttemptQuiz = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const userId = req.session.user.id;

  const quiz_id = req.params.id;

  db.query('SELECT * FROM questions WHERE quiz_id = ?', [quiz_id], (err, questions) => {
    if (err) throw err;
    res.render('attemptQuiz', { 
      quiz_id, 
      questions, 
      csrfToken: req.csrfToken(),
      user: req.session.user
    });
  });
};

exports.handleQuizSubmission = async (req, res) => {
  const quizId = req.params.id;
  const userId = req.session.user.id;
  let score = 0;
  const userAnswers = req.body.answers || [];
  const correctAnswers = [];
  const feedback = {
    strengths: [],
    areasOfImprovement: []
  };

  const query = `SELECT id, correct_answer, question FROM questions WHERE quiz_id = ? ORDER BY id`;

  db.query(query, [quizId], async (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (!results.length) return res.status(404).send('No questions found for this quiz');

    results.forEach((question, index) => {
      const correctAnswer = question.correct_answer.trim().toLowerCase();
      const userAnswer = userAnswers[index] ? userAnswers[index].trim().toLowerCase() : null;

      correctAnswers.push({
        id: question.id,
        correct_answer: correctAnswer,
        userAnswer: userAnswer,
        question: question.question,
      });

      // Increase score if correct and categorize feedback
      if (userAnswer === correctAnswer) {
        score++;
        feedback.strengths.push(question.question); // Add correctly answered question to strengths
      } else {
        feedback.areasOfImprovement.push(question.question); // Add incorrectly answered question to improvements
      }
    });

    const totalQuestions = results.length;
    const percentageScore = ((score / totalQuestions) * 100).toFixed(2);

    // Insert or update quiz attempt
    const checkQuery = `SELECT * FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?`;
    const insertQuery = `INSERT INTO quiz_attempts (user_id, quiz_id, score) VALUES (?, ?, ?)`;
    const updateQuery = `UPDATE quiz_attempts SET score = ? WHERE user_id = ? AND quiz_id = ?`;

    db.query(checkQuery, [userId, quizId], async (checkErr, checkResult) => {
      if (checkErr) return res.status(500).send('Server error');

      try {
        if (checkResult.length) {
          await db.promise().query(updateQuery, [percentageScore, userId, quizId]);
        } else {
          await db.promise().query(insertQuery, [userId, quizId, percentageScore]);
        }

        // Fetch feedback from the API
        const feedbackMessage = await fetchFeedback(feedback);

        // Send the response with score, correct answers, and feedback
        res.json({
          message: 'Quiz submission completed',
          score: percentageScore,
          totalQuestions,
          correctAnswers,
          feedback: feedbackMessage, // Feedback result from the API
        });
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
        res.status(500).json({ message: 'Server error occurred' });
      }
    });
  });
};

// Feedback Fetching Function
async function fetchFeedback(feedback) {
  const url = 'https://chat-gpt26.p.rapidapi.com/';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'd95138bcccmsh5d35a3a49ecb578p17c5b4jsn72168f34851e',
      'x-rapidapi-host': 'chat-gpt26.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Provide feedback on quiz performance: ${JSON.stringify(feedback)}
          in the following format:
          
          Areas of Improvement: (if any question is answered incorrectly)
          Topics: feedback
          
          Strengths: (if any question is answered correctly)
          Topics: feedback
          
          Do not mention the correct or incorrect answered question numbers or the score.`
        }
      ],
    }),
  };

  const apiResponse = await fetch(url, options);
  const apiResult = await apiResponse.json();
  return apiResult.choices && apiResult.choices[0] ? apiResult.choices[0].message.content : 'Feedback unavailable.';
}
