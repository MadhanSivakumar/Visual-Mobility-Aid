import pyttsx3
import threading

class AudioFeedback:
    def __init__(self, rate=150, volume=1.0):
        self.rate = rate
        self.volume = volume

    def _speak(self, text):
        """Runs TTS in a separate thread so it doesn't block the UI."""
        engine = pyttsx3.init()
        engine.setProperty('rate', self.rate)
        engine.setProperty('volume', self.volume)
        engine.say(text)
        engine.runAndWait()
        engine.stop()

    def speak(self, text):
        thread = threading.Thread(target=self._speak, args=(text,))
        thread.daemon = True
        thread.start()

    def build_summary(self, detections, distances, scene):
        """
        Builds a natural language summary from all analysis results.
        """
        if not detections:
            return f"Scene appears to be {scene}. No objects were detected."

        # Sort by closest distance first
        sorted_items = sorted(
            zip(detections, distances),
            key=lambda x: x[1] if x[1] is not None else 999
        )

        lines = [f"You are in a {scene} environment."]

        for det, dist in sorted_items[:5]:  # max 5 objects in summary
            label = det['label']
            direction = det.get('direction', 'unknown')
            
            if dist is not None:
                lines.append(f"A {label} is {dist} meters away, located {direction}.")
            else:
                lines.append(f"A {label} is detected {direction}.")

        return " ".join(lines)