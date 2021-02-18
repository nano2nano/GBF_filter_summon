const TRIAL_HASH = "#quest/supporter/990021/17";
let SUMMON_PARAM = ['カグヤ', 2];
const SUMMON_EXCEPTION_LIST = [
    {
        hash: '#quest/supporter/300161/1/0/20',
        summon_name: 'ゴッドガード・ブローディア',
        bless_rank: 1,
    },
    {
        hash: '#quest/supporter/300261/1/0/21',
        summon_name: 'グリームニル',
        bless_rank: 1,
    }
];
const SEND_NOTIFICATION_END_OF_BATTLE = true;

if ("onhashchange" in window) {
    window.onhashchange = function () {
        if (location.hash.match(TRIAL_HASH)) {
            // except trial page
            console.log('trial page');
            return;
        }
        if (isSummonListPage()) {
            setSummonParam();
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
        } else if (isResultPage()) {
            if (SEND_NOTIFICATION_END_OF_BATTLE) {
                sendNotification("Finish Battle");
            }
        }
    }
}

function isSummonListPage() {
    const pattern = /^#quest\/supporter\//;
    const pattern2 = /^#quest\/supporter_raid\//;
    const pattern3 = /^#event\/sequenceraid008\/supporter\//;
    return location.hash.match(pattern) != null
        || location.hash.match(pattern2) != null
        || location.hash.match(pattern3) != null;
}

function setSummonParam() {
    const index = SUMMON_EXCEPTION_LIST.findIndex(function ({ hash }) {
        return location.hash === hash;
    });
    if (index != -1) {
        SUMMON_PARAM = [SUMMON_EXCEPTION_LIST[index]['summon_name'], SUMMON_EXCEPTION_LIST[index]['bless_rank']];
        console.log('set summon param');
        console.log(SUMMON_PARAM);
    }
}

function isResultPage() {
    const pattern = /^#result_multi\/*/;
    return location.hash.match(pattern);
}

function sendNotification(message) {
    if (Notification.permission === 'granted') {
        createNotification(message);
    } else {
        // Let's check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log("This browser does not support notifications.");
        } else {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') {
                        createNotification(message);
                    }
                })
        }
    }

}

function createNotification(message) {
    var notification = new Notification(message);
    notification.addEventListener('click', function (e) {
        window.focus();
        e.target.close();
    })
}

function goTrial() {
    sendNotification("Not Fount Summon");
    location.href = "http://game.granbluefantasy.jp/" + TRIAL_HASH;
}

function existSummon(summons) {
    var summon_array = Array.prototype.slice.call(summons);
    for (var i = 0; i < summon_array.length; i++) {
        var summon_params = getParams(summon_array[i]);
        if (summon_params[0] === SUMMON_PARAM[0] && summon_params[1] == SUMMON_PARAM[1]) {
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