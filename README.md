# Welth - AI-Powered Finance App

Welth is an AI-powered finance application designed to help users manage their finances. The app allows users to create multiple accounts, make transactions with the help of Google Gemini AI, set budgets, and receive email alerts when their budget hits 80%. It also provides insightful visualizations such as bar charts and pie charts to track expenses.

## Features

- **Account Management**: Create and manage multiple accounts.
- **Transactions with Google Gemini AI**: Leverage AI to assist in making transactions.
- **Budgeting**: Set budgets and receive email alerts when the budget hits 80%.
- **Expense Insights**: Visualize expenses using bar charts and pie charts.
- **Email Alerts**: Get notified when a budget threshold is reached.
- **Bot Protection**: Implement bot protection with Arcjet to prevent malicious activities.
- **Rate Limiting**: Prevent abuse and ensure fair usage with rate limiting via Arcjet.
- **Cronjob Functions**: Automate periodic tasks using Inngest cronjob functions for efficient background processes.

## Tech Stack

- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: Prisma (for ORM), Inngest (for serverless workflows and cronjob functions), Next.js
- **Authentication**: Clerk (for secure user authentication)
- **AI**: Google Generative AI
- **Database**: Prisma (with SQLite/PostgreSQL support)
- **Charting**: Recharts (for visualizing expenses)
- **Email**: Resend (for sending emails)
- **State Management**: React Hook Form (for forms), Zod (for validation)
- **Bot Protection & Rate Limiting**: Arcjet
- **Cronjobs**: Inngest (for automating tasks)

## Installation

To get started with the app, clone the repository and follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/welth.git
   cd welth
   ```
2. Install the dependencies:

   ```
   npm install --legacy-peer-deps
   ```

3. Set up the environment variables:
   ```
   NEXT_PUBLIC_GOOGLE_API_KEY: Google API key for Generative AI.
   CLERK_API_KEY: Clerk API key for user authentication.
   DATABASE_URL: Prisma database URL (SQLite/PostgreSQL).
   ARCJET_API_KEY: Arcjet API key for bot protection and rate limiting.
   INNGEST_API_KEY: Inngest API key for cronjobs.
   ```
4. Run the development server:
   ```
   npm run dev
   ```

The app will be available at http://localhost:3000
