import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Stack,
  HStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";

import { courseCategoriesApi } from "../../../api/courseCategoriesApi";
import type { CourseCategoryCreateDto } from "../../../types/courseCategory";

export default function CourseCategoryCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!name.trim()) {
      setSaveErr("Nazwa jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: CourseCategoryCreateDto = {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
      };

      await courseCategoriesApi.createCourseCategory(dto);

      setSaveMsg("Utworzono kategorię.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć kategorii.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={6}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Wróć
        </Button>
      </HStack>

      <Heading mb={2}>Utwórz kategorię kursów</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nową kategorię do systemu.
      </Text>

      {saveErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}
      {saveMsg && (
        <Alert status="success" borderRadius="md" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box
        bg="gray.900"
        borderRadius="xl"
        p={{ base: 5, md: 6 }}
        boxShadow="lg"
      >
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

          <FormControl>
            <FormLabel>Nazwa *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Opis</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minH="140px"
              maxLength={1000}
            />
          </FormControl>

          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
