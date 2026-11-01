export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string; // slug: "bloque-buster", "caida", ...
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string; // clase CSS existente: "cover-bricks", ...
  color: AccentColor; // color del botón JUGAR
  best: number;
  plays: string; // "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/2026"
}

export interface User {
  name: string; // mayúsculas, máx. 10 caracteres
}

export interface SavedScore {
  game: string; // Game.id
  score: number;
  name: string;
  at: number; // Date.now()
}
