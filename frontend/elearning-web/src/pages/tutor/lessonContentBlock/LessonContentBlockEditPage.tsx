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

import { lessonContentBlocksApi } from "../../../api/lessonContentBlocksApi";
import type {
  LessonContentBlockDto,
  LessonContentBlockEditDto,
} from "../../../types/lessonContentBlock";

export default function LessonContentBlockEditPage() {
  const { id } = useParams();
  const blockId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<LessonContentBlockDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blockType, setBlockType] = useState("");
  const [content, setContent] = useState("");
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = async () => {
    if (!blockId || Number.isNaN(blockId)) {
      setError("Nieprawidłowe ID bloku.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await lessonContentBlocksApi.getById(blockId);
      const data = res.data;

      setItem(data);
      setBlockType(data.blockType ?? "");
      setContent(data.content ?? "");
      setOrderIndex(String(data.orderIndex ?? 1));
    } catch {
      setError("Nie udało się pobrać danych bloku.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [blockId]);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!item) {
      setSaveErr("Nie wczytano bloku.");
      return;
    }

    if (!blockType.trim()) {
      setSaveErr("BlockType jest wymagany.");
      return;
    }

    const oi = Number(orderIndex);
    if (!Number.isFinite(oi) || oi <= 0) {
      setSaveErr("Kolejność musi być liczbą > 0.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonContentBlockEditDto = {
        id: blockId,
        lessonId: item.lessonId,
        blockType: blockType.trim(),
        content: content.trim() || null,
        orderIndex: oi,
      };

      await lessonContentBlocksApi.update(blockId, dto);
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

      <Heading mb={2}>Edytuj blok treści (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych bloku treści
      </Text>

      {loading && (
        <Box py={10} textAlign="center">
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && item && (
        <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
          <Stack spacing={5}>
            <HStack spacing={3} wrap="wrap">
              <Badge colorScheme="blue">ID: {item.id}</Badge>
              <Badge colorScheme={item.isActive ? "green" : "gray"}>
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>
              <Badge colorScheme="purple">
                Lekcja: {item.lessonTitle ?? `#${item.lessonId}`}
              </Badge>
            </HStack>

            <Divider borderColor="gray.700" />

            <FormControl maxW="320px">
              <FormLabel>BlockType *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={blockType}
                onChange={(e) => setBlockType(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Content (JSON / tekst)</FormLabel>
              <Textarea
                bg="gray.800"
                borderColor="gray.700"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                minH="220px"
              />
            </FormControl>

            <FormControl maxW="220px">
              <FormLabel>Kolejność *</FormLabel>
              <Input
                bg="gray.800"
                borderColor="gray.700"
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
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
      )}
    </Box>
  );
}
