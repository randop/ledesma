const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets/*.js");
  eleventyConfig.addPassthroughCopy("assets/*.css");
  eleventyConfig.addPassthroughCopy("assets/*.jpg");
  eleventyConfig.addPassthroughCopy("assets/*.png");

  // Top 5 latest posts
  eleventyConfig.addCollection("latestPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("posts/*.md")
      .sort((a, b) => b.date - a.date)
      .slice(0, 5); // Only take the first 10 posts
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("posts/*.md")
      .sort((a, b) => a.date - b.date)
      .slice(0, 15); // Only take the first 10 posts
  });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts", // iterate over `collections.posts`
      limit: 15,
    },
    metadata: {
      language: "en",
      title: "Randolph Ledesma Blog",
      subtitle:
        "Discover expert insights, practical tips, and engaging stories on AI vibe coding, web development and programming.",
      base: "https://randop.github.io/",
      author: {
        name: "Randolph Ledesma",
      },
    },
  });

  // Add date filter for formatting
  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Add limit filter (if not using the latestPosts collection)
  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  // Add escape filter to handle HTML tags in titles
  eleventyConfig.addFilter("escape", function (text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  });

  // SEO-friendly permalink structure
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (data.page.inputPath.includes("/posts/")) {
        const date = new Date(data.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        // Extract title from filename or use the title from frontmatter
        let slug = data.title ? data.title.toLowerCase() : "";
        if (!slug && data.page.fileSlug) {
          // Remove date prefix from filename: "2024-01-15-first-post" -> "first-post"
          slug = data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
        }

        // Clean up slug: remove special characters, replace spaces with hyphens
        slug = slug
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        return `/${year}/${month}/${day}/${slug}/`;
      }
      return data.permalink;
    },
  });

  return {
    dir: {
      input: ".",
      output: "_site",
    },
  };
};
