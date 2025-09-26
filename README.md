# E-Commerce-Website-Full_Stack

This is a full-featured e-commerce web application built with a modern tech stack. It uses **Supabase** as the backend (auth, storage, PostgreSQL), and integrates **Stripe** for secure payment processing.

---

## 📦 Features

- ✅ User authentication (Supabase Auth)
- 🛍️ Product catalog with categories
- 🛒 Shopping cart & checkout flow
- 💳 Stripe integration for payments
- 📦 Order history & user profiles
- 🛠️ Admin dashboard for managing products
- 🌐 Fully connected Supabase PostgreSQL backend

---

## 🧰 Technologies Used

| Layer       | Tech Stack                          |
|-------------|--------------------------------------|
| Frontend    | HTML, CSS, TypeScript, TailwindCSS and React |
| Backend     | Supabase (Auth, Storage, PostgreSQL, Edge Functions)     |
| Database    | Supabase PostgreSQL                 |
| Payments    | Stripe API                          |

## 🚀 Quick Start

### 1. Clone the repository

If you use Git, run:

```bash
git clone https://github.com/bnlke/E-Commerce-Website-Full_Stack.git
cd E-Commerce-Website-Full_Stack

2. Set up Supabase project

Go to https://app.supabase.com
Create a new project
Copy your project's API keys and Database URL
Modify your STRIPE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY in the "Edge Functions" section

3. Configure environment variables 

Update .env folder with your credentials:

VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
VITE_NEXT_PUBLIC_REDIRECT_URL=your-redirect-url

You can get the Stripe keys from https://dashboard.stripe.com

4. Set up Supabase Database schema

Go to the SQL Editor in your Supabase project
Run the scripts provided in the repo
This will create tables for products, users, orders, etc.

5. Run the project locally - React/Vite

npm install
npm run dev

6. Test the Stripe payment flow

Add products to cart
Go to checkout
You’ll be redirected to a secure Stripe Checkout page
Use a test card from Stripe docs (e.g., 4242 4242 4242 4242)

🔒 Authentication & User Roles

Supabase Auth handles sign up, login, and session management.
Role-based access control (RBAC) can be configured via RLS (Row Level Security).
Admin users can manage products/orders.
