# CareConnect — Backend (Milestone 1: Days 1–6)

Django + Django REST Framework backend for **Resident, Society & Emergency
Contact Management**. Covers the full Milestone 1 task plan:

| Day | Feature |
|---|---|
| 1 | Project setup: Django + DRF, apps (`users`, `society`, `emergency`), Swagger docs |
| 2 | Custom `User` model with `role`, JWT auth (login/logout/refresh) |
| 3 | Role-specific registration (Resident/Guardian/Volunteer/Security) + OTP stub |
| 4 | Society / Block / Flat CRUD with search & filter |
| 5 | Resident-flat mapping, admin/security approval workflow, resident directory |
| 6 | Primary/Secondary Guardian + Emergency Contact CRUD, OTP verification |

## 1. Setup

```bash
python -m venv venv
source venv/bin/activate          # venv\Scripts\activate on Windows
pip install -r requirements.txt

cp .env.example .env              # then edit DB_* values for your Postgres instance
# create the Postgres database first, e.g.: createdb careconnect_db

python manage.py migrate
python manage.py createsuperuser  # role will default to '' — set role=ADMIN via /admin/ or shell
python manage.py runserver
```

Swagger docs: `http://localhost:8000/swagger/`
Admin panel: `http://localhost:8000/admin/`

> Note: the very first Admin user must be created via `createsuperuser` +
> manually setting `role='ADMIN'` (self-registration as Admin is blocked by
> design — see `RegisterSerializer.validate_role`).

## 2. API Reference

### Auth (`/api/auth/`)
| Method | Endpoint | Who | Notes |
|---|---|---|---|
| POST | `register/` | Anyone | `{username, email, phone_number, first_name, last_name, role, password, confirm_password, profile:{...}}` |
| POST | `login/` | Anyone | `{username, password}` → `{access, refresh, role, approval_status}` |
| POST | `token/refresh/` | Anyone | `{refresh}` → new `access` |
| POST | `logout/` | Authenticated | `{refresh}` — blacklists the token |
| POST | `verify-otp/` | Anyone | `{user_id, code, purpose}` |
| GET/PATCH | `me/` | Authenticated | Own profile |

`profile` shape depends on `role`:
- `RESIDENT`: `{society, block, flat, date_of_birth, is_dependent}`
- `GUARDIAN`: `{relationship_to_resident, occupation}`
- `VOLUNTEER`: `{society, skills, is_available}`
- `SECURITY`: `{society, shift_start, shift_end, badge_number}`

### Society (`/api/society/`)
| Method | Endpoint | Who |
|---|---|---|
| GET/POST | `societies/` | GET: any authenticated · POST/PATCH/DELETE: Admin |
| GET/POST | `blocks/?society=<id>&search=` | same |
| GET/POST | `flats/?block=<id>&search=` | same |
| POST | `resident-mapping/` | Resident — submit society/block/flat |
| GET | `resident-approvals/?status=PENDING` | Admin/Security dashboard |
| PATCH | `resident-approvals/<id>/review/` | Admin/Security — `{status: APPROVED\|REJECTED, rejection_reason}` |
| GET | `resident-directory/?search=` | Any authenticated — approved residents only |

### Emergency (`/api/emergency/`)
| Method | Endpoint | Who |
|---|---|---|
| GET/POST | `contacts/` | Resident manages own; Admin/Security read-only |
| GET/PATCH/DELETE | `contacts/<id>/` | Owning resident only |
| POST | `contacts/<id>/send-otp/` | `{channel: PHONE\|EMAIL}` |
| POST | `contacts/<id>/verify-otp/` | `{channel, code}` |

`contact_type`: `PRIMARY_GUARDIAN` / `SECONDARY_GUARDIAN` / `OTHER` — a
resident can only have **one** Primary and **one** Secondary Guardian
(enforced both at the API and DB level).

## 3. What's mocked (by design, per the task plan)

- **OTP delivery** — codes are generated and returned in the API response
  (`debug_code`) instead of being sent via SMS/email. Real SMS
  (Twilio/MSG91) and email (SendGrid) integration happens in **Day 9**.
- **Notifications on approval/rejection** — will be wired into the
  Notification Engine in Milestone 2.

## 4. Tested flow

This project was verified end-to-end (register → login → society/block/flat
setup by admin → resident submits mapping → admin approves → resident
appears in directory → resident adds & OTP-verifies a primary guardian),
including the duplicate-guardian rejection path.

## 5. Next (Milestone 2 preview)

Day 7 onward builds the SOS alert model, notification engine (FCM/SMS/email),
and guardian escalation on top of this foundation — the `linked_user` field
on `EmergencyContact` and `is_available` on `VolunteerProfile` are already in
place to support that.
