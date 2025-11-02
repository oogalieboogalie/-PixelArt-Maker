
export interface AnimationData {
  palette: string[];
  frames: number[][][]; // Array of frames, each frame is a 16x16 grid of palette indices
  cadenceMs: number;
}
