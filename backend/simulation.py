"""
RakshakVision - Simulation & Event Generation Engine
Drives realistic real-time telemetry, simulated frame bounding boxes, alerts, and edge states.
"""

import asyncio
import json
import random
from datetime import datetime
from threat_fusion import ThreatFusionEngine

class SimulationEngine:
    def __init__(self):
        self.is_running = False
        self.current_scenario = "Multi-Camera Tracking"
        self.listeners = set()
        self.step = 0

    def set_scenario(self, scenario_name: str):
        self.current_scenario = scenario_name
        self.step = 0

    async def generate_event(self):
        self.step += 1
        now_str = datetime.now().strftime("%H:%M:%S")

        if self.current_scenario == "Multi-Camera Tracking":
            if self.step % 3 == 1:
                cam = "CAM-02"
                score = 45
                level = "MEDIUM"
                desc = "Target #P104 detected moving South near Buffer Line."
            elif self.step % 3 == 2:
                cam = "CAM-03"
                score = 68
                level = "HIGH"
                desc = "Spatiotemporal correlation match on #P104 (+8s)."
            else:
                cam = "CAM-05"
                score = 87
                level = "CRITICAL"
                desc = "Virtual Fence BREACHED by #P104 in Restricted Zone!"

            event = {
                "type": "CORRELATION_EVENT",
                "scenario": self.current_scenario,
                "timestamp": now_str,
                "target_id": "PERSON #P104",
                "camera_id": cam,
                "threat_score": score,
                "threat_level": level,
                "description": desc,
                "bounding_box": {
                    "x": 30 + (self.step * 15) % 50,
                    "y": 40 + (self.step * 10) % 40,
                    "w": 18,
                    "h": 35,
                    "label": "PERSON #P104",
                    "confidence": 0.98
                }
            }
        elif self.current_scenario == "Virtual Fence Intrusion":
            event = {
                "type": "VIRTUAL_FENCE_BREACH",
                "scenario": self.current_scenario,
                "timestamp": now_str,
                "target_id": "PERSON #P108",
                "camera_id": "CAM-05",
                "threat_score": 92,
                "threat_level": "CRITICAL",
                "description": "Unauthorized vector SOUTH breach across virtual fence line.",
                "bounding_box": {"x": 45, "y": 55, "w": 20, "h": 40, "label": "PERSON #P108", "confidence": 0.96}
            }
        elif self.current_scenario == "ANPR Detection":
            plates = ["JK02AB1234", "DL01XY9988", "PB65CZ4321"]
            plate = plates[self.step % len(plates)]
            event = {
                "type": "ANPR_EVENT",
                "scenario": self.current_scenario,
                "timestamp": now_str,
                "camera_id": "CAM-04",
                "plate_number": plate,
                "confidence": 96,
                "vehicle_type": "Heavy Truck" if plate == "JK02AB1234" else "SUV",
                "status": "WATCHLIST" if plate == "JK02AB1234" else "AUTHORIZED",
                "description": f"License plate {plate} captured at Checkpoint Bravo.",
                "bounding_box": {"x": 25, "y": 30, "w": 45, "h": 30, "label": f"VEHICLE {plate}", "confidence": 0.96}
            }
        elif self.current_scenario == "Network Failure":
            event = {
                "type": "EDGE_FAILOVER",
                "scenario": self.current_scenario,
                "timestamp": now_str,
                "edge_node": "EDGE-NODE-02",
                "status": "STORE-AND-FORWARD ACTIVE",
                "cached_events": self.step * 4,
                "description": "Primary network drop detected. Edge node switched to local store-and-forward queue."
            }
        else:
            event = {
                "type": "MONITORING_UPDATE",
                "scenario": self.current_scenario,
                "timestamp": now_str,
                "camera_id": f"CAM-0{(self.step % 6) + 1}",
                "threat_score": random.randint(15, 35),
                "threat_level": "LOW",
                "description": "Normal border perimeter scan active."
            }
        return event

sim_engine = SimulationEngine()
