import React from 'react';

export default function ComicPage({ panels, onNext }) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-90 grid grid-cols-2 grid-rows-2 gap-4 p-6 text-white font-mono">
      {panels.map((panel, i) => (
        <div
          key={i}
          className={`comic-panel flex flex-col items-center justify-center p-4 text-center text-sm bg-zinc-800 bg-opacity-80 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105 animate-fade-in`}
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {panel.content}
        </div>
      ))}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute bottom-6 right-6 bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors animate-pulse"
        >
          Next
        </button>
      )}
    </div>
  );
}