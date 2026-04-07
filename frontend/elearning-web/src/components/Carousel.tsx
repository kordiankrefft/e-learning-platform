import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  HStack,
  VStack,
  IconButton,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { ElementType } from "react";

import type { PageContentBlockDto } from "../types/pageContentBlock";
import { parseJson } from "../utils/jsonHelper";

type CarouselSlideContent = {
  label: string;
  title: string;
  description: string;
};

type SlideVm = {
  imageUrl: string;
  label: string;
  title: string;
  description: string;
};

const arrowBtnProps = {
  position: "absolute" as const,
  top: "50%",
  transform: "translateY(-50%)",
  size: "sm",
  borderRadius: "full",
  bg: "blackAlpha.600",
  _hover: { bg: "blackAlpha.800" },
};

type Props = {
  blocks: PageContentBlockDto[];
};

export default function BenefitsCarousel({ blocks }: Props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

  const slides: SlideVm[] = useMemo(() => {
    return blocks
      .filter((b) => b.blockType === "carouselSlide")
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((b) => {
        const content = parseJson<CarouselSlideContent>(b.content);

        const rawUrl = b.mediaFileUrl ?? "";
        const imageUrl = rawUrl
          ? rawUrl.startsWith("/")
            ? `${API_BASE_URL}${rawUrl}`
            : rawUrl
          : "";

        return {
          imageUrl,
          label: content?.label ?? "",
          title: content?.title ?? "",
          description: content?.description ?? "",
        };
      })
      .filter((s) => s.imageUrl && s.title);
  }, [blocks, API_BASE_URL]);

  const [index, setIndex] = useState(0);

  const next = () =>
    setIndex((i) => (slides.length ? (i + 1) % slides.length : 0));
  const prev = () =>
    setIndex((i) =>
      slides.length ? (i - 1 + slides.length) % slides.length : 0
    );

  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const slide = slides[index];

  return (
    <Box
      mt={16}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="2xl"
      position="relative"
      bg="gray.900"
    >
      <HStack spacing={0} flexDir={{ base: "column", md: "row" }}>
        <Box w={{ base: "100%", md: "50%" }} h={{ base: "300px", md: "440px" }}>
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            objectFit="cover"
            w="100%"
            h="100%"
          />
        </Box>

        <Box w={{ base: "100%", md: "50%" }} p={{ base: 6, md: 10 }}>
          <VStack align="start" spacing={4}>
            <Badge
              colorScheme="yellow"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {slide.label}
            </Badge>

            <Heading size={{ base: "md", md: "lg" }}>{slide.title}</Heading>

            <Text color="gray.300" fontSize="sm">
              {slide.description}
            </Text>

            <HStack spacing={2} pt={2}>
              {slides.map((_, i) => (
                <Box
                  key={i}
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={i === index ? "yellow.400" : "gray.600"}
                />
              ))}
            </HStack>
          </VStack>
        </Box>
      </HStack>

      <IconButton
        aria-label="Poprzednia korzyść"
        icon={<Icon as={FaChevronLeft as ElementType} boxSize={4} />}
        left={3}
        onClick={prev}
        {...arrowBtnProps}
      />
      <IconButton
        aria-label="Następna korzyść"
        icon={<Icon as={FaChevronRight as ElementType} boxSize={4} />}
        right={3}
        onClick={next}
        {...arrowBtnProps}
      />
    </Box>
  );
}
