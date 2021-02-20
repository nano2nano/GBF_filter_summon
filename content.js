if (!localStorage.hasOwnProperty("DO_FILTER")) {
    localStorage.setItem("DO_FILTER", "true");
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        switch (request.tag) {
            case "quest":
                if (request.cmd === "start") {
                    console.log("start trial quest");
                    console.log("move to quest index page.");
                    location.href = "http://game.granbluefantasy.jp/#quest/index";
                }
                break;
            case "game_result":
                location.reload();
                break;
            default:
                break;
        }
        return true;
    }
);

chrome.runtime.sendMessage({ tag: "register_tab_id" });

const TRIAL_HASH = "#quest/supporter/990021/17";
let SUMMON_PARAM = {
    summon_name: 'カグヤ',
    bless_rank: 2,
};
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
    },
    {
        hash: '#quest/supporter/300271/1/0/26',
        summon_name: 'セレスト・マグナ',
        bless_rank: 2,
    },
    {
        hash: '#quest/supporter/300281/1/0/31',
        summon_name: 'シュヴァリエ・マグナ',
        bless_rank: 2,
    }
];

if ("onhashchange" in window) {
    window.onhashchange = function () {
        if (location.hash.match(TRIAL_HASH)) {
            // except trial page
            console.log('trial page');
            return;
        }
        if (isSummonListPage() && localStorage.getItem("DO_FILTER") == "true") {
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
        SUMMON_PARAM = SUMMON_EXCEPTION_LIST[index];
        console.log('set summon param');
        console.log(SUMMON_PARAM);
    }
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

}

function createNotification(message, options = {}) {
    var notification = new Notification(message, options);
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
        if (summon_params[0] === SUMMON_PARAM['summon_name'] && summon_params[1] == SUMMON_PARAM['bless_rank']) {
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