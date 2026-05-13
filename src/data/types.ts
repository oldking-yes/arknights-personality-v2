export interface Option {
  txt: string;
  dim: number;
  val: number;
}

export interface Question {
  text: string;
  opts: Option[];
}

export interface Operator {
  id: string;
  name: string;
  title: string;
  clazz: string;
  stars: number;
  coords: number[];
  color: string;
  tag: string;
  avatar: string;
  desc: string;
}

export const DIM_LABELS = ['战术思维','情感方式','行动风格','秩序倾向','社交取向'];

export type Stage = 'intro' | 'quiz' | 'results';

export interface AnswerRecord {
  dim: number;
  val: number;
}
