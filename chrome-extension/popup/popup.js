const bg = chrome.extension.getBackgroundPage();
const root_switch = document.getElementById("toggle_root_switch");
const do_filter = document.getElementById("toggle_do_filter");
const auto_reload = document.getElementById("toggle_auto_reload");
const send_notification_end_of_battle = document.getElementById("toggle_send_notification_end_of_battle");

root_switch.checked = bg.localStorage.getItem("root_switch") == "true";
root_switch.addEventListener('change', function () {
    bg.localStorage.setItem("root_switch", this.checked);
});

do_filter.checked = bg.localStorage.getItem("do_filter") == "true";
do_filter.addEventListener('change', function () {
    bg.localStorage.setItem("do_filter", this.checked);
});

auto_reload.checked = bg.localStorage.getItem("AUTO_RELOAD") == "true";
auto_reload.addEventListener('change', function () {
    bg.localStorage.setItem("AUTO_RELOAD", this.checked);
});

send_notification_end_of_battle.checked = bg.localStorage.getItem("SEND_NOTIFICATION_END_OF_BATTLE") == "true";
send_notification_end_of_battle.addEventListener("change", function () {
    bg.localStorage.setItem("SEND_NOTIFICATION_END_OF_BATTLE", this.checked);
});
