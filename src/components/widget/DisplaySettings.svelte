<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	FONT_NAMES,
	FONT_OPTIONS,
	getBackgroundMode,
	getFontFamily,
	setBackgroundMode,
	setFontFamily,
} from "@utils/setting-utils";

let bgMode = getBackgroundMode();
let currentFont = getFontFamily();

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
      /* Styles for future use */
</style>
