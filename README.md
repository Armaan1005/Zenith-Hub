# Zenith Hub

Zenith Hub is an all-in-one productivity and study dashboard designed to create a distraction-free environment for focused work. It integrates a Pomodoro timer, task management, a media player with YouTube and Spotify support, and an AI chat assistant to help you stay on track and maximize your productivity.

![Zenith Hub Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- TODO: Replace with a real screenshot -->

## Features

- **Pomodoro Timer:** A customizable Pomodoro timer with work, short break, and long break intervals to structure your study sessions.
- **Task Manager:** A simple yet effective to-do list to keep track of your tasks.
- **AI Task Prioritization:** Uses Gemini AI to analyze your task list and suggest a prioritized plan based on your schedule.
- **Media Player:**
    - **Focus Music:** Curated YouTube streams for concentration.
    - **Spotify Integration:** Connect your Spotify Premium account to control your music directly from the dashboard.
    - **YouTube Player:** Load any YouTube video or playlist to use as a study-along resource, complete with a total duration calculator.
- **Classroom PDF Viewer:** Upload your study materials, organize them into folders, and view PDFs directly in a collapsible, full-screen-capable viewer.
- **Gemini AI Chat:** An integrated AI assistant to answer questions, help with research, or brainstorm ideas without leaving your dashboard.
- **Arduino Control:** A placeholder for future integration to control the Pomodoro timer with a physical device.
- **Light & Dark Mode:** A sleek, modern UI with theme toggling to suit your preference.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **AI:** [Google's Gemini model](https://ai.google/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **State Management:** React Hooks (`useState`, `useEffect`, etc.)
- **Deployment:** [Vercel](https://vercel.com/)

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Armaan1005/Zenith-Hub.git
    cd Zenith-Hub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env.local` in the root of your project and copy the contents of `.env.example`. You will need to fill in the following values:

    ```env
    # Google AI - Get from Google AI Studio
    GEMINI_API_KEY=

    # Spotify API - Get from Spotify Developer Dashboard
    SPOTIFY_CLIENT_ID=
    SPOTIFY_CLIENT_SECRET=

    # The redirect URI for Spotify OAuth. For local development, this is typically:
    NEXT_PUBLIC_REDIRECT_URI=http://127.0.0.1:8888/callback
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:8888](http://localhost:8888) in your browser to see the application.

---

## Deployment on Vercel

The easiest way to deploy this Next.js application is with [Vercel](https://vercel.com/).

1.  **Push your code to your GitHub repository.**
2.  Sign up for a Vercel account and import your project from GitHub.
3.  **Configure Environment Variables:** In your Vercel project settings, add the same environment variables you defined in your `.env.local` file (`GEMINI_API_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`).
4.  **Update Spotify Redirect URI:**
    - After your first deployment, Vercel will give you a production URL (e.g., `https://your-project.vercel.app`).
    - Go to your Spotify Developer Dashboard, find your application, and add `https://your-project.vercel.app/callback` to the list of Redirect URIs.
    - In your Vercel project settings, update the `NEXT_PUBLIC_REDIRECT_URI` environment variable to this new URL.
    - Redeploy the project for the changes to take effect.
5.  **Deploy.** Vercel will automatically build and deploy your app. Future pushes to the `main` branch will trigger automatic redeployments.
