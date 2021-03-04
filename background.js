// hold tab.id of tab that has gbf open.
let tab_id = null;

// Set params to localStorage
if (!localStorage.hasOwnProperty("SEND_NOTIFICATION_END_OF_BATTLE")) {
    localStorage.setItem("SEND_NOTIFICATION_END_OF_BATTLE", "true");
}
if (!localStorage.hasOwnProperty("AUTO_RELOAD")) {
    localStorage.setItem("AUTO_RELOAD", "true");
}
if (!localStorage.hasOwnProperty("do_filter")) {
    localStorage.setItem("do_filter", "true");
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        switch (request.tag) {
            case "request_local_storage":
                sendResponse({ value: localStorage.getItem(request.key) == "true" });
                break;
            case "register_tab_id":
                tab_id = sender.tab.id;
                break;
            case "game_result":
                tab_id = sender.tab.id;
                if (localStorage.getItem("AUTO_RELOAD") == "true") {
                    chrome.tabs.sendMessage(tab_id, request);
                }
                if (localStorage.getItem("SEND_NOTIFICATION_END_OF_BATTLE") == "true") {
                    if (request.isWin && request.isLastRaid) {
                        sendNotification("Win the battle");
                    } else if (!request.isWin) {
                        sendNotification("Lose the battle");
                    }
                }
                break;
            case "quest":
                tab_id = sender.tab.id;
                if (request.cmd === "start") {
                    chrome.tabs.sendMessage(tab_id, request);
                }
                break;
            case "load_config":
                tab_id = sender.tab.id;
                loadConfig((config) => {
                    chrome.tabs.sendMessage(tab_id, {
                        tag: 'config', data: config
                    });
                });

            default:
                break;
        }
        return true;
    }
);

function loadConfig(callback = (config) => { console.log(config) }) {
    const CONFIG_FILE = 'config.json';
    let xhr = new XMLHttpRequest();
    let config;
    xhr.open('GET', chrome.extension.getURL(CONFIG_FILE), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            config = JSON.parse(xhr.responseText);
            callback(config);
        }
    };
    xhr.send();
}

function sendNotification(message, options = {}) {
    if (Notification.permission === 'granted') {
        createNotification(message, options);
    } else {
        // Let's check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log("This browser does not support notifications.");
        } else {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') {
                        createNotification(message, options);
                    }
                })
        }
    }
    function createNotification(message, options = {}) {
        var notification = new Notification(message, options);
        notification.addEventListener('click', function (e) {
            window.focus();
            e.target.close();
        })
    }
}

function init() {

}