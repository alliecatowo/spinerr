"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface ToneArmProps {
  isPlaying: boolean;
  progress: number;
}

export const ToneArm = memo(function ToneArm({ isPlaying, progress }: ToneArmProps) {
  // Correct: Playing = 25° (on vinyl) | Paused = -35° (off vinyl)
  const baseRotation = isPlaying ? 25 : -35;
  const progressRotation = isPlaying ? progress * 15 : 0;
  const totalRotation = baseRotation + progressRotation;

  return (
    <motion.div
      className="absolute top-[5%] right-[5%] origin-top-right w-[25%] aspect-[0.75] pointer-events-none z-20"
      initial={{ rotate: -35 }}
      animate={{ rotate: totalRotation }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.8,
      }}
    >
      {/* Tone Arm Base */}
      <div className="absolute top-0 right-0 w-[15%] aspect-square bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 rounded-full shadow-lg border-2 border-gray-600 dark:border-gray-500" />

      {/* Arm */}
      <div className="absolute top-[7%] right-[5.5%] w-[4%] h-[85%] bg-gradient-to-b from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700 rounded-full shadow-md origin-top">
        {/* Arm Detail Line */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[25%] h-full bg-gray-500 dark:bg-gray-400 opacity-50" />
      </div>

      {/* Headshell (the part that holds the needle) */}
      <div className="absolute top-[87%] right-0 w-[12%] aspect-[0.5] bg-gradient-to-br from-gray-600 to-gray-900 dark:from-gray-500 dark:to-gray-800 rounded-sm shadow-lg">
        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[15%] h-[33%] bg-gradient-to-b from-gray-400 to-gray-700 dark:from-gray-300 dark:to-gray-600 origin-top"
          animate={{
            scaleY: isPlaying ? 1.1 : 1,
          }}
          transition={{
            duration: 0.2,
            type: "spring",
          }}
        >
          {/* Needle Tip */}
          <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[200%] aspect-square bg-red-600 dark:bg-red-500 rounded-full shadow-glow" />
        </motion.div>
      </div>

      {/* Counterweight */}
      <div className="absolute top-[2%] right-[4%] w-[8%] aspect-square bg-gradient-radial from-gray-500 to-gray-800 dark:from-gray-400 dark:to-gray-700 rounded-full shadow-md" />

      {/* Subtle glow when playing */}
      {isPlaying && (
        <motion.div
          className="absolute top-[93%] right-[6%] w-[4%] aspect-square bg-red-500 dark:bg-red-400 rounded-full blur-sm"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
});
