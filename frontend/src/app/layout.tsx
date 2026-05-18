import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semantic World Explorer — Google Maps for Ideas",
  description: "An AI-powered semantic exploration platform. Discover hidden connections between ideas, research, and knowledge through interactive vector-space visualization.",
  keywords: ["semantic search", "knowledge graph", "AI", "vector database", "Qdrant"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#050810] antialiased">
        {children}
      </body>
    </html>
  );
}
