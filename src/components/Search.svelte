<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let searchContainer: HTMLElement;
let searchInputDesktop: HTMLInputElement;
let searchInputMobile: HTMLInputElement;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	const mobilePanel = document.getElementById("search-panel-mobile");
	panel?.classList.toggle("float-panel-closed");
	mobilePanel?.classList.toggle("float-panel-closed");
};

const closePanel = () => {
	const panel = document.getElementById("search-panel");
	const mobilePanel = document.getElementById("search-panel-mobile");
	panel?.classList.add("float-panel-closed");
	mobilePanel?.classList.add("float-panel-closed");
	keywordDesktop = "";
	keywordMobile = "";
	result = [];
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		console.log("Pagefind status on init:", pagefindLoaded);
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", () => {
			console.log("Pagefind ready event received.");
			initializeSearch();
		});
		document.addEventListener("pagefindloaderror", () => {
			console.warn(
				"Pagefind load error event received. Search functionality will be limited.",
			);
			initializeSearch(); // Initialize with pagefindLoaded as false
		});

		// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
		setTimeout(() => {
			if (!initialized) {
				console.log("Fallback: Initializing search after timeout.");
				initializeSearch();
			}
		}, 2000); // Adjust timeout as needed
	}

	// Cmd/Ctrl + K keyboard shortcut
	const handleKeyboardShortcut = (e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			const desktopInput = document.querySelector("#search-bar input") as HTMLInputElement;
			if (desktopInput) {
				desktopInput.focus();
			} else {
				togglePanel();
			}
		}
	};

	document.addEventListener("keydown", handleKeyboardShortcut);
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(keywordDesktop, true);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(keywordMobile, false);
	})();
}
</script>

<!-- Desktop search container -->
<div bind:this={searchContainer} class="relative hidden lg:block">
	<!-- search bar for desktop view -->
	<div id="search-bar" class="flex transition-all items-center h-11 mr-2 rounded-lg
		  bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
		  dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
	">
		<Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
		<input placeholder="{i18n(I18nKey.search)}" bind:value={keywordDesktop} bind:this={searchInputDesktop}
			   on:focus={() => {
				   if (result.length > 0) setPanelVisibility(true, true);
			   }}
			   class="transition-all pl-10 text-sm bg-transparent outline-0
			 h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
		>
		<span class="absolute right-3 text-xs text-black/20 dark:text-white/20 hidden sm:block">⌘K</span>
	</div>

	<!-- search panel for desktop - positioned below search bar -->
	<div id="search-panel" class="float-panel float-panel-closed search-panel absolute top-full mt-2 left-0 w-[22rem] shadow-2xl rounded-xl p-2 z-50">
		<!-- search results -->
		{#each result as item}
			<a href={item.url} on:click={closePanel}
			   class="transition first-of-type:mt-2 group block rounded-lg text-base px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
				<div class="transition text-90 inline-flex font-medium group-hover:text-[var(--primary)]">
					{item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
				</div>
				<div class="transition text-sm text-50 mt-0.5">
					{@html item.excerpt}
				</div>
			</a>
		{/each}
	</div>
</div>

<!-- Mobile search toggle button -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
		class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
	<Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- Mobile search panel -->
<div id="search-panel-mobile" class="float-panel float-panel-closed search-panel-mobile absolute w-[calc(100vw-2rem)] md:w-[20rem] lg:w-[22rem]
	top-20 left-2 md:left-[unset] right-2 shadow-2xl rounded-xl p-2 z-50 lg:hidden">

	<!-- search bar inside panel for phone/tablet -->
	<div id="search-bar-inside" class="flex relative transition-all items-center h-11 rounded-xl
	  bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
	  dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
	">
		<Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
		<input placeholder="Search" bind:value={keywordMobile}
			   class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
			   focus:w-60 text-black/50 dark:text-white/50"
		>
	</div>

	<!-- search results for mobile -->
	{#each result as item}
		<a href={item.url} on:click={closePanel}
		   class="transition first-of-type:mt-2 group block rounded-lg text-base px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
			<div class="transition text-90 inline-flex font-medium group-hover:text-[var(--primary)]">
				{item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
			</div>
			<div class="transition text-sm text-50 mt-0.5">
				{@html item.excerpt}
			</div>
		</a>
	{/each}
</div>

<style>
	input:focus {
		outline: 0;
	}
	.search-panel {
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}
	.search-panel-mobile {
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}

	/* Elegant search result highlight */
	:global(.search-panel mark),
	:global(.search-panel-mobile mark) {
		background: transparent !important;
		color: #3b82f6 !important;
		font-weight: 600;
		padding: 0;
		border-radius: 0;
		box-shadow: none;
	}
</style>
