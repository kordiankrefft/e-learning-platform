import { useEffect, useState } from "react";
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
  Select,
  Spinner,
} from "@chakra-ui/react";

import { quizzesApi } from "../../../api/quizzesApi";
import { lessonsApi } from "../../../api/lessonsApi";
import { modulesApi } from "../../../api/modulesApi";

import type { QuizCreateDto } from "../../../types/quiz";

type LessonListItem = { id: number; title: string };
type ModuleListItem = { id: number; title: string };

export default function QuizCreatePage() {
  const navigate = useNavigate();

  const [lessonId, setLessonId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState("");
  const [passThresholdPct, setPassThresholdPct] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [listsLoading, setListsLoading] = useState(true);
  const [listsErr, setListsErr] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [modules, setModules] = useState<ModuleListItem[]>([]);

  useEffect(() => {
    const loadLists = async () => {
      setListsErr(null);
      try {
        setListsLoading(true);

        const [lessonsRes, modulesRes] = await Promise.all([
          lessonsApi.getLessons(),
          modulesApi.getModules(),
        ]);

        setLessons((lessonsRes as any)?.data ?? []);
        setModules((modulesRes as any)?.data ?? []);
      } catch {
        setListsErr("Nie udało się pobrać list (lekcje/moduły).");
      } finally {
        setListsLoading(false);
      }
    };

    loadLists();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }

    if (lessonId && moduleId) {
      setSaveErr("Wybierz albo lekcję, albo moduł (nie oba naraz).");
      return;
    }

    try {
      setSaving(true);

      const dto: QuizCreateDto = {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        lessonId: lessonId ? Number(lessonId) : null,
        moduleId: moduleId ? Number(moduleId) : null,
        timeLimitSeconds: timeLimitSeconds.trim()
          ? Number(timeLimitSeconds)
          : null,
        passThresholdPct: passThresholdPct.trim()
          ? Number(passThresholdPct)
          : null,
        maxAttempts: maxAttempts.trim() ? Number(maxAttempts) : null,
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

      <Heading mb={2}>Utwórz quiz</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nowy quiz dla modułu lub lekcji.
      </Text>

      {listsErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {listsErr}
        </Alert>
      )}

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

          {listsLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text color="gray.400">Ładowanie list...</Text>
            </HStack>
          ) : (
            <HStack spacing={4} flexWrap="wrap" align="start">
              <FormControl maxW="420px">
                <FormLabel>Lekcja</FormLabel>
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder="— opcjonalnie —"
                  value={lessonId}
                  onChange={(e) => {
                    setLessonId(e.target.value);
                    if (e.target.value) setModuleId("");
                  }}
                  isDisabled={!!moduleId}
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl maxW="420px">
                <FormLabel>Moduł</FormLabel>
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder="— opcjonalnie —"
                  value={moduleId}
                  onChange={(e) => {
                    setModuleId(e.target.value);
                    if (e.target.value) setLessonId("");
                  }}
                  isDisabled={!!lessonId}
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl maxW="240px">
                <FormLabel>Limit czasu (sek.)</FormLabel>
                <Input
                  bg="gray.800"
                  borderColor="gray.700"
                  value={timeLimitSeconds}
                  onChange={(e) => setTimeLimitSeconds(e.target.value)}
                  inputMode="numeric"
                  placeholder="opcjonalnie"
                />
              </FormControl>

              <FormControl maxW="240px">
                <FormLabel>Próg zaliczenia (%)</FormLabel>
                <Input
                  bg="gray.800"
                  borderColor="gray.700"
                  value={passThresholdPct}
                  onChange={(e) => setPassThresholdPct(e.target.value)}
                  inputMode="decimal"
                  placeholder="opcjonalnie"
                />
              </FormControl>

              <FormControl maxW="240px">
                <FormLabel>Maks. podejść</FormLabel>
                <Input
                  bg="gray.800"
                  borderColor="gray.700"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  inputMode="numeric"
                  placeholder="opcjonalnie"
                />
              </FormControl>
            </HStack>
          )}

          <FormControl>
            <FormLabel>Tytuł *</FormLabel>
            <Input
              bg="gray.800"
              borderColor="gray.700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              maxLength={1000}
              minH="160px"
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
