/**
 * Shared motion presets for the CS Analyzer.
 *
 * Centralizing variants here means:
 *  - Reduced-motion preference is respected in one place
 *  - All cards/sections animate with the same rhythm
 *  - Tuning a single number changes the whole product
 */

import type { Variants, Transition } from "framer-motion";

// Calm, slightly slow-out easing — matches editorial pacing
const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];

const baseTransition: Transition = {
  duration: 0.45,
  ease: EASE,
};

/** Cross-fade between major step screens (select → input → analyzing → results). */
export const stepVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: baseTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE } },
};

/** Stagger container — children animate in sequence. */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** A single card/section sliding in from below. Used inside staggerContainer. */
export const sectionFadeUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: baseTransition },
};

/** A subtle pop for interactive elements (badges, chips, share indicators). */
export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: EASE } },
};

/** Skeleton shimmer — used while async content loads. */
export const skeletonPulse: Variants = {
  initial: { opacity: 0.55 },
  animate: {
    opacity: [0.55, 0.85, 0.55],
    transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
  },
};

/**
 * When the user prefers reduced motion, framer-motion's `useReducedMotion`
 * already neutralizes transforms. We export the variants above with the
 * assumption that framer-motion will collapse them automatically. For
 * non-framer animations (auto-animate, CSS keyframes), use `motion-safe:`
 * Tailwind variants explicitly.
 */
