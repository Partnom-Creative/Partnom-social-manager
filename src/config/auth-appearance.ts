/**
 * Auth screen look & feel (login / register + dot background).
 * Edit values here — no need to hunt through components.
 *
 * - `form.background` — any CSS color (rgba recommended for glass effect)
 * - `form.backdropBlurPx` — frosted blur strength in pixels
 * - `pageBackground` — solid color behind the dot canvas
 * - `dotGrid` — grid spacing, glow, “force field” push, and idle timeout (effects pause after mouse stops)
 */
export const authAppearance = {
  pageBackground: "#1a1b1e",

  form: {
    /** e.g. rgba(22, 23, 24, 0.3) — alpha controls transparency */
    background: "rgba(22, 23, 24, 0.3)",
    /** Backdrop blur in px (glass effect) */
    backdropBlurPx: 10,
  },

  dotGrid: {
    /** Distance between dot centers */
    spacing: 22,
    /** Brightness falloff radius (px) */
    glowRadius: 200,
    /** Dot opacity when inactive / far from cursor (0–1) — lower = dimmer */
    dimOpacity: 0.08,
    /** Cursor “force field”: dots within this radius are pushed outward */
    pushRadius: 160,
    /** Max displacement in px at the cursor edge */
    pushStrength: 22,
    /** Dot color (RGB) — alpha is computed per dot */
    dotRgb: { r: 255, g: 255, b: 255 } as const,
    /** After this many ms with no pointer movement, glow + force field turn off until the mouse moves again */
    idleMs: 2000,
  },
} as const;

export type AuthAppearance = typeof authAppearance;
