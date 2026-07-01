# Software Requirements Specification (SRS)

# AI Conversation Studio

Version: 1.0

Project Type: Product Engineering Challenge 2026

Team:
- <Member 1>
- <Member 2>

---

# Table of Contents

1. Introduction
2. Purpose
3. Scope
4. Problem Statement
5. Objectives
6. Stakeholders
7. Functional Requirements
8. Non-Functional Requirements
9. System Architecture
10. Technology Stack
11. User Roles
12. User Flow
13. Database Design
14. API Overview
15. Security Requirements
16. Assumptions
17. Future Enhancements

---

# 1. Introduction

AI Conversation Studio is a centralized platform that enables organizations to manage, test, evaluate, and improve AI-powered conversational assistants.

The platform allows teams to upload enterprise knowledge, create reusable prompts, interact with Large Language Models (LLMs), evaluate AI responses, collect user feedback, and analyze conversation quality through dashboards.

This project is developed as an MVP for the **22North Product Engineering Challenge 2026**.

---

# 2. Purpose

Organizations increasingly deploy AI assistants across customer support, HR, internal documentation, and operations.

However, they lack tools to:

- Manage knowledge sources
- Evaluate AI response quality
- Detect hallucinations
- Improve prompts
- Analyze AI performance
- Collect user feedback

AI Conversation Studio addresses these problems by providing a unified platform for AI lifecycle management.

---

# 3. Scope

The MVP includes:

- User Authentication
- Knowledge Base Management
- Prompt Management
- AI Playground
- RAG-based Question Answering
- Response Evaluation
- User Feedback
- Analytics Dashboard

The MVP focuses on demonstrating product thinking and engineering quality rather than implementing every enterprise feature.

---

# 4. Problem Statement

Organizations deploying AI assistants often face:

- Poor response quality
- Hallucinated answers
- Ineffective prompts
- Lack of evaluation metrics
- No centralized knowledge management
- No conversation analytics
- Limited governance over AI systems

This project aims to solve these challenges.

---

# 5. Objectives

Primary objectives:

- Improve AI response quality
- Centralize enterprise knowledge
- Evaluate AI-generated responses
- Provide prompt engineering tools
- Generate actionable analytics
- Reduce hallucinations
- Increase user trust in AI assistants

---

# 6. Stakeholders

## Primary Users

- AI Engineers
- Prompt Engineers
- Product Managers
- Business Analysts
- Administrators

## Secondary Users

- Organization Employees
- QA Teams
- Customer Support Teams

---

# 7. Functional Requirements

## 7.1 Authentication

Users shall be able to:

- Register
- Login
- Logout
- Access protected resources using JWT authentication.

---

## 7.2 Knowledge Base

Users shall be able to:

- Upload PDF documents
- Delete documents
- View uploaded documents
- Index documents into vector database

Supported document types:

- PDF

---

## 7.3 Prompt Studio

Users shall be able to:

- Create prompts
- Edit prompts
- Delete prompts
- Reuse prompts
- View prompt history

---

## 7.4 AI Playground

Users shall be able to:

- Select an AI model
- Select a prompt template
- Ask questions
- Receive AI-generated responses
- View retrieved knowledge chunks

---

## 7.5 Retrieval-Augmented Generation (RAG)

System shall:

- Chunk uploaded documents
- Generate embeddings
- Store vectors
- Perform similarity search
- Retrieve relevant context
- Generate grounded responses

---

## 7.6 Response Evaluation

Each AI response shall be evaluated on:

- Relevance
- Groundedness
- Completeness
- Hallucination Risk
- Confidence Score

---

## 7.7 Feedback

Users shall be able to:

- Like responses
- Dislike responses
- Submit textual feedback

---

## 7.8 Analytics Dashboard

Dashboard shall display:

- Total Conversations
- Total Documents
- Active Prompts
- Average Rating
- Hallucination Rate
- Prompt Success Rate
- Document Usage
- Conversation Trends

---

# 8. Non-Functional Requirements

## Performance

Average response time:

< 3 seconds

---

## Scalability

Architecture should support:

- Multiple users
- Multiple AI models
- Multiple knowledge bases

---

## Security

- JWT Authentication
- Password Hashing
- Environment Variables
- Protected APIs
- CORS Configuration

---

## Availability

Target:

99% uptime (future deployment)

---

## Maintainability

Project follows:

- Modular Architecture
- Service Separation
- REST APIs
- Clean Folder Structure

---

# 9. System Architecture

```
                 React Frontend
                        |
        -------------------------------
        |                             |
        ▼                             ▼
 Express Auth API             FastAPI AI Service
        |                             |
        -----------PostgreSQL---------
                      |
                  ChromaDB
                      |
                  Gemini API
```

---

# 10. Technology Stack

## Frontend

- React
- Vite
- TailwindCSS
- Axios
- React Router

---

## Backend

### Authentication Service

- Express.js
- Prisma ORM
- JWT
- bcrypt

### AI Service

- FastAPI
- LangChain
- ChromaDB
- Sentence Transformers

---

## Database

- PostgreSQL (Neon)

---

## AI

Primary

- Gemini API (Gemma 4 31B)

Fallback

- Groq (Llama 3)

---

# 11. User Roles

## Administrator

Permissions

- Manage knowledge
- Manage prompts
- View analytics
- Access conversations

---

## User

Permissions

- Upload documents
- Ask questions
- Use prompts
- Submit feedback

---

# 12. User Flow

```
Login

↓

Dashboard

↓

Upload Knowledge

↓

Document Processing

↓

Vector Database

↓

Prompt Selection

↓

Ask Question

↓

Similarity Search

↓

LLM Response

↓

Evaluation

↓

Feedback

↓

Analytics Dashboard
```

---

# 13. Database Design

## Users

| Field | Type |
|---------|------|
| id | UUID |
| name | String |
| email | String |
| password | String |
| createdAt | Date |

---

## Documents

| Field | Type |
|---------|------|
| id | UUID |
| title | String |
| path | String |
| uploadedBy | UUID |

---

## Prompts

| Field | Type |
|---------|------|
| id | UUID |
| title | String |
| systemPrompt | Text |

---

## Conversations

| Field | Type |
|---------|------|
| id | UUID |
| userId | UUID |
| promptId | UUID |
| question | Text |
| answer | Text |

---

## Evaluation

| Field | Type |
|---------|------|
| id | UUID |
| conversationId | UUID |
| relevance | Float |
| groundedness | Float |
| hallucination | Float |
| confidence | Float |

---

## Feedback

| Field | Type |
|---------|------|
| id | UUID |
| conversationId | UUID |
| rating | Integer |
| comment | Text |

---

# 14. API Overview

Authentication

```
POST /auth/register

POST /auth/login

GET /auth/profile
```

Knowledge

```
POST /knowledge/upload

GET /knowledge

DELETE /knowledge/:id
```

Prompts

```
GET /prompts

POST /prompts

PUT /prompts/:id

DELETE /prompts/:id
```

Chat

```
POST /chat
```

Evaluation

```
POST /evaluate
```

Analytics

```
GET /analytics
```

Feedback

```
POST /feedback
```

---

# 15. Security Requirements

Passwords

- bcrypt hashing

Authentication

- JWT Tokens

Secrets

- Environment Variables

Input Validation

- Zod (Express)
- Pydantic (FastAPI)

Database

- Prisma ORM
- Parameterized Queries

---

# 16. Assumptions

- Internet connection is available.
- Gemini API is operational.
- Uploaded documents are PDFs.
- Authentication is required for all protected endpoints.
- ChromaDB is locally hosted.
- PostgreSQL is hosted on Neon.

---

# 17. Future Enhancements

- Multi-tenant architecture
- Organization workspaces
- RBAC (Role-Based Access Control)
- Prompt versioning
- Multiple vector databases
- OpenAI integration
- Claude integration
- AI cost monitoring
- Real-time monitoring
- Conversation replay
- A/B prompt testing
- Model comparison
- Audit logs
- SSO Authentication
- Kubernetes deployment
- Docker Compose deployment
- CI/CD pipeline
- Redis caching
- Streaming AI responses
- Voice conversations
- Image understanding
- Multi-modal RAG

---

# Success Criteria

The project will be considered successful if users can:

- Upload enterprise knowledge
- Ask questions using RAG
- Receive grounded AI responses
- Evaluate response quality
- Collect user feedback
- View analytics
- Manage prompts
- Authenticate securely

while maintaining a clean, scalable, and modular architecture.