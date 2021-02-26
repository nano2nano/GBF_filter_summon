const TRIAL_BATTLE_QUEST_ID = "990021";

chrome.devtools.network.onRequestFinished.addListener(
    async function (request) {
        if (request.request.url.match("http://game.granbluefantasy.jp/resultmulti/data")) {
            // request data for result page.
        } else if (request.request.url.match("result.json")) {
            try {
                const ctt = await new Promise((rss, rjk) => request.getContent(rss));
                const attack_result = JSON.parse(ctt);
                const scenario = attack_result.scenario;
                const win_cmd_idx = getIndexOfWinCommandInScenario(scenario);

                if (win_cmd_idx != -1) {
                    console.log("win the battle");
                    chrome.runtime.sendMessage({ tag: "game_result", isWin: true, isLastRaid: scenario[win_cmd_idx]['is_last_raid'] });
                } else if (getIndexOfLoseCommandInScenario(scenario) != -1) {
                    console.log("lose the battle");
                    chrome.runtime.sendMessage({ tag: "game_result", isWin: false });
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

function getIndexOfWinCommandInScenario(scenario) {
    return scenario.findIndex(({ cmd }) => cmd === 'win');
}

function getIndexOfLoseCommandInScenario(scenario) {
    return scenario.findIndex(({ cmd }) => cmd === 'lose');
}