const DEFAULT_PREFERENCES = {
  hideFirstVisit: true,
  highlightParagraphs: true,
  favoriteMe: true,
  colorParagraphs: "#84dc23",
  colorComments: "#dc2328",
  colorFavorites: "#23dcd7",
  colorNavigation: "#7b23dc",
  favoriteAuthors: [],
  hiddenAuthors: [],
};

function saveOptions() {
  const prefs = {
    hideFirstVisit: document.getElementById("hide_first_visit").checked,
    highlightParagraphs: document.getElementById("highlight_paragraphs").checked,
    favoriteMe: document.getElementById("favorite_me").checked,
    colorParagraphs: document.getElementById("color_paragraphs").value,
    colorComments: document.getElementById("color_comments").value,
    colorFavorites: document.getElementById("color_favorites").value,
    colorNavigation: document.getElementById("color_navigation").value,
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

  prefs.favoriteAuthors = prefs.favoriteAuthors.map((author) => author.trim().toLowerCase());
  prefs.hiddenAuthors = prefs.hiddenAuthors.map((author) => author.trim().toLowerCase());

  writePreferences(prefs).then(() => {
    document.getElementById("status_saved").style.display = "inline";

    setTimeout(function () {
      document.getElementById("status_saved").style.display = "none";
    }, 2000);
  });
}

function restoreOptions() {
  getPreference().then((prefs) => {
    document.getElementById("hide_first_visit").checked = prefs.hideFirstVisit;
    document.getElementById("highlight_paragraphs").checked = prefs.highlightParagraphs;
    document.getElementById("favorite_me").checked = prefs.favoriteMe;
    document.getElementById("color_paragraphs").value = prefs.colorParagraphs;
    document.getElementById("color_comments").value = prefs.colorComments;
    document.getElementById("color_favorites").value = prefs.colorFavorites;
    document.getElementById("color_navigation").value = prefs.colorNavigation;
    document.getElementById("favorite_authors").value = prefs.favoriteAuthors.join("\n");
    document.getElementById("hidden_authors").value = prefs.hiddenAuthors.join("\n");
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
