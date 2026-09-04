import {apiFetch} from "@/lib/api";

export type StudyMaterialType =
    | "SUMMARY"
    | "STANDARD_NOTES"
    | "COMPLETE_NOTES"
    | "FLASHCARDS"
    | "QUIZ";

export interface StudyMaterial {
    id: number;
    topicId: number;
    materialType: StudyMaterialType;
    content: string;
    createdAt: string;
    updatedAt: string;
}

const materialTypeToPath: Record<StudyMaterialType, string> = {
    SUMMARY: "summary",
    STANDARD_NOTES: "standard-notes",
    COMPLETE_NOTES: "complete-notes",
    FLASHCARDS: "flashcards",
    QUIZ: "quiz",
};

async function readApiError(
    response: Response,
    fallbackMessage: string
): Promise<string> {
    try {
        const data = await response.json();

        return (
            data.message ||
            data.error ||
            fallbackMessage
        );
    } catch {
        return fallbackMessage;
    }
}

export async function getStudyMaterials(
    courseId: number,
    topicId: number
): Promise<StudyMaterial[]> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/study-materials`
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Study Materials could not be loaded."
            )
        );
    }

    return response.json() as Promise<StudyMaterial[]>;
}

export async function getStudyMaterial(
    courseId: number,
    topicId: number,
    materialType: StudyMaterialType
): Promise<StudyMaterial> {
    const path = materialTypeToPath[materialType];

    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/study-materials/${path}`
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Study Material could not be loaded."
            )
        );
    }

    return response.json() as Promise<StudyMaterial>;
}

export async function generateStudyMaterial(
    courseId: number,
    topicId: number,
    materialType: StudyMaterialType
): Promise<StudyMaterial> {
    const path = materialTypeToPath[materialType];

    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/study-materials/${path}`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Study Material could not be generated."
            )
        );
    }

    return response.json() as Promise<StudyMaterial>;
}

export async function updateStudyMaterial(
    courseId: number,
    topicId: number,
    materialType: StudyMaterialType,
    content: string
): Promise<StudyMaterial> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/study-materials/${materialTypeToPath[materialType]}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Study Material could not be updated."
            )
        );
    }

    return response.json() as Promise<StudyMaterial>;
}

export async function deleteStudyMaterial(
    courseId: number,
    topicId: number,
    materialType: StudyMaterialType
): Promise<void> {
    const response = await apiFetch(
        `/api/courses/${courseId}/topics/${topicId}/study-materials/${materialTypeToPath[materialType]}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Study Material could not be deleted."
            )
        );
    }
}