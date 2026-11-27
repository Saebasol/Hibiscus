
import { Box, Kbd, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useOpenSearchDialog } from './context';
import SearchDialog from './Dialog';
import { useEffect, useState } from 'react';


const SearchBar = () => {
  const setOpenSearchDialog = useOpenSearchDialog()[1];
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpenSearchDialog(true)
        return
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return
      }
      event.preventDefault()
      setOpenSearchDialog(true)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpenSearchDialog])

  return (
    <>
      <TextField.Root
        size="3"
        placeholder="Search the works..."
        onClick={(e) => {
          e.preventDefault()
          setOpenSearchDialog(true)
        }}
        onKeyDown={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          userSelect: 'none',
          caretColor: 'transparent',
          outlineStyle: isHovered ? 'solid' : 'none',
          outlineColor: isHovered ? 'var(--focus-8)' : 'transparent',
          outlineWidth: isHovered ? '0.125rem' : '0',
          outlineOffset: isHovered ? '-0.0625rem' : '0',
        }}
        aria-haspopup="dialog"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        <TextField.Slot side="right">
          <Box display={{ initial: 'none', sm: 'inline-block' }}>
            <Kbd size="1">/</Kbd>
          </Box>
        </TextField.Slot>
      </TextField.Root >
      <SearchDialog />
    </>
  );
}

export default SearchBar;