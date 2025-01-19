let questions = [];
let section = 0;
let timer;
let score = 0;
let questionsAttempted = 0;
let userChoices = [];
let timerInterval; // To track the timer interval

// Load questions from the JSON file
fetch('/questions.json')
    .then(response => response.json())
    .then(data => questions = data)
    .catch(error => console.error('Error loading questions:', error));

// Start the quiz
function startQuiz() {
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    startSection();
}

// Start a section
function startSection() {
    if (section < 5) {
        // Clear any existing timer interval
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        loadQuestions();
        startTimer(18 * 60, 'quiz-timer', goToNextSection);
    } else {
        submitQuiz();
    }
}

// Load questions for the current section
function loadQuestions() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Clear previous questions

    const currentQuestions = questions.slice(section * 20, (section + 1) * 20);
    currentQuestions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question';
        questionElement.innerHTML = `
            <p>${index + 1}. ${question.question}</p>
            <ul class="options">
                ${question.choices.map(choice => `<li role="button" onclick="selectOption(${index}, '${escapeString(choice)}', this)">${choice}</li>`).join('')}
            </ul>
        `;
        questionContainer.appendChild(questionElement);
    });
}

// Timer function
function startTimer(duration, displayId, callback) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById(displayId);

    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? `0${minutes}` : minutes;
        seconds = seconds < 10 ? `0${seconds}` : seconds;

        display.textContent = `${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(timerInterval);
            callback();
        }
    }, 1000);
}

// Go to the next section
function goToNextSection() {
    section++;
    startSection();
}

// Submit the quiz
function submitQuiz() {
    clearInterval(timerInterval); // Clear the timer interval before submitting
    const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const result = {
        timestamp: currentTime,
        questionsAttempted: questionsAttempted,
        score: score,
        userChoices: userChoices
    };
    saveResult(result);
    
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('score-popup').style.display = 'block';
    document.getElementById('score').innerText = score;
}

// Save result to backend
function saveResult(result) {
    fetch('/saveResult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error saving result:', error));
}

// Close the popup
function closePopup() {
    document.getElementById('score-popup').style.display = 'none';
    location.reload();
}

// View results
function viewResults() {
    window.location.href = 'review.html';
}

// View all questions and answers
function viewAllQuestions() {
    window.location.href = 'all-questions.html';
}

// Select an option
function selectOption(questionIndex, selectedChoice, element) {
    const correctAnswer = questions[section * 20 + questionIndex].answer;
    userChoices[section * 20 + questionIndex] = {
        question: questions[section * 20 + questionIndex].question,
        selected: selectedChoice,
        correct: correctAnswer
    };

    if (selectedChoice === correctAnswer) {
        element.style.backgroundColor = 'green';
        score++;
    } else {
        element.style.backgroundColor = 'red';
    }
    questionsAttempted++;
    // Disable further clicks
    const options = element.parentNode.querySelectorAll('li');
    options.forEach(option => option.style.pointerEvents = 'none');
}

// Load review data
function loadReviewData() {
    fetch('/getResults')
        .then(response => response.json())
        .then(data => {
            const lastResult = data[data.length - 1];
            const reviewContainer = document.getElementById('review-content');

            if (lastResult && lastResult.userChoices) {
                lastResult.userChoices.forEach((choice, index) => {
                    if (choice) {  // Check for null values
                        const reviewElement = document.createElement('div');
                        reviewElement.className = 'question';
                        reviewElement.innerHTML = `
                            <p>${index + 1}. ${choice.question}</p>
                            <ul class="review-options">
                                <li class="${choice.selected === choice.correct ? 'correct' : 'incorrect'}">Your Answer: ${choice.selected}</li>
                                <li>Correct Answer: ${choice.correct}</li>
                            </ul>
                        `;
                        reviewContainer.appendChild(reviewElement);
                    }
                });
            } else {
                const noDataElement = document.createElement('p');
                noDataElement.innerText = 'No data available for review.';
                reviewContainer.appendChild(noDataElement);
            }
        })
        .catch(error => console.error('Error loading review data:', error));
}

// Load all questions and answers
function loadAllQuestions() {
    fetch('/questions.json')
        .then(response => response.json())
        .then(data => {
            const allQuestionsContainer = document.getElementById('all-questions-content');

            data.forEach((question, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'question';
                questionElement.innerHTML = `
                    <p>${index + 1}. ${question.question}</p>
                    <ul class="options">
                        ${question.choices.map(choice => `<li>${choice}</li>`).join('')}
                    </ul>
                    <p>Correct Answer: ${question.answer}</p>
                `;
                allQuestionsContainer.appendChild(questionElement);
            });
        })
        .catch(error => console.error('Error loading questions:', error));
}

// Escape special characters in a string
function escapeString(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Return to quiz
function returnToQuiz() {
    window.location.href = 'index.html';
}
