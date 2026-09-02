"use client";

import Link from "next/link";
import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    LoaderCircle,
    Plus,
    X,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import {
    type Course,
    createCourse,
    getCourses,
} from "@/lib/courses";

import styles from "./page.module.css";

const COURSE_COLORS = [
    "#A8B89A",
    "#C9785C",
    "#174C4F",
    "#D7A65A",
    "#8EA7B3",
    "#A68AA6",
];

interface SemesterGroup {
    key: string;
    label: string;
    sortOrder: number;
    courses: Course[];
}

interface YearGroup {
    key: string;
    label: string;
    sortOrder: number;
    courseCount: number;
    semesters: SemesterGroup[];
}

interface ParsedPeriod {
    yearKey: string;
    yearLabel: string;
    yearSortOrder: number;

    semesterKey: string;
    semesterLabel: string;
    semesterSortOrder: number;
}

const NUMBER_WORDS: Record<string, string> = {
    zero: "0",
    one: "1",
    first: "1",
    two: "2",
    second: "2",
    three: "3",
    third: "3",
    four: "4",
    fourth: "4",
    five: "5",
    fifth: "5",
    six: "6",
    sixth: "6",
    seven: "7",
    seventh: "7",
    eight: "8",
    eighth: "8",
    nine: "9",
    ninth: "9",
    ten: "10",
    tenth: "10",
    eleven: "11",
    eleventh: "11",
    twelve: "12",
    twelfth: "12",
    thirteen: "13",
    thirteenth: "13",
};

function normalizePeriodText(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(
            /\b(zero|one|first|two|second|three|third|four|fourth|five|fifth|six|sixth|seven|seventh|eight|eighth|nine|ninth|ten|tenth|eleven|eleventh|twelve|twelfth|thirteen|thirteenth)\b/g,
            (word) => NUMBER_WORDS[word] ?? word
        )
        .replace(/(\d+)(st|nd|rd|th)\b/g, "$1")
        .replace(/[,_–—-]+/g, " ")
        .replace(/\s+/g, " ");
}

function parsePeriod(
    value: string | null
): ParsedPeriod {
    if (!value?.trim()) {
        return {
            yearKey: "__other_year__",
            yearLabel: "Other",
            yearSortOrder: Number.MAX_SAFE_INTEGER,

            semesterKey: "__no_semester__",
            semesterLabel: "Courses",
            semesterSortOrder: Number.MAX_SAFE_INTEGER,
        };
    }

    const normalized = normalizePeriodText(value);

    const yearMatch =
        normalized.match(/\byear\s*(\d{1,2})\b/) ??
        normalized.match(/\b(\d{1,2})\s*year\b/);

    const semesterMatch =
        normalized.match(
            /\bsemester\s*(\d{1,2})\b/
        ) ??
        normalized.match(/\bsem\s*(\d{1,2})\b/) ??
        normalized.match(
            /\b(\d{1,2})\s*semester\b/
        ) ??
        normalized.match(/\b(\d{1,2})\s*sem\b/);

    const year = yearMatch
        ? Number(yearMatch[1])
        : null;

    const semester = semesterMatch
        ? Number(semesterMatch[1])
        : null;

    const isFullYear =
        normalized.includes("full year") ||
        normalized.includes("annual");

    return {
        yearKey:
            year === null
                ? "__other_year__"
                : `year-${year}`,

        yearLabel:
            year === null
                ? "Other"
                : `Year ${year}`,

        yearSortOrder:
            year ?? Number.MAX_SAFE_INTEGER,

        semesterKey:
            semester !== null
                ? `semester-${semester}`
                : isFullYear
                    ? "__full_year__"
                    : "__no_semester__",

        semesterLabel:
            semester !== null
                ? `Semester ${semester}`
                : isFullYear
                    ? "Full year"
                    : "Courses",

        semesterSortOrder:
            semester !== null
                ? semester
                : isFullYear
                    ? 100
                    : 200,
    };
}

function createPeriodLabel(
    yearChoice: string,
    semesterChoice: string
): string {
    const parts: string[] = [];

    if (yearChoice !== "__none__") {
        parts.push(`Year ${yearChoice}`);
    }

    if (semesterChoice === "__full_year__") {
        parts.push("Full year");
    } else if (semesterChoice !== "__none__") {
        parts.push(`Semester ${semesterChoice}`);
    }

    return parts.join(" · ");
}

function CoursesContent() {
    const [courses, setCourses] = useState<Course[]>(
        []
    );

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [name, setName] = useState("");
    const [yearChoice, setYearChoice] =
        useState("1");

    const [semesterChoice, setSemesterChoice] =
        useState("1");

    const [description, setDescription] =
        useState("");

    const [color, setColor] = useState(
        COURSE_COLORS[0]
    );

    const [formError, setFormError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const loadCourses = useCallback(
        async (signal?: AbortSignal) => {
            try {
                const result = await getCourses(signal);

                setCourses(result);
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
                        : "Courses could not be loaded."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        []
    );

    useEffect(() => {
        const controller = new AbortController();

        void loadCourses(controller.signal);

        return () => {
            controller.abort();
        };
    }, [loadCourses]);

    const groupedCourses =
        useMemo<YearGroup[]>(() => {
            const yearGroups = new Map<
                string,
                {
                    label: string;
                    sortOrder: number;
                    semesters: Map<
                        string,
                        SemesterGroup
                    >;
                }
            >();

            for (const course of courses) {
                const period = parsePeriod(
                    course.yearLabel
                );

                let yearGroup = yearGroups.get(
                    period.yearKey
                );

                if (!yearGroup) {
                    yearGroup = {
                        label: period.yearLabel,
                        sortOrder:
                        period.yearSortOrder,
                        semesters: new Map<
                            string,
                            SemesterGroup
                        >(),
                    };

                    yearGroups.set(
                        period.yearKey,
                        yearGroup
                    );
                }

                let semesterGroup =
                    yearGroup.semesters.get(
                        period.semesterKey
                    );

                if (!semesterGroup) {
                    semesterGroup = {
                        key: period.semesterKey,
                        label:
                        period.semesterLabel,
                        sortOrder:
                        period.semesterSortOrder,
                        courses: [],
                    };

                    yearGroup.semesters.set(
                        period.semesterKey,
                        semesterGroup
                    );
                }

                semesterGroup.courses.push(course);
            }

            return Array.from(
                yearGroups.entries()
            )
                .map(([yearKey, yearGroup]) => {
                    const semesters = Array.from(
                        yearGroup.semesters.values()
                    ).sort((first, second) => {
                        const firstSpecial =
                            first.key.startsWith("__");
                        const secondSpecial =
                            second.key.startsWith("__");

                        if (firstSpecial && !secondSpecial) {
                            return 1;
                        }
                        if (!firstSpecial && secondSpecial) {
                            return -1;
                        }

                        return second.sortOrder - first.sortOrder;

                    });

                    return {
                        key: yearKey,
                        label: yearGroup.label,
                        sortOrder:
                        yearGroup.sortOrder,
                        courseCount:
                            semesters.reduce(
                                (
                                    total,
                                    semester
                                ) =>
                                    total +
                                    semester.courses
                                        .length,
                                0
                            ),
                        semesters,
                    };
                })
                .sort((first, second) => {
                    const firstSpecial =
                        first.key === "__other_year__";
                    const secondSpecial =
                        second.key === "__other_year__";

                    if (firstSpecial && !secondSpecial) {
                        return 1;
                    }
                    if (!firstSpecial && secondSpecial) {
                        return -1;
                    }

                    return second.sortOrder - first.sortOrder;
                });
        }, [courses]);

    function resetForm(): void {
        setName("");
        setYearChoice("1");
        setSemesterChoice("1");
        setDescription("");
        setColor(COURSE_COLORS[0]);
        setFormError("");
    }

    function openModal(): void {
        resetForm();
        setModalOpen(true);
    }

    function closeModal(): void {
        if (submitting) {
            return;
        }

        setModalOpen(false);
        resetForm();
    }

    async function handleCreateCourse(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const normalizedName = name.trim();

        if (!normalizedName) {
            setFormError(
                "Course name is required."
            );
            return;
        }

        const selectedYearLabel =
            createPeriodLabel(
                yearChoice,
                semesterChoice
            );

        setSubmitting(true);
        setFormError("");

        try {
            const newCourse =
                await createCourse({
                    name: normalizedName,
                    yearLabel:
                    selectedYearLabel,
                    description,
                    color,
                });

            setCourses((currentCourses) => [
                newCourse,
                ...currentCourses,
            ]);

            setModalOpen(false);
            resetForm();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "The course could not be created."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppShell>
            <main className={styles.page}>
                <header className={styles.header}>
                    <div>
                        <div
                            className={
                                styles.eyebrow
                            }
                        >
                            <BookOpen size={15}/>
                            Learning space
                        </div>

                        <h1
                            className={styles.title}
                        >
                            Courses
                        </h1>

                        <p
                            className={
                                styles.subtitle
                            }
                        >
                            Organize your material and
                            continue each subject from
                            where you left off.
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
                        New course
                    </button>
                </header>

                {loading && (
                    <section
                        className={
                            styles.stateCard
                        }
                    >
                        <LoaderCircle
                            className={
                                styles.spinner
                            }
                            size={25}
                        />

                        <div>
                            <strong>
                                Loading your courses
                            </strong>

                            <p>
                                Your learning space
                                will be ready in a
                                moment.
                            </p>
                        </div>
                    </section>
                )}

                {!loading && pageError && (
                    <section
                        className={`${styles.stateCard} ${styles.errorState}`}
                    >
                        <div>
                            <strong>
                                Courses could not be
                                loaded
                            </strong>

                            <p>{pageError}</p>
                        </div>

                        <button
                            type="button"
                            className={
                                styles.secondaryButton
                            }
                            onClick={() => {
                                setLoading(true);
                                void loadCourses();
                            }}
                        >
                            Try again
                        </button>
                    </section>
                )}

                {!loading &&
                    !pageError &&
                    courses.length === 0 && (
                        <section
                            className={
                                styles.emptyState
                            }
                        >
                            <div
                                className={
                                    styles.emptyIcon
                                }
                            >
                                <BookOpen
                                    size={30}
                                />
                            </div>

                            <h2>
                                Create your first
                                course
                            </h2>

                            <p>
                                Courses keep your
                                topics, lecture PDFs,
                                generated notes, AI
                                conversations and
                                study progress
                                together.
                            </p>

                            <button
                                type="button"
                                className={
                                    styles.createButton
                                }
                                onClick={openModal}
                            >
                                <Plus size={17}/>
                                Create course
                            </button>
                        </section>
                    )}

                {!loading &&
                    !pageError &&
                    groupedCourses.length > 0 && (
                        <div
                            className={
                                styles.groups
                            }
                        >
                            {groupedCourses.map(
                                (yearGroup) => (
                                    <section
                                        className={
                                            styles.yearGroup
                                        }
                                        key={
                                            yearGroup.key
                                        }
                                    >
                                        <div className={styles.yearHeader}>
                                            <h2>{yearGroup.label}</h2>

                                            <span className={styles.yearCount}>
        {yearGroup.courseCount}{" "}
                                                {yearGroup.courseCount === 1
                                                    ? "course"
                                                    : "courses"}
    </span>
                                        </div>

                                        <div
                                            className={
                                                styles.semesterGroups
                                            }
                                        >
                                            {yearGroup.semesters.map(
                                                (
                                                    semesterGroup
                                                ) => (
                                                    <section
                                                        className={
                                                            styles.semesterGroup
                                                        }
                                                        key={`${yearGroup.key}-${semesterGroup.key}`}
                                                    >
                                                        <div
                                                            className={
                                                                styles.semesterHeader
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.semesterTitle
                                                                }
                                                            >
                                                                <CalendarDays
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                <h3>
                                                                    {
                                                                        semesterGroup.label
                                                                    }
                                                                </h3>
                                                            </div>

                                                            <span>
                                                                {
                                                                    semesterGroup
                                                                        .courses
                                                                        .length
                                                                }{" "}
                                                                {semesterGroup
                                                                    .courses
                                                                    .length ===
                                                                1
                                                                    ? "course"
                                                                    : "courses"}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className={
                                                                styles.courseGrid
                                                            }
                                                        >
                                                            {semesterGroup.courses.map(
                                                                (
                                                                    course
                                                                ) => (
                                                                    <Link
                                                                        key={
                                                                            course.id
                                                                        }
                                                                        href={`/courses/${course.id}`}
                                                                        className={
                                                                            styles.courseCard
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={
                                                                                styles.colorStrip
                                                                            }
                                                                            style={{
                                                                                backgroundColor:
                                                                                    course.color ||
                                                                                    COURSE_COLORS[0],
                                                                            }}
                                                                        />

                                                                        <div
                                                                            className={
                                                                                styles.courseContent
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    styles.courseIcon
                                                                                }
                                                                                style={{
                                                                                    backgroundColor: `${
                                                                                        course.color ||
                                                                                        COURSE_COLORS[0]
                                                                                    }24`,
                                                                                    color:
                                                                                        course.color ||
                                                                                        "var(--deep-teal)",
                                                                                }}
                                                                            >
                                                                                <BookOpen
                                                                                    size={
                                                                                        21
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div
                                                                                className={
                                                                                    styles.courseHeading
                                                                                }
                                                                            >
                                                                                <h3>
                                                                                    {
                                                                                        course.name
                                                                                    }
                                                                                </h3>
                                                                            </div>

                                                                            <p
                                                                                className={
                                                                                    styles.description
                                                                                }
                                                                            >
                                                                                {course.description ||
                                                                                    "Add topics and lecture materials to begin studying this course."}
                                                                            </p>

                                                                            <div
                                                                                className={
                                                                                    styles.courseFooter
                                                                                }
                                                                            >
                                                                                <span>
                                                                                    Open
                                                                                    course
                                                                                </span>

                                                                                <ArrowRight
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                )
                                                            )}
                                                        </div>
                                                    </section>
                                                )
                                            )}
                                        </div>
                                    </section>
                                )
                            )}
                        </div>
                    )}

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
                            className={styles.modal}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="create-course-title"
                        >
                            <div
                                className={
                                    styles.modalHeader
                                }
                            >
                                <div>
                                    <span
                                        className={
                                            styles.modalEyebrow
                                        }
                                    >
                                        New learning
                                        space
                                    </span>

                                    <h2 id="create-course-title">
                                        Create a course
                                    </h2>

                                    <p>
                                        You can add topics
                                        and lecture PDFs
                                        after creating it.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        styles.closeButton
                                    }
                                    onClick={closeModal}
                                    aria-label="Close create-course dialog"
                                >
                                    <X size={19}/>
                                </button>
                            </div>

                            <form
                                className={
                                    styles.form
                                }
                                onSubmit={
                                    handleCreateCourse
                                }
                            >
                                <div
                                    className={
                                        styles.field
                                    }
                                >
                                    <label htmlFor="course-name">
                                        Course name
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="course-name"
                                        type="text"
                                        value={name}
                                        onChange={(
                                            event
                                        ) =>
                                            setName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="For example, Databases"
                                        maxLength={150}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div
                                    className={
                                        styles.periodFields
                                    }
                                >
                                    <div
                                        className={
                                            styles.field
                                        }
                                    >
                                        <label htmlFor="course-year">
                                            Year
                                            <small>
                                                Optional
                                            </small>
                                        </label>

                                        <select
                                            id="course-year"
                                            value={
                                                yearChoice
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setYearChoice(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            {Array.from(
                                                {
                                                    length: 13,
                                                },
                                                (
                                                    _,
                                                    index
                                                ) =>
                                                    index +
                                                    1
                                            ).map(
                                                (
                                                    year
                                                ) => (
                                                    <option
                                                        key={
                                                            year
                                                        }
                                                        value={String(
                                                            year
                                                        )}
                                                    >
                                                        Year{" "}
                                                        {
                                                            year
                                                        }
                                                    </option>
                                                )
                                            )}

                                            <option value="__none__">
                                                No specific
                                                year
                                            </option>
                                        </select>
                                    </div>

                                    <div
                                        className={
                                            styles.field
                                        }
                                    >
                                        <label htmlFor="course-semester">
                                            Semester
                                            <small>
                                                Optional
                                            </small>
                                        </label>

                                        <select
                                            id="course-semester"
                                            value={
                                                semesterChoice
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSemesterChoice(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            {Array.from(
                                                {
                                                    length: 12,
                                                },
                                                (
                                                    _,
                                                    index
                                                ) =>
                                                    index +
                                                    1
                                            ).map(
                                                (
                                                    semester
                                                ) => (
                                                    <option
                                                        key={
                                                            semester
                                                        }
                                                        value={String(
                                                            semester
                                                        )}
                                                    >
                                                        Semester{" "}
                                                        {
                                                            semester
                                                        }
                                                    </option>
                                                )
                                            )}

                                            <option value="__full_year__">
                                                Full year
                                            </option>

                                            <option value="__none__">
                                                No specific
                                                semester
                                            </option>
                                        </select>
                                    </div>

                                    <p
                                        className={
                                            styles.periodHint
                                        }
                                    >
                                        Courses are
                                        organized by year
                                        and then by
                                        semester.
                                    </p>
                                </div>

                                <div
                                    className={
                                        styles.field
                                    }
                                >
                                    <label htmlFor="course-description">
                                        Description
                                        <small>
                                            Optional
                                        </small>
                                    </label>

                                    <textarea
                                        id="course-description"
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
                                        placeholder="What will you learn in this course?"
                                        maxLength={2000}
                                        rows={3}
                                    />
                                </div>

                                <fieldset
                                    className={
                                        styles.colorField
                                    }
                                >
                                    <legend>
                                        Course color
                                    </legend>

                                    <div
                                        className={
                                            styles.colorOptions
                                        }
                                    >
                                        {COURSE_COLORS.map(
                                            (
                                                option
                                            ) => (
                                                <button
                                                    key={
                                                        option
                                                    }
                                                    type="button"
                                                    className={`${styles.colorOption} ${
                                                        color ===
                                                        option
                                                            ? styles.selectedColor
                                                            : ""
                                                    }`}
                                                    style={{
                                                        backgroundColor:
                                                        option,
                                                    }}
                                                    onClick={() =>
                                                        setColor(
                                                            option
                                                        )
                                                    }
                                                    aria-label={`Select color ${option}`}
                                                    aria-pressed={
                                                        color ===
                                                        option
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </fieldset>

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
                                                course
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

export default function CoursesPage() {
    return (
        <ProtectedRoute>
            <CoursesContent/>
        </ProtectedRoute>
    );
}