"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode, GraphLink } from "@/types/graph";
import { getCategoryColor } from "@/types/graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-slate-500 text-sm font-mono animate-pulse">Initializing graph engine...</div>
    </div>
  ),
});

interface SemanticGraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId: string | null;
  highlightIds: Set<string>;
}

export function SemanticGraph({ data, onNodeClick, selectedNodeId, highlightIds }: SemanticGraphProps) {
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

  const getLinkColor = useCallback(
    (link: GraphLink) => {
      const srcId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
      const tgtId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;

      if (
        srcId === selectedNodeId ||
        tgtId === selectedNodeId ||
        srcId === hoveredNode ||
        tgtId === hoveredNode
      ) {
        return "rgba(99,102,241,0.7)";
      }
      if (highlightIds.size > 0 && (!highlightIds.has(srcId) || !highlightIds.has(tgtId))) {
        return "rgba(255,255,255,0.03)";
      }
      return `rgba(255,255,255,${0.05 + link.similarity * 0.12})`;
    },
    [selectedNodeId, hoveredNode, highlightIds]
  );

  const getLinkWidth = useCallback(
    (link: GraphLink) => {
      const srcId = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
      const tgtId = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
      if (srcId === selectedNodeId || tgtId === selectedNodeId) return 2;
      if (srcId === hoveredNode || tgtId === hoveredNode) return 1.5;
      return 0.5 + link.similarity * 0.8;
    },
    [selectedNodeId, hoveredNode]
  );

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const baseSize = (node.val ?? 1) * 4;
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNode;
      const isHighlighted = highlightIds.size === 0 || highlightIds.has(node.id);

      const color = getCategoryColor(node.category);

      // Outer glow ring
      if (isSelected || isHovered) {
        const glowRadius = baseSize * 3;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        grd.addColorStop(0, `${color}40`);
        grd.addColorStop(1, `${color}00`);
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, 2 * Math.PI);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Node pulse ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, baseSize + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Main node
      const grd = ctx.createRadialGradient(x, y, 0, x, y, baseSize);
      const alpha = isHighlighted ? 1 : 0.2;
      grd.addColorStop(0, isSelected || isHovered ? "#ffffff" : `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
      grd.addColorStop(1, `${color}${Math.round(alpha * 180).toString(16).padStart(2, '0')}`);

      ctx.beginPath();
      ctx.arc(x, y, baseSize, 0, 2 * Math.PI);
      ctx.fillStyle = grd;
      ctx.fill();

      // Label
      const labelThreshold = isSelected || isHovered ? 0.3 : 1.2;
      if (globalScale >= labelThreshold && isHighlighted) {
        const label = node.title.length > 20 ? node.title.slice(0, 18) + "…" : node.title;
        const fontSize = Math.max(8, 11 / globalScale);
        ctx.font = `500 ${fontSize}px Space Grotesk, sans-serif`;
        ctx.fillStyle = isSelected ? "#ffffff" : `${color}ee`;
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + baseSize + fontSize + 2);
      }
    },
    [selectedNodeId, hoveredNode, highlightIds]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick(node);
      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 600);
        fgRef.current.zoom(2.5, 600);
      }
    },
    [onNodeClick]
  );

  // Center graph on data change
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 80);
      }, 500);
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
        nodeCanvasObject={paintNode as any}
        nodeCanvasObjectMode={() => "replace"}
        linkColor={getLinkColor as any}
        linkWidth={getLinkWidth as any}
        linkCurvature={0.15}
        onNodeClick={handleNodeClick as any}
        onNodeHover={(node: any) => setHoveredNode(node?.id ?? null)}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, (node.val ?? 1) * 5, 0, 2 * Math.PI);
          ctx.fill();
        }}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        cooldownTicks={200}
        nodeRelSize={4}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.2}
        maxZoom={8}
      />
    </div>
  );
}
