from .brute_force import detect_brute_force


def run_detection_engine(db, event):
    """
    Run all detection rules against a newly received event.
    """

    alerts_created = []

    # -----------------------------
    # Rule 1: SSH Brute Force
    # -----------------------------

    if event.get("event_type") == "authentication_failure":

        source_ip = event.get("source_ip")

        if source_ip:

            alert_created = detect_brute_force(
                db,
                source_ip
            )

            if alert_created:
                alerts_created.append("SSH Brute Force")

    return alerts_created