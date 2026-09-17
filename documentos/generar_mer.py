# -*- coding: utf-8 -*-
"""
Genera el diagrama Modelo Entidad-Relacion (MER) de stockmobile_db
en formato PNG con notacion pata de gallo (crow's foot).
"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(BASE, "modelo_mer.png")

FONT_DIR = r"C:\Windows\Fonts"
F_TITULO = ImageFont.truetype(os.path.join(FONT_DIR, "segoeuib.ttf"), 40)
F_SUB = ImageFont.truetype(os.path.join(FONT_DIR, "segoeui.ttf"), 22)
F_ENT = ImageFont.truetype(os.path.join(FONT_DIR, "segoeuib.ttf"), 24)
F_CAMPO = ImageFont.truetype(os.path.join(FONT_DIR, "consola.ttf"), 20)
F_TIPO = ImageFont.truetype(os.path.join(FONT_DIR, "consola.ttf"), 18)
F_BADGE = ImageFont.truetype(os.path.join(FONT_DIR, "segoeuib.ttf"), 15)
F_CARD = ImageFont.truetype(os.path.join(FONT_DIR, "segoeuib.ttf"), 22)
F_LEG = ImageFont.truetype(os.path.join(FONT_DIR, "segoeui.ttf"), 19)

AZUL = (0x1F, 0x38, 0x64)
AZUL_CLARO = (0x2E, 0x75, 0xB6)
DORADO = (0xB8, 0x86, 0x0B)
VERDE = (0x2E, 0x9E, 0x5B)
GRIS_LINEA = (0x59, 0x59, 0x59)
GRIS_BORDE = (0xAE, 0xB6, 0xC2)
GRIS_TEXTO = (0x33, 0x33, 0x33)
FONDO_FILA = (0xF4, 0xF7, 0xFB)

W, H = 2280, 1440
BW = 380          # ancho de caja
HH = 48           # alto de cabecera
RH = 38           # alto de fila

# entidad -> (x, y, [ (nombre, tipo, 'PK'/'FK'/None) ])
ENTIDADES = {
    "roles": (100, 160, [
        ("id", "INT", "PK"), ("nombre", "VARCHAR(50)", None)]),
    "usuarios": (640, 160, [
        ("id", "INT", "PK"), ("nombre", "VARCHAR(100)", None),
        ("email", "VARCHAR(100)", None), ("password_hash", "VARCHAR(255)", None),
        ("rol_id", "INT", "FK")]),
    "movimientos": (1180, 160, [
        ("id", "INT", "PK"), ("tipo", "ENUM", None),
        ("bodega_id", "INT", "FK"), ("usuario_id", "INT", "FK"),
        ("fecha", "TIMESTAMP", None)]),
    "bodegas": (1720, 160, [
        ("id", "INT", "PK"), ("nombre_bodega", "VARCHAR(100)", None),
        ("ubicacion", "VARCHAR(150)", None)]),
    "categorias": (100, 580, [
        ("id", "INT", "PK"), ("nombre", "VARCHAR(100)", None)]),
    "productos": (640, 580, [
        ("id", "INT", "PK"), ("codigo_barras", "VARCHAR(50)", None),
        ("nombre", "VARCHAR(150)", None), ("costo_compra", "DECIMAL(10,2)", None),
        ("precio_venta", "DECIMAL(10,2)", None), ("stock_actual", "INT", None),
        ("stock_minimo", "INT", None), ("categoria_id", "INT", "FK"),
        ("proveedor_id", "INT", "FK")]),
    "detalle_movimiento": (1180, 580, [
        ("id", "INT", "PK"), ("movimiento_id", "INT", "FK"),
        ("producto_id", "INT", "FK"), ("cantidad", "INT", None),
        ("costo_unitario", "DECIMAL(10,2)", None)]),
    "proveedores": (640, 1100, [
        ("id", "INT", "PK"), ("ruc_cedula", "VARCHAR(13)", None),
        ("razon_social", "VARCHAR(150)", None), ("telefono", "VARCHAR(15)", None),
        ("direccion", "VARCHAR(200)", None)]),
}

# (padre, hijo)  -> relacion 1:N
RELACIONES = [
    ("roles", "usuarios"),
    ("usuarios", "movimientos"),
    ("bodegas", "movimientos"),
    ("categorias", "productos"),
    ("proveedores", "productos"),
    ("movimientos", "detalle_movimiento"),
    ("productos", "detalle_movimiento"),
]


def caja(x, y, campos):
    alto = HH + RH * len(campos)
    return {"x": x, "y": y, "w": BW, "h": alto}


def centro(b):
    return (b["x"] + b["w"] / 2.0, b["y"] + b["h"] / 2.0)


def borde(b, dx, dy):
    """Punto de interseccion del rayo (dx,dy) desde el centro con el borde."""
    cx, cy = centro(b)
    hw, hh = b["w"] / 2.0, b["h"] / 2.0
    t = None
    if dx != 0:
        t = hw / abs(dx)
    if dy != 0:
        ty = hh / abs(dy)
        t = ty if t is None else min(t, ty)
    return (cx + dx * t, cy + dy * t)


def normaliza(dx, dy):
    m = (dx * dx + dy * dy) ** 0.5
    if m == 0:
        return 0, 0
    return dx / m, dy / m


def dibuja_pata_gallo(d, punto, ux, uy, color=GRIS_LINEA):
    """Pata de gallo abierta hacia la entidad, en `punto` (direccion ux,uy)."""
    gap, spread = 26, 13
    bx, by = punto[0] - ux * gap, punto[1] - uy * gap
    px, py = -uy, ux
    for off in (spread, 0, -spread):
        d.line([(bx, by),
                (punto[0] + px * off, punto[1] + py * off)], fill=color, width=3)


def dibuja_uno(d, punto, ux, uy, color=GRIS_LINEA):
    """Marca del extremo 'uno': barra perpendicular."""
    gap, largo = 26, 15
    bx, by = punto[0] - ux * gap, punto[1] - uy * gap
    px, py = -uy, ux
    d.line([(bx + px * largo, by + py * largo),
            (bx - px * largo, by - py * largo)], fill=color, width=3)


def etiqueta(d, texto, x, y, color=GRIS_TEXTO):
    tw = d.textlength(texto, font=F_CARD)
    d.text((x - tw / 2.0, y - 14), texto, font=F_CARD, fill=color)


def dibuja_entidad(d, nombre, x, y, campos):
    b = caja(x, y, campos)
    # sombra
    d.rounded_rectangle([x + 4, y + 4, x + BW + 4, y + b["h"] + 4],
                        radius=10, fill=(0xDD, 0xE3, 0xEC))
    # cuerpo
    d.rounded_rectangle([x, y, x + BW, y + b["h"]], radius=10,
                        fill=(0xFF, 0xFF, 0xFF), outline=AZUL, width=3)
    # cabecera
    d.rounded_rectangle([x, y, x + BW, y + HH], radius=10, fill=AZUL)
    d.rectangle([x, y + HH - 12, x + BW, y + HH], fill=AZUL)
    tw = d.textlength(nombre.upper(), font=F_ENT)
    d.text((x + BW / 2.0 - tw / 2.0, y + 11), nombre.upper(),
           font=F_ENT, fill=(0xFF, 0xFF, 0xFF))
    # campos
    for i, (campo, tipo, llave) in enumerate(campos):
        fy = y + HH + i * RH
        if i % 2 == 1:
            d.rectangle([x + 2, fy, x + BW - 2, fy + RH], fill=FONDO_FILA)
        d.line([(x + 1, fy), (x + BW - 1, fy)], fill=(0xE2, 0xE8, 0xF0), width=1)
        tx = x + 16
        if llave:
            col = DORADO if llave == "PK" else AZUL_CLARO
            bw = d.textlength(llave, font=F_BADGE) + 14
            d.rounded_rectangle([x + 12, fy + 9, x + 12 + bw, fy + RH - 9],
                                radius=6, fill=col)
            d.text((x + 19, fy + 11), llave, font=F_BADGE, fill=(0xFF, 0xFF, 0xFF))
            tx = x + 12 + bw + 10
        d.text((tx, fy + 9), campo, font=F_CAMPO, fill=GRIS_TEXTO)
        if tipo:
            tw = d.textlength(tipo, font=F_TIPO)
            d.text((x + BW - 14 - tw, fy + 11), tipo, font=F_TIPO,
                   fill=(0x7F, 0x7F, 0x7F))
    return b


img = Image.new("RGB", (W, H), (0xFF, 0xFF, 0xFF))
d = ImageDraw.Draw(img)

# Marco
d.rectangle([12, 12, W - 12, H - 12], outline=AZUL, width=3)

# Titulo
d.text((48, 34), "Modelo Entidad-Relacion (MER)", font=F_TITULO, fill=AZUL)
d.text((50, 84), "Base de datos: stockmobile_db  |  Notacion pata de gallo  |  Sistema StockMobile",
       font=F_SUB, fill=GRIS_LINEA)

boxes = {}
for nombre, (x, y, campos) in ENTIDADES.items():
    boxes[nombre] = dibuja_entidad(d, nombre, x, y, campos)

# Relaciones
for padre, hijo in RELACIONES:
    bp, bh = boxes[padre], boxes[hijo]
    cxp, cyp = centro(bp)
    cxh, cyh = centro(bh)
    ux, uy = normaliza(cxh - cxp, cyh - cyp)
    e_padre = borde(bp, ux, uy)
    e_hijo = borde(bh, -ux, -uy)
    d.line([e_padre, e_hijo], fill=GRIS_LINEA, width=3)
    dibuja_uno(d, e_padre, ux, uy)
    dibuja_pata_gallo(d, e_hijo, ux, uy)
    px, py = -uy, ux
    mx, my = (e_padre[0] + e_hijo[0]) / 2.0, (e_padre[1] + e_hijo[1]) / 2.0
    etiqueta(d, "1", e_padre[0] + ux * 40 + px * 20,
             e_padre[1] + uy * 40 + py * 20, AZUL)
    etiqueta(d, "N", e_hijo[0] - ux * 46 + px * 20,
             e_hijo[1] - uy * 46 + py * 20, VERDE)

# Leyenda
ly = H - 62
d.rounded_rectangle([48, ly - 12, W - 48, ly + 40], radius=8,
                    fill=(0xF4, 0xF7, 0xFB), outline=GRIS_BORDE, width=2)
d.rounded_rectangle([72, ly + 2, 72 + 46, ly + 26], radius=5, fill=DORADO)
d.text((79, ly + 5), "PK", font=F_BADGE, fill=(0xFF, 0xFF, 0xFF))
d.text((128, ly + 5), "Llave primaria", font=F_LEG, fill=GRIS_TEXTO)
d.rounded_rectangle([300, ly + 2, 300 + 46, ly + 26], radius=5, fill=AZUL_CLARO)
d.text((307, ly + 5), "FK", font=F_BADGE, fill=(0xFF, 0xFF, 0xFF))
d.text((356, ly + 5), "Llave foranea", font=F_LEG, fill=GRIS_TEXTO)
d.line([(560, ly + 14), (620, ly + 14)], fill=GRIS_LINEA, width=3)
d.line([(560, ly + 4), (560, ly + 24)], fill=GRIS_LINEA, width=3)
d.text((632, ly + 5), "1  :  N    Relacion uno a muchos", font=F_LEG, fill=GRIS_TEXTO)
d.text((1080, ly + 5), "Elaborado con el esquema real de database/stockmobile_db.sql",
       font=F_LEG, fill=(0x7F, 0x7F, 0x7F))

img.save(SALIDA, "PNG")
print("MER generado:", SALIDA, img.size)
