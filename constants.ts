
import { Preset } from './types';

export const BACKDROP_PRESETS: Preset[] = [
  {
    id: 'rustic_kitchen',
    name: 'Rustic Kitchen',
    description: 'A warm, wooden kitchen counter with soft natural morning light.',
    icon: 'fa-utensils'
  },
  {
    id: 'boho_studio',
    name: 'Boho Studio',
    description: 'Minimalist white studio background with dried pampas grass and soft shadows.',
    icon: 'fa-leaf'
  },
  {
    id: 'natural_wood',
    name: 'Natural Wood',
    description: 'Close-up of a weathered oak table with blurred greenery in the background.',
    icon: 'fa-tree'
  },
  {
    id: 'minimalist_shelf',
    name: 'Minimalist Shelf',
    description: 'A clean floating shelf against a cream-colored wall with aesthetic decor.',
    icon: 'fa-layer-group'
  }
];

export const SYSTEM_INSTRUCTION = `
You are a world-class commercial product photographer and AI image editor.
Your task is to take a provided product image and replace its background with a high-quality, "Etsy-style" lifestyle setting.

Key rules:
1. Preserve the product's identity, shape, colors, and textures perfectly.
2. The lighting on the product must realistically match the new environment.
3. Use shallow depth of field (bokeh) to make the product pop.
4. Ensure the style is professional, inviting, and consistent with top-performing Etsy handmade products.
5. If the user provides a specific style description, prioritize it.
`;
