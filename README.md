# Darshit OS v2.0

Patel Darshit's Personal OS - A high-performance, web-based operating system simulation designed for Full-stack Developers, AI Specialists, and SaaS Architects.

**Live Demo:** [https://personal-os-bice.vercel.app/](https://personal-os-bice.vercel.app/)

![Darshit OS Preview](https://images.unsplash.com/photo-1614332287711-b883075199ac?q=80&w=2670&auto=format&fit=crop)

## 🚀 Features

Darshit OS v2.0 is more than just a portfolio; it's a fully functional containerized ecosystem of applications.

### 📁 Core Applications
- **Notes.app**: A professional journaling and note-taking app with "Read" and "Write" views, full markdown support, and Local Storage persistence.
- **Finder.app**: Navigate through projects, resumes, and system files with a polished glassmorphic interface.
- **Terminal.app**: A functional command-line interface for power users.
- **YouTube Music**: A custom-built music player integrating the YouTube API for seamless background audio.
- **Calendar**: Stay organized with built-in Calendly integration for professional scheduling.
- **Wallet**: Integrated Stripe checkout for professional service payments and SaaS Tier subscriptions.

### 🎮 Gaming Hub
- **Flappy Bird (FlappyOS)**: A polished retro-clone featuring smooth linear interpolation for rotations, screen-shake effects, and a particle system for jumps and impacts.
- **Snake.js**: A classic snake game optimized for the OS environment with high-score tracking and responsive controls.

### 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Animations**: Motion (framer-motion) for fluid OS transitions and physics-based interactions.
- **Backend**: Node.js & Express (Full-stack architecture)
- **APIs**:
    - **Google APIs**: YouTube Data API, Google Auth
    - **Stripe**: Professional payment processing
    - **Calendly**: Meeting scheduling
- **Icons**: Lucide React
- **Dev Tools**: TypeScript, tsx, ESLint

## 🛠 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd darshit-os-v2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your keys (refer to `.env.example`):
   ```env
   STRIPE_SECRET_KEY=your_stripe_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📂 Project Structure

- `src/components/apps/`: Contains the individual OS applications.
- `src/components/OS/`: Core OS components (Taskbar, Desktop, Window Manager).
- `server.ts`: Express backend handling API proxies and integrations.
- `metadata.json`: Application configuration and permissions.

---

**Developed with ❤️ by Darshit Patel**
*Building the future of human-computer interaction.*
