# RAG-based PDF Chatbot

This project is a Retrieval-Augmented Generation (RAG) based chatbot that allows users to upload PDF documents and ask questions about their content. It uses a modern React frontend and an Express backend, leveraging LangChain, Qdrant (Vector Database), Hugging Face embeddings, and Groq's LLM to generate intelligent, context-aware answers.

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15
- React 19
- Tailwind CSS
- shadcn/ui & Lucide React (UI Components & Icons)
- Clerk (Authentication)

**Backend:**
- Node.js & Express.js
- Multer (File uploads)
- BullMQ & Valkey/Redis (Background task queue)
- LangChain (LLM Orchestration)
- Qdrant (Vector Database)
- Hugging Face Models (Embeddings)
- Groq LLaMA 3.1 (LLM Inference)

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose (for running Valkey and Qdrant locally)

You will also need API keys for:
- [Hugging Face](https://huggingface.co/)
- [Groq](https://groq.com/)
- [Clerk](https://clerk.com/) (For frontend authentication)

---

## 🚀 Setup & Installation

### 1. Start External Services (Database & Queue)

A `docker-compose.yml` file is provided to quickly spin up Valkey (Redis alternative for BullMQ) and Qdrant (Vector Database). 

Run the following command in the root of the project:
```bash
docker-compose up -d
```
This will start Valkey on port `6379` and Qdrant on port `6333`.

### 2. Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server` directory and add your API keys:
   ```env
   HUGGINGFACE_API_KEY="your_huggingface_api_key_here"
   GROQ_API_KEY="your_groq_api_key_here"
   ```
4. Start the Express API server:
   ```bash
   npm run dev
   ```
5. Open a new terminal, navigate to the `server` directory, and start the background worker (which processes the PDFs):
   ```bash
   npm run dev:worker
   ```

### 3. Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file inside the `client` directory and add your Clerk public and secret keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key_here"
   CLERK_SECRET_KEY="your_clerk_secret_key_here"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## 💡 How It Works

1. **Upload:** User logs in and uploads a PDF via the UI.
2. **Queueing:** The backend saves the file and sends a job to the Valkey queue.
3. **Processing:** The worker (`worker.js`) picks up the job, reads the PDF, chunks the text, generates vector embeddings using Hugging Face, and stores them in Qdrant.
4. **Chatting:** When the user asks a question, the backend searches Qdrant for relevant text chunks, passes them to Groq's LLaMA model as context, and streams back the generated response.
