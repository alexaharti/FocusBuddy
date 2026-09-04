"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {
    ArrowLeft,
    BookOpen,
    Brain,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Layers3,
    LoaderCircle,
    NotebookText,
    Plus,
    RotateCcw,
    Shuffle,
    Trash2,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import {
    deleteStudyMaterial,
    getStudyMaterial,
    StudyMaterial,
    StudyMaterialType,
    updateStudyMaterial,
} from "@/lib/studyMaterials";

import styles from "./page.module.css";

type FlashcardData = {
    title: string;
    cards: {
        front: string;
        back: string;
    }[];
};

type QuizData = {
    title: string;
    questions: {
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    }[];
};

const materialInfo: Record<
    StudyMaterialType,
    {
        title: string;
        description: string;
        icon: typeof BookOpen;
    }
> = {
    SUMMARY: {
        title: "Summary",
        description: "A concise overview of the lecture.",
        icon: BookOpen,
    },

    STANDARD_NOTES: {
        title: "Standard Notes",
        description: "Clear notes for everyday studying.",
        icon: NotebookText,
    },

    COMPLETE_NOTES: {
        title: "Complete Notes",
        description:
            "A comprehensive version with full detail.",
        icon: Layers3,
    },

    FLASHCARDS: {
        title: "Flashcards",
        description:
            "Review the important concepts using active recall.",
        icon: Brain,
    },

    QUIZ: {
        title: "Quiz",
        description:
            "Test your understanding of the lecture.",
        icon: CircleHelp,
    },
};

function parseMaterialType(
    value: string
): StudyMaterialType | null {
    const normalized =
        value.trim().replaceAll("-", "_").toUpperCase();

    const validTypes: StudyMaterialType[] = [
        "SUMMARY",
        "STANDARD_NOTES",
        "COMPLETE_NOTES",
        "FLASHCARDS",
        "QUIZ",
    ];

    if (
        validTypes.includes(
            normalized as StudyMaterialType
        )
    ) {
        return normalized as StudyMaterialType;
    }

    return null;
}

export default function StudyMaterialPage() {
    const params = useParams();

    const courseId = Number(params.courseId);
    const topicId = Number(params.topicId);
    const materialTypeParam = String(
        params.materialType
    );

    const materialType =
        parseMaterialType(materialTypeParam);

    const [material, setMaterial] =
        useState<StudyMaterial | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadMaterial() {
            if (
                !Number.isFinite(courseId) ||
                !Number.isFinite(topicId) ||
                !materialType
            ) {
                setError(
                    "Invalid Study Material."
                );

                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const data =
                    await getStudyMaterial(
                        courseId,
                        topicId,
                        materialType
                    );

                setMaterial(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Study Material could not be loaded."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadMaterial();
    }, [
        courseId,
        topicId,
        materialType,
    ]);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingState}>
                    <LoaderCircle
                        size={22}
                        className={styles.spinner}
                    />

                    Loading Study Material...
                </div>
            </main>
        );
    }

    if (
        error ||
        !material ||
        !materialType
    ) {
        return (
            <main className={styles.page}>
                <div className={styles.errorState}>
                    <p>
                        {error ??
                            "Study Material could not be loaded."}
                    </p>

                    <Link
                        href={`/courses/${courseId}/topics/${topicId}`}
                        className={styles.backButton}
                    >
                        Back to topic
                    </Link>
                </div>
            </main>
        );
    }

    const info =
        materialInfo[materialType];

    const Icon = info.icon;

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <Link
                    href={`/courses/${courseId}/topics/${topicId}`}
                    className={styles.backLink}
                >
                    <ArrowLeft size={17}/>
                    Back to topic
                </Link>

                <header
                    className={
                        styles.materialHeader
                    }
                >
                    <div
                        className={
                            styles.headerIcon
                        }
                    >
                        <Icon size={23}/>
                    </div>

                    <div>
                        <p
                            className={
                                styles.eyebrow
                            }
                        >
                            Study Material
                        </p>

                        <h1>{info.title}</h1>

                        <p
                            className={
                                styles.description
                            }
                        >
                            {info.description}
                        </p>
                    </div>
                </header>

                {materialType ===
                    "FLASHCARDS" && (
                        <FlashcardsView
                            content={
                                material.content
                            }
                            courseId={courseId}
                            topicId={topicId}
                        />
                    )}

                {materialType === "QUIZ" && (
                    <QuizView
                        content={
                            material.content
                        }
                    />
                )}

                {(materialType ===
                    "SUMMARY" ||
                    materialType ===
                    "STANDARD_NOTES" ||
                    materialType ===
                    "COMPLETE_NOTES") && (
                    <NotesView
                        content={
                            material.content
                        }
                    />
                )}
            </div>
        </main>
    );
}

function NotesView({
                       content,
                   }: {
    content: string;
}) {
    return (
        <article className={styles.notesCard}>
            <SimpleMarkdown
                content={content}
            />
        </article>
    );
}

function SimpleMarkdown({
                            content,
                        }: {
    content: string;
}) {
    const lines = content.split("\n");

    return (
        <div className={styles.markdown}>
            {lines.map((line, index) => {
                const trimmed = line.trim();

                if (!trimmed) {
                    return (
                        <div
                            key={index}
                            className={
                                styles.emptyLine
                            }
                        />
                    );
                }

                if (
                    trimmed.startsWith(
                        "### "
                    )
                ) {
                    return (
                        <h3 key={index}>
                            {formatInlineMarkdown(
                                trimmed.substring(
                                    4
                                )
                            )}
                        </h3>
                    );
                }

                if (
                    trimmed.startsWith(
                        "## "
                    )
                ) {
                    return (
                        <h2 key={index}>
                            {formatInlineMarkdown(
                                trimmed.substring(
                                    3
                                )
                            )}
                        </h2>
                    );
                }

                if (
                    trimmed.startsWith("# ")
                ) {
                    return (
                        <h1 key={index}>
                            {formatInlineMarkdown(
                                trimmed.substring(
                                    2
                                )
                            )}
                        </h1>
                    );
                }

                if (
                    trimmed.startsWith("- ")
                ) {
                    return (
                        <div
                            key={index}
                            className={
                                styles.bullet
                            }
                        >
                            <span>•</span>

                            <p>
                                {formatInlineMarkdown(
                                    trimmed.substring(
                                        2
                                    )
                                )}
                            </p>
                        </div>
                    );
                }

                if (
                    trimmed.startsWith("> ")
                ) {
                    return (
                        <blockquote
                            key={index}
                        >
                            {formatInlineMarkdown(
                                trimmed.substring(
                                    2
                                )
                            )}
                        </blockquote>
                    );
                }

                return (
                    <p key={index}>
                        {formatInlineMarkdown(
                            trimmed
                        )}
                    </p>
                );
            })}
        </div>
    );
}

function formatInlineMarkdown(
    text: string
) {
    const parts = text.split(
        /(\*\*.*?\*\*)/g
    );

    return parts.map(
        (part, index) => {
            if (
                part.startsWith("**") &&
                part.endsWith("**")
            ) {
                return (
                    <strong key={index}>
                        {part.slice(2, -2)}
                    </strong>
                );
            }

            return part;
        }
    );
}

type WorkingFlashcard = {
    id: string;
    front: string;
    back: string;
};

function FlashcardsView({
                            content,
                            courseId,
                            topicId,
                        }: {
    content: string;
    courseId: number;
    topicId: number;
}) {
    let parsedData: FlashcardData | null = null;

    try {
        parsedData = JSON.parse(content);
    } catch {
        parsedData = null;
    }

    const initialCards: WorkingFlashcard[] =
        parsedData?.cards.map((card, index) => ({
            id: `generated-${index}`,
            front: card.front,
            back: card.back,
        })) ?? [];

    const [originalDeck, setOriginalDeck] =
        useState<WorkingFlashcard[]>(initialCards);

    const [deck, setDeck] =
        useState<WorkingFlashcard[]>(initialCards);

    const [currentIndex, setCurrentIndex] =
        useState(0);

    const [revealed, setRevealed] =
        useState(false);

    const [showAddCard, setShowAddCard] =
        useState(false);

    const [showDeleteDeck, setShowDeleteDeck] =
        useState(false);

    const [newQuestion, setNewQuestion] =
        useState("");

    const [newAnswer, setNewAnswer] =
        useState("");

    const addCardPanelRef =
        useRef<HTMLElement | null>(null);

    const [savingDeck, setSavingDeck] =
        useState(false);

    const [deckError, setDeckError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!showAddCard) {
            return;
        }

        const timeout = window.setTimeout(() => {
            addCardPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 50);

        return () => window.clearTimeout(timeout);
    }, [showAddCard]);

    if (!parsedData) {
        return (
            <div className={styles.errorState}>
                Flashcards could not be displayed.
            </div>
        );
    }

    const currentCard = deck[currentIndex];

    function goPrevious() {
        if (currentIndex === 0) {
            return;
        }

        setCurrentIndex((current) => current - 1);
        setRevealed(false);
    }

    function goNext() {
        if (currentIndex >= deck.length - 1) {
            return;
        }

        setCurrentIndex((current) => current + 1);
        setRevealed(false);
    }

    function shuffleDeck() {
        const shuffled = [...deck];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(
                Math.random() * (i + 1)
            );

            [shuffled[i], shuffled[randomIndex]] = [
                shuffled[randomIndex],
                shuffled[i],
            ];
        }

        setDeck(shuffled);
        setCurrentIndex(0);
        setRevealed(false);
    }

    function restoreOriginalOrder() {
        setDeck([...originalDeck]);
        setCurrentIndex(0);
        setRevealed(false);
    }

    async function persistDeck(
        cards: WorkingFlashcard[]
    ) {
        const updatedContent = JSON.stringify({
            ...parsedData,
            cards: cards.map((card) => ({
                front: card.front,
                back: card.back,
            })),
        });

        await updateStudyMaterial(
            courseId,
            topicId,
            "FLASHCARDS",
            updatedContent
        );
    }

    async function addFlashcard() {
        const question = newQuestion.trim();
        const answer = newAnswer.trim();

        if (!question || !answer || savingDeck) {
            return;
        }

        const newCard: WorkingFlashcard = {
            id: `manual-${Date.now()}-${Math.random()}`,
            front: question,
            back: answer,
        };

        /*
         * Manual cards always go to the end
         * of the canonical/original deck.
         */
        const nextOriginalDeck = [
            ...originalDeck,
            newCard,
        ];

        const nextCurrentDeck = [
            ...deck,
            newCard,
        ];

        try {
            setSavingDeck(true);
            setDeckError(null);

            /*
             * Save to PostgreSQL FIRST.
             */
            await persistDeck(nextOriginalDeck);

            /*
             * Only update the visible UI after
             * the backend confirms the save.
             */
            setOriginalDeck(nextOriginalDeck);
            setDeck(nextCurrentDeck);

            setNewQuestion("");
            setNewAnswer("");
            setShowAddCard(false);
        } catch (err) {
            setDeckError(
                err instanceof Error
                    ? err.message
                    : "The flashcard could not be saved."
            );
        } finally {
            setSavingDeck(false);
        }
    }

    async function deleteCurrentFlashcard() {
        if (!currentCard || savingDeck) {
            return;
        }

        const cardId = currentCard.id;

        const nextOriginalDeck =
            originalDeck.filter(
                (card) => card.id !== cardId
            );

        const nextDeck =
            deck.filter(
                (card) => card.id !== cardId
            );

        try {
            setSavingDeck(true);
            setDeckError(null);

            await persistDeck(nextOriginalDeck);

            setOriginalDeck(nextOriginalDeck);
            setDeck(nextDeck);
            setRevealed(false);

            if (nextDeck.length === 0) {
                setCurrentIndex(0);
                return;
            }

            if (currentIndex >= nextDeck.length) {
                setCurrentIndex(
                    nextDeck.length - 1
                );
            }
        } catch (err) {
            setDeckError(
                err instanceof Error
                    ? err.message
                    : "The flashcard could not be deleted."
            );
        } finally {
            setSavingDeck(false);
        }
    }

    async function deleteEntireDeck() {
        if (savingDeck) {
            return;
        }

        try {
            setSavingDeck(true);
            setDeckError(null);

            await deleteStudyMaterial(
                courseId,
                topicId,
                "FLASHCARDS"
            );

            setShowDeleteDeck(false);

            /*
             * Go back to the Topic page.
             * Flashcards will now show "Generate"
             * again.
             */
            window.location.href =
                `/courses/${courseId}/topics/${topicId}`;
        } catch (err) {
            setDeckError(
                err instanceof Error
                    ? err.message
                    : "The flashcard deck could not be deleted."
            );

            setShowDeleteDeck(false);
        } finally {
            setSavingDeck(false);
        }
    }

    const progress =
        deck.length === 0
            ? 0
            : ((currentIndex + 1) / deck.length) * 100;

    return (
        <div className={styles.flashcardDeck}>
            <div className={styles.deckToolbar}>
                <div className={styles.deckProgress}>
                    <strong>
                        {deck.length === 0
                            ? "No cards"
                            : `Card ${currentIndex + 1} of ${deck.length}`}
                    </strong>

                    <div
                        className={
                            styles.progressTrack
                        }
                    >
                        <div
                            className={
                                styles.progressValue
                            }
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                <div
                    className={
                        styles.deckActions
                    }
                >
                    <button
                        type="button"
                        className={
                            styles.secondaryAction
                        }
                        onClick={shuffleDeck}
                        disabled={deck.length < 2}
                    >
                        <Shuffle size={18}/>
                        Shuffle
                    </button>

                    <button
                        type="button"
                        className={
                            styles.secondaryAction
                        }
                        onClick={
                            restoreOriginalOrder
                        }
                        disabled={
                            originalDeck.length === 0
                        }
                    >
                        <RotateCcw size={18}/>
                        Original order
                    </button>

                    <button
                        type="button"
                        className={
                            styles.addCardButton
                        }
                        onClick={() =>
                            setShowAddCard(true)
                        }
                    >
                        <Plus size={19}/>
                        Add card
                    </button>

                    <button
                        type="button"
                        className={
                            styles.deleteDeckButton
                        }
                        onClick={() =>
                            setShowDeleteDeck(true)
                        }
                        disabled={
                            originalDeck.length === 0
                        }
                    >
                        <Trash2 size={18}/>
                        Delete deck
                    </button>
                </div>
            </div>

            {deckError && (
                <div className={styles.deckError}>
                    {deckError}
                </div>
            )}

            {currentCard ? (
                <>
                    <div
                        className={
                            styles.flashcardStage
                        }
                    >
                        <div
                            className={
                                styles.cardBehindTwo
                            }
                        />

                        <div
                            className={
                                styles.cardBehindOne
                            }
                        />

                        <button
                            type="button"
                            className={
                                styles.mainFlashcard
                            }
                            onClick={() =>
                                setRevealed(
                                    (current) =>
                                        !current
                                )
                            }
                        >
                            <span
                                className={
                                    styles.cardSideLabel
                                }
                            >
                                {revealed
                                    ? "Answer"
                                    : "Question"}
                            </span>

                            <strong
                                className={
                                    styles.cardMainText
                                }
                            >
                                {revealed
                                    ? currentCard.back
                                    : currentCard.front}
                            </strong>

                            <span
                                className={
                                    styles.flipHint
                                }
                            >
                                {revealed
                                    ? "Click to show the question"
                                    : "Click to reveal the answer"}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={
                                styles.deleteSingleCard
                            }
                            aria-label="Delete this flashcard"
                            title="Delete this flashcard"
                            onClick={
                                deleteCurrentFlashcard
                            }
                            disabled={savingDeck}
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>

                    <div
                        className={
                            styles.cardNavigation
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.previousButton
                            }
                            onClick={goPrevious}
                            disabled={
                                currentIndex === 0
                            }
                        >
                            <ChevronLeft size={19}/>
                            Previous
                        </button>

                        <strong
                            className={
                                styles.cardCounter
                            }>
                            {currentIndex + 1} /{" "}
                            {deck.length}
                        </strong>

                        <button
                            type="button"
                            className={
                                styles.nextButton
                            }
                            onClick={goNext}
                            disabled={
                                currentIndex ===
                                deck.length - 1
                            }
                        >
                            Next
                            <ChevronRight size={19}/>
                        </button>
                    </div>
                </>
            ) : (
                <div
                    className={
                        styles.emptyDeck
                    }
                >
                    <Brain size={30}/>

                    <h2>
                        This deck is empty
                    </h2>

                    <p>
                        Add a flashcard to start
                        studying again.
                    </p>

                    <button
                        type="button"
                        className={
                            styles.addCardButton
                        }
                        onClick={() =>
                            setShowAddCard(true)
                        }
                    >
                        <Plus size={18}/>
                        Add flashcard
                    </button>
                </div>
            )}

            {showAddCard && (
                <section
                    ref={addCardPanelRef}
                    className={
                        styles.addCardPanel
                    }
                >
                    <div
                        className={
                            styles.addCardHeader
                        }
                    >
                        <div>
                            <h2>
                                Add a new flashcard
                            </h2>

                            <p>
                                New cards are added
                                to the end of the
                                original deck.
                            </p>
                        </div>

                        <button
                            type="button"
                            className={
                                styles.closePanelButton
                            }
                            onClick={() =>
                                setShowAddCard(false)
                            }
                        >
                            <X size={17}/>
                            Cancel
                        </button>
                    </div>

                    <div
                        className={
                            styles.addCardFields
                        }
                    >
                        <label>
                            <span>Question</span>

                            <textarea
                                value={newQuestion}
                                onChange={(event) =>
                                    setNewQuestion(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter the question..."
                            />
                        </label>

                        <label>
                            <span>Answer</span>

                            <textarea
                                value={newAnswer}
                                onChange={(event) =>
                                    setNewAnswer(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter the answer..."
                            />
                        </label>
                    </div>

                    <div
                        className={
                            styles.addCardFooter
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.addCardButton
                            }
                            onClick={
                                addFlashcard
                            }
                            disabled={
                                !newQuestion.trim() ||
                                !newAnswer.trim() ||
                                savingDeck
                            }
                        >
                            {savingDeck
                                ? "Saving..."
                                : "Add to this deck"}
                        </button>
                    </div>
                </section>
            )}

            {showDeleteDeck && (
                <div
                    className={
                        styles.modalBackdrop
                    }
                    onMouseDown={() =>
                        setShowDeleteDeck(false)
                    }
                >
                    <div
                        className={
                            styles.deleteModal
                        }
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-deck-title"
                    >
                        <div
                            className={
                                styles.deleteModalIcon
                            }
                        >
                            <Trash2 size={23}/>
                        </div>

                        <h2 id="delete-deck-title">
                            Delete flashcard deck?
                        </h2>

                        <p>
                            This will remove all
                            flashcards for this topic.
                            This action cannot be
                            undone.
                        </p>

                        <div
                            className={
                                styles.modalActions
                            }
                        >
                            <button
                                type="button"
                                className={
                                    styles.modalCancel
                                }
                                onClick={() =>
                                    setShowDeleteDeck(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={
                                    styles.modalDelete
                                }
                                onClick={
                                    deleteEntireDeck
                                }
                                disabled={savingDeck}
                            >
                                <Trash2 size={17}/>
                                {savingDeck
                                    ? "Deleting..."
                                    : "Delete deck"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuizView({
                      content,
                  }: {
    content: string;
}) {
    let parsedData: QuizData | null = null;

    try {
        parsedData = JSON.parse(content);
    } catch {
        parsedData = null;
    }

    const [currentIndex, setCurrentIndex] =
        useState(0);

    const [selectedAnswer, setSelectedAnswer] =
        useState<number | null>(null);

    const [checked, setChecked] =
        useState(false);

    const [score, setScore] =
        useState(0);

    const [completed, setCompleted] =
        useState(false);

    if (
        !parsedData ||
        !parsedData.questions ||
        parsedData.questions.length === 0
    ) {
        return (
            <div className={styles.errorState}>
                Quiz could not be displayed.
            </div>
        );
    }

    const questions = parsedData.questions;
    const currentQuestion =
        questions[currentIndex];

    const isCorrect =
        selectedAnswer ===
        currentQuestion.correctAnswer;

    const progress =
        ((currentIndex + 1) /
            questions.length) *
        100;

    function checkAnswer() {
        if (
            selectedAnswer === null ||
            checked
        ) {
            return;
        }

        setChecked(true);

        if (
            selectedAnswer ===
            currentQuestion.correctAnswer
        ) {
            setScore(
                (current) => current + 1
            );
        }
    }

    function goNext() {
        if (!checked) {
            return;
        }

        if (
            currentIndex ===
            questions.length - 1
        ) {
            setCompleted(true);
            return;
        }

        setCurrentIndex(
            (current) => current + 1
        );

        setSelectedAnswer(null);
        setChecked(false);
    }

    function restartQuiz() {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setChecked(false);
        setScore(0);
        setCompleted(false);
    }

    if (completed) {
        const percentage = Math.round(
            (score / questions.length) * 100
        );

        return (
            <div
                className={
                    styles.quizResults
                }
            >
                <div
                    className={
                        styles.resultsIcon
                    }
                >
                    <CheckCircle2 size={30}/>
                </div>

                <span
                    className={
                        styles.resultsEyebrow
                    }
                >
                    Quiz complete
                </span>

                <h2>
                    {score} /{" "}
                    {questions.length} correct
                </h2>

                <div
                    className={
                        styles.resultPercentage
                    }
                >
                    {percentage}%
                </div>

                <p>
                    {percentage === 100
                        ? "Excellent — you answered every question correctly."
                        : percentage >= 70
                            ? "Good work. Review the questions you missed and try again when you're ready."
                            : "A little more review will help. You can retry the quiz whenever you're ready."}
                </p>

                <button
                    type="button"
                    className={
                        styles.restartQuizButton
                    }
                    onClick={restartQuiz}
                >
                    <RotateCcw size={18}/>
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className={styles.quizExperience}>
            <div className={styles.quizProgress}>
                <strong>
                    Question {currentIndex + 1} of{" "}
                    {questions.length}
                </strong>

                <div
                    className={
                        styles.quizProgressTrack
                    }
                >
                    <div
                        className={
                            styles.quizProgressValue
                        }
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </div>

            <section className={styles.quizCard}>
                <span
                    className={
                        styles.quizQuestionLabel
                    }
                >
                    Question {currentIndex + 1}
                </span>

                <h2
                    className={
                        styles.quizQuestionText
                    }
                >
                    {currentQuestion.question}
                </h2>

                <div
                    className={
                        styles.quizOptions
                    }
                >
                    {currentQuestion.options.map(
                        (option, index) => {
                            const selected =
                                selectedAnswer ===
                                index;

                            const correctOption =
                                checked &&
                                index ===
                                currentQuestion.correctAnswer;

                            const incorrectSelected =
                                checked &&
                                selected &&
                                index !==
                                currentQuestion.correctAnswer;

                            let className =
                                styles.quizOption;

                            if (selected) {
                                className +=
                                    ` ${styles.quizOptionSelected}`;
                            }

                            if (correctOption) {
                                className +=
                                    ` ${styles.quizOptionCorrect}`;
                            }

                            if (
                                incorrectSelected
                            ) {
                                className +=
                                    ` ${styles.quizOptionIncorrect}`;
                            }

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    className={
                                        className
                                    }
                                    disabled={checked}
                                    onClick={() =>
                                        setSelectedAnswer(
                                            index
                                        )
                                    }
                                >
                                    <span
                                        className={
                                            styles.optionMarker
                                        }
                                    >
                                        {correctOption ? (
                                            <CheckCircle2
                                                size={
                                                    19
                                                }
                                            />
                                        ) : incorrectSelected ? (
                                            <XCircle
                                                size={
                                                    19
                                                }
                                            />
                                        ) : (
                                            String.fromCharCode(
                                                65 +
                                                index
                                            )
                                        )}
                                    </span>

                                    <span>
                                        {option}
                                    </span>
                                </button>
                            );
                        }
                    )}
                </div>

                {!checked && (
                    <div
                        className={
                            styles.quizCardFooter
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.checkAnswerButton
                            }
                            disabled={
                                selectedAnswer ===
                                null
                            }
                            onClick={checkAnswer}
                        >
                            Check answer
                        </button>
                    </div>
                )}

                {checked && (
                    <div
                        className={
                            styles.quizFeedbackArea
                        }
                    >
                        <div
                            className={
                                isCorrect
                                    ? styles.correctFeedback
                                    : styles.incorrectFeedback
                            }
                        >
                            <div
                                className={
                                    styles.feedbackHeading
                                }
                            >
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2
                                            size={20}
                                        />
                                        Correct!
                                    </>
                                ) : (
                                    <>
                                        <XCircle
                                            size={20}
                                        />
                                        Not quite
                                    </>
                                )}
                            </div>

                            {currentQuestion.explanation && (
                                <p>
                                    {
                                        currentQuestion.explanation
                                    }
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={
                                styles.nextQuestionButton
                            }
                            onClick={goNext}
                        >
                            {currentIndex ===
                            questions.length - 1
                                ? "Finish quiz"
                                : "Next question"}

                            <ChevronRight size={18}/>
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

function QuizQuestion({
                          number,
                          question,
                          options,
                          correctAnswer,
                          explanation,
                      }: {
    number: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}) {
    const [selected, setSelected] =
        useState<number | null>(null);

    const answered =
        selected !== null;

    return (
        <section
            className={
                styles.quizQuestion
            }
        >
            <p
                className={
                    styles.questionNumber
                }
            >
                Question {number}
            </p>

            <h2>{question}</h2>

            <div
                className={
                    styles.options
                }
            >
                {options.map(
                    (option, index) => (
                        <button
                            key={index}
                            type="button"
                            className={
                                styles.option
                            }
                            disabled={
                                answered
                            }
                            onClick={() =>
                                setSelected(
                                    index
                                )
                            }
                        >
                            {option}
                        </button>
                    )
                )}
            </div>

            {answered && (
                <div
                    className={
                        styles.feedback
                    }
                >
                    <strong>
                        {selected ===
                        correctAnswer
                            ? "Correct"
                            : "Not quite"}
                    </strong>

                    <p>
                        {
                            explanation
                        }
                    </p>
                </div>
            )}
        </section>
    );
}