import keyboard from "./keyboard.json";
// Names match the original Spline objects so all key animations remain connected.
export type SkillNames = typeof keyboard[number]["name"];
export type Skill = typeof keyboard[number];
export const SKILLS: Record<string, Skill> = Object.fromEntries(keyboard.map(skill => [skill.name, skill]));
export const themeDisclaimers = {
  light: ["Modo claro activado."],
  dark: ["Modo oscuro activado."],
};
