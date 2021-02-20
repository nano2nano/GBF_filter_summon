const SEND_NOTIFICATION_END_OF_BATTLE = true;
let tab_id = null;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        switch (request.tag) {
            case "register_tab_id":
                tab_id = sender.tab.id;
                break;
            case "game_result":
                if (tab_id !== null) {
                    chrome.tabs.sendMessage(tab_id, request);
                }
                if (SEND_NOTIFICATION_END_OF_BATTLE) {
                    if (request.isWin) {
                        sendNotification("Win the battle");
                    } else {
                        sendNotification("Lose the battle");
                    }
                }
                break;
            case "quest":
                if (request.cmd === "start" && tab_id !== null) {
                    chrome.tabs.sendMessage(tab_id, request);
                }
                break;
            default:
                break;
        }
        return true;
    }
);

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

}

function createNotification(message, options = {}) {
    var notification = new Notification(message, options);
    notification.addEventListener('click', function (e) {
        window.focus();
        e.target.close();
    })
}