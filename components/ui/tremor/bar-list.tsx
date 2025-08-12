// Tremor BarList [v1.0.0]

import React from 'react';

import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';

type Bar<T> = T & {
  key?: string;
  href?: string;
  colour?: string;
  value: number;
  name: string;
};

interface BarListProps<T = unknown>
  extends React.HTMLAttributes<HTMLDivElement> {
  data: Bar<T>[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  onValueChange?: (payload: Bar<T>) => void;
  sortOrder?: 'ascending' | 'descending' | 'none';
  colour?: string;
}

function BarListInner<T>(
  {
    data = [],
    valueFormatter = (value) => value.toString(),
    showAnimation = false,
    onValueChange,
    sortOrder = 'descending',
    className,
    colour,
    ...props
  }: BarListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  const Component = onValueChange ? 'button' : 'div';
  const sortedData = React.useMemo(() => {
    if (sortOrder === 'none') {
      return data;
    }
    return [...data].sort((a, b) => {
      return sortOrder === 'ascending'
        ? Math.abs(a.value) - Math.abs(b.value)
        : Math.abs(b.value) - Math.abs(a.value);
    });
  }, [data, sortOrder]);

  const widths = React.useMemo(() => {
    const maxValue = Math.max(
      ...sortedData.map((item) => Math.abs(item.value)),
      0
    );
    return sortedData.map((item) =>
      item.value === 0
        ? 0
        : Math.max((Math.abs(item.value) / maxValue) * 100, 2)
    );
  }, [sortedData]);

  const rowHeight = 'h-8';

  return (
    <div
      ref={forwardedRef}
      className={cn('flex justify-between space-x-6', className)}
      aria-sort={sortOrder}
      tremor-id="tremor-raw"
      {...props}
    >
      <div className="relative w-full space-y-1.5">
        {sortedData.map((item, index) => (
          <Component
            key={item.key ?? item.name}
            onClick={() => {
              onValueChange?.(item);
            }}
            className={cn(
              // base
              'group w-full rounded-sm',
              // focus
              focusRing,
              onValueChange
                ? [
                    '-m-0! cursor-pointer',
                    // hover
                    'hover:bg-gray-50 dark:hover:bg-gray-900',
                  ]
                : ''
            )}
          >
            <div
              className={cn(
                // base
                'flex items-center rounded-sm transition-all',
                rowHeight,
                // background colour
                item.colour
                  ? item.colour
                  : colour || 'bg-blue-200 dark:bg-blue-900',
                onValueChange
                  ? 'group-hover:bg-blue-300 dark:group-hover:bg-blue-800'
                  : '',
                // margin and duration
                {
                  'mb-0': index === sortedData.length - 1,
                  'duration-800': showAnimation,
                }
              )}
              style={{ width: `${widths[index]}%` }}
            >
              <div className={cn('absolute left-2 flex max-w-full pr-2')}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={cn(
                      // base
                      'truncate whitespace-nowrap rounded-sm text-sm',
                      // text color
                      'text-gray-900 dark:text-gray-50',
                      // hover
                      'hover:underline hover:underline-offset-2',
                      // focus
                      focusRing
                    )}
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {item.name}
                  </a>
                ) : (
                  <p
                    className={cn(
                      // base
                      'truncate whitespace-nowrap text-sm',
                      // text color
                      'text-gray-900 dark:text-gray-50'
                    )}
                  >
                    {item.name}
                  </p>
                )}
              </div>
            </div>
          </Component>
        ))}
      </div>
      <div>
        {sortedData.map((item, index) => (
          <div
            key={item.key ?? item.name}
            className={cn(
              'flex items-center justify-end',
              rowHeight,
              index === sortedData.length - 1 ? 'mb-0' : 'mb-1.5'
            )}
          >
            <p
              className={cn(
                // base
                'truncate whitespace-nowrap text-sm leading-none',
                // text color
                'text-gray-900 dark:text-gray-50'
              )}
            >
              {valueFormatter(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

BarListInner.displayName = 'BarList';

const BarList = React.forwardRef(BarListInner) as <T>(
  p: BarListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof BarListInner>;

export { BarList, type BarListProps };
