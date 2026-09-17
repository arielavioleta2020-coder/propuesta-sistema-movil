# -*- coding: utf-8 -*-
"""
Genera el informe del proyecto StockMobile en formato Word (.docx).
Incluye estructura completa, tablas, diccionario de datos y marcadores
para insertar las capturas de pantalla tomadas por el estudiante.
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(BASE, "logo_stockmobile.png")
MER_IMG = os.path.join(BASE, "modelo_mer.png")
SALIDA = os.path.join(BASE, "Informe_StockMobile.docx")

AZUL = RGBColor(0x1F, 0x38, 0x64)
GRIS = RGBColor(0x59, 0x59, 0x59)


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def set_cell_bg(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def add_border(paragraph, color="808080"):
    pPr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement("w:" + edge)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "6")
        el.set(qn("w:space"), "6")
        el.set(qn("w:color"), color)
        borders.append(el)
    pPr.append(borders)


def shade_paragraph(paragraph, hex_color):
    pPr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    pPr.append(shd)


def add_toc(doc):
    p = doc.add_paragraph()
    run = p.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = r'TOC \o "1-3" \h \z \u'
    sep = OxmlElement("w:fldChar")
    sep.set(qn("w:fldCharType"), "separate")
    txt = OxmlElement("w:t")
    txt.text = "Haga clic derecho > Actualizar campo para generar el indice."
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    for el in (begin, instr, sep, txt, end):
        run._r.append(el)


def add_page_number_footer(doc):
    for section in doc.sections:
        footer = section.footer
        p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run("StockMobile - Informe de proyecto  |  Pagina ")
        run.font.size = Pt(8)
        run.font.color.rgb = GRIS
        run2 = p.add_run()
        f1 = OxmlElement("w:fldChar")
        f1.set(qn("w:fldCharType"), "begin")
        it = OxmlElement("w:instrText")
        it.set(qn("xml:space"), "preserve")
        it.text = "PAGE"
        f2 = OxmlElement("w:fldChar")
        f2.set(qn("w:fldCharType"), "end")
        run2._r.append(f1)
        run2._r.append(it)
        run2._r.append(f2)
        run2.font.size = Pt(8)
        run2.font.color.rgb = GRIS


def h(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for r in p.runs:
        r.font.color.rgb = AZUL
        r.font.name = "Calibri"
    return p


def par(doc, text, bold=False, italic=False, size=11, align=None, color=None):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    r.font.size = Pt(size)
    if color is not None:
        r.font.color.rgb = color
    return p


def bullets(doc, items):
    for it in items:
        p = doc.add_paragraph(style="List Bullet")
        p.add_run(it)


def caption(doc, numero, titulo):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Figura %s. %s" % (numero, titulo))
    r.italic = True
    r.font.size = Pt(9)
    r.font.color.rgb = GRIS
    return p


def figure(doc, numero, titulo, indicacion):
    """Marcador visual donde el estudiante pega su captura de pantalla."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("\n\n[ INSERTE AQUI LA CAPTURA: %s ]\n\n" % indicacion)
    r.font.size = Pt(10)
    r.font.color.rgb = GRIS
    add_border(p)
    shade_paragraph(p, "F2F2F2")
    caption(doc, numero, titulo)


def table(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = 1
    hdr = t.rows[0].cells
    for i, name in enumerate(headers):
        hdr[i].text = ""
        run = hdr[i].paragraphs[0].add_run(name)
        run.bold = True
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        set_cell_bg(hdr[i], "1F3864")
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(str(val))
            run.font.size = Pt(9.5)
    if widths:
        for row in t.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Cm(w)
    return t


def figure_image(doc, numero, titulo, path, indicacion="", width_cm=16.0):
    """Inserta una imagen real si existe; si no, deja el marcador."""
    if os.path.exists(path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(path, width=Cm(width_cm))
        caption(doc, numero, titulo)
    else:
        figure(doc, numero, titulo, indicacion)


# ---------------------------------------------------------------------------
# Documento
# ---------------------------------------------------------------------------
doc = Document()

style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(11)
style.paragraph_format.space_after = Pt(6)
style.paragraph_format.line_spacing = 1.15

for name, size in (("Heading 1", 16), ("Heading 2", 13), ("Heading 3", 11.5)):
    st = doc.styles[name]
    st.font.name = "Calibri"
    st.font.size = Pt(size)
    st.font.color.rgb = AZUL

section = doc.sections[0]
section.top_margin = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin = Cm(2.5)
section.right_margin = Cm(2.5)

# ------------------------- PORTADA -------------------------
par(doc, "[NOMBRE DE LA INSTITUCION EDUCATIVA]", bold=True, size=14,
    align=WD_ALIGN_PARAGRAPH.CENTER)
par(doc, "[Facultad / Carrera]", size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
par(doc, "[Asignatura]", size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()

if os.path.exists(LOGO):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(LOGO, width=Cm(7))

par(doc, "SISTEMA STOCKMOBILE", bold=True, size=26,
    align=WD_ALIGN_PARAGRAPH.CENTER, color=AZUL)
par(doc, "Sistema de gestion de inventarios para Pymes",
    size=14, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()
par(doc, "Trabajo de investigacion y desarrollo de aplicacion movil",
    size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()
doc.add_paragraph()

par(doc, "Autor(a): [NOMBRE COMPLETO DEL ESTUDIANTE]", size=12,
    align=WD_ALIGN_PARAGRAPH.CENTER)
par(doc, "Docente: [NOMBRE DEL DOCENTE]", size=12,
    align=WD_ALIGN_PARAGRAPH.CENTER)
par(doc, "Periodo academico: [PERIODO / FECHA]", size=12,
    align=WD_ALIGN_PARAGRAPH.CENTER)

doc.add_page_break()

# ------------------------- INDICE -------------------------
h(doc, "Indice de contenido", level=1)
add_toc(doc)
doc.add_page_break()

# ------------------------- 1. TEMA -------------------------
h(doc, "1. Tema", level=1)
par(doc, "Desarrollo de una aplicacion movil para la gestion de inventarios "
         "orientada a pequenas y medianas empresas (Pymes) de la ciudad de Quito, "
         "mediante una arquitectura cliente-servidor.")
par(doc, "El proyecto se denomina StockMobile y permite controlar las existencias "
         "de productos, registrar entradas y salidas de mercaderia, emitir alertas "
         "de reposicion y consultar informacion en tiempo real a traves de un "
         "dispositivo movil Android.")

# ------------------------- 2. LOGO -------------------------
h(doc, "2. Logo", level=1)
par(doc, "El logotipo de StockMobile representa la identidad visual del sistema. "
         "Se compone del isotipo «SM» (iniciales de StockMobile) integrado con un "
         "cubo de almacenamiento y una flecha de movimiento, en tonos azul "
         "corporativo que transmiten tecnologia, orden y confianza.")
if os.path.exists(LOGO):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(LOGO, width=Cm(6))
    caption(doc, 1, "Logotipo oficial de StockMobile.")
else:
    figure(doc, 1, "Logotipo oficial de StockMobile.",
           "inserte el logo (documentos/logo_stockmobile.png)")
par(doc, "Paleta de color utilizada:", bold=True)
bullets(doc, [
    "Azul corporativo (#1F3864): confianza, seguridad y tecnologia.",
    "Celeste de acento (#2E75B6): elementos interactivos y botones.",
    "Verde (#2E9E5B): confirmaciones y alertas positivas.",
    "Rojo (#C0392B): errores, validaciones y advertencias de stock.",
    "Gris (#595959): textos secundarios e informacion de apoyo.",
])

# ------------------------- 3. DESCRIPCION -------------------------
h(doc, "3. Descripcion del proyecto", level=1)

h(doc, "3.1. Planteamiento del problema", level=2)
par(doc, "Muchas Pymes de la ciudad de Quito administran su inventario de forma "
         "manual (libretas u hojas de calculo), lo que provoca tres problemas "
         "recurrentes: desactualizacion del stock real, desconocimiento de los "
         "productos que requieren reposicion y perdida de informacion al no existir "
         "un registro centralizado de los movimientos. Esta situacion genera "
         "perdidas economicas y una atencion deficiente al cliente.")

h(doc, "3.2. Objetivos", level=2)
par(doc, "Objetivo general", bold=True)
par(doc, "Desarrollar una aplicacion movil que automatice el control de inventarios "
         "de una Pyme, conectando un dispositivo Android con una API REST y una base "
         "de datos relacional para mantener la informacion centralizada y en tiempo real.")
par(doc, "Objetivos especificos", bold=True)
bullets(doc, [
    "Disenar e implementar una base de datos relacional normalizada en MySQL.",
    "Construir una API RESTful con autenticacion por token (JWT) y control de roles.",
    "Desarrollar una interfaz movil nativa en React Native + Expo con los modulos "
    "de inventario, movimientos, alertas y registro de productos.",
    "Implementar la lectura de codigos de barras con la camara del dispositivo.",
    "Verificar el funcionamiento del sistema mediante pruebas de integracion y "
    "pruebas manuales de usabilidad.",
])

h(doc, "3.3. Alcance", level=2)
bullets(doc, [
    "Gestion de catalogo de productos (codigo de barras, nombre, costo, precio, "
    "stock actual, stock minimo, categoria y proveedor).",
    "Registro de movimientos de ENTRADA y SALIDA con actualizacion automatica del stock.",
    "Alertas de reposicion cuando las existencias alcanzan el stock minimo.",
    "Control de acceso con dos roles: Administrador y Bodeguero.",
    "El sistema no contempla facturacion electronica ni integracion contable.",
])

h(doc, "3.4. Metodologia", level=2)
par(doc, "El desarrollo siguio un modelo incremental por iteraciones: en primer lugar "
         "se levanto el modelo entidad-relacion; posteriormente se construyo el "
         "Back-End y se verifico con pruebas automatizadas; finalmente se desarrollo "
         "el Front-End movil y se integraron los tres componentes. Cada iteracion "
         "concluyo con pruebas funcionales sobre el emulador Android.")

# ------------------------- 4. HARDWARE / SOFTWARE -------------------------
h(doc, "4. Requerimientos de hardware y software", level=1)

h(doc, "4.1. Hardware", level=2)
table(doc,
      ["Componente", "Requerimiento minimo", "Recomendado"],
      [
          ["Procesador", "Intel Core i3 8.a gen / AMD Ryzen 3", "Intel Core i5 o superior"],
          ["Memoria RAM", "8 GB", "16 GB"],
          ["Almacenamiento", "10 GB libres", "SSD 20 GB libres"],
          ["Dispositivo movil", "Android 10 con camara", "Android 12+ con camara"],
          ["Conectividad", "Wi-Fi / tarjeta de red", "Wi-Fi estable (misma red LAN)"],
          ["Pantalla", "1366 x 768", "1920 x 1080"],
      ],
      widths=[3.5, 6.0, 6.0])
doc.add_paragraph()

h(doc, "4.2. Software", level=2)
table(doc,
      ["Software", "Version / detalles", "Uso en el proyecto"],
      [
          ["Windows", "10 / 11 (64 bits)", "Sistema operativo de desarrollo"],
          ["Node.js", "v20 o superior", "Ejecucion del Back-End (Express)"],
          ["npm", "10 o superior", "Gestion de dependencias"],
          ["XAMPP", "MariaDB 10.4 / MySQL", "Servidor de base de datos y phpMyAdmin"],
          ["Visual Studio Code", "Ultima version", "Editor de codigo"],
          ["Android Studio", "Emulador Pixel_7 (Android 14+)", "Dispositivo virtual de pruebas"],
          ["Expo GO", "SDK 57", "Contenedor de la app en el dispositivo"],
          ["Git / GitHub", "2.x", "Control de versiones del proyecto"],
      ],
      widths=[4.5, 5.5, 5.5])
doc.add_paragraph()
figure(doc, 2, "Entorno de desarrollo (Visual Studio Code, XAMPP y emulador).",
       "captura del escritorio con VS Code, XAMPP y el emulador abiertos")

# ------------------------- 5. MODELO ENTIDAD-RELACION -------------------------
h(doc, "5. Modelo entidad-relacion (ME-R)", level=1)
par(doc, "La base de datos se denomina stockmobile_db y esta compuesta por ocho "
         "tablas relacionadas que garantizan la integridad referencial mediante "
         "claves foraneas. El modelo separa la informacion maestra (categorias, "
         "proveedores, bodegas), la informacion operativa (productos, movimientos) "
         "y la informacion de seguridad (roles, usuarios).")

h(doc, "5.1. Descripcion de entidades y relaciones", level=2)
bullets(doc, [
    "Un rol tiene muchos usuarios; cada usuario pertenece a un unico rol (1:N).",
    "Una categoria agrupa muchos productos; cada producto tiene una sola categoria (1:N).",
    "Un proveedor abastece muchos productos; cada producto tiene un solo proveedor (1:N).",
    "Un usuario y una bodega participan en muchos movimientos (1:N cada uno).",
    "Un movimiento contiene uno o varios detalles; cada detalle se refiere a un "
    "producto (1:N).",
])
par(doc, "Regla de negocio central: al registrar un movimiento se actualiza de forma "
         "transaccional el stock_actual del producto (suma en ENTRADA, resta en "
         "SALIDA), validando que exista stock suficiente antes de confirmar la salida.")

par(doc, "En la Figura 3 se presenta el diagrama entidad-relacion con la notacion "
         "pata de gallo (crow's foot), donde cada llave primaria se resalta en color "
         "dorado y cada llave foranea en color azul.", italic=True)

figure_image(doc, 3, "Diagrama del modelo entidad-relacion de stockmobile_db "
             "con notacion pata de gallo.", MER_IMG,
             "diagrama MER (generado con el esquema real de la base de datos)")

h(doc, "5.2. Diccionario de datos", level=2)

tablas = [
    ("Tabla roles", "Almacena los perfiles de acceso del sistema.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador del rol"],
      ["nombre", "VARCHAR(50)", "NOT NULL", "Administrador / Bodeguero"]]),
    ("Tabla usuarios", "Usuarios que acceden a la aplicacion.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador del usuario"],
      ["nombre", "VARCHAR(100)", "NOT NULL", "Nombre completo"],
      ["email", "VARCHAR(100)", "UNIQUE, NOT NULL", "Correo de acceso"],
      ["password_hash", "VARCHAR(255)", "NOT NULL", "Contrasena cifrada (bcrypt)"],
      ["rol_id", "INT", "FK -> roles(id)", "Rol asignado"]]),
    ("Tabla categorias", "Clasificacion de los productos.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador de la categoria"],
      ["nombre", "VARCHAR(100)", "NOT NULL", "Nombre de la categoria"]]),
    ("Tabla proveedores", "Empresas o personas que abastecen los productos.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador del proveedor"],
      ["ruc_cedula", "VARCHAR(13)", "UNIQUE, NOT NULL", "RUC o cedula"],
      ["razon_social", "VARCHAR(150)", "NOT NULL", "Nombre legal"],
      ["telefono", "VARCHAR(15)", "NULL", "Telefono de contacto"],
      ["direccion", "VARCHAR(200)", "NULL", "Direccion"]]),
    ("Tabla bodegas", "Ubicaciones fisicas donde se almacena el inventario.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador de la bodega"],
      ["nombre_bodega", "VARCHAR(100)", "NOT NULL", "Nombre de la bodega"],
      ["ubicacion", "VARCHAR(150)", "NOT NULL", "Direccion o sede"]]),
    ("Tabla productos", "Catalogo maestro del inventario.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador del producto"],
      ["codigo_barras", "VARCHAR(50)", "UNIQUE, NOT NULL", "Codigo para escaneo"],
      ["nombre", "VARCHAR(150)", "NOT NULL", "Nombre del producto"],
      ["costo_compra", "DECIMAL(10,2)", "NOT NULL", "Costo de adquisicion"],
      ["precio_venta", "DECIMAL(10,2)", "NOT NULL", "Precio de venta al publico"],
      ["stock_actual", "INT", "DEFAULT 0", "Existencias disponibles"],
      ["stock_minimo", "INT", "DEFAULT 5", "Umbral para alerta de reposicion"],
      ["categoria_id", "INT", "FK -> categorias(id)", "Categoria"],
      ["proveedor_id", "INT", "FK -> proveedores(id)", "Proveedor"]]),
    ("Tabla movimientos", "Cabecera de las transacciones de inventario.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador del movimiento"],
      ["tipo", "ENUM", "ENTRADA / SALIDA", "Naturaleza del movimiento"],
      ["bodega_id", "INT", "FK -> bodegas(id)", "Bodega afectada"],
      ["usuario_id", "INT", "FK -> usuarios(id)", "Responsable del registro"],
      ["fecha", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Fecha y hora"]]),
    ("Tabla detalle_movimiento", "Detalle de productos de cada movimiento.",
     ["Campo", "Tipo", "Restriccion", "Descripcion"],
     [["id", "INT", "PK, AUTO_INCREMENT", "Identificador del detalle"],
      ["movimiento_id", "INT", "FK -> movimientos(id)", "Movimiento al que pertenece"],
      ["producto_id", "INT", "FK -> productos(id)", "Producto afectado"],
      ["cantidad", "INT", "NOT NULL", "Unidades movilizadas"],
      ["costo_unitario", "DECIMAL(10,2)", "NOT NULL", "Costo al momento del movimiento"]]),
]

for nombre, desc, headers, rows in tablas:
    h(doc, nombre, level=3)
    par(doc, desc, italic=True, size=10)
    table(doc, headers, rows, widths=[3.2, 3.2, 4.5, 4.8])
    doc.add_paragraph()

# ------------------------- 6. FRONT-END -------------------------
h(doc, "6. Front-End: aplicacion movil", level=1)
par(doc, "La interfaz fue desarrollada con React Native y Expo (SDK 57), lo que "
         "permite ejecutar la aplicacion en dispositivos Android mediante Expo GO "
         "sin necesidad de compilar un APK en cada prueba.")

h(doc, "6.1. Tecnologias del Front-End", level=2)
table(doc,
      ["Tecnologia", "Version", "Funcion"],
      [
          ["React Native", "0.86.3", "Componentes nativos moviles"],
          ["Expo", "~57.0.23", "Entorno y herramientas de desarrollo"],
          ["Expo Camera", "~57.0.5", "Lectura de codigos de barras"],
          ["AsyncStorage", "2.2.0", "Persistencia local del token de sesion"],
          ["Fetch API", "nativa", "Consumo de los servicios REST"],
      ],
      widths=[4.5, 4.0, 7.0])
doc.add_paragraph()

h(doc, "6.2. Estructura del Front-End", level=2)
par(doc, "El proyecto movil se organiza de la siguiente manera:")
bullets(doc, [
    "App.js: punto de entrada y navegacion entre Login y Panel Principal.",
    "src/config.js: URL de la API (deteccion automatica de la IP) y paleta de colores.",
    "src/api.js: cliente centralizado de peticiones HTTP.",
    "src/components/SMLogo.js: isotipo «SM» reutilizable.",
    "src/screens/: pantallas Login, PanelPrincipal, Home, Movimientos, Alertas, "
    "NuevoProducto y Scanner.",
])
figure(doc, 4, "Estructura de carpetas del Front-End en Visual Studio Code.",
       "captura del explorador de archivos de VS Code con la carpeta mobile")

h(doc, "6.3. Modulos de la interfaz", level=2)
par(doc, "La aplicacion presenta una cabecera con el logotipo, el nombre del sistema "
         "y el rol del usuario, ademas de una barra inferior con cuatro pestanas:", bold=True)
bullets(doc, [
    "Inventario: busqueda manual o por escaner, visor de alertas y catalogo en tiempo real.",
    "Movimientos: registro de entradas y salidas con actualizacion inmediata del stock.",
    "Alertas: listado de productos cuyo stock es igual o inferior al stock minimo.",
    "Nuevo: formulario de alta de productos habilitado unicamente para el Administrador.",
])

h(doc, "6.4. Evidencias de la interfaz", level=2)
figure(doc, 5, "Pantalla de inicio de sesion de StockMobile.",
       "pantalla de Login con las credenciales de demostracion")
figure(doc, 6, "Panel principal con el catalogo de inventario.",
       "pantalla de Inventario mostrando la lista de productos y su stock")
figure(doc, 7, "Busqueda de producto con alerta de confirmacion (tarjeta verde).",
       "resultado exitoso al escanear o buscar un codigo registrado")
figure(doc, 8, "Validacion de producto no registrado (tarjeta roja).",
       "resultado de error al buscar un codigo inexistente")
figure(doc, 9, "Registro de un movimiento de entrada o salida.",
       "pantalla de Movimientos con el formulario completo")
figure(doc, 10, "Confirmacion del movimiento y nuevo stock actualizado.",
       "tarjeta verde posterior a registrar el movimiento")
figure(doc, 11, "Pantalla de alertas de reposicion.",
       "pestana Alertas con los productos de stock bajo")
figure(doc, 12, "Formulario de registro de un nuevo producto.",
       "pantalla Nuevo con el formulario de alta")

# ------------------------- 7. BACK-END -------------------------
h(doc, "7. Back-End: API RESTful", level=1)
par(doc, "El Back-End es un servicio RESTful desarrollado en Node.js con el framework "
         "Express. Se conecta a MySQL mediante el driver mysql2 (pool de conexiones "
         "con caracteres utf8mb4) y protege los recursos con autenticacion JWT y "
         "control de acceso basado en roles (RBAC).")

h(doc, "7.1. Tecnologias del Back-End", level=2)
table(doc,
      ["Tecnologia", "Version", "Funcion"],
      [
          ["Node.js", "v20.x", "Entorno de ejecucion del servidor"],
          ["Express", "^4.19.2", "Framework HTTP y enrutamiento"],
          ["mysql2", "^3.11.0", "Driver de conexion a MySQL"],
          ["jsonwebtoken", "^9.0.2", "Generacion y validacion de tokens JWT"],
          ["bcryptjs", "^2.4.3", "Cifrado de contrasenas"],
          ["cors", "^2.8.5", "Habilitacion de peticiones cruzadas"],
          ["dotenv", "^16.4.5", "Variables de entorno"],
      ],
      widths=[4.5, 4.0, 7.0])
doc.add_paragraph()

h(doc, "7.2. Arquitectura en capas", level=2)
bullets(doc, [
    "routes/: define los endpooints HTTP y los asigna a los controladores.",
    "controllers/: contiene la logica de negocio de cada recurso.",
    "middleware/auth.js: valida el token JWT y restringe el acceso por rol.",
    "config/db.js: administra el pool de conexiones a MySQL.",
    "app.js: configura Express (CORS, JSON, rutas) y server.js inicia el servidor en 0.0.0.0:3000.",
])
figure(doc, 13, "Arquitectura cliente-servidor del sistema StockMobile.",
       "diagrama de arquitectura (app movil -> API REST -> MySQL)")
figure(doc, 14, "Estructura de carpetas del Back-End.",
       "captura del explorador de VS Code con la carpeta backend")

h(doc, "7.3. Endpoints de la API", level=2)
par(doc, "El servidor expone los siguientes servicios en el puerto 3000:")
table(doc,
      ["Metodo", "Ruta", "Descripcion"],
      [
          ["GET", "/api/productos", "Catalogo completo con JOIN a categorias y proveedores"],
          ["GET", "/api/productos/escaneo/:codigo", "Busqueda por codigo de barras (404 si no existe)"],
          ["POST", "/api/productos", "Crear producto (solo Administrador, JWT)"],
          ["PUT", "/api/productos/:id", "Actualizar producto (solo Administrador, JWT)"],
          ["DELETE", "/api/productos/:id", "Eliminar producto (solo Administrador, JWT)"],
          ["POST", "/api/auth/login", "Autenticacion; devuelve token JWT con el rol"],
          ["GET", "/api/auth/me", "Perfil del usuario autenticado"],
          ["POST", "/api/movimientos", "Registrar entrada/salida y actualizar stock (transaccion)"],
          ["GET", "/api/categorias", "Consultar categorias"],
          ["GET", "/api/proveedores", "Consultar proveedores"],
          ["GET", "/api/bodegas", "Consultar bodegas"],
      ],
      widths=[2.5, 6.0, 8.0])
doc.add_paragraph()
figure(doc, 15, "Respuesta JSON de la API en el navegador.",
       "captura de http://localhost:3000/api/productos en el navegador")

h(doc, "7.4. Seguridad implementada", level=2)
bullets(doc, [
    "Contrasenas almacenadas con hash bcrypt (nunca en texto plano).",
    "Autenticacion mediante token JWT con expiracion.",
    "Control de acceso por roles: las operaciones de escritura exigen rol Administrador.",
    "Consultas parametrizadas para prevenir inyeccion SQL.",
    "Validacion de stock en el servidor antes de confirmar una salida.",
])
figure(doc, 16, "Prueba del endpoint de login devolviendo el token JWT.",
       "captura de una peticion POST /api/auth/login")

# ------------------------- 8. PRUEBAS -------------------------
h(doc, "8. Pruebas del sistema", level=1)
par(doc, "Se ejecutaron dos niveles de prueba: pruebas automaticas de integracion "
         "sobre la API (herramientas node:test y supertest) y pruebas manuales sobre "
         "la aplicacion movil en el emulador Android.")

h(doc, "8.1. Pruebas automatizadas (npm test)", level=2)
table(doc,
      ["N.o", "Caso de prueba", "Resultado esperado", "Estado"],
      [
          ["1", "GET /api/productos", "Devuelve el catalogo con JOIN (200)", "Aprobado"],
          ["2", "GET /api/productos/escaneo/779123456789", "Encuentra el producto (200)", "Aprobado"],
          ["3", "GET /api/productos/escaneo/12345", "Producto no encontrado (404)", "Aprobado"],
          ["4", "POST /api/auth/login (credenciales validas)", "Devuelve JWT con rol (200)", "Aprobado"],
          ["5", "POST /api/auth/login (credenciales invalidas)", "No autorizado (401)", "Aprobado"],
          ["6", "CRUD sin token", "Rechaza la peticion (401)", "Aprobado"],
          ["7", "POST /api/productos (con token admin)", "Crea el producto (201)", "Aprobado"],
          ["8", "POST /api/movimientos ENTRADA", "Actualiza stock 10 -> 15 (201)", "Aprobado"],
          ["9", "Salida con stock insuficiente", "Rechaza la operacion (400)", "Aprobado"],
          ["10", "GET /api/categorias y /api/proveedores", "Devuelve los datos (200)", "Aprobado"],
      ],
      widths=[1.2, 6.3, 6.0, 2.5])
doc.add_paragraph()
par(doc, "Resultado global: 6/6 pruebas automatizadas aprobadas.", bold=True)
figure(doc, 17, "Ejecucion de las pruebas automatizadas (npm test).",
       "captura de la terminal con el resultado de npm test")

h(doc, "8.2. Pruebas manuales (usabilidad)", level=2)
table(doc,
      ["Escenario", "Accion realizada", "Resultado"],
      [
          ["Inicio de sesion", "Ingresar credenciales de Administrador", "Acceso concedido"],
          ["Inicio de sesion", "Ingresar contrasena incorrecta", "Mensaje de error"],
          ["Consulta de inventario", "Abrir la pestana Inventario", "Catalogo actualizado"],
          ["Escaneo de codigo", "Escanear un producto registrado", "Alerta verde con datos"],
          ["Escaneo invalido", "Buscar un codigo inexistente", "Alerta roja de validacion"],
          ["Registro de entrada", "Registrar entrada de 5 unidades", "Stock incrementado"],
          ["Registro de salida", "Registrar salida mayor al stock", "Operacion rechazada"],
          ["Alertas", "Abrir la pestana Alertas", "Productos de stock bajo listados"],
          ["Alta de producto", "Crear producto como Administrador", "Producto registrado"],
          ["Restriccion de rol", "Bodeguero intenta crear producto", "Pestana no disponible"],
      ],
      widths=[3.5, 6.5, 5.5])
doc.add_paragraph()

h(doc, "8.3. Base de datos cargada", level=2)
figure(doc, 18, "Base de datos stockmobile_db en phpMyAdmin.",
       "captura de phpMyAdmin con las 8 tablas y los registros de prueba")

# ------------------------- 9. PRESENTACION -------------------------
h(doc, "9. Presentacion", level=1)
par(doc, "Como complemento del informe se entrega una presentacion del proyecto y "
         "una demostracion funcional del aplicativo.")
bullets(doc, [
    "Repositorio de codigo fuente: [PEGAR AQUI EL ENLACE DE GITHUB]",
    "Video de presentacion / demostracion: [PEGAR AQUI EL ENLACE DEL VIDEO]",
    "Aplicativo en ejecucion local: servidor API en http://localhost:3000 y app "
    "movil StockMobile mediante Expo GO.",
])
h(doc, "9.1. Guion sugerido para la exposicion", level=2)
bullets(doc, [
    "Presentacion del tema, la problematica y los objetivos (1 minuto).",
    "Explicacion del modelo entidad-relacion y la base de datos (2 minutos).",
    "Demostracion del Back-End y sus endpoints (2 minutos).",
    "Recorrido por la aplicacion movil: login, inventario, escaneo, movimientos y alertas (4 minutos).",
    "Conclusiones y cierre (1 minuto).",
])

# ------------------------- 10. MANUAL DE USUARIO -------------------------
h(doc, "10. Manual de usuario", level=1)
par(doc, "A continuacion se describe el procedimiento para instalar, ejecutar y "
         "utilizar el sistema StockMobile.")

h(doc, "10.1. Instalacion y puesta en marcha", level=2)
par(doc, "Requisitos previos: XAMPP con Apache y MySQL activos, Node.js v20 o "
         "superior y Expo GO en el dispositivo movil.")
bullets(doc, [
    "Paso 1. Importar database/stockmobile_db.sql en phpMyAdmin para crear la base de datos.",
    "Paso 2. Ejecutar iniciar_backend.bat (o npm start dentro de la carpeta backend) "
    "para levantar la API en http://localhost:3000.",
    "Paso 3. Ejecutar iniciar_emulador.bat para encender el emulador Android Pixel_7.",
    "Paso 4. Ejecutar iniciar_movil.bat y pulsar la tecla «a» para abrir la app en el emulador.",
    "Paso 5. (Dispositivo fisico) Escanear el codigo QR con Expo GO desde la misma red Wi-Fi.",
])
figure(doc, 19, "Arranque del servidor Back-End.",
       "captura de la terminal con el mensaje de servidor escuchando en el puerto 3000")

h(doc, "10.2. Uso de la aplicacion", level=2)
bullets(doc, [
    "Iniciar sesion: ingrese el correo y la contrasena y pulse Ingresar. Credenciales "
    "de prueba: admin@stockmobile.ec / Admin123! (Administrador) y "
    "cbodega@stockmobile.ec / Bodega123! (Bodeguero).",
    "Consultar el inventario: la pestana Inventario muestra el catalogo con el stock en tiempo real.",
    "Buscar o escanear: digite el codigo de barras (por ejemplo 779123456789) y pulse "
    "Escanear / Buscar, o pulse el boton sin texto para usar la camara.",
    "Interpretar el resultado: una tarjeta verde confirma la existencia del producto; "
    "una tarjeta roja indica que el codigo no esta registrado.",
    "Registrar un movimiento: pestana Movimientos, elija Entrada o Salida, busque el "
    "producto, indique la cantidad y la bodega, y pulse Registrar.",
    "Consultar alertas: pestana Alertas, que lista los productos con stock bajo.",
    "Registrar un producto (Administrador): pestana Nuevo, complete el formulario y "
    "pulse Guardar Producto.",
    "Cerrar sesion: pulse el boton Salir ubicado en la cabecera.",
])
figure(doc, 20, "Flujo completo de uso de la aplicacion movil.",
       "captura del recorrido por las cuatro pestanas")

h(doc, "10.3. Solucion de problemas frecuentes", level=2)
table(doc,
      ["Situacion", "Causa probable", "Solucion"],
      [
          ["La app no carga el inventario", "El Back-End no esta en ejecucion",
           "Verifique iniciar_backend.bat y que responda en el puerto 3000"],
          ["No conecta desde el celular", "Dispositivo en otra red Wi-Fi",
           "Conecte el equipo y el movil a la misma red; ajuste API_URL en src/config.js"],
          ["El escaner no abre", "Permiso de camara denegado",
           "Conceda el permiso de camara a Expo GO"],
          ["Credenciales invalidas", "Usuario o contrasena incorrectos",
           "Use las credenciales de prueba indicadas"],
      ],
      widths=[4.5, 5.0, 6.0])
doc.add_paragraph()

# ------------------------- 11. CONCLUSIONES -------------------------
h(doc, "11. Conclusiones y recomendaciones", level=1)
bullets(doc, [
    "La integracion de una app movil con una API REST y MySQL permitio centralizar "
    "la informacion del inventario y eliminar el registro manual.",
    "El uso de autenticacion JWT y control por roles garantiza que solo el personal "
    "autorizado modifique el catalogo.",
    "Las transacciones de base de datos aseguran la consistencia del stock ante "
    "movimientos simultaneos.",
    "La lectura de codigos de barras reduce el tiempo de busqueda y los errores de digitacion.",
])
par(doc, "Recomendaciones:", bold=True)
bullets(doc, [
    "Incorporar reportes exportables a PDF y Excel.",
    "Agregar notificaciones push para las alertas de reposicion.",
    "Implementar un modulo de facturacion para completar el ciclo comercial.",
    "Publicar el Back-End en un servidor en la nube para acceso remoto.",
])

# ------------------------- 12. REFERENCIAS -------------------------
h(doc, "12. Referencias bibliograficas", level=1)
refs = [
    "Documentacion oficial de React Native. Meta Open Source. https://reactnative.dev/",
    "Documentacion oficial de Expo. Expo. https://docs.expo.dev/",
    "Documentacion oficial de Express. OpenJS Foundation. https://expressjs.com/",
    "Documentacion de MySQL / MariaDB. Oracle / MariaDB Foundation. https://dev.mysql.com/doc/",
    "Documentacion de JSON Web Tokens. Auth0. https://jwt.io/introduction",
    "Silberschatz, A.; Korth, H.; Sudarshan, S. Fundamentos de bases de datos. "
    "McGraw-Hill, 7.a edicion.",
]
for i, r in enumerate(refs, 1):
    par(doc, "[%d] %s" % (i, r), size=10)

add_page_number_footer(doc)
doc.save(SALIDA)
print("Informe generado:", SALIDA)
