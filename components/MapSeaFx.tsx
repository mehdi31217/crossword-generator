import React, { useEffect, useRef } from 'react';
import type { WaveAnchor } from '../data/mapWaves';

/**
 * The two map posters paint their water with faint ripple arcs. This layer puts
 * the same arcs back as live geometry on top of those anchors, so the sea
 * breathes instead of sitting still, plus a slow mist that lifts under the
 * cursor. Everything lives inside the map's own <svg>, after the artwork and
 * before the pins, so labels and markers always stay crisp on top.
 */

const ripple = (w: number, h: number, lift: number) =>
  `M ${-w} ${lift} Q 0 ${lift - h} ${w} ${lift}`;

export const SeaWaves: React.FC<{ anchors: WaveAnchor[] }> = React.memo(({ anchors }) => (
  <g className="cg-sea-ripples" pointerEvents="none">
    {anchors.map(([x, y, size], i) => (
      // the outer <g> holds the position: a CSS transform on the child would
      // otherwise overwrite the translate attribute and drop every arc at 0,0
      <g key={i} transform={`translate(${x} ${y})`}>
        <g
          className="cg-sea-ripple"
          style={{
            animationDelay: `${((i * 0.61) % 6).toFixed(2)}s`,
            animationDuration: `${(4.6 + (i % 5) * 0.7).toFixed(1)}s`,
          }}
        >
          <path d={ripple(size * 1.5, size * 0.46, 0)} />
          <path d={ripple(size * 2.45, size * 0.62, size * 0.45)} />
        </g>
      </g>
    ))}
  </g>
));

export const SeaMistDefs: React.FC<{ id: string }> = React.memo(({ id }) => (
  <radialGradient id={id}>
    <stop offset="0%" stopColor="#f4f9fc" stopOpacity="0.34" />
    <stop offset="55%" stopColor="#eef4f8" stopOpacity="0.13" />
    <stop offset="100%" stopColor="#eef4f8" stopOpacity="0" />
  </radialGradient>
));

interface SeaMistProps {
  gradId: string;
  /** width / height of the map in its own units, to size the fog banks */
  w: number;
  h: number;
  /** keeps the halo the same size on screen while the map is zoomed */
  inv?: number;
}

export const SeaMist: React.FC<SeaMistProps> = React.memo(({ gradId, w, h, inv = 1 }) => {
  const groupRef = useRef<SVGGElement | null>(null);
  const glowRef = useRef<SVGEllipseElement | null>(null);

  useEffect(() => {
    const g = groupRef.current;
    const svg = g?.ownerSVGElement;
    if (!g || !svg) return;
    let raf = 0;
    let inside = false;

    const onMove = (e: PointerEvent) => {
      // Skip expensive CTM inverse while dragging/pinching the map
      if (e.buttons !== 0) return;
      if (!inside) {
        inside = true;
        if (glowRef.current) glowRef.current.style.opacity = '1';
      }
      if (raf) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const m = g.getScreenCTM();
        const glow = glowRef.current;
        if (!m || !glow) return;
        const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
        glow.setAttribute('cx', p.x.toFixed(1));
        glow.setAttribute('cy', p.y.toFixed(1));
      });
    };
    const onLeave = () => {
      inside = false;
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };

    svg.addEventListener('pointermove', onMove, { passive: true });
    svg.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const fill = `url(#${gradId})`;

  return (
    <g ref={groupRef} className="cg-sea-mist" pointerEvents="none">
      <ellipse className="cg-mist-bank b1" cx={w * 0.24} cy={h * 0.3}
        rx={w * 0.3} ry={h * 0.16} fill={fill} />
      <ellipse className="cg-mist-bank b2" cx={w * 0.72} cy={h * 0.62}
        rx={w * 0.28} ry={h * 0.14} fill={fill} />
      <ellipse className="cg-mist-bank b3" cx={w * 0.5} cy={h * 0.86}
        rx={w * 0.34} ry={h * 0.12} fill={fill} />
      {/* rides the cursor: a soft lift of light in the fog, never a spotlight */}
      <ellipse
        ref={glowRef}
        className="cg-mist-glow"
        cx={w * 0.5}
        cy={h * 0.5}
        rx={150 * inv}
        ry={100 * inv}
        fill={fill}
      />
    </g>
  );
});
