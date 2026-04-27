# ThreatMap Africa

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white)](http://159.89.94.93/)
[![Stack](https://img.shields.io/badge/Tech_Stack-React_%7C_FastAPI_%7C_Docker-blue?style=for-the-badge)](https://github.com/your-repo)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A web-based threat intelligence sharing platform purpose-built for Africa's cybersecurity community. The platform enables security practitioners across the continent to collaboratively report, enrich, and consume threat indicators with African context, filling a critical gap left by Western-centric global threat intelligence feeds.

---

## Deployment
The platform is currently deployed and accessible for public testing:  
**URL:** [http://159.89.94.93/](http://159.89.94.93/)

---

## Core Capabilities
ThreatMap Africa is a purpose-built platform designed to fill the gap left by Western-centric threat feeds. It allows security practitioners across the continent to:

*   **Submit & Share:** Report Indicators of Compromise (IOCs) such as malicious IPs, domains, and file hashes with specific African context (e.g., Mobile Money Fraud, SIM Swap).
*   **Automated Enrichment:** Automatically query external sources like VirusTotal, AbuseIPDB, and Shodan to score threats in real-time.
*   **Community Intelligence:** Engage in dedicated **Forums** and **Incident Comments** to discuss evolving threats with other African analysts.
*   **Localized Visualization:** 
    *   **Africa Threat Heatmap:** Interactive map showing threat density across the continent.
    *   **Severity Distribution:** Real-time analysis tracking Critical, High, Medium, and Low severity threats.
    *   **Indicator Composition:** Visual breakdown of threat types (IPs, Domains, URLs, etc.).
*   **STIX/TAXII Support:** Export data in industry-standard formats for integration with existing SIEM/SOAR tools.

---

## Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) ![Python](https://img.shields.io/badge/python-3670A0?style=flat-square&logo=python&logoColor=ffdd54) ![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=flat-square&logo=postgresql&logoColor=white) |
| **Async Tasks** | ![Celery](https://img.shields.io/badge/celery-%2337814A.svg?style=flat-square&logo=celery&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=flat-square&logo=redis&logoColor=white) |
| **Infrastructure** | ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=flat-square&logo=nginx&logoColor=white) |

---

## Local Setup

### 1. Configure Environment
```cmd
copy .env.example .env
```
Ensure `POSTGRES_PASSWORD` and `SECRET_KEY` are set in the `.env` file.

### 2. Launch Platform
```cmd
docker-compose up --build
```

### 3. Initialize Database (Mandatory)
If this is a fresh install, run the migrations to create the latest tables:
```cmd
docker-compose exec api alembic upgrade head
```

---

## Development & Seeding

### Generate Real Incident Data
To populate the dashboard with the **15+ verified African incidents** and **8 expert analyst profiles**:
```cmd
docker-compose exec api python seed_production.py
```

### Expert Analyst Logins (Post-Seeding)
*   **Usernames:** `amara_diallo`, `ngozi_okonkwo`, `sipho_ndlovu`, `fatuma_hassan`
*   **Default Password:** `threatmap2024`

---

## Contributing
Contributions are welcome. Please ensure you follow the **Traffic Light Protocol (TLP)** guidelines when sharing sensitive threat data within the platform.

---
*Built for Africa, by Africa.*
