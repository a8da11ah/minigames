class TypingSpeedGame {
    constructor() {
        // DOM Elements
        this.textToTypeEl = document.getElementById('textToType');
        this.userInputEl = document.getElementById('userInput');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.timeDisplay = document.getElementById('timer');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.nextWordDisplay = document.getElementById('nextWord');
        
        // New difficulty and duration selectors
        this.difficultySelect = document.getElementById('difficultySelect');
        this.gameDurationSelect = document.getElementById('durationSelect');

        // Leaderboard elements
        this.leaderboardBody = document.getElementById('leaderboardBody');
        this.nameEntryModal = document.getElementById('nameEntryModal');
        this.playerNameInput = document.getElementById('playerNameInput');
        this.saveScoreButton = document.getElementById('saveScoreButton');
        this.cancelScoreButton = document.getElementById('cancelScoreButton');

        // Text Source Elements
        this.textSourceSelect = document.getElementById('textSourceSelect');
        this.customTextContainer = document.getElementById('customTextContainer');
        this.customTextInput = document.getElementById('customTextInput');
        this.useCustomTextBtn = document.getElementById('useCustomTextBtn');

        // Menu button
        this.menuButton = document.getElementById('menuButton');

        // Game Configuration
        this.DEFAULT_GAME_DURATION = 60; // seconds
        
        // Game State
        this.currentText = '';
        this.timeLeft = this.DEFAULT_GAME_DURATION;
        this.timer = null;
        this.startTime = 0;
        this.gameEnded = false;
        this.currentCharIndex = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.mistakes = 0;
        
        // Initialize game components
        this.setupEventListeners();
        this.setupTextSourceEventListeners();
        this.initializeLeaderboard();
        this.setupLeaderboardEventListeners();
        
        // Set initial text
        const defaultText = "Click the Start button to begin typing...";
        this.textToTypeEl.textContent = defaultText;

        // Leaderboard configuration
        this.MAX_LEADERBOARD_ENTRIES = 10;
        this.currentGameScore = null;

        // Text Source
        this.texts = {
            easy: [
                "The cat sat on the mat.",
                "I love to eat pizza.",
                "Dogs are loyal pets.",
                "Sun rises in the east.",
                "Water is essential for life."
            ],
            medium: [
                "The quick brown fox jumps over the lazy dog.",
                "Programming is an art of solving problems.",
                "Success is not final, failure is not fatal.",
                "Learning never exhausts the mind.",
                "Code is like poetry to a programmer."
            ],
            hard: [
                "Quantum mechanics provides a mathematical description of the dual nature of matter and energy.",
                "The principles of object-oriented programming emphasize encapsulation, inheritance, and polymorphism.",
                "Artificial intelligence continues to revolutionize various sectors of technological innovation.",
                "Neuroplasticity demonstrates the brain's ability to reorganize itself by forming new neural connections.",
                "Cryptographic algorithms play a crucial role in maintaining digital security and privacy."
            ],
            quotes: [
                "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                "Believe you can and you're halfway there.",
                "The future belongs to those who believe in the beauty of their dreams.",
                "Don't watch the clock; do what it does. Keep going.",
                "Your limitation—it's only your imagination."
            ],
            programming: [
                "Code is like humor. When you have to explain it, it's bad.",
                "Programming isn't about what you know; it's about what you can figure out.",
                "First, solve the problem. Then, write the code.",
                "Clean code always looks like it was written by someone who cares.",
                "Make it work, make it right, make it fast."
            ],
            science: [
                "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
                "Science is a way of thinking much more than it is a body of knowledge.",
                "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.",
                "Nothing in life is to be feared, it is only to be understood.",
                "Science is organized knowledge. Wisdom is organized life."
            ],
            literature: [
                "It was the best of times, it was the worst of times.",
                "All happy families are alike; each unhappy family is unhappy in its own way.",
                "Call me Ishmael.",
                "In the beginning God created the heaven and the earth.",
                "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."
            ]
        };
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => {
            console.log('Start Button Clicked');
            this.startGame();
            console.log('Start game function called');
        });
        this.restartButton.addEventListener('click', () => {
            console.log('Restart Button Clicked');
            this.restartGame();
            console.log('Restart game function called');
        });
        this.menuButton.addEventListener('click', () => {
            console.log('Menu Button Clicked');
            this.goToMenu();
            console.log('Go to menu function called');
        });
        this.userInputEl.addEventListener('input', () => {
            console.log('User input detected');
            this.checkInput();
        });
        this.useCustomTextBtn.addEventListener('click', () => {
            console.log('Use Custom Text Button Clicked');
            this.handleCustomText();
            console.log('Handle custom text function called');
        });
        this.saveScoreButton.addEventListener('click', () => {
            console.log('Save Score Button Clicked');
            this.saveScore();
            console.log('Save score function called');
        });
        this.cancelScoreButton.addEventListener('click', () => {
            console.log('Cancel Score Button Clicked');
            this.closeNameEntryModal();
            console.log('Close name entry modal function called');
        });
    }

    setupTextSourceEventListeners() {
        this.textSourceSelect.addEventListener('change', () => {
            const selectedSource = this.textSourceSelect.value;
            
            // Toggle custom text container
            if (selectedSource === 'custom') {
                this.customTextContainer.style.display = 'block';
            } else {
                this.customTextContainer.style.display = 'none';
            }
        });

        this.useCustomTextBtn.addEventListener('click', () => {
            const customText = this.customTextInput.value.trim();
            
            if (customText.length < 50) {
                alert('Custom text must be at least 50 characters long');
                return;
            }

            // Split custom text into sentences or use as-is
            const customTexts = customText.match(/[^\.!\?]+[\.!\?]+/g) || [customText];
            this.texts.custom = customTexts;
            
            // Switch to custom text source
            this.textSourceSelect.value = 'custom';
        });
    }

    setupLeaderboardEventListeners() {
        this.saveScoreButton.addEventListener('click', () => this.saveScore());
        this.cancelScoreButton.addEventListener('click', () => this.closeNameEntryModal());
    }

    startGame() {
        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Get selected difficulty and duration
        const difficulty = this.difficultySelect.value;
        const gameDuration = parseInt(this.gameDurationSelect.value) || this.DEFAULT_GAME_DURATION;
        const textSource = this.textSourceSelect.value;

        // Reset game state
        this.timeLeft = gameDuration;
        this.resetStats();
        this.gameEnded = false;
        
        // Select random text based on difficulty and text source
        this.currentText = this.getRandomText(difficulty, textSource);
        console.log('Selected text:', this.currentText); // Debug log
        
        // Initialize typing field
        this.initializeTypingField();
        
        // Enable input and set focus
        this.userInputEl.disabled = false;
        this.userInputEl.value = '';
        this.userInputEl.focus();
        
        // Start timer
        this.startTime = Date.now();
        this.startTimer();
        
        // Update button states
        this.startButton.disabled = true;
        this.restartButton.disabled = false;
        
        // Update display
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100';
        this.timeDisplay.textContent = this.timeLeft;
        
        console.log('Game started with:', {
            difficulty,
            gameDuration,
            textSource,
            currentText: this.currentText
        });
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timeDisplay.textContent = `${this.timeLeft}s`;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    calculateWPM(userInput) {
        const difficulty = this.difficultySelect.value;
        const wordsTyped = userInput.trim().split(/\s+/).length;
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        
        // Adjust WPM calculation based on difficulty
        let wpmMultiplier;
        switch(difficulty) {
            case 'easy': wpmMultiplier = 1.2; break;
            case 'medium': wpmMultiplier = 1; break;
            case 'hard': wpmMultiplier = 0.8; break;
            default: wpmMultiplier = 1;
        }

        return Math.round((wordsTyped / elapsedMinutes) * wpmMultiplier);
    }

    checkInput() {
        const userInput = this.userInputEl.value;
        const textToType = this.currentText;

        // Calculate accuracy
        const accuracy = this.calculateAccuracy(userInput, textToType);
        this.accuracyDisplay.textContent = `${accuracy}%`;

        // Calculate WPM with difficulty adjustment
        const wpm = this.calculateWPM(userInput);
        this.wpmDisplay.textContent = isNaN(wpm) ? 0 : wpm;

        // End game if text is fully typed
        if (userInput === textToType) {
            this.endGame();
        }
    }

    calculateAccuracy(userInput, textToType) {
        let correctChars = 0;
        const minLength = Math.min(userInput.length, textToType.length);

        for (let i = 0; i < minLength; i++) {
            if (userInput[i] === textToType[i]) {
                correctChars++;
            }
        }

        const accuracy = Math.round((correctChars / textToType.length) * 100);
        return accuracy;
    }

    endGame() {
        clearInterval(this.timer);
        this.userInputEl.disabled = true;
        
        const wpm = parseInt(this.wpmDisplay.textContent);
        const accuracy = parseInt(this.accuracyDisplay.textContent);
        const difficulty = this.difficultySelect.value;
        
        let performance = this.getPerformanceRating(wpm, difficulty);

        this.resultDisplay.innerHTML = `
            <h2>Game Over!</h2>
            <p>Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
            <p>Words Per Minute: ${wpm}</p>
            <p>Accuracy: ${accuracy}%</p>
            <p>Performance: ${performance}</p>
        `;

        // Check if score qualifies for leaderboard
        if (this.checkHighScore(wpm, accuracy, difficulty)) {
            this.openNameEntryModal(wpm, accuracy, difficulty);
        }

        this.startButton.disabled = false;
        this.gameEnded = true;

        // Remove keyboard event listener
        document.removeEventListener('keypress', this.handleTyping.bind(this));
        document.body.classList.remove('game-active');
    }

    getPerformanceRating(wpm, difficulty) {
        let ratings = {
            easy: {
                low: 10,
                medium: 20,
                high: 30
            },
            medium: {
                low: 20,
                medium: 40,
                high: 60
            },
            hard: {
                low: 30,
                medium: 50,
                high: 70
            }
        };

        const difficultyRatings = ratings[difficulty];
        
        if (wpm < difficultyRatings.low) return 'Beginner';
        if (wpm < difficultyRatings.medium) return 'Average';
        if (wpm < difficultyRatings.high) return 'Good';
        return 'Excellent';
    }

    resetStats() {
        const gameDuration = parseInt(this.gameDurationSelect.value);
        this.timeLeft = gameDuration;
        this.timeDisplay.textContent = `${this.timeLeft}s`;
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '100%';
        this.resultDisplay.innerHTML = '';
    }

    getRandomText(difficulty, textSource) {
        const textPool = this.texts[textSource] || this.texts.quotes;
        
        // Filter texts based on difficulty
        const filteredTexts = textPool.filter(text => {
            const wordCount = text.split(/\s+/).length;
            switch(difficulty) {
                case 'easy':
                    return wordCount <= 10;
                case 'medium':
                    return wordCount > 10 && wordCount <= 20;
                case 'hard':
                    return wordCount > 20;
                default:
                    return true;
            }
        });
        
        // If no texts match the difficulty, return from the entire pool
        return filteredTexts.length > 0 
            ? filteredTexts[Math.floor(Math.random() * filteredTexts.length)]
            : textPool[Math.floor(Math.random() * textPool.length)];
    }

    restartGame() {
        clearInterval(this.timer);
        this.startGame();
    }

    initializeLeaderboard() {
        // Retrieve existing leaderboard from localStorage
        const existingLeaderboard = JSON.parse(localStorage.getItem('typingGameLeaderboard') || '[]');
        this.renderLeaderboard(existingLeaderboard);
    }

    checkHighScore(wpm, accuracy, difficulty) {
        const existingLeaderboard = JSON.parse(localStorage.getItem('typingGameLeaderboard') || '[]');
        
        // If leaderboard is not full or score is higher than the lowest entry
        if (existingLeaderboard.length < this.MAX_LEADERBOARD_ENTRIES) {
            return true;
        }

        const lowestScore = existingLeaderboard[existingLeaderboard.length - 1];
        return wpm > lowestScore.wpm || 
               (wpm === lowestScore.wpm && accuracy > lowestScore.accuracy);
    }

    openNameEntryModal(wpm, accuracy, difficulty) {
        this.currentGameScore = { wpm, accuracy, difficulty };
        this.nameEntryModal.style.display = 'block';
        this.playerNameInput.focus();
    }

    closeNameEntryModal() {
        this.nameEntryModal.style.display = 'none';
        this.playerNameInput.value = '';
    }

    saveScore() {
        const playerName = this.playerNameInput.value.trim();
        
        if (!playerName) {
            alert('Please enter a name');
            return;
        }

        // Retrieve existing leaderboard
        const existingLeaderboard = JSON.parse(localStorage.getItem('typingGameLeaderboard') || '[]');

        // Create new score entry
        const newScore = {
            name: playerName,
            wpm: this.currentGameScore.wpm,
            accuracy: this.currentGameScore.accuracy,
            difficulty: this.currentGameScore.difficulty,
            date: new Date().toLocaleDateString()
        };

        // Add new score and sort
        existingLeaderboard.push(newScore);
        const sortedLeaderboard = existingLeaderboard
            .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
            .slice(0, this.MAX_LEADERBOARD_ENTRIES);

        // Save to localStorage
        localStorage.setItem('typingGameLeaderboard', JSON.stringify(sortedLeaderboard));

        // Render updated leaderboard
        this.renderLeaderboard(sortedLeaderboard);

        // Close modal
        this.closeNameEntryModal();
    }

    renderLeaderboard(leaderboard) {
        // Clear existing entries
        this.leaderboardBody.innerHTML = '';

        // Populate leaderboard
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.wpm}</td>
                <td>${entry.accuracy}%</td>
                <td>${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}</td>
                <td>${entry.date}</td>
            `;
            this.leaderboardBody.appendChild(row);
        });
    }

    initializeTypingField() {
        // Reset typing state
        this.currentCharIndex = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.mistakes = 0;
        
        // Get or create caret element
        this.caretElement = document.querySelector('.caret');
        if (!this.caretElement) {
            this.caretElement = document.createElement('div');
            this.caretElement.className = 'caret';
            this.textToTypeEl.parentNode.insertBefore(this.caretElement, this.textToTypeEl);
        }
        
        // Create character spans
        const chars = this.currentText.split('');
        this.textToTypeEl.innerHTML = chars
            .map(char => `<span class="char waiting">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

        // Initialize caret position
        this.updateCaretPosition();
        
        // Add game-active class to body
        document.body.classList.add('game-active');

        // Set first character as current
        const firstChar = this.textToTypeEl.querySelector('.char');
        if (firstChar) {
            firstChar.classList.add('current');
            firstChar.classList.remove('waiting');
        }

        // Update next word display
        this.updateNextWord();
        
        // Add typing event listener
        this.userInputEl.addEventListener('input', this.handleTyping.bind(this));
        
        console.log('Typing field initialized with text:', this.currentText);
    }

    updateCaretPosition() {
        const chars = this.textToTypeEl.querySelectorAll('.char');
        if (this.currentCharIndex < chars.length) {
            const currentChar = chars[this.currentCharIndex];
            const rect = currentChar.getBoundingClientRect();
            const containerRect = this.textToTypeEl.getBoundingClientRect();
            
            this.caretElement.style.left = `${rect.left - containerRect.left}px`;
            this.caretElement.style.top = `${rect.top - containerRect.top}px`;
        }
    }

    updateNextWord() {
        const words = this.currentText.split(' ');
        const currentWordIndex = this.currentText
            .substring(0, this.currentCharIndex)
            .split(' ').length - 1;
        
        const nextWordEl = document.getElementById('nextWord');
        if (nextWordEl && words[currentWordIndex + 1]) {
            nextWordEl.textContent = words[currentWordIndex + 1];
        }
    }

    handleTyping(event) {
        if (this.gameEnded) return;

        const input = event.target.value;
        const currentChar = this.textToTypeEl.children[this.currentCharIndex];
        
        if (!currentChar) return;

        const expectedChar = this.currentText[this.currentCharIndex];
        const typedChar = input[input.length - 1];

        // Handle backspace
        if (input.length < this.currentCharIndex) {
            this.currentCharIndex = input.length;
            // Update character classes
            Array.from(this.textToTypeEl.children).forEach((char, index) => {
                if (index >= input.length) {
                    char.className = 'char waiting';
                    if (index === input.length) {
                        char.classList.add('current');
                    }
                }
            });
            this.updateCaretPosition();
            return;
        }

        // Check if typed character matches expected character
        const isCorrect = typedChar === expectedChar;
        
        // Update character appearance
        currentChar.className = `char ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Update streak
        if (isCorrect) {
            this.currentStreak++;
            this.maxStreak = Math.max(this.maxStreak, this.currentStreak);
        } else {
            this.mistakes++;
            this.currentStreak = 0;
        }

        // Move to next character
        this.currentCharIndex++;
        
        // Update next character status
        const nextChar = this.textToTypeEl.children[this.currentCharIndex];
        if (nextChar) {
            nextChar.classList.add('current');
            nextChar.classList.remove('waiting');
        }

        // Update displays
        this.updateCaretPosition();
        this.updateNextWord();
        this.showStreakIndicator(this.currentStreak);
        
        // Calculate and update WPM and accuracy
        const wpm = this.calculateWPM(input);
        const accuracy = this.calculateAccuracy(input, this.currentText.substring(0, input.length));
        
        this.wpmDisplay.textContent = Math.round(wpm);
        this.accuracyDisplay.textContent = Math.round(accuracy);

        // Check if typing is complete
        if (this.currentCharIndex >= this.currentText.length) {
            this.endGame();
        }
    }

    showStreakIndicator(streak) {
        const indicator = document.createElement('div');
        indicator.className = 'streak-indicator';
        indicator.textContent = `${streak} streak!`;
        
        this.textToTypeEl.appendChild(indicator);
        
        // Trigger animation
        setTimeout(() => {
            indicator.classList.add('show');
        }, 10);

        // Remove after animation
        setTimeout(() => {
            indicator.remove();
        }, 1000);
    }

    goToMenu() {
        window.location.href = '../index.html'; 
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypingSpeedGame();
});
