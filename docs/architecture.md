# FocusBuddy Architecture

## Overview

FocusBuddy follows a layered monolithic architecture.

The application consists of:

- Frontend (Next.js)
- Backend (Spring Boot)
- PostgreSQL Database
- AI Service (OpenAI)
- Local file storage (later Amazon S3)

---

# High-Level Architecture

```
                    Browser
                       │
                       ▼
        Next.js + React + TypeScript
                       │
                 REST API (HTTP)
                       │
                       ▼
              Spring Boot Backend
                       │
 ┌───────────────────────────────────────────┐
 │                                           │
 │ Authentication                            │
 │ Courses                                   │
 │ Topics                                    │
 │ Documents                                 │
 │ AI Notes                                  │
 │ AI Chat                                   │
 │ Planner                                   │
 │ Study Sessions                            │
 │ Progress                                  │
 │ Companion                                 │
 │                                           │
 └───────────────────────────────────────────┘
          │                     │
          ▼                     ▼
    PostgreSQL             OpenAI API
          │
          ▼
   Local File Storage
 (Amazon S3 in future)
```

---

# Backend Layers

Every feature follows the same architecture.

```
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

## Controller

Responsibilities

- Receive HTTP requests
- Validate request data
- Return responses
- No business logic

---

## Service

Responsibilities

- Business logic
- Validation
- AI integration
- File processing
- Calling repositories

---

## Repository

Responsibilities

- Database access
- CRUD operations
- Custom queries

Uses Spring Data JPA.

---

# Package Structure

```
com.alexaharti.focusbuddy

├── common
├── auth
├── user
├── course
├── topic
├── document
├── notes
├── chat
├── study
├── planner
├── progress
└── companion
```

Each feature contains:

```
controller
service
repository
entity
dto
mapper
```

---

# Request Flow

```
Browser

↓

REST Controller

↓

Service

↓

Repository

↓

PostgreSQL

↓

Repository

↓

Service

↓

DTO

↓

Frontend
```

---

# AI Flow

```
User uploads PDF

↓

Store file

↓

Extract text

↓

Split text into chunks

↓

Generate embeddings

↓

Store chunks

↓

User asks question

↓

Retrieve relevant chunks

↓

Send context to OpenAI

↓

Receive answer

↓

Return answer with citations
```

---

# Authentication

Version 1 uses

- Spring Security
- JWT Authentication
- BCrypt password hashing

Each user can only access their own data.

---

# Database

Database:

- PostgreSQL

Extensions:

- pgvector

ORM:

- Spring Data JPA
- Hibernate

---

# Future Improvements

- Amazon S3
- Redis caching
- Docker deployment
- CI/CD pipeline
- Monitoring