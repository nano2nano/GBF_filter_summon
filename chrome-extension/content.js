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
                    if (request.reload) {
                        location.reload();
                    }
                }
                break;
            default:
                break;
        }
        return true;
    }
);

chrome.runtime.sendMessage({ tag: "register_tab_id" });
chrome.runtime.sendMessage({ tag: 'load_config' }, res => {
    console.log("SET FILTER");
    console.log(res.data.filter);
    SUMMON_EXCEPTION_LIST = res.data.filter;
});
const TRIAL_HASH = "#quest/supporter/990021/17";
let SUMMON_PARAM = {
    summon_name: 'カグヤ',
    bless_rank: 4,
    attribute: 0,
};

window.addEventListener('hashchange', main);
async function main() {
    console.log("called main");
    const do_main_process = await getLocalStorage("root_switch") == "true";
    if (do_main_process) {
        _main();
    }
}

function _main() {
    if (location.hash.match(TRIAL_HASH)) {
        processTrialPage();
    } else if (location.hash.match(/\/supporter/)) {
        processSupporterPage();
    }
}

async function processTrialPage() {
    console.log('trial page');
    const items = await waitClass("prt-supporter-attribute", items => {
        return items.length == 7;
    })
    const supporter_list = items[3].getElementsByClassName("btn-supporter lis-supporter");
    const last_supporter = supporter_list[supporter_list.length - 1];
    await waitRender(last_supporter, 50);
    last_supporter.scrollIntoView({ block: 'center' });
}

async function processSupporterPage() {
    const doFilter = await getLocalStorage("do_filter") == "true";
    if (doFilter) {
        SUMMON_PARAM = getSummonSearchParam();
        const targetElement = await getTargetSupporterElement();
        if (targetElement !== null) {
            await waitRender(targetElement, 50);
            targetElement.scrollIntoView({ block: 'center' });
        } else {
            sendNotification("Not Fount Summon");
            location.href = "http://game.granbluefantasy.jp/" + TRIAL_HASH;
        }
    }
}

async function getLocalStorage(key) {
    return new Promise(callback => {
        chrome.runtime.sendMessage({ tag: "request_local_storage", key: key }, res => {
            callback(res.value);
        });
    });
}

async function waitCond(cond_func, interval_sec = 250) {
    return new Promise(callback => {
        const timer = setInterval(waitFunc, interval_sec);
        function waitFunc() {
            if (cond_func()) {
                clearInterval(timer);
                callback();
            }
        }
    });
}

async function waitClass(class_name, cond_func = () => { return true }) {
    return new Promise((callback) => {
        const timer = setInterval(wait_item, 250);
        function wait_item() {
            const items = document.getElementsByClassName(class_name);
            if (items.length != 0 && cond_func(items)) {
                clearInterval(timer);
                callback(items);
            }
        }
    });
}

async function waitRender(element, interval_sec = 250) {
    return new Promise(callback => {
        const timer = setInterval(waitFunc, interval_sec);
        function waitFunc() {
            const rect = element.getBoundingClientRect();
            if (!(rect.x == 0 && rect.y == 0)) {
                clearInterval(timer);
                callback(element);
            }
        }
    });
}

async function waitSupporterList() {
    await waitClass("prt-supporter-attribute", items => {
        return items.length == 7;
    });
}

async function getTargetSupporterElement() {
    await waitSupporterList();
    const attribute_id = "attribute" in SUMMON_PARAM ? SUMMON_PARAM['attribute'] : null;
    const summons = getSummons(attribute_id);
    const idx = findSummonIndex(summons);
    return idx == -1 ? null : summons[idx];
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

function getSummons(attribute_id = null) {
    // 0 = misc., 1=fire, 2=water, 3=earth, 4=wind, 5=light, 6=dark
    const per_attribute = document.getElementsByClassName("prt-supporter-attribute");
    let root;
    if (attribute_id != null) {
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