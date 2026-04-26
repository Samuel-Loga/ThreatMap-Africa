# 🌍 ThreatMap Africa

A web-based threat intelligence sharing platform purpose-built for Africa's cybersecurity community. The platform enables security practitioners across the continent to collaboratively report, enrich, and consume threat indicators with African context, filling a critical gap left by Western-centric global threat intelligence feeds.

**African Cyber Threat Intelligence Platform**  
*Empowering Africa's cybersecurity community with localized, actionable, and collaborative threat intelligence.*

---

## 📖 What it Does
ThreatMap Africa is a purpose-built platform designed to fill the gap left by Western-centric threat feeds. It allows security practitioners across the continent to:
*   **Submit & Share:** Report Indicators of Compromise (IOCs) such as malicious IPs, domains, and file hashes with specific African context (e.g., Mobile Money Fraud, SIM Swap).
*   **Automated Enrichment:** Automatically query external sources like VirusTotal, AbuseIPDB, and Shodan to score threats in real-time.
*   **African Context:** Tag threats by specific African countries and impacted sectors (Banking, Gov, etc.).
*   **STIX/TAXII Support:** Export data in industry-standard formats for integration with existing SIEM/SOAR tools.
*   **Real-time Visualization:** View a live map of threat activity across the continent.

---

## 🛠 Tech Stack
*   **Frontend:** React 18, Vite, Tailwind CSS, Leaflet (Mapping), Recharts (Analytics).
*   **Backend:** FastAPI (Python), SQLAlchemy 2.0 (Async), Pydantic v2.
*   **Processing:** Celery + Redis (Background Tasks), WebSocket (Real-time updates).
*   **Database:** PostgreSQL 15.
*   **Proxy:** Nginx.

---

## 🚀 How to Set It Up

### 1. Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on Windows/Mac/Linux.
*   Optional: API Keys for [VirusTotal](https://www.virustotal.com/) and [AbuseIPDB](https://www.abuseipdb.com/).

### 2. Configure Environment
Copy the example environment file and set your secrets:
```cmd
copy .env.example .env
```
Open `.env` and set at minimum:
```env
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_random_32_char_string
```

---

## 🏃 How to Run It

### Start the Platform
Run the following command in your terminal:
```cmd
docker-compose up --build
```
The platform will be available at: **`http://localhost`**

### Initialize a SuperAdmin (First Run)
If you need to bypass registration to explore the dashboard, run this command:
```cmd
docker-compose exec api python -c "from app.database import SyncSessionLocal; from app.models import User; from app.auth import get_password_hash; db=SyncSessionLocal(); user=User(email='admin@threatmap.africa', username='admin', hashed_password=get_password_hash('admin1234'), role='SuperAdmin', organization='ThreatMap'); db.add(user); db.commit(); print('User created successfully')"
```
*Login with `admin@threatmap.africa` / `admin1234`*

---

## 📦 Dependencies
| Component | Primary Libraries |
| :--- | :--- |
| **Backend** | `fastapi`, `uvicorn`, `sqlalchemy`, `celery`, `redis`, `stix2`, `psycopg2` |
| **Frontend** | `react`, `leaflet`, `axios`, `recharts`, `tailwindcss`, `vite` |
| **Infrastructure** | `postgres:15-alpine`, `redis:7-alpine`, `nginx:1.25-alpine` |

---

## 🤝 Contributing
Contributions are welcome! Please ensure you follow the Traffic Light Protocol (TLP) guidelines when sharing sensitive threat data within the platform.

---
*Built for Africa, by Africa.*
