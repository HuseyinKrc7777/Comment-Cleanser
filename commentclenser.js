/*
const regexes = [
    /(?<!\d)\d{4}(?!\d)/i,
    /yıl|yıllar|year|years|old|yaş|yaşlı|eski|yesterday|dün|kid|çocuk/i,
    /:|-/i,
    /TikTok|Tiktok|tiktok/i,
    /remember|hatırla/i,
    /search|simple|arama|honest|time/i,
    /corona|korona|nostalgi|nostalji|people|%/i,
];
*/
if (typeof browser === 'undefined') {
    window.browser = chrome;
}

let loadedRegexes = [];

async function loadRegexes() {
    try {
        const result = await browser.storage.local.get("regexes");
        const patterns = result.regexes || [];
        
        loadedRegexes = patterns
            .map(pattern => {
                try {
                    return new RegExp(pattern, "iu");
                } catch {
                    return null;
                }
            })
            .filter(regex => regex !== null);
        
        console.log('Loaded ' + loadedRegexes.length + ' regex patterns from storage');
    } catch (error) {
        console.error('Error loading regexes:', error);
        loadedRegexes = [];
    }
}

function shouldHideComment(comment) {
    const textElement = comment.querySelector("#content-text");
    if (!textElement) {
        return false;
    }

    const text = textElement.textContent;
    
    if (loadedRegexes.some(regex => regex.test(text))) {
        return true;
    }
    
    return regexes.some(regex => regex.test(text));
}

function processComment(comment) {
    if (shouldHideComment(comment)) {
        comment.style.display = "none";
    }
}

browser.storage.onChanged.addListener(async (changes, area) => {
    if (area !== "local") {
        return;
    }

    if (changes.regexes) {
        await loadRegexes();
        processAllComments();
    }
});

function processAllComments() {
    document
        .querySelectorAll("ytd-comment-thread-renderer")
        .forEach(processComment);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            if (node.matches?.("ytd-comment-thread-renderer")) {
                processComment(node);
            }

            node
                .querySelectorAll?.("ytd-comment-thread-renderer")
                .forEach(processComment);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

loadRegexes().then(() => {
    processAllComments();
});