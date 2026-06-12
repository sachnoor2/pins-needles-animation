#!/usr/bin/env python3
import asyncio
import edge_tts
import os
import subprocess
from pathlib import Path

FPS = 60
AUDIO_DIR = Path("public/audio")
SEG_DIR = AUDIO_DIR / "segments"
TOTAL_FRAMES = 2700

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
SEG_DIR.mkdir(parents=True, exist_ok=True)

# PINS AND NEEDLES - SCRIPT (Cleaned)
SCENES = [
    { "id": "s01", "fs": 10,   "fe": 180,  "text": "Kya aapne kabhi socha hai ki jab aapka hath ya pair so jata hai, toh wahan ajeeb si chubhuan kyun hoti hai?" },
    { "id": "s02", "fs": 210,  "fe": 480,  "text": "Bahut log sochte hain ki yeh blood circulation rukne ki wajah se hota hai, lekin asliyat kuch aur hi hai." },
    { "id": "s03", "fs": 510,  "fe": 850,  "text": "Asal mein, jab aap kisi ek position mein der tak baithe rehte hain, toh aapki Nerves par pressure padta hai." },
    { "id": "s04", "fs": 880,  "fe": 1200, "text": "Yeh pressure brain tak jane wale electrical signals ko block kar deta hai." },
    { "id": "s05", "fs": 1230, "fe": 1650, "text": "Jaise hi aap move karte hain aur pressure hat-ta hai, toh saare blocked signals ek sath brain ki taraf bhagte hain." },
    { "id": "s06", "fs": 1680, "fe": 2100, "text": "Aapka brain in confused signals ko theek se samajh nahi pata, aur ise tingling ya prickly sensation ki tarah interpret karta hai." },
    { "id": "s07", "fs": 2130, "fe": 2280, "text": "Ise medical language mein Paresthesia kehte hain." },
    { "id": "s08", "fs": 2310, "fe": 2550, "text": "Kya aapne kabhi apne kisi body part ko sote hue dekha hai? Comment mein batao!" },
    { "id": "s09", "fs": 2580, "fe": 2690, "text": "Aur aise hi videos ke liye subscribe karein." },
]

VOICES = {
    "Suresh": "hi-IN-SureshNeural",
    "Swara": "hi-IN-SwaraNeural"
}

async def generate_scenes(voice_key, voice_id):
    print(f"── Generating Narration with {voice_key} ({voice_id}) ──")
    v_dir = SEG_DIR / voice_key
    v_dir.mkdir(parents=True, exist_ok=True)
    for sc in SCENES:
        print(f"  Synthesizing {sc['id']} for {voice_key}...")
        communicate = edge_tts.Communicate(sc["text"], voice_id)
        await communicate.save(str(v_dir / f"{sc['id']}.mp3"))

def combine_audio(voice_key):
    v_dir = SEG_DIR / voice_key
    total_s = TOTAL_FRAMES / FPS
    inputs, filter_parts, labels = [], [], []
    for idx, sc in enumerate(SCENES):
        seg = v_dir / f"{sc['id']}.mp3"
        start_ms = int(sc["fs"] / FPS * 1000)
        inputs += ["-i", str(seg)]
        filter_parts.append(f"[{idx}]adelay={start_ms}|{start_ms}[d{idx}]")
        labels.append(f"[d{idx}]")

    fc = ";".join(filter_parts) + ";" + "".join(labels) + f"amix=inputs={len(SCENES)}:normalize=0[out]"
    output_path = AUDIO_DIR / f"narration_{voice_key.lower()}.mp3"
    subprocess.run(["ffmpeg", "-y"] + inputs + ["-filter_complex", fc, "-map", "[out]", "-t", str(total_s), "-b:a", "192k", str(output_path)], check=True)
    print(f"✅ {voice_key} Audio pipeline complete: {output_path}")

async def main():
    await generate_scenes("Suresh", VOICES["Suresh"])
    combine_audio("Suresh")
    await generate_scenes("Swara", VOICES["Swara"])
    combine_audio("Swara")

if __name__ == "__main__":
    asyncio.run(main())
