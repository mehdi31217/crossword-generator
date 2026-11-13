import numpy as np

def corners_alpha(shape, box, radii, ss=4):
    """box=(x0,x1,y0,y1) float edges; radii=(r_tl,r_tr,r_bl,r_br)."""
    H, W = shape[:2]
    x0, x1, y0, y1 = box
    rtl, rtr, rbl, rbr = radii
    a = np.zeros((H, W), np.float32)
    ys = max(0, int(y0) - 2); ye = min(H, int(y1) + 3)
    xs = max(0, int(x0) - 2); xe = min(W, int(x1) + 3)
    yy, xx = np.mgrid[ys:ye, xs:xe].astype(np.float32)
    acc = np.zeros(yy.shape, np.float32)
    corners = (
        (x0 + rtl, y0 + rtl, rtl, 'tl'),
        (x1 - rtr, y0 + rtr, rtr, 'tr'),
        (x0 + rbl, y1 - rbl, rbl, 'bl'),
        (x1 - rbr, y1 - rbr, rbr, 'br'),
    )
    for i in range(ss):
        for j in range(ss):
            py = yy + (i + 0.5) / ss - 0.5
            px = xx + (j + 0.5) / ss - 0.5
            m = (px >= x0) & (px <= x1) & (py >= y0) & (py <= y1)
            for (rcx, rcy, r, tag) in corners:
                if r <= 0:
                    continue
                qx = (px <= rcx) if tag in ('tl', 'bl') else (px >= rcx)
                qy = (py <= rcy) if tag in ('tl', 'tr') else (py >= rcy)
                ok = ((px - rcx) ** 2 + (py - rcy) ** 2) <= r * r
                m = m & (~(qx & qy) | ok)
            acc += m
    a[ys:ye, xs:xe] = acc / (ss * ss)
    return a
