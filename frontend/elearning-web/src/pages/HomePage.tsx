import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  HStack,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { iconMap } from "../constants/iconMap";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { pageContentBlocksApi } from "../api/pageContentBlocksApi";
import type { PageContentBlockDto } from "../types/pageContentBlock";
import { parseJson } from "../utils/jsonHelper";
import BenefitsCarousel from "../components/Carousel";

import { announcementsApi } from "../api/announcementsApi";
import type { AnnouncementDto } from "../types/announcement";

type HeroContent = {
  title: string;
  highlight: string;
  description: string;
  bullets: string[];
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; hash: string };
};

type HowItWorksContent = {
  sectionId: string;
  title: string;
  items: { title: string; text: string }[];
};

type BenefitsContent = {
  sectionId: string;
  title: string;
  items: { icon: string; title: string; text: string }[];
};

type CtaContent = {
  title: string;
  description: string;
  cta: { label: string; to: string };
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<PageContentBlockDto[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [location.hash]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [blocksRes, annRes] = await Promise.all([
          pageContentBlocksApi.getByPageKey("home"),
          announcementsApi.getAll(),
        ]);

        const sortedBlocks = (blocksRes.data ?? [])
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex);

        setBlocks(sortedBlocks);

        const ann = (annRes.data ?? []).filter((a) => a.isActive);
        ann.sort((a, b) =>
          (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
        );
        setAnnouncements(ann);

        setLoading(false);
      } catch (err) {
        setError("Nie udało się pobrać zawartości strony głównej.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hero = useMemo(() => {
    const block = blocks.find((b) => b.blockType === "hero");
    return block ? parseJson<HeroContent>(block.content) : null;
  }, [blocks]);

  const howItWorks = useMemo(() => {
    const block = blocks.find((b) => b.blockType === "howItWorks");
    return block ? parseJson<HowItWorksContent>(block.content) : null;
  }, [blocks]);

  const benefits = useMemo(() => {
    const block = blocks.find((b) => b.blockType === "benefits");
    return block ? parseJson<BenefitsContent>(block.content) : null;
  }, [blocks]);

  const cta = useMemo(() => {
    const block = blocks.find((b) => b.blockType === "cta");
    return block ? parseJson<CtaContent>(block.content) : null;
  }, [blocks]);

  if (loading) {
    return (
      <Box
        bg="gray.900"
        color="white"
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="gray.900" color="white" minH="60vh" p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box bg="gray.900" color="white">
      {/* HERO + Karuzela */}
      {hero && (
        <Box
          maxW={{ base: "6xl", xl: "8xl" }}
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={{ base: 10, md: 16 }}
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "0.9fr 1.1fr" }}
          gap={10}
          alignItems="center"
        >
          <Box>
            <Heading as="h1" size="2xl" mb={4} lineHeight="shorter">
              {hero.title}{" "}
              <Text as="span" color="yellow.400">
                {hero.highlight}
              </Text>
            </Heading>

            <Text fontSize="lg" color="gray.300" mb={6}>
              {hero.description}
            </Text>

            <Stack spacing={3} mb={8}>
              {hero.bullets.map((b, idx) => (
                <HStack key={idx}>
                  <Icon as={CheckCircleIcon} color="yellow.400" />
                  <Text>{b}</Text>
                </HStack>
              ))}
            </Stack>

            <HStack spacing={4}>
              <Button
                size="lg"
                colorScheme="yellow"
                bg="yellow.400"
                color="black"
                _hover={{ bg: "yellow.300" }}
                onClick={() => navigate(hero.primaryCta.to)}
              >
                {hero.primaryCta.label}
              </Button>

              <Button
                size="lg"
                variant="outline"
                borderColor="yellow.400"
                color="yellow.300"
                _hover={{ bg: "yellow.400", color: "black" }}
                onClick={() => {
                  const el = document.getElementById(hero.secondaryCta.hash);
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {hero.secondaryCta.label}
              </Button>
            </HStack>
          </Box>

          <BenefitsCarousel blocks={blocks} />
        </Box>
      )}

      {/* HOW IT WORKS */}
      {howItWorks && (
        <Box id={howItWorks.sectionId} bg="#0b0b0b" py={{ base: 10, md: 14 }}>
          <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }}>
            <Heading size="lg" mb={6}>
              {howItWorks.title}
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {howItWorks.items.map((item, idx) => (
                <Box key={idx} bg="gray.900" p={6} borderRadius="xl">
                  <Heading size="md" mb={3} color="yellow.300">
                    {item.title}
                  </Heading>
                  <Text color="gray.300">{item.text}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Box>
      )}

      {/* BENEFITS */}
      {benefits && (
        <Box id={benefits.sectionId} bg="#0b0b0b" py={{ base: 10, md: 14 }}>
          <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }}>
            <Heading size="lg" mb={8}>
              {benefits.title}
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              {benefits.items.map((item, idx) => {
                const IconComponent = iconMap[item.icon];

                return (
                  <Box
                    key={idx}
                    bg="gray.900"
                    p={6}
                    borderRadius="xl"
                    textAlign="center"
                  >
                    {IconComponent && (
                      <Icon
                        as={IconComponent as ElementType}
                        w={10}
                        h={10}
                        color="yellow.400"
                        mb={4}
                      />
                    )}

                    <Heading size="md" mb={3}>
                      {item.title}
                    </Heading>

                    <Text color="gray.300">{item.text}</Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>
      )}

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <Box bg="#0b0b0b" pb={{ base: 10, md: 14 }}>
          <Box maxW="7xl" mx="auto" py={{ base: 4, md: 8 }}>
            <HStack mb={4} spacing={3}>
              <Badge
                colorScheme="yellow"
                borderRadius="full"
                px={3}
                py={2}
                textTransform="none"
              >
                Ogłoszenia
              </Badge>
              <Text color="gray.300">
                (Aktualne promocje i ważne informacje)
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {announcements.map((a) => {
                const parsed = parseJson<any>(a.body);
                const isPricePromo = parsed?.type === "pricePromo";
                const isDurationPromo = parsed?.type === "durationPromo";

                return (
                  <Box
                    key={a.id}
                    bg="gray.900"
                    borderRadius="xl"
                    p={{ base: 5, md: 6 }}
                    border="1px solid"
                    borderColor="yellow.400"
                  >
                    <Heading size="sm" color="yellow.300" mb={2}>
                      {a.title}
                    </Heading>

                    {/* PROMOCJA CENOWA */}
                    {isPricePromo && (
                      <VStack align="start" spacing={2}>
                        <Text color="gray.300">{parsed.description}</Text>

                        <HStack spacing={3} flexWrap="wrap">
                          <Text
                            color="gray.400"
                            textDecoration="line-through"
                            fontSize="lg"
                          >
                            {parsed.oldPrice} {parsed.currency}
                          </Text>

                          <Text
                            color="yellow.400"
                            fontSize="2xl"
                            fontWeight="bold"
                          >
                            {parsed.newPrice} {parsed.currency}
                          </Text>

                          <Badge
                            colorScheme="red"
                            borderRadius="full"
                            px={3}
                            py={1}
                            textTransform="none"
                          >
                            PROMOCJA
                          </Badge>
                        </HStack>
                      </VStack>
                    )}

                    {/* PROMOCJA CZASU DOSTĘPU */}
                    {isDurationPromo && (
                      <VStack align="start" spacing={2}>
                        <Text color="gray.300">{parsed.description}</Text>

                        <HStack spacing={3} flexWrap="wrap">
                          <Text
                            color="gray.400"
                            textDecoration="line-through"
                            fontSize="lg"
                          >
                            {parsed.oldDays} dni
                          </Text>

                          <Text
                            color="yellow.400"
                            fontSize="2xl"
                            fontWeight="bold"
                          >
                            {parsed.newDays} dni
                          </Text>

                          <Badge
                            colorScheme="green"
                            borderRadius="full"
                            px={3}
                            py={1}
                            textTransform="none"
                          >
                            DŁUŻEJ
                          </Badge>
                        </HStack>
                      </VStack>
                    )}

                    {/* Zwykły tekst (gdy body nie jest JSON-em) */}
                    {!isPricePromo && !isDurationPromo && (
                      <Text color="gray.200">{a.body}</Text>
                    )}
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>
        </Box>
      )}

      {/* CTA */}
      {cta && (
        <Box py={{ base: 10, md: 14 }} bg="#0b0b0b">
          <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }} textAlign="center">
            <Heading mb={4}>{cta.title}</Heading>
            <Text color="gray.300" mb={6}>
              {cta.description}
            </Text>
            <Button
              size="lg"
              colorScheme="yellow"
              bg="yellow.400"
              color="black"
              _hover={{ bg: "yellow.300" }}
              onClick={() => navigate(cta.cta.to)}
            >
              {cta.cta.label}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
