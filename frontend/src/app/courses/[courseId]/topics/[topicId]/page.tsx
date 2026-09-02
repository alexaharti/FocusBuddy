"use client";

import {ChangeEvent, useEffect, useRef, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";

import {
    FileText,
    Upload,
    Check,
    LoaderCircle,
    AlertCircle,
    BookOpen,
    Layers3,
    NotebookText,
    Brain,
    CircleHelp,
} from "lucide-react";

import {getCourse, Course} from "@/lib/courses";
import {
    getTopic,
    Topic,
    uploadLecture,
    processLecture,
} from "@/lib/topics";

import styles from "./page.module.css";

export default function TopicPage() {
    const params = useParams();

    const courseId = Number(params.courseId);
    const topicId = Number(params.topicId);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [topic, setTopic] = useState<Topic | null>(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (
            !Number.isFinite(courseId) ||
            !Number.isFinite(topicId)
        ) {
            setError("Invalid topic.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadPage() {
            try {
                setLoading(true);
                setError(null);

                const [courseData, topicData] =
                    await Promise.all([
                        getCourse(
                            courseId,
                            controller.signal
                        ),
                        getTopic(
                            courseId,
                            topicId,
                            controller.signal
                        ),
                    ]);

                setCourse(courseData);
                setTopic(topicData);
            } catch (err) {
                if (
                    err instanceof DOMException &&
                    err.name === "AbortError"
                ) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "The topic could not be loaded."
                );
            } finally {
                setLoading(false);
            }
        }

        loadPage();

        return () => {
            controller.abort();
        };
    }, [courseId, topicId]);

    function openFilePicker() {
        if (uploading) {
            return;
        }

        fileInputRef.current?.click();
    }

    async function handleFileChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file || !topic) {
            return;
        }

        setUploadError(null);

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setUploadError("Please choose a PDF file.");
            event.target.value = "";
            return;
        }

        try {
            setUploading(true);

            const uploadedTopic = await uploadLecture(
                courseId,
                topicId,
                file
            );

            setTopic(uploadedTopic);

            setProcessing(true);

            await processLecture(
                courseId,
                topicId
            );

            const processedTopic = await getTopic(
                courseId,
                topicId
            );

            setTopic(processedTopic);

        } catch (err) {
            setUploadError(
                err instanceof Error
                    ? err.message
                    : "The lecture PDF could not be uploaded."
            );
        } finally {
            setUploading(false);
            setProcessing(false);

            // Allows the same file to be selected again
            // if an upload fails.
            event.target.value = "";
        }
    }

    async function handleProcessExistingPdf() {
        if (!topic) {
            return;
        }

        try {
            setUploadError(null);
            setProcessing(true);

            await processLecture(
                courseId,
                topicId
            );

            const processedTopic = await getTopic(
                courseId,
                topicId
            );

            setTopic(processedTopic);
        } catch (err) {
            setUploadError(
                err instanceof Error
                    ? err.message
                    : "The lecture PDF could not be processed."
            );
        } finally {
            setProcessing(false);
        }
    }

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingState}>
                    <LoaderCircle
                        size={22}
                        className={styles.spinner}
                    />
                    Loading topic...
                </div>
            </main>
        );
    }

    if (error || !topic || !course) {
        return (
            <main className={styles.page}>
                <div className={styles.errorState}>
                    <AlertCircle size={22}/>
                    <p>
                        {error ??
                            "The topic could not be loaded."}
                    </p>

                    <Link
                        href={`/courses/${courseId}`}
                        className={styles.backLink}
                    >
                        Back to course
                    </Link>
                </div>
            </main>
        );
    }

    const hasDocument = topic.documentId !== null;

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <Link
                    href={`/courses/${courseId}`}
                    className={styles.courseLink}
                >
                    ← {course.name}
                </Link>

                <section className={styles.topicHeader}>
                    <p className={styles.eyebrow}>
                        Topic
                    </p>

                    <h1>{topic.title}</h1>

                    {topic.description && (
                        <p className={styles.description}>
                            {topic.description}
                        </p>
                    )}
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <div>
                            <h2>Lecture material</h2>
                            <p>
                                The material FocusBuddy will use
                                for this topic.
                            </p>
                        </div>
                    </div>

                    {!hasDocument ? (
                        <>
                            <button
                                type="button"
                                className={styles.uploadCard}
                                onClick={openFilePicker}
                                disabled={uploading}
                            >
                                <span
                                    className={
                                        styles.uploadIcon
                                    }
                                >
                                    {uploading ? (
                                        <LoaderCircle
                                            size={26}
                                            className={
                                                styles.spinner
                                            }
                                        />
                                    ) : (
                                        <Upload size={26}/>
                                    )}
                                </span>

                                <span
                                    className={
                                        styles.uploadTitle
                                    }
                                >
                                    {uploading
                                        ? "Uploading PDF..."
                                        : "Upload lecture PDF"}
                                </span>

                                <span
                                    className={
                                        styles.uploadDescription
                                    }
                                >
                                    Add material for this topic
                                    to start chatting.
                                </span>
                            </button>

                            {uploadError && (
                                <div
                                    className={
                                        styles.inlineError
                                    }
                                >
                                    <AlertCircle size={17}/>
                                    {uploadError}
                                </div>
                            )}
                        </>
                    ) : (
                        <DocumentCard topic={topic}/>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className={styles.hiddenInput}
                        onChange={handleFileChange}
                    />
                </section>

                {hasDocument && (
                    <StudyMaterials
                        processingStatus={topic.processingStatus}
                        processing={processing}
                        onProcess={handleProcessExistingPdf}
                    />
                )}
            </div>
        </main>
    );
}

function DocumentCard({
                          topic,
                      }: {
    topic: Topic;
}) {
    const status = topic.processingStatus;

    let statusText = "PDF uploaded";
    let statusClass = styles.statusNeutral;

    if (status === "PROCESSING") {
        statusText = "Processing";
        statusClass = styles.statusProcessing;
    }

    if (status === "READY") {
        statusText = "Ready";
        statusClass = styles.statusReady;
    }

    if (status === "FAILED") {
        statusText = "Processing failed";
        statusClass = styles.statusFailed;
    }

    return (
        <div className={styles.documentCard}>
            <div className={styles.documentInfo}>
                <div className={styles.fileIcon}>
                    <FileText size={22}/>
                </div>

                <div>
                    <p className={styles.fileName}>
                        {topic.originalFilename ??
                            "Lecture PDF"}
                    </p>

                    {topic.fileSize !== null && (
                        <p className={styles.fileMeta}>
                            {formatFileSize(topic.fileSize)}
                        </p>
                    )}
                </div>
            </div>

            <div
                className={`${styles.documentStatus} ${statusClass}`}
            >
                {status === "READY" && (
                    <Check size={15}/>
                )}

                {status === "PROCESSING" && (
                    <LoaderCircle
                        size={15}
                        className={styles.spinner}
                    />
                )}

                {statusText}
            </div>
        </div>
    );
}

function StudyMaterials({
                            processingStatus,
                            processing,
                            onProcess,
                        }: {
    processingStatus: Topic["processingStatus"];
    processing: boolean;
    onProcess: () => void;
}) {
    const isReady =
        processingStatus === "READY";

    const materials = [
        {
            title: "Summary",
            description:
                "A quick overview of the lecture.",
            icon: BookOpen,
        },
        {
            title: "Standard Notes",
            description:
                "Clear notes for everyday studying.",
            icon: NotebookText,
        },
        {
            title: "Complete Notes",
            description:
                "A comprehensive version with full detail.",
            icon: Layers3,
        },
        {
            title: "Flashcards",
            description:
                "Review the important concepts.",
            icon: Brain,
        },
        {
            title: "Quiz",
            description:
                "Test your understanding of the topic.",
            icon: CircleHelp,
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeading}>
                <div>
                    <h2>Study Materials</h2>

                    <p>
                        Choose how you want to study this
                        topic.
                    </p>
                </div>
            </div>

            {!isReady && (
                <div className={styles.processingNotice}>
                    <div>
                        {processing && (
                            <LoaderCircle
                                size={17}
                                className={styles.spinner}
                            />
                        )}

                        <span>
                {processingStatus === "FAILED"
                    ? "The PDF could not be processed."
                    : processing
                        ? "Preparing your lecture material..."
                        : "This PDF has not been processed yet."}
            </span>
                    </div>

                    {!processing &&
                        processingStatus === "UPLOADED" && (
                            <button
                                type="button"
                                onClick={onProcess}
                                className={styles.processButton}
                            >
                                Process PDF
                            </button>
                        )}
                </div>
            )}

            <div className={styles.materialGrid}>
                {materials.map((material) => {
                    const Icon = material.icon;

                    return (
                        <button
                            key={material.title}
                            type="button"
                            className={
                                styles.materialCard
                            }
                            disabled
                        >
                            <span
                                className={
                                    styles.materialIcon
                                }
                            >
                                <Icon size={20}/>
                            </span>

                            <span
                                className={
                                    styles.materialContent
                                }
                            >
                                <strong>
                                    {material.title}
                                </strong>

                                <span>
                                    {
                                        material.description
                                    }
                                </span>
                            </span>

                            <span
                                className={
                                    styles.comingSoon
                                }
                            >
                                Coming next
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kilobytes = bytes / 1024;

    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(1)} KB`;
    }

    const megabytes = kilobytes / 1024;

    return `${megabytes.toFixed(1)} MB`;
}