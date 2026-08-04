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
// Nothing here measures the viewport at all.

/** How much of the cluster has to be showing before the piece starts. High
 *  enough that it is not playing off-screen, low enough that the reader is not
 *  already past it. */
const TRIGGER_RATIO = 0.55

/** Beat lengths, ms. Roughly the proportions the pinned version spends on each
 *  act, compressed into something that holds attention without demanding it.
 *
 *  The lead is not just a pause before the visual: the problem copy is on stage
 *  through it and starts leaving at the collapse's midpoint, so this plus half
 *  the collapse is the whole time anyone has to read it. On the pinned layout
 *  that is the reader's own scrolling and can be as long as they like; here it is
 *  a fixed budget, and 900ms + 750ms is the floor for a two-line sentence
 *  (they will also have had it on screen for however long it took them to scroll
 *  the cluster into view, which is what actually fires the trigger). Lengthen
 *  this before anything else if the handover feels rushed. */
const LEAD_MS = 900
const CONVERGE_MS = 1500
const GAP_MS = 150
const STARMAP_MS = 2600

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
 * @param root    the element whose arrival starts the clock — the cluster, not
 *                the section, so the trigger tracks the thing being animated
 * @param enabled false on the pinned layout, where scroll drives instead
 */
export function useTimedSequence(root: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
    const converge = ref(0)
    const starMapTime = ref(0)

    let io: IntersectionObserver | null = null
    let rafId = 0
    let startedAt = 0
    let played = false

    function frame(now: number) {
        if (!startedAt) startedAt = now
        const elapsed = now - startedAt

        // Ease the collapse. On the pinned layout this value is linear in scroll,
        // which reads fine because the reader is setting the pace themselves; on a
        // clock a linear ramp starts and stops abruptly, so it gets a smoothstep.
        // `starMapTime` stays linear — the keyframe tables it feeds carry their own
        // easing per segment, and easing it here would double up.
        const c = norm(elapsed, LEAD_MS, LEAD_MS + CONVERGE_MS)
        converge.value = c * c * (3 - 2 * c)

        const mapFrom = LEAD_MS + CONVERGE_MS + GAP_MS
        starMapTime.value = END_T * norm(elapsed, mapFrom, mapFrom + STARMAP_MS)

        if (elapsed < mapFrom + STARMAP_MS) rafId = requestAnimationFrame(frame)
        else rafId = 0 // one shot: nothing left to advance, so stop asking for frames
    }

    function play() {
        if (played || rafId) return
        played = true
        startedAt = 0
        rafId = requestAnimationFrame(frame)
    }

    function resolve() {
        // Straight to the end state, no clock.
        converge.value = 1
        starMapTime.value = END_T
        played = true
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
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
    }

    function arm() {
        teardown()
        if (!enabled.value || !root.value) return
        if (played) return resolve()

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return resolve()

        io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.intersectionRatio < TRIGGER_RATIO) continue
                    unwatch() // one shot
                    play()
                    return
                }
            },
            { threshold: TRIGGER_RATIO }
        )
        io.observe(root.value)
    }

    // `enabled` resolves in the media query's own onMounted, which may land after
    // ours, and the breakpoint can be crossed by a rotation without a scroll. If
    // the piece has already played, crossing back just restores the end state
    // rather than replaying it at the reader.
    watch(enabled, arm)
    onMounted(arm)
    onBeforeUnmount(teardown)

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

    return { converge, starMapTime, phase }
}
