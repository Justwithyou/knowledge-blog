<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	FONT_NAMES,
	FONT_OPTIONS,
	getFontFamily,
	setFontFamily,
} from "@utils/setting-utils";

let currentFont = $state(getFontFamily());

function selectFont(font: string) {
	currentFont = font;
	setFontFamily(font);
	hidePanel();
}

function showPanel() {
	const panel = document.querySelector("#font-panel");
	panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = document.querySelector("#font-panel");
	panel?.classList.add("float-panel-closed");
}

function getFontFamilyForPreview(fontId: string): string {
	const fontMap: Record<string, string> = {
		system: "'Inter', 'Noto Sans SC', sans-serif",
		lishu: "'LiSu', 'STLiti', 'FangSong', serif",
		kaikai: "'KaiTi', 'STKaiti', '楷体', serif",
		"source-code": "'Source Code Pro', 'JetBrains Mono', monospace",
		merriweather: "'Merriweather', 'Noto Serif SC', Georgia, serif",
	};
	return fontMap[fontId] || fontMap.system;
}
</script>

<div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hidePanel}>
    <button
        aria-label="Font Settings"
        role="menuitem"
        class="relative btn-regular scale-animation rounded-lg h-11 w-11 active:scale-90"
        id="font-switch"
        onclick={showPanel}
    >
        <Icon icon="material-symbols:text-fields-outline-rounded" class="text-[1.25rem]"></Icon>
    </button>

    <div id="font-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
        <div class="card-base float-panel p-2">
            {#each FONT_OPTIONS as font}
                <button
                    class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                    class:current-font-btn={currentFont === font}
                    onclick={() => selectFont(font)}
                    style="font-family: {getFontFamilyForPreview(font)}"
                >
                    <Icon
                        icon="material-symbols:check-rounded"
                        class="text-[1.25rem] mr-3 {!Object.is(font, currentFont) ? 'opacity-0' : ''}"
                    ></Icon>
                    {FONT_NAMES[font]}
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    .current-font-btn {
        background: var(--btn-plain-bg-hover);
    }
</style>