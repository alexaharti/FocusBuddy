import {apiFetch} from "@/lib/api";

export type TopicStatus =
    | "NOT_STARTED"
    | "LEARNING"
    | "REVIEWING"
    | "CONFIDENT";

export type DocumentProcessingStatus =
    | "UPLOADED"
    | "PROCESSING"
    | "READY"
    | "FAILED";

export interface Topic {
    id: number;
    courseId: number;
    title: string;
    description: string | null;
    position: number | null;
    status: TopicStatus;

    documentId: number | null;
    originalFilename: string | null;
    fileSize: number | null;
    processingStatus: DocumentProcessingStatus | null;

    createdAt: string;
    updatedAt: string;
}

export interface DocumentProcessingResponse {
    documentId: number;
    topicId: number;
    originalFilename: string;
    pageCount: number;
    processingStatus: DocumentProcessingStatus;
    extractedCharacterCount: number;
    storedChunkCount: number;
    pagePreviews: {
        pageNumber: number;
        characterCount: number;
        preview: string;
    }[];
    processedAt: string;
}

export async function processLecture(
    courseId: number,
    topicId: number
): Promise<DocumentProcessingResponse> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/lecture/process`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The lecture PDF could not be processed."
            )
        );
    }

    return response.json() as Promise<DocumentProcessingResponse>;
}

export interface CreateTopicInput {
    title: string;
    description?: string;
}

async function readApiError(
    response: Response,
    fallbackMessage: string
): Promise<string> {
    try {
        const data = (await response.json()) as {
            message?: unknown;
            error?: unknown;
        };

        if (
            typeof data.message === "string" &&
            data.message.trim()
        ) {
            return data.message;
        }

        if (
            typeof data.error === "string" &&
            data.error.trim()
        ) {
            return data.error;
        }
    } catch {
        // The backend did not return a JSON error body.
    }

    return fallbackMessage;
}

export async function getTopics(
    courseId: number,
    signal?: AbortSignal
): Promise<Topic[]> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics`,
        {
            method: "GET",
            signal,
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Topics could not be loaded."
            )
        );
    }

    return response.json() as Promise<Topic[]>;
}

export async function getTopic(
    courseId: number,
    topicId: number,
    signal?: AbortSignal
): Promise<Topic> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}`,
        {
            method: "GET",
            signal,
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The topic could not be loaded."
            )
        );
    }

    return response.json() as Promise<Topic>;
}

export async function createTopic(
    courseId: number,
    input: CreateTopicInput
): Promise<Topic> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: input.title.trim(),
                description:
                    input.description?.trim() || null,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The topic could not be created."
            )
        );
    }

    return response.json() as Promise<Topic>;
}

export async function uploadLecture(
    courseId: number,
    topicId: number,
    file: File
): Promise<Topic> {
    const formData = new FormData();

    formData.append("file", file);

    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/lecture`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The lecture PDF could not be uploaded."
            )
        );
    }

    return response.json() as Promise<Topic>;
}