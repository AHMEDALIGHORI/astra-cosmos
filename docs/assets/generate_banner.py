"""Generate original, deterministic ASTRA documentation artwork with Pillow."""
from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
WIDTH, HEIGHT = 960, 320
FRAMES = 56
VOID, BONE, GOLD, ASH = (5, 5, 7), (237, 235, 229), (217, 183, 126), (183, 181, 174)
FONT = ROOT / "src/assets/InstrumentSerif-Regular.ttf"


def display(size):
    return ImageFont.truetype(str(FONT), size)


def tracked(draw, text, xy, font, fill, spacing):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        x += draw.textlength(char, font=font) + spacing


def orbit(angle, radius, tilt=-.4, flatten=.62):
    x, y = math.cos(angle) * radius, math.sin(angle) * radius * flatten
    return (750 + x * math.cos(tilt) - y * math.sin(tilt),
            160 + x * math.sin(tilt) + y * math.cos(tilt))


def main():
    rng = random.Random(1987)
    stars = [(rng.randrange(18, WIDTH - 18), rng.randrange(18, HEIGHT - 18),
              rng.uniform(.4, 1.3), rng.uniform(0, math.tau)) for _ in range(100)]
    base = Image.new("RGB", (WIDTH, HEIGHT), VOID)
    pixels = base.load()
    for y in range(HEIGHT):
        for x in range(510, WIDTH):
            glow = math.exp(-((x - 750) ** 2 + (y - 160) ** 2) / 7500)
            pixels[x, y] = tuple(int(c + glow * g) for c, g in zip(VOID, (23, 16, 7)))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((0, 0, WIDTH - 1, HEIGHT - 1), radius=16, outline=(39, 39, 46))
    for x, y, radius, phase in stars:
        if x < 500 and 80 < y < 245:
            continue
        brightness = int(65 + (math.sin(phase) * .5 + .5) * 65)
        draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=(brightness, brightness, brightness+8))
    tracked(draw, "AN INTERACTIVE COSMIC JOURNEY", (52, 48), display(13), GOLD, 2.5)
    tracked(draw, "ASTRA", (48, 76), display(96), BONE, 12)
    draw.line((52, 198, 382, 198), fill=(105, 87, 61))
    draw.text((52, 216), "Your Journey Through the Cosmos", font=display(25), fill=ASH)
    tracked(draw, "ONE WORLD / ONE CAMERA / YOUR STORY", (52, 268), display(12), (123, 122, 120), 1.4)
    for radius in (66, 108, 145):
        line = [orbit(i / 240 * math.tau, radius) for i in range(241)]
        draw.line(line, fill=(70, 62, 49), width=1)
    frames = []
    for frame in range(FRAMES):
        image = base.copy()
        draw = ImageDraw.Draw(image)
        t = frame / FRAMES * math.tau
        for radius in range(24, 0, -1):
            glow = math.exp(-radius * radius / 70) * (.85 + .15 * math.sin(t))
            color = tuple(int(a + (b-a)*glow) for a, b in zip((28, 21, 14), (255, 246, 230)))
            draw.ellipse((750-radius, 160-radius, 750+radius, 160+radius), fill=color)
        draw.ellipse((744, 154, 756, 166), fill=(255, 246, 230))
        for angle, radius, color, size in ((t, 108, (159, 211, 222), 4),
                                          (-t + 2, 66, BONE, 3),
                                          (t + 3.8, 145, GOLD, 2)):
            x, y = orbit(angle, radius)
            draw.ellipse((x-size-3, y-size-3, x+size+3, y+size+3), fill=tuple(int(c*.25) for c in color))
            draw.ellipse((x-size, y-size, x+size, y+size), fill=color)
        frames.append(image)
    frames[0].save(HERE / "astra-banner.png", optimize=True)
    palette = frames[0].quantize(colors=128)
    frames = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    frames[0].save(HERE / "astra-banner.gif", save_all=True, append_images=frames[1:],
                   duration=80, loop=0, disposal=1, optimize=True)
    print(f"Created {FRAMES}-frame GIF and still PNG in {HERE}")


if __name__ == "__main__":
    main()
