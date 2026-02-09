
export interface GenerationResult {
  imageUrl: string;
  timestamp: number;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
