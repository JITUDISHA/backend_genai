# ✈️ PostPilot: Real-time Neo-Brutalist Chat App

**PostPilot** is a high-performance, real-time messaging platform built with **Next.js 14** and **Firebase**. It features a unique "Neo-Brutalist" aesthetic characterized by hard shadows, high-contrast colors (Rust and Gold), and bold typography.

---

## 🚀 Tech Stack

* **Frontend**: [Next.js 14 (App Router)](https://nextjs.org/)
* **Authentication**: [Clerk](https://clerk.com/)
* **Database & Real-time**: [Firebase Firestore](https://firebase.google.com/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Icons/Fonts**: Bokor (Google Fonts), Lucide-react

---

## ✨ Key Features

### 1. The Neo-Brutalist Experience
* **Custom Design System**: Uses a specific palette of Rust (`#8B2510`) and Gold (`#EBB048`) with hard black shadows.
* **Interactive UI**: Includes a custom **Spotlight** effect, **Text Generate** animations, and a textured background layer.
* **Logo Integration**: Centered branding using the project's `favicon.ico` across the Navbar and Footer.

### 2. Real-time Messaging
* **Instant Sync**: Leverages Firebase `onSnapshot` for message delivery in under 100ms.
* **Presence System**: Real-time tracking of user online/offline status.
* **Optimistic Updates**: Messages appear instantly in the UI while the server confirms the write.

### 3. Smart Loading & Transitions
* **Timed Boot-up**: A custom 5-second Neo-Brutalist loader that syncs the "Air-Mail Protocol" before revealing the main site.
* **Smooth Navigation**: Integrated Clerk middleware to redirect authenticated users directly to the `/chat` dashboard.

### 4. Responsive Layout
* **Single Scrollbar Logic**: Custom viewport management to prevent double scrollbars while maintaining a "Full Screen" feel.
* **Strip Footer**: A minimal, low-padding footer strip containing links and credits.

---

## 🛠️ Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/post-pilot.git](https://github.com/your-username/post-pilot.git)
    cd post-pilot
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**: Create a `.env.local` file and add your credentials:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
    CLERK_SECRET_KEY=your_secret
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

---

## 📐 Data Modeling (NoSQL)

PostPilot uses a **Denormalized** data structure to ensure fast reads:
* **`users/`**: Stores profile info synced from Clerk.
* **`chats/`**: Metadata for active conversations.
* **`chats/{id}/messages/`**: Sub-collection for real-time message streams.

---

## 📝 License

Distributed under the MIT License. Crafted with ❤️ by **Disha**.
