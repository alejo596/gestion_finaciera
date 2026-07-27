const { createClient } = require("@libsql/client")

async function migrate() {
  const connectionString = "file:local.db"
  const client = createClient({ url: connectionString })

  console.log("Iniciando la migración del esquema de base de datos local SQLite...")

  // --- 1. MIGRACIÓN DE INGRESOS_HOGAR ---
  console.log("Migrando ingresos_hogar...")
  try {
    await client.execute("ALTER TABLE ingresos_hogar ADD COLUMN periodicidad TEXT DEFAULT 'único'")
    console.log("- Columna 'periodicidad' añadida a ingresos_hogar")
  } catch (err) {
    console.log("- Columna 'periodicidad' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE ingresos_hogar ADD COLUMN responsable TEXT")
    console.log("- Columna 'responsable' añadida a ingresos_hogar")
  } catch (err) {
    console.log("- Columna 'responsable' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE ingresos_hogar ADD COLUMN observaciones TEXT")
    console.log("- Columna 'observaciones' añadida a ingresos_hogar")
  } catch (err) {
    console.log("- Columna 'observaciones' ya existe o no se pudo agregar:", err.message)
  }

  // --- 2. MIGRACIÓN DE GASTOS_HOGAR ---
  console.log("Migrando gastos_hogar...")
  try {
    await client.execute("ALTER TABLE gastos_hogar ADD COLUMN fechaInicio TEXT")
    console.log("- Columna 'fechaInicio' añadida a gastos_hogar")
  } catch (err) {
    console.log("- Columna 'fechaInicio' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE gastos_hogar ADD COLUMN fechaVencimiento TEXT")
    console.log("- Columna 'fechaVencimiento' añadida a gastos_hogar")
  } catch (err) {
    console.log("- Columna 'fechaVencimiento' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE gastos_hogar ADD COLUMN periodicidad TEXT DEFAULT 'único'")
    console.log("- Columna 'periodicidad' añadida a gastos_hogar")
  } catch (err) {
    console.log("- Columna 'periodicidad' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE gastos_hogar ADD COLUMN estado TEXT DEFAULT 'pendiente'")
    console.log("- Columna 'estado' añadida a gastos_hogar")
  } catch (err) {
    console.log("- Columna 'estado' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE gastos_hogar ADD COLUMN observaciones TEXT")
    console.log("- Columna 'observaciones' añadida a gastos_hogar")
  } catch (err) {
    console.log("- Columna 'observaciones' ya existe o no se pudo agregar:", err.message)
  }

  // Migrar datos de 'fecha' a 'fechaInicio' en gastos_hogar
  try {
    await client.execute("UPDATE gastos_hogar SET fechaInicio = fecha WHERE fechaInicio IS NULL OR fechaInicio = ''")
    console.log("- Datos de 'fecha' migrados exitosamente a 'fechaInicio' en gastos_hogar")
  } catch (err) {
    console.log("- No se pudieron migrar los datos de fecha a fechaInicio:", err.message)
  }

  // --- 3. MIGRACIÓN DE PRESUPUESTOS_ALIMENTACION ---
  console.log("Migrando presupuestos_alimentacion...")
  try {
    await client.execute("ALTER TABLE presupuestos_alimentacion ADD COLUMN fechaInicio TEXT")
    console.log("- Columna 'fechaInicio' añadida a presupuestos_alimentacion")
  } catch (err) {
    console.log("- Columna 'fechaInicio' ya existe o no se pudo agregar:", err.message)
  }

  try {
    await client.execute("ALTER TABLE presupuestos_alimentacion ADD COLUMN fechaRenovacion TEXT")
    console.log("- Columna 'fechaRenovacion' añadida a presupuestos_alimentacion")
  } catch (err) {
    console.log("- Columna 'fechaRenovacion' ya existe o no se pudo agregar:", err.message)
  }

  // Rellenar valores predeterminados para presupuestos de alimentación existentes
  try {
    // Rellenamos fechaInicio como AÑO-MES-01 y fechaRenovacion como fin de mes (simplificado a -28/30/31 según mes)
    await client.execute(`
      UPDATE presupuestos_alimentacion 
      SET 
        fechaInicio = anio || '-' || (CASE WHEN mes < 10 THEN '0' || mes ELSE mes END) || '-01',
        fechaRenovacion = anio || '-' || (CASE WHEN mes < 10 THEN '0' || mes ELSE mes END) || '-28'
      WHERE fechaInicio IS NULL OR fechaInicio = ''
    `)
    console.log("- Fechas por defecto establecidas para presupuestos de alimentación existentes")
  } catch (err) {
    console.log("- No se pudieron establecer fechas por defecto en presupuestos de alimentación:", err.message)
  }

  console.log("¡Migración de esquema completada con éxito!")
}

migrate().catch(console.error)
