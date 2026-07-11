#!/usr/bin/env python3
"""
DJ Library Organizer
--------------------
Sorts MP3s into genre/energy folders and builds Hot Packs of 40.

Requirements:
    pip install mutagen

Usage:
    python dj_organizer.py --source "/path/to/your/music" --dest "/path/to/DJ_LIBRARY"

Optional flags:
    --dry-run       Preview moves without touching files
    --hot-pack      Also build Hot Packs of 40 from ALL sorted files (random sample)
    --copy          Copy files instead of moving them (safer for first run)
"""

import os
import sys
import shutil
import random
import argparse
from pathlib import Path

try:
    from mutagen.mp3 import MP3
    from mutagen.id3 import ID3, TIT2, TBPM, TCON
except ImportError:
    print("❌  Missing dependency. Run:  pip install mutagen")
    sys.exit(1)


# ─────────────────────────────────────────────
#  FOLDER STRUCTURE CONFIG
#  Edit genre_map to match your taste.
#  Keys = folder names, values = keyword lists
#  that will be matched against genre ID3 tags.
# ─────────────────────────────────────────────

GENRE_MAP = {
    "OPEN_AIR_TECHNO/Blade_BurningMan_Style": [
        "open air", "desert", "burning man", "blade", "melodic techno",
        "organic techno", "psychedelic techno",
    ],
    "OPEN_AIR_TECHNO/Peak_Hour": [
        "peak hour techno", "hypnotic techno",
    ],
    "OPEN_AIR_TECHNO/Sunrise_Closer": [
        "sunrise", "afro techno", "ritual",
    ],
    "MELODIC_HOUSE/Deep_Afro": [
        "afro house", "deep house", "organic house", "afro",
    ],
    "MELODIC_HOUSE/Warm_Up": [
        "melodic house", "downtempo", "chill",
    ],
    "DARK_INDUSTRIAL_TECHNO/Peak_Hour": [
        "industrial techno", "dark techno", "hard techno", "berghain",
    ],
    "DARK_INDUSTRIAL_TECHNO/Late_Night": [
        "industrial", "ebm", "noise",
    ],
    "TRANCE_PSY/Progressive": [
        "progressive trance", "progressive", "progressive house",
    ],
    "TRANCE_PSY/Full_On_Peak": [
        "psytrance", "psy", "full on", "trance", "goa",
    ],
    "HOUSE_OTHER": [
        "house", "tech house", "minimal",
    ],
}

# BPM → Vibe labels (used in filename suffix or sub-sort if no genre tag)
BPM_BUCKETS = [
    (0,   110, "Warm_Up"),
    (110, 120, "Deep_Groove"),
    (120, 128, "Building"),
    (128, 135, "Peak_Hour"),
    (135, 145, "Hard_Peak"),
    (145, 999, "Extreme"),
]

HOT_PACK_SIZE = 40
UNSORTED_FOLDER = "UNSORTED"


# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────

def get_bpm_vibe(bpm):
    for lo, hi, label in BPM_BUCKETS:
        if lo <= bpm < hi:
            return label
    return "Unknown"


def read_tags(filepath):
    """Return (title, bpm, genre) from ID3 tags. Falls back to filename."""
    title, bpm, genre = None, None, None
    try:
        tags = ID3(filepath)
        title = str(tags.get("TIT2", "")).strip() or None
        raw_bpm = str(tags.get("TBPM", "")).strip()
        if raw_bpm:
            bpm = float(raw_bpm.split(".")[0])
        genre = str(tags.get("TCON", "")).strip().lower() or None
    except Exception:
        pass
    if title is None:
        title = Path(filepath).stem
    return title, bpm, genre


def match_genre_folder(genre_tag):
    """Match a genre string to the best folder key."""
    if not genre_tag:
        return None
    for folder, keywords in GENRE_MAP.items():
        for kw in keywords:
            if kw in genre_tag:
                return folder
    return None


def bpm_fallback_folder(bpm):
    """When no genre tag matches, sort by BPM into OPEN_AIR_TECHNO as default."""
    vibe = get_bpm_vibe(bpm) if bpm else "Unknown_BPM"
    return f"OPEN_AIR_TECHNO/{vibe}"


def dest_folder(genre_tag, bpm):
    folder = match_genre_folder(genre_tag)
    if not folder:
        folder = bpm_fallback_folder(bpm)
    return folder


def build_hot_packs(dest_root, all_moved, dry_run):
    """Pull random 40-track packs from everything that was sorted."""
    random.shuffle(all_moved)
    pack_num = 1
    for i in range(0, len(all_moved), HOT_PACK_SIZE):
        chunk = all_moved[i : i + HOT_PACK_SIZE]
        pack_dir = Path(dest_root) / "HOT_PACKS" / f"HOT_PACK_{pack_num:03d}"
        if not dry_run:
            pack_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n📦  HOT_PACK_{pack_num:03d}  ({len(chunk)} tracks)")
        for src in chunk:
            link_path = pack_dir / Path(src).name
            if not dry_run:
                # Use symlinks so tracks don't take double space
                if not link_path.exists():
                    try:
                        os.symlink(src, link_path)
                    except Exception:
                        shutil.copy2(src, link_path)
            print(f"    🔗  {Path(src).name}")
        pack_num += 1


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def organize(source, dest, dry_run=False, copy=False, hot_pack=False):
    source = Path(source)
    dest   = Path(dest)

    mp3_files = list(source.rglob("*.mp3"))
    print(f"\n🎵  Found {len(mp3_files)} MP3s in {source}\n")

    if not mp3_files:
        print("No MP3 files found. Check your --source path.")
        return

    moved      = []
    skipped    = []
    unsorted   = []

    for filepath in mp3_files:
        title, bpm, genre = read_tags(filepath)
        folder_key = match_genre_folder(genre)

        if folder_key:
            target_dir = dest / folder_key
        elif bpm:
            target_dir = dest / bpm_fallback_folder(bpm)
        else:
            target_dir = dest / UNSORTED_FOLDER

        target_path = target_dir / filepath.name

        # Add BPM vibe suffix to filename if we have BPM
        if bpm:
            vibe = get_bpm_vibe(bpm)
            stem = filepath.stem
            new_name = f"{stem}__{int(bpm)}bpm_{vibe}{filepath.suffix}"
            target_path = target_dir / new_name

        status = "📋 DRY" if dry_run else ("📋 COPY" if copy else "➡️  MOVE")
        print(f"{status}  [{genre or 'no-genre'} | {int(bpm) if bpm else '?'}bpm]")
        print(f"      {filepath.name}")
        print(f"      → {target_path.relative_to(dest)}\n")

        if not dry_run:
            target_dir.mkdir(parents=True, exist_ok=True)
            if copy:
                shutil.copy2(filepath, target_path)
            else:
                shutil.move(str(filepath), target_path)

        if str(target_dir) == str(dest / UNSORTED_FOLDER):
            unsorted.append(str(target_path))
        else:
            moved.append(str(target_path))

    print("\n" + "═" * 50)
    print(f"✅  Sorted:    {len(moved)}")
    print(f"📁  Unsorted:  {len(unsorted)}  (review manually)")
    print(f"    Dest:      {dest}")

    if hot_pack and moved:
        print("\n🔥  Building Hot Packs of 40...")
        build_hot_packs(dest, moved, dry_run)

    if unsorted:
        print(f"\n⚠️   {len(unsorted)} tracks landed in UNSORTED/ — they had no BPM or genre tags.")
        print("    Use a tag editor (MusicBrainz Picard or rekordbox) to tag them, then re-run.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DJ Library Organizer")
    parser.add_argument("--source", required=True, help="Folder with your MP3s")
    parser.add_argument("--dest",   required=True, help="Where to build DJ_LIBRARY")
    parser.add_argument("--dry-run",  action="store_true", help="Preview only, no file changes")
    parser.add_argument("--copy",     action="store_true", help="Copy instead of move (safer)")
    parser.add_argument("--hot-pack", action="store_true", help="Build Hot Packs of 40")
    args = parser.parse_args()

    organize(
        source   = args.source,
        dest     = args.dest,
        dry_run  = args.dry_run,
        copy     = args.copy,
        hot_pack = args.hot_pack,
    )
