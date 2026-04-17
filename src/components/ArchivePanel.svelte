<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category: string | null;
		published: Date;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

let groups: Group[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

onMount(async () => {
	let filteredPosts: Post[] = sortedPosts;

	if (tags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => tags.includes(tag)),
		);
	}

	if (categories.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) => post.data.category && categories.includes(post.data.category),
		);
	}

	if (uncategorized) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	}

	const grouped = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);

	groups = groupedPostsArray;
});
</script>

<div class="archive-container">
	{#each groups as group}
		<div class="archive-year-group">
			<!-- Year Header -->
			<div class="archive-year-header">
				<span class="archive-year">{group.year}</span>
				<span class="archive-count">{group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}</span>
			</div>

			<!-- Timeline -->
			<div class="archive-timeline">
				{#each group.posts as post}
					<a
						href={getPostUrlBySlug(post.slug)}
						aria-label={post.data.title}
						class="archive-item"
					>
						<div class="archive-dot"></div>
						<div class="archive-content">
							<div class="archive-date">{formatDate(post.data.published)}</div>
							<div class="archive-title">{post.data.title}</div>
							{#if post.data.tags.length > 0}
								<div class="archive-tags">{formatTag(post.data.tags)}</div>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.archive-container {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.archive-year-group {
		display: flex;
		flex-direction: column;
	}

	.archive-year-header {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border-color);
	}

	.archive-year {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-color);
		font-family: var(--font-mono);
	}

	.archive-count {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.archive-timeline {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-left: 0.5rem;
	}

	.archive-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		position: relative;
	}

	.archive-item:hover {
		background: var(--btn-regular-bg);
	}

	.archive-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--primary);
		margin-top: 0.5rem;
		flex-shrink: 0;
		transition: all 0.2s ease;
	}

	.archive-item:hover .archive-dot {
		transform: scale(1.5);
		box-shadow: 0 0 10px var(--primary);
	}

	.archive-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
		flex: 1;
	}

	.archive-date {
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.archive-title {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-color);
		transition: color 0.2s ease;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.archive-item:hover .archive-title {
		color: var(--primary);
	}

	.archive-tags {
		font-size: 0.75rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
		opacity: 0.7;
	}

	@media (max-width: 640px) {
		.archive-year {
			font-size: 1.5rem;
		}

		.archive-tags {
			display: none;
		}
	}
</style>
