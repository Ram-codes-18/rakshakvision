"""
RakshakVision - FastAPI Backend Entrypoint
Provides REST endpoints, WebSockets, SQLite integration, and static SPA serving.
"""

import sqlite3
import json
import asyncio
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import os

from models import init_db
from threat_fusion import ThreatFusionEngine
from correlation_engine import MultiCameraCorrelationEngine
from simulation import sim_engine

# Initialize DB
DB_PATH = "rakshakvision.db"
init_db(DB_PATH)

app = FastAPI(
    title="RakshakVision API",
    description="AI-Based Video Analytics for Border Surveillance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

correlation_engine = MultiCameraCorrelationEngine()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# WebSocket Loop Task
@app.on_event("startup")
async def startup_event():
    async def bg_simulator():
        while True:
            await asyncio.sleep(2.0)
            if manager.active_connections:
                event = await sim_engine.generate_event()
                await manager.broadcast(event)
    asyncio.create_task(bg_simulator())

# API Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "OPERATIONAL", "system": "RakshakVision SOC", "version": "1.0.0"}

@app.get("/api/cameras")
def get_cameras():
    conn = get_db()
    rows = conn.execute("SELECT * FROM cameras").fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/cameras/{camera_id}")
def get_camera(camera_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM cameras WHERE id = ?", (camera_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Camera not found")
    return dict(row)

@app.get("/api/alerts")
def get_alerts():
    conn = get_db()
    rows = conn.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50").fetchall()
    conn.close()
    if not rows:
        # Return default realistic alerts for demo
        return [
            {
                "id": "ALT-9041",
                "severity": "CRITICAL",
                "title": "Restricted Zone Virtual Fence Breach",
                "description": "Target #P104 crossed virtual fence vector SOUTH into Restricted Sector C1.",
                "camera_id": "CAM-05",
                "timestamp": "22:41:27",
                "threat_score": 87,
                "status": "ACTIVE",
                "target_id": "PERSON #P104",
                "zone": "Restricted Zone"
            },
            {
                "id": "ALT-9040",
                "severity": "HIGH",
                "title": "Multi-Camera Tracking Escalation",
                "description": "Target #P104 correlated across CAM-02 -> CAM-03 (+8s interval).",
                "camera_id": "CAM-03",
                "timestamp": "22:41:16",
                "threat_score": 68,
                "status": "ACTIVE",
                "target_id": "PERSON #P104",
                "zone": "Buffer Zone"
            },
            {
                "id": "ALT-9038",
                "severity": "MEDIUM",
                "title": "Watchlist Vehicle Detected",
                "description": "ANPR match on vehicle plate JK02AB1234 at Checkpoint Bravo.",
                "camera_id": "CAM-04",
                "timestamp": "21:18:43",
                "threat_score": 52,
                "status": "ACKNOWLEDGED",
                "target_id": "VEHICLE JK02AB1234",
                "zone": "Safe Zone"
            }
        ]
    return [dict(row) for row in rows]

@app.get("/api/incidents")
def get_incidents():
    return [
        {
            "id": "INC-2026-0914-0042",
            "alert_id": "ALT-9041",
            "title": "Critical Restricted Fence Intrusion",
            "threat_score": 87,
            "threat_level": "CRITICAL",
            "status": "ACTIVE",
            "created_at": "2026-09-14 22:41:29",
            "camera_id": "CAM-05",
            "target_id": "PERSON #P104",
            "direction": "NORTH → SOUTH",
            "evidence_url": "/assets/evidence_inc_0042.jpg",
            "correlated_cameras": ["CAM-02", "CAM-03", "CAM-05"],
            "timeline": [
                {"timestamp": "22:41:08", "event": "Target #P104 detected near outer perimeter", "camera": "CAM-02", "score": 45},
                {"timestamp": "22:41:16", "event": "Spatiotemporal track match established", "camera": "CAM-03", "score": 68},
                {"timestamp": "22:41:27", "event": "Virtual fence breached into Restricted Zone", "camera": "CAM-05", "score": 87},
                {"timestamp": "22:41:28", "event": "Threat Fusion Engine raised severity to CRITICAL", "camera": "SYSTEM", "score": 87},
                {"timestamp": "22:41:29", "event": "CRITICAL alert dispatched to SOC Commander", "camera": "SYSTEM", "score": 87}
            ]
        }
    ]

@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: str):
    incidents = get_incidents()
    for inc in incidents:
        if inc["id"] == incident_id:
            return inc
    return incidents[0]

@app.post("/api/incidents/{incident_id}/acknowledge")
def acknowledge_incident(incident_id: str):
    conn = get_db()
    conn.execute(
        "INSERT INTO audit_logs (timestamp, operator, role, action, incident_id, result) VALUES (datetime('now'), 'Operator 01', 'OPERATOR', 'Acknowledged Incident', ?, 'SUCCESS')",
        (incident_id,)
    )
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "incident_id": incident_id, "new_state": "ACKNOWLEDGED"}

@app.post("/api/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: str):
    conn = get_db()
    conn.execute(
        "INSERT INTO audit_logs (timestamp, operator, role, action, incident_id, result) VALUES (datetime('now'), 'Commander 02', 'COMMANDER', 'Resolved Incident', ?, 'SUCCESS')",
        (incident_id,)
    )
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "incident_id": incident_id, "new_state": "RESOLVED"}

@app.get("/api/edge-nodes")
def get_edge_nodes():
    conn = get_db()
    rows = conn.execute("SELECT * FROM edge_nodes").fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/anpr")
def get_anpr():
    conn = get_db()
    rows = conn.execute("SELECT * FROM anpr_events ORDER BY timestamp DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/audit")
def get_audit():
    conn = get_db()
    rows = conn.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50").fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/correlation/track/{target_id}")
def get_correlation_track(target_id: str):
    return correlation_engine.get_track(target_id)

@app.post("/api/threat-fusion/calculate")
def calculate_threat(payload: dict):
    return ThreatFusionEngine.calculate_score(
        location_zone=payload.get("zone", "Restricted Zone"),
        direction=payload.get("direction", "NORTH → SOUTH"),
        time_hour=payload.get("time_hour", 22),
        object_type=payload.get("object_type", "PERSON"),
        multi_camera_match=payload.get("multi_camera_match", True),
        dwell_time_seconds=payload.get("dwell_time", 15)
    )

# WebSocket Endpoint
@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Serve frontend static files

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

@app.get("/", response_class=HTMLResponse)
def read_root():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>RakshakVision SOC API is Running</h1>"

@app.get("/{filename:path}")
def serve_frontend_files(filename: str):
    # Ignore API routes
    if filename.startswith("api/") or filename.startswith("ws/"):
        raise HTTPException(status_code=404, detail="Not Found")
    file_path = os.path.join(frontend_dir, filename)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="File not found")

