import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = ["#FFB3C6", "#C3B1E1", "#A8E6CF", "#FFD3B6", "#FFE9A8", "#B5DEFF"];
    const newPieces = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 2,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces([]);
    }, 3500);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ top: "-5%", left: `${piece.x}%`, rotate: 0, opacity: 1 }}
          animate={{ 
            top: "105%", 
            left: `${piece.x + (Math.random() * 20 - 10)}%`,
            rotate: 720,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: piece.duration, 
            delay: piece.delay, 
            ease: "easeOut" 
          }}
          className="absolute w-3 h-3 md:w-4 md:h-4"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
