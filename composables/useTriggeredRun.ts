import type { Ref } from 'vue'

// A clock that runs 0 to 1 over a fixed duration, started by something else
// deciding the moment has come — and wound back when that moment goes away.
//
// The third way of driving a graphic in this codebase, and the gap between the
// other two is exactly why it exists:
//
//   usePinnedProgress / usePinnedPhases  the reader scrubs it. Every frame is a
//                                        scroll position, so the piece can be
//                                        read forwards, backwards, or held still
//                                        halfway.
//   useTimedSequence                     the piece plays itself on arrival, and
//                                        is a TRANSPORT — it can be paused,
//                                        resumed and replayed by a control.
//   this                                 the piece plays at a moment the caller
//                                        names, and is re-armed by the caller
//                                        saying the moment has passed.
//
// The distinction that matters against `useTimedSequence` is not the clock, which
// is the same clock. It is where the trigger comes from. That composable fires on
// its own IntersectionObserver ("the copy is fully readable") and hands back
// controls, because a reader who scrolled past it deserves a way back in. Here the
// moment is a fact about the scroll the caller already measures — the pinned stage
// has come to rest — and the graphic it drives is decoration behind live copy with
// no control anywhere near it. An observer cannot express "the stage stopped
// moving", and a transport would be three affordances nobody can reach.
//
// `armed` going false is a RESET, not a pause: the run drops back to 0 and the
// next arming plays it from the top. That is what makes the piece repeatable
// without a control — the caller re-arms by scrolling away and back. Which of
// those two things "away" means is entirely the caller's business, and it had
// better carry some hysteresis: a boundary that arms and disarms across one pixel
// of scroll would restart the run at anyone who stops on it.

/**
 * @param armed      the moment, as a reactive fact. The clock starts each time
 *                   this becomes true and rewinds each time it becomes false —
 *                   including when it is already true at mount, which is what a
 *                   reload partway down the page looks like.
 * @param durationMs how long the run takes, wall time.
 */
export function useTriggeredRun(armed: Ref<boolean>, durationMs: number) {
    /** 0..1 through the run. */
    const progress = ref(0)
    const running = ref(false)

    let rafId = 0
    let lastTimestamp = 0
    let elapsed = 0
    /** Reduced motion: there is no run, only its end state — so there is also
     *  nothing to rewind, and a reset would be the one thing that mode must never
     *  do, which is take the graphic back to an unresolved frame. */
    let resolved = false

    function frame(now: number) {
        // Clamp the delta: a backgrounded tab hands back a multi-second gap on
        // return, which would skip the run rather than continue it.
        const delta = lastTimestamp ? Math.min(now - lastTimestamp, 64) : 0
        lastTimestamp = now
        elapsed = Math.min(durationMs, elapsed + delta)
        progress.value = elapsed / durationMs

        if (elapsed < durationMs) {
            rafId = requestAnimationFrame(frame)
        } else {
            rafId = 0
            running.value = false
        }
    }

    function stop() {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
        lastTimestamp = 0
        running.value = false
    }

    function start() {
        if (resolved || rafId) return
        // Resolved rather than skipped: the run's end state is the graphic's
        // normal appearance, and not playing it must not mean never reaching it.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            resolved = true
            elapsed = durationMs
            progress.value = 1
            return
        }
        running.value = true
        // From the top every time. Resuming a half-finished run would be the
        // wrong shape: the caller disarmed because the reader left, so what they
        // come back to should be the thing from its first frame.
        elapsed = 0
        progress.value = 0
        lastTimestamp = 0
        rafId = requestAnimationFrame(frame)
    }

    function reset() {
        if (resolved) return
        stop()
        elapsed = 0
        progress.value = 0
    }

    // Not `{ immediate: true }`: this runs during setup, which on Nuxt is also
    // the server, and `start` reads matchMedia. The mount hook covers the
    // already-armed case instead.
    watch(armed, (on) => (on ? start() : reset()))
    onMounted(() => {
        if (armed.value) start()
    })
    onBeforeUnmount(stop)

    return { progress, running }
}
