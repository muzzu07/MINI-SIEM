from datetime import datetime, timedelta


def create_alert(
    db,
    rule_name,
    severity,
    source_ip,
    host,
    description,
    attempts=1,
    mitre_technique=None
):
    """
    Create a new alert if an active alert for the same
    rule + source IP + host does not already exist.
    """

    existing = db.alerts.find_one({
        "rule_name": rule_name,
        "source_ip": source_ip,
        "host": host,
        "status": {
            "$nin": ["RESOLVED", "CLOSED"]
        }
    })

    if existing:

        db.alerts.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "last_seen": datetime.utcnow(),
                    "attempts": attempts
                }
            }
        )

        return existing["_id"]


    alert = {
        "rule_name": rule_name,
        "severity": severity,
        "source_ip": source_ip,
        "host": host,
        "status": "NEW",
        "description": description,
        "attempts": attempts,
        "mitre_technique": mitre_technique,
        "detected_at": datetime.utcnow(),
        "last_seen": datetime.utcnow()
    }


    result = db.alerts.insert_one(alert)

    return result.inserted_id


# ============================================================
# SSH BRUTE FORCE
# MITRE ATT&CK: T1110 - Brute Force
# ============================================================

def detect_brute_force(db, event):

    if event.get("event_type") != "authentication_failure":
        return


    source_ip = event.get("source_ip")
    host = event.get("host")


    if not source_ip:
        return


    five_minutes_ago = (
        datetime.utcnow() -
        timedelta(minutes=5)
    )


    attempts = db.events.count_documents({

        "event_type": "authentication_failure",

        "source_ip": source_ip,

        "timestamp": {
            "$gte": five_minutes_ago
        }

    })


    if attempts >= 5:

        create_alert(

            db=db,

            rule_name="SSH Brute Force",

            severity="HIGH",

            source_ip=source_ip,

            host=host,

            attempts=attempts,

            description=(
                f"{attempts} failed authentication attempts "
                f"detected from {source_ip} within 5 minutes"
            ),

            mitre_technique="T1110"

        )


# ============================================================
# NETWORK PORT SCAN
# MITRE ATT&CK: T1046 - Network Service Scanning
# ============================================================

def detect_port_scan(db, event):

    if event.get("event_type") not in [
        "port_scan",
        "network_scan",
        "connection_scan"
    ]:
        return


    source_ip = event.get("source_ip")
    host = event.get("host")


    create_alert(

        db=db,

        rule_name="Network Port Scan",

        severity="MEDIUM",

        source_ip=source_ip,

        host=host,

        description=(
            f"Network scanning activity detected "
            f"from {source_ip}"
        ),

        mitre_technique="T1046"

    )


# ============================================================
# SUSPICIOUS POWERSHELL
# MITRE ATT&CK: T1059.001 - PowerShell
# ============================================================

def detect_powershell(db, event):

    event_type = event.get(
        "event_type",
        ""
    ).lower()


    command = event.get(
        "command",
        ""
    ).lower()


    if (
        event_type == "powershell"
        or "powershell" in command
        or "powershell.exe" in command
    ):

        create_alert(

            db=db,

            rule_name="Suspicious PowerShell",

            severity="HIGH",

            source_ip=event.get("source_ip"),

            host=event.get("host"),

            description=(
                "PowerShell execution detected "
                "on endpoint"
            ),

            mitre_technique="T1059.001"

        )


# ============================================================
# PRIVILEGE ESCALATION
# MITRE ATT&CK: T1068 - Exploitation for Privilege Escalation
# ============================================================

def detect_privilege_escalation(db, event):

    event_type = event.get(
        "event_type",
        ""
    ).lower()


    if event_type not in [
        "privilege_escalation",
        "admin_privilege",
        "sudo",
        "root_login"
    ]:
        return


    create_alert(

        db=db,

        rule_name="Privilege Escalation",

        severity="CRITICAL",

        source_ip=event.get("source_ip"),

        host=event.get("host"),

        description=(
            "Potential privilege escalation "
            "activity detected"
        ),

        mitre_technique="T1068"

    )


# ============================================================
# NEW ACCOUNT
# MITRE ATT&CK: T1136 - Create Account
# ============================================================

def detect_new_account(db, event):

    event_type = event.get(
        "event_type",
        ""
    ).lower()


    if event_type not in [
        "account_created",
        "new_user",
        "user_created"
    ]:
        return


    create_alert(

        db=db,

        rule_name="New Account Created",

        severity="MEDIUM",

        source_ip=event.get("source_ip"),

        host=event.get("host"),

        description=(
            "A new user account creation "
            "event was detected"
        ),

        mitre_technique="T1136"

    )


# ============================================================
# DETECTION ENGINE
# ============================================================

def analyze_event(db, event):

    detect_brute_force(
        db,
        event
    )


    detect_port_scan(
        db,
        event
    )


    detect_powershell(
        db,
        event
    )


    detect_privilege_escalation(
        db,
        event
    )


    detect_new_account(
        db,
        event
    )