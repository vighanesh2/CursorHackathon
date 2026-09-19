import type { ButtonSystem } from "@/types/design";

export const BUTTON_SYSTEMS: ButtonSystem[] = [
  {
    id: "square",
    title: "Square cut",
    thesis: "Hard corners and a drawn border, like a stamp on paper.",
    radius: 0,
    borderWidth: 2,
  },
  {
    id: "rounded",
    title: "Soft radius",
    thesis: "A slight curve so the control feels handled, not mechanical.",
    radius: 10,
    borderWidth: 1.5,
  },
  {
    id: "pill",
    title: "Full round",
    thesis: "Closed stadium ends, closer to a label or capsule.",
    radius: 999,
    borderWidth: 2,
  },
];
