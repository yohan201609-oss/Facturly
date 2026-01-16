import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction,
  image
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 transition-colors"
    >
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">
        {description}
      </p>
      
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};


export default EmptyState;
