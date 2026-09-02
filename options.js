const regexesInput = document.querySelector("#regexes");
const saveButton = document.querySelector("#save");
const saveMessage = document.querySelector("#saveMessage");

if (typeof browser === 'undefined') {
    window.browser = chrome;
}

async function loadSettings() {
    try {
        const { regexes = [] } = await browser.storage.local.get("regexes");
        regexesInput.value = regexes.join("\n");
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    const regexes = regexesInput.value
        .split("\n")
        .map(pattern => pattern.trim())
        .filter(Boolean);

    for (const pattern of regexes) {
        try {
            new RegExp(pattern, "i");
        } catch {
            saveMessage.textContent = `Invalid regex: ${pattern}`;
            saveMessage.style.color = "red";
            return;
        }
    }

    try {
        await browser.storage.local.set({ regexes });
        saveMessage.textContent = "Saved " + regexes.length + " patterns!";
        saveMessage.style.color = "green";
        
        if (typeof browser !== 'undefined' && browser.tabs) {
            browser.tabs.query({ url: '*://*.youtube.com/*' }).then(tabs => {
                tabs.forEach(tab => {
                    browser.tabs.reload(tab.id);
                });
            }).catch(() => {});
        }
        
        setTimeout(() => {
            saveMessage.textContent = "";
        }, 3000);
    } catch (error) {
        console.error('Error saving:', error);
        saveMessage.textContent = "Error saving settings";
        saveMessage.style.color = "red";
    }
}

saveButton.addEventListener("click", saveSettings);

loadSettings();