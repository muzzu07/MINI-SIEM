# Mini SIEM — SOC Analyst Platform

A lightweight Security Information and Event Management (SIEM) platform built to demonstrate an L1 SOC analyst workflow: telemetry ingestion, event storage, rule-based detection, alert management, investigation, and MITRE ATT&CK mapping.

## Features

- FastAPI event ingestion
- MongoDB event and alert storage
- React/Vite SOC dashboard
- Event Explorer with filtering
- Rule-based detection engine
- Automated alert generation
- Severity classification
- Alert status workflow
- Alert investigation with related events
- MITRE ATT&CK technique mapping
- Security telemetry / attack simulation collector

## Architecture

```text
Collector
   |
   v
FastAPI /api/events
   |
   +----> MongoDB events
   |
   v
Detection Engine
   |
   v
MongoDB alerts
   |
   +----> Dashboard
   +----> Alerts
   +----> Investigation
```

## Detection Rules

| Detection | Severity | MITRE ATT&CK |
|---|---|---|
| SSH Brute Force | HIGH | T1110 |
| Network Port Scan | MEDIUM | T1046 |
| Suspicious PowerShell | HIGH | T1059.001 |
| Privilege Escalation | CRITICAL | T1068 |
| New Account Created | MEDIUM | T1136 |

## Tech Stack

- Python
- FastAPI
- MongoDB
- MongoDB Compass
- React
- Vite
- Tailwind CSS
- REST API
- Python Requests

## Project Structure

```text
mini-siem/
├── backend/
│   ├── main.py
│   ├── detection_engine.py
│   └── venv/
├── collector/
│   └── collector.py
└── frontend/
    └── src/
        ├── App.jsx
        ├── Events.jsx
        ├── Alerts.jsx
        └── Investigation.jsx
```

## Running Locally

### Backend

```powershell
cd "C:\Users\Muzammil\Desktop\SOC PRO\mini-siem\backend"
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8001
```

### Frontend

```powershell
cd "C:\Users\Muzammil\Desktop\SOC PRO\mini-siem\frontend"
npm run dev
```

### Collector

```powershell
cd "C:\Users\Muzammil\Desktop\SOC PRO\mini-siem\collector"
python collector.py
```

MongoDB should be running locally at:

```text
mongodb://localhost:27017
```

Database:

```text
mini_siem
```

Collections:

```text
events
alerts
```

## SOC Workflow

1. Collector generates security telemetry.
2. Collector sends events to FastAPI.
3. FastAPI normalizes timestamps and stores events in MongoDB.
4. The detection engine analyzes the incoming event.
5. Matching rules create or update alerts.
6. React displays dashboard and alert information.
7. The analyst opens an alert for investigation.
8. Related events are reviewed and the alert status can be updated.

## Important API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health check |
| POST | `/api/events` | Ingest event and run detection |
| GET | `/api/events` | Query events |
| GET | `/api/alerts` | List alerts |
| GET | `/api/alerts/{id}` | Get an alert |
| PATCH | `/api/alerts/{id}/status` | Update alert status |
| GET | `/api/dashboard/overview` | Dashboard metrics |
| POST | `/api/detection/run` | Run detection against existing events |
| GET | `/api/detection/rules` | List detection rules |

## Resume Description

**Mini SIEM — SOC Analyst Platform**  
*Python, FastAPI, MongoDB, React, Tailwind CSS*

- Built a lightweight SIEM platform for centralized security-event ingestion, detection, alerting, and SOC analyst investigation.
- Developed a FastAPI/MongoDB pipeline for collecting and querying security telemetry.
- Implemented rule-based detections for brute-force authentication, suspicious PowerShell, network scanning, privilege escalation, and account creation.
- Built a React SOC dashboard with event filtering, alert management, investigation workflows, severity analysis, and live MongoDB metrics.
- Mapped detections to MITRE ATT&CK techniques and developed a telemetry collector for simulated security activity.

## Scope

This project is intentionally lightweight and designed as a portfolio/lab SIEM for SOC analyst learning. It does not attempt to replace production SIEM platforms such as Splunk, Microsoft Sentinel, or Elastic Security.

## Disclaimer

Use the attack/telemetry simulation only in authorized lab environments.
