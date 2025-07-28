# Sound Packs Directory

This directory contains royalty-free audio stems for the DJ Station Sound Pack Loader.

## Directory Structure
```
soundpacks/
├── manifest.json          # Metadata for all available sound packs
├── edm-essentials/        # Core EDM sounds
│   ├── kick-808.mp3
│   ├── synth-lead.mp3
│   └── hihat-loop.mp3
├── bass-drops/            # Heavy bass sounds
│   ├── wobble-bass.mp3
│   └── sub-bass.mp3
└── house-vibes/           # House music elements
    ├── house-piano.mp3
    └── vocal-chop.mp3
```

## File Requirements
- **Format**: MP3, WAV, or OGG
- **Sample Rate**: 44.1kHz recommended
- **Bit Depth**: 16-bit minimum
- **Length**: 2-8 seconds (loopable)
- **Licensing**: Royalty-free or Creative Commons

## Development Note
For development purposes, audio files are generated procedurally or use placeholder tones.
In production, replace with actual licensed audio content.

## Adding New Sound Packs
1. Create new directory under `/soundpacks/`
2. Add audio files to the directory
3. Update `manifest.json` with metadata
4. Follow naming convention: `pack-name/stem-name.mp3`