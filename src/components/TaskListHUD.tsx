/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronUp, Navigation, Sparkles } from 'lucide-react';
import { PlayerTask } from '../types';

interface TaskListHUDProps {
  tasks: PlayerTask[];
  onGuideToStall: (stallId: string) => void;
  myRole: 'saver' | 'scammer';
}

export const TaskListHUD: React.FC<TaskListHUDProps> = ({
  tasks,
  onGuideToStall,
  myRole,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  return (
    <div className="fixed top-20 left-3 md:left-5 z-20 pointer-events-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-[#0f1118]/95 border border-yellow-400/40 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden max-w-[280px] sm:max-w-xs transition-all">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{myRole === 'scammer' ? '🥷' : '📋'}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-white">
                  {myRole === 'scammer' ? 'Scammer Objectives' : 'Assigned Tasks'}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-400 text-black">
                  {completedCount}/{tasks.length}
                </span>
              </div>
              <div className="w-28 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-zinc-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded Tasks List */}
        {isExpanded && (
          <div className="p-3 border-t border-white/10 space-y-2 bg-[#141724]/90 max-h-56 overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-2 rounded-xl border text-xs flex items-start justify-between gap-2 transition-all ${
                  task.completed
                    ? 'bg-green-500/10 border-green-500/20 text-zinc-400'
                    : 'bg-black/40 border-white/5 text-zinc-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 text-yellow-400">
                    {task.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h5 className={`font-bold text-[11px] ${task.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {task.title}
                    </h5>
                    <span className="text-[10px] text-zinc-400">{task.stallName} Stall</span>
                  </div>
                </div>

                {!task.completed && (
                  <button
                    onClick={() => onGuideToStall(task.stallId)}
                    className="p-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400 hover:text-black text-yellow-300 transition-colors shrink-0 cursor-pointer"
                    title={`Go to ${task.stallName}`}
                  >
                    <Navigation className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {completedCount === tasks.length && (
              <div className="p-2 bg-yellow-400/20 border border-yellow-400/40 rounded-xl text-center text-[11px] font-extrabold text-yellow-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>All Tasks Done! +300 FamCoins!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
