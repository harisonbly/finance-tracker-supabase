Finance Tracker — Supabase + Netlify

Overview
A simple finance tracker SPA built with React and Supabase. Users can sign up / sign in and store transactions (income/expense). Deployable to Netlify.

Local development
1. Clone the repo:
   git clone <your-repo-url>
   cd finance-tracker-supabase

2. Install:
   npm install

3. Set environment variables (locally for Vite)
   Create a .env file in project root with:
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

4. Start dev server:
   npm run dev

Supabase setup
1. Create a Supabase project (https://app.supabase.com).
2. Go to Settings > API and copy the Project URL and the anon public key.
3. In "SQL Editor" run the SQL in supabase.sql to create the transactions table and RLS policies.
4. In Authentication > Settings, enable Email auth (Password) if you want password sign-in.
5. You can also enable OAuth providers if desired.

Important: The SQL enables row-level security and policies that restrict each user to only their rows.

Environment variables for deployment (Netlify)
- Add environment variables in Netlify site settings:
  VITE_SUPABASE_URL = https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY = your-anon-key

Deploy to Netlify
1. Push your repo to GitHub.
2. In Netlify, click "New site from Git" and connect your GitHub repo.
3. Set build command: npm run build
   Publish directory: dist
4. Add the environment variables above in Netlify Site Settings > Environment.
5. Deploy.

Notes & security
- The app inserts user_id in transactions on the client. RLS policies ensure that only rows with user_id matching auth.uid() are accessible.
- Keep your anon key secret-ish in that anon key should still only be used for public client actions. No secret keys should be exposed in the frontend.

Extending
- Add categories table, charts, filters, pagination, CSV export, editing transactions, or multi-currency support.
