let SUMMON_EXCEPTION_LIST = null;
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        switch (request.tag) {
            case "trial_battle":
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
            case "config":
                console.log("Load config");
                console.log(request.data);
                // Set filter
                SUMMON_EXCEPTION_LIST = request.data.filter;
                break;
            default:
                break;
        }
        return true;
    }
);

chrome.runtime.sendMessage({ tag: "register_tab_id" });
chrome.runtime.sendMessage({ tag: 'load_config' });
const TRIAL_HASH = "#quest/supporter/990021/17";
let SUMMON_PARAM = {
    summon_name: 'カグヤ',
    bless_rank: 4,
    attribute: 0,
};

if ("onhashchange" in window) {
    window.onhashchange = function () {
        if (location.hash.match(TRIAL_HASH)) {
            // except trial page
            console.log('trial page');
            return;
        } else if (location.hash.match(/\/supporter\//)) {
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
                setTimeout(() => {
                    summons[index].scrollIntoView({ block: 'center' });
                    setTimeout(() => {
                        const rect = summons[index].getBoundingClientRect();
                        chrome.runtime.sendMessage({
                            tag: "sendToNative", data: {
                                tag: "click",
                                innerHeight: window.innerHeight,
                                innerWidth: window.innerWidth,
                                x: rect.x * 1.5,
                                y: rect.y * 1.5,
                                width: rect.width,
                                height: rect.height
                            }
                        });
                        const timer = setInterval(() => {
                            const ok_button = document.getElementsByClassName("btn-usual-ok se-quest-start");
                            if (ok_button.length != 0) {
                                clearInterval(timer);
                                const rect = ok_button[0].getBoundingClientRect();
                                console.log("click ok_button(summon)");
                                chrome.runtime.sendMessage({
                                    tag: "sendToNative", data: {
                                        tag: "click",
                                        innerHeight: window.innerHeight,
                                        innerWidth: window.innerWidth,
                                        x: rect.x * 1.5,
                                        y: rect.y * 1.5,
                                        width: rect.width,
                                        height: rect.height
                                    }
                                });
                            }
                        }, 100);
                    }, 500);
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
    return params[0] + '' == SUMMON_PARAM['summon_name'] + '' && params[1] + '' == SUMMON_PARAM['bless_rank'] + '';
}

function getParams(summon) {
    var summon_name = summon.getElementsByClassName('prt-supporter-summon')[0].textContent.replace(/^\s+|\s+$/g, "").split(" ")[2];
    var bless_rank = summon.getAttribute('data-supporter-evolution');
    return [summon_name, bless_rank];
}

function callAfterRandomTime(func) {
    const time = Math.random(1000);
    window.setTimeout(func, time);
}