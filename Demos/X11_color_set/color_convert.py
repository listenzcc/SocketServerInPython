# File: color_convert.py
# Aim: Convert colors between HSV and RGB space

import math


def hsv2rgb(h, s, v):
    # Convert color from hsv to rgb
    # Compute potential variables
    h = float(h)
    s = float(s)
    v = float(v)
    h60 = h / 60.0
    h60f = math.floor(h60)
    hi = int(h60f) % 6
    f = h60 - h60f
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)

    def _convert():
        # Convert dependency
        if hi == 0:
            return v, t, p
        if hi == 1:
            return q, v, p
        if hi == 2:
            return p, v, t
        if hi == 3:
            return p, q, v
        if hi == 4:
            return t, p, v
        if hi == 5:
            return v, p, q
        # This should never happen
        return 0, 0, 0

    # Compute r, g, b values
    r, g, b = _convert()

    # Normalize into 0-255 range in Int format
    r, g, b = int(r * 255), int(g * 255), int(b * 255)
    return r, g, b


def rgb2hsv(r, g, b):
    # Convert color from rgb to hsv
    r, g, b = r/255.0, g/255.0, b/255.0
    mx = max(r, g, b)
    mn = min(r, g, b)
    df = mx - mn

    def _convert():
        # Convert dependency
        # Compute h
        if mx == mn:
            h = 0
        elif mx == r:
            h = (60 * ((g-b)/df) + 360) % 360
        elif mx == g:
            h = (60 * ((b-r)/df) + 120) % 360
        elif mx == b:
            h = (60 * ((r-g)/df) + 240) % 360
        else:
            # This should never happen
            h = 0

        # Compute s
        if mx == 0:
            s = 0
        else:
            s = df/mx

        # Compute v
        v = mx

        return h, s, v

    # Compute h, s, v values
    h, s, v = _convert()

    return h, s, v
