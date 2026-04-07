import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Podaj e-mail i hasło.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await authApi.login(email, password);
      const token = response.data.accessToken as string | undefined;

      if (!token) {
        setError("Serwer nie zwrócił tokenu. Sprawdź backend.");
        return;
      }

      await login(token);

      try {
        await userApi.getMe();
        navigate("/");
      } catch (error: any) {
        if (error?.response?.status === 404) {
          navigate("/profile");
        } else {
          navigate("/profile");
        }
      }
    } catch (error: any) {
      console.error("LOGIN ERROR", error);

      if (error.response && error.response.status === 401) {
        setError("Nieprawidłowy e-mail lub hasło.");
      } else {
        setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmailInvalid = email.trim() === "";
  const isPasswordInvalid = password.trim() === "";

  return (
    <Box
      minH="calc(100vh - 64px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="gray.800"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        width="100%"
        maxW="400px"
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="xl" textAlign="center" mb={2}>
            Logowanie
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Błąd logowania</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          <FormControl isInvalid={isEmailInvalid && !!error}>
            <FormLabel>E-mail</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="podaj e-mail"
              bg="gray.700"
              borderColor="gray.600"
            />
            <FormErrorMessage>Podaj adres e-mail.</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={isPasswordInvalid && !!error}>
            <FormLabel>Hasło</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="podaj hasło"
              bg="gray.700"
              borderColor="gray.600"
            />
            <FormErrorMessage>Podaj hasło.</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            isLoading={isSubmitting}
            loadingText="Logowanie..."
          >
            Zaloguj
          </Button>

          <Button
            variant="link"
            mt={2}
            colorScheme="teal"
            onClick={() => navigate("/register")}
          >
            Nie masz konta? Zarejestruj się
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default LoginPage;
