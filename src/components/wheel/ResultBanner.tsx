import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ResultBanner({ result }: { result: string | null }) {
  return (
    <div className="h-24 md:h-32 flex items-center justify-center w-full my-4 relative">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key={result}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <div className="text-sm md:text-base font-bold tracking-widest uppercase text-primary mb-2 drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]">
              Get ready to sing
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary background-animate drop-shadow-[0_0_12px_rgba(var(--accent),0.6)]">
              {result}
            </h2>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground/50 text-lg md:text-xl font-medium tracking-wide uppercase"
          >
            Spin to decide!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
