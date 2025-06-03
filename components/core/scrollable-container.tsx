import { cn } from '@/utils/helpers';
import { PropsWithChildren, useEffect, useRef } from 'react';

const ScrollableContent = ({
  className,
  children,
}: { className?: string } & PropsWithChildren) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const gradientElement = gradientRef.current;
    if (!scrollContainer || !gradientElement) return;

    const handleScroll = () => {
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const currentScroll = scrollContainer.scrollTop;

      const newOpacity = Math.min((maxScroll - currentScroll) / 100, 1);

      gradientElement.style.opacity = newOpacity.toString();
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
        ref={gradientRef}
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-background"
        style={{ opacity: 1 }}
      />
    </div>
  );
};

export default ScrollableContent;
