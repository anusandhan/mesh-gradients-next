import { Easing } from "framer-motion";

// Custom easing curves that match the CSS variables
export const customEasing = {
  easeInQuad: [0.55, 0.085, 0.68, 0.53] as Easing,
  easeInCubic: [0.55, 0.055, 0.675, 0.19] as Easing,
  easeInQuart: [0.895, 0.03, 0.685, 0.22] as Easing,
  easeInQuint: [0.755, 0.05, 0.855, 0.06] as Easing,
  easeInExpo: [0.95, 0.05, 0.795, 0.035] as Easing,
  easeInCirc: [0.6, 0.04, 0.98, 0.335] as Easing,

  easeOutQuad: [0.25, 0.46, 0.45, 0.94] as Easing,
  easeOutCubic: [0.215, 0.61, 0.355, 1] as Easing,
  easeOutQuart: [0.165, 0.84, 0.44, 1] as Easing,
  easeOutQuint: [0.23, 1, 0.32, 1] as Easing,
  easeOutExpo: [0.19, 1, 0.22, 1] as Easing,
  easeOutCirc: [0.075, 0.82, 0.165, 1] as Easing,

  easeInOutQuad: [0.455, 0.03, 0.515, 0.955] as Easing,
  easeInOutCubic: [0.645, 0.045, 0.355, 1] as Easing,
  easeInOutQuart: [0.77, 0, 0.175, 1] as Easing,
  easeInOutQuint: [0.86, 0, 0.07, 1] as Easing,
  easeInOutExpo: [1, 0, 0, 1] as Easing,
  easeInOutCirc: [0.785, 0.135, 0.15, 0.86] as Easing,
};

// Helper function to get easing by name
export const getEasing = (name: keyof typeof customEasing): Easing => {
  return customEasing[name];
};

// Common transition presets
export const transitions = {
  fast: { duration: 0.2, ease: customEasing.easeOutQuad },
  normal: { duration: 0.3, ease: customEasing.easeOutCubic },
  slow: { duration: 0.5, ease: customEasing.easeOutQuart },
  bounce: { duration: 0.6, ease: customEasing.easeOutCirc },
};
