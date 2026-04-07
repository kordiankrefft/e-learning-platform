import { Box, Heading, Text } from "@chakra-ui/react";

type Props = {
  content: any;
};

export default function TextBlock({ content }: Props) {
  return (
    <Box p={4} bg="gray.700" borderRadius="md">
      {content.title && (
        <Heading size="md" mb={2}>
          {content.title}
        </Heading>
      )}
      <Text whiteSpace="pre-line">{content.text}</Text>
    </Box>
  );
}
