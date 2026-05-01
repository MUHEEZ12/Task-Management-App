import React from 'react';
import { motion } from 'framer-motion';
import { InboxIcon } from 'lucide-react';

export const EmptyState = ({ icon: Icon = InboxIcon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-slate-700 mb-4">
        <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xs">{description}</p>
      {action}
    </motion.div>
  );
};
