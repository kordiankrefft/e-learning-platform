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
import { lessonAttachmentsApi } from "../../../api/lessonAttachmentsApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";
import type { LessonDto } from "../../../types/lesson";
import type { LessonAttachmentCreateDto } from "../../../types/lessonAttachment";

export default function LessonAttachmentCreatePage() {
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

  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");

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

    if (!fileName.trim()) {
      setSaveErr("Nazwa pliku jest wymagana.");
      return;
    }

    if (!fileUrl.trim()) {
      setSaveErr("FileUrl jest wymagany.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonAttachmentCreateDto = {
        lessonId: lid,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        description: description.trim() || null,
      };

      await lessonAttachmentsApi.create(dto);

      setSaveMsg("Utworzono załącznik.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć załącznika.");
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

      <Heading mb={2}>Utwórz załącznik (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Załącznik zostanie dodany do wybranej lekcji.
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

          <FormControl>
            <FormLabel>Nazwa pliku *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="np. instrukcja.pdf"
            />
          </FormControl>

          <FormControl>
            <FormLabel>FileUrl *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
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
