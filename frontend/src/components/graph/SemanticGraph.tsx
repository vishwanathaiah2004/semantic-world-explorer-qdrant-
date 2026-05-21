"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-xs animate-pulse" style={{ color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
        Initializing semantic engine...
      </div>
    </div>
  ),
});

interface SemanticGraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId: string | null;
  highlightIds: Set<string>;
  warpTargetId?: string | null;
}

const GRAPH_BG = "#04060f";

// Animated pulse ring state — lives outside React to avoid re-renders
interface PulseRing { x: number; y: number; r: number; maxR: number; alpha: number; color: string; }
const pulseRings: PulseRing[] = [];

// Warp trail state — reserved for future use
// const warpTrails: WarpTrail[] = [];

let globalTime = 0;

export function SemanticGraph({
  data,
  onNodeClick,
  selectedNodeId,
  highlightIds,
  warpTargetId,
}: SemanticGraphProps) {
  const fgRef        = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isWarping, setIsWarping] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Tick global time for animations
  useEffect(() => {
    const tick = () => { globalTime += 0.016; animFrameRef.current = requestAnimationFrame(tick); };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── Warp effect: fly to warpTargetId ──
  useEffect(() => {
    if (!warpTargetId || !fgRef.current) return;
    const node = data.nodes.find(n => n.id === warpTargetId);
    if (!node || node.x == null) return;

    setIsWarping(true);

    // Phase 1: zoom out fast
    fgRef.current.zoom(0.4, 300);
    setTimeout(() => {
      // Phase 2: fly to target
      fgRef.current?.centerAt(node.x, node.y, 600);
      setTimeout(() => {
        // Phase 3: zoom in dramatically
        fgRef.current?.zoom(3.5, 500);
        // Spawn pulse rings at target
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            pulseRings.push({
              x: node.x!, y: node.y!,
              r: 8, maxR: 80,
              alpha: 0.8,
              color: getCategoryColor((node as GraphNode).category),
            });
          }, i * 150);
        }
        setTimeout(() => setIsWarping(false), 600);
      }, 650);
    }, 320);
  }, [warpTargetId, data.nodes]);

  // ── Link painter ──
  const paintLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D) => {
      const src = link.source, tgt = link.target;
      if (!src || !tgt || src.x == null || tgt.x == null) return;

      const srcId = src.id, tgtId = tgt.id;
      const isActive =
        srcId === selectedNodeId || tgtId === selectedNodeId ||
        srcId === hoveredNode    || tgtId === hoveredNode;
      const isDimmed =
        highlightIds.size > 0 &&
        (!highlightIds.has(srcId) || !highlightIds.has(tgtId));

      if (isDimmed) {
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = "rgba(255,255,255,0.025)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        return;
      }

      const sim = typeof link.similarity === "number" ? link.similarity : 0.6;

      if (isActive) {
        // Animated pulse along active link
        const pulse = (Math.sin(globalTime * 3) + 1) / 2;

        // Outer glow
        ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(99,102,241,${0.12 + pulse * 0.08})`;
        ctx.lineWidth = 14; ctx.stroke();

        // Mid glow
        ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(139,92,246,${0.35 + pulse * 0.2})`;
        ctx.lineWidth = 5; ctx.stroke();

        // Core — animated brightness
        ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(200,190,255,${0.7 + pulse * 0.3})`;
        ctx.lineWidth = 1.8; ctx.stroke();

        // Moving dot along link
        const t = (Math.sin(globalTime * 2) + 1) / 2;
        const mx = src.x + (tgt.x - src.x) * t;
        const my = src.y + (tgt.y - src.y) * t;
        const dotGrd = ctx.createRadialGradient(mx, my, 0, mx, my, 5);
        dotGrd.addColorStop(0, "rgba(200,190,255,0.9)");
        dotGrd.addColorStop(1, "rgba(99,102,241,0)");
        ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fillStyle = dotGrd; ctx.fill();
      } else {
        // Resting link — subtle neon
        const opacity = 0.18 + sim * 0.28;
        const width   = 0.8 + sim * 1.8;
        // Soft glow
        ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(99,102,241,${(opacity * 0.4).toFixed(2)})`;
        ctx.lineWidth = width + 3; ctx.stroke();
        // Core
        ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(139,92,246,${opacity.toFixed(2)})`;
        ctx.lineWidth = width; ctx.stroke();
      }
    },
    [selectedNodeId, hoveredNode, highlightIds]
  );

  // ── Node painter ──
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0, y = node.y ?? 0;
      const baseSize   = (node.val ?? 1) * 5;
      const isSelected = node.id === selectedNodeId;
      const isHovered  = node.id === hoveredNode;
      const isHighlighted = highlightIds.size === 0 || highlightIds.has(node.id);
      const isDimmed   = highlightIds.size > 0 && !highlightIds.has(node.id);
      const color      = getCategoryColor(node.category);

      // Idle float offset (subtle per-node oscillation)
      const floatOffset = Math.sin(globalTime * 0.8 + node.id?.charCodeAt(0) * 0.1) * 0.8;
      const fy = y + floatOffset;

      // ── Ambient nebula glow ──
      const nebulaR = baseSize * (isSelected ? 7 : isHovered ? 6 : 4);
      const nebulaGrd = ctx.createRadialGradient(x, fy, 0, x, fy, nebulaR);
      nebulaGrd.addColorStop(0, `${color}${isDimmed ? "08" : isSelected ? "35" : "20"}`);
      nebulaGrd.addColorStop(0.5, `${color}${isDimmed ? "03" : "08"}`);
      nebulaGrd.addColorStop(1, `${color}00`);
      ctx.beginPath(); ctx.arc(x, fy, nebulaR, 0, Math.PI * 2);
      ctx.fillStyle = nebulaGrd; ctx.fill();

      // ── Selection pulse rings ──
      if (isSelected) {
        const pulse1 = (Math.sin(globalTime * 2.5) + 1) / 2;
        const pulse2 = (Math.sin(globalTime * 2.5 + Math.PI) + 1) / 2;

        ctx.beginPath(); ctx.arc(x, fy, baseSize + 8 + pulse1 * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}${Math.round(pulse1 * 40).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = 1.5 / globalScale; ctx.stroke();

        ctx.beginPath(); ctx.arc(x, fy, baseSize + 16 + pulse2 * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}${Math.round(pulse2 * 25).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = 1 / globalScale; ctx.stroke();

        // White selection ring
        ctx.beginPath(); ctx.arc(x, fy, baseSize + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.8 / globalScale; ctx.stroke();
      }

      // ── Hover ring ──
      if (isHovered && !isSelected) {
        ctx.beginPath(); ctx.arc(x, fy, baseSize + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}cc`;
        ctx.lineWidth = 1.5 / globalScale; ctx.stroke();
      }

      // ── Main node body ──
      const ng = ctx.createRadialGradient(x, fy - baseSize * 0.25, 0, x, fy, baseSize);
      if (isSelected || isHovered) {
        ng.addColorStop(0, "#ffffff");
        ng.addColorStop(0.35, `${color}ff`);
        ng.addColorStop(1, `${color}bb`);
      } else if (isDimmed) {
        ng.addColorStop(0, `${color}30`);
        ng.addColorStop(1, `${color}10`);
      } else {
        ng.addColorStop(0, `${color}ff`);
        ng.addColorStop(0.6, `${color}dd`);
        ng.addColorStop(1, `${color}88`);
      }
      ctx.beginPath(); ctx.arc(x, fy, baseSize, 0, Math.PI * 2);
      ctx.fillStyle = ng; ctx.fill();

      // ── Specular highlight (top-left shine) ──
      if (!isDimmed) {
        const shine = ctx.createRadialGradient(
          x - baseSize * 0.3, fy - baseSize * 0.3, 0,
          x - baseSize * 0.3, fy - baseSize * 0.3, baseSize * 0.6
        );
        shine.addColorStop(0, "rgba(255,255,255,0.35)");
        shine.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath(); ctx.arc(x, fy, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = shine; ctx.fill();
      }

      // ── Labels — only on hover/selected/high-zoom ──
      const showLabel =
        isSelected || isHovered ||
        (globalScale > 1.2 && isHighlighted) ||
        (globalScale > 2.5);

      if (showLabel) {
        const label = node.title?.length > 22 ? node.title.slice(0, 20) + "…" : (node.title ?? "");
        const fontSize = Math.max(9, Math.min(13, 11 / globalScale));
        const labelOpacity = isSelected || isHovered ? 1
          : Math.min(1, (globalScale - 1.0) / 0.8);

        ctx.globalAlpha = labelOpacity;
        ctx.font = `600 ${fontSize}px "Space Grotesk", Arial, sans-serif`;
        const tw  = ctx.measureText(label).width;
        const pad = 5 / globalScale;
        const py  = fy + baseSize + 6 / globalScale;
        const ph  = fontSize + pad * 2;

        // Label pill background
        ctx.fillStyle = isSelected
          ? `rgba(6,9,20,0.95)`
          : "rgba(4,6,15,0.88)";
        ctx.beginPath();
        ctx.roundRect(x - tw / 2 - pad, py, tw + pad * 2, ph, 5 / globalScale);
        ctx.fill();

        // Label border glow
        ctx.strokeStyle = isSelected || isHovered
          ? `${color}80`
          : `rgba(255,255,255,0.06)`;
        ctx.lineWidth = (isSelected ? 1 : 0.5) / globalScale;
        ctx.stroke();

        // Label text
        ctx.fillStyle = isSelected || isHovered ? "#f1f5f9" : `${color}ee`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, x, py + pad);
        ctx.textBaseline = "alphabetic";
        ctx.globalAlpha = 1;
      }

      // ── Animate pulse rings (spawned on click) ──
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const ring = pulseRings[i];
        ring.r += 2.5;
        ring.alpha -= 0.025;
        if (ring.alpha <= 0) { pulseRings.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${ring.color}${Math.round(ring.alpha * 255).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
    },
    [selectedNodeId, hoveredNode, highlightIds]
  );

  // ── Node click: spawn rings + smooth zoom ──
  const handleNodeClick = useCallback(
    (node: any) => {
      onNodeClick(node as GraphNode);
      if (!fgRef.current || node.x == null) return;

      // Spawn 3 expanding rings
      const color = getCategoryColor(node.category);
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          pulseRings.push({ x: node.x, y: node.y, r: 6, maxR: 70, alpha: 0.9, color });
        }, i * 120);
      }

      // Smooth cinematic zoom
      fgRef.current.centerAt(node.x, node.y, 700);
      fgRef.current.zoom(3.2, 700);
    },
    [onNodeClick]
  );

  // ── Physics setup + materialize animation ──
  useEffect(() => {
    if (!fgRef.current || data.nodes.length === 0) return;

    setTimeout(() => {
      try {
        // Softer, more natural physics
        fgRef.current?.d3Force("charge")?.strength(-280).distanceMax(500);
        fgRef.current?.d3Force("link")?.distance(110).strength(0.25);
        fgRef.current?.d3Force("collision")?.radius(18);
        fgRef.current?.d3ReheatSimulation();
      } catch { /* not ready */ }
    }, 150);

    // Materialize: zoom out first, then fit
    setTimeout(() => {
      fgRef.current?.zoom(0.3, 0);
    }, 100);
    setTimeout(() => {
      fgRef.current?.zoomToFit(1200, 100);
    }, 2800);
  }, [data.nodes.length]);

  return (
    <div
      ref={containerRef}
      id="graph-container"
      className="w-full h-full relative"
      style={{ cursor: hoveredNode ? "pointer" : "default" }}
    >
      {/* Cinematic vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(4,6,15,0.6) 100%)",
        }}
      />

      {/* Warp flash overlay */}
      {isWarping && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
            animation: "cosmicPulse 0.6s ease-in-out",
          }}
        />
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={data as any}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={GRAPH_BG}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => "replace"}
        onNodeClick={handleNodeClick}
        onNodeHover={(node: any) => setHoveredNode(node?.id ?? null)}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, (node.val ?? 1) * 8, 0, Math.PI * 2);
          ctx.fill();
        }}
        d3AlphaDecay={0.008}
        d3VelocityDecay={0.25}
        cooldownTicks={600}
        warmupTicks={80}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.15}
        maxZoom={12}
      />
    </div>
  );
}
