import { useEffect, useState } from "react";
import { Box, Text, Input, Button, Alert, AlertIcon } from "@chakra-ui/react";

type Props = {
  content: any;
  onCompleted: () => void;

  initialAnswer?: any;
  initialChecked?: boolean;

  onAnswer?: (answer: any) => void;
  onChecked?: (checked: boolean) => void;
};

export default function FillBlankBlock({
  content,
  onCompleted,
  initialAnswer,
  initialChecked = false,
  onAnswer,
  onChecked,
}: Props) {
  const [value, setValue] = useState<string>(initialAnswer ?? "");
  const [showResult, setShowResult] = useState<boolean>(initialChecked);

  useEffect(() => {
    setValue(initialAnswer ?? "");
  }, [initialAnswer]);

  useEffect(() => {
    setShowResult(initialChecked);
  }, [initialChecked]);

  const normalize = (v: string) =>
    content.caseSensitive ? v.trim() : v.trim().toLowerCase();

  const isCorrect = normalize(value) === normalize(content.answer);

  const handleCheck = () => {
    setShowResult(true);
    onChecked?.(true);

    if (isCorrect) onCompleted();
  };

  return (
    <Box p={4} bg="gray.700" borderRadius="md">
      <Text mb={3}>{content.prompt}</Text>

      <Input
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          setShowResult(false); // ukrywamy alert przy zmianie
          onAnswer?.(newValue);
        }}
        placeholder="Type your answer..."
      />

      <Button mt={3} onClick={handleCheck} isDisabled={!value}>
        Check
      </Button>

      {showResult && (
        <Alert status={isCorrect ? "success" : "error"} mt={3}>
          <AlertIcon />
          {isCorrect ? "Correct!" : content.explanation}
        </Alert>
      )}
    </Box>
  );
}
