"use client";

import {useRouter} from "next/navigation";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {
    generateStudyMaterial,
    getStudyMaterials,
    StudyMaterial,
    StudyMaterialType,
} from "@/lib/studyMaterials";

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

    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [topic, setTopic] = useState<Topic | null>(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [generatingMaterial, setGeneratingMaterial] =
        useState<StudyMaterialType | null>(null);
    const [materialError, setMaterialError] = useState<string | null>(null);

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

    async function loadStudyMaterials() {
        try {
            setLoadingMaterials(true);
            setMaterialError(null);

            const materials = await getStudyMaterials(
                courseId,
                topicId
            );

            setStudyMaterials(materials);
        } catch (err) {
            setMaterialError(
                err instanceof Error
                    ? err.message
                    : "Study Materials could not be loaded."
            );
        } finally {
            setLoadingMaterials(false);
        }
    }

    useEffect(() => {
        if (
            topic?.processingStatus === "READY"
        ) {
            void loadStudyMaterials();
        }
    }, [topic?.processingStatus]);

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

    async function handleStudyMaterialClick(
        materialType: StudyMaterialType
    ) {
        const existingMaterial =
            studyMaterials.find(
                (material) =>
                    material.materialType === materialType
            );

        if (existingMaterial) {
            router.push(
                `/courses/${courseId}/topics/${topicId}/study-materials/${materialType.toLowerCase()}`
            );

            return;
        }

        try {
            setGeneratingMaterial(materialType);
            setMaterialError(null);

            const generatedMaterial =
                await generateStudyMaterial(
                    courseId,
                    topicId,
                    materialType
                );

            setStudyMaterials((current) => [
                ...current,
                generatedMaterial,
            ]);

            router.push(
                `/courses/${courseId}/topics/${topicId}/study-materials/${materialType.toLowerCase()}`
            );
        } catch (err) {
            setMaterialError(
                err instanceof Error
                    ? err.message
                    : "Study Material could not be generated."
            );
        } finally {
            setGeneratingMaterial(null);
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
                        studyMaterials={studyMaterials}
                        loadingMaterials={loadingMaterials}
                        generatingMaterial={generatingMaterial}
                        materialError={materialError}
                        onMaterialClick={handleStudyMaterialClick}
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
                            studyMaterials,
                            loadingMaterials,
                            generatingMaterial,
                            materialError,
                            onMaterialClick,
                        }: {
    processingStatus: Topic["processingStatus"];
    processing: boolean;
    onProcess: () => void;
    studyMaterials: StudyMaterial[];
    loadingMaterials: boolean;
    generatingMaterial: StudyMaterialType | null;
    materialError: string | null;
    onMaterialClick: (materialType: StudyMaterialType) => void;
}) {
    const materials: {
        title: string;
        description: string;
        icon: typeof BookOpen;
        type: StudyMaterialType;
    }[] = [
        {
            title: "Summary",
            description: "A quick overview of the lecture.",
            icon: BookOpen,
            type: "SUMMARY",
        },
        {
            title: "Standard Notes",
            description: "Clear notes for everyday studying.",
            icon: NotebookText,
            type: "STANDARD_NOTES",
        },
        {
            title: "Complete Notes",
            description: "A comprehensive version with full detail.",
            icon: Layers3,
            type: "COMPLETE_NOTES",
        },
        {
            title: "Flashcards",
            description: "Review the important concepts.",
            icon: Brain,
            type: "FLASHCARDS",
        },
        {
            title: "Quiz",
            description: "Test your understanding of the topic.",
            icon: CircleHelp,
            type: "QUIZ",
        },
    ];

    const isReady = processingStatus === "READY";

    if (!isReady) {
        return (
            <section className={styles.section}>
                <div className={styles.sectionHeading}>
                    <div>
                        <h2>Study Materials</h2>
                        <p>
                            Choose how you want to study this topic.
                        </p>
                    </div>
                </div>

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
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeading}>
                <div>
                    <h2>Study Materials</h2>
                    <p>
                        Choose how you want to study this topic.
                    </p>
                </div>
            </div>

            {materialError && (
                <div className={styles.inlineError}>
                    <AlertCircle size={17}/>
                    {materialError}
                </div>
            )}

            {loadingMaterials ? (
                <div className={styles.loadingState}>
                    <LoaderCircle
                        size={18}
                        className={styles.spinner}
                    />
                    Loading Study Materials...
                </div>
            ) : (
                <div className={styles.materialGrid}>
                    {materials.map((material) => {
                        const Icon = material.icon;

                        const exists = studyMaterials.some(
                            (savedMaterial) =>
                                savedMaterial.materialType === material.type
                        );

                        const generating =
                            generatingMaterial === material.type;

                        return (
                            <button
                                key={material.type}
                                type="button"
                                className={styles.materialCard}
                                onClick={() =>
                                    onMaterialClick(material.type)
                                }
                                disabled={generating}
                            >
                                <span className={styles.materialIcon}>
                                    <Icon size={20}/>
                                </span>

                                <span className={styles.materialContent}>
                                    <strong>{material.title}</strong>

                                    <span>
                                        {material.description}
                                    </span>
                                </span>

                                <span className={styles.comingSoon}>
                                    {generating
                                        ? "Creating..."
                                        : exists
                                            ? "Open"
                                            : "Generate"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
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