import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Bug, Lightbulb, Target } from 'lucide-react';

export const TaskTemplates = ({ onSelectTemplate, onClose }) => {
  const templates = [
    {
      id: 'bug',
      title: 'Bug Report',
      description: 'Report a bug or issue',
      icon: Bug,
      color: 'red',
      priority: 'high',
      labels: ['bug', 'urgent'],
      defaultDescription: '## Steps to reproduce:\n1. \n2. \n3. \n\n## Expected behavior:\n\n## Actual behavior:\n\n## Environment:\n- Browser: \n- OS: \n- Version: '
    },
    {
      id: 'feature',
      title: 'Feature Request',
      description: 'Request a new feature',
      icon: Lightbulb,
      color: 'blue',
      priority: 'medium',
      labels: ['enhancement', 'feature'],
      defaultDescription: '## Problem:\n\n## Proposed Solution:\n\n## Benefits:\n\n## Alternatives Considered:\n'
    },
    {
      id: 'task',
      title: 'Task',
      description: 'General task or todo item',
      icon: CheckCircle,
      color: 'green',
      priority: 'medium',
      labels: ['task'],
      defaultDescription: '## Description:\n\n## Acceptance Criteria:\n- [ ] \n- [ ] \n- [ ] \n\n## Notes:'
    },
    {
      id: 'improvement',
      title: 'Improvement',
      description: 'Suggest an improvement',
      icon: Target,
      color: 'purple',
      priority: 'low',
      labels: ['improvement'],
      defaultDescription: '## Current State:\n\n## Proposed Improvement:\n\n## Expected Impact:\n'
    },
    {
      id: 'urgent',
      title: 'Urgent Task',
      description: 'High priority urgent task',
      icon: AlertTriangle,
      color: 'orange',
      priority: 'critical',
      labels: ['urgent', 'critical'],
      defaultDescription: '## Urgency Reason:\n\n## Required Action:\n\n## Deadline:\n\n## Stakeholders:'
    },
    {
      id: 'meeting',
      title: 'Meeting/Task',
      description: 'Schedule or meeting related',
      icon: Clock,
      color: 'indigo',
      priority: 'medium',
      labels: ['meeting'],
      defaultDescription: '## Meeting Details:\n- Date/Time: \n- Location: \n- Attendees: \n- Agenda: \n\n## Action Items:\n- [ ] \n- [ ] '
    }
  ];

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose a Template</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Start with a pre-built template to save time</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.color === 'red' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      template.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                      template.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                      template.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                      template.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                      'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.labels.map((label) => (
                          <span
                            key={label}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-400"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};