import { cn } from '@/utils/helpers';
import { focusRing } from '@/utils/tremor';
import { Info } from '@phosphor-icons/react/dist/ssr';
import { PropsWithChildren } from 'react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const InfoTooltip = ({ children }: PropsWithChildren) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn('size-6 p-1 rounded-full', focusRing)}
          >
            <Info className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
