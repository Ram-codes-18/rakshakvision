# RakshakVision - Technical Architecture & Data Pipeline

```
┌─────────────────────────────────────────────────────────┐
│              Existing IP CCTV Infrastructure            │
│         (RTSP Video Streams / Thermal Sensors)          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 RTSP Stream Ingestion                   │
│           (H.264/H.265 Hardware Decoding)             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                Edge AI Detection Engine                 │
│         (YOLOv8 Object Detection / DeepSORT)            │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Object Tracking Node                   │
│      (Unique Tracking IDs: PERSON #P104, VEHICLE #V021) │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│          ANPR / Policy-Controlled Identity              │
│       (OCR License Plate Detection & Consent Audit)      │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Virtual Fence & Zone Rules Engine            │
│  (Restricted Zone / Buffer Zone / Vector Direction N->S)│
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Multi-Camera Correlation Engine              │
│     (Spatiotemporal Trajectory: CAM-02 -> 03 -> 05)     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Threat Fusion Engine                   │
│   (Composite Threat Score: 0 - 100 Risk Breakdown)      │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 FastAPI Backend Service                 │
│         (REST APIs + WebSockets + SQLite Storage)       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│          RakshakVision Command Center Dashboard         │
│    (Military Dark SOC UI / Real-time Telemetry / React) │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Description

1. **Ingestion & Detection:** Camera streams are processed locally on distributed Edge Nodes (`EDGE-NODE-01`, `EDGE-NODE-02`).
2. **Feature Extraction:** Object bounding boxes, movement vectors, and confidence scores are calculated per frame.
3. **Correlation:** When a target transitions between adjacent camera coverage sectors, spatiotemporal feature vectors are matched.
4. **Threat Scoring:** The Threat Fusion Engine combines zone severity, night timeframe penalty, dwell time, and multi-camera correlation into a unified 0-100 score.
5. **Human Operator Action:** Alerts are dispatched to the Command Center where authorized personnel review evidence, acknowledge threats, or dispatch border patrol response teams.
