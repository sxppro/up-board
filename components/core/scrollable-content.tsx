import { cn } from '@/utils/helpers';
import { PropsWithChildren, useEffect, useRef } from 'react';

const ScrollableContent = ({
  className,
  children,
}: { className?: string } & PropsWithChildren) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomGradientRef = useRef<HTMLDivElement>(null);
  const topGradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const topGradient = topGradientRef.current;
    const bottomGradient = bottomGradientRef.current;
    if (!scrollContainer || !bottomGradient || !topGradient) return;

    const handleScroll = () => {
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const currentScroll = scrollContainer.scrollTop;

      const topOpacity = Math.min(currentScroll / 100, 1);
      const bottomOpacity = Math.min((maxScroll - currentScroll) / 100, 1);

      topGradient.style.opacity = topOpacity.toString();
      bottomGradient.style.opacity = bottomOpacity.toString();
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className={cn('overflow-y-scroll', className)}
      >
        {children}
      </div>
      <div
        ref={topGradientRef}
        className="pointer-events-none absolute top-0 left-0 h-16 w-full bg-gradient-to-b from-background"
        style={{ opacity: 0 }}
      />
      <div
        ref={bottomGradientRef}
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-background"
        style={{ opacity: 1 }}
      />
    </div>
  );
};

export default ScrollableContent;
