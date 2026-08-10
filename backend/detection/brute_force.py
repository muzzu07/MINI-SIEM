from datetime import datetime, timedelta


def detect_brute_force(db, source_ip):

    time_limit = datetime.utcnow() - timedelta(minutes=2)

    failed_attempts = db.events.count_documents({
        "source_ip": source_ip,
        "event_type": "authentication_failure",
        "timestamp": {
            "$gte": time_limit
        }
    })

    if failed_attempts < 5:
        return False

    # Check if an active brute-force alert already exists
    existing_alert = db.alerts.find_one({
        "rule_name": "SSH Brute Force",
        "source_ip": source_ip,
        "status": {
            "$in": ["NEW", "OPEN", "INVESTIGATING"]
        }
    })

    if existing_alert:

        db.alerts.update_one(
            {"_id": existing_alert["_id"]},
            {
                "$set": {
                    "attempts": failed_attempts,
                    "last_seen": datetime.utcnow()
                }
            }
        )

        return False

    # No active alert exists → create a new one
    alert = {
        "rule_name": "SSH Brute Force",
        "severity": "HIGH",
        "source_ip": source_ip,
        "host": "WIN-01",
        "status": "NEW",
        "attempts": failed_attempts,
        "description": (
            f"{failed_attempts} failed authentication "
            "attempts detected"
        ),
        "detected_at": datetime.utcnow(),
        "last_seen": datetime.utcnow()
    }

    db.alerts.insert_one(alert)

    return True