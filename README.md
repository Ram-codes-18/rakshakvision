# RakshakVision – AI-Based Video Analytics for Border Surveillance

> **SIH 2026 Problem Statement ID:** 26187  
> **Core USP:** Existing IP CCTV + Border Context + Multi-Camera Correlation + Edge Resilience

RakshakVision is a high-fidelity, military-grade Command & Control (SOC) platform designed for border surveillance using existing IP-CCTV camera infrastructure. The platform provides human operators with automated threat scoring, cross-camera target trajectory correlation, virtual fence breach detection, ANPR, and edge resilience.

---

## 1. System Architecture

```
Existing IP CCTV (RTSP)
       ↓
Edge AI Node (YOLOv8 / OpenCV / ByteTrack)
       ↓
Object Detection & Feature Vector Extraction
       ↓
Multi-Camera Correlation Engine
       ↓
Threat Fusion Engine (0 - 100 Composite Score)
       ↓
FastAPI Backend (REST + WebSockets)
       ↓
Command & Control Dashboard (React + Tailwind)
```

---

## 2. Key Features & USPs

1. **Multi-Camera Spatiotemporal Correlation:**
   - Tracks target `#P104` seamlessly across non-overlapping camera fields of view (`CAM-02` → `CAM-03` → `CAM-05`).
   - Calculates speed, travel time delta (+8s, +11s), and movement direction vector (`NORTH → SOUTH`).

2. **Threat Fusion Engine:**
   - Evaluates multi-factor risk: Location Risk (30%), Movement Vector (20%), Time Penalty (15%), Behavior Dwell Time (20%), and Correlation Match (15%).
   - Dynamic 0-100 score gauge with real-time severity classification (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).

3. **Border-Aware Virtual Fence:**
   - Polygon boundary zones: Restricted Zone, Buffer Zone, Safe Zone.
   - Vector direction rules (`IF Object = Person AND Zone = Restricted AND Vector = SOUTH THEN Alert = CRITICAL`).

4. **Edge Node Resilience & Store-and-Forward:**
   - Local edge nodes continue AI detection during primary network failures.
   - Automatic event caching in local queue (`STORE-AND-FORWARD ACTIVE`) with zero data loss upon reconnection.

5. **ANPR & Authorized Face Verification:**
   - License plate recognition with watchlist matching (`JK02AB1234`).
   - Policy-controlled face verification module with cryptographic audit logging.

6. **SIH Presentation Demo Engine:**
   - Interactive scenario controls (▶ Start Demo, ⏸ Pause, ↻ Reset).
   - 4 pre-loaded judge demonstration scenarios.

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas API, Recharts
- **Backend:** Python 3.13 / 3.9, FastAPI, Uvicorn, WebSockets, SQLite3
- **Simulation Layer:** Real-time event generator, OpenCV/YOLO-compatible bounding box telemetry
- **Database:** SQLite (Local Demo) / PostgreSQL (Production Architecture)

---

## 4. Quickstart Guide (Running the Application)

### Running the Full-Stack Application

1. **Start the FastAPI Backend & Web Server:**
   ```bash
   cd backend
   /opt/miniconda3/bin/python3 main.py
   # or
   /opt/miniconda3/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the Command Dashboard:**
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## 5. API Endpoints

- `GET /api/cameras` - Retrieve all registered camera nodes
- `GET /api/alerts` - List active and historical alerts
- `GET /api/incidents/{id}` - Fetch incident evidence, hash, and timeline
- `POST /api/incidents/{id}/acknowledge` - Acknowledge incident threat
- `POST /api/incidents/{id}/resolve` - Resolve incident
- `GET /api/edge-nodes` - Retrieve edge node telemetry
- `POST /api/threat-fusion/calculate` - Run Threat Fusion Engine calculation
- `WS /ws/events` - Real-time WebSocket event feed

---

## 6. Real RTSP & AI Integration Points

To connect real IP cameras and YOLOv8 models in production:
1. Replace `SimulationEngine` in `backend/simulation.py` with an OpenCV `cv2.VideoCapture("rtsp://...")` pipeline.
2. Pass frame matrices to `ultralytics.YOLO("yolov8n.pt")`.
3. Feed object bounding box embeddings to `correlation_engine.py` for real-time target matching.
