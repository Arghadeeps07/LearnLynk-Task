# LearnLynk – Technical Assessment

This repository contains my completed solutions for the LearnLynk Technical Assessment.  
The goal of the exercise is to demonstrate practical skills across database design, row-level security, serverless functions, and frontend implementation using the LearnLynk tech stack:

- **Supabase Postgres**
- **Supabase Edge Functions (TypeScript)**
- **Next.js + TypeScript**

All tasks are implemented inside the `/backend` and `/frontend` folders as requested.

---

## Overview

This assessment includes four technical tasks and one written response:

1. **Database Schema** – `backend/schema.sql`  
2. **RLS Policies** – `backend/rls_policies.sql`  
3. **Edge Function: create-task** – `backend/edge-functions/create-task/index.ts`  
4. **Next.js Page: Today’s Tasks** – `frontend/pages/dashboard/today.tsx`  
5. **Stripe Checkout (written answer)** – included at the bottom of this README  

Each task is implemented based on the specifications provided in the assignment.

---

## Task 1 — Database Schema

**Location:** `backend/schema.sql`

The schema defines three main tables:

- `leads`
- `applications`
- `tasks`

All tables include shared metadata columns:

```sql
id uuid primary key default gen_random_uuid(),
tenant_id uuid not null,
created_at timestamptz default now(),
updated_at timestamptz default now()
