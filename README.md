# MailLab

A full-stack learning project that simulates a private email platform with user authentication, two-factor authentication (2FA), and a real mail stack — built to deeply understand how email infrastructure, LDAP-based identity management, JWT security, and containerized backend services work together in a realistic environment.

---

## Stack

| Layer    | Technology                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Frontend | React · Tailwind CSS                                                                                                   |
| Backend  | Spring Boot 4.0 · Java 25 · Spring Security · Spring Data JPA · JavaMailSender · Spring LDAP · JJWT · java-otp · ZXing |
| Database | PostgreSQL                                                                                                             |
| Identity | OpenLDAP                                                                                                               |
| Mail     | Postfix (SMTP) · Dovecot (IMAP) · Mailpit (dev mail catcher)                                                           |
| Infra    | Docker Compose                                                                                                         |

---

## Project Overview

MailLab allows simulated users to:

- Register with an email address under a custom domain (`luissilvacoding.com`)
- Set up TOTP-based 2FA via Google Authenticator or Authy
- Log in securely using a JWT-based authentication flow
- Send and receive emails between local accounts

User accounts and credentials are managed through **OpenLDAP**, which serves as the central user directory — integrated with both Spring Security (for app authentication) and Postfix/Dovecot (for mail server authentication), reflecting how real mail infrastructure handles identity.

---

## Project Structure

```
maillab/
├── backend/          # Spring Boot 4.0 API
├── frontend/         # React + Tailwind CSS client
├── infra/
│   ├── ldap/         # OpenLDAP config and seed data
│   ├── postfix/      # Postfix configuration
│   └── dovecot/      # Dovecot configuration
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Development Phases

### Phase 1 — User Auth & 2FA

- User registration and login
- JWT-based authentication
- TOTP 2FA setup and verification (Google Authenticator / Authy)
- OpenLDAP as the user directory
- PostgreSQL for persistent app data

### Phase 2 — Local Mail with Mailpit

- Send emails between local accounts via JavaMailSender
- Mailpit as a dev SMTP catcher to inspect outgoing mail without real delivery

### Phase 3 — Real Mail Stack

- Replace Mailpit with Postfix (SMTP) and Dovecot (IMAP)
- LDAP-based authentication for mail server access
- Full send/receive flow between local accounts

### Phase 4 — Webmail UI

- React-based webmail interface
- Compose, inbox, and thread views
- Integrated with the JWT auth flow

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (for local frontend development)
- [Java 25](https://openjdk.org/) (for local backend development)

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

### Run with Docker Compose

```bash
docker compose up --build
```

Services will be available at:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Mailpit UI  | http://localhost:8025 |
| PostgreSQL  | localhost:5432        |
| OpenLDAP    | localhost:389         |

---

## Authentication Flow

1. User registers → account created in PostgreSQL and provisioned in OpenLDAP
2. User optionally enables TOTP 2FA → QR code generated via ZXing
3. Login → Spring Security authenticates against OpenLDAP → JWT issued
4. Protected routes require a valid JWT in the `Authorization: Bearer` header
5. If 2FA is enabled, a TOTP code is required as a second step

---

## License

This project is for educational purposes. No license applied.
