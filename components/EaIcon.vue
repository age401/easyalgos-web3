<script setup lang="ts">
// The Expert Advisors pages' icon set, inlined.
//
// Every path is the exported Figma geometry (the `icn24-*` components and the
// "Logo EasyAlgos" mark), kept on its drawn grid and stroke width. They are
// inline rather than <img src> for one reason: these icons change colour with
// their control - the view switch's active thumb, a button's hover - and an
// image cannot take `currentColor`. The AlgoScore mark is the exception: its
// three arcs are fixed brand violets, so it keeps its own fills.
//
// The box comes from the call site (`class="size-4"`); the viewBox is the grid
// the icon was drawn on, so a 20-grid icon shown at 16px scales as designed.
type IconName =
    | 'search'
    | 'help'
    | 'layoutCards'
    | 'layoutCompact'
    | 'chevronRight'
    | 'chevronLeft'
    | 'chevronDown'
    | 'cloudDownload'
    | 'telegram'
    | 'globe'
    | 'close'
    | 'arrowRight'
    | 'algoscore'

interface Props {
    name: IconName
}
defineProps<Props>()

interface StrokeIcon {
    grid: number
    width: number
    paths: string[]
}

const STROKE_ICONS: Record<Exclude<IconName, 'algoscore'>, StrokeIcon> = {
    search: {
        grid: 16,
        width: 1.33333,
        paths: [
            'M14 14L11.1333 11.1333M2 7.33333C2 8.74782 2.5619 10.1044 3.5621 11.1046C4.56229 12.1048 5.91885 12.6667 7.33333 12.6667C8.74782 12.6667 10.1044 12.1048 11.1046 11.1046C12.1048 10.1044 12.6667 8.74782 12.6667 7.33333C12.6667 5.91885 12.1048 4.56229 11.1046 3.5621C10.1044 2.5619 8.74782 2 7.33333 2C5.91885 2 4.56229 2.5619 3.5621 3.5621C2.5619 4.56229 2 5.91885 2 7.33333Z'
        ]
    },
    help: {
        grid: 16,
        width: 1.6,
        paths: [
            'M1.33333 8C1.33333 9.76811 2.03571 11.4638 3.28595 12.714C4.5362 13.9643 6.23189 14.6667 8 14.6667C9.76811 14.6667 11.4638 13.9643 12.714 12.714C13.9643 11.4638 14.6667 9.76811 14.6667 8C14.6667 6.23189 13.9643 4.5362 12.714 3.28595C11.4638 2.03571 9.76811 1.33333 8 1.33333C6.23189 1.33333 4.5362 2.03571 3.28595 3.28595C2.03571 4.5362 1.33333 6.23189 1.33333 8Z',
            'M6.06 6C6.21674 5.55445 6.5261 5.17874 6.9333 4.93942C7.3405 4.70011 7.81926 4.61263 8.28478 4.69247C8.7503 4.77232 9.17254 5.01435 9.47672 5.37569C9.78089 5.73702 9.94737 6.19435 9.94667 6.66667C9.94667 8 7.94667 8.66667 7.94667 8.66667',
            'M8 11.3333H8.00667'
        ]
    },
    layoutCards: {
        grid: 24,
        width: 2,
        paths: ['M2 8H22M6 16H18M4 4H20C20 4 22 4 22 6V18C22 18 22 20 20 20H4C4 20 2 20 2 18V6C2 6 2 4 4 4Z']
    },
    layoutCompact: {
        grid: 24,
        width: 2,
        paths: [
            'M4 3H9C9 3 10 3 10 4V9C10 9 10 10 9 10H4C4 10 3 10 3 9V4C3 4 3 3 4 3ZM15 3H20C20 3 21 3 21 4V9C21 9 21 10 20 10H15C15 10 14 10 14 9V4C14 4 14 3 15 3ZM15 14H20C20 14 21 14 21 15V20C21 20 21 21 20 21H15C15 21 14 21 14 20V15C14 15 14 14 15 14ZM4 14H9C9 14 10 14 10 15V20C10 20 10 21 9 21H4C4 21 3 21 3 20V15C3 15 3 14 4 14Z'
        ]
    },
    chevronRight: { grid: 16, width: 1.33333, paths: ['M6 12L10 8L6 4'] },
    chevronLeft: { grid: 16, width: 1.33333, paths: ['M10 12L6 8L10 4'] },
    chevronDown: { grid: 16, width: 1.33333, paths: ['M4 6L8 10L12 6'] },
    cloudDownload: {
        grid: 20,
        width: 1.66667,
        paths: [
            'M3.33333 12.4158C2.7142 11.7833 2.24714 11.0181 1.96753 10.1783C1.68792 9.33847 1.60309 8.44604 1.71947 7.56858C1.83585 6.69113 2.15038 5.85167 2.63925 5.11378C3.12811 4.37589 3.77849 3.75893 4.54111 3.30963C5.30373 2.86032 6.15861 2.59046 7.04097 2.52048C7.92334 2.4505 8.81006 2.58224 9.63397 2.90572C10.4579 3.22919 11.1974 3.73593 11.7964 4.38753C12.3955 5.03914 12.8384 5.81853 13.0917 6.66667H14.5833C15.3879 6.66658 16.1712 6.92527 16.8175 7.40453C17.4638 7.8838 17.9388 8.55822 18.1723 9.32817C18.4059 10.0981 18.3856 10.9228 18.1144 11.6803C17.8433 12.4378 17.3357 13.0881 16.6667 13.535M10 10V17.5M13.3333 14.1667L10 17.5L6.66667 14.1667'
        ]
    },
    telegram: {
        grid: 20,
        width: 1.66667,
        paths: ['M12.5 8.33333L9.16667 11.6667L14.1667 16.6667L17.5 3.33333L2.5 9.16667L5.83333 10.8333L7.5 15.8333L10 12.5']
    },
    globe: {
        grid: 20,
        width: 1.66667,
        paths: [
            'M1.66667 10C1.66667 12.2101 2.54464 14.3298 4.10744 15.8926C5.67025 17.4554 7.78986 18.3333 10 18.3333M1.66667 10C1.66667 7.78986 2.54464 5.67025 4.10744 4.10744C5.67025 2.54464 7.78986 1.66667 10 1.66667M1.66667 10H18.3333M10 18.3333C12.2101 18.3333 14.3298 17.4554 15.8926 15.8926C17.4554 14.3298 18.3333 12.2101 18.3333 10M10 18.3333C7.8602 16.0865 6.66667 13.1027 6.66667 10C6.66667 6.89728 7.8602 3.91346 10 1.66667M10 18.3333C12.1398 16.0865 13.3333 13.1027 13.3333 10C13.3333 6.89728 12.1398 3.91346 10 1.66667M18.3333 10C18.3333 7.78986 17.4554 5.67025 15.8926 4.10744C14.3298 2.54464 12.2101 1.66667 10 1.66667'
        ]
    },
    close: { grid: 16, width: 1.5, paths: ['M4 4L12 12M12 4L4 12'] },
    // The pill button's arrow (Figma "Button", node 458:1314), for the text links.
    arrowRight: { grid: 16, width: 1.5, paths: ['M3 8H12M8.5 4.5L12.5 8L8.5 11.5'] }
}
</script>

<template>
    <!-- "Logo EasyAlgos": the three nested arcs, on their drawn 20px grid. -->
    <svg v-if="name === 'algoscore'" viewBox="0 0 20 20" fill="none" aria-hidden="true" class="shrink-0">
        <path
            d="M10 14C8.94 14 7.92 13.58 7.18 12.82C6.78 12.42 6.78 11.8 7.18 11.4C7.58 11 8.2 11 8.6 11.4C9.36 12.16 10.68 12.16 11.42 11.4C11.8 11.02 12 10.52 12 9.97998C12 9.43998 11.8 8.93998 11.42 8.55998C11.02 8.17998 11.02 7.53998 11.42 7.13998C11.82 6.73998 12.44 6.73998 12.84 7.13998C13.6 7.89998 14.02 8.89998 14.02 9.95998C14.02 11.02 13.6 12.04 12.84 12.78C12.08 13.54 11.08 13.96 10.02 13.96L10 14Z"
            fill="#5959FF"
        />
        <path
            d="M10 17C6.14 17 3 13.86 3 10C3 9.44002 3.44 9.00002 4 9.00002C4.56 9.00002 5 9.44002 5 10C5 12.76 7.24 15 10 15C12.76 15 15 12.76 15 10C15 9.44002 15.44 9.00002 16 9.00002C16.56 9.00002 17 9.44002 17 10C17 13.86 13.86 17 10 17Z"
            fill="#7272FF"
        />
        <path
            d="M10 20C4.48 20 0 15.52 0 10C0 7.34001 1.04 4.82001 2.92 2.92001C3.32 2.52001 3.94 2.52001 4.34 2.92001C4.74 3.30001 4.74 3.94001 4.34 4.34001C2.82 5.86001 2 7.86001 2 10C2 14.42 5.58 18 10 18C12.14 18 14.14 17.16 15.66 15.66C16.06 15.26 16.68 15.26 17.08 15.66C17.48 16.06 17.48 16.68 17.08 17.08C15.2 18.96 12.68 20 10 20Z"
            fill="#A299FF"
        />
    </svg>

    <svg
        v-else
        :viewBox.attr="`0 0 ${STROKE_ICONS[name].grid} ${STROKE_ICONS[name].grid}`"
        fill="none"
        aria-hidden="true"
        class="shrink-0"
    >
        <path
            v-for="path in STROKE_ICONS[name].paths"
            :key="path"
            :d="path"
            stroke="currentColor"
            :stroke-width="STROKE_ICONS[name].width"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
