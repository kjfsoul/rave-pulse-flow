# EDM Shuffle Font Assets

This directory contains the custom fonts used in the EDM Shuffle application for the rave aesthetic.

## Required Fonts

### 1. Orbitron (Cyber/Sci-fi Font)
- **File**: `Orbitron-Regular.woff2`
- **Download**: https://fonts.google.com/specimen/Orbitron
- **Usage**: Headers, titles, and cyber elements
- **License**: Open Font License (OFL)

### 2. Rajdhani (Modern Tech Font)
- **File**: `Rajdhani-Regular.woff2`
- **Download**: https://fonts.google.com/specimen/Rajdhani
- **Usage**: Body text and UI elements
- **License**: Open Font License (OFL)

### 3. Audiowide (Bold Display Font)
- **File**: `Audiowide-Regular.woff2`
- **Download**: https://fonts.google.com/specimen/Audiowide
- **Usage**: Hero titles and emphasis text
- **License**: Open Font License (OFL)

## Installation Instructions

1. Download the fonts from the Google Fonts links above
2. Convert them to WOFF2 format (recommended for web performance)
3. Place the `.woff2` files in this directory
4. Update the CSS imports in `src/index.css` to reference these files

## CSS Integration

Add the following to your CSS:

```css
@font-face {
  font-family: 'Orbitron';
  src: url('/assets/fonts/Orbitron-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Rajdhani';
  src: url('/assets/fonts/Rajdhani-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Audiowide';
  src: url('/assets/fonts/Audiowide-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

## Performance Notes

- WOFF2 format provides the best compression and loading performance
- Use `font-display: swap` to prevent invisible text during loading
- Consider preloading critical fonts in the HTML head
