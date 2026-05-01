import React from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const PomodoroTimer = () => {
  const [minutes, setMinutes] = React.useState(25);
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);
  const [showTimer, setShowTimer] = React.useState(false);

  React.useEffect(() => {
    let interval = null;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            setSessions(s => s + 1);
            // Play notification sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==');
            audio.play().catch(() => {});
            setMinutes(25);
            setSeconds(0);
            return;
          }
          setMinutes(m => m - 1);
          setSeconds(59);
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleReset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <>
      {!showTimer && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTimer(true)}
          className="fixed bottom-6 right-6 p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg z-40"
          title="Pomodoro Timer (Ctrl+P)"
        >
          <Clock className="w-6 h-6" />
        </motion.button>
      )}

      {showTimer && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-80 z-50 border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pomodoro Timer</h3>
            <button
              onClick={() => setShowTimer(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-red-500 font-mono mb-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sessions completed: {sessions}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
            <motion.div
              animate={{ width: `${((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100}%` }}
              className="h-full bg-gradient-to-r from-red-400 to-red-600"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                isActive
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Tips */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 Take a 5-minute break after each session. After 4 sessions, take a longer 15-minute break.
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
};