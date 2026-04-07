import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import { coursesApi } from "../../api/coursesApi";
import { quizzesApi } from "../../api/quizzesApi";
import type { UserDto } from "../../types/user";
import type { CourseDto } from "../../types/course";
import type { QuizDto } from "../../types/quiz";
import { DashboardCard } from "../../components/DashboardCard";

function AdminDashboardPage() {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [logsTotalCount, setLogsTotalCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          usersResponse,
          coursesResponse,
          auditLogsResponse,
          quizzesResponse,
        ] = await Promise.all([
          adminApi.getUsers(),
          coursesApi.getCourses(),
          adminApi.getAuditLogsPaged(1, 1),
          quizzesApi.getQuizzes(),
        ]);

        setUsers(usersResponse.data ?? []);
        setCourses(coursesResponse.data ?? []);
        setLogsTotalCount(auditLogsResponse.data.totalCount ?? 0);
        setQuizzes(quizzesResponse.data ?? []);
      } catch (error) {
        console.error("Błąd podczas ładowania danych admina:", error);
      }
    };

    if (isAuthenticated && hasRole("Admin")) {
      loadDashboardData();
    }
  }, [isAuthenticated, hasRole]);

  if (!isAuthenticated || !hasRole("Admin")) {
    return (
      <Box p={8}>
        <Heading size="md">Brak dostępu (wymagana rola Admin)</Heading>
      </Box>
    );
  }

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Panel administratora</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Użytkownicy</StatLabel>
          <StatNumber>{users.length}</StatNumber>
          <StatHelpText>aktywni w systemie</StatHelpText>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Kursy</StatLabel>
          <StatNumber>{courses.length}</StatNumber>
          <StatHelpText>w bazie</StatHelpText>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Quizy</StatLabel>
          <StatNumber>{quizzes.length}</StatNumber>
          <StatHelpText>zdefiniowane</StatHelpText>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Logi audytu</StatLabel>
          <StatNumber>{logsTotalCount}</StatNumber>
          <StatHelpText>operacje w systemie</StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <DashboardCard
          title="Zarządzanie użytkownikami"
          description="Podgląd i edycja profili użytkowników, aktywacja/dezaktywacja."
          buttonText="Przejdź do użytkowników"
          onClick={() => navigate("/admin/users")}
        />

        <DashboardCard
          title="Kursy"
          description="Zarządzanie kursami, przypisywanie tutorów, konfiguracja statusu."
          buttonText="Przejdź do kursów"
          onClick={() => navigate("/admin/courses")}
        />

        <DashboardCard
          title="Quizy"
          description="Lista quizów, edycja parametrów, usuwanie."
          buttonText="Przejdź do quizów"
          onClick={() => navigate("/admin/quizzes")}
        />

        <DashboardCard
          title="Logi systemu"
          description="Podgląd operacji wykonanych w systemie przez użytkowników."
          buttonText="Przejdź do logów"
          onClick={() => navigate("/admin/audit-logs")}
        />

        <DashboardCard
          title="Announcements"
          description="Zarządzanie ogłoszeniami widocznymi w systemie."
          buttonText="Przejdź do ogłoszeń"
          onClick={() => navigate("/admin/announcements")}
        />

        <DashboardCard
          title="Szablony certyfikatów"
          description="Szablony certyfikatów — konfiguracja i edycja."
          buttonText="Przejdź do szablonów"
          onClick={() => navigate("/admin/certificate-templates")}
        />

        <DashboardCard
          title="Kategorie kursów"
          description="Kategorie kursów — dodawanie, edycja, porządkowanie."
          buttonText="Przejdź do kategorii"
          onClick={() => navigate("/admin/course-categories")}
        />

        <DashboardCard
          title="Plany cenowe kursów"
          description="Plany cenowe kursów — tworzenie i utrzymanie."
          buttonText="Przejdź do planów"
          onClick={() => navigate("/admin/course-pricing-plans")}
        />

        <DashboardCard
          title="Wystawione certyfikaty"
          description="Wystawione certyfikaty — lista, filtrowanie, status."
          buttonText="Przejdź do certyfikatów"
          onClick={() => navigate("/admin/issued-certificates")}
        />

        <DashboardCard
          title="Lekcje"
          description="Lekcje — lista i zarządzanie treścią lekcji."
          buttonText="Przejdź do lekcji"
          onClick={() => navigate("/admin/lessons")}
        />

        <DashboardCard
          title="Załączniki do lekcji"
          description="Załączniki do lekcji — pliki i powiązania."
          buttonText="Przejdź do załączników"
          onClick={() => navigate("/admin/lesson-attachments")}
        />

        <DashboardCard
          title="Bloki treści lekcji"
          description="Bloki treści w lekcjach — tekst, media, układ."
          buttonText="Przejdź do bloków"
          onClick={() => navigate("/admin/lesson-content-blocks")}
        />

        <DashboardCard
          title="Postęp w lekcjach"
          description="Postęp w lekcjach — podgląd wyników użytkowników."
          buttonText="Przejdź do progresu"
          onClick={() => navigate("/admin/lesson-progress")}
        />

        <DashboardCard
          title="Pliki multimedialne"
          description="Biblioteka plików multimedialnych i ich metadane."
          buttonText="Przejdź do media"
          onClick={() => navigate("/admin/media-files")}
        />

        <DashboardCard
          title="Moduły kursów"
          description="Moduły kursów — struktura i organizacja."
          buttonText="Przejdź do modułów"
          onClick={() => navigate("/admin/modules")}
        />

        <DashboardCard
          title="Bloki treści stron"
          description="Bloki treści stron — sekcje, układ i elementy strony."
          buttonText="Przejdź do bloków stron"
          onClick={() => navigate("/admin/page-content-blocks")}
        />

        <DashboardCard
          title="Opcje odpowiedzi w quizach"
          description="Opcje odpowiedzi w quizach — tworzenie i edycja."
          buttonText="Przejdź do opcji"
          onClick={() => navigate("/admin/quiz-answer-options")}
        />

        <DashboardCard
          title="Podejścia do quizów"
          description="Podejścia do quizów — podgląd wyników i statusów."
          buttonText="Przejdź do podejść"
          onClick={() => navigate("/admin/quiz-attempts")}
        />

        <DashboardCard
          title="Odpowiedzi w podejściach"
          description="Odpowiedzi w podejściach — szczegóły odpowiedzi użytkowników."
          buttonText="Przejdź do odpowiedzi"
          onClick={() => navigate("/admin/quiz-attempt-answers")}
        />

        <DashboardCard
          title="Pytania quizowe"
          description="Pytania quizowe — baza pytań i edycja treści."
          buttonText="Przejdź do pytań"
          onClick={() => navigate("/admin/quiz-questions")}
        />

        <DashboardCard
          title="Tematy zgłoszeniowe"
          description="Tickety wsparcia — obsługa zgłoszeń i statusów."
          buttonText="Przejdź do ticketów"
          onClick={() => navigate("/admin/support-tickets")}
        />

        <DashboardCard
          title="Wiadomości w czacie"
          description="Wiadomości w systemie wsparcia — rozmowy i komunikacja."
          buttonText="Przejdź do wiadomości"
          onClick={() => navigate("/admin/support-messages")}
        />

        <DashboardCard
          title="Dostęp do kursów"
          description="Dostęp użytkowników do kursów — uprawnienia i status."
          buttonText="Przejdź do access"
          onClick={() => navigate("/admin/user-course-accesses")}
        />

        <DashboardCard
          title="Zapisy na kursy"
          description="Zapisy na kursy — przypisania i historia."
          buttonText="Przejdź do zapisów"
          onClick={() => navigate("/admin/user-course-enrollments")}
        />

        <DashboardCard
          title="Powiadomienia użytkownika"
          description="Powiadomienia systemowe — lista i zarządzanie."
          buttonText="Przejdź do powiadomień"
          onClick={() => navigate("/admin/user-notifications")}
        />
      </SimpleGrid>
    </Box>
  );
}

export default AdminDashboardPage;
