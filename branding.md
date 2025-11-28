# Ripework Branding Guidelines

## Design Philosophy
**Neo-Brutalism**: The design language of Ripework is rooted in Neo-Brutalism. It emphasizes raw, unpolished aesthetics, high contrast, bold typography, and distinct "hard" shadows. It avoids soft gradients and rounded corners in favor of sharp edges and vibrant, acidic colors against dark backgrounds.

## Color Palette

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary** | `#BDFF00` | Acid Green. Used for primary actions, highlights, and accents. |
| **Primary Hover** | `#A3DB00` | Darker shade of Acid Green for hover states. |
| **Secondary** | `#FF0099` | Hot Pink. Used for secondary accents and attention-grabbing elements. |
| **Background** | `#050505` | Almost Black. The main background color of the application. |
| **Surface** | `#121212` | Dark Gray. Used for cards, panels, and sections. |
| **Text Main** | `#F0F0F0` | Off-white. Primary text color for readability. |
| **Text Muted** | `#888888` | Gray. Used for secondary text and metadata. |
| **Border Strong** | `#FFFFFF` | High contrast white. Used for borders to define structure. |

## Typography

### Fonts
- **Sans-serif**: `Space Grotesk` - Used for headings and body text where readability is key.
- **Monospace**: `JetBrains Mono` - Used for code, data, and small technical details.
- **Display**: `Press Start 2P` - Used for the logo and retro-gaming inspired headers.

### Usage
- **Headings**: Uppercase, bold, tracking-tight.
- **Body**: Standard weight, readable line height.

## UI Components & Utilities

### Shadows
Hard-edge shadows are a signature of this design system.
- `shadow-neo`: Green hard shadow (`#BDFF00`).
- `shadow-neo-white`: White hard shadow (`#FFFFFF`).
- `shadow-neo-pink`: Pink hard shadow (`#FF0099`).

### Borders
- Default borders are often `2px` solid.
- `border-radius` is generally `0` (sharp corners).

### Common Classes (from `index.css`)
- `.neo-card`: Background surface, white border, white hard shadow.
- `.neo-input`: Black background, white border, focus effects.
- `.neo-button`: Surface background, white border, white text, hard shadow on hover.
- `.neo-button-primary`: Primary color background, black text, bold.

## Visual Effects
- **Glitch Animation**: Used for emphasis or loading states.
- **Retro Scrollbar**: Custom styled scrollbar with blocky thumb and high contrast.
