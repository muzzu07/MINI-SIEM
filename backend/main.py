from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime
from typing import Optional
import os

from dotenv import load_dotenv
from bson import ObjectId

from detection_engine import analyze_event

load_dotenv()


app = FastAPI()


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mini_siem")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not configured")

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Mini SIEM Backend is running"
    }


# ============================================================
# TEST DATABASE
# ============================================================

@app.get("/api/test-db")
def test_database():

    event = {
        "timestamp": datetime.utcnow(),
        "event_type": "authentication_failure",
        "username": "admin",
        "source_ip": "192.168.1.50",
        "host": "WIN-01"
    }

    db.events.insert_one(event)

    return {
        "message": "Event inserted successfully"
    }


# ============================================================
# EVENT INGESTION
# ============================================================
@app.post("/api/events")
def receive_event(event: dict):

    # Normalize timestamp
    if "timestamp" not in event:
        event["timestamp"] = datetime.utcnow()

    elif isinstance(event["timestamp"], str):
        try:
            parsed_time = datetime.fromisoformat(
                event["timestamp"].replace("Z", "+00:00")
            )

            # Store UTC as a naive datetime
            if parsed_time.tzinfo is not None:
                parsed_time = parsed_time.replace(tzinfo=None)

            event["timestamp"] = parsed_time

        except ValueError:
            event["timestamp"] = datetime.utcnow()

    # Store event
    result = db.events.insert_one(event)

    # Run detection engine
    analyze_event(
        db,
        event
    )

    return {
        "message": "Event received successfully",
        "event_id": str(result.inserted_id)
    }


# ============================================================
# GET EVENTS
# ============================================================

@app.get("/api/events")
def get_events(
    source_ip: Optional[str] = None,
    event_type: Optional[str] = None
):

    query = {}

    if source_ip:
        query["source_ip"] = source_ip

    if event_type:
        query["event_type"] = event_type

    events = list(
        db.events.find(
            query,
            {
                "_id": 0
            }
        )
        .sort(
            "timestamp",
            -1
        )
        .limit(100)
    )

    return events


# ============================================================
# TEST BRUTE FORCE
# ============================================================

@app.get("/api/test-brute-force")
def test_brute_force():

    source_ip = "192.168.1.50"

    created_events = []

    for i in range(5):

        event = {
            "timestamp": datetime.utcnow(),
            "event_type": "authentication_failure",
            "username": "admin",
            "source_ip": source_ip,
            "host": "WIN-01"
        }

        db.events.insert_one(event)

        analyze_event(
            db,
            event
        )

        created_events.append(event)

    return {
        "message": "5 failed authentication events generated",
        "events_created": len(created_events)
    }


# ============================================================
# TEST ALERT
# ============================================================

@app.get("/api/test-alert")
def test_alert():

    alert = {
        "rule_name": "SSH Brute Force",
        "severity": "HIGH",
        "source_ip": "192.168.1.50",
        "host": "WIN-01",
        "status": "NEW",
        "description": "Multiple failed authentication attempts detected",
        "attempts": 5,
        "detected_at": datetime.utcnow(),
        "last_seen": datetime.utcnow()
    }

    result = db.alerts.insert_one(alert)

    return {
        "message": "Alert inserted successfully",
        "alert_id": str(result.inserted_id)
    }


# ============================================================
# GET ALERTS
# ============================================================

@app.get("/api/alerts")
def get_alerts():

    alerts = list(
        db.alerts.find(
            {}
        )
        .sort(
            "detected_at",
            -1
        )
        .limit(100)
    )

    for alert in alerts:
        alert["_id"] = str(alert["_id"])

    return alerts


# ============================================================
# GET SINGLE ALERT
# ============================================================

@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str):

    alert = db.alerts.find_one(
        {
            "_id": ObjectId(alert_id)
        }
    )

    if not alert:

        return {
            "error": "Alert not found"
        }

    alert["_id"] = str(alert["_id"])

    return alert


# ============================================================
# UPDATE ALERT STATUS
# ============================================================

@app.patch("/api/alerts/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    status: str
):

    result = db.alerts.update_one(
        {
            "_id": ObjectId(alert_id)
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    return {
        "updated": result.modified_count > 0,
        "status": status
    }


# ============================================================
# DASHBOARD OVERVIEW
# ============================================================

@app.get("/api/dashboard/overview")
def dashboard_overview():

    # Total events

    total_events = db.events.count_documents({})


    # Active alerts

    active_alerts = db.alerts.count_documents(
        {
            "status": {
                "$nin": [
                    "RESOLVED",
                    "CLOSED"
                ]
            }
        }
    )


    # Critical alerts

    critical_alerts = db.alerts.count_documents(
        {
            "severity": "CRITICAL",
            "status": {
                "$nin": [
                    "RESOLVED",
                    "CLOSED"
                ]
            }
        }
    )


    # Unique monitored hosts

    hosts = db.events.distinct("host")

    monitored_hosts = len(
        [
            host
            for host in hosts
            if host
        ]
    )


    # Alert severity

    severity_results = list(
        db.alerts.aggregate(
            [
                {
                    "$group": {
                        "_id": "$severity",
                        "count": {
                            "$sum": 1
                        }
                    }
                }
            ]
        )
    )


    severity = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
    }


    for item in severity_results:

        if item["_id"] in severity:

            severity[
                item["_id"]
            ] = item["count"]


    # Top source IPs

    top_ips = list(
        db.events.aggregate(
            [

                {
                    "$match": {
                        "source_ip": {
                            "$exists": True,
                            "$ne": ""
                        }
                    }
                },

                {
                    "$group": {
                        "_id": "$source_ip",
                        "events": {
                            "$sum": 1
                        }
                    }
                },

                {
                    "$sort": {
                        "events": -1
                    }
                },

                {
                    "$limit": 5
                }

            ]
        )
    )


    top_source_ips = [

        {
            "ip": item["_id"],
            "events": item["events"]
        }

        for item in top_ips

    ]


    return {

        "total_events": total_events,

        "active_alerts": active_alerts,

        "critical_alerts": critical_alerts,

        "monitored_hosts": monitored_hosts,

        "severity": severity,

        "top_source_ips": top_source_ips

    }


# ============================================================
# OLD DASHBOARD ENDPOINTS
# ============================================================

@app.get("/api/dashboard/stats")
def dashboard_stats():

    total_events = db.events.count_documents({})

    return {
        "total_events": total_events
    }


@app.get("/api/dashboard/alerts")
def dashboard_alerts():

    active_alerts = db.alerts.count_documents(
        {
            "status": {
                "$in": [
                    "NEW",
                    "OPEN",
                    "INVESTIGATING"
                ]
            }
        }
    )

    return {
        "active_alerts": active_alerts
    }


# ============================================================
# DETECTION ENGINE
# ============================================================

@app.post("/api/detection/run")
def run_detection():

    events = list(
        db.events.find(
            {}
        )
        .sort(
            "timestamp",
            -1
        )
        .limit(500)
    )


    alerts_before = db.alerts.count_documents({})


    for event in events:

        analyze_event(
            db,
            event
        )


    alerts_after = db.alerts.count_documents({})


    return {

        "message": "Detection scan completed",

        "events_analyzed": len(events),

        "new_alerts": (
            alerts_after -
            alerts_before
        )

    }


# ============================================================
# DETECTION RULES
# ============================================================

@app.get("/api/detection/rules")
def detection_rules():

    return {

        "rules": [

            {
                "name": "SSH Brute Force",
                "severity": "HIGH",
                "description": (
                    "5+ failed authentication attempts "
                    "within 5 minutes"
                )
            },

            {
                "name": "Network Port Scan",
                "severity": "MEDIUM",
                "description": (
                    "Network scanning activity detected"
                )
            },

            {
                "name": "Suspicious PowerShell",
                "severity": "HIGH",
                "description": (
                    "PowerShell execution detected"
                )
            },

            {
                "name": "Privilege Escalation",
                "severity": "CRITICAL",
                "description": (
                    "Potential privilege escalation activity"
                )
            },

            {
                "name": "New Account Created",
                "severity": "MEDIUM",
                "description": (
                    "New user account creation detected"
                )
            }

        ]

    }