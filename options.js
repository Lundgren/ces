const DEFAULT_PREFERENCES = {
  commentsReadOnPageLoad: true,
  hideFirstVisit: true,
  highlightParagraphs: true,
  highlightAdmin: true,
  favoriteMe: true,
  autoHideByDefault: false,
  jumpToFirstUnread: false,
  rewriteTwitterLinks: false,
  rewriteTwitterDomain: "nitter.net",
  colorParagraphs: "#84dc23",
  colorComments: "#dc2328",
  colorFavorites: "#23dcd7",
  colorNavigation: "#7b23dc",
  favoriteWords: [],
  favoriteAuthors: [],
  hiddenAuthors: [],
};
function saveOptions() {
  const prefs = {
    commentsReadOnPageLoad: document.getElementById("comments_read_on_page_load").checked,
    hideFirstVisit: document.getElementById("hide_first_visit").checked,
    highlightParagraphs: document.getElementById("highlight_paragraphs").checked,
    highlightAdmin: document.getElementById("highlight_admin").checked,
    favoriteMe: document.getElementById("favorite_me").checked,
    autoHideByDefault: document.getElementById("auto_hide_default").checked,
    jumpToFirstUnread: document.getElementById("jump_first_unread").checked,
    rewriteTwitterLinks: document.getElementById("rewrite_twitter_links").checked,
    rewriteTwitterDomain: document.getElementById("rewrite_twitter_domain").value || "nitter.net",
    colorParagraphs: document.getElementById("color_paragraphs").value,
    colorComments: document.getElementById("color_comments").value,
    colorFavorites: document.getElementById("color_favorites").value,
    colorNavigation: document.getElementById("color_navigation").value,
    favoriteWords: document.getElementById("favorite_words").value.split("\n"),
    favoriteAuthors: document.getElementById("favorite_authors").value.split("\n"),
    hiddenAuthors: document.getElementById("hidden_authors").value.split("\n"),
  };

  if (!CSS.supports("color", prefs.colorParagraphs)) {
    prefs.colorParagraphs = defaultPreferences.colorParagraphs;
    document.getElementById("color_paragraphs").value = prefs.colorParagraphs;
  }
  if (!CSS.supports("color", prefs.colorComments)) {
    prefs.colorComments = defaultPreferences.colorComments;
    document.getElementById("color_comments").value = prefs.colorComments;
  }
  if (!CSS.supports("color", prefs.colorFavorites)) {
    prefs.colorFavorites = defaultPreferences.colorFavorites;
    document.getElementById("color_favorites").value = prefs.colorFavorites;
  }
  if (!CSS.supports("color", prefs.colorNavigation)) {
    prefs.colorNavigation = defaultPreferences.colorNavigation;
    document.getElementById("color_navigation").value = prefs.colorNavigation;
  }

  prefs.favoriteWords = prefs.favoriteWords
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);
  prefs.favoriteAuthors = prefs.favoriteAuthors
    .map((author) => author.trim().toLowerCase())
    .filter((author) => author.length > 0);
  prefs.hiddenAuthors = prefs.hiddenAuthors
    .map((author) => author.trim().toLowerCase())
    .filter((author) => author.length > 0);

  updateUI(prefs);
  writePreferences(prefs).then(() => {
    document.getElementById("status_saved").style.display = "inline";

    setTimeout(function () {
      document.getElementById("status_saved").style.display = "none";
    }, 2000);
  });

  window.close();
}

function updateUI(prefs) {
  document.getElementById("comments_read_on_page_load").checked = prefs.commentsReadOnPageLoad;
  document.getElementById("hide_first_visit").checked = prefs.hideFirstVisit;
  document.getElementById("highlight_paragraphs").checked = prefs.highlightParagraphs;
  document.getElementById("highlight_admin").checked = prefs.highlightAdmin;
  document.getElementById("favorite_me").checked = prefs.favoriteMe;
  document.getElementById("auto_hide_default").checked = prefs.autoHideByDefault;
  document.getElementById("jump_first_unread").checked = prefs.jumpToFirstUnread;
  document.getElementById("rewrite_twitter_links").checked = prefs.rewriteTwitterLinks;
  document.getElementById("rewrite_twitter_domain").value = prefs.rewriteTwitterDomain || "";
  document.getElementById("color_paragraphs").value = prefs.colorParagraphs;
  document.getElementById("color_comments").value = prefs.colorComments;
  document.getElementById("color_favorites").value = prefs.colorFavorites;
  document.getElementById("color_navigation").value = prefs.colorNavigation;
  document.getElementById("favorite_words").value = prefs.favoriteWords?.join("\n") || "";
  document.getElementById("favorite_authors").value = prefs.favoriteAuthors.join("\n");
  document.getElementById("hidden_authors").value = prefs.hiddenAuthors.join("\n");
}

function restoreOptions() {
  getPreference().then((prefs) => {
    updateUI(prefs);
  });
}

async function getPreference() {
  // Firefox
  if (typeof browser !== "undefined") {
    return (await browser.storage.local.get("preferences"))["preferences"] || DEFAULT_PREFERENCES;
  }

  // Chromium based browsers
  if (typeof chrome !== "undefined") {
    return (await chrome.storage.local.get("preferences"))["preferences"] || DEFAULT_PREFERENCES;
  }

  throw new Error("No storage available");
}

async function writePreferences(value) {
  // Firefox
  if (typeof browser !== "undefined") {
    return await browser.storage.local.set({ ["preferences"]: value });
  }

  // Chromium based browsers
  if (typeof chrome !== "undefined") {
    return await chrome.storage.local.set({ ["preferences"]: value });
  }

  throw new Error("No storage available");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
