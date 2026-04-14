import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getHue(): number {
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

// Background color mode: 'normal' or 'starry'
export function getBackgroundMode(): string {
	return localStorage.getItem("backgroundMode") || "normal";
}

export function setBackgroundMode(mode: string): void {
	localStorage.setItem("backgroundMode", mode);
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) return;

	if (mode === "starry") {
		r.classList.add("starry-dark");
	} else {
		r.classList.remove("starry-dark");
	}
}

export function applyBackgroundMode(mode: string): void {
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) return;

	if (mode === "starry") {
		r.classList.add("starry-dark");
	} else {
		r.classList.remove("starry-dark");
	}
}

// Font family options
export const FONT_OPTIONS = [
	"system",
	"lishu",
	"kaikai",
	"source-code",
	"merriweather",
];
export const FONT_NAMES: Record<string, string> = {
	system: "系统默认",
	lishu: "隶书",
	kaikai: "楷楷",
	"source-code": "源码",
	merriweather: "梅里",
};

export function getFontFamily(): string {
	return localStorage.getItem("fontFamily") || "sans";
}

export function setFontFamily(font: string): void {
	localStorage.setItem("fontFamily", font);
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) return;

	// Remove all font classes
	for (const f of FONT_OPTIONS) {
		r.classList.remove(`font-${f}`);
	}
	// Add the new font class
	r.classList.add(`font-${font}`);
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}
