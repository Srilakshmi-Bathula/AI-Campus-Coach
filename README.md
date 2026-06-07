# 🎓 AI Campus Coach

An AI-powered interview practice system that uses Natural Language Processing and evaluation algorithms to assess student responses and generate personalized feedback.

## 🚀 What It Does

1. User opens the web app
2. NLP-powered engine generates 5 domain-specific interview questions
3. User submits their answers
4. System evaluates responses using scoring algorithms and gives:
   → A score out of 10
   → Error analysis and knowledge gap identification
   → Step-by-step improvement plan
   → AI-generated model answer for comparison

## 🛠️ Tech Stack

- Python — backend logic, API integration and evaluation pipeline
- HTML & CSS — frontend interface
- OpenAI API — NLP-based question generation and response evaluation
- Prompt Engineering — custom prompts to control question difficulty and feedback quality

## 💡 Key Features

- NLP-based interview question generation
- Automated response scoring using evaluation logic
- Knowledge gap detection and error analysis
- Personalized improvement plan per answer
- AI-generated model answers for self-learning
- Clean web interface for smooth user experience

## 🔍 ML & AI Concepts Used

- Natural Language Processing (NLP)
- Prompt Engineering
- Automated Evaluation Logic
- Scoring Algorithms
- AI-based Feedback Generation

## 🎯 Purpose

Built to help engineering students identify weak areas, analyze response quality, and improve interview performance using AI-driven evaluation pipelines.

## ⚠️ Note

Never share or commit your API key publicly. Use environment variables to keep it secure.

## 🔑 Setup Instructions

1. Clone this repository
2. Install dependencies
   pip install openai
3. Add your OpenAI API key
   OPENAI_API_KEY=your_api_key_here
4. Run the app
   python app.py
