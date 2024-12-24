'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TransactionTagsModification } from '@/server/schemas';
import { cn } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';

interface TxTagsComboboxProps {
  txId: string;
  title?: string;
  initialState?: string[];
  options: {
    name: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

const TransactionTagsCombobox = ({
  txId,
  title,
  initialState,
  options,
}: TxTagsComboboxProps) => {
  const [filterValues, setFilterValues] = useState<string[]>(
    initialState || []
  );
  const [input, setInput] = useState<string>('');
  const selectedValues = new Set<string>(filterValues);
  const utils = trpc.useUtils();
  const addTags = trpc.user.addTags.useMutation();
  const deleteTags = trpc.user.deleteTags.useMutation();

  const invalidateQueries = (input: TransactionTagsModification) => {
    const { transactionId } = input;
    utils.public.getTransactionById.invalidate(transactionId);
    utils.user.getTags.invalidate();
  };

  const handleSelectTag = async (value: string) => {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
      deleteTags.mutate(
        { transactionId: txId, tags: [value] },
        {
          onSuccess: (_, input) => {
            invalidateQueries(input);
          },
        }
      );
    } else {
      selectedValues.add(value);
      addTags.mutate(
        { transactionId: txId, tags: Array.from(selectedValues) },
        {
          onSuccess: (_, input) => {
            invalidateQueries(input);
          },
        }
      );
    }
    const filterValues = Array.from(selectedValues);
    setFilterValues(filterValues.length ? filterValues : []);
  };
  const handleRemoveAllTags = async () => {
    deleteTags.mutate(
      { transactionId: txId, tags: Array.from(selectedValues) },
      {
        onSuccess: (_, input) => {
          invalidateQueries(input);
        },
      }
    );
    setFilterValues([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 border-dashed rounded-full text-xs"
        >
          <PlusCircleIcon className={cn('h-3 w-3', title && 'mr-1')} />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={title}
            value={input}
            onValueChange={(input) => setInput(input)}
            maxLength={30}
          />
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={async () => {
                      await handleSelectTag(option.value);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {/* Flickers when input has a space at the end
             * @see https://github.com/pacocoursey/cmdk/issues/75
             */}
            {input && (
              <CommandGroup heading="Create tag">
                <CommandItem
                  value={input.trim()}
                  onSelect={async () => await handleSelectTag(input)}
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selectedValues.has(input)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>{input}</span>
                </CommandItem>
              </CommandGroup>
            )}
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleRemoveAllTags()}
                    className="justify-center text-center"
                  >
                    Clear all tags
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TransactionTagsCombobox;
