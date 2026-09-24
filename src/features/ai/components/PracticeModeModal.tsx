import React from 'react';
import { PracticeSet } from '../../../types/ai';
import { PracticeMode } from './PracticeMode';

interface PracticeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  practiceSet?: PracticeSet;
  initialTopic?: string;
  initialSubject?: string;
  initialDifficulty?: 'Easy' | 'Medium' | 'Hard';
  initialCount?: number;
  autoStart?: boolean;
}

export const PracticeModeModal: React.FC<PracticeModeModalProps> = ({
  isOpen,
  onClose,
  practiceSet,
  initialTopic,
  initialSubject,
  initialDifficulty,
  initialCount,
  autoStart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto">
        <PracticeMode
          isModal={true}
          onClose={onClose}
          initialSubject={initialSubject}
          initialTopic={initialTopic}
          initialDifficulty={initialDifficulty}
          initialCount={initialCount}
          initialPracticeSet={practiceSet}
          autoStart={autoStart}
        />
      </div>
    </div>
  );
};
