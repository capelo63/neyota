import React from 'react';

interface CharacterCounterProps {
  current: number;
  min?: number;
  max?: number;
  showLabel?: boolean;
}

export function CharacterCounter({
  current,
  min,
  max,
  showLabel = true
}: CharacterCounterProps) {
  const getColor = () => {
    if (min && current < min) return 'text-orange-600';
    if (max && current > max) return 'text-red-600';
    return 'text-neutral-500';
  };

  const getMessage = () => {
    if (min && current < min) {
      const remaining = min - current;
      return `${remaining} caractère${remaining > 1 ? 's' : ''} minimum requis`;
    }
    if (max && current > max) {
      const excess = current - max;
      return `${excess} caractère${excess > 1 ? 's' : ''} en trop`;
    }
    if (max) {
      return `${current} / ${max} caractères`;
    }
    if (min) {
      return `${current} caractères (min: ${min})`;
    }
    return `${current} caractères`;
  };

  return (
    <div className={`text-sm ${getColor()}`}>
      {showLabel && getMessage()}
    </div>
  );
}
