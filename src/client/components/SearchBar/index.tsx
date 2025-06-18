
import { TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useOpenSearchDialog } from './context';
import SearchDialog from './Dialog';
import { useState } from 'react';


const SearchBar = () => {
  const setOpenSearchDialog = useOpenSearchDialog()[1];
  const [isHovered, setIsHovered] = useState(false);

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
          outlineWidth: isHovered ? '2px' : '0',
          outlineOffset: isHovered ? '-1px' : '0',
        }}
        aria-haspopup="dialog"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root >
      <SearchDialog />
    </>
  );
}

export default SearchBar;