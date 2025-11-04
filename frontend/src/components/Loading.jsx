import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ fullscreen = false }) => {
  if (fullscreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Loading;
