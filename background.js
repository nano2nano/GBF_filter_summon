const SEND_NOTIFICATION_END_OF_BATTLE = true;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.tag == "game_result" && SEND_NOTIFICATION_END_OF_BATTLE) {
            if (request.isWin) {
                sendNotification("Win the battle");
                console.log('win the battle');
            }
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