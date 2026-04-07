import { useEffect, useMemo, useState } from "react";
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
  Select,
} from "@chakra-ui/react";

import { lessonsApi } from "../../../api/lessonsApi";
import { modulesApi } from "../../../api/modulesApi";

import type { LessonDto, LessonEditDto } from "../../../types/lesson";
import type { ModuleDto } from "../../../types/module";

export default function LessonEditPage() {
  const { id } = useParams();
  const lessonId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesErr, setModulesErr] = useState<string | null>(null);

  const moduleLabel = (m: ModuleDto) => {
    const anyM = m as any;
    return anyM.title?.trim() || anyM.name?.trim() || `Moduł #${m.id}`;
  };

  const selectedModule = useMemo(() => {
    const id = Number(moduleId);
    if (!id || Number.isNaN(id)) return null;
    return modules.find((m) => m.id === id) ?? null;
  }, [moduleId, modules]);

  const load = async () => {
    if (!lessonId || Number.isNaN(lessonId)) {
      setError("Nieprawidłowe ID lekcji.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await lessonsApi.getLesson(lessonId);
      const data = res.data;

      setItem(data);

      setModuleId(String(data.moduleId ?? ""));
      setTitle(data.title ?? "");
      setSummary(data.summary ?? "");
      setStatus(data.status ?? "");
      setOrderIndex(String(data.orderIndex ?? 0));
      setEstimatedMinutes(
        data.estimatedMinutes != null ? String(data.estimatedMinutes) : ""
      );
    } catch {
      setError("Nie udało się pobrać danych lekcji.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [lessonId]);

  useEffect(() => {
    const loadModules = async () => {
      setModulesErr(null);
      try {
        setModulesLoading(true);
        const res = await modulesApi.getModules();
        setModules(res.data ?? []);
      } catch {
        setModulesErr("Nie udało się pobrać listy modułów.");
        setModules([]);
      } finally {
        setModulesLoading(false);
      }
    };

    loadModules();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    if (!moduleId.trim()) {
      setSaveErr("Moduł jest wymagany.");
      return;
    }
    if (!title.trim()) {
      setSaveErr("Tytuł jest wymagany.");
      return;
    }
    if (!status.trim()) {
      setSaveErr("Status jest wymagany.");
      return;
    }
    if (!orderIndex.trim()) {
      setSaveErr("Kolejność (orderIndex) jest wymagana.");
      return;
    }

    try {
      setSaving(true);

      const dto: LessonEditDto = {
        id: lessonId,
        moduleId: Number(moduleId),
        title: title.trim(),
        summary: summary.trim() ? summary.trim() : null,
        status: status.trim(),
        orderIndex: Number(orderIndex),
        estimatedMinutes: estimatedMinutes.trim()
          ? Number(estimatedMinutes)
          : null,
      };

      await lessonsApi.editLesson(lessonId, dto);

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

      <Heading mb={2}>Edytuj lekcję</Heading>
      <Text color="gray.400" mb={6}>
        Edycja danych lekcji.
      </Text>

      {modulesErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {modulesErr}
        </Alert>
      )}

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

              {item.moduleTitle && (
                <Badge colorScheme="purple">Moduł: {item.moduleTitle}</Badge>
              )}

              {selectedModule && (
                <Badge colorScheme="teal">
                  Wybrany: {moduleLabel(selectedModule)}
                </Badge>
              )}
            </HStack>

            <Divider borderColor="gray.700" />

            <Box>
              <Heading size="md" mb={3}>
                Dane
              </Heading>

              <Stack spacing={4}>
                <HStack spacing={4} flexWrap="wrap" align="start">
                  <FormControl maxW="420px" isDisabled={modulesLoading}>
                    <FormLabel>Moduł *</FormLabel>

                    {modulesLoading ? (
                      <HStack>
                        <Spinner size="sm" />
                        <Text color="gray.400">Ładowanie modułów...</Text>
                      </HStack>
                    ) : (
                      <Select
                        bg="gray.800"
                        borderColor="gray.700"
                        placeholder="Wybierz moduł..."
                        value={moduleId}
                        onChange={(e) => setModuleId(e.target.value)}
                      >
                        {modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {moduleLabel(m)}
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormControl>

                  <FormControl maxW="260px">
                    <FormLabel>Kolejność *</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(e.target.value)}
                      inputMode="numeric"
                    />
                  </FormControl>

                  <FormControl maxW="260px">
                    <FormLabel>Szac. minuty</FormLabel>
                    <Input
                      bg="gray.800"
                      borderColor="gray.700"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value)}
                      inputMode="numeric"
                    />
                  </FormControl>
                </HStack>

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
                  <FormLabel>Status *</FormLabel>
                  <Input
                    bg="gray.800"
                    borderColor="gray.700"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    maxLength={50}
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
                    maxLength={1000}
                  />
                </FormControl>

                <HStack spacing={3}>
                  <Button
                    colorScheme="yellow"
                    variant="outline"
                    onClick={save}
                    isLoading={saving}
                    isDisabled={modulesLoading || !!modulesErr}
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
