"use client";

import { motion } from "framer-motion";

interface ToneArmProps {
  isPlaying: boolean;
  progress: number;
}

export function ToneArm({ isPlaying, progress }: ToneArmProps) {
  // Correct: Playing = 25° (on vinyl) | Paused = -35° (off vinyl)
  const baseRotation = isPlaying ? 25 : -35;
  const progressRotation = isPlaying ? progress * 15 : 0;
  const totalRotation = baseRotation + progressRotation;

  return (
    <motion.div
      className="absolute top-0 right-8 origin-top-right w-48 h-64 pointer-events-none z-20"
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
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full shadow-lg border-2 border-gray-600" />

      {/* Arm */}
      <div className="absolute top-4 right-3 w-2 h-40 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full shadow-md origin-top">
        {/* Arm Detail Line */}
        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-500 opacity-50" />
      </div>

      {/* Headshell (the part that holds the needle) */}
      <div className="absolute top-[168px] right-0 w-6 h-12 bg-gradient-to-br from-gray-600 to-gray-900 rounded-sm shadow-lg">
        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-gray-400 to-gray-700 origin-top"
          animate={{
            scaleY: isPlaying ? 1.1 : 1,
          }}
          transition={{
            duration: 0.2,
            type: "spring",
          }}
        >
          {/* Needle Tip */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full shadow-glow" />
        </motion.div>
      </div>

      {/* Counterweight */}
      <div className="absolute top-1 right-2 w-4 h-4 bg-gradient-radial from-gray-500 to-gray-800 rounded-full shadow-md" />

      {/* Subtle glow when playing */}
      {isPlaying && (
        <motion.div
          className="absolute top-[180px] right-3 w-2 h-2 bg-red-500 rounded-full blur-sm"
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
}
