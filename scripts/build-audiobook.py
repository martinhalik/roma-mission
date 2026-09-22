#!/usr/bin/env python3
"""Builds the English audiobook of the book from content/book/en.md.

Neural text-to-speech with Kokoro (Apache-2.0, runs locally on the CPU).
Output:
  public/ebook/audio/orthodox-mission-roma-en.m4b   AAC audiobook with chapters + cover
  public/ebook/audio/orthodox-mission-roma-en.mp3   MP3 with ID3 chapters (any player)
  lib/data/audiobook-en.json                        chapter list + sizes for the web player

Setup (once):
  pip install kokoro-onnx soundfile imageio-ffmpeg
  mkdir -p ~/.cache/kokoro && cd ~/.cache/kokoro
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Run:
  python3 scripts/build-audiobook.py                 # whole book (~1 h on 4 CPU cores)
  python3 scripts/build-audiobook.py --only 3        # just chapter 3 (for listening tests)

Environment: KOKORO_DIR (model folder), AUDIOBOOK_VOICE (default am_michael),
AUDIOBOOK_SPEED (default 0.95).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import tempfile
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "content/book/en.md"
BOOK = json.loads((ROOT / "content/book/book.json").read_text(encoding="utf-8"))
OUT_DIR = ROOT / "public/ebook/audio"
MANIFEST = ROOT / "lib/data/audiobook-en.json"
COVER = ROOT / "public/ebook/cover-en.jpg"
BASENAME = f"{BOOK['slug']}-en"

KOKORO_DIR = Path(os.environ.get("KOKORO_DIR", Path.home() / ".cache/kokoro"))
VOICE = os.environ.get("AUDIOBOOK_VOICE", "am_michael")
SPEED = float(os.environ.get("AUDIOBOOK_SPEED", "0.95"))
SAMPLE_RATE = 24000

# Pauses (seconds)
PAUSE_SENTENCE = 0.28
PAUSE_PARAGRAPH = 0.75
PAUSE_HEADING = 1.2
PAUSE_CHAPTER_END = 2.0

# Sections that are read only as their title plus a short note (lists of
# references make no sense read aloud).
SKIP_BODY = {"Bibliography"}

# Respellings so the English voice pronounces Slovak / Romani names acceptably.
# Only used for speech; the ebook text is untouched.
PRONUNCIATION = {
    "Halík": "Hah-leek",
    "Halíková": "Hah-lee-kova",
    "Klenovec": "Kleh-no-vets",
    "Klenovce": "Kleh-nov-tseh",
    "Mútnik": "Moot-nik",
    "Hnúšťa": "Hnoosh-tya",
    "Závadka": "Zah-vad-ka",
    "Varadka": "Va-rad-ka",
    "Markovce": "Mar-kov-tseh",
    "Kačanov": "Kah-cha-nov",
    "Prešov": "Preh-shov",
    "Košice": "Ko-shi-tseh",
    "Bojnice": "Boy-nyi-tseh",
    "Pružinský": "Pru-zhin-skee",
    "Savčák": "Sav-chahk",
    "Šafin": "Shah-fin",
    "Župina": "Zhu-pi-na",
    "gadje": "gah-djeh",
    "gadjo": "gah-djo",
    "Rom ": "Rom ",
}

FOOTNOTE_REF = re.compile(r"\[\^\d+\]")
URL = re.compile(r"<https?://[^>\s]+>|https?://\S+")
EMPHASIS = re.compile(r"\*{1,2}([^*]+)\*{1,2}")


@dataclass
class Chapter:
    title: str
    paragraphs: list[tuple[str, float]] = field(default_factory=list)  # (text, pause after)


def speakable(text: str) -> str:
    text = FOOTNOTE_REF.sub("", text)
    text = URL.sub("", text)
    text = EMPHASIS.sub(r"\1", text)
    text = text.replace("–", ", ").replace("—", ", ").replace("…", "...")
    text = re.sub(r"\s*\(\s*\)", "", text)
    for word, spoken in PRONUNCIATION.items():
        text = re.sub(rf"\b{re.escape(word.strip())}\b", spoken.strip(), text)
    return re.sub(r"\s+", " ", text).strip()


def parse_chapters(src: str) -> list[Chapter]:
    """Chapters = every `#` and `##` section. Footnotes, tables and figures are skipped."""
    chapters: list[Chapter] = []
    skipping = False
    for raw in src.splitlines():
        line = raw.strip()
        if not line:
            continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            level, title = len(heading.group(1)), heading.group(2).strip()
            if level <= 2:
                chapters.append(Chapter(title=EMPHASIS.sub(r"\1", title)))
                skipping = title in SKIP_BODY
                chapters[-1].paragraphs.append((speakable(title) + ".", PAUSE_HEADING))
                if skipping:
                    chapters[-1].paragraphs.append(
                        ("The full list of sources is included in the ebook edition.", PAUSE_PARAGRAPH)
                    )
            elif not skipping and chapters:
                chapters[-1].paragraphs.append((speakable(title) + ".", PAUSE_HEADING))
            continue
        if skipping or not chapters:
            continue
        if line.startswith(("[^", "|", "![", "---")):
            continue
        if line.startswith(">"):
            text = re.sub(r"^>{1,2}\s?", "", line)
            if re.match(r"^[—–]\s", text):
                text = re.sub(r"^[—–]\s*", "", text)
            chapters[-1].paragraphs.append((speakable(text), PAUSE_PARAGRAPH))
            continue
        line = re.sub(r"^([-*]|\d+\.)\s+(?!\d)", "", line)
        text = speakable(line)
        if text:
            chapters[-1].paragraphs.append((text, PAUSE_PARAGRAPH))
    for chapter in chapters:
        if chapter.paragraphs:
            text, _ = chapter.paragraphs[-1]
            chapter.paragraphs[-1] = (text, PAUSE_CHAPTER_END)
    return chapters


def opening_credits() -> Chapter:
    ed = BOOK["editions"]["en"]
    return Chapter(
        title="Opening credits",
        paragraphs=[
            (f"{ed['title']} {ed['subtitle']}.", PAUSE_HEADING),
            (speakable(f"Written by {BOOK['author']}."), PAUSE_PARAGRAPH),
            (
                speakable(
                    "Translated from the Slovak original, published by the Orthodox Theological Faculty "
                    f"of the University of Prešov in {BOOK['originalYear']}."
                ),
                PAUSE_PARAGRAPH,
            ),
            (
                f"This audiobook edition is published by the {BOOK['publisher']}. "
                "It is narrated by a computer-generated voice.",
                PAUSE_CHAPTER_END,
            ),
        ],
    )


def split_sentences(text: str, limit: int = 380) -> list[str]:
    parts = re.split(r"(?<=[.!?…”\"])\s+(?=[A-Z“\"‘(0-9])", text)
    out: list[str] = []
    for part in parts:
        while len(part) > limit:
            cut = max(part.rfind(", ", 0, limit), part.rfind("; ", 0, limit))
            cut = cut + 1 if cut > 40 else limit
            out.append(part[:cut].strip())
            part = part[cut:].strip()
        if part:
            out.append(part)
    return out


_kokoro = None


def _synthesize_chapter(args: tuple[int, Chapter, str]) -> tuple[int, str, float]:
    """Runs in a worker process. Returns (index, wav path, duration)."""
    global _kokoro
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    index, chapter, workdir = args
    if _kokoro is None:
        _kokoro = Kokoro(str(KOKORO_DIR / "kokoro-v1.0.onnx"), str(KOKORO_DIR / "voices-v1.0.bin"))
    pieces = []
    for text, pause in chapter.paragraphs:
        sentences = split_sentences(text)
        for i, sentence in enumerate(sentences):
            samples, sr = _kokoro.create(sentence, voice=VOICE, speed=SPEED, lang="en-us")
            assert sr == SAMPLE_RATE
            pieces.append(samples.astype(np.float32))
            gap = pause if i == len(sentences) - 1 else PAUSE_SENTENCE
            pieces.append(np.zeros(int(gap * SAMPLE_RATE), dtype=np.float32))
    audio = np.concatenate(pieces) if pieces else np.zeros(SAMPLE_RATE, dtype=np.float32)
    path = str(Path(workdir) / f"chapter-{index:03d}.wav")
    sf.write(path, audio, SAMPLE_RATE, subtype="PCM_16")
    return index, path, len(audio) / SAMPLE_RATE


def ffmpeg_exe() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def ffmetadata(chapters: list[Chapter], durations: list[float]) -> str:
    ed = BOOK["editions"]["en"]
    lines = [
        ";FFMETADATA1",
        f"title={ed['title']} {ed['subtitle']}",
        f"artist={BOOK['author']}",
        f"album_artist={BOOK['author']}",
        f"album={ed['title']} {ed['subtitle']}",
        f"publisher={BOOK['publisher']}",
        f"date={BOOK['editionYear']}",
        "genre=Audiobook",
        "comment=Narrated by a computer-generated voice (Kokoro TTS).",
    ]
    start = 0.0
    for chapter, duration in zip(chapters, durations):
        esc = re.sub(r"([=;#\\\n])", r"\\\1", chapter.title)
        lines += [
            "[CHAPTER]",
            "TIMEBASE=1/1000",
            f"START={int(start * 1000)}",
            f"END={int((start + duration) * 1000)}",
            f"title={esc}",
        ]
        start += duration
    return "\n".join(lines) + "\n"


def encode(wavs: list[str], chapters: list[Chapter], durations: list[float], workdir: Path) -> None:
    ffmpeg = ffmpeg_exe()
    concat = workdir / "concat.txt"
    concat.write_text("".join(f"file '{w}'\n" for w in wavs), encoding="utf-8")
    meta = workdir / "metadata.txt"
    meta.write_text(ffmetadata(chapters, durations), encoding="utf-8")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    m4b = OUT_DIR / f"{BASENAME}.m4b"
    mp3 = OUT_DIR / f"{BASENAME}.mp3"
    base = [ffmpeg, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-i", str(meta)]
    cover = ["-i", str(COVER)] if COVER.exists() else []
    cover_map = ["-map", "2:v", "-c:v", "mjpeg", "-disposition:v", "attached_pic"] if cover else []
    subprocess.run(
        base + cover + ["-map", "0:a", *cover_map, "-map_metadata", "1", "-map_chapters", "1",
                        "-c:a", "aac", "-b:a", "48k", "-ac", "1", "-movflags", "+faststart", "-f", "mp4", str(m4b)],
        check=True,
    )
    subprocess.run(
        base + cover + ["-map", "0:a", *cover_map, "-map_metadata", "1", "-map_chapters", "1",
                        "-c:a", "libmp3lame", "-b:a", "40k", "-ac", "1", "-ar", "22050", "-id3v2_version", "3", str(mp3)],
        check=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", type=int, help="synthesize only this chapter index (0 = opening credits)")
    parser.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) // 2))
    args = parser.parse_args()

    chapters = [opening_credits(), *parse_chapters(SOURCE.read_text(encoding="utf-8"))]
    if args.only is not None:
        chapters = [chapters[args.only]]

    with tempfile.TemporaryDirectory(prefix="audiobook-") as tmp:
        jobs = [(i, c, tmp) for i, c in enumerate(chapters)]
        results: dict[int, tuple[str, float]] = {}
        with ProcessPoolExecutor(max_workers=args.workers) as pool:
            for index, path, duration in pool.map(_synthesize_chapter, jobs):
                results[index] = (path, duration)
                print(f"  {index:>2}/{len(chapters) - 1}  {duration / 60:5.1f} min  {chapters[index].title}", flush=True)
        wavs = [results[i][0] for i in range(len(chapters))]
        durations = [results[i][1] for i in range(len(chapters))]

        if args.only is not None:
            target = OUT_DIR / f"sample-chapter-{args.only}.wav"
            OUT_DIR.mkdir(parents=True, exist_ok=True)
            Path(wavs[0]).replace(target)
            print(f"sample written to {target}")
            return

        encode(wavs, chapters, durations, Path(tmp))

    starts, t = [], 0.0
    for d in durations:
        starts.append(round(t, 2))
        t += d
    manifest = {
        "voice": VOICE,
        "duration": round(t, 1),
        "m4b": {"file": f"/ebook/audio/{BASENAME}.m4b", "bytes": (OUT_DIR / f"{BASENAME}.m4b").stat().st_size},
        "mp3": {"file": f"/ebook/audio/{BASENAME}.mp3", "bytes": (OUT_DIR / f"{BASENAME}.mp3").stat().st_size},
        "chapters": [{"title": c.title, "start": s} for c, s in zip(chapters, starts)],
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"audiobook: {t / 3600:.2f} h, m4b {manifest['m4b']['bytes'] // 1024 // 1024} MB, "
          f"mp3 {manifest['mp3']['bytes'] // 1024 // 1024} MB, {len(chapters)} chapters")


if __name__ == "__main__":
    main()
