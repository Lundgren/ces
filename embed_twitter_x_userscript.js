// ==UserScript==
// @name         Cornucopia - Embedded tweets
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  This script will replace all twitter/x link with embedded tweets that can be viewed directly on the page instead of going to x.com. Just click on a twitter/x link to open or close it.
// @author       Lundgren
// @match        https://cornucopia.se/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cornucopia.se
// ==/UserScript==

const EXPAND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7 14h-5v5h-4v-5h-5v-4h5v-5h4v5h5v4z"/></svg>`;

(async () => {
    'use strict';
    const post = document.getElementById('penci-post-entry-inner');
    const links = document.getElementsByTagName('a');

    const expanded = {};

    await Array.from(links).forEach(async (el) => {
            if (el.href.startsWith("https://twitter.com/") || el.href.startsWith("https://mobile.twitter.com/") || el.href.startsWith("https://x.com/") || el.href.startsWith("https://mobile.x.com/")) {
                el.insertBefore(strToElement(EXPAND_ICON), el.firstChild)
                el.onclick = (e) => {
                    e.preventDefault();
                    if (expanded[el.href + el.innerText]) {
                        const embeddedTweetEl = expanded[el.href + el.innerText];
                        embeddedTweetEl.remove();

                        delete expanded[el.href + el.innerText];
                    } else {
                        const embeddedTweetEl = document.createElement('div');
                        el.parentElement.insertBefore(embeddedTweetEl, el.nextSibling)
                        unsafeWindow.twttr.widgets.createTweet(getId(el.href), embeddedTweetEl);

                        expanded[el.href + el.innerText] = embeddedTweetEl;
                    }
                }
            }
    });

    let script = document.createElement('script');
    script.type = "text/javascript";
    script.src = 'https://platform.twitter.com/widgets.js';
    document.body.appendChild(script);
})();

function strToElement(str) {
    const temp = document.createElement('div');
    temp.innerHTML = str;
    return temp.firstChild;
}

function getId(href) {
    // https://{mobile.twitter.com|twitter.com}/{user}/status/{id}?{unnecessary}
    let parts = href.split('?')[0].split('/');
    return parts[parts.length - 1];
}