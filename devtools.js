chrome.devtools.network.onRequestFinished.addListener(
    async function (request) {
        if (request.request.url.match("http://game.granbluefantasy.jp/resultmulti/data")) {
            try {
                const ctt = await new Promise((rss, rjk) => request.getContent(rss));
                // console.log(ctt);
            } catch (error) {
                console.error();
            }
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
                    chrome.runtime.sendMessage({ tag: "game_result", isWin: true }, function () {
                        // do nothing
                    });
                }
                // console.log(attack_result);
                // console.log(obj.scenario);
            } catch (error) {
                console.error();
            }
        } else {
            // console.log('other request');
        }
    }
);
