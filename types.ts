export interface Pin {
  id: string;
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
}

export type AspectRatio = '1:1' | '9:16' | '16:9';
export type GenerationModel = 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';

export const STYLES = [
  'Photorealistic',
  'Illustration',
  'Anime',
  'Fantasy Art',
  'Cinematic',
  '3D Render',
  'Minimalist',
  'Watercolor',
] as const;

export type Style = typeof STYLES[number];

export interface GenerationOptions {
  prompt: string;
  model: GenerationModel;
  aspectRatio: AspectRatio;
  style?: Style;
  baseImage?: string; // For image-to-image generation
}

export interface UploadedPinData {
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
}
