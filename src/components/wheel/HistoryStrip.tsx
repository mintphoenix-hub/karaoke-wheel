import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface HistoryStripProps {
  history: string[];
  onRemove: (index: number) => void;
}

export function HistoryStrip({ history, onRemove }: HistoryStripProps) {
  if (history.length === 0) return <div className="h-12" />;

  return (
    <div className="flex flex-col items-center gap-3 mt-8 w-full max-w-lg">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Selected ({history.length})
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={`${item}-${index}-${history.length}`}
              initial={{ opacity: 0, scale: 0, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-secondary/40 border border-secondary/60 backdrop-blur-sm text-secondary-foreground text-sm font-medium"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${item}`}
                className="ml-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-background/40 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
