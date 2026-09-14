"""
RakshakVision - Threat Fusion Engine
Calculates weighted composite threat score (0 - 100) based on border parameters.
"""

class ThreatFusionEngine:
    @staticmethod
    def calculate_score(
        location_zone: str,
        direction: str,
        time_hour: int,
        object_type: str,
        multi_camera_match: bool,
        dwell_time_seconds: int = 15
    ) -> dict:
        """
        Calculates threat score breakdown:
        - Location Risk (Max 30)
        - Direction Risk (Max 20)
        - Time Risk (Max 15)
        - Behavior Risk (Max 20)
        - Multi-Camera Correlation (Max 15)
        Total = Max 100
        """
        # 1. Location Risk (Max 30)
        if location_zone == "Restricted Zone":
            location_risk = 30
        elif location_zone == "Buffer Zone":
            location_risk = 18
        else:
            location_risk = 5

        # 2. Direction Risk (Max 20)
        if "NORTH → SOUTH" in direction or "SOUTH" in direction:
            direction_risk = 20  # Moving into sovereign territory
        elif "EAST" in direction or "WEST" in direction:
            direction_risk = 10
        else:
            direction_risk = 5

        # 3. Time Risk (Max 15)
        # Night hours (22:00 to 05:00) carry maximum risk
        if time_hour >= 22 or time_hour <= 5:
            time_risk = 15
        elif time_hour >= 18 or time_hour <= 7:
            time_risk = 10
        else:
            time_risk = 5

        # 4. Behavior Risk (Max 20)
        if object_type == "PERSON":
            behavior_risk = 18 if dwell_time_seconds > 10 else 12
        elif object_type == "VEHICLE":
            behavior_risk = 15
        else:
            behavior_risk = 8

        # 5. Multi-Camera Match (Max 15)
        correlation_risk = 15 if multi_camera_match else 0

        # Composite Score
        total_score = min(100, location_risk + direction_risk + time_risk + behavior_risk + correlation_risk)

        # Threat Level
        if total_score >= 76:
            threat_level = "CRITICAL"
        elif total_score >= 51:
            threat_level = "HIGH"
        elif total_score >= 26:
            threat_level = "MEDIUM"
        else:
            threat_level = "LOW"

        return {
            "total_score": total_score,
            "threat_level": threat_level,
            "breakdown": {
                "location_risk": {"score": location_risk, "max": 30, "label": "Location Risk"},
                "direction_risk": {"score": direction_risk, "max": 20, "label": "Direction Risk"},
                "time_risk": {"score": time_risk, "max": 15, "label": "Time Risk"},
                "behavior_risk": {"score": behavior_risk, "max": 20, "label": "Behavior Risk"},
                "correlation_risk": {"score": correlation_risk, "max": 15, "label": "Multi-Camera Match"}
            }
        }
