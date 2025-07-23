# GenAI PDF Q&A Bot 🤖📄

A chatbot that lets you upload PDFs and ask questions about their content using HuggingFace models and FastAPI.

## Features
- Upload and query multiple PDFs
- Real-time chat with bot animations
- React frontend with Material UI
- FastAPI backend with HuggingFace integration

## Getting Started

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
