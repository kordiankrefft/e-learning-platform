import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

type Props = {
  content: any;
  onCompleted: () => void;

  initialAnswer?: any;
  initialChecked?: boolean;

  onAnswer?: (answer: any) => void;
  onChecked?: (checked: boolean) => void;
};

export default function SingleChoiceBlock({
  content,
  onCompleted,
  initialAnswer,
  initialChecked = false,
  onAnswer,
  onChecked,
}: Props) {
  const [value, setValue] = useState<string>(
    initialAnswer != null ? String(initialAnswer) : ""
  );
  const [showResult, setShowResult] = useState<boolean>(initialChecked);

  useEffect(() => {
    setValue(initialAnswer != null ? String(initialAnswer) : "");
  }, [initialAnswer]);

  useEffect(() => {
    setShowResult(initialChecked);
  }, [initialChecked]);

  const isCorrect = Number(value) === content.correctIndex;

  const handleCheck = () => {
    setShowResult(true);
    onChecked?.(true);

    if (isCorrect) onCompleted();
  };

  return (
    <Box p={4} bg="gray.700" borderRadius="md">
      <Text mb={3}>{content.question}</Text>

      <RadioGroup
        value={value}
        onChange={(v) => {
          setValue(v);
          setShowResult(false); // zmiana odpowiedzi chowa alert
          onAnswer?.(v);
        }}
      >
        <Stack>
          {content.options?.map((opt: string, index: number) => (
            <Radio key={index} value={index.toString()}>
              {opt}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>

      <Button mt={3} onClick={handleCheck} isDisabled={value === ""}>
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
