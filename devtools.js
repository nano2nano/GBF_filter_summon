const TRIAL_BATTLE_QUEST_ID = "990021";

chrome.devtools.network.onRequestFinished.addListener(
    async function (request) {
        if (request.request.url.match("http://game.granbluefantasy.jp/resultmulti/data")) {
            // request data for result page.
        } else if (request.request.url.match("normal_attack_result.json")) {
            try {
                const ctt = await new Promise((rss, rjk) => request.getContent(rss));
                const attack_result = JSON.parse(ctt);
                const scenario = attack_result.scenario;
                const cmd_win_idx = scenario.findIndex(function ({ cmd }) {
                    return cmd === 'win';
                });

                if (cmd_win_idx == -1) {
                    // do nothing
                } else {
                    // win
                    console.log("win the battle");
                    chrome.runtime.sendMessage({ tag: "game_result", isWin: true });
                }
            } catch (error) {
                console.error();
            }
        } else if (request.request.url.match("start.json")) {
            console.log("start quest");
            try {
                const ctt = await new Promise((rss, rjk) => request.getContent(rss));
                const start_json = JSON.parse(ctt);
                if (start_json.quest_id == TRIAL_BATTLE_QUEST_ID) {
                    // start trial battle.
                    // send message to background
                    chrome.runtime.sendMessage({ tag: "quest", cmd: "start" });
                } else {
                    // start other quest
                }
            } catch (error) {
                console.error();
            }
        } else {
            // console.log('other request');
        }
    }
);
