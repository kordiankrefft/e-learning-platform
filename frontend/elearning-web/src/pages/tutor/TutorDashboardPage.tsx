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
import { coursesApi } from "../../api/coursesApi";
import { quizzesApi } from "../../api/quizzesApi";
import type { CourseDto } from "../../types/course";
import type { QuizDto } from "../../types/quiz";
import { DashboardCard } from "../../components/DashboardCard";

function TutorDashboardPage() {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesRes, quizzesRes] = await Promise.all([
          coursesApi.getCourses(),
          quizzesApi.getQuizzes(),
        ]);

        setCourses(coursesRes.data ?? []);
        setQuizzes(quizzesRes.data ?? []);
      } catch (err) {
        console.error("Błąd ładowania danych tutora:", err);
      }
    };

    if (isAuthenticated && hasRole("Tutor")) {
      loadData();
    }
  }, [isAuthenticated, hasRole]);

  if (!isAuthenticated || !hasRole("Tutor")) {
    return (
      <Box p={8}>
        <Heading size="md">Brak dostępu (wymagana rola Tutor)</Heading>
      </Box>
    );
  }

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Heading mb={6}>Panel tutora</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Kursy</StatLabel>
          <StatNumber>{courses.length}</StatNumber>
          <StatHelpText>Wszystkie kursy</StatHelpText>
        </Stat>

        <Stat bg="gray.800" p={4} borderRadius="lg">
          <StatLabel>Quizy</StatLabel>
          <StatNumber>{quizzes.length}</StatNumber>
          <StatHelpText>quizy przypisane do Twoich kursów</StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <DashboardCard
          title="Kursy"
          description="Zarządzanie kursami, do których jesteś przypisany."
          buttonText="Przejdź do kursów"
          onClick={() => navigate("/tutor/courses")}
        />

        <DashboardCard
          title="Moduły kursów"
          description="Struktura modułów w Twoich kursach."
          buttonText="Przejdź do modułów"
          onClick={() => navigate("/tutor/modules")}
        />

        <DashboardCard
          title="Lekcje"
          description="Zarządzanie lekcjami w Twoich kursach."
          buttonText="Przejdź do lekcji"
          onClick={() => navigate("/tutor/lessons")}
        />

        <DashboardCard
          title="Bloki treści lekcji"
          description="Edycja treści bloków (tekst, pytania)."
          buttonText="Przejdź do bloków"
          onClick={() => navigate("/tutor/lesson-content-blocks")}
        />

        <DashboardCard
          title="Załączniki do lekcji"
          description="Zarządzanie plikami PDF i materiałami."
          buttonText="Przejdź do załączników"
          onClick={() => navigate("/tutor/lesson-attachments")}
        />

        <DashboardCard
          title="Quizy"
          description="Tworzenie i edycja quizów."
          buttonText="Przejdź do quizów"
          onClick={() => navigate("/tutor/quizzes")}
        />

        <DashboardCard
          title="Pytania quizowe"
          description="Baza pytań quizowych."
          buttonText="Przejdź do pytań"
          onClick={() => navigate("/tutor/quiz-questions")}
        />

        <DashboardCard
          title="Opcje odpowiedzi"
          description="Zarządzanie odpowiedziami w quizach."
          buttonText="Przejdź do opcji"
          onClick={() => navigate("/tutor/quiz-answer-options")}
        />
      </SimpleGrid>
    </Box>
  );
}

export default TutorDashboardPage;
