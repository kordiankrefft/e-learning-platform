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

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";
import type { LessonCreateDto } from "../../../types/lesson";

export default function LessonCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const moduleIdFromUrl = useMemo(() => {
    const raw = params.get("moduleId");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);

  const [moduleId, setModuleId] = useState<string>(
    moduleIdFromUrl != null ? String(moduleIdFromUrl) : ""
  );

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("Draft");
  const [orderIndex, setOrderIndex] = useState<string>("1");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setModulesLoading(true);

        const coursesRes = await coursesApi.getCourses();
        const courses: CourseDto[] = coursesRes.data ?? [];

        const results = await Promise.allSettled(
          courses.map((c) => modulesApi.getCourseModules(c.id))
        );

        const merged: ModuleDto[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") merged.push(...(r.value.data ?? []));
        }

        const uniq = Array.from(new Map(merged.map((m) => [m.id, m])).values());
        uniq.sort(
          (a, b) => a.courseId - b.courseId || a.orderIndex - b.orderIndex
        );

        setModules(uniq);
      } catch {
        setSaveErr("Nie udało się pobrać modułów tutora (do wyboru modułu).");
        setModules([]);
      } finally {
        setModulesLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    const mid = Number(moduleId);
    if (!Number.isFinite(mid) || mid <= 0) {
      setSaveErr("Wybierz moduł.");
      return;
    }

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }

    const oi = Number(orderIndex);
    if (!Number.isFinite(oi) || oi <= 0) {
      setSaveErr("Kolejność musi być liczbą > 0.");
      return;
    }

    const minsRaw = estimatedMinutes.trim();
    const mins = minsRaw ? Number(minsRaw) : null;
    if (minsRaw && (!Number.isFinite(mins!) || mins! <= 0)) {
      setSaveErr("Szacowany czas musi być liczbą > 0 lub pusty.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonCreateDto = {
        moduleId: mid,
        title: title.trim() || null,
        summary: summary.trim() || null,
        status: status.trim() || null,
        orderIndex: oi,
        estimatedMinutes: mins,
      };

      await lessonsApi.createLesson(dto);

      setSaveMsg("Utworzono lekcję.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć lekcji.");
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

      <Heading mb={2}>Utwórz lekcję (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Lekcja zostanie utworzona w wybranym module.
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
            <FormLabel>Moduł *</FormLabel>

            {modulesLoading ? (
              <Box py={2}>
                <Spinner size="sm" />
              </Box>
            ) : (
              <Select
                bg="gray.800"
                borderColor="gray.700"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                placeholder="Wybierz moduł"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.courseTitle ?? `Kurs #${m.courseId}`} • {m.orderIndex}.{" "}
                    {m.title}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Tytuł *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Podsumowanie</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              minH="140px"
            />
          </FormControl>

          <FormControl maxW="260px">
            <FormLabel>Status</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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

          <FormControl maxW="260px">
            <FormLabel>Szacowany czas (min)</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="np. 15"
            />
          </FormControl>

          <HStack spacing={3}>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={save}
              isLoading={saving}
              isDisabled={modulesLoading}
            >
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
