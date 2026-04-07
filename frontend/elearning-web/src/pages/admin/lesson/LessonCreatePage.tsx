import { useEffect, useMemo, useState } from "react";
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
  Badge,
} from "@chakra-ui/react";

import { lessonsApi } from "../../../api/lessonsApi";
import { modulesApi } from "../../../api/modulesApi";

import type { LessonCreateDto } from "../../../types/lesson";
import type { ModuleDto } from "../../../types/module";

export default function LessonCreatePage() {
  const navigate = useNavigate();

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

  const selectedModule = useMemo(() => {
    const id = Number(moduleId);
    if (!id || Number.isNaN(id)) return null;
    return modules.find((m) => m.id === id) ?? null;
  }, [moduleId, modules]);

  const moduleLabel = (m: ModuleDto) => {
    const anyM = m as any;
    return anyM.title?.trim() || anyM.name?.trim() || `Moduł #${m.id}`;
  };

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

      const dto: LessonCreateDto = {
        moduleId: Number(moduleId),
        title: title.trim(),
        summary: summary.trim() ? summary.trim() : null,
        status: status.trim(),
        orderIndex: Number(orderIndex),
        estimatedMinutes: estimatedMinutes.trim()
          ? Number(estimatedMinutes)
          : null,
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

      <Heading mb={2}>Utwórz lekcję</Heading>
      <Text color="gray.400" mb={6}>
        Dodaj nową lekcję do modułu.
      </Text>

      {modulesErr && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {modulesErr}
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

              {selectedModule && (
                <HStack mt={3} spacing={2} wrap="wrap">
                  <Badge colorScheme="purple">
                    {moduleLabel(selectedModule)}
                  </Badge>
                </HStack>
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
              Utwórz
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}
