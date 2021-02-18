const TRIAL_HASH = "#quest/supporter/990021/17";

if ("onhashchange" in window) {
    window.onhashchange = function () {
        if (location.hash.match(TRIAL_HASH)) {
            // except trial page
            console.log('trial page');
            return;
        }
        var pattern = /^#quest\/supporter\//;
        var pattern2 = /^#quest\/supporter_raid\//;
        var pattern3 = /^#event\/sequenceraid008\/supporter\//;
        if ((location.hash.match(pattern) != null) || (location.hash.match(pattern2) != null || (location.hash.match(pattern3) != null))) {
            var id = this.setInterval(waitfun, 250);
            function waitfun() {
                var elements = document.getElementsByClassName('btn-supporter lis-supporter');
                if (elements.length != 0) {
                    clearInterval(id);
                    if (existSummon(elements)) {
                        // nothing to do
                    } else {
                        goTrial();
                    }
                }
            }
        }
    }
}

function sendNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification(message);
    } else {
        // Let's check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log("This browser does not support notifications.");
        } else {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') {
                        new Notification(message);
                    }
                })
        }
    }

}

function goTrial() {
    sendNotification("Not Fount Summon");
    location.href = "http://game.granbluefantasy.jp/" + TRIAL_HASH;
}

function existSummon(summons) {
    var summon_array = Array.prototype.slice.call(summons);
    for (var i = 0; i < summon_array.length; i++) {
        var summon_params = getParams(summon_array[i]);
        if (summon_params[0] === "カグヤ" && summon_params[1] == 2) {
            return true;
        }
    }
    return false;
}

function getParams(summon) {
    var bless_rank_text = ['prt-summon-skill  bless-rank1-style', 'prt-summon-skill  bless-rank2-style'];
    var summon_name = summon.getElementsByClassName('prt-supporter-summon')[0].textContent.replace(/^\s+|\s+$/g, "").split(" ")[2];
    var bless_rank = 0;

    for (var i = 0; i < bless_rank_text.length; i++) {
        if (summon.getElementsByClassName(bless_rank_text[i]).length != 0) {
            bless_rank = i + 1;
            break;
        }
    }
    return [summon_name, bless_rank];
}