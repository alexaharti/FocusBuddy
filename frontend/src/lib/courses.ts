import { apiFetch } from "@/lib/api";

export interface Course {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
    yearLabel: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCourseInput {
    name: string;
    description?: string;
    color?: string;
    yearLabel?: string;
}

export interface UpdateCourseInput {
    name: string;
    description?: string;
    color?: string;
    yearLabel?: string;
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

export async function getCourses(
    signal?: AbortSignal
): Promise<Course[]> {
    const response = await apiFetch("/api/courses", {
        method: "GET",
        signal,
    });

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Courses could not be loaded."
            )
        );
    }

    return response.json() as Promise<Course[]>;
}

export async function getCourse(
    courseId: number,
    signal?: AbortSignal
): Promise<Course> {
    const response = await apiFetch(
        `/api/courses/${courseId}`,
        {
            method: "GET",
            signal,
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The course could not be loaded."
            )
        );
    }

    return response.json() as Promise<Course>;
}

export async function createCourse(
    input: CreateCourseInput
): Promise<Course> {
    const response = await apiFetch("/api/courses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: input.name.trim(),
            description: input.description?.trim() || null,
            color: input.color?.trim() || null,
            yearLabel: input.yearLabel?.trim() || null,
        }),
    });

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The course could not be created."
            )
        );
    }

    return response.json() as Promise<Course>;
}

export async function updateCourse(
    courseId: number,
    input: UpdateCourseInput
): Promise<Course> {
    const response = await apiFetch(
        `/api/courses/${courseId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: input.name.trim(),
                description: input.description?.trim() || null,
                color: input.color?.trim() || null,
                yearLabel: input.yearLabel?.trim() || null,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The course could not be updated."
            )
        );
    }

    return response.json() as Promise<Course>;
}

export async function deleteCourse(
    courseId: number
): Promise<void> {
    const response = await apiFetch(
        `/api/courses/${courseId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The course could not be deleted."
            )
        );
    }
}