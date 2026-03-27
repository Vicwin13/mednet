<div align="center">

# MedNet

**Book verified hospital consultations and pay securely — funds only release after your appointment is done.**
</div>

---

## What is MedNet?

MedNet is a home healthcare platform that enables patients to request verified hospital staff for in-home medical care. Patients can discover trusted hospitals, schedule home visits, and make secure payments seamlessly. Payments are held in escrow and only released after care is delivered, ensuring transparency and trust for both patients and providers.

There are two types of users:

- **Patients** — browse hospitals, book appointments, pay securely, verify identity with NIN
- **Hospitals** — get listed, receive verified patients, get paid after confirmed appointments

---

## Live Demo

🔗 [https://mednet-p5ctp1ot8-vicwin13s-projects.vercel.app/](https://mednet-p5ctp1ot8-vicwin13s-projects.vercel.app/)

### Test Accounts

Use these to explore the app without signing up.

**Patient**
| | |
|---|---|
| Email | `vwinner13@gmail.com` |
| Password | `Test1234` |

**Hospital**
| | |
|---|---|
| Email | `victorwinner98@gmail.com` |
| Password | `Test1234` |

---

## Features

**Patients**
- Sign up and verify your identity with your NIN
- Search hospitals by name, specialty, or location
- Book a consultation and choose a time slot
- Pay into a secure wallet — money held until appointment completes
- Manage your profile, appointments, and payment history

**Hospitals**
- Register and get manually verified by the MedNet team
- Appear in the hospital listing with your specialties and rating
- Receive funds in your wallet after appointments are confirmed
- Manage bookings and staff

---

## Project Structure

```
app/
├── page.tsx                          # Landing page
├── auth/
│   └── page.tsx                      # Login / Signup
└── dashboard/
    ├── patient/
    │   ├── hospitals/                # Browse & book hospitals
    │   ├── appointments/             # Appointment history
    │   ├── settings/                 # Profile & NIN verification
    │   └── wallet/                   # Patient wallet (send payment)
    └── hospital/
        ├── hospital-wallet/          # Hospital wallet (receive payment)
        ├── requests/                 # Incoming booking requests
        └── staffs/                   # Staff management

components/        # Reusable UI components
context/           # Global auth state (AuthContext)
lib/               # Supabase client + Interswitch token manager
data/              # Static data and TypeScript types
types/             # Shared TypeScript interfaces
```

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Auth & Database | Supabase |
| Payments | Interswitch (wallet & NIN verification) |
| Deployment | Vercel |

---

## Running Locally

### 1. Clone and install

```bash
git clone https://github.com/Vicwin13/mednet.git
cd mednet
npm install
```

### 2. Create `.env.local` in the project root

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Interswitch
INTERSWITCH_CLIENT_ID=your_client_id
INTERSWITCH_CLIENT_SECRET=your_client_secret
INTERSWITCH_MERCHANT_CODE=your_merchant_code
```

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database (Supabase)

The app uses a single `profiles` table. It is created automatically when a user signs up via a Supabase database trigger.

```sql
create table profiles (
  id            uuid references auth.users on delete cascade primary key,
  role          text,          -- 'patient' or 'hospital'
  firstname     text,
  lastname      text,
  hospitalname  text,
  phone_number  text,
  dob           date,
  address       text,
  nin           int8,
  profile_image text,
  verified      boolean default false,
  created_at    timestamptz default now()
);

-- Row level security (users can only access their own data)
alter table profiles enable row level security;

create policy "Own profile only" on profiles
  for all using (auth.uid() = id);
```

---

## How the Wallet Works

Interswitch provides a **merchant wallet** — this is MedNet's central wallet. We use it to simulate the full payment flow:

1. **Patient pays** → funds go into MedNet's merchant wallet
2. **Appointment is confirmed** → MedNet releases the funds
3. **Hospital receives** → payout is recorded to the hospital's simulated wallet

This approach lets us demonstrate a real escrow flow using Interswitch's available APIs, while hospital and patient wallet balances are tracked in Supabase.

---

## NIN Verification

When a patient enters their NIN, MedNet sends it to the **Interswitch Identity Verification API** through a secure server-side route (`/api/nin-verification`). If the name matches, the patient's profile is marked as verified. The API credentials never touch the browser.

---

## Built For

**Enyata Buildathon 2025**

---

## Authors

**Victor Nwimo**
vnwimo13@gmail.com
Frontend Developer: Worked on creating the supabase, the hospital UI and transactions on the app

**Gerlad Nnaji Chibuzor**
Geraldnnaji55@gmail.com
Designer: Work on creating the designs and the work flow of the project

**Fatima Oyiza Jimoh**
fatimaoyiza18@gmail.com
Frontend Developer: Worked on the UI also, the patients UI, authentication and others.

---

<div align="center">
  <sub><a href="https://mednet-p5ctp1ot8-vicwin13s-projects.vercel.app/">MedNet</a></sub>
</div>
