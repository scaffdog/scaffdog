import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { CloseIcon } from '../../components/icons/CloseIcon';
import type { PlaygroundInputEntry } from '../../states/playground';
import {
  playgroundInputEntrySchema,
  usePlaygroundInputState,
} from '../../states/playground';

const _Entry: React.FC<{
  index: number;
  value: PlaygroundInputEntry;
  onDelete: (index: number) => void;
}> = ({ index, value: { key, value }, onDelete }) => {
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onDelete(index);
    },
    [index, onDelete],
  );

  return (
    <Tr>
      <Td pl="0">{key}</Td>
      <Td>{value}</Td>
      <Td p="0.5" textAlign="right">
        <IconButton
          icon={<Icon as={CloseIcon} w="2.5" h="2.5" />}
          aria-label="Delete"
          p="0"
          w="4"
          minW="0"
          h="4"
          borderRadius="full"
          variant="ghost"
          colorScheme="blackAlpha"
          onClick={handleDeleteClick}
        />
      </Td>
    </Tr>
  );
};

export type Props = {};

export const PlaygroundInputEditor: React.FC<Props> = () => {
  const {
    register,
    handleSubmit: handleSubmitFactory,
    formState: { errors },
    reset,
  } = useForm<PlaygroundInputEntry>({
    resolver: yupResolver(playgroundInputEntrySchema),
  });

  const [inputs, setInputs] = usePlaygroundInputState();

  const handleSubmit = useCallback(
    (entry: PlaygroundInputEntry) => {
      setInputs([entry, ...inputs]);
      reset();
    },
    [inputs, setInputs, reset],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const values = inputs;
      setInputs([...values.slice(0, index), ...values.slice(index + 1)]);
    },
    [inputs, setInputs],
  );

  return (
    <div>
      <form onSubmit={handleSubmitFactory(handleSubmit)}>
        <Flex>
          <FormControl flex="1 1 35%" isInvalid={errors.key != null}>
            <FormLabel fontSize="sm">Key</FormLabel>
            <Input
              id="key"
              variant="flushed"
              type="text"
              placeholder="name"
              {...register('key')}
            />
            <FormErrorMessage>{errors.key?.message}</FormErrorMessage>
          </FormControl>

          <FormControl flex="1 0 65%" pl="2" isInvalid={errors.value != null}>
            <FormLabel fontSize="sm">Value</FormLabel>
            <Input
              id="value"
              variant="flushed"
              type="text"
              placeholder="scaffdog"
              {...register('value')}
            />
            <FormErrorMessage>{errors.value?.message}</FormErrorMessage>
          </FormControl>
        </Flex>

        <Box mt="2" textAlign="right">
          <Button type="submit" size="sm" colorScheme="purple">
            Add
          </Button>
        </Box>
      </form>

      <TableContainer mt="5">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th pl="0">Key</Th>
              <Th>Value</Th>
              <Th pr="0" />
            </Tr>
          </Thead>

          <Tbody>
            {inputs.map((entry, i) => (
              <_Entry
                key={entry.key}
                index={i}
                value={entry}
                onDelete={handleDelete}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};
