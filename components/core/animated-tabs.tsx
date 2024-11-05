'use client';

import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';

export default function AnimatedTabs({
  tabs,
}: {
  tabs: { id: string; label: string; colour?: string }[];
}) {
  let [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() =>
            activeTab === tab.id ? setActiveTab(null) : setActiveTab(tab.id)
          }
          className={cn(
            'relative rounded-full px-3 py-1.5 text-sm text-foreground font-medium transition focus-visible:outline-2',
            focusRing,
            activeTab === tab.id ? '' : 'hover:text-foreground/60'
          )}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <AnimatePresence>
            {activeTab === tab.id && (
              <m.span
                layoutId="bubble"
                className={cn(
                  'absolute inset-0 z-10 bg-white transition-colors mix-blend-difference',
                  tab.colour
                    ? `${tab.colour} mix-blend-multiply dark:mix-blend-screen`
                    : ''
                )}
                style={{ borderRadius: 9999 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
