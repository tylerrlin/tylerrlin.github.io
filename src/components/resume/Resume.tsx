import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { resume, stations } from "../../resume";
import { layoutStops } from "../../walk/path";
import {
    currentBird,
    dom,
    exitResume,
    getMode,
    goToSection,
    goToStop,
    leap,
    nudge,
    setStops,
    settleAhead,
    startDrive,
    stopDrive,
    step,
    subscribeMode,
    walk,
} from "../../walk/state";

// The resume walk's DOM: the snowfield beneath everything, the resume itself
// (real, structured text that the scene positions along the path every frame)
// and the controls. Layout and input live here; motion lives in the scene.

const useResumeMode = () =>
    useSyncExternalStore(subscribeMode, getMode) === "resume";

/** Snow under the walk: a flat field revealed as the sky tilts away, plus the marks. */
export function ResumeGround() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-ice">
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 60% at 50% 45%, #f6f4ef 0%, rgba(246,244,239,0) 70%)",
                }}
            />
            <canvas
                ref={(el) => void (dom.ground = el)}
                className="absolute inset-0 size-full"
            />
        </div>
    );
}

/** A small faceted diamond, the bullet mark (it echoes the markers in the snow). */
function Facet({ className = "" }: { className?: string }) {
    return (
        <svg aria-hidden viewBox="0 0 10 10" className={className}>
            <polygon points="5,0 10,5 5,5" fill="#ee962a" />
            <polygon points="5,0 5,5 0,5" fill="#f3ad55" />
            <polygon points="0,5 5,5 5,10" fill="#d27a14" />
            <polygon points="5,5 10,5 5,10" fill="#b8650d" />
        </svg>
    );
}

export function ResumeText() {
    const active = useResumeMode();
    const layer = useRef<HTMLDivElement>(null);

    // Measure every block and lay the stops out to fit them. Text reflows with
    // the viewport and when the web fonts arrive, so watch the blocks' sizes.
    useLayoutEffect(() => {
        const relayout = () => {
            const bird = currentBird();
            dom.blocks.forEach((el, i) => {
                if (el)
                    walk.sizes[i] = { w: el.offsetWidth, h: el.offsetHeight };
            });
            setStops(
                layoutStops(
                    walk.sizes.map((s) => s.h),
                    bird,
                ),
            );
        };
        let raf = 0;
        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(relayout);
        };
        const ro = new ResizeObserver(schedule);
        dom.blocks.forEach((el) => el && ro.observe(el));
        window.addEventListener("resize", schedule);
        relayout();
        document.fonts?.ready.then(schedule);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener("resize", schedule);
        };
    }, []);

    let n = 0;
    const block = () => {
        const i = n++;
        return (el: HTMLElement | null) => void (dom.blocks[i] = el);
    };

    return (
        <div
            ref={(el) => {
                layer.current = el;
                dom.textLayer = el;
            }}
            id="resume"
            role="region"
            aria-label="Resume"
            inert={!active}
            data-mode={active ? "resume" : undefined}
            className="resume-layer pointer-events-none fixed inset-0 overflow-hidden text-navy"
        >
            {resume.map((section) => (
                <section
                    key={section.id}
                    aria-labelledby={`resume-${section.id}`}
                >
                    <h2
                        ref={block()}
                        id={`resume-${section.id}`}
                        className="rw-block rw-section"
                    >
                        <span>{section.title}</span>
                    </h2>
                    {section.entries.map((entry) => (
                        <article key={entry.org}>
                            <header ref={block()} className="rw-block rw-entry">
                                <h3 className="font-display text-[1.65rem] leading-[1.08] tracking-[-0.01em] wide-walk:text-[1.9rem]">
                                    {entry.org}
                                </h3>
                                {entry.role && (
                                    <p className="mt-1.5 text-[15px] font-medium leading-snug text-navy-soft">
                                        {entry.role}
                                    </p>
                                )}
                                {entry.dates && (
                                    <p className="mt-2 font-mono text-[11px] tracking-[0.16em] text-ember uppercase">
                                        <time>{entry.dates}</time>
                                    </p>
                                )}
                            </header>
                            <ul>
                                {entry.bullets.map((b) => (
                                    <li
                                        key={b}
                                        ref={block()}
                                        className="rw-block rw-line"
                                    >
                                        <Facet className="rw-mark" />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </section>
            ))}
        </div>
    );
}

const WHEEL_SETTLE_MS = 160;
/** How long an arrow must be held before the penguin starts cruising. */
const HOLD_MS = 240;

/** Keep Tab cycling through the walk's controls; the home page is inert behind them. */
function trapTab(e: KeyboardEvent) {
    const items = dom.hud
        ? [...dom.hud.querySelectorAll<HTMLElement>("button")]
        : [];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const at = document.activeElement;
    if (e.shiftKey ? at === first || !dom.hud?.contains(at) : at === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
    }
}

export function ResumeHud() {
    const active = useResumeMode();
    const homeButton = useRef<HTMLButtonElement>(null);
    const [hinted, setHinted] = useState(false);
    const wasActive = useRef(false);

    // Focus: to Home on the way in, back to the Resume link on the way out.
    useEffect(() => {
        if (active) {
            homeButton.current?.focus({ preventScroll: true });
            setHinted(false);
        } else if (wasActive.current) {
            document
                .querySelector<HTMLElement>("[data-resume-link]")
                ?.focus({ preventScroll: true });
        }
        wasActive.current = active;
    }, [active]);

    // Input: wheel and trackpad, touch drags, keys. All of it moves a target
    // along the path; the scene walks the penguin there.
    useEffect(() => {
        if (!active) return;
        const bird = () => currentBird();
        const retire = () => setHinted(true);

        let wheelDir = 0; // direction of the current wheel gesture
        let wheelTimer = 0;
        let holdTimer = 0; // a held arrow turns into cruising after HOLD_MS
        let heldKey = "";
        // Until the scene is running, the resume is a plain scrolling column.
        const live = () => dom.textLayer?.hasAttribute("data-live") ?? false;

        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || !live()) return; // pinch zoom, or the plain column
            e.preventDefault();
            const unit =
                e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? bird().vh : 1;
            const dy =
                Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (dy) wheelDir = Math.sign(dy);
            nudge((dy * unit) / bird().alongPx);
            clearTimeout(wheelTimer);
            wheelTimer = window.setTimeout(() => {
                settleAhead(wheelDir);
                wheelDir = 0;
            }, WHEEL_SETTLE_MS);
            retire();
        };

        let touch: { y: number; dir: number; t: number; vy: number } | null =
            null;
        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1 || !live()) return (touch = null);
            touch = { y: e.touches[0].clientY, dir: 0, t: e.timeStamp, vy: 0 };
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!touch) return;
            e.preventDefault();
            const y = e.touches[0].clientY;
            const dy = touch.y - y;
            const dt = Math.max(1, e.timeStamp - touch.t);
            touch.vy = 0.8 * touch.vy + 0.2 * (dy / dt); // px per ms, smoothed
            touch.y = y;
            touch.t = e.timeStamp;
            if (dy) touch.dir = Math.sign(dy);
            nudge(dy / bird().alongPx);
            retire();
        };
        const onTouchEnd = () => {
            if (!touch) return;
            // A flick carries on a little before settling.
            nudge((touch.vy * 180) / bird().alongPx);
            settleAhead(touch.dir);
            touch = null;
        };

        const onKey = (e: KeyboardEvent) => {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            if (e.key === "Tab") return trapTab(e);
            if (e.key === "Escape") {
                e.preventDefault();
                return exitResume();
            }
            if (!live()) return;
            const onButton = (e.target as HTMLElement)?.closest?.("button, a");
            let handled = true;
            switch (e.key) {
                case "ArrowDown":
                case "ArrowRight":
                case "ArrowUp":
                case "ArrowLeft": {
                    // A tap steps one stop; holding cruises at a steady pace (auto-repeat is ignored).
                    if (e.repeat) break;
                    const dir =
                        e.key === "ArrowDown" || e.key === "ArrowRight"
                            ? 1
                            : -1;
                    stopDrive();
                    clearTimeout(holdTimer);
                    heldKey = e.key;
                    step(dir);
                    holdTimer = window.setTimeout(
                        () => heldKey === e.key && startDrive(dir),
                        HOLD_MS,
                    );
                    break;
                }
                case "PageDown":
                    leap(1);
                    break;
                case "PageUp":
                    leap(-1);
                    break;
                case " ":
                    if (onButton) return;
                    step(e.shiftKey ? -1 : 1);
                    break;
                case "Home":
                    goToStop(0);
                    break;
                case "End":
                    goToStop(stations.length - 1);
                    break;
                default:
                    handled = false;
            }
            if (handled) {
                e.preventDefault();
                retire();
            }
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);
        window.addEventListener("touchcancel", onTouchEnd);
        const release = () => {
            clearTimeout(holdTimer);
            heldKey = "";
            stopDrive();
        };
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === heldKey) release();
        };

        window.addEventListener("keydown", onKey);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", release);
        return () => {
            release();
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", release);
            clearTimeout(wheelTimer);
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
            window.removeEventListener("keydown", onKey);
        };
    }, [active]);

    return (
        <div
            ref={(el) => void (dom.hud = el)}
            inert={!active}
            data-active={active || undefined}
            className="resume-hud pointer-events-none fixed inset-0 z-10 opacity-0 transition-opacity duration-500 data-active:opacity-100 data-active:delay-700"
        >
            {/* Top: a soft snow fade so text slides under the controls. */}
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-ice from-40% via-ice/85 to-transparent"
            />
            <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-ice from-25% via-ice/80 to-transparent"
            />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 pt-4 wide-walk:px-8 wide-walk:pt-7">
                <button
                    ref={homeButton}
                    type="button"
                    onClick={exitResume}
                    className="group pointer-events-auto block focus-visible:outline-offset-2"
                >
                    <span className="chamfer flex h-11 items-center gap-2.5 bg-navy pr-4 pl-3.5 text-[15px] font-medium tracking-[0.01em] text-snow transition-colors duration-300 group-hover:bg-navy-soft">
                        <svg
                            aria-hidden
                            viewBox="0 0 12 12"
                            className="size-3 transition-transform duration-300 ease-out-soft group-hover:-translate-x-0.5"
                        >
                            <polygon
                                points="5,1 0.6,6 5,6"
                                fill="var(--color-orange)"
                            />
                            <polygon points="0.6,6 5,11 5,6" fill="#d27a14" />
                            <polygon
                                points="3,5 11.4,5 11.4,7 3,7"
                                fill="var(--color-snow)"
                            />
                        </svg>
                        Home
                    </span>
                </button>

                <nav
                    ref={(el) => void (dom.nav = el)}
                    aria-label="Resume sections"
                    className="pointer-events-auto pt-1"
                >
                    <ul className="flex items-center gap-0.5 wide-walk:gap-2">
                        {resume.map((s, i) => (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    data-section={i}
                                    onClick={() => {
                                        if (
                                            dom.textLayer?.hasAttribute(
                                                "data-live",
                                            )
                                        )
                                            goToSection(i);
                                        else
                                            document
                                                .getElementById(
                                                    `resume-${s.id}`,
                                                )
                                                ?.scrollIntoView({
                                                    block: "start",
                                                });
                                        setHinted(true);
                                    }}
                                    className="rw-nav px-1.5 py-2 font-mono text-[10px] tracking-[0.14em] uppercase min-[25rem]:text-[11px] wide-walk:px-2.5"
                                >
                                    {s.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div
                        aria-hidden
                        className="mx-1.5 h-px bg-navy/15 wide-walk:mx-2.5"
                    >
                        <div
                            ref={(el) => void (dom.progress = el)}
                            className="h-px origin-left scale-x-0 bg-orange"
                        />
                    </div>
                </nav>
            </div>

            <p
                data-hidden={hinted || undefined}
                className="absolute inset-x-0 bottom-5 flex justify-center transition-opacity duration-500 data-hidden:opacity-0"
            >
                <span className="rounded-full bg-snow/95 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.16em] text-navy-soft uppercase shadow-[0_0_14px_6px_var(--color-snow)]">
                    <span className="coarse:hidden">
                        Scroll or use ↑ ↓ to walk · Esc for home
                    </span>
                    <span className="hidden coarse:inline">
                        Swipe up to walk
                    </span>
                </span>
            </p>
        </div>
    );
}
