export type DesignPalette = {
  canvas: string;
  ink: string;
  accent: string;
  mute: string;
  field: string;
};

export type DesignDna = {
  palette: DesignPalette;
  type: {
    display: string;
    body: string;
    utility: string;
  };
  layout: string;
  signature: string;
  materials: string;
  motion: string;
  photos?: string[];
  font?: {
    family: string;
    cssUrl: string;
    weights: number[];
    italic: boolean;
  };
  buttons?: ButtonSystem;
  textMotion?: TextMotion;
};

export type MoodboardTile = {
  query: string;
  imageUrl: string;
};

export type Moodboard = {
  id: string;
  title: string;
  thesis: string;
  tiles: MoodboardTile[];
  dna: DesignDna;
};

export type MoodboardSession = {
  name: string;
  prompt: string;
  moodboards: Moodboard[];
};

export type FontOption = {
  id: string;
  family: string;
  cssUrl: string;
  weights: number[];
  italic: boolean;
  thesis: string;
  sampleHeadline: string;
  sampleBody: string;
};

export type ButtonSystem = {
  id: string;
  title: string;
  thesis: string;
  radius: number;
  borderWidth: number;
};

export type TextMotion = {
  id: "press" | "rise" | "rule";
  title: string;
  thesis: string;
};

export type SavedDesign = {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  moodboard_title: string;
  moodboard_image_url: string | null;
  dna: DesignDna;
  created_at: string;
};

export type DesignDraft = {
  userId: string;
  name: string;
  prompt: string;
  moodboard: Moodboard;
  fonts?: FontOption[];
  selectedFontId?: string;
  buttons?: ButtonSystem[];
  selectedButtonId?: string;
  motions?: TextMotion[];
  selectedMotionId?: string;
};
