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
import { quizzesApi } from "../../../api/quizzesApi";

import type { CourseDto } from "../../../types/course";
import type { ModuleDto } from "../../../types/module";
import type { QuizCreateDto } from "../../../types/quiz";

export default function QuizCreatePage() {
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
  const [description, setDescription] = useState("");

  const [timeLimitSeconds, setTimeLimitSeconds] = useState<string>("");
  const [passThresholdPct, setPassThresholdPct] = useState<string>("70");
  const [maxAttempts, setMaxAttempts] = useState<string>("1");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setModulesLoading(true);
        setSaveErr(null);

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

    const tlsRaw = timeLimitSeconds.trim();
    const tls = tlsRaw ? Number(tlsRaw) : null;
    if (tlsRaw && (!Number.isFinite(tls!) || tls! <= 0)) {
      setSaveErr("Limit czasu (s) musi być liczbą > 0 lub pusty.");
      return;
    }

    const pctRaw = passThresholdPct.trim();
    const pct = pctRaw ? Number(pctRaw) : null;
    if (pctRaw && (!Number.isFinite(pct!) || pct! < 0 || pct! > 100)) {
      setSaveErr("Próg zaliczenia (%) musi być w zakresie 0–100 lub pusty.");
      return;
    }

    const maRaw = maxAttempts.trim();
    const ma = maRaw ? Number(maRaw) : null;
    if (maRaw && (!Number.isFinite(ma!) || ma! <= 0)) {
      setSaveErr("Maks. liczba prób musi być liczbą > 0 lub pusta.");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizCreateDto = {
        lessonId: null,
        moduleId: mid,
        title: title.trim(),
        description: description.trim() || null,
        timeLimitSeconds: tls,
        passThresholdPct: pct,
        maxAttempts: ma,
      };

      await quizzesApi.createQuiz(dto);

      setSaveMsg("Utworzono quiz.");
      navigate(-1);
    } catch {
      setSaveErr("Nie udało się utworzyć quizu.");
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

      <Heading mb={2}>Utwórz quiz (Tutor)</Heading>
      <Text color="gray.400" mb={6}>
        Quiz będzie przypisany do wybranego modułu.
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
            <FormLabel>Opis</FormLabel>
            <Textarea
              bg="gray.800"
              borderColor="gray.700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minH="140px"
            />
          </FormControl>

          <FormControl maxW="260px">
            <FormLabel>Limit czasu (sekundy)</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={timeLimitSeconds}
              onChange={(e) => setTimeLimitSeconds(e.target.value)}
              placeholder="np. 900"
            />
          </FormControl>

          <FormControl maxW="260px">
            <FormLabel>Próg zaliczenia (%)</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={passThresholdPct}
              onChange={(e) => setPassThresholdPct(e.target.value)}
              placeholder="np. 70"
            />
          </FormControl>

          <FormControl maxW="260px">
            <FormLabel>Maks. liczba prób</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="np. 1"
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
