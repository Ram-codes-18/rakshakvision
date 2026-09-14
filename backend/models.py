"""
RakshakVision - Database Models & Schemas
"""
import sqlite3
import json
from datetime import datetime

def init_db(db_path="rakshakvision.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Cameras Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rtsp_url TEXT NOT NULL,
        location TEXT NOT NULL,
        zone TEXT NOT NULL,
        direction TEXT NOT NULL,
        status TEXT NOT NULL,
        fps INTEGER DEFAULT 25,
        edge_node TEXT NOT NULL,
        threat_level TEXT DEFAULT 'LOW',
        ai_active INTEGER DEFAULT 1
    )
    """)

    # Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        threat_score INTEGER NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        target_id TEXT,
        zone TEXT
    )
    """)

    # Incidents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        alert_id TEXT NOT NULL,
        title TEXT NOT NULL,
        threat_score INTEGER NOT NULL,
        threat_level TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        direction TEXT NOT NULL,
        evidence_url TEXT,
        timeline_json TEXT,
        correlated_cameras_json TEXT,
        acknowledged_by TEXT,
        acknowledged_at TEXT
    )
    """)

    # Edge Nodes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS edge_nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        cpu_usage INTEGER NOT NULL,
        gpu_usage INTEGER NOT NULL,
        latency_ms INTEGER NOT NULL,
        cameras_connected INTEGER NOT NULL,
        store_and_forward INTEGER DEFAULT 0,
        cached_events INTEGER DEFAULT 0
    )
    """)

    # Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        operator TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        incident_id TEXT,
        result TEXT NOT NULL
    )
    """)

    # ANPR Events Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS anpr_events (
        id TEXT PRIMARY KEY,
        plate_number TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        camera_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        direction TEXT NOT NULL,
        status TEXT NOT NULL,
        vehicle_type TEXT NOT NULL
    )
    """)

    # Seed Initial Data if Empty
    cursor.execute("SELECT COUNT(*) FROM cameras")
    if cursor.fetchone()[0] == 0:
        cameras_data = [
            ("CAM-01", "Sector A1 - Outer Perimeter", "rtsp://192.168.1.101/live", "Border Sector Alpha", "Safe Zone", "NORTH → SOUTH", "ONLINE", 25, "EDGE-NODE-01", "LOW", 1),
            ("CAM-02", "Sector A2 - Fence Sector", "rtsp://192.168.1.102/live", "Border Fence 12", "Buffer Zone", "NORTH → SOUTH", "ONLINE", 24, "EDGE-NODE-01", "MEDIUM", 1),
            ("CAM-03", "Sector B1 - Boundary Post", "rtsp://192.168.1.103/live", "Border Outpost 04", "Buffer Zone", "NORTH → SOUTH", "ONLINE", 25, "EDGE-NODE-01", "HIGH", 1),
            ("CAM-04", "Sector B2 - Vehicle Checkpoint", "rtsp://192.168.1.104/live", "Checkpoint Bravo", "Safe Zone", "EAST → WEST", "ONLINE", 30, "EDGE-NODE-02", "LOW", 1),
            ("CAM-05", "Sector C1 - Restricted Zone", "rtsp://192.168.1.105/live", "Restricted Line 09", "Restricted Zone", "NORTH → SOUTH", "ONLINE", 25, "EDGE-NODE-02", "CRITICAL", 1),
            ("CAM-06", "Sector C2 - Night Thermal", "rtsp://192.168.1.106/live", "Thermal Tower 02", "Restricted Zone", "NORTH → SOUTH", "ONLINE", 20, "EDGE-NODE-03", "LOW", 1),
        ]
        cursor.executemany("INSERT INTO cameras VALUES (?,?,?,?,?,?,?,?,?,?,?)", cameras_data)

    cursor.execute("SELECT COUNT(*) FROM edge_nodes")
    if cursor.fetchone()[0] == 0:
        edge_data = [
            ("EDGE-NODE-01", "Edge Unit Alpha - Sector A/B", "ONLINE", 62, 71, 24, 3, 0, 0),
            ("EDGE-NODE-02", "Edge Unit Bravo - Sector B/C", "DEGRADED", 78, 82, 118, 2, 0, 14),
            ("EDGE-NODE-03", "Edge Unit Charlie - Thermal Mesh", "ONLINE", 45, 52, 18, 1, 0, 0),
        ]
        cursor.executemany("INSERT INTO edge_nodes VALUES (?,?,?,?,?,?,?,?,?)", edge_data)

    cursor.execute("SELECT COUNT(*) FROM anpr_events")
    if cursor.fetchone()[0] == 0:
        anpr_data = [
            ("ANPR-101", "JK02AB1234", 96, "CAM-04", "2026-09-14 21:18:43", "NORTH → SOUTH", "WATCHLIST", "Heavy Truck"),
            ("ANPR-102", "DL01XY9988", 98, "CAM-04", "2026-09-14 20:45:12", "EAST → WEST", "AUTHORIZED", "Patrol SUV"),
            ("ANPR-103", "PB65CZ4321", 91, "CAM-04", "2026-09-14 19:30:05", "WEST → EAST", "UNKNOWN", "Sedan"),
        ]
        cursor.executemany("INSERT INTO anpr_events VALUES (?,?,?,?,?,?,?,?)", anpr_data)

    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    if cursor.fetchone()[0] == 0:
        audit_data = [
            (None, "2026-09-14 19:42:01", "Operator 01", "OPERATOR", "Acknowledged Alert", "INC-2026-0914-0042", "SUCCESS"),
            (None, "2026-09-14 19:43:22", "Operator 01", "OPERATOR", "Viewed Evidence Clip", "INC-2026-0914-0042", "SUCCESS"),
            (None, "2026-09-14 19:44:08", "Commander 02", "COMMANDER", "Escalated Threat to Border Patrol", "INC-2026-0914-0042", "DISPATCHED"),
        ]
        cursor.executemany("INSERT INTO audit_logs VALUES (?,?,?,?,?,?,?)", audit_data)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
