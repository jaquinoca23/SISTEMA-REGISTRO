from flask import Flask, request, jsonify, render_template, send_from_directory
from models import insertar_huesped, obtener_huespedes, filtrar_por_fechas, filtrar_por_dni
import os
 
app = Flask(__name__)
 
 
# ── Servir carpeta Imagenes ─────────────────────────────────────────────────────
 
@app.route("/Imagenes/<path:filename>")
def imagenes(filename):
    return send_from_directory(os.path.join(app.root_path, "Imagenes"), filename)
 
 
# ── Páginas HTML ────────────────────────────────────────────────────────────────
 
@app.route("/")
def index():
    return render_template("login.html")
 
@app.route("/login")
def login():
    return render_template("login.html")
 
@app.route("/registro")
def registro():
    return render_template("registro.html")
 
@app.route("/reportes")
def reportes():
    return render_template("reportes.html")
 
 
# ── API REST ────────────────────────────────────────────────────────────────────
 
@app.route("/api/registrar", methods=["POST"])
def api_registrar():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
    try:
        resultado = insertar_huesped(data)
        return jsonify({"ok": True, "data": resultado}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
 
@app.route("/api/reportes", methods=["GET"])
def api_reportes():
    desde = request.args.get("desde", "")
    hasta = request.args.get("hasta", "")
    dni   = request.args.get("dni", "")
 
    try:
        if dni:
            datos = filtrar_por_dni(dni)
        elif desde or hasta:
            datos = filtrar_por_fechas(desde, hasta)
        else:
            datos = obtener_huespedes()
        return jsonify(datos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
 
if __name__ == "__main__":
    app.run(debug=True)