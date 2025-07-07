# 🖼️ Interactive Gallery UI (Frontend)

This is the frontend for the Interactive Gallery application, built with **Next.js**, **TypeScript**, and **TailwindCSS**. It interacts with the NestJS API to display images, allow likes,comments and handle authentication.

---

## 🚀 Features

- User registration & login
- Image gallery with pagination/infinite scroll
- Like/unlike images
- Comments on images
- Responsive UI using TailwindCSS
- SWR or React Query for data fetching
- Secure cookie-based authentication

---

## 🛠 Tech Stack

- [Next.js (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [SWR](https://swr.vercel.app/)
- [Axios](https://axios-http.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/) (optional for validation)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/ifymatics/Interactive-Image-Gallery.git

cd interactive-gallery/frontend

2. Install dependencies

npm install

3. Set up the .env.local file
Create a .env.local file in the root of the frontend/ directory and add:


NEXT_PUBLIC_UNSPLASH_ACCESS_KEY="YOUR_UNSPLASH_ACCESS_KEY"

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

Make sure this matches the backend port.

4.  Running the Application

Development mode

npm run dev
Open your browser and go to http://localhost:3000

5. Running Tests
Unit Tests

npm run test

Features

Authentication

Secure login using JWT stored in HttpOnly cookies

useAuth hook for accessing the logged-in user


Screens
Register/Login: Sign up or log in to the app

Gallery Page: View paginated or infinite-scrolled images

Like Button: Like/unlike images (only if authenticated)


📝 License
MIT © 2025 — Okorie Ifeanyi






```
