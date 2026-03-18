import speech_recognition as sr
import time

recognizer = sr.Recognizer()

def get_voice_input():
    with sr.Microphone() as source:
        print("\n[Listening...]")
        try:
            # We add a phrase_time_limit so it doesn't listen forever
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=10)
            print("[Processing voice...]")
            text = recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text
        except sr.UnknownValueError:
            print("I could not understand the audio.")
            return None
        except sr.WaitTimeoutError:
            print("No speech detected (Timeout).")
            return None
        except Exception as e:
            print(f"Error: {e}")
            return None

if __name__ == "__main__":

    # --- CALIBRATE ONCE AT THE START ---
    print("Calibrating microphone for background noise. This will take a few seconds.")
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source, duration=2)
    print("Calibration complete.")

    time.sleep(1)
    user_answer = get_voice_input()