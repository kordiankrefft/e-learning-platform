import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Stack,
  HStack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";

import { courseCategoriesApi } from "../../../api/courseCategoriesApi";
import type {
  CourseCategoryDto,
  CourseCategoryEditDto,
} from "../../../types/courseCategory";

export default function CourseCategoryEditPage() {
  const { id } = useParams();
  const categoryId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<CourseCategoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!categoryId || Number.isNaN(categoryId)) {
      setError("Nieprawidłowe ID kategorii.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await courseCategoriesApi.getCourseCategory(categoryId);
      const data = res.data;

      setItem(data);

      setName(data.name ?? "");
      setDescription(data.description ?? "");
    } catch {
      setError("Nie udało się pobrać danych kategorii.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [categoryId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!name.trim()) {
      setSaveErr("Nazwa jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: CourseCategoryEditDto = {
        id: categoryId,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
      };

      await courseCategoriesApi.editCourseCategory(categoryId, dto);

      setSaveMsg("Zapisano zmiany.");
      await load();
    } catch {
      setSaveErr("Nie udało się zapisać zmian.");
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

      <Heading mb={2}>Edytuj kategorię kursów</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych kategorii.
      </Text>

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && item && (
        <Box
          bg="gray.900"
          borderRadius="xl"
          p={{ base: 5, md: 6 }}
          boxShadow="lg"
        >
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {item.id}</Badge>
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "AKTYWNA" : "NIEAKTYWNA"}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
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
                    Zapisz zmiany
                  </Button>
                </HStack>

                {saveMsg && <Box color="green.300">{saveMsg}</Box>}
                {saveErr && <Box color="red.300">{saveErr}</Box>}
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
