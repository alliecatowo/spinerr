"use client";

import { Slider } from "@/components/ui/slider";
import { Grid2X2, Grid3X3 } from "lucide-react";

interface GridSizeControlProps {
  size: number;
  onChange: (size: number) => void;
}

export function GridSizeControl({ size, onChange }: GridSizeControlProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <Grid2X2 className="h-4 w-4 text-gray-600 dark:text-neutral-400" />
      <Slider
        value={[size]}
        onValueChange={(value) => onChange(value[0])}
        min={2}
        max={6}
        step={1}
        className="w-32"
      />
      <Grid3X3 className="h-4 w-4 text-gray-600 dark:text-neutral-400" />
      <span className="text-sm text-gray-600 dark:text-neutral-400 min-w-[3ch]">
        {size}
      </span>
    </div>
  );
}
