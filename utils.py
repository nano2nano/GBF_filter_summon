import random
import sys
import time

import win32api
import win32con
import win32gui


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


def press(VK):
    win32api.keybd_event(VK, 0, 0, 0)
    time.sleep(.05)
    win32api.keybd_event(VK, 0, win32con.KEYEVENTF_KEYUP, 0)


def get_handle():
    hWnd = win32gui.FindWindow(None, "グランブルーファンタジー - Google Chrome")
    if not hWnd:
        sys.exit(0)
    else:
        return hWnd
