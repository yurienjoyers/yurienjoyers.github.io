import { getCollection } from "astro:content";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SECTION_ORDER = ["thoughts", "rambles"];
const POSTS_DIR = join(process.cwd(), "src", "content", "posts");

function formatLabel(value) {
  return value.replace(/[-_]+/g, " ").trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePostId(id) {
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Post entry is missing id.");
  }

  const parts = id.split("/").filter(Boolean);

  if (parts.length !== 3) {
    throw new Error(
      `Post entries must live at src/content/posts/<author>/<section>/<entry>.md. Received id: ${id}`,
    );
  }

  const [author, section, entryName] = parts;
  return { author, section, entryName };
}

function normalizeDateString(dateValue) {
  if (typeof dateValue === "string") {
    return dateValue;
  }

  const year = String(dateValue.getUTCFullYear());
  const month = String(dateValue.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateString(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new Error(`Invalid post date: ${dateString}`);
  }

  const [, year, month, day] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

function formatDate(dateString) {
  const { year, month, day } = parseDateString(dateString);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getDateSortKey(dateString) {
  const { year, month, day } = parseDateString(dateString);
  return Date.UTC(year, month - 1, day);
}

function getBodyLineCount(body) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function createSnippet(body) {
  return body.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
}

function getSectionOrder(sectionSlug) {
  const index = SECTION_ORDER.indexOf(sectionSlug);
  return index === -1 ? SECTION_ORDER.length : index;
}

function sortPosts(left, right) {
  return (
    right.dateSortKey - left.dateSortKey ||
    left.title.localeCompare(right.title)
  );
}

function buildPostRecord(entry) {
  const { author, section, entryName } = parsePostId(entry.id);
  const authorSlug = slugify(author);
  const sectionSlug = slugify(section);
  const date = normalizeDateString(entry.data.date);

  return {
    entry,
    title: entry.data.title,
    date,
    dateLabel: formatDate(date),
    dateSortKey: getDateSortKey(date),
    snippet: createSnippet(entry.body),
    bodyLineCount: getBodyLineCount(entry.body),
    authorSlug,
    authorLabel: formatLabel(author),
    sectionSlug,
    sectionLabel: formatLabel(section),
    pageHref: `/${authorSlug}/${sectionSlug}/`,
    flatSlug: [author, section, entryName].map(slugify).join("-"),
  };
}

function discoverGroups() {
  if (!existsSync(POSTS_DIR)) {
    return [];
  }

  const groups = [];

  for (const authorEntry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (!authorEntry.isDirectory()) {
      continue;
    }

    const authorSlug = slugify(authorEntry.name);
    const authorDir = join(POSTS_DIR, authorEntry.name);
    const sections = [];

    for (const sectionEntry of readdirSync(authorDir, {
      withFileTypes: true,
    })) {
      if (!sectionEntry.isDirectory()) {
        continue;
      }

      const sectionSlug = slugify(sectionEntry.name);
      sections.push({
        sectionSlug,
        sectionLabel: formatLabel(sectionEntry.name),
        pageHref: `/${authorSlug}/${sectionSlug}/`,
      });
    }

    sections.sort((left, right) => {
      return (
        getSectionOrder(left.sectionSlug) -
          getSectionOrder(right.sectionSlug) ||
        left.sectionLabel.localeCompare(right.sectionLabel)
      );
    });

    groups.push({
      groupSlug: authorSlug,
      groupLabel: formatLabel(authorEntry.name),
      sections,
    });
  }

  groups.sort((left, right) => left.groupLabel.localeCompare(right.groupLabel));
  return groups;
}

export async function getPosts() {
  let entries = [];

  try {
    entries = await getCollection("posts");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      !message.includes('The collection "posts" does not exist or is empty.')
    ) {
      throw error;
    }
  }

  const posts = entries.map(buildPostRecord);

  posts.sort((left, right) => {
    return (
      left.authorLabel.localeCompare(right.authorLabel) ||
      getSectionOrder(left.sectionSlug) - getSectionOrder(right.sectionSlug) ||
      sortPosts(left, right)
    );
  });

  return posts;
}

export function getGroups() {
  return discoverGroups();
}

export function getPages(posts) {
  const groups = discoverGroups();
  const pages = [];

  for (const group of groups) {
    for (const section of group.sections) {
      const sectionPosts = posts
        .filter(
          (post) =>
            post.authorSlug === group.groupSlug &&
            post.sectionSlug === section.sectionSlug,
        )
        .sort(sortPosts);

      pages.push({
        authorSlug: group.groupSlug,
        authorLabel: group.groupLabel,
        sectionSlug: section.sectionSlug,
        sectionLabel: section.sectionLabel,
        pageHref: section.pageHref,
        posts: sectionPosts,
      });
    }
  }

  return pages;
}

export function findPage(pages, author, section) {
  return pages.find(
    (page) => page.authorSlug === author && page.sectionSlug === section,
  );
}
