import requests
import random
import time
from datetime import datetime


API_URL = "http://127.0.0.1:8001/api/events"


HOSTS = [
    "WIN-01",
    "WIN-02",
    "Ubuntu-01"
]


USERS = [
    "admin",
    "administrator",
    "user1",
    "john"
]


SOURCE_IPS = [
    "192.168.1.25",
    "192.168.1.50",
    "10.10.10.12",
    "10.10.10.15"
]


# ============================================================
# SEND EVENT TO SIEM
# ============================================================

def send_event(event):

    try:

        response = requests.post(
            API_URL,
            json=event,
            timeout=5
        )

        print(
            f"[+] {event['event_type']} "
            f"from {event.get('source_ip')} "
            f"-> {response.status_code}"
        )

    except requests.exceptions.RequestException as error:

        print(
            f"[!] Failed to send event: {error}"
        )


# ============================================================
# NORMAL EVENTS
# ============================================================

def authentication_success():

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "authentication_success",
        "username": random.choice(USERS),
        "source_ip": random.choice(SOURCE_IPS),
        "host": random.choice(HOSTS)
    }


def authentication_failure():

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "authentication_failure",
        "username": random.choice(USERS),
        "source_ip": random.choice(SOURCE_IPS),
        "host": random.choice(HOSTS)
    }


def powershell_event():

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "powershell",
        "username": random.choice(USERS),
        "source_ip": random.choice(SOURCE_IPS),
        "host": random.choice([
            "WIN-01",
            "WIN-02"
        ]),
        "command": "powershell.exe -enc suspicious_command"
    }


def port_scan_event():

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "port_scan",
        "username": "network-scanner",
        "source_ip": random.choice(SOURCE_IPS),
        "host": random.choice(HOSTS)
    }


def privilege_escalation_event():

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "privilege_escalation",
        "username": random.choice(USERS),
        "source_ip": random.choice(SOURCE_IPS),
        "host": random.choice(HOSTS)
    }


def new_account_event():

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "account_created",
        "username": "new_user",
        "source_ip": random.choice(SOURCE_IPS),
        "host": random.choice(HOSTS)
    }


# ============================================================
# RANDOM NORMAL TELEMETRY
# ============================================================

def generate_event():

    event_type = random.choices(
        [
            "authentication_success",
            "authentication_failure",
            "powershell",
            "port_scan",
            "privilege_escalation",
            "account_created"
        ],
        weights=[
            50,
            25,
            8,
            7,
            5,
            5
        ]
    )[0]


    if event_type == "authentication_success":
        return authentication_success()


    if event_type == "authentication_failure":
        return authentication_failure()


    if event_type == "powershell":
        return powershell_event()


    if event_type == "port_scan":
        return port_scan_event()


    if event_type == "privilege_escalation":
        return privilege_escalation_event()


    if event_type == "account_created":
        return new_account_event()


# ============================================================
# ATTACK SIMULATIONS
# ============================================================

def simulate_brute_force():

    ip = "192.168.1.50"

    print()
    print("[ATTACK] SSH Brute Force")

    for i in range(7):

        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "authentication_failure",
            "username": "admin",
            "source_ip": ip,
            "host": "WIN-01"
        }

        send_event(event)

        time.sleep(1)


def simulate_powershell():

    print()
    print("[ATTACK] Suspicious PowerShell")

    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "powershell",
        "username": "administrator",
        "source_ip": "192.168.1.25",
        "host": "WIN-01",
        "command": "powershell.exe -enc suspicious_command"
    }

    send_event(event)


def simulate_port_scan():

    print()
    print("[ATTACK] Network Port Scan")

    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "port_scan",
        "username": "network-scanner",
        "source_ip": "10.10.10.50",
        "host": "Ubuntu-01"
    }

    send_event(event)


def simulate_privilege_escalation():

    print()
    print("[ATTACK] Privilege Escalation")

    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "privilege_escalation",
        "username": "user1",
        "source_ip": "10.10.10.15",
        "host": "Ubuntu-01"
    }

    send_event(event)


def simulate_new_account():

    print()
    print("[ATTACK] New Account Creation")

    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "account_created",
        "username": "backdoor_user",
        "source_ip": "192.168.1.25",
        "host": "WIN-02"
    }

    send_event(event)


# ============================================================
# MAIN COLLECTOR LOOP
# ============================================================

def main():

    print("===================================")
    print("       Mini SIEM Collector")
    print("===================================")
    print()
    print(f"Sending events to {API_URL}")
    print("Collector running...")
    print()


    while True:

        # ----------------------------------------------------
        # Normal SOC telemetry
        # ----------------------------------------------------

        for i in range(3):

            event = generate_event()

            send_event(event)

            time.sleep(2)


        # ----------------------------------------------------
        # Attack simulation
        # ----------------------------------------------------

        simulate_brute_force()

        time.sleep(3)


        simulate_powershell()

        time.sleep(3)


        simulate_port_scan()

        time.sleep(3)


        simulate_privilege_escalation()

        time.sleep(3)


        simulate_new_account()

        time.sleep(10)


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    main()