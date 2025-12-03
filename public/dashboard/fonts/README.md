# Neue Haas Grotesk Font Setup

This directory is for Neue Haas Grotesk font files.

## Font Loading

The dashboard uses Neue Haas Grotesk with the following fallback strategy:

1. **Primary**: System fonts (Helvetica Neue, Helvetica) - these closely match Neue Haas Grotesk
2. **Fallback**: Arial (if system fonts not available)

## To Use Actual Neue Haas Grotesk Files

If you have licensed Neue Haas Grotesk font files:

1. Place the following files in this directory:
   - `NeueHaasGrotesk-Regular.woff2` (weight: 400)
   - `NeueHaasGrotesk-Medium.woff2` (weight: 500)
   - `NeueHaasGrotesk-Bold.woff2` (weight: 600, 700)

2. The CSS in `styles.css` will automatically use them via the `@font-face` declarations.

## Current Implementation

Currently using system fonts (Helvetica Neue/Helvetica) which are visually very similar to Neue Haas Grotesk and provide excellent rendering quality on macOS and iOS devices.

