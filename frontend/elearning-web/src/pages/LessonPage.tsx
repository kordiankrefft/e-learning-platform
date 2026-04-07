import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Divider,
  HStack,
  Badge,
  useToast,
  Button,
} from "@chakra-ui/react";

import { lessonContentBlocksApi } from "../api/lessonContentBlocksApi";
import { lessonAttachmentsApi } from "../api/lessonAttachmentsApi";
import { lessonProgressApi } from "../api/lessonProgressesApi";

import type { LessonContentBlockDto } from "../types/lessonContentBlock";
import type { LessonAttachmentDto } from "../types/lessonAttachment";

import TextBlock from "../components/lessonBlocks/TextBlock";
import SingleChoiceBlock from "../components/lessonBlocks/SingleChoiceBlock";
import FillBlankBlock from "../components/lessonBlocks/FillBlankBlock";

import { parseJson } from "../utils/jsonHelper";

type RouteParams = {
  lessonId?: string;
};

export default function LessonPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { lessonId } = useParams<RouteParams>();

  const parsedLessonId = useMemo(() => {
    const id = Number(lessonId);
    return Number.isFinite(id) ? id : null;
  }, [lessonId]);

  const [blocks, setBlocks] = useState<LessonContentBlockDto[]>([]);
  const [attachments, setAttachments] = useState<LessonAttachmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<number>>(
    new Set()
  );
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [answersByBlockId, setAnswersByBlockId] = useState<Record<number, any>>(
    {}
  );
  const [checkedByBlockId, setCheckedByBlockId] = useState<
    Record<number, boolean>
  >({});

  const interactiveBlocks = useMemo(() => {
    return blocks.filter(
      (b) =>
        b.isActive &&
        (b.blockType === "single_choice" || b.blockType === "fill_blank")
    );
  }, [blocks]);

  const totalInteractive = interactiveBlocks.length;

  const computeProgress = (completedCount: number) => {
    if (totalInteractive <= 0) return 0;
    const raw = (completedCount / totalInteractive) * 100;
    return Math.round(raw);
  };

  const sendProgress = async (percent: number) => {
    if (parsedLessonId == null) return;

    try {
      await lessonProgressApi.createOrUpdate({
        lessonId: parsedLessonId,
        progressPercent: percent,
      });
    } catch {
      toast({
        title: "Could not save progress",
        description: "Progress will be saved when connection is back.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const saveAnswer = (blockId: number, answer: any) => {
    setAnswersByBlockId((prev) => ({
      ...prev,
      [blockId]: answer,
    }));
  };

  const saveChecked = (blockId: number, checked: boolean) => {
    setCheckedByBlockId((prev) => ({
      ...prev,
      [blockId]: checked,
    }));
  };

  const handleCompleted = (blockId: number) => {
    setCompletedBlockIds((prev) => {
      if (prev.has(blockId)) return prev;

      const next = new Set(prev);
      next.add(blockId);

      const nextPercent = computeProgress(next.size);
      setProgressPercent(nextPercent);

      void sendProgress(nextPercent);
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (parsedLessonId == null) {
        setError("Invalid lessonId in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await sendProgress(0);

        const [blocksRes, attachmentsRes] = await Promise.all([
          lessonContentBlocksApi.getForLesson(parsedLessonId),
          lessonAttachmentsApi.getForLesson(parsedLessonId),
        ]);

        const sortedBlocks = [...blocksRes.data]
          .filter((b) => b.isActive)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        setBlocks(sortedBlocks);
        setAttachments(attachmentsRes.data.filter((a) => a.isActive));
        setCompletedBlockIds(new Set());
        setProgressPercent(0);
        setAnswersByBlockId({});
        setCheckedByBlockId({});
      } catch {
        setError("Failed to load lesson content.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [parsedLessonId]);

  const renderBlock = (block: LessonContentBlockDto) => {
    const parsedContent = parseJson<any>(block.content ?? null);

    if (block.blockType === "text") {
      return <TextBlock content={parsedContent ?? { text: "" }} />;
    }

    if (block.blockType === "single_choice") {
      return (
        <SingleChoiceBlock
          content={parsedContent ?? {}}
          initialAnswer={answersByBlockId[block.id]}
          initialChecked={checkedByBlockId[block.id] ?? false}
          onAnswer={(answer) => saveAnswer(block.id, answer)}
          onChecked={(checked) => saveChecked(block.id, checked)}
          onCompleted={() => handleCompleted(block.id)}
        />
      );
    }

    if (block.blockType === "fill_blank") {
      return (
        <FillBlankBlock
          content={parsedContent ?? {}}
          initialAnswer={answersByBlockId[block.id]}
          initialChecked={checkedByBlockId[block.id] ?? false}
          onAnswer={(answer) => saveAnswer(block.id, answer)}
          onChecked={(checked) => saveChecked(block.id, checked)}
          onCompleted={() => handleCompleted(block.id)}
        />
      );
    }

    return (
      <Alert status="warning">
        <AlertIcon />
        Unknown block type: {block.blockType}
      </Alert>
    );
  };

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading size="lg">Lesson</Heading>
          <Text opacity={0.8}>Interactive lesson blocks</Text>
        </Box>

        <HStack>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Wróć
          </Button>

          <Badge fontSize="0.9em">Progress: {progressPercent}%</Badge>

          {totalInteractive > 0 && (
            <Badge fontSize="0.9em" variant="outline">
              Completed: {completedBlockIds.size}/{totalInteractive}
            </Badge>
          )}
        </HStack>
      </HStack>

      {attachments.map((a) => {
        const href = a.fileUrl.startsWith("/")
          ? `${import.meta.env.VITE_API_BASE_URL}${a.fileUrl}`
          : a.fileUrl;

        return (
          <HStack key={a.id} justify="space-between" w="full" mb={4}>
            <Box>
              <Text fontWeight="semibold">{a.fileName}</Text>
              {a.description ? (
                <Text fontSize="sm" opacity={0.7}>
                  {a.description}
                </Text>
              ) : null}
            </Box>

            <Button
              as="a"
              href={href}
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="outline"
            >
              Otwórz PDF
            </Button>
          </HStack>
        );
      })}

      <VStack align="stretch" spacing={4}>
        {blocks.map((block) => (
          <Box key={block.id}>
            {renderBlock(block)}
            <Divider mt={4} opacity={0.2} />
          </Box>
        ))}
      </VStack>
      <Divider mt={8} mb={4} opacity={0.2} />

      <HStack justify="flex-end">
        <Button onClick={() => navigate(-1)} colorScheme="yellow">
          Zakończ
        </Button>
      </HStack>
    </Box>
  );
}
