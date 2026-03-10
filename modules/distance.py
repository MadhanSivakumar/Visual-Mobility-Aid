
# Known average real-world heights (in cm) for common objects
KNOWN_HEIGHTS = {
    'person':     170,
    'car':        150,
    'chair':       90,
    'bottle':      25,
    'cup':         12,
    'dog':         60,
    'cat':         25,
    'laptop':      30,
    'tv':          60,
    'bus':        300,
    'truck':      250,
    'bicycle':    100,
    'motorbike':  110,
    'default':     80   # fallback for unknown objects
}

class DistanceEstimator:
    def __init__(self, focal_length=None):
        # Use provided focal length or estimate based on typical camera
        self.focal_length = focal_length or self._estimate_focal_length()
        print(f"[DistanceEstimator] Using focal length: {self.focal_length} pixels")

    def _estimate_focal_length(self):
        """
        Estimate focal length based on typical smartphone camera specs.
        This is a rough approximation and should be calibrated for accuracy.
        """
        # Typical smartphone camera focal length in pixels for 1920x1080 resolution
        # Formula: focal_length_pixels = (focal_length_mm * image_width_pixels) / sensor_width_mm
        # Assuming 35mm equivalent focal length of 26mm and sensor width of 4.8mm
        return 615  # Default value, can be overridden

    def calibrate_focal_length(self, known_distance_m, known_height_cm, bbox_height_pixels):
        """
        Calibrate focal length using a known object at known distance.
        Formula: focal_length = (known_height_cm * bbox_height_pixels) / (known_distance_m * 100)
        """
        self.focal_length = (known_height_cm * bbox_height_pixels) / (known_distance_m * 100)
        print(f"[DistanceEstimator] Calibrated focal length: {self.focal_length:.2f} pixels")
        return self.focal_length

    def estimate(self, label, box):
        """
        Estimates distance in meters using bounding box height.
        Formula: Distance = (Known Height * Focal Length) / BBox Height
        """
        x1, y1, x2, y2 = box
        bbox_height = y2 - y1

        if bbox_height <= 0:
            return None

        known_height_cm = KNOWN_HEIGHTS.get(label.lower(), KNOWN_HEIGHTS['default'])
        distance_cm = (known_height_cm * self.focal_length) / bbox_height
        distance_m = round(distance_cm / 100, 2)

        # Sanity check - distances over 100m are likely inaccurate
        if distance_m > 100:
            return None

        return distance_m

    def get_proximity_label(self, distance_m):
        """Returns a human-friendly proximity description."""
        if distance_m is None:
            return "unknown distance"
        elif distance_m < 1.0:
            return f"{distance_m}m — ⚠️ Very Close"
        elif distance_m < 3.0:
            return f"{distance_m}m — Nearby"
        elif distance_m < 6.0:
            return f"{distance_m}m — Moderate"
        else:
            return f"{distance_m}m — Far"