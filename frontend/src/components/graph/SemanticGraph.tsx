"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-slate-600 text-xs font-mono animate-pulse">
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
}

export function SemanticGraph({
  data,
  onNodeClick,
  selectedNodeId,
  highlightIds,
}: SemanticGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const paintLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D) => {
      const src = link.source;
      const tgt = link.target;
      if (!src || !tgt || src.x == null || tgt.x == null) return;

      const srcId = src.id;
      const tgtId = tgt.id;

      const isActive =
        srcId === selectedNodeId ||
        tgtId === selectedNodeId ||
        srcId === hoveredNode ||
        tgtId === hoveredNode;

      const isDimmed =
        highlightIds.size > 0 &&
        (!highlightIds.has(srcId) || !highlightIds.has(tgtId));

      if (isDimmed) {
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return;
      }

      const similarity = typeof link.similarity === "number" ? link.similarity : 0.6;

      if (isActive) {
        // Outer glow
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = "rgba(139,92,246,0.25)";
        ctx.lineWidth = 10;
        ctx.stroke();
        // Inner glow
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = "rgba(167,139,250,0.7)";
        ctx.lineWidth = 4;
        ctx.stroke();
        // Core line
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = "rgba(220,210,255,1)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        const opacity = 0.45 + similarity * 0.45;
        const width = 1.5 + similarity * 2.5;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(150,120,255,${opacity.toFixed(2)})`;
        ctx.lineWidth = width;
        ctx.stroke();
      }
    },
    [selectedNodeId, hoveredNode, highlightIds]
  );

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const baseSize = (node.val ?? 1) * 5;
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNode;
      const isHighlighted = highlightIds.size === 0 || highlightIds.has(node.id);
      const color = getCategoryColor(node.category);

      // Ambient glow
      const glowR = baseSize * 3;
      const ambGrd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      ambGrd.addColorStop(0, `${color}${isHighlighted ? "55" : "15"}`);
      ambGrd.addColorStop(1, `${color}00`);
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, 2 * Math.PI);
      ctx.fillStyle = ambGrd;
      ctx.fill();

      // Strong glow when selected/hovered
      if (isSelected || isHovered) {
        const sg = baseSize * 5;
        const sgGrd = ctx.createRadialGradient(x, y, 0, x, y, sg);
        sgGrd.addColorStop(0, `${color}80`);
        sgGrd.addColorStop(1, `${color}00`);
        ctx.beginPath();
        ctx.arc(x, y, sg, 0, 2 * Math.PI);
        ctx.fillStyle = sgGrd;
        ctx.fill();
      }

      // White ring when selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, baseSize + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, baseSize + 13, 0, 2 * Math.PI);
        ctx.strokeStyle = `${color}70`;
        ctx.lineWidth = 1 / globalScale;
        ctx.stroke();
      }

      if (isHovered && !isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, baseSize + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = `${color}dd`;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Main dot
      const ng = ctx.createRadialGradient(x, y, 0, x, y, baseSize);
      if (isSelected || isHovered) {
        ng.addColorStop(0, "#ffffff");
        ng.addColorStop(0.5, `${color}ff`);
        ng.addColorStop(1, `${color}bb`);
      } else {
        ng.addColorStop(0, `${color}ff`);
        ng.addColorStop(1, `${color}${isHighlighted ? "cc" : "25"}`);
      }
      ctx.beginPath();
      ctx.arc(x, y, baseSize, 0, 2 * Math.PI);
      ctx.fillStyle = ng;
      ctx.fill();

      // Label
      if (globalScale >= (isSelected || isHovered ? 0.1 : 0.5) && isHighlighted) {
        const label = node.title?.length > 22 ? node.title.slice(0, 20) + "…" : (node.title ?? "");
        const fontSize = Math.max(9, 12 / globalScale);
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        const tw = ctx.measureText(label).width;
        const pad = 4 / globalScale;
        const py = y + baseSize + 6 / globalScale;
        const ph = fontSize + pad * 2;

        ctx.fillStyle = "rgba(4,6,18,0.85)";
        ctx.beginPath();
        ctx.roundRect(x - tw / 2 - pad, py, tw + pad * 2, ph, 4 / globalScale);
        ctx.fill();

        ctx.fillStyle = isSelected || isHovered ? "#ffffff" : `${color}ff`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, x, py + pad);
        ctx.textBaseline = "alphabetic";
      }
    },
    [selectedNodeId, hoveredNode, highlightIds]
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      onNodeClick(node as GraphNode);
      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 600);
        fgRef.current.zoom(2.8, 600);
      }
    },
    [onNodeClick]
  );

  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      // Boost repulsion once the library has initialised its forces
      setTimeout(() => {
        try {
          fgRef.current?.d3Force("charge")?.strength(-300).distanceMax(600);
          fgRef.current?.d3Force("link")?.distance(120).strength(0.3);
          fgRef.current?.d3ReheatSimulation();
        } catch (_) { /* not ready yet */ }
      }, 200);

      // Zoom to fit after simulation has spread nodes out
      setTimeout(() => {
        fgRef.current?.zoomToFit(800, 120);
      }, 2500);
    }
  }, [data.nodes.length]);

  return (
    <div ref={containerRef} id="graph-container" className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        graphData={data as any}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#050810"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => "replace"}
        onNodeClick={handleNodeClick}
        onNodeHover={(node: any) => setHoveredNode(node?.id ?? null)}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, (node.val ?? 1) * 7, 0, 2 * Math.PI);
          ctx.fill();
        }}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.2}
        cooldownTicks={500}
        warmupTicks={50}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.2}
        maxZoom={10}
      />
    </div>
  );
}
