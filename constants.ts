
import { Preset } from './types';

export const BACKDROP_PRESETS: Preset[] = [
  {
    id: 'boho_artisan',
    name: 'Boho Artisan',
    description: 'A warm, textured setting with macrame, dried pampas grass, and soft golden-hour light on a reclaimed wood surface.',
    icon: 'fa-sun'
  },
  {
    id: 'modern_farmhouse',
    name: 'Modern Farmhouse',
    description: 'A clean, rustic white-washed wooden table with a sprig of lavender and linen napkins in soft morning light.',
    icon: 'fa-home'
  },
  {
    id: 'botanical_studio',
    name: 'Botanical Studio',
    description: 'A minimalist scene with terracotta pots, monstera leaves, and organic shadows on a lime-wash plaster wall.',
    icon: 'fa-leaf'
  },
  {
    id: 'scandi_minimalist',
    name: 'Scandi Minimalist',
    description: 'Light oak wood flooring, a simple ceramic vase, and airy, high-key lighting for a clean, modern boutique look.',
    icon: 'fa-cube'
  }
];

export const SYSTEM_INSTRUCTION = `
You are a specialized commercial photographer for top-tier Etsy shops. 
Your goal is to transform basic product photos into high-end, "Artisan-style" lifestyle shots.

Aesthetic Guidelines:
1. Etsy Vibes: Use warm, organic textures (linen, wood, stone, ceramic).
2. Lighting: Prioritize "soft-box" natural light or "golden hour" warmth. Avoid harsh artificial shadows.
3. Composition: Use shallow depth of field (bokeh) to isolate the product while keeping the background recognizable as a cozy, high-end home or studio.
4. Product Integrity: DO NOT alter the product itself. Keep its size, shape, color, and labels identical. 
5. Integration: Place the product realistically on the surface (add contact shadows and reflections where appropriate).
`;
