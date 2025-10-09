import { useEffect, useRef, useState } from 'react';
import { Flex, Button, IconButton, TextField, Box } from '@radix-ui/themes';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

type PaginatorProps = {
  count: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

type JumpState = {
  active: boolean;
  key: string;
};

export default function Paginator({ count, currentPage, onPageChange }: PaginatorProps) {
  const totalPages = Math.ceil(count / 15); // Assuming 15 items per page as default
  const [jumpState, setJumpState] = useState<JumpState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jumpState?.active) {
      inputRef.current?.focus();
    }
  }, [jumpState]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      setJumpState(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = Number((e.target as HTMLInputElement).value);
      if (!isNaN(val)) goToPage(val);
    } else if (e.key === 'Escape') {
      setJumpState(null);
    }
  };

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (currentPage > 4) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 3) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <Flex justify="center" gap={{ initial: "1", sm: "2" }} align="center">
      <IconButton
        variant="outline"
        size={{ initial: '1', sm: '2' }}
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        <ChevronLeftIcon />
      </IconButton>

      {pages.map((page, idx) => {
        const isJump = page === '...';
        const jumpKey = `jump-${idx}`;

        if (isJump && jumpState?.active && jumpState.key === jumpKey) {
          return (

            <TextField.Root
              key={jumpKey}
              size={{ initial: '1', sm: '2' }}
              ref={inputRef}
              type="number"
              min={1}
              max={totalPages}
              placeholder={currentPage.toString()}
              onBlur={() => setJumpState(null)}
              onKeyDown={handleJumpInput}
              style={{
                width: 'var(--space-8)',
                textAlign: 'center',
              }}
            >
              <Box
                style={{ order: 2 }}
                pr={{ initial: '2', sm: '1' }}
              />
            </TextField.Root>
          );
        }

        return (
          <Button
            key={isJump ? jumpKey : idx}
            variant={page === currentPage ? 'solid' : 'outline'}
            size={{ initial: '1', sm: '2' }}
            onClick={() => isJump
              ? setJumpState({ active: true, key: jumpKey })
              : goToPage(page)
            }
          >
            {isJump ? '...' : page}
          </Button>
        );
      })}

      <IconButton
        variant="outline"
        size={{ initial: '1', sm: '2' }}
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        <ChevronRightIcon />
      </IconButton>
    </Flex>
  );
}