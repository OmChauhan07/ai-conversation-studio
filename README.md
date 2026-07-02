# AI Conversation Studio

> **An enterprise-grade AI Conversation Studio built for the 22North
> Product Engineering Challenge 2026.**

## Overview

AI Conversation Studio is a centralized platform for building, testing,
evaluating, and improving enterprise AI assistants. It enables
organizations to upload internal knowledge, retrieve context using
Retrieval-Augmented Generation (RAG), evaluate responses, and analyze AI
quality through dashboards.

> **Status:** 🚧 In Development

# AI Conversation Studio

Enterprise AI workspace for building, testing, and improving internal assistants.

> Built for the 22North Product Engineering Challenge 2026.

## Overview

AI Conversation Studio brings together authentication, knowledge ingestion, retrieval-augmented generation, and response evaluation in one platform. The current build focuses on secure auth, PDF knowledge upload, document processing, and the foundation for chat, prompt management, and analytics.

**Status:** In development

## What is in the repo

- React + Vite frontend
- Express authentication backend with JWT-based auth flows
- FastAPI AI service for knowledge ingestion and future RAG APIs
- Prisma schema for the auth database
- ChromaDB workspace for local vector storage
- Documentation and project notes in `docs/`

## Key Capabilities

### Available now

- Register, login, OTP verification, and password reset flows
- Protected dashboard routes in the frontend
- PDF upload and text extraction pipeline
- Text chunking and ingestion scaffolding
- FastAPI health and knowledge endpoints

### In progress

- Embedding generation
- Chroma indexing
- Chat API
- Response evaluation pipeline

### Planned

- Prompt studio
- Analytics dashboard
- Conversation history and feedback improvements
- Multi-model support

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Auth backend | Express.js |
| AI backend | FastAPI |
| ORM | Prisma |
| Database | PostgreSQL |
| Vector store | ChromaDB |
| LLM providers | Gemini, Groq |
| PDF processing | pypdf |
| Chunking | LangChain text splitters |

## Architecture

```text
React Frontend
      |
      +--> Express Auth API
      |
      +--> FastAPI AI Service
                 |
                 +--> PostgreSQL
                 +--> ChromaDB
                 +--> Gemini / Groq
```

## Project Structure

```text
ai-conversation-studio/
├── frontend/
├── backend-auth/
├── backend-ai/
├── docs/
├── database/
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd ai-conversation-studio
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install auth backend dependencies

```bash
cd ../backend-auth
npm install
```

### 4. Set up the AI backend

```bash
cd ../backend-ai
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Project

From the repository root, the available scripts are:

```bash
npm run frontend
npm run auth
npm run ai
```

You can also run each service directly:

### Frontend

```bash
cd frontend
npm run dev
```

### Auth backend

```bash
cd backend-auth
npm start
```

### AI backend

```bash
cd backend-ai
.venv\Scripts\activate
uvicorn app.main:app --reload
```

## Environment Variables

### `backend-auth`

```env
DATABASE_URL=
JWT_SECRET=
SMTP_EMAIL=
SMTP_PASSWORD=
```

### `backend-ai`

```env
GEMINI_API_KEY=
GROQ_API_KEY=
CHROMA_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/dashboard`

### AI service

- `GET /`
- `GET /health`
- `POST /knowledge/upload`

Additional chat, prompt, and evaluation routes are mounted in the FastAPI app and will expand as the AI workflows are completed.

## User Roles

The intended product model uses a simple RBAC split:

| Role | Purpose |
| --- | --- |
| Admin | Manages knowledge, prompts, analytics, users, and platform settings |
| User | Chats with the assistant, reviews history, and submits feedback |

For the MVP, Admin owns the platform-level AI management workflows. A dedicated AI Engineer role can be added later if the permissions need to be split further.

## Roadmap

- Embeddings and vector indexing
- RAG chat experience
- Prompt studio
- Response evaluation metrics
- Analytics dashboard
- UI polish
- Deployment

## Team

* Om Chauhan
* Shreya Patel


