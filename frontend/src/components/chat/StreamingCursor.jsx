/**
 * @fileoverview StreamingCursor — blinking cursor shown during AI response streaming.
 */

/**
 * Animated blinking cursor for streaming text effect.
 * @param {Object} props
 * @param {boolean} props.visible - Whether cursor should display
 */
export default function StreamingCursor({ visible }) {
  if (!visible) return null;
  return (
    <span
      className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-middle animate-blink"
      aria-hidden="true"
    />
  );
}
