'use client';
import NextImage, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
}

export function OptimizedImage({
  src, fallback, alt, className, containerClassName, showSkeleton = true, ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {showSkeleton && !loaded && !error && (
        <div className="absolute inset-0 bg-[hsl(var(--muted))] animate-pulse" />
      )}
      {!error ? (
        <NextImage
          src={src} alt={alt}
          className={cn('transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0', className)}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          {...props}
        />
      ) : fallback ? (
        <div className={cn('flex items-center justify-center bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]', className)}>
          <span>{fallback}</span>
        </div>
      ) : null}
    </div>
  );
}
