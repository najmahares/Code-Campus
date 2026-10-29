# Code Campus

**An AI-augmented, unified workspace designed to eliminate context-switching for software engineering students.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=flat-square&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)

## What is Code Campus?

Engineering students face a massive cognitive load. They are constantly switching between reading documentation, writing code, managing project deadlines, and trying to maintain their mental health.

Code Campus replaces the chaos of five different apps with a single, calm workspace. More than just a note-taking app, Code Campus uses Artificial Intelligence as an invisible assistant. It reads your project specifications, organizes your lecture slides, and acts as a personalized coding tutor, allowing you to focus entirely on building.

## The AI Engine (How it Works)

This project was built with a deep focus on AI orchestration, utilizing the Vercel AI SDK to route tasks to the best model for the job.

- **Instant Chat (Scout AI):** When you ask a question about your project, speed is everything. I use Groq (running open-weight Llama models) to stream responses instantly, ensuring the AI feels conversational and responsive.
- **Multi-Modal Vision:** Students can upload screenshots of code, architecture diagrams, or textbook pages. I use Google Gemini's vision capabilities to read and extract text from these images.
- **Structured Output:** Instead of letting the AI return messy text, I use Zod and the AI SDK to enforce strict JSON schemas. When the AI generates study notes or flashcards, it outputs predictable data structures that the frontend can render flawlessly.
- **Smart Context (RAG-lite):** When you upload a 40-page project spec, the system extracts the text and feeds it directly into the AI's memory. 
- **Safety & Empathy Guardrails:** The "Rant Room" uses custom prompt engineering. It is instructed to never use toxic positivity or write in markdown. If it detects severe distress, it overrides its normal behavior to provide immediate crisis support resources.

## Security and Privacy

Security is built into the foundation, ensuring student data remains private and isolated.

- **Database-Level Privacy:** I use Supabase Row-Level Security (RLS). This means the database itself checks your identity on every single request. It is mathematically impossible for one student to read another student's notes, even if they guessed the URL.
- **Safe File Storage:** All uploaded PDFs, images, and voice recordings are stored in private buckets. The application generates secure, short-lived URLs to access them.
- **API Protection:** A custom rate limiter protects the AI endpoints from abuse, ensuring that API keys cannot be spammed or drained.

## Design Thinking

In the tech industry, burnout is a real problem. Code Campus is designed around the concept of "Calm Tech" : an interface that reduces stress rather than adding to it.

- **Fluid Physics:** The UI uses Framer Motion to create smooth, physics-based transitions. It feels like a native desktop application.
- **Intentional Typography:** I pair a clean geometric sans-serif (Quicksand) for headings with a highly legible body font (Inter) and a handwritten script (Caveat) for personal moments, creating a balance between professional tool and personal journal.
- **Accessibility First:** I also strictly enforce semantic HTML and WCAG 2.1 AA contrast standards. Our Playwright test suite automatically scans for accessibility violations.

## Core Modules

1. **Scout AI Copilot:** A project-aware chatbot that reads your specifications and helps you plan your architecture.
2. **Intelligent Notes:** Converts PDFs, links, and images into structured study notes and quizzes.
3. **Project Management:** A central hub for tracking capstone progress, specs, and milestones.
4. **Today:** A streamlined daily task list to prevent backlog anxiety.
5. **Wellbeing Protocol:** Features mood tracking, guided breathing exercises, and an AI empathy bot for venting.
6. **Encrypted Vault:** A secure place to store API keys, environment variables, and reusable code snippets.

## Engineering Challenges

- **Balancing Streaming with Structure:** Streaming chat responses (for speed) while simultaneously generating strict JSON schemas (for data integrity) required building separate API handlers and complex prompt engineering strategies.
- **State Synchronization:** Managing the state between the local Supabase client, React Server Components, and Framer Motion animations required careful use of localized context providers to prevent UI tearing.

## Local Development

### Prerequisites

- Node.js 18+
- Supabase Project (PostgreSQL)
- API Keys: Groq and Google Gemini

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/najmahares/code-campus.git
   cd code-campus
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
   ```

4. Database Setup:
   Execute the SQL scripts located in the `/supabase` directory within your Supabase SQL Editor. This provisions the tables, enables Row-Level Security, and initializes the storage buckets.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Testing and Quality Assurance

I use Playwright to test the project end-to-end.
- **Functionality:** Tests cover authentication, routing, and UI interactions using the Page Object Model.
- **Resilience:** Simulates network failures (mocking 500 and 429 status codes) to ensure the app fails gracefully with toast notifications.
- **Accessibility:** Automated WCAG 2.1 AA compliance scanning via `@axe-core/playwright`.

To run the test suite:

```bash
npm run test:e2e
```

## Author

**Najma Hares**

- LinkedIn: [najma-hares](https://www.linkedin.com/in/najma-hares/)
- GitHub: [najmahares](https://github.com/najmahares)
