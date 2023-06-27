// ==UserScript==
// @name         Cornucopia Enhancement Suite
// @namespace    github.com/lundgren
// @version      0.0.8
// @description  Variuos enhancements to Cornucopia.se
// @author       You
// @match        https://cornucopia.se/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cornucopia.se
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

const DEFAULT_PREFERENCES = {
  hideFirstVisit: true,
  highlightParagraphs: true,
  highlightAdmin: true,
  favoriteMe: true,
  autoHideByDefault: false,
  jumpToFirstUnread: false,
  colorParagraphs: "#84dc23",
  colorComments: "#dc2328",
  colorFavorites: "#23dcd7",
  colorNavigation: "#7b23dc",
  favoriteWords: [],
  favoriteAuthors: [],
  hiddenAuthors: [],
};

const SETTINGS_ICN_BASE64 = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIyMHB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyMCAyMCIgd2lkdGg9IjIwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48dGl0bGUvPjxkZXNjLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgZmlsbD0iIzAwMDAwMCIgaWQ9IkNvcmUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00NjQuMDAwMDAwLCAtMzgwLjAwMDAwMCkiPjxnIGlkPSJzZXR0aW5ncyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDY0LjAwMDAwMCwgMzgwLjAwMDAwMCkiPjxwYXRoIGQ9Ik0xNy40LDExIEMxNy40LDEwLjcgMTcuNSwxMC40IDE3LjUsMTAgQzE3LjUsOS42IDE3LjUsOS4zIDE3LjQsOSBMMTkuNSw3LjMgQzE5LjcsNy4xIDE5LjcsNi45IDE5LjYsNi43IEwxNy42LDMuMiBDMTcuNSwzLjEgMTcuMywzIDE3LDMuMSBMMTQuNSw0LjEgQzE0LDMuNyAxMy40LDMuNCAxMi44LDMuMSBMMTIuNCwwLjUgQzEyLjUsMC4yIDEyLjIsMCAxMiwwIEw4LDAgQzcuOCwwIDcuNSwwLjIgNy41LDAuNCBMNy4xLDMuMSBDNi41LDMuMyA2LDMuNyA1LjQsNC4xIEwzLDMuMSBDMi43LDMgMi41LDMuMSAyLjMsMy4zIEwwLjMsNi44IEMwLjIsNi45IDAuMyw3LjIgMC41LDcuNCBMMi42LDkgQzIuNiw5LjMgMi41LDkuNiAyLjUsMTAgQzIuNSwxMC40IDIuNSwxMC43IDIuNiwxMSBMMC41LDEyLjcgQzAuMywxMi45IDAuMywxMy4xIDAuNCwxMy4zIEwyLjQsMTYuOCBDMi41LDE2LjkgMi43LDE3IDMsMTYuOSBMNS41LDE1LjkgQzYsMTYuMyA2LjYsMTYuNiA3LjIsMTYuOSBMNy42LDE5LjUgQzcuNiwxOS43IDcuOCwxOS45IDguMSwxOS45IEwxMi4xLDE5LjkgQzEyLjMsMTkuOSAxMi42LDE5LjcgMTIuNiwxOS41IEwxMywxNi45IEMxMy42LDE2LjYgMTQuMiwxNi4zIDE0LjcsMTUuOSBMMTcuMiwxNi45IEMxNy40LDE3IDE3LjcsMTYuOSAxNy44LDE2LjcgTDE5LjgsMTMuMiBDMTkuOSwxMyAxOS45LDEyLjcgMTkuNywxMi42IEwxNy40LDExIEwxNy40LDExIFogTTEwLDEzLjUgQzguMSwxMy41IDYuNSwxMS45IDYuNSwxMCBDNi41LDguMSA4LjEsNi41IDEwLDYuNSBDMTEuOSw2LjUgMTMuNSw4LjEgMTMuNSwxMCBDMTMuNSwxMS45IDExLjksMTMuNSAxMCwxMy41IEwxMCwxMy41IFoiIGlkPSJTaGFwZSIvPjwvZz48L2c+PC9nPjwvc3ZnPg==`;
const HIDE_COMMENTS_ICN_BASE64 = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMjMzLjQgMTA1LjRjMTIuNS0xMi41IDMyLjgtMTIuNSA0NS4zIDBsMTkyIDE5MmMxMi41IDEyLjUgMTIuNSAzMi44IDAgNDUuM3MtMzIuOCAxMi41LTQ1LjMgMEwyNTYgMTczLjMgODYuNiAzNDIuNmMtMTIuNSAxMi41LTMyLjggMTIuNS00NS4zIDBzLTEyLjUtMzIuOCAwLTQ1LjNsMTkyLTE5MnoiLz48L3N2Zz4=`;
const FAVORITE_COMMENTS_ICN = `<img style="width: 16px; height: 16px; margin-right: 8px;" />`;
const EMPTY_STAR_ICN_BASE64 =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9Ikljb25zIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMyMzIzMjM7fTwvc3R5bGU+PC9kZWZzPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIzLjA1MywxMi42ODNhMy4xMzIsMy4xMzIsMCwwLDAtMS43MzctNS4zNDFsLTMuOTA5LS41NjhhMS4xMywxLjEzLDAsMCwxLS44NTEtLjYxOUwxNC44MDgsMi42MTRhMy4xMzEsMy4xMzEsMCwwLDAtNS42MTYsMEw3LjQ0NCw2LjE1NWExLjEzLDEuMTMsMCwwLDEtLjg1MS42MTlsLTMuOTA5LjU2OEEzLjEzMiwzLjEzMiwwLDAsMCwuOTQ3LDEyLjY4NEwzLjc3NiwxNS40NGExLjEzMSwxLjEzMSwwLDAsMSwuMzI2LDFsLS42NjcsMy44OTJhMy4xMzEsMy4xMzEsMCwwLDAsNC41NDIsMy4zbDMuNS0xLjgzOGExLjEyNSwxLjEyNSwwLDAsMSwxLjA1MiwwaDBsMy41LDEuODM4YTMuMTEsMy4xMSwwLDAsMCwzLjMtLjIzOSwzLjEwOSwzLjEwOSwwLDAsMCwxLjI0NS0zLjA2M0wxOS45LDE2LjQ0MWExLjEzLDEuMTMsMCwwLDEsLjMyNi0xWm0tNC4yMjYsMS4zMjVhMy4xMzEsMy4xMzEsMCwwLDAtLjksMi43NzJsLjY2NywzLjg5MmExLjEzMSwxLjEzMSwwLDAsMS0xLjY0MiwxLjE5M2wtMy41LTEuODM4YTMuMTM0LDMuMTM0LDAsMCwwLTIuOTE0LDBsLTMuNSwxLjgzOGExLjEzMSwxLjEzMSwwLDAsMS0xLjY0Mi0xLjE5M2wuNjY3LTMuODkxYTMuMTMyLDMuMTMyLDAsMCwwLS45LTIuNzczTDIuMzQ0LDExLjI1MWExLjEzMiwxLjEzMiwwLDAsMSwuNjI3LTEuOTNMNi44OCw4Ljc1M0EzLjEyOCwzLjEyOCwwLDAsMCw5LjIzNyw3LjA0TDEwLjk4NSwzLjVhMS4xNjUsMS4xNjUsMCwwLDEsMi4wMywwTDE0Ljc2Myw3LjA0QTMuMTI4LDMuMTI4LDAsMCwwLDE3LjEyLDguNzUzbDMuOTA5LjU2OGExLjEzMiwxLjEzMiwwLDAsMSwuNjI3LDEuOTNaIi8+PC9zdmc+";
const FILLED_STAR_ICN_BASE64 =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9Ikljb25zIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCk7fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0ibGluZWFyLWdyYWRpZW50IiB4MT0iMTIiIHgyPSIxMiIgeTE9IjEuNzU1IiB5Mj0iMjMuMDc2Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmY2NTAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmFiMTciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xMi45OTIsMjAuOTEybDMuNSwxLjgzOEEyLjEzMSwyLjEzMSwwLDAsMCwxOS41OCwyMC41bC0uNjY3LTMuODkzYTIuMTI5LDIuMTI5LDAsMCwxLC42MTMtMS44ODdsMi44MjgtMi43NTdhMi4xMzEsMi4xMzEsMCwwLDAtMS4xODEtMy42MzVsLTMuOTA5LS41NjhhMi4xMzMsMi4xMzMsMCwwLDEtMS42LTEuMTY2TDEzLjkxMSwzLjA1NmEyLjEzMSwyLjEzMSwwLDAsMC0zLjgyMiwwTDguMzQxLDYuNmEyLjEzMywyLjEzMywwLDAsMS0xLjYsMS4xNjZsLTMuOTA5LjU2OGEyLjEzMSwyLjEzMSwwLDAsMC0xLjE4MSwzLjYzNWwyLjgyOCwyLjc1N2EyLjEyOSwyLjEyOSwwLDAsMSwuNjEzLDEuODg3TDQuNDIsMjAuNUEyLjEzMSwyLjEzMSwwLDAsMCw3LjUxMiwyMi43NWwzLjUtMS44MzhBMi4xMzUsMi4xMzUsMCwwLDEsMTIuOTkyLDIwLjkxMloiLz48L3N2Zz4=";

const ADMIN_COLOR = "#d3d3d3";

let settingsIcnSrc;
let hideCommentsIcnSrc;
let emptyStarIcnSrc;
let filledStarIcnSrc;

const StateFlags = {
  Read: 1 << 0,
  Hidden: 1 << 1,
  Favorite: 1 << 2,
};

(async () => {
  const pageId = window.location.pathname;
  if (pageId === "/") {
    // We only enhance the article page for now
    return;
  }
  settingsIcnSrc = await loadImage(SETTINGS_ICN_BASE64);
  hideCommentsIcnSrc = await loadImage(HIDE_COMMENTS_ICN_BASE64);
  emptyStarIcnSrc = await loadImage(EMPTY_STAR_ICN_BASE64);
  filledStarIcnSrc = await loadImage(FILLED_STAR_ICN_BASE64);

  // Fetch info about previous visits
  const pageState = await readStorage(pageId, { readBefore: false });
  const preferences = { ...DEFAULT_PREFERENCES, ...(await readStorage("preferences", {})) };
  const articleReadBefore = pageState.readBefore;

  // Setup a state object to simplify working with flags
  const state = {
    isUnread: (id) => pageState[id] === undefined,
    isHidden: (id) => pageState[id] & StateFlags.Hidden,
    isFavorite: (id) => pageState[id] & StateFlags.Favorite,
    setAsRead: (id) => (pageState[id] |= StateFlags.Read),
    setHidden: (id, hidden) => {
      if (hidden) {
        pageState[id] |= StateFlags.Hidden;
      } else {
        pageState[id] &= ~StateFlags.Hidden;
      }
    },
    setFavorite: (id, favorite) => {
      if (favorite) {
        pageState[id] |= StateFlags.Favorite;
      } else {
        pageState[id] &= ~StateFlags.Favorite;
      }
    },
    isHideReadThreads: () => pageState.hideReadThreads,
    setHideReadThreads: (hide) => (pageState.hideReadThreads = hide),
  };

  // Try to find the logged in user so we can automatically favorite their comments
  const loggedInUser = findLoggedInUser();

  // Setup a canvas to draw the minimap on
  const $canvas = document.createElement("canvas");
  document.body.appendChild($canvas);

  // Get a list of all comments and paragraphs
  const comments = getComments();
  const paragraphs = getParagraphs();

  const allItems = [...paragraphs, ...comments];
  const redrawHighlightsAndMinimap = () => {
    drawHighlights(allItems);
    drawMinimap($canvas, allItems);
  };

  // Add state to all comments and make them clickable
  for (const comment of comments) {
    comment.unread = state.isUnread(comment.id);
    comment.hasFavoriteWords = containsAny(comment.$el, preferences.favoriteWords);
    state.setAsRead(comment.id);

    const shouldAutoHideAuthor = preferences.hiddenAuthors.includes(comment.author);
    if (comment.unread && shouldAutoHideAuthor) {
      state.setHidden(comment.id, true);
      comment.hidden = true;
    }
    if (comment.unread && comment.author === loggedInUser && preferences.favoriteMe) {
      state.setFavorite(comment.id, true);
    }
    if (comment.unread && comment.hasFavoriteWords) {
      highlightWords(comment.$el, preferences.favoriteWords, preferences.colorFavorites);
    }

    comment.isHidden = () => state.isHidden(comment.id);
    comment.isFavorite = () => state.isFavorite(comment.id);
    comment.isParentFavorite = () => {
      let node = comment;
      while (node) {
        if (node.isFavorite()) {
          return true;
        }
        node = node.parent;
      }
      return false;
    };

    // Return how the comment should be highlighted, undefined if not at all
    comment.highlightColor = () => {
      let color;
      if (comment.fromAdmin && preferences.highlightAdmin) {
        color = ADMIN_COLOR;
      }
      if (comment.unread) {
        if (articleReadBefore || !preferences.hideFirstVisit) {
          color = preferences.colorComments;
        }

        const isFavoriteAuthor = preferences.favoriteAuthors.includes(comment.author);
        if (isFavoriteAuthor || comment.isParentFavorite() || comment.hasFavoriteWords) {
          color = preferences.colorFavorites;
        }
      }
      return color;
    };

    comment.setHidden = (hidden) => {
      state.setHidden(comment.id, hidden);
      writeStorage(pageId, pageState);
    };
    comment.setFavorite = (favorite) => {
      state.setFavorite(comment.id, favorite);
      writeStorage(pageId, pageState);
      redrawHighlightsAndMinimap();
    };
  }

  // We cant count unread children until all comments have been processed
  let totalUnread = 0;
  for (const comment of comments) {
    totalUnread += comment.unread ? 1 : 0;
    comment.count = getCommentCount(comment);
    makeCommentClickable(comment);
  }

  // Add unread count to the comment count header
  updateCommentCount(totalUnread);

  // Add state to all paragraphs
  for (const paragraph of paragraphs) {
    paragraph.unread = state.isUnread(paragraph.id);
    state.setAsRead(paragraph.id);

    paragraph.highlightColor = () => {
      const hightlight =
        preferences.highlightParagraphs &&
        paragraph.unread &&
        (articleReadBefore || !preferences.hideFirstVisit);

      return hightlight ? preferences.colorParagraphs : undefined;
    };
  }

  // Highlight all new content and comments
  drawHighlights(allItems);

  // Setup comments options
  const toggleReadThreads = (hide) => {
    state.setHideReadThreads(hide);
    writeStorage(pageId, pageState);

    for (const comment of comments) {
      const topCommentWithoutUnread = !comment.parent && comment.count.unread == 0;
      if (topCommentWithoutUnread) {
        if (hide) {
          comment.$el.temporarilyHideIt();
        } else {
          comment.$el.temporarilyShowIt();
        }
      }
    }
  };

  const hideReadComments =
    state.isHideReadThreads() || (preferences.autoHideByDefault && !articleReadBefore);
  if (hideReadComments) {
    toggleReadThreads(true);
  }
  addOptionsControls(state.isHideReadThreads(), toggleReadThreads);

  // Add hotkeys to navigate between paragraphs and comments
  const jumpToFirstUnread = preferences.jumpToFirstUnread && articleReadBefore;
  enableHotkeyNavigationFor(allItems, preferences.colorNavigation, jumpToFirstUnread);

  // Make sure the minimap is redrawn when the window is resized
  const redrawMinimap = () => drawMinimap($canvas, allItems);
  new ResizeObserver(redrawMinimap).observe(document.body);
  addEventListener("resize", redrawMinimap);

  // Save the info about this visit
  pageState.lastReadTs = Date.now();
  pageState.readBefore = true;
  writeStorage(pageId, pageState);
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

function findLoggedInUser() {
  const $wpAdmin = document.getElementById("wp-admin-bar-my-account");
  if ($wpAdmin) {
    return ($wpAdmin.getElementsByClassName("display-name")[0]?.innerText || "")
      .trim()
      .toLowerCase();
  }
  return null;
}

function getDepth(element) {
  for (const className of element.classList) {
    if (className.startsWith("depth-")) {
      return parseInt(className.split("-")[1], 10);
    }
  }
  return 0;
}

function getCommentsChildren($el) {
  const $children = $el.getElementsByClassName(`comment depth-${getDepth($el) + 1}`);
  const children = [];
  for (let $child of $children) {
    children.push({
      $el: $child,
      children: getCommentsChildren($child),
    });
  }
  return children;
}

// getComments will return a list of all comments on the page
function getComments() {
  const comments = [];
  const traverseAndSave = ($el, parent) => {
    const id = $el.id;
    const author = ($el.getElementsByClassName("author")[0]?.textContent || "").trim().toLowerCase();
    const $commentText = $el.getElementsByClassName("comment-text")[0];
    $commentText.style.transition = "color 500ms";

    const comment = {
      id: id,
      $el: $commentText,
      type: "comment",
      author: author,
      fromAdmin:
        $el.classList.contains("bypostauthor") || $el.classList.contains("comment-author-admin"),
      children: [],
      parent: parent,
    };
    comments.push(comment);

    const $children = $el.getElementsByClassName(`comment depth-${getDepth($el) + 1}`);
    for (let $child of $children) {
      comment.children.push(traverseAndSave($child, comment));
    }
    return comment;
  };

  const $commentsContainer = document.getElementById("comments");
  if ($commentsContainer) {
    const $children = $commentsContainer.getElementsByClassName(`comment depth-1`);
    for (let $child of $children) {
      traverseAndSave($child, undefined);
    }
  }

  return comments;
}

// getParagraphs will  return a list of all paragraphs
function getParagraphs() {
  const paragraphs = [];

  const $post = document.getElementById("penci-post-entry-inner");
  for (let $paragraph of $post.children) {
    if ($paragraph.nodeName === "P" || $paragraph.nodeName === "BLOCKQUOTE") {
      if ($paragraph.nodeName === "BLOCKQUOTE") {
        // Blockquotes uses the left border to indicate quotes, so we wrap it in a div we can style
        const $wrapper = document.createElement("div");
        $paragraph.replaceWith($wrapper);
        $wrapper.append($paragraph);
        $paragraph = $wrapper;
      }

      paragraphs.push({
        id: hashCode($paragraph.innerText),
        type: "paragraph",
        $el: $paragraph,
      });
    }
  }

  // Add next post link as a paragraph
  const $nextPost = document.getElementsByClassName("post-pagination")[0];
  if ($nextPost) {
    paragraphs.push({
      id: hashCode($nextPost.innerText),
      type: "nextpost",
      $el: $nextPost,
    });
  }

  return paragraphs;
}

function drawHighlights(items) {
  for (let item of items) {
    const color = item.highlightColor();
    if (color) {
      item.$el.style.borderLeft = `3px solid ${color}`;
      item.$el.style.paddingLeft = "6px";
    } else if (item.$el.style.borderLeft != "") {
      // Remove possible highlights
      item.$el.style.borderLeft = "";
      item.$el.style.paddingLeft = "";
    }
  }
}

function containsAny($el, words = []) {
  const $commentText = $el.getElementsByClassName("comment-content")[0];
  if ($commentText) {
    const lowerText = $commentText.textContent.toLowerCase();
    return words.some((word) => lowerText.includes(word));
  }
  return false;
}

function highlightWords($el, words = [], color) {
  const $commentText = $el.getElementsByClassName("comment-content")[0];
  for (let i = 0; i < $commentText.children.length; i++) {
    const $child = $commentText.children[i];
    if ($child.tagName === "P") {
      for (let word of words) {
        $child.innerHTML = $child.innerHTML.replace(
          new RegExp(`(${word})`, "ig"),
          `<span style="border-bottom: 2px solid ${color};">$1</span>`
        );
      }
    }
  }
}

function updateCommentCount(count) {
  const $comments = document.getElementById("comments");
  if ($comments) {
    const $commentCount = $comments.getElementsByClassName("post-box-title")[0];
    if ($commentCount) {
      $commentCount.textContent = `${$commentCount.textContent} (${count} olästa)`;
    }
  }
}

function addOptionsControls(isChecked, onHideThreadsChanged) {
  const $comments = document.getElementById("comments");
  var $commentList = $comments.getElementsByClassName("comments")[0];
  if ($commentList) {
    // Settings button to open the options page
    const $settingsBtn = imageButton(settingsIcnSrc, "Settings");
    $settingsBtn.href = chrome.runtime.getURL("options.html");
    $settingsBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "openOptionsPage" });
    });

    const $spacing = document.createElement("span");
    $spacing.style.padding = "0 10px";
    $spacing.appendChild(document.createTextNode(" | "));

    // Checkbox to hide read threads
    const $checkbox = document.createElement("input");
    $checkbox.type = "checkbox";
    $checkbox.checked = isChecked;
    $checkbox.id = "hide-read-threads";
    $checkbox.addEventListener("change", (e) => onHideThreadsChanged(e.target.checked));

    const $label = document.createElement("label");
    $label.htmlFor = "hide-read-threads";
    $label.title =
      "This will hide all top level comments that have no unread replies to minimize distractions.\nIf a thread gets a reply in your next visit it will show up again.";
    $label.appendChild(document.createTextNode(" Hide threads without unread replies"));

    // Add the options to the DOM
    const $container = document.createElement("div");
    $container.style.padding = "10px";

    $container.appendChild($settingsBtn);
    $container.appendChild($spacing);
    $container.appendChild($checkbox);
    $container.appendChild($label);

    $comments.insertBefore($container, $commentList);
  }
}

// enableHotkeyNavigationFor will
//    - allow the user to navigate new comments and paragraphs using the J and K keys
//    - allow the user to navigate to the first new comment or paragraph using the I key
//    - allow the user to minimize navigated comments by pressing the M key
function enableHotkeyNavigationFor(allItems, navigationColor, jumpToFirstUnread) {
  const entries = allItems.filter((item) => item.unread);

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
      entry.$el.style.borderLeft = `3px solid ${navigationColor}`;
    }, 50);
  };

  const jumpToFirst = () => {
    for (let i = 0; i < entries.length; i++) {
      const isMinimized = entries[i].$el.getBoundingClientRect().height === 0;

      if (!isMinimized) {
        scrollTo(entries[i]);
        return;
      }
    }

    // If no unread, jump to comment section
    const $comments = document.getElementById("comments");
    if ($comments) {
      let position = $comments.getBoundingClientRect();
      window.scrollTo(0, position.top + window.scrollY - 50);
    }
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
      jumpToFirst();
    } else if (e.code === "KeyM") {
      if (navigatedEntry && navigatedEntry.type === "comment") {
        navigatedEntry.$el.hideIt();
      }
    } else if (e.code === "KeyN") {
      if (navigatedEntry && navigatedEntry.type === "comment") {
        navigatedEntry.$el.favoriteIt();
      }
    }
  });

  if (jumpToFirstUnread) {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    jumpToFirst();
  }
}

// drawMinimap will
//      - draw a minimap on the right side of the screen
function drawMinimap($canvas, entries) {
  const scrollOffset = window.innerWidth - document.documentElement.clientWidth;
  $canvas.style = `position:fixed; left: ${
    document.body.clientWidth - 5
  }px; top: ${scrollOffset}px; width: 5px; height: ${
    window.innerHeight - scrollOffset * 2
  }px; z-index: 9999;`;
  $canvas.width = 5;
  $canvas.height = window.innerHeight;

  const q = window.innerHeight / document.documentElement.scrollHeight;

  var ctx = $canvas.getContext("2d");
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);

  for (const item of entries) {
    const color = item.highlightColor();

    if (color) {
      const rect = item.$el.getBoundingClientRect();
      ctx.fillStyle = color;
      ctx.fillRect(0, (window.scrollY + rect.top) * q, 5, rect.height * q);
    }
  }
}

function makeCommentClickable(comment) {
  const $container = comment.$el.parentElement.parentElement;
  const $hiddenContainer = createHiddenThreadContainer($container, comment);
  $container.parentNode.insertBefore($hiddenContainer, $container);

  const hideComments = (e) => {
    e?.preventDefault();
    $container.style.display = "none";
    $hiddenContainer.style.display = "";
    comment.setHidden(true);
  };
  const temporarilyHideComments = (e) => {
    e?.preventDefault();
    $container.style.display = "none";
    $hiddenContainer.style.display = "";
  };
  const showComments = (e) => {
    e?.preventDefault();
    $container.style.display = "";
    $hiddenContainer.style.display = "none";
    comment.setHidden(false);
  };
  const temporarilyShowComments = (e) => {
    e?.preventDefault();
    $container.style.display = "";
    $hiddenContainer.style.display = "none";
    comment.setHidden(false);
  };

  if (comment.isHidden()) {
    $container.style.display = "none";
  } else {
    $hiddenContainer.style.display = "none";
  }

  // Find author element and hide comments when it's clicked
  const $author = comment.$el.getElementsByClassName("author")[0];
  $author.title = "Hide comments";
  $author.style.cursor = "pointer";
  $author.prepend(imageButton(hideCommentsIcnSrc), "Hide comments");
  $author.addEventListener("click", hideComments);
  comment.$el.hideIt = hideComments;
  comment.$el.temporarilyHideIt = temporarilyHideComments;

  // Show comments again when hidden container is clicked
  $hiddenContainer.addEventListener("click", showComments);
  comment.$el.showIt = showComments;
  comment.$el.temporarilyShowIt = temporarilyShowComments;

  // Add favorite button
  const $favoriteBtn = imageButton(comment.isFavorite() ? filledStarIcnSrc : emptyStarIcnSrc, "Favorite comments");
  $author.prepend($favoriteBtn);
  const toggleFavorite = (e) => {
    e?.stopImmediatePropagation();
    if (comment.isFavorite()) {
      $favoriteBtn.src = emptyStarIcnSrc;
      comment.setFavorite(false);
    } else {
      $favoriteBtn.src = emptyStarIcnSrc;
      comment.setFavorite(true);
    }
  };

  $favoriteBtn.addEventListener("click", toggleFavorite);
  comment.$el.favoriteIt = toggleFavorite;
  first = false;
}

function createHiddenThreadContainer($container, comment) {
  const $hiddenContainer = document.createElement("div");
  const $text = document.createElement("p");
  $hiddenContainer.appendChild($text);

  const $authorContent = comment.$el.getElementsByClassName("author")[0];
  const $commentContent = comment.$el.getElementsByClassName("comment-content")[0];

  const summary = getSummary($authorContent, $commentContent);
  if (comment.count.unread > 0) {
    $text.innerText = `[${comment.count.total} comments, ${comment.count.unread} unread] - ${summary} (${comment.count.unread} unread)`;
  } else {
    $text.innerText = `[${comment.count.total} comments] - ${summary}`;
  }

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
  const author = $author.textContent || "";
  const comment = $comment.textContent || "";
  return `${author}: ${comment}`.replace(/(\r\n|\n|\r)/gm, " ").substring(0, 75) + "...";
}

function getCommentCount(comment) {
  let total = 1;
  let unread = comment.unread ? 1 : 0;

  for (const child of comment.children) {
    const count = getCommentCount(child);
    total += count.total;
    unread += count.unread;
  }

  return { total, unread };
}

function imageButton(imgSrc, title) {
  // <img style="width: 16px; height: 16px; margin-right: 8px;" />
  const $imgBtn = document.createElement("img");
  $imgBtn.style.width = '16px';
  $imgBtn.style.height = '16px';
  $imgBtn.style.marginRight = '8px';
  $imgBtn.style.cursor = "pointer";
  $imgBtn.title = title;
  $imgBtn.src = imgSrc;

  return $imgBtn;
}

async function loadImage(src) {
  const image = new Image();
  image.src = src;
  await image.decode();

  return image.src;
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
