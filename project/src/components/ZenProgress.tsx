import React from 'react';
import { Zap, Target } from 'lucide-react';

interface ZenProgressProps {
  totalNotes: number;
  streak: number;
}

const ZenProgress: React.FC<ZenProgressProps> = ({ totalNotes, streak }) => {
  const level = Math.floor(totalNotes / 5) + 1;
  const progress = ((totalNotes % 5) / 5) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Flow Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
              Level {level}
            </h2>
            <div className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
              ARCHIVIST
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-tighter text-stone-400 flex items-center gap-1 justify-end">
              <Zap className="w-3 h-3" /> Streak
            </span>
            <p className="text-xl font-medium text-stone-800 dark:text-stone-200">{streak} Days</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-tighter text-stone-400 flex items-center gap-1 justify-end">
              <Target className="w-3 h-3" /> XP
            </span>
            <p className="text-xl font-medium text-stone-800 dark:text-stone-200">{totalNotes * 10}</p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-stone-900 dark:bg-stone-100 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-stone-400">Progress to Level {level + 1}</span>
        <span className="text-[10px] text-stone-400">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default ZenProgress;
