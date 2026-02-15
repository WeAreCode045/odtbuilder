import React from 'react';

interface ViewportProps {
  children: React.ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({ children }) => {
  return (
    <div className="flex-1 bg-gray-200 overflow-y-auto overflow-x-hidden relative flex justify-center">
        <div className="py-12 pb-32 w-full flex justify-center">
            {children}
        </div>
    </div>
  );
};