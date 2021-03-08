import json
import random
import struct
import sys
import time
import winsound

import nativemessaging
import win32api
import win32gui


def get_handle():
    hWnd = win32gui.FindWindow(None, "グランブルーファンタジー - Google Chrome")
    if not hWnd:
        sys.exit(0)
    else:
        return hWnd


def moveTo(x, y):
    FPS = 50
    current_x, current_y = win32api.GetCursorPos()
    diff_x = abs(current_x - x)
    diff_y = abs(current_y - y)
    move_x = diff_x / FPS
    move_y = diff_y / FPS
    if current_x > x:
        move_x *= -1
    if current_y > y:
        move_y *= -1
    target_x = current_x
    target_y = current_y
    move_x *= 2
    move_y *= 2

    for _ in range(int(FPS/2)):
        target_x += move_x
        target_y += move_y
        if random.random() > 0.8:
            win32api.SetCursorPos((int(target_x)+1, int(target_y)+1))
        else:
            win32api.SetCursorPos((int(target_x), int(target_y)))
        time.sleep(1/FPS)
    win32api.SetCursorPos((int(x), int(y)))


def moveAndClick(x, y):
    moveTo(x, y)
    win32api.mouse_event(2, 0, 0, 0, 0)
    win32api.mouse_event(4, 0, 0, 0, 0)


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
else:
    winsound.Beep(2000, 1000)
