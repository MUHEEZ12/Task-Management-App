import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gray-200 dark:bg-slate-700 rounded-lg h-20"
        />
      ))}
    </div>
  );
};

export const TaskSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gray-200 dark:bg-slate-700 rounded-lg h-16"
        />
      ))}
    </div>
  );
};
