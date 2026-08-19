# FocusBuddy Product Specification

## 1. Product overview

FocusBuddy is an AI-powered study platform for university students. It helps students transform lecture PDFs into understandable notes, ask questions about their course materials, plan study sessions, track progress, and remain motivated through an interactive study companion.

The main goal is to reduce the time students spend organizing and understanding lecture material while helping them study consistently.

## 2. Target user

The primary user is a university student who:

- receives most course material as lecture PDFs
- wants shorter and clearer explanations
- needs help organizing different courses and topics
- wants to prepare for exams more efficiently
- struggles with consistency or distraction
- prefers a supportive and visually engaging study environment

## 3. Main user journey

1. The user creates an account.
2. The user creates a course.
3. The user adds topics to the course.
4. The user uploads one or more lecture PDFs.
5. FocusBuddy processes the PDFs.
6. The user generates structured notes.
7. The user asks questions about the lecture material or generated notes.
8. FocusBuddy answers using the uploaded material and provides page references.
9. The user plans or starts a study session.
10. The user completes the session.
11. Study time, streaks, and topic progress are updated.
12. The companion reacts to the user’s actions and achievements.

## 4. Version 1 features

### Accounts

Users can:

- register
- log in
- access only their own courses, documents, notes, and study data

### Courses

Users can:

- create a course
- edit a course
- delete a course
- add topics
- organize PDFs by course
- track progress by topic

### PDF processing

Users can:

- upload lecture PDFs
- view processing status
- see uploaded documents
- generate notes from a selected PDF

Document statuses:

- UPLOADED
- PROCESSING
- READY
- FAILED

### AI-generated notes

The application provides three note-generation modes:

#### Quick Revision

A short summary containing only the most important concepts.

#### Detailed Explanation

A clearer and more accessible explanation of the lecture material, including examples where useful.

#### Exam Preparation

Structured notes containing important definitions, concepts, formulas, comparisons, and likely exam-relevant information.

### AI question answering

Users can:

- ask questions about a specific PDF
- ask questions about generated notes
- request simpler explanations
- request examples
- receive answers with PDF page references
- save useful answers in conversation history

The AI should answer primarily using the uploaded material. When the document does not contain enough information, the application should clearly say so.

### Study sessions

Users can:

- select a course and topic
- define a session goal
- choose a planned duration
- start, pause, resume, and complete a timer
- record the actual study duration

### Study planner

Users can:

- schedule a study session
- select the course and topic
- choose a date and time
- set the planned duration
- mark the planned session as completed

### Progress

The dashboard shows:

- minutes studied today
- weekly study time
- current streak
- completed study sessions
- progress by course
- progress by topic
- last studied date

Topic statuses:

- NOT_STARTED
- LEARNING
- REVIEWING
- CONFIDENT

### Companion

The companion remains visible on important pages and reacts to application events.

Initial states:

- IDLE
- THINKING
- READING
- CELEBRATING
- APPLAUDING
- ENCOURAGING
- WAITING
- SLEEPING

Example reactions:

- PDF processing starts → THINKING
- PDF processing completes → CELEBRATING
- notes are being generated → READING
- notes are completed → APPLAUDING
- study session starts → READING
- focus milestone is reached → ENCOURAGING
- user temporarily leaves → WAITING
- session is completed → CELEBRATING

The companion should use positive encouragement rather than guilt or punishment.

### Rewards

Focused study gives the user focus points.

Focus points may later unlock:

- companion accessories
- desk decorations
- books
- plants
- backgrounds
- milestone badges

The first version only needs a simple focus-points system and a small number of rewards.

### Optional camera mode

Camera mode is optional and must be activated by the user.

The first version may support:

- user present
- user absent
- open-palm gesture to pause
- thumbs-up gesture to resume

Camera frames should be processed locally in the browser where possible and should not be stored.

## 5. Not included in Version 1

The following features are outside the first release:

- real-time collaboration
- shared course editing
- video calling
- Google Calendar synchronization
- advanced phone detection
- custom computer-vision training
- Python vision microservice
- multiple companions
- a large virtual world or garden
- mobile application
- complete companion customization
- microservices
- Kubernetes

## 6. Main application pages

Version 1 will contain:

1. Registration page
2. Login page
3. Dashboard
4. Courses page
5. Course details page
6. PDF and notes page
7. AI chat page
8. Study-session page
9. Weekly planner
10. Progress page
11. Companion rewards page

## 7. Success criteria

The first version is successful when a user can:

1. Create an account.
2. Create a course and topic.
3. Upload a PDF.
4. Generate useful notes.
5. Ask a question and receive a grounded answer with a page citation.
6. Complete a study session.
7. See updated study progress.
8. See the companion react to the completed actions.