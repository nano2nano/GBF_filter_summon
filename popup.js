const bg = chrome.extension.getBackgroundPage();
const auto_reload = document.getElementById("toggle_auto_reload");
const send_notification_end_of_battle = document.getElementById("toggle_send_notification_end_of_battle");

auto_reload.checked = bg.localStorage.getItem("AUTO_RELOAD") == "true";
auto_reload.addEventListener('change', function () {
    bg.localStorage.setItem("AUTO_RELOAD", this.checked);
});

send_notification_end_of_battle.checked = bg.localStorage.getItem("toggle_send_notification_end_of_battle") == "true";
send_notification_end_of_battle.addEventListener("change", function () {
    bg.localStorage.setItem("SEND_NOTIFICATION_END_OF_BATTLE", this.checked);
});
