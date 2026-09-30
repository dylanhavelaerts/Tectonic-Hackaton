'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

/** Counts from the previous value to the new one (STYLE.md §7: 0.8 s, no overshoot). */
export default function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    const el = ref.current;
    if (!el) return;
    if (reduce || from === value) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(from, value, {
      duration: 0.8,
      ease: [0.2, 0, 0, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <span ref={ref}>{value}</span>;
}
