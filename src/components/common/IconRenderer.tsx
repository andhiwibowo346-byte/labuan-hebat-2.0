import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Try exact or formatted name
  const IconComponent = (Icons as any)[name] || (Icons as any)[name.charAt(0).toUpperCase() + name.slice(1)] || Icons.Box;

  return <IconComponent className={className} size={size} />;
};
