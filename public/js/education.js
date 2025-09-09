/**
 * Central Dogma Interactive - Education System
 * Handles educational content, quizzes, tips, and achievement tracking
 */

class EducationSystem {
    constructor() {
        this.educationalContent = null;
        this.userProgress = this.loadUserProgress();
        this.achievements = new Set(this.userProgress.achievements || []);
        this.currentQuiz = null;
        this.quizModal = null;
        
        this.init();
    }

    async init() {
        try {
            // Load educational content
            await this.loadEducationalContent();
            
            // Create quiz modal
            this.createQuizModal();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Education system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize education system:', error);
        }
    }

    async loadEducationalContent() {
        try {
            const response = await fetch('../data/educational_content.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.educationalContent = await response.json();
        } catch (error) {
            console.error('Error loading educational content:', error);
            throw error;
        }
    }

    loadUserProgress() {
        const saved = localStorage.getItem('centralDogma_userProgress');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to parse user progress, resetting...');
            }
        }
        
        return {
            completedLessons: [],
            quizScores: {},
            achievements: [],
            totalPoints: 0,
            sequencesTried: [],
            simulationsCompleted: 0
        };
    }

    saveUserProgress() {
        try {
            localStorage.setItem('centralDogma_userProgress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('Failed to save user progress:', error);
        }
    }

    setupEventListeners() {
        // Listen for educational events from transcription/translation engines
        document.addEventListener('transcriptionComplete', () => {
            this.checkAchievement('first_transcription');
            this.showRandomTip();
        });

        document.addEventListener('translationComplete', () => {
            this.userProgress.simulationsCompleted++;
            this.saveUserProgress();
        });

        // Listen for sequence changes
        document.addEventListener('sequenceValidated', (e) => {
            const sequence = e.detail.sequence;
            if (!this.userProgress.sequencesTried.includes(sequence)) {
                this.userProgress.sequencesTried.push(sequence);
                this.saveUserProgress();
                
                if (this.userProgress.sequencesTried.length >= 5) {
                    this.checkAchievement('mutation_explorer');
                }
            }
        });
    }

    createQuizModal() {
        this.quizModal = document.createElement('div');
        this.quizModal.className = 'modal quiz-modal';
        this.quizModal.setAttribute('role', 'dialog');
        this.quizModal.setAttribute('aria-labelledby', 'quiz-title');
        this.quizModal.setAttribute('aria-hidden', 'true');
        
        this.quizModal.innerHTML = `
            <div class="modal-content quiz-content">
                <header class="modal-header">
                    <h2 id="quiz-title">Knowledge Check</h2>
                    <button class="modal-close quiz-close" aria-label="Close quiz">&times;</button>
                </header>
                <div class="modal-body quiz-body">
                    <div id="quiz-progress" class="quiz-progress" aria-live="polite"></div>
                    <div id="quiz-question-container"></div>
                    <div id="quiz-feedback" class="quiz-feedback"></div>
                    <div id="quiz-actions" class="quiz-actions">
                        <button id="quiz-submit" class="primary-btn" disabled>Submit Answer</button>
                        <button id="quiz-next" class="primary-btn" style="display: none;">Next Question</button>
                        <button id="quiz-finish" class="primary-btn" style="display: none;">Finish Quiz</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.quizModal);
        
        // Set up quiz modal event listeners
        this.quizModal.querySelector('.quiz-close').addEventListener('click', () => {
            this.hideQuiz();
        });
        
        this.quizModal.addEventListener('click', (e) => {
            if (e.target === this.quizModal) {
                this.hideQuiz();
            }
        });
    }

    showQuiz(phase) {
        if (!this.educationalContent || !this.educationalContent.quizzes[phase]) {
            console.warn(`No quiz found for phase: ${phase}`);
            return;
        }

        this.currentQuiz = {
            phase: phase,
            questions: [...this.educationalContent.quizzes[phase].questions],
            currentIndex: 0,
            score: 0,
            answers: []
        };

        const title = this.educationalContent.quizzes[phase].title;
        this.quizModal.querySelector('#quiz-title').textContent = title;
        
        this.showCurrentQuestion();
        this.quizModal.classList.add('active');
        this.quizModal.setAttribute('aria-hidden', 'false');
        
        // Focus first interactive element
        const firstInput = this.quizModal.querySelector('input[type="radio"]');
        if (firstInput) {
            firstInput.focus();
        }
    }

    showCurrentQuestion() {
        if (!this.currentQuiz) return;

        const question = this.currentQuiz.questions[this.currentQuiz.currentIndex];
        const container = this.quizModal.querySelector('#quiz-question-container');
        const progressContainer = this.quizModal.querySelector('#quiz-progress');
        
        // Update progress
        progressContainer.textContent = `Question ${this.currentQuiz.currentIndex + 1} of ${this.currentQuiz.questions.length}`;
        
        // Create question HTML
        container.innerHTML = `
            <div class="quiz-question">
                <h3 class="question-text">${question.question}</h3>
                <div class="question-options" role="radiogroup" aria-labelledby="question-text">
                    ${question.options.map((option, index) => `
                        <label class="option-label">
                            <input type="radio" name="quiz-answer" value="${index}" 
                                   aria-describedby="option-${index}">
                            <span id="option-${index}" class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        // Set up option selection listeners
        const options = container.querySelectorAll('input[type="radio"]');
        const submitBtn = this.quizModal.querySelector('#quiz-submit');
        
        options.forEach(option => {
            option.addEventListener('change', () => {
                submitBtn.disabled = false;
            });
        });

        // Set up submit button
        submitBtn.onclick = () => this.submitAnswer();
        submitBtn.disabled = true;
        submitBtn.style.display = 'inline-block';
        
        // Hide other buttons
        this.quizModal.querySelector('#quiz-next').style.display = 'none';
        this.quizModal.querySelector('#quiz-finish').style.display = 'none';
        
        // Clear feedback
        this.quizModal.querySelector('#quiz-feedback').innerHTML = '';
    }

    submitAnswer() {
        const selectedOption = this.quizModal.querySelector('input[name="quiz-answer"]:checked');
        if (!selectedOption) return;

        const selectedIndex = parseInt(selectedOption.value);
        const question = this.currentQuiz.questions[this.currentQuiz.currentIndex];
        const isCorrect = selectedIndex === question.correct;
        
        // Record answer
        this.currentQuiz.answers.push({
            questionId: question.id,
            selected: selectedIndex,
            correct: isCorrect
        });

        if (isCorrect) {
            this.currentQuiz.score++;
        }

        // Show feedback
        this.showQuestionFeedback(isCorrect, question.explanation);
        
        // Update UI
        const submitBtn = this.quizModal.querySelector('#quiz-submit');
        const nextBtn = this.quizModal.querySelector('#quiz-next');
        const finishBtn = this.quizModal.querySelector('#quiz-finish');
        
        submitBtn.style.display = 'none';
        
        if (this.currentQuiz.currentIndex < this.currentQuiz.questions.length - 1) {
            nextBtn.style.display = 'inline-block';
            nextBtn.onclick = () => this.nextQuestion();
        } else {
            finishBtn.style.display = 'inline-block';
            finishBtn.onclick = () => this.finishQuiz();
        }
    }

    showQuestionFeedback(isCorrect, explanation) {
        const feedback = this.quizModal.querySelector('#quiz-feedback');
        
        const icon = isCorrect ? '✅' : '❌';
        const status = isCorrect ? 'Correct!' : 'Incorrect';
        const className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
        
        feedback.innerHTML = `
            <div class="feedback-result ${className}">
                <strong>${icon} ${status}</strong>
                <p>${explanation}</p>
            </div>
        `;
        
        // Announce to screen readers
        if (window.centralDogmaApp) {
            window.centralDogmaApp.announceToScreenReader(`${status}. ${explanation}`);
        }
    }

    nextQuestion() {
        this.currentQuiz.currentIndex++;
        this.showCurrentQuestion();
    }

    finishQuiz() {
        const totalQuestions = this.currentQuiz.questions.length;
        const score = this.currentQuiz.score;
        const percentage = Math.round((score / totalQuestions) * 100);
        
        // Save score
        this.userProgress.quizScores[this.currentQuiz.phase] = {
            score: score,
            total: totalQuestions,
            percentage: percentage,
            date: new Date().toISOString()
        };
        
        // Check achievements
        if (percentage === 100) {
            this.checkAchievement('perfect_quiz');
        }
        
        // Show final results
        this.showQuizResults(score, totalQuestions, percentage);
        
        this.saveUserProgress();
    }

    showQuizResults(score, total, percentage) {
        const container = this.quizModal.querySelector('#quiz-question-container');
        const feedback = this.quizModal.querySelector('#quiz-feedback');
        const actions = this.quizModal.querySelector('#quiz-actions');
        
        const passingScore = this.educationalContent.quizzes[this.currentQuiz.phase].passingScore || 70;
        const passed = percentage >= passingScore;
        
        container.innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Complete!</h3>
                <div class="score-display">
                    <div class="score-circle ${passed ? 'passed' : 'failed'}">
                        <span class="score-percentage">${percentage}%</span>
                        <span class="score-fraction">${score}/${total}</span>
                    </div>
                </div>
                <div class="result-message">
                    ${passed ? 
                        `🎉 Excellent work! You've mastered this topic.` :
                        `📚 Keep studying! You need ${passingScore}% to pass.`
                    }
                </div>
            </div>
        `;
        
        feedback.innerHTML = '';
        actions.innerHTML = `
            <button class="primary-btn" onclick="window.educationSystem.hideQuiz()">
                Continue Learning
            </button>
        `;
        
        // Award points
        const points = Math.round(percentage / 10);
        this.awardPoints(points);
        
        if (window.centralDogmaApp) {
            window.centralDogmaApp.announceToScreenReader(
                `Quiz completed with ${percentage}% score. ${passed ? 'Passed!' : 'Try again to improve.'}`
            );
        }
    }

    hideQuiz() {
        this.quizModal.classList.remove('active');
        this.quizModal.setAttribute('aria-hidden', 'true');
        this.currentQuiz = null;
    }

    showRandomTip() {
        if (!this.educationalContent || !this.educationalContent.tips) return;

        const tips = this.educationalContent.tips;
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        if (window.centralDogmaApp) {
            const message = `${randomTip.icon} ${randomTip.title}: ${randomTip.content}`;
            window.centralDogmaApp.showSuccess(message);
        }
    }

    checkAchievement(achievementId) {
        if (this.achievements.has(achievementId)) return;

        const achievement = this.educationalContent?.achievements?.find(a => a.id === achievementId);
        if (!achievement) return;

        this.achievements.add(achievementId);
        this.userProgress.achievements = Array.from(this.achievements);
        this.awardPoints(achievement.points);
        this.saveUserProgress();

        // Show achievement notification
        this.showAchievementNotification(achievement);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <p><strong>${achievement.name}</strong></p>
                    <p>${achievement.description}</p>
                    <p class="achievement-points">+${achievement.points} points</p>
                </div>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 2001;
            max-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 5000);

        // Announce achievement
        if (window.centralDogmaApp) {
            window.centralDogmaApp.announceToScreenReader(
                `Achievement unlocked: ${achievement.name}. ${achievement.description}`
            );
        }
    }

    awardPoints(points) {
        this.userProgress.totalPoints = (this.userProgress.totalPoints || 0) + points;
        this.saveUserProgress();
    }

    // Public API methods
    triggerQuiz(phase) {
        this.showQuiz(phase);
    }

    getProgress() {
        return { ...this.userProgress };
    }

    resetProgress() {
        this.userProgress = {
            completedLessons: [],
            quizScores: {},
            achievements: [],
            totalPoints: 0,
            sequencesTried: [],
            simulationsCompleted: 0
        };
        this.achievements.clear();
        this.saveUserProgress();
    }
}

// Add CSS for achievement notifications
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .achievement-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .achievement-icon {
        font-size: 24px;
        flex-shrink: 0;
    }

    .achievement-text h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        font-weight: bold;
    }

    .achievement-text p {
        margin: 0 0 3px 0;
        font-size: 12px;
        line-height: 1.3;
    }

    .achievement-points {
        color: #f1c40f !important;
        font-weight: bold !important;
    }

    .quiz-content {
        max-width: 600px;
        width: 90vw;
    }

    .quiz-progress {
        text-align: center;
        font-weight: bold;
        margin-bottom: 20px;
        color: #3498db;
    }

    .quiz-question {
        margin-bottom: 20px;
    }

    .question-text {
        margin-bottom: 15px;
        color: #2c3e50;
        line-height: 1.4;
    }

    .question-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .option-label {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 2px solid #ecf0f1;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .option-label:hover {
        border-color: #3498db;
        background: #f8f9fa;
    }

    .option-label input[type="radio"] {
        margin-right: 10px;
    }

    .quiz-feedback {
        margin: 20px 0;
    }

    .feedback-result {
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
    }

    .feedback-correct {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }

    .feedback-incorrect {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }

    .quiz-actions {
        text-align: center;
        margin-top: 20px;
    }

    .quiz-results {
        text-align: center;
    }

    .score-display {
        margin: 20px 0;
    }

    .score-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 4px solid;
    }

    .score-circle.passed {
        background: #d4edda;
        border-color: #27ae60;
        color: #155724;
    }

    .score-circle.failed {
        background: #f8d7da;
        border-color: #e74c3c;
        color: #721c24;
    }

    .score-percentage {
        font-size: 24px;
        line-height: 1;
    }

    .score-fraction {
        font-size: 14px;
        opacity: 0.8;
    }

    .result-message {
        font-size: 16px;
        margin: 20px 0;
        line-height: 1.4;
    }
`;
document.head.appendChild(achievementStyles);

// Initialize education system globally
window.educationSystem = new EducationSystem();

// Make available for main app
window.EducationSystem = EducationSystem;
