"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {
    FormEvent,
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    FileText,
    LoaderCircle,
    Plus,
    X,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import {
    type Course,
    getCourse,
} from "@/lib/courses";
import {
    type Topic,
    createTopic,
    getTopics,
} from "@/lib/topics";

import styles from "./page.module.css";

function CourseDetailsContent() {
    const params = useParams();

    const courseId = Number(params.courseId);

    const [course, setCourse] = useState<Course | null>(
        null
    );
    const [topics, setTopics] = useState<Topic[]>([]);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");

    const [formError, setFormError] =
        useState("");
    const [submitting, setSubmitting] =
        useState(false);

    const loadCourse = useCallback(
        async (signal?: AbortSignal) => {
            if (!Number.isFinite(courseId)) {
                setPageError("Invalid course.");
                setLoading(false);
                return;
            }

            try {
                const [courseResult, topicsResult] =
                    await Promise.all([
                        getCourse(courseId, signal),
                        getTopics(courseId, signal),
                    ]);

                setCourse(courseResult);
                setTopics(topicsResult);
                setPageError("");
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                setPageError(
                    error instanceof Error
                        ? error.message
                        : "The course could not be loaded."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [courseId]
    );

    useEffect(() => {
        const controller = new AbortController();

        void loadCourse(controller.signal);

        return () => {
            controller.abort();
        };
    }, [loadCourse]);

    function resetForm() {
        setTitle("");
        setDescription("");
        setFormError("");
    }

    function openModal() {
        resetForm();
        setModalOpen(true);
    }

    function closeModal() {
        if (submitting) {
            return;
        }

        setModalOpen(false);
        resetForm();
    }

    async function handleCreateTopic(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const normalizedTitle = title.trim();

        if (!normalizedTitle) {
            setFormError(
                "Topic title is required."
            );
            return;
        }

        setSubmitting(true);
        setFormError("");

        try {
            const newTopic = await createTopic(
                courseId,
                {
                    title: normalizedTitle,
                    description,
                }
            );

            setTopics((currentTopics) => [
                ...currentTopics,
                newTopic,
            ]);

            setModalOpen(false);
            resetForm();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "The topic could not be created."
            );
        } finally {
            setSubmitting(false);
        }
    }

    function getMaterialLabel(topic: Topic) {
        if (!topic.documentId) {
            return "No material";
        }

        if (topic.processingStatus === "FAILED") {
            return "Processing failed";
        }

        if (
            topic.processingStatus === "PROCESSING"
        ) {
            return "Processing";
        }

        if (
            topic.processingStatus === "PROCESSED"
        ) {
            return "PDF ready";
        }

        return "PDF uploaded";
    }

    if (loading) {
        return (
            <AppShell>
                <main className={styles.page}>
                    <div className={styles.stateCard}>
                        <LoaderCircle
                            className={styles.spinner}
                            size={24}
                        />
                        <div>
                            <strong>
                                Loading course
                            </strong>
                            <p>
                                Your topics are being
                                prepared.
                            </p>
                        </div>
                    </div>
                </main>
            </AppShell>
        );
    }

    if (pageError || !course) {
        return (
            <AppShell>
                <main className={styles.page}>
                    <div className={styles.stateCard}>
                        <div>
                            <strong>
                                Course could not be
                                loaded
                            </strong>
                            <p>
                                {pageError ||
                                    "Course not found."}
                            </p>
                        </div>
                    </div>
                </main>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <main className={styles.page}>
                <div className={styles.breadcrumb}>
                    <Link href="/courses">
                        <ArrowLeft size={15}/>
                        Courses
                    </Link>
                </div>

                <header className={styles.header}>
                    <div>
                        <div
                            className={
                                styles.eyebrow
                            }
                        >
                            <BookOpen size={15}/>
                            Course
                        </div>

                        <h1 className={styles.title}>
                            {course.name}
                        </h1>

                        {course.yearLabel && (
                            <div
                                className={
                                    styles.period
                                }
                            >
                                {course.yearLabel}
                            </div>
                        )}

                        <p
                            className={
                                styles.description
                            }
                        >
                            {course.description ||
                                "Add topics and lecture material to start studying this course."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.createButton
                        }
                        onClick={openModal}
                    >
                        <Plus size={17}/>
                        New topic
                    </button>
                </header>

                <section
                    className={styles.topicsSection}
                >
                    <div
                        className={
                            styles.sectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.sectionEyebrow
                                }
                            >
                                Topics
                            </span>

                            <h2>
                                Your course material
                            </h2>
                        </div>

                        <span
                            className={
                                styles.topicCount
                            }
                        >
                            {topics.length}{" "}
                            {topics.length === 1
                                ? "topic"
                                : "topics"}
                        </span>
                    </div>

                    {topics.length === 0 ? (
                        <div
                            className={
                                styles.emptyState
                            }
                        >
                            <div
                                className={
                                    styles.emptyIcon
                                }
                            >
                                <FileText
                                    size={26}
                                />
                            </div>

                            <h3>
                                No topics yet
                            </h3>

                            <p>
                                Create your first topic.
                                You can upload the lecture
                                PDF afterwards.
                            </p>

                            <button
                                type="button"
                                className={
                                    styles.createButton
                                }
                                onClick={openModal}
                            >
                                <Plus size={17}/>
                                Create topic
                            </button>
                        </div>
                    ) : (
                        <div
                            className={
                                styles.topicList
                            }
                        >
                            {topics.map(
                                (topic, index) => (
                                    <Link
                                        key={
                                            topic.id
                                        }
                                        href={`/courses/${courseId}/topics/${topic.id}`}
                                        className={
                                            styles.topicCard
                                        }
                                    >
                                        <div
                                            className={
                                                styles.topicNumber
                                            }
                                        >
                                            {String(
                                                topic.position ??
                                                index +
                                                1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </div>

                                        <div
                                            className={
                                                styles.topicMain
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.topicHeading
                                                }
                                            >
                                                <h3>
                                                    {
                                                        topic.title
                                                    }
                                                </h3>

                                                <span
                                                    className={
                                                        topic.documentId
                                                            ? styles.readyBadge
                                                            : styles.emptyBadge
                                                    }
                                                >
                                                    {getMaterialLabel(
                                                        topic
                                                    )}
                                                </span>
                                            </div>

                                            <p>
                                                {topic.description ||
                                                    "No description added."}
                                            </p>

                                            {topic.originalFilename && (
                                                <div
                                                    className={
                                                        styles.filename
                                                    }
                                                >
                                                    <FileText
                                                        size={
                                                            14
                                                        }
                                                    />
                                                    {
                                                        topic.originalFilename
                                                    }
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className={
                                                styles.openAction
                                            }
                                        >
                                            Open
                                            <ArrowRight
                                                size={
                                                    16
                                                }
                                            />
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </section>

                {modalOpen && (
                    <div
                        className={
                            styles.modalBackdrop
                        }
                        role="presentation"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeModal();
                            }
                        }}
                    >
                        <section
                            className={
                                styles.modal
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="create-topic-title"
                        >
                            <div
                                className={
                                    styles.modalHeader
                                }
                            >
                                <div>
                                    <span>
                                        New topic
                                    </span>

                                    <h2 id="create-topic-title">
                                        Create a topic
                                    </h2>

                                    <p>
                                        Add the topic now.
                                        Lecture material can
                                        be uploaded later.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        styles.closeButton
                                    }
                                    onClick={
                                        closeModal
                                    }
                                    aria-label="Close dialog"
                                >
                                    <X size={19}/>
                                </button>
                            </div>

                            <form
                                className={
                                    styles.form
                                }
                                onSubmit={
                                    handleCreateTopic
                                }
                            >
                                <div
                                    className={
                                        styles.field
                                    }
                                >
                                    <label htmlFor="topic-title">
                                        Topic title
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="topic-title"
                                        type="text"
                                        value={title}
                                        onChange={(
                                            event
                                        ) =>
                                            setTitle(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="For example, Memory Management"
                                        maxLength={
                                            200
                                        }
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div
                                    className={
                                        styles.field
                                    }
                                >
                                    <label htmlFor="topic-description">
                                        Description
                                        <small>
                                            Optional
                                        </small>
                                    </label>

                                    <textarea
                                        id="topic-description"
                                        value={
                                            description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDescription(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="What does this topic cover?"
                                        rows={3}
                                    />
                                </div>

                                {formError && (
                                    <p
                                        className={
                                            styles.formError
                                        }
                                    >
                                        {formError}
                                    </p>
                                )}

                                <div
                                    className={
                                        styles.modalActions
                                    }
                                >
                                    <button
                                        type="button"
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={
                                            styles.submitButton
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        {submitting ? (
                                            <>
                                                <LoaderCircle
                                                    className={
                                                        styles.spinner
                                                    }
                                                    size={
                                                        16
                                                    }
                                                />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus
                                                    size={
                                                        16
                                                    }
                                                />
                                                Create
                                                topic
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </main>
        </AppShell>
    );
}

export default function CourseDetailsPage() {
    return (
        <ProtectedRoute>
            <CourseDetailsContent/>
        </ProtectedRoute>
    );
}