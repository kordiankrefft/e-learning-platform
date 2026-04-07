import {
  Box,
  HStack,
  Text,
  Stack,
  IconButton,
  Button,
  Badge,
} from "@chakra-ui/react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaBell,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { userNotificationsApi } from "../api/userNotificationsApi";
import type { UserNotificationDto } from "../types/userNotification";

function Footer() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<UserNotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const requestInProgressRef = useRef(false);

  const loadNotifications = async () => {
    if (requestInProgressRef.current) return;

    requestInProgressRef.current = true;
    setLoading(true);

    try {
      const response = await userNotificationsApi.my();
      setNotifications(response.data);
    } catch (caughtError: any) {
      const statusCode = caughtError?.response?.status;

      // jeśli user nie jest zalogowany / brak dostępu, to normalne
      if (statusCode === 401 || statusCode === 403) {
        setNotifications([]);
      } else {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      requestInProgressRef.current = false;
    }
  };

  useEffect(() => {
    loadNotifications();

    // krótszy polling = szybciej widać nowe wiadomości
    const intervalId = window.setInterval(() => {
      loadNotifications();
    }, 2000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(
      (notification) => notification.isActive && !notification.isRead
    ).length;
  }, [notifications]);

  const handleHelpClick = async () => {
    // szybki refresh przy kliknięciu, żeby nie czekać na polling
    await loadNotifications();
    navigate("/support/tickets");
  };

  return (
    <Box
      id="footer"
      bg="#050505"
      color="gray.400"
      py={6}
      borderTop="1px solid"
      borderColor="gray.800"
    >
      <Box maxW="6xl" mx="auto" px={{ base: 4, md: 8 }}>
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          spacing={4}
        >
          <Text fontSize="sm">
            © {new Date().getFullYear()} Lingrow. Projekt platformy
            e-learningowej.
          </Text>

          <HStack spacing={2}>
            <Button
              variant="outline"
              size="sm"
              color="gray.300"
              _hover={{ color: "yellow.300", bg: "transparent" }}
              onClick={handleHelpClick}
              position="relative"
              pr={3}
            >
              <HStack spacing={2}>
                <Text>Pomoc</Text>

                <Box
                  position="relative"
                  display="inline-flex"
                  alignItems="center"
                >
                  <Box
                    color="gray.400"
                    _groupHover={{ color: "yellow.300" }}
                    _hover={{ color: "yellow.300", bg: "transparent" }}
                  >
                    <FaBell />
                  </Box>

                  {!loading && unreadNotificationsCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-6px"
                      right="-10px"
                      borderRadius="full"
                      px={2}
                      fontSize="xs"
                      bg="red.400"
                      color="white"
                      lineHeight="18px"
                      minW="18px"
                      textAlign="center"
                    >
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Box>
              </HStack>
            </Button>

            <IconButton
              as="a"
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              icon={<FaFacebookF />}
              variant="ghost"
              color="gray.400"
              _hover={{ color: "yellow.300" }}
            />
            <IconButton
              as="a"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              icon={<FaInstagram />}
              variant="ghost"
              color="gray.400"
              _hover={{ color: "yellow.300" }}
            />
            <IconButton
              as="a"
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              icon={<FaXTwitter />}
              variant="ghost"
              color="gray.400"
              _hover={{ color: "yellow.300" }}
            />
            <IconButton
              as="a"
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              icon={<FaYoutube />}
              variant="ghost"
              color="gray.400"
              _hover={{ color: "yellow.300" }}
            />
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}

export default Footer;
