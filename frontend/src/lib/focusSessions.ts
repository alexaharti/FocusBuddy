import {apiFetch} from "@/lib/api";

export type FocusSessionType =
    | "QUICK"
    | "PLANNED";

export type FocusSessionStatus =
    | "ACTIVE"
    | "PAUSED"
    | "COMPLETED"
    | "CANCELLED";

export interface FocusSession {
    id: number;
    courseId: number | null;
    topicId: number | null;
    sessionType: FocusSessionType;
    status: FocusSessionStatus;
    plannedDurationMinutes: number | null;
    actualDurationMinutes: number | null;

    accumulatedFocusSeconds: number;
    lastResumedAt: string | null;

    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StartFocusSessionRequest {
    sessionType: FocusSessionType;
    courseId?: number | null;
    topicId?: number | null;
    plannedDurationMinutes?: number | null;
}

async function readApiError(
    response: Response,
    fallbackMessage: string
): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data?.message === "string") {
            return data.message;
        }

        if (typeof data?.error === "string") {
            return data.error;
        }
    } catch {
        // Response was not JSON.
    }

    return fallbackMessage;
}

export async function startFocusSession(
    request: StartFocusSessionRequest
): Promise<FocusSession> {
    const response = await apiFetch(
        "/api/focus-sessions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The focus session could not be started."
            )
        );
    }

    return response.json() as Promise<FocusSession>;
}

export async function getFocusSessions():
    Promise<FocusSession[]> {
    const response = await apiFetch(
        "/api/focus-sessions"
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "Focus sessions could not be loaded."
            )
        );
    }

    return response.json() as Promise<FocusSession[]>;
}

export async function getFocusSession(
    sessionId: number
): Promise<FocusSession> {
    const response = await apiFetch(
        `/api/focus-sessions/${sessionId}`
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The focus session could not be loaded."
            )
        );
    }

    return response.json() as Promise<FocusSession>;
}

export async function completeFocusSession(
    sessionId: number
): Promise<FocusSession> {
    const response = await apiFetch(
        `/api/focus-sessions/${sessionId}/complete`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The focus session could not be completed."
            )
        );
    }

    return response.json() as Promise<FocusSession>;
}

export async function pauseFocusSession(
    sessionId: number
): Promise<FocusSession> {
    const response = await apiFetch(
        `/api/focus-sessions/${sessionId}/pause`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The focus session could not be paused."
            )
        );
    }

    return response.json() as Promise<FocusSession>;
}

export async function resumeFocusSession(
    sessionId: number
): Promise<FocusSession> {
    const response = await apiFetch(
        `/api/focus-sessions/${sessionId}/resume`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The focus session could not be resumed."
            )
        );
    }

    return response.json() as Promise<FocusSession>;
}

export async function cancelFocusSession(
    sessionId: number
): Promise<FocusSession> {
    const response = await apiFetch(
        `/api/focus-sessions/${sessionId}/cancel`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            await readApiError(
                response,
                "The focus session could not be cancelled."
            )
        );
    }

    return response.json() as Promise<FocusSession>;
}