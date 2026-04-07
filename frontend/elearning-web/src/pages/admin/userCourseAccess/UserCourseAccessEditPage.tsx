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
  Checkbox,
  Select,
} from "@chakra-ui/react";

import { userCourseAccessesApi } from "../../../api/userCourseAccessesApi";
import { coursePricingPlansApi } from "../../../api/coursePricingPlansApi";

import type {
  UserCourseAccessDto,
  UserCourseAccessEditDto,
} from "../../../types/userCourseAccess";
import type { CoursePricingPlanDto } from "../../../types/coursePricingPlan";

export default function UserCourseAccessEditPage() {
  const { id } = useParams();
  const accessId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<UserCourseAccessDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plans, setPlans] = useState<CoursePricingPlanDto[]>([]);

  const [coursePricingPlanId, setCoursePricingPlanId] = useState("");
  const [accessEnd, setAccessEnd] = useState("");
  const [isRevoked, setIsRevoked] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";
    const dt = typeof value === "string" ? new Date(value) : value;
    return dt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  };

  const coursePlans = useMemo(() => {
    if (!item) return [];
    return plans.filter((p: any) => p.courseId === item.courseId);
  }, [plans, item]);

  const toDateTimeLocalValue = (value?: string | Date | null) => {
    if (!value) return "";
    const dt = typeof value === "string" ? new Date(value) : value;
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = dt.getFullYear();
    const mm = pad(dt.getMonth() + 1);
    const dd = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mi = pad(dt.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const planLabel = (p: CoursePricingPlanDto) => {
    const name = (p as any).name ?? `Plan #${p.id}`;
    const courseId = (p as any).courseId;
    return courseId != null ? `${name} (course #${courseId})` : name;
  };

  const selectedPlan = useMemo(() => {
    const idNum = Number(coursePricingPlanId);
    if (!idNum || Number.isNaN(idNum)) return null;
    return plans.find((p) => p.id === idNum) ?? null;
  }, [coursePricingPlanId, plans]);

  const load = async () => {
    if (!accessId || Number.isNaN(accessId)) {
      setError("Nieprawidłowe ID dostępu.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await userCourseAccessesApi.getUserCourseAccess(accessId);
      const data = res.data;

      setItem(data);

      setCoursePricingPlanId(
        data.coursePricingPlanId != null ? String(data.coursePricingPlanId) : ""
      );
      setAccessEnd(toDateTimeLocalValue(data.accessEnd as any));
      setIsRevoked(!!data.isRevoked);
    } catch {
      setError("Nie udało się pobrać danych dostępu.");
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await coursePricingPlansApi.getCoursePricingPlans();
      setPlans(res.data ?? []);
    } catch {
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    load();
  }, [accessId]);

  useEffect(() => {
    loadPlans();
  }, []);

  const save = async () => {
    setSaveMsg(null);
    setSaveErr(null);

    try {
      setSaving(true);

      const dto: UserCourseAccessEditDto = {
        id: accessId,
        coursePricingPlanId: coursePricingPlanId.trim()
          ? Number(coursePricingPlanId)
          : null,
        accessEnd: accessEnd.trim() ? new Date(accessEnd).toISOString() : null,
        isRevoked,
      };

      await userCourseAccessesApi.editUserCourseAccess(accessId, dto);

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

      <Heading mb={2}>Edytuj dostęp do kursu</Heading>
      <Text color="gray.400" mb={6}>
        Zmieniasz plan, koniec dostępu i flagę cofnięcia.
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
                {item.isActive ? "AKTYWNY" : "NIEAKTYWNY"}
              </Badge>

              <Badge colorScheme="yellow">
                Użytkownik: {item.userName ?? `#${item.userId}`}
              </Badge>

              <Badge colorScheme="purple">
                Kurs: {item.courseTitle ?? `#${item.courseId}`}
              </Badge>

              <Badge colorScheme="teal">
                Plan:{" "}
                {item.coursePricingPlanName ??
                  (selectedPlan
                    ? planLabel(selectedPlan)
                    : item.coursePricingPlanId
                    ? `#${item.coursePricingPlanId}`
                    : "—")}
              </Badge>
            </HStack>

            <Text color="gray.400">
              <b>Początek dostępu:</b> {formatDateTime(item.accessStart as any)}{" "}
              • <b>Koniec dostępu:</b>{" "}
              {item.accessEnd ? formatDateTime(item.accessEnd as any) : "—"}
            </Text>

            <Divider borderColor="gray.700" />

            <Stack spacing={4}>
              <FormControl maxW="420px">
                <FormLabel>Plan cenowy</FormLabel>
                <Select
                  bg="gray.800"
                  borderColor="gray.700"
                  placeholder={loadingPlans ? "Ładowanie..." : "— brak —"}
                  value={coursePricingPlanId}
                  onChange={(e) => setCoursePricingPlanId(e.target.value)}
                  isDisabled={loadingPlans || !item}
                >
                  {coursePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {planLabel(p)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl maxW="320px">
                <FormLabel>Koniec dostępu</FormLabel>
                <Input
                  type="datetime-local"
                  bg="gray.800"
                  borderColor="gray.700"
                  value={accessEnd}
                  onChange={(e) => setAccessEnd(e.target.value)}
                />
              </FormControl>

              <Checkbox
                isChecked={isRevoked}
                onChange={(e) => setIsRevoked(e.target.checked)}
                colorScheme="yellow"
              >
                Cofnij dostęp
              </Checkbox>

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
          </Stack>
        </Box>
      )}
    </Box>
  );
}
