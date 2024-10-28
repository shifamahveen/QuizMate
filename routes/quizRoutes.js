const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController'); 
const questionController = require('../controllers/questionController'); 
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); 

// Public view: List all quizzes
router.get('/', quizController.listAllQuizzes);

// Admin view: List all quizzes
router.get('/admin/quiz', ensureAuthenticated, quizController.listQuiz);

// Attempt quiz
router.get('/quiz/:id', questionController.renderAttemptQuiz);
router.post('/quiz/:id/attempt', questionController.handleQuizSubmission);

// Admin routes for quiz management
router.get('/admin/quiz/edit/:id', ensureAuthenticated, quizController.getQuizForEdit);
router.post('/admin/quiz/:id/update', ensureAuthenticated, quizController.updateQuiz);

// Create quiz view
router.get('/admin/quiz/create', ensureAuthenticated, quizController.renderCreateQuiz);
router.post('/admin/quiz/store', ensureAuthenticated, quizController.createQuiz);
router.post('/admin/quiz/delete/:id', quizController.deleteQuiz);

// leaderboard
router.get('/leaderboard', quizController.showLeaderboard);

module.exports = router;
