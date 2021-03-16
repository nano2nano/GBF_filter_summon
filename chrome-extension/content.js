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
function main() {
    console.log("called main");
    chrome.runtime.sendMessage({ tag: "request_local_storage", key: "root_switch" }, function (response) {
        if (response.value == "true") {
            _main();
        }
    });
}

function _main() {
    console.log("called _main");
    if (location.hash.match(TRIAL_HASH)) {
        processTrialPage();
    } else if (location.hash.match(/\/supporter\//)) {
        processSupporterPage();
    }
}

function processTrialPage() {
    // except trial page
    console.log('trial page');
    Promise.resolve()
        // wait for the supporter list.
        .then(waitClass.bind(this, "prt-supporter-attribute"), (items) => {
            return items.length == 7;
        })
        .then((items) => {
            return new Promise(callback => {
                const supporter_list = items[3].getElementsByClassName("btn-supporter lis-supporter");
                supporter_list[supporter_list.length - 1].scrollIntoView({ block: 'center' });
                setTimeout(() => {
                    const rect = supporter_list[supporter_list.length - 1].getBoundingClientRect();
                    callback();
                }, 500);
            });
        });
}

function processSupporterPage() {
    chrome.runtime.sendMessage({ tag: "request_local_storage", key: "do_filter" }, async res => {
        if (res.value == "true") {
            SUMMON_PARAM = getSummonSearchParam();
            const targetElement = await getTargetSupporterElement();
            if (targetElement !== null) {
                targetElement.scrollIntoView({ block: 'center' });
            } else {
                sendNotification("Not Fount Summon");
                location.href = "http://game.granbluefantasy.jp/" + TRIAL_HASH;
            }
        }
    });
}

function waitClass(class_name, cond_func = () => { return true }) {
    return new Promise((callback) => {
        const timer = setInterval(wait_item, 250);
        function wait_item() {
            items = document.getElementsByClassName(class_name);
            if (items.length != 0 && cond_func(items)) {
                clearInterval(timer);
                callback(items);
            }
        }
    });
}

function waitSupporterList() {
    return new Promise(callback => {
        waitClass("prt-supporter-attribute", items => {
            return items.length == 7;
        }).then(callback);
    });
}

function getTargetSupporterElement() {
    return new Promise(callback => {
        waitSupporterList()
            .then(() => {
                const attribute_id = "attribute" in SUMMON_PARAM ? SUMMON_PARAM['attribute'] : null;
                const summons = getSummons(attribute_id);
                const idx = findSummonIndex(summons);
                callback(idx == -1 ? null : summons[idx]);
            })
    })
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