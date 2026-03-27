// ===== Cache DOM elements =====
const el = {
  startBtn: document.getElementById("startBtn"),
  greeting: document.getElementById("greeting"),
  interview: document.getElementById("interview"),
  questionText: document.getElementById("questionText"),
  answerInput: document.getElementById("answerInput"),
  submitBtn: document.getElementById("submitBtn"),
  evaluation: document.getElementById("evaluation"),
  scoreText: document.getElementById("scoreText"),
  feedbackText: document.getElementById("feedbackText"),
  tipsText: document.getElementById("tipsText"),
  rubricText: document.getElementById("rubricText"),
  nextBtn: document.getElementById("nextBtn"),
  final: document.getElementById("final"),
  summaryText: document.getElementById("summaryText"),
  strengthsList: document.getElementById("strengthsList"),
  improvementsList: document.getElementById("improvementsList"),
  planContainer: document.getElementById("planContainer"),
  restartBtn: document.getElementById("restartBtn"),
  progressText: document.getElementById("progressText"),
};

// ===== App state =====
const state = {
  questions: [],
  currentIndex: 0,
  sessions: []
};

// ===== Utility functions =====
function show(elm) { elm.classList.remove("hidden"); }
function hide(elm) { elm.classList.add("hidden"); }

// ===== Start Interview =====
el.startBtn.addEventListener("click", async () => {
  hide(el.greeting);
  show(el.interview);

  try {
    const res = await fetch("/questions");
    const data = await res.json();
    state.questions = data.questions;
    state.currentIndex = 0;

    // Display first question
    el.questionText.textContent = state.questions[state.currentIndex];
    el.progressText.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  } catch (err) {
    console.error("Failed to load questions:", err);
    alert("Could not load questions. Check server.");
  }
});

// ===== Submit Answer =====
async function submitAnswer() {
  const question = state.questions[state.currentIndex];
  const answer = el.answerInput.value.trim();
  if (!answer) { alert("Please type your answer."); return; }

  el.submitBtn.disabled = true;
  el.submitBtn.textContent = "Evaluating...";

  try {
    const res = await fetch('/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("Server error:", data);
      alert("Evaluation failed. Check server logs.");
      return;
    }

    el.scoreText.textContent = data.score;
    el.feedbackText.textContent = data.feedback;
    el.tipsText.textContent = data.tips;
    el.rubricText.textContent = data.rubric;
    show(el.evaluation);

    state.sessions.push({ question, answer, score: data.score, feedback: data.feedback });
  } catch (err) {
    console.error("Client fetch error:", err);
    alert("Evaluation failed. Please try again.");
  } finally {
    el.submitBtn.disabled = false;
    el.submitBtn.textContent = "Submit Answer";
  }
}
el.submitBtn.addEventListener("click", submitAnswer);

// ===== Next Question =====
el.nextBtn.addEventListener("click", () => {
  state.currentIndex++;
  el.answerInput.value = "";
  hide(el.evaluation);

  if (state.currentIndex < state.questions.length) {
    el.questionText.textContent = state.questions[state.currentIndex];
    el.progressText.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  } else {
    finishInterview();
  }
});

// ===== Finish Interview & Summary =====
async function finishInterview() {
  hide(el.interview);
  show(el.final);

  try {
    const res = await fetch("/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: state.sessions })
    });
    const data = await res.json();

    el.summaryText.textContent = data.summary;

    // Strengths
    el.strengthsList.innerHTML = "";
    data.strengths.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      el.strengthsList.appendChild(li);
    });

    // Improvements
    el.improvementsList.innerHTML = "";
    data.improvements.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      el.improvementsList.appendChild(li);
    });

    // 7‑day plan
    el.planContainer.innerHTML = "";
    data.plan.forEach(day => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>Day ${day.day}:</strong> ${day.focus}<br>Tasks: ${day.tasks.join(", ")}`;
      el.planContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Summary fetch error:", err);
    el.summaryText.textContent = "Could not generate summary. Please check server.";
  }
}

// ===== Restart Interview =====
el.restartBtn.addEventListener("click", () => {
  state.currentIndex = 0;
  state.sessions = [];
  hide(el.final);
  show(el.greeting);
});