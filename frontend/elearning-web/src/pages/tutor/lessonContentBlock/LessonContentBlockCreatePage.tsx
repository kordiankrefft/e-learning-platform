import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Select,
  Spinner,
} from "@chakra-ui/react";

import { coursesApi } from "../../../api/coursesApi";
import { modulesApi } from "../../../api/modulesApi";
import { lessonsApi } from "../../../api/lessonsApi";
import { lessonContentBlocksApi } from "../../../api/lessonContentBlocksApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";
import type { LessonDto } from "../../../types/lesson";
import type { LessonContentBlockCreateDto } from "../../../types/lessonContentBlock";

export default function LessonContentBlockCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const lessonIdFromUrl = useMemo(() => {
    const raw = params.get("lessonId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  const [lessonId, setLessonId] = useState<string>(
    lessonIdFromUrl != null ? String(lessonIdFromUrl) : ""
  );

  const [blockType, setBlockType] = useState("text");
  const [content, setContent] = useState("");
  const [orderIndex, setOrderIndex] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLessonsLoading(true);
        setSaveErr(null);

        const coursesRes = await coursesApi.getCourses();
        const courses: CourseDto[] = coursesRes.data ?? [];

        const modulesRes = await Promise.allSettled(
          courses.map((c) => modulesApi.getCourseModules(c.id))
        );

        const modules: ModuleDto[] = [];
        for (const r of modulesRes) {
          if (r.status === "fulfilled") modules.push(...(r.value.data ?? []));
        }

        const lessonsRes = await Promise.allSettled(
          modules.map((m) => lessonsApi.getModuleLessons(m.id))
        );

        const merged: LessonDto[] = [];
        for (const r of lessonsRes) {
          if (r.status === "fulfilled") merged.push(...(r.value.data ?? []));
        }

        const uniq = Array.from(new Map(merged.map((l) => [l.id, l])).values());
        uniq.sort(
          (a, b) => a.moduleId - b.moduleId || a.orderIndex - b.orderIndex
        );

        setLessons(uniq);
      } catch {
        setSaveErr("Nie udało się pobrać lekcji tutora (do wyboru lekcji).");
        setLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    const lid = Number(lessonId);
    if (!Number.isFinite(lid) || lid <= 0) {
      setSaveErr("Wybierz lekcję.");
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

      const dto: LessonContentBlockCreateDto = {
        lessonId: lid,
        blockType: blockType.trim(),
        content: content.trim() || null,
        orderIndex: oi,
      };

      await lessonContentBlocksApi.create(dto);

      setSaveMsg("Utworzono blok treści.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć bloku treści.");
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

      <Heading mb={2}>Utwórz blok treści (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Blok zostanie dodany do wybranej lekcji.
      </Text>

      {saveErr && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {saveErr}
        </Alert>
      )}

      {saveMsg && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {saveMsg}
        </Alert>
      )}

      <Box bg="gray.900" borderRadius="xl" p={6} boxShadow="lg">
        <Stack spacing={5}>
          <Divider borderColor="gray.700" />

          <FormControl>
            <FormLabel>Lekcja *</FormLabel>

            {lessonsLoading ? (
              <Box py={2}>
                <Spinner size="sm" />
              </Box>
            ) : (
              <Select
                bg="gray.800"
                borderColor="gray.700"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                placeholder="Wybierz lekcję"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.moduleTitle ?? `Moduł #${l.moduleId}`} • {l.orderIndex}.{" "}
                    {l.title}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

          <FormControl maxW="320px">
            <FormLabel>BlockType *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={blockType}
              onChange={(e) => setBlockType(e.target.value)}
              placeholder="np. text, image, video, fillBlank..."
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
              placeholder='np. {"text":"Hello"} albo zwykły tekst'
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
              isDisabled={lessonsLoading}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
