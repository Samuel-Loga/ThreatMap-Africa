# 🌍 ThreatMap Africa

A web-based threat intelligence sharing platform purpose-built for Africa's cybersecurity community. The platform enables security practitioners across the continent to collaboratively report, enrich, and consume threat indicators with African context, filling a critical gap left by Western-centric global threat intelligence feeds.

**African Cyber Threat Intelligence Platform**  
*Empowering Africa's cybersecurity community with localized, actionable, and collaborative threat intelligence.*

---

## 🔗 Live Access
The platform is deployed and accessible at:  
**🌐 [http://159.89.94.93/](http://159.89.94.93/)**

---

## 📖 What it Does
ThreatMap Africa is a purpose-built platform designed to fill the gap left by Western-centric threat feeds. It allows security practitioners across the continent to:
*   **Submit & Share:** Report Indicators of Compromise (IOCs) such as malicious IPs, domains, and file hashes with specific African context (e.g., Mobile Money Fraud, SIM Swap).
*   **Automated Enrichment:** Automatically query external sources like VirusTotal, AbuseIPDB, and Shodan to score threats in real-time.
*   **Localized Visualization:** 
    *   **Africa Threat Heatmap:** Interactive map showing threat density across the continent.
    *   **Severity Distribution:** Real-time doughnut charts tracking Critical, High, Medium, and Low severity threats.
    *   **Indicator Composition:** Visual breakdown of threat types (IPs, Domains, URLs, etc.).
*   **STIX/TAXII Support:** Export data in industry-standard formats for integration with existing SIEM/SOAR tools.

---

## 🛠 Tech Stack
*   **Frontend:** React 18, Vite, Tailwind CSS, Leaflet (Mapping), Recharts (Advanced Analytics).
*   **Backend:** FastAPI (Python), SQLAlchemy 2.0 (Async), Pydantic v2.
*   **Processing:** Celery + Redis (Background Tasks), WebSocket (Real-time updates).
*   **Database:** PostgreSQL 15.
*   **Proxy:** Nginx.

---

## 🚀 How to Set It Up Locally

### 1. Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
*   Optional: API Keys for VirusTotal and AbuseIPDB (set in `.env`).

### 2. Configure Environment
Copy the example environment file:
```cmd
copy .env.example .env
```
Open `.env` and set at minimum:
```env
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_random_32_char_string
```

### 3. Launch the Platform
```cmd
docker-compose up --build
```
The local platform will be available at: **`http://localhost`**

---

## 🧪 Development & Testing

### Populate Dummy Data (African Context)
To visualize the dashboard with realistic data, run the seeding script:
```cmd
docker-compose exec api python seed_data.py
```
This generates 150+ indicators across countries like Nigeria, Kenya, South Africa, and Ghana, focusing on sectors like Banking and Telecom.

### Default Admin Credentials
If seeded, you can login with:
*   **User:** `admin@threatmap.africa`
*   **Pass:** `admin1234`

---

## 🤝 Contributing
Contributions are welcome! Please ensure you follow the Traffic Light Protocol (TLP) guidelines when sharing sensitive threat data within the platform.

---
*Built for Africa, by Africa.*
