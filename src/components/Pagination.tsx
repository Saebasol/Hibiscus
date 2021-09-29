import {
  Button,
  ButtonGroup,
  ButtonProps,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';

// https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range
function range(start: number, stop?: number, step?: number) {
  if (typeof stop == 'undefined') {
    // one param defined
    stop = start;
    start = 0;
  }

  if (typeof step == 'undefined') {
    step = 1;
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }

  var result = [];
  for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }

  return result;
}

const LinkButton = ({
  page,
  currentPage,
}: {
  page: number;
  currentPage: number;
}) => {
  return (
    <Link to={`/list/${page}`}>
      {currentPage === page ? (
        <Button bgColor="whiteAlpha.300" rounded="none">
          {page}
        </Button>
      ) : (
        <Button rounded="none">{page}</Button>
      )}
    </Link>
  );
};

const PreviousButton = ({ digit }: { digit: number }) => {
  let previous = Math.floor(digit);

  if (Number.isInteger(digit)) {
    previous = Math.floor(digit) - 1;
  }

  let pb = (
    <Link to={`/list/${previous * 10}`}>
      <IconButton
        aria-label="previous"
        borderRightRadius="sm"
        icon={<ArrowLeftIcon />}
      />
    </Link>
  );

  if (
    Math.floor(digit) === 0 ||
    (Math.floor(digit) === 1 && Number.isInteger(digit))
  ) {
    pb = (
      <IconButton
        aria-label="previous"
        borderRightRadius="sm"
        icon={<ArrowLeftIcon />}
        isDisabled
      />
    );
  }

  return pb;
};

const NextButton = ({ total, digit }: { total: number; digit: number }) => {
  let next = Math.floor(digit) + 1;

  if (Number.isInteger(digit)) {
    next = Math.floor(digit);
  }

  let nb = (
    <Link to={`/list/${next * 10 + 1}`}>
      <IconButton
        aria-label="next"
        borderLeftRadius="sm"
        icon={<ArrowRightIcon />}
      />
    </Link>
  );

  if (next * 10 - 1 > total) {
    nb = (
      <IconButton
        aria-label="next"
        borderLeftRadius="sm"
        size="sm"
        icon={<ArrowRightIcon />}
        isDisabled
      />
    );
  }

  return nb;
};

const Pagination = ({
  total,
  currentPage,
}: {
  total: number;
  currentPage: number;
}) => {
  const digit = currentPage / 10;

  let startAt = Math.floor(currentPage / 10) * 10 + 1;
  let endAt = startAt + 10;

  if (Number.isInteger(digit)) {
    startAt = Math.floor((currentPage - 1) / 10) * 10 + 1;
    endAt = startAt + 10;
  }

  return (
    <nav style={{display: "block", width:"100%", overflowX:"auto"}}>
      <ButtonGroup
        isAttached
        variant="outline"
        size="sm"
        p={4}
      >
        <PreviousButton digit={digit} />
        {range(startAt, endAt).map((i) => (
          <LinkButton currentPage={currentPage} page={i} />
        ))}
        <NextButton total={total} digit={digit} />
      </ButtonGroup>
    </nav>
  );
};

export default Pagination;
