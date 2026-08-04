import type { Ref } from 'vue'
import { norm } from '~/utils/keyframes'
import { SOLUTION_IN } from '~/composables/usePinnedProgress'

// The problem/solution piece on a CLOCK instead of on the scroll.
//
// Same two numbers `usePinnedProgress` produces — the cloud's collapse and a
// position on the star map's timeline — so `StarMap` and `ParticleCluster` cannot
// tell the difference and neither needed changing. Only the thing driving them
// does.
//
// This is what the stacked layout plays. The pinned version asks for nearly four
// viewports of scrolling and holds the reader in place for all of it, which is a
// fair trade on a desktop and a hostile one on a phone. Played once on arrival
// the piece makes the same argument — the scatter gathers into a single core — and
// costs the reader nothing: they scroll normally throughout, and if they scroll
// straight past they have lost a decoration rather than a section.
//
// It also sidesteps the reason a scroll-tied version is genuinely awkward on a
// phone rather than merely rude: mobile URL bars resize the viewport mid-scroll,
// and every measurement in the pinned path is denominated in viewport heights.
// Nothing here measures the viewport at all — except the trigger, and there only
// to decide whether the copy fits on screen, which a URL bar cannot change the
// answer to.
//
// It is a TRANSPORT, not just a one-shot: `toggle` pauses and resumes, and picking
// it up again from a finished sequence replays it from the top. That is what the
// playback control under the copy drives, and it is the reason the elapsed time is
// accumulated rather than measured from a start timestamp — a start time cannot
// survive being paused.

/** Beat lengths, ms. Roughly the proportions the pinned version spends on each
 *  act, compressed into something that holds attention without demanding it.
 *
 *  The lead is not just a pause before the visual: the problem copy is on stage
 *  through it and starts leaving at the collapse's midpoint, so this plus half
 *  the collapse is the whole time anyone has to read it. On the pinned layout
 *  that is the reader's own scrolling and can be as long as they like; here it is
 *  a fixed budget, and 900ms + 750ms is the floor for a two-line sentence
 *  (they will also have had it on screen for however long it took them to scroll
 *  the copy fully into view, which is what actually fires the trigger). Lengthen
 *  this before anything else if the handover feels rushed. */
const LEAD_MS = 900
const CONVERGE_MS = 1500
const GAP_MS = 150
const STARMAP_MS = 2600

/** When the star map's own timeline starts, and the length of the whole piece. */
const MAP_FROM = LEAD_MS + CONVERGE_MS + GAP_MS
const TOTAL_MS = MAP_FROM + STARMAP_MS

/** Where the star map stops.
 *
 *  NOT the end of its timeline. Past this it shrinks the rings and swaps the core
 *  for a small white badge to hand over to the line — and the line's whole job is
 *  to run to the foot of a section that is four viewports tall, which this layout
 *  has no equivalent of. Stopping mid-hold leaves the piece on its best frame
 *  (Figma "Reference 02": rings out, dark core, mark resolved, dots orbiting)
 *  instead of on a transition to something that never arrives.
 *
 *  Must stay inside the hold — `T_HOLD_2` in StarMap.vue — or the rings will be
 *  caught mid-shrink. */
const END_T = 0.34

/**
 * @param root    the element whose FULL arrival starts the clock. The copy, not
 *                the cluster: nothing moves until the reader can read the sentence
 *                the movement is illustrating, so the piece cannot play to someone
 *                who is looking at half a paragraph.
 * @param enabled false on the pinned layout, where scroll drives instead
 */
export function useTimedSequence(root: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
    const converge = ref(0)
    const starMapTime = ref(0)
    /** Accumulated position in the piece, ms. The single source of truth: both
     *  outputs and the progress ring are derived from it, so a pause cannot leave
     *  them disagreeing. */
    const elapsed = ref(0)
    const playing = ref(false)

    let io: IntersectionObserver | null = null
    let rafId = 0
    let lastTimestamp = 0
    /** Whether the arrival trigger has already fired. Separate from `elapsed`
     *  because a reader who pauses on the first frame has still had their one
     *  automatic play, and should not get another on the next scroll. */
    let triggered = false

    function apply(ms: number) {
        // Ease the collapse. On the pinned layout this value is linear in scroll,
        // which reads fine because the reader is setting the pace themselves; on a
        // clock a linear ramp starts and stops abruptly, so it gets a smoothstep.
        // `starMapTime` stays linear — the keyframe tables it feeds carry their own
        // easing per segment, and easing it here would double up.
        const c = norm(ms, LEAD_MS, LEAD_MS + CONVERGE_MS)
        converge.value = c * c * (3 - 2 * c)
        starMapTime.value = END_T * norm(ms, MAP_FROM, TOTAL_MS)
    }

    function frame(now: number) {
        // Advance on the real frame delta and clamp it: a backgrounded tab hands
        // back a multi-second gap on return, which would skip the whole piece.
        const delta = lastTimestamp ? Math.min(now - lastTimestamp, 64) : 0
        lastTimestamp = now
        elapsed.value = Math.min(TOTAL_MS, elapsed.value + delta)
        apply(elapsed.value)

        if (elapsed.value < TOTAL_MS) {
            rafId = requestAnimationFrame(frame)
        } else {
            // Rests here: nothing left to advance, and the control falls back to
            // offering a replay.
            rafId = 0
            playing.value = false
        }
    }

    function play() {
        if (!enabled.value || rafId) return
        // Finished, so this is a replay rather than a resume.
        if (elapsed.value >= TOTAL_MS) elapsed.value = 0
        playing.value = true
        lastTimestamp = 0
        rafId = requestAnimationFrame(frame)
    }

    function pause() {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
        lastTimestamp = 0
        playing.value = false
    }

    /** What the playback control calls. */
    function toggle() {
        if (playing.value) pause()
        else play()
    }

    function resolve() {
        // Straight to the end state, no clock.
        pause()
        elapsed.value = TOTAL_MS
        apply(TOTAL_MS)
        triggered = true
    }

    /** Stop watching. Separate from `teardown` on purpose: the observer's whole
     *  job is done the instant it fires, but the clock it just started has to
     *  keep running — folding the two together cancels the animation on its
     *  first frame. */
    function unwatch() {
        io?.disconnect()
        io = null
    }

    function teardown() {
        unwatch()
        pause()
    }

    /** Whether the trigger element is as visible as it is going to get.
     *
     *  "Completely visible" is the rule, but it cannot be `intersectionRatio >= 1`
     *  alone: a copy group taller than the viewport can never reach that, and on a
     *  short phone in landscape it is a real possibility, so the piece would
     *  simply never play. Measuring the visible HEIGHT against whichever is
     *  smaller — the element or the screen — asks the question the rule means. */
    function fullyVisible(entry: IntersectionObserverEntry) {
        const own = entry.boundingClientRect.height
        const room = window.innerHeight * 0.9
        // A pixel of slack: intersection rects are fractional and a "complete"
        // element routinely lands a hair short of its own height.
        return entry.intersectionRect.height + 1 >= Math.min(own, room)
    }

    function arm() {
        teardown()
        if (!enabled.value || !root.value) return
        if (triggered) return

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return resolve()

        io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!fullyVisible(entry)) continue
                    unwatch() // one shot; replays are the control's business
                    triggered = true
                    play()
                    return
                }
            },
            // Several steps rather than just 1: the tall-element case above never
            // produces a ratio of 1, so it needs callbacks on the way up.
            { threshold: [0.5, 0.75, 0.9, 1] }
        )
        io.observe(root.value)
    }

    // `enabled` resolves in the media query's own onMounted, which may land after
    // ours, and the breakpoint can be crossed by a rotation without a scroll. If
    // the piece has already played, crossing back leaves it where it was rather
    // than replaying it at the reader.
    watch(enabled, arm)
    onMounted(arm)
    onBeforeUnmount(teardown)

    /** 0..1 through the piece, for the playback control's ring. */
    const progress = computed(() => elapsed.value / TOTAL_MS)

    /** Which copy group owns the stage, on the same terms `usePinnedProgress`
     *  reports it: 0 the problem, -1 the gap where the visual is alone, 1 the
     *  solution.
     *
     *  Two differences from the scrolled version, both because this layout has no
     *  exit to play. There is no phase 2 — nothing releases, so the solution is
     *  where the piece rests rather than something that is cleared away. And the
     *  problem leaves on the collapse's own midpoint rather than on a scroll
     *  position, which is the same instant expressed against the only clock this
     *  path has.
     *
     *  Before the trigger fires everything is zero, so the reader waits on the
     *  problem copy — which is what should be on stage while nothing is moving. */
    const phase = computed(() => {
        if (converge.value < 0.5) return 0
        if (starMapTime.value >= SOLUTION_IN) return 1
        return -1
    })

    return { converge, starMapTime, phase, playing, progress, toggle }
}
