from database import supabase


def insertar_huesped(data: dict):
    """Inserta un nuevo huésped en la tabla huespedes."""
    response = supabase.table("huespedes").insert({
        "tipo_documento":   data.get("tipoDocumento"),
        "numero_documento": data.get("numeroDocumento"),
        "nombres":          data.get("nombres"),
        "apellidos":        data.get("apellidos"),
        "edad":             data.get("edad"),
        "fecha_nacimiento": data.get("fechaNacimiento") or None,
        "sexo":             data.get("sexo"),
        "nacionalidad":     data.get("nacionalidad"),
        "ciudad":           data.get("ciudad"),
        "fecha_ingreso":    data.get("fechaIngreso") or None,
        "fecha_salida":     data.get("fechaSalida") or None,
        "motivo_viaje":     data.get("motivo_Viaje"),
    }).execute()
    return response.data


def obtener_huespedes():
    response = supabase.table("huespedes").select("*").order("fecha_ingreso", desc=True).execute()
    return response.data


def filtrar_por_fechas(desde: str, hasta: str):
    query = supabase.table("huespedes").select("*")
    if desde:
        query = query.gte("fecha_ingreso", desde)
    if hasta:
        query = query.lte("fecha_ingreso", hasta)
    response = query.order("fecha_ingreso", desc=True).execute()
    return response.data


def filtrar_por_dni(dni: str):
    response = (
        supabase.table("huespedes")
        .select("*")
        .eq("numero_documento", dni)
        .execute()
    )
    return response.data