// ==UserScript==
// @name         Cornucopia Enhancement Suite
// @namespace    github.com/lundgren
// @version      0.1
// @description  Variuos enhancements to Cornucopia.se
// @author       You
// @match        https://cornucopia.se/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cornucopia.se
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

const HIDE_COMMENTS_ICN = `<img style="width: 16px; height: 16px; padding-right: 8px;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMjMzLjQgMTA1LjRjMTIuNS0xMi41IDMyLjgtMTIuNSA0NS4zIDBsMTkyIDE5MmMxMi41IDEyLjUgMTIuNSAzMi44IDAgNDUuM3MtMzIuOCAxMi41LTQ1LjMgMEwyNTYgMTczLjMgODYuNiAzNDIuNmMtMTIuNSAxMi41LTMyLjggMTIuNS00NS4zIDBzLTEyLjUtMzIuOCAwLTQ1LjNsMTkyLTE5MnoiLz48L3N2Zz4=" />`;

const PARAGRAPH_COLOR = "#32cd32";
const COMMENT_COLOR = "#ff5757";
const AUTHOR_COLOR = "#a9a9a9";
const NAVIGATE_COLOR = "#9b9cff";

(async () => {
  // Fetch info about previous visits
  const pageId = window.location.pathname;
  const state = await readStorage(pageId, { readBefore: false });

  // Highlight all new paragraphs and comments
  const toggleComment = (commentId, visible) => {
    state[commentId] = visible;
    writeStorage(pageId, state);
  };

  const comments = enhanceComments(state, toggleComment);
  const paragraphs = enhanceContent(state);

  // Add hotkeys to navigate between paragraphs and comments
  const unseen = [...paragraphs, ...comments];
  enableHotkeyNavigationFor(unseen.filter((c) => c.type !== "author"));

  // Draw the minimap to the right of the page
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const redrawMinimap = () => drawMinimap(canvas, unseen);
  new ResizeObserver(redrawMinimap).observe(document.body);
  addEventListener("resize", redrawMinimap);

  // Save the info about this visit
  state.lastReadTs = Date.now();
  state.readBefore = true;
  writeStorage(pageId, state);
})();

async function readStorage(key, defaultVal) {
  // Firefox
  if (typeof browser !== "undefined") {
    return (await browser.storage.local.get(key))[key] || defaultVal;
  }

  // Chromium based browsers
  if (typeof chrome !== "undefined") {
    return (await chrome.storage.local.get(key))[key] || defaultVal;
  }

  // Userscripts
  if (typeof GM !== "undefined") {
    return await GM.getValue(key, defaultVal);
  }

  throw new Error("No storage available");
}

async function writeStorage(key, value) {
  // Firefox
  if (typeof browser !== "undefined") {
    return await browser.storage.local.set({ [key]: value });
  }

  // Chromium based browsers
  if (typeof chrome !== "undefined") {
    return await chrome.storage.local.set({ [key]: value });
  }

  // Userscripts
  if (typeof GM !== "undefined") {
    return await GM.setValue(key, value);
  }

  throw new Error("No storage available");
}

// enhanceComments will
//    - highlight all unseen comments
//    - highlight all comments by the author
//    - make comments hideable by clicking on the author's name
//    - return a list of all highlighted comments so they can be added to the minimap
function enhanceComments(state, toggleComment) {
  const highlighted = [];

  const comments = document.getElementsByClassName("comment-text");
  for (let $comment of comments) {
    const $container = $comment.parentElement.parentElement;

    let isUnread = false;
    if (!($container.id in state)) {
      isUnread = true;
      state[$container.id] = true;
    }

    // Make the thread hideable
    makeThreadHideable($container, $comment, state[$container.id], toggleComment);

    // Highlight unread comments
    if (isUnread && state.readBefore) {
      highlighted.push({ type: "comment", $el: $comment });
      $comment.style.borderLeft = `3px solid ${COMMENT_COLOR}`;
      $comment.style.paddingLeft = "6px";
      $comment.style.transition = "color 500ms";
    }

    const isAuthor = $container.classList.contains("bypostauthor");
    if (isAuthor) {
      highlighted.push({ type: "author", $el: $comment });
    }
  }

  return highlighted;
}

// enhanceContent will
//    - highlight all unseen & changed paragraphs
function enhanceContent(state) {
  const highlighted = [];

  const $post = document.getElementById("penci-post-entry-inner");
  for (let $paragraph of $post.children) {
    const hash = hashCode($paragraph.outerHTML);
    const seenBefore = hash in state;
    state[hash] = true;

    // If the user has read the article before, but never read this paragraph, highlight it
    // Ignore iframes, as they are often used for ads
    if (state.readBefore && !seenBefore && !$paragraph.outerHTML.includes("iframe")) {
      const $wrapper = document.createElement("div");
      $wrapper.style = `margin-left: -4px; padding-left: 4px; border-left: 3px solid ${PARAGRAPH_COLOR}`;
      $paragraph.replaceWith($wrapper);
      $wrapper.append($paragraph);

      highlighted.push({ type: "paragraph", $el: $wrapper });
    }
  }

  return highlighted;
}

// enableHotkeyNavigationFor will
//    - allow the user to navigate new comments and paragraphs using the J and K keys
//    - allow the user to navigate to the first new comment or paragraph using the I key
//    - allow the user to minimize navigated comments by pressing the M key
function enableHotkeyNavigationFor(entries) {
  let navigatedEntry;
  let styleBefore;
  addEventListener("scroll", (e) => {
    if (navigatedEntry) {
      navigatedEntry.$el.style.borderLeft = styleBefore;
      navigatedEntry = null;
    }
  });

  // Scroll to center of element or top of element if it's too tall
  // Also highlight the element for a short time
  const scrollTo = (entry) => {
    const rect = entry.$el.getBoundingClientRect();

    if (rect.height > window.innerHeight) {
      window.scrollTo(0, rect.top + window.scrollY - 50);
    } else {
      entry.$el.scrollIntoView({ block: "center" });
    }

    setTimeout(() => {
      navigatedEntry = entry;
      styleBefore = entry.$el.style.borderLeft;
      entry.$el.style.borderLeft = `3px solid ${NAVIGATE_COLOR}`;
    }, 50);
  };

  addEventListener("keydown", (e) => {
    const focused = document.activeElement && document.activeElement.nodeName;
    if (focused === "INPUT" || focused === "TEXTAREA") {
      return;
    }
    const center = window.innerHeight / 2;

    if (e.code === "KeyJ") {
      for (let i = 0; i < entries.length; i++) {
        const rect = entries[i].$el.getBoundingClientRect();
        const isMinimized = rect.height === 0;
        const isBelowCenter = rect.top + rect.height / 2 - 50 > center;
        const isAlreadyNavigated = entries[i] === navigatedEntry;

        if (isBelowCenter && !isMinimized && !isAlreadyNavigated) {
          scrollTo(entries[i]);
          return;
        }
      }
    } else if (e.code === "KeyK") {
      for (let i = entries.length - 1; i >= 0; i--) {
        const rect = entries[i].$el.getBoundingClientRect();
        const isMinimized = rect.height === 0;
        const isAboveCenter = rect.top + rect.height / 2 + 50 < center;
        const isAlreadyNavigated = entries[i] === navigatedEntry;

        if (isAboveCenter && !isMinimized && !isAlreadyNavigated) {
          scrollTo(entries[i]);
          return;
        }
      }
    } else if (e.code === "KeyI") {
      if (entries.length > 0) {
        scrollTo(entries[0]);
      }
    } else if (e.code === "KeyM") {
      if (navigatedEntry && navigatedEntry.type !== "paragraph") {
        navigatedEntry.$el.hideMe();
      }
    }
  });
}

// drawMinimap will
//      - draw a minimap on the right side of the screen
function drawMinimap(minimap, entries) {
  const scrollOffset = window.innerWidth - document.documentElement.clientWidth;
  minimap.style = `position:fixed; left: ${
    document.body.clientWidth - 5
  }px; top: ${scrollOffset}px; width: 5px; height: ${window.innerHeight - scrollOffset * 2}px;`;
  minimap.width = 5;
  minimap.height = window.innerHeight;

  const q = window.innerHeight / document.documentElement.scrollHeight;

  var ctx = minimap.getContext("2d");
  ctx.clearRect(0, 0, minimap.width, minimap.height);

  for (const { type, $el } of entries) {
    const rect = $el.getBoundingClientRect();
    ctx.fillStyle =
      type === "author" ? AUTHOR_COLOR : type === "comment" ? COMMENT_COLOR : PARAGRAPH_COLOR;
    ctx.fillRect(0, (window.scrollY + rect.top) * q, 5, rect.height * q);
  }
}

function makeThreadHideable($container, $comment, visible, toggleComment) {
  const $hiddenContainer = createHiddenThreadContainer($container, $comment);
  $container.parentNode.insertBefore($hiddenContainer, $container);

  const hideComments = (e) => {
    e?.preventDefault();
    $container.style.display = "none";
    $hiddenContainer.style.display = "";
    toggleComment($container.id, false);
  };
  const showComments = (e) => {
    e?.preventDefault();
    $container.style.display = "";
    $hiddenContainer.style.display = "none";
    toggleComment($container.id, true);
  };

  if (visible) {
    $hiddenContainer.style.display = "none";
  } else {
    $container.style.display = "none";
  }

  // Find author element and hide comments when it's clicked
  const $author = $comment.getElementsByClassName("author")[0];
  $author.title = "Hide comments";
  $author.style.cursor = "pointer";
  $author.prepend(strToElement(HIDE_COMMENTS_ICN));
  $author.addEventListener("click", hideComments);
  $comment.hideMe = hideComments;

  // Show comments again when hidden container is clicked
  $hiddenContainer.addEventListener("click", showComments);
}

function createHiddenThreadContainer($container, $comment) {
  const $hiddenContainer = document.createElement("div");
  const $text = document.createElement("p");
  $hiddenContainer.appendChild($text);

  const $authorContent = $comment.getElementsByClassName("author")[0];
  const $commentContent = $comment.getElementsByClassName("comment-content")[0];
  const commentCount = $container.getElementsByClassName("comment-text").length;

  const summary = getSummary($authorContent, $commentContent);
  $text.innerText = `Hiding ${commentCount} comment(s) - ${summary}`;

  $hiddenContainer.className = $container.className;
  $hiddenContainer.title = "Show comments";
  $hiddenContainer.style.cursor = "pointer";
  $hiddenContainer.style.height = "30px";
  $hiddenContainer.style.borderTop = "1px solid #dedede";
  if ($container.className.includes("depth-1")) {
    $hiddenContainer.style.backgroundColor = "#fff9ec";
  }

  return $hiddenContainer;
}

function getSummary($author, $comment) {
  const author = $author.innerText || $author.textContent || "";
  const comment = $comment.innerText || $comment.textContent || "";
  return `${author}: ${comment}`.replace(/(\r\n|\n|\r)/gm, " ").substring(0, 75) + "...";
}

function strToElement(str) {
  const temp = document.createElement("div");
  temp.innerHTML = str;
  return temp.firstChild;
}

// https://stackoverflow.com/a/52171480
function hashCode(str) {
  let h1 = 0xdeadbeef ^ 0,
    h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
