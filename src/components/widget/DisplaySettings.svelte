<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";
import { getBackgroundMode, setBackgroundMode } from "@utils/setting-utils";
import { FONT_OPTIONS, FONT_NAMES, getFontFamily, setFontFamily } from "@utils/setting-utils";

let hue = getHue();
const defaultHue = getDefaultHue();
let bgMode = getBackgroundMode();
let currentFont = getFontFamily();

function resetHue() {
	hue = getDefaultHue();
}

$: if (hue || hue === 0) {
	setHue(hue);
}

function toggleBackground() {
	bgMode = bgMode === "normal" ? "starry" : "normal";
	setBackgroundMode(bgMode);
}

function selectFont(font: string) {
	currentFont = font;
	setFontFamily(font);
}
</script>

<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4">
    <!-- Theme Color Section -->
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90 will-change-transform"
                    class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} on:click={resetHue}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="hueValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {hue}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none mb-4">
        <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
               class="slider" id="colorSlider" step="5" style="width: 100%">
    </div>

    <!-- Background Color Section -->
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.backgroundColor)}
        </div>
    </div>
    <div class="flex gap-2 mb-4">
        <button 
            class="flex-1 h-10 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                {bgMode === 'normal' ? 'border-[var(--primary)] bg-[var(--btn-regular-bg)]' : 'border-neutral-300 dark:border-neutral-600 bg-[var(--card-bg)]'}"
            on:click={() => { bgMode = 'normal'; setBackgroundMode('normal'); }}
        >
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-lg"></Icon>
            <span class="text-sm font-medium">明亮</span>
        </button>
        <button 
            class="flex-1 h-10 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                {bgMode === 'starry' ? 'border-[var(--primary)] bg-[var(--btn-regular-bg)]' : 'border-neutral-300 dark:border-neutral-600 bg-[var(--card-bg)]'}"
            on:click={() => { bgMode = 'starry'; setBackgroundMode('starry'); }}
        >
            <Icon icon="material-symbols:night-sight-rounded" class="text-lg"></Icon>
            <span class="text-sm font-medium">星空黑</span>
        </button>
    </div>

    <!-- Font Family Section -->
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.fontFamily)}
        </div>
    </div>
    <div class="grid grid-cols-1 gap-2">
        {#each FONT_OPTIONS as font}
            <button 
                class="h-10 rounded-lg border-2 transition-all flex items-center justify-center
                    {currentFont === font ? 'border-[var(--primary)] bg-[var(--btn-regular-bg)]' : 'border-neutral-300 dark:border-neutral-600 bg-[var(--card-bg)]'}"
                on:click={() => selectFont(font)}
            >
                <span class="text-sm font-medium">{FONT_NAMES[font]}</span>
            </button>
        {/each}
    </div>
</div>


<style lang="stylus">
    #display-setting
      input[type="range"]
        -webkit-appearance none
        height 1.5rem
        background-image var(--color-selection-bar)
        transition background-image 0.15s ease-in-out

        /* Input Thumb */
        &::-webkit-slider-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-moz-range-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          border-width 0
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-ms-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

</style>
