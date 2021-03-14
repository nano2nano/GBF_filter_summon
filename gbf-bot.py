import random
import winsound

import nativemessaging
import win32gui

from utils import get_handle, moveAndClick, press

message = nativemessaging.get_message()
if message["tag"] == "test":
    # win32api.SetCursorPos((200, 200))
    pass
elif message["tag"] == "click":
    hWnd = get_handle()
    win32gui.SetForegroundWindow(hWnd)
    inner_height = message["innerHeight"]
    inner_width = message["innerWidth"]

    chrome_rect = win32gui.GetWindowRect(hWnd)
    outer_width = chrome_rect[2] - chrome_rect[0]
    outer_height = chrome_rect[3] - chrome_rect[1]
    inner_height = outer_height - (outer_height - inner_height)
    inner_width = outer_width - (outer_width - inner_width)

    add_y = chrome_rect[1] + (outer_height - inner_height)
    add_x = chrome_rect[0] + (outer_width - inner_width)

    x = message["x"] + add_x
    y = message["y"] + add_y
    height = message["height"]
    width = message["width"]
    small_x = (width * 0.8)/2
    small_y = (height * 0.8)/2
    width -= small_x
    height -= small_y
    x += random.randint(int(small_x), int(width))
    y += random.randint(int(small_y), int(height))
    moveAndClick(x, y)
elif message["tag"] == "press_key":
    key_code = message["key_code"]
    press(key_code)
else:
    winsound.Beep(2000, 1000)
