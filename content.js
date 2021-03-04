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
                    callAfterRandomTime(function () {
                        location.href = "http://game.granbluefantasy.jp/#quest/index";
                    })
                }
                break;
            case "game_result":
                if (request.isWin && request.isLastRaid) {
                    location.reload();
                }
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
    attribute: 0,
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
        if (isSummonListPage()) {
            chrome.runtime.sendMessage({ tag: "request_local_storage", key: "do_filter" }, function (response) {
                if (response.value) {
                    checkSummon();
                }
            });
        }
    }
}

function checkSummon() {
    SUMMON_PARAM = getSummonSearchParam();
    var id = this.setInterval(waitfun, 250);
    function waitfun() {
        // var elements = document.getElementsByClassName('btn-supporter lis-supporter');
        const summons = getSummons();
        if (summons.length != 0) {
            clearInterval(id);
            const index = findSummonIndex(summons);
            if (index != -1) {
                // scroll to target
                setTimeout(function () {
                    summons[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            } else {
                // could not find supporter
                sendNotification("Not Fount Summon");
                callAfterRandomTime(function () {
                    location.href = "http://game.granbluefantasy.jp/" + TRIAL_HASH;
                })
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

function getSummonSearchParam() {
    const index = SUMMON_EXCEPTION_LIST.findIndex(({ hash }) => location.hash === hash);
    if (index != -1) {
        return SUMMON_EXCEPTION_LIST[index];
    } else {
        return SUMMON_PARAM;
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
    function createNotification(message, options = {}) {
        var notification = new Notification(message, options);
        notification.addEventListener('click', function (e) {
            window.focus();
            e.target.close();
        })
    }
}

function getSummons() {
    // 0 = misc., 1=fire, 2=water, 3=earth, 4=wind, 5=light, 6=dark
    const per_attribute = document.querySelectorAll('.prt-supporter-attribute, .prt-supporter-attribute disableView');
    let root;
    if ('attribute' in SUMMON_PARAM) {
        // if provided attribute key
        const attribute_id = SUMMON_PARAM['attribute'];
        root = per_attribute[attribute_id];
    } else {
        root = document;
    }
    return root.getElementsByClassName('btn-supporter lis-supporter');
}

function findSummonIndex(summons) {
    const summon_array = Array.prototype.slice.call(summons);
    const index = summon_array.findIndex(_isTargetSummon);
    return index;
}

function _isTargetSummon(summon) {
    const params = getParams(summon);
    return params[0] == SUMMON_PARAM['summon_name'] && params[1] == SUMMON_PARAM['bless_rank'];
}

function getParams(summon) {
    var bless_rank_text = ['prt-summon-skill  bless-rank1-style', 'prt-summon-skill  bless-rank2-style', 'prt-summon-skill  bless-rank3-style'];
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

function callAfterRandomTime(func) {
    const time = Math.random(1000);
    window.setTimeout(func, time);
}