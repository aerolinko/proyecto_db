-- =============================================
-- PROCEDIMIENTOS Y FUNCIONES PARA EVENTOS ACAUCAB
-- Cumple reglas de organización, ventas, inventario, seguridad, reportes y marketing
-- =============================================

-- 1. Aprobación de eventos por gerente
CREATE OR REPLACE PROCEDURE aprobar_evento(p_evento_id INTEGER, p_usuario_id INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    es_gerente BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM rol_usuario ru
        JOIN rol r ON ru.fk_rol = r.rol_id
        WHERE ru.fk_usuario = p_usuario_id AND r.nombre ILIKE '%gerente%'
    ) INTO es_gerente;
    IF NOT es_gerente THEN
        RAISE EXCEPTION 'Solo un gerente puede aprobar eventos';
    END IF;
    UPDATE evento SET estado = 'aprobado' WHERE evento_id = p_evento_id;
END;
$$;

-- 2. Límite de productos por proveedor en evento
CREATE OR REPLACE FUNCTION puede_agregar_producto_evento(p_evento_id INTEGER, p_miembro_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total
    FROM evento_miembro_acaucab
    WHERE fk_evento = p_evento_id AND fk_miembro_acaucab = p_miembro_id;
    RETURN total < 5;
END;
$$ LANGUAGE plpgsql;

-- 3. Facturación automática a proveedores
CREATE OR REPLACE PROCEDURE facturar_participacion_evento(p_evento_id INTEGER, p_miembro_id INTEGER, p_monto INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    pago_id INTEGER;
BEGIN
    INSERT INTO pago (monto, fecha, fk_venta_evento)
    VALUES (p_monto, CURRENT_DATE, NULL)
    RETURNING pago_id INTO pago_id;
END;
$$;

-- 4. Sumar puntos a proveedores por participación
CREATE OR REPLACE PROCEDURE sumar_puntos_proveedor_evento(p_miembro_id INTEGER, p_puntos INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE miembro_acaucab
    SET total_puntos = total_puntos + p_puntos
    WHERE miembro_id = p_miembro_id;
END;
$$;

-- 5. Límite de entradas por cliente
CREATE OR REPLACE FUNCTION puede_comprar_entradas(p_evento_id INTEGER, p_cliente_id INTEGER, p_cantidad INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COALESCE(SUM(dve.cantidad), 0) INTO total
    FROM detalle_venta_evento dve
    JOIN venta_evento ve ON dve.fk_venta_evento = ve.venta_evento_id
    WHERE ve.fk_evento = p_evento_id
      AND (ve.fk_evento_cliente = p_cliente_id);
    RETURN (total + p_cantidad) <= 10;
END;
$$ LANGUAGE plpgsql;

-- 6. Cancelaciones y reembolsos de entradas
CREATE OR REPLACE PROCEDURE cancelar_entrada_evento(p_detalle_venta_evento_id INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
    fecha_evento DATE;
    fecha_actual DATE := CURRENT_DATE;
BEGIN
    SELECT e.fecha_inicio INTO fecha_evento
    FROM detalle_venta_evento dve
    JOIN venta_evento ve ON dve.fk_venta_evento = ve.venta_evento_id
    JOIN evento e ON ve.fk_evento = e.evento_id
    WHERE dve.detalle_venta_evento_id = p_detalle_venta_evento_id;
    IF fecha_evento - fecha_actual < 2 THEN
        RAISE EXCEPTION 'No se puede cancelar la entrada con menos de 48h de anticipación';
    END IF;
    UPDATE detalle_venta_evento SET cantidad = 0 WHERE detalle_venta_evento_id = p_detalle_venta_evento_id;
END;
$$;

-- 7. Generar código QR único para entradas
CREATE OR REPLACE FUNCTION generar_codigo_qr()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 8. Alerta de stock agotado en evento
CREATE OR REPLACE FUNCTION alerta_stock_agotado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cantidad = 0 THEN
        RAISE NOTICE 'Producto agotado para el evento';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_alerta_stock_agotado
AFTER UPDATE ON evento_miembro_acaucab
FOR EACH ROW
WHEN (NEW.cantidad = 0)
EXECUTE FUNCTION alerta_stock_agotado();

-- 9. Asignación automática de stands (ejemplo básico)
CREATE OR REPLACE PROCEDURE asignar_stand_evento(p_evento_id INTEGER, p_miembro_id INTEGER, p_tipo_zona VARCHAR)
LANGUAGE plpgsql
AS $$
DECLARE
    stand_id INTEGER;
BEGIN
    SELECT anaquel_id INTO stand_id
    FROM anaquel
    WHERE NOT EXISTS (
        SELECT 1 FROM evento_miembro_acaucab ema
        WHERE ema.fk_evento = p_evento_id AND ema.fk_miembro_acaucab = p_miembro_id
    )
    AND anaquel_id IN (
        SELECT anaquel_id FROM anaquel WHERE capacidad > 0
    )
    LIMIT 1;
    -- Aquí puedes guardar la asignación en una tabla intermedia si la tienes.
END;
$$;

-- 10. Registrar encuesta post-evento
CREATE OR REPLACE PROCEDURE registrar_encuesta_evento(p_evento_id INTEGER, p_usuario_id INTEGER, p_tipo VARCHAR, p_respuesta TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO encuesta_evento (evento_id, usuario_id, tipo, respuesta, fecha)
    VALUES (p_evento_id, p_usuario_id, p_tipo, p_respuesta, CURRENT_DATE);
END;
$$;

-- 11. Asociar campaña de marketing a evento
CREATE OR REPLACE PROCEDURE asociar_campana_evento(p_evento_id INTEGER, p_descripcion TEXT, p_fecha_inicio DATE, p_fecha_fin DATE)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO campana_marketing (evento_id, descripcion, fecha_inicio, fecha_fin)
    VALUES (p_evento_id, p_descripcion, p_fecha_inicio, p_fecha_fin);
END;
$$;

-- 12. Cambiar estado de orden
CREATE OR REPLACE PROCEDURE cambiar_estado_orden(
    p_venta_online_id INTEGER,
    p_nuevo_estado VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado_id INTEGER;
BEGIN
    -- Solo permitir "Pendiente" o "Completado"
    IF p_nuevo_estado NOT IN ('Pendiente', 'Completado') THEN
        RAISE EXCEPTION 'Solo se permite cambiar a Pendiente o Completado';
    END IF;

    -- Buscar el ID del estado en la tabla ESTADO
    SELECT estado_id INTO v_estado_id
    FROM ESTADO
    WHERE nombre = p_nuevo_estado
    LIMIT 1;

    IF v_estado_id IS NULL THEN
        RAISE EXCEPTION 'Estado no válido';
    END IF;

    -- Cerrar el estado anterior (si manejas fecha_fin)
    UPDATE ESTADO_VENTA_ONLINE
    SET fecha_fin = CURRENT_DATE
    WHERE fk_venta_online = p_venta_online_id AND fecha_fin IS NULL;

    -- Registrar el nuevo estado en el historial
    INSERT INTO ESTADO_VENTA_ONLINE (fecha_inicio, fecha_fin, fk_estado, fk_venta_online)
    VALUES (CURRENT_DATE, NULL, v_estado_id, p_venta_online_id);

    -- Si el estado es Completado, actualiza la fecha_entrega
    IF p_nuevo_estado = 'Completado' THEN
        UPDATE VENTA_ONLINE
        SET fecha_entrega = CURRENT_DATE
        WHERE venta_online_id = p_venta_online_id;
    END IF;
END;
$$; 