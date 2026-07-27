const { createClient } = require("@libsql/client")

async function seed() {
  const connectionString = "file:local.db"
  const client = createClient({ url: connectionString })

  const userId = "gnofQmVe8AHaCHVcVFanduq4eMpS2LaH" // ID de Alejandro Vargas
  console.log(`Poblando gastos para el usuario: ${userId}`)

  // 1. Crear Categorías
  const categorias = [
    { nombre: "Servicios Básicos", color: "#3b82f6" },
    { nombre: "Comunicaciones", color: "#06b6d4" },
    { nombre: "Vivienda", color: "#ef4444" },
    { nombre: "Finanzas / Deudas", color: "#8b5cf6" },
    { nombre: "Transporte / Auto", color: "#f97316" },
    { nombre: "Tecnología / Suscripciones", color: "#ec4899" },
    { nombre: "Hijos / Educación", color: "#10b981" },
    { nombre: "Hogar y Cuidado", color: "#64748b" },
  ]

  const catIds = {}

  for (const cat of categorias) {
    // Verificar si ya existe
    const exists = await client.execute({
      sql: 'SELECT id FROM categorias_gastos WHERE userId = ? AND nombre = ?',
      args: [userId, cat.nombre]
    })

    if (exists.rows.length > 0) {
      catIds[cat.nombre] = exists.rows[0].id
    } else {
      const nowMs = Date.now()
      const res = await client.execute({
        sql: 'INSERT INTO categorias_gastos (userId, nombre, color, createdAt) VALUES (?, ?, ?, ?) RETURNING id',
        args: [userId, cat.nombre, cat.color, nowMs]
      })
      catIds[cat.nombre] = res.rows[0].id
    }
  }

  console.log("Categorías configuradas:", catIds)

  // 2. Insertar Gastos Generales en gastos_hogar (distribuidos en julio 2026)
  const gastosGenerales = [
    { desc: "Agua", monto: 23370, cat: "Servicios Básicos", fecha: "2026-07-05" },
    { desc: "Luz", monto: 36095, cat: "Servicios Básicos", fecha: "2026-07-08" },
    { desc: "celular alejandro", monto: 15664, cat: "Comunicaciones", fecha: "2026-07-10" },
    { desc: "internet depa", monto: 13000, cat: "Comunicaciones", fecha: "2026-07-10" },
    { desc: "celular cami", monto: 18920, cat: "Comunicaciones", fecha: "2026-07-10" },
    { desc: "arriendo", monto: 51811, cat: "Vivienda", fecha: "2026-07-01" },
    { desc: "gasto comun", monto: 10000, cat: "Vivienda", fecha: "2026-07-05" },
    { desc: "cuota tia lili", monto: 100000, cat: "Finanzas / Deudas", fecha: "2026-07-02" },
    { desc: "agro", monto: 100000, cat: "Finanzas / Deudas", fecha: "2026-07-04" }, // Agro o inversión/deuda
    { desc: "gas", monto: 15000, cat: "Servicios Básicos", fecha: "2026-07-12" },
    { desc: "cambio de aceite", monto: 35000, cat: "Transporte / Auto", fecha: "2026-07-15" },
    { desc: "grabado patente", monto: 10000, cat: "Transporte / Auto", fecha: "2026-07-16" },
    { desc: "petroleo", monto: 80000, cat: "Transporte / Auto", fecha: "2026-07-20" },
    { desc: "google one", monto: 23000, cat: "Tecnología / Suscripciones", fecha: "2026-07-25" },
    { desc: "spotify", monto: 8000, cat: "Tecnología / Suscripciones", fecha: "2026-07-25" },
    { desc: "Pañales y toallas", monto: 35000, cat: "Hogar y Cuidado", fecha: "2026-07-18" },
    { desc: "renovacion celular", monto: 30000, cat: "Comunicaciones", fecha: "2026-07-22" },
  ]

  const nowMs = Date.now()
  for (const g of gastosGenerales) {
    const catId = catIds[g.cat]
    await client.execute({
      sql: 'INSERT INTO gastos_hogar (userId, categoriaId, descripcion, monto, fecha, metodoPago, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [userId, catId, g.desc, g.monto, g.fecha, "Transferencia", nowMs]
    })
  }

  console.log(`Insertados ${gastosGenerales.length} gastos generales.`)

  // 3. Crear Presupuesto de Alimentación para Julio 2026 si no existe
  const pExists = await client.execute({
    sql: 'SELECT id FROM presupuestos_alimentacion WHERE userId = ? AND anio = 2026 AND mes = 7',
    args: [userId]
  })

  if (pExists.rows.length === 0) {
    await client.execute({
      sql: 'INSERT INTO presupuestos_alimentacion (userId, anio, mes, montoPresupuestado, createdAt) VALUES (?, ?, ?, ?, ?)',
      args: [userId, 2026, 7, 350000, nowMs] // Presupuesto de 350,000 CLP
    })
    console.log("Presupuesto de Alimentación (350,000 CLP) establecido para Julio 2026.")
  }

  // 4. Insertar Gastos de Alimentación en gastos_alimentacion
  const gastosAlim = [
    { desc: "supermercado", monto: 100000, cat: "Supermercado", lugar: "Líder", fecha: "2026-07-03" },
    { desc: "pan diario", monto: 140000, cat: "Panadería / Pastelería", lugar: "Panadería local", fecha: "2026-07-14" },
    { desc: "Colacion", monto: 40000, cat: "Comida Rápida / Delivery", lugar: "Casino / Local comida", fecha: "2026-07-15" },
  ]

  for (const g of gastosAlim) {
    await client.execute({
      sql: 'INSERT INTO gastos_alimentacion (userId, descripcion, monto, categoria, lugar, fecha, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [userId, g.desc, g.monto, g.cat, g.lugar, g.fecha, nowMs]
    })
  }

  console.log(`Insertados ${gastosAlim.length} gastos de alimentación.`)

  // 5. Agregar un ingreso de prueba para balancear los gastos
  const iExists = await client.execute({
    sql: 'SELECT id FROM ingresos_hogar WHERE userId = ?',
    args: [userId]
  })

  if (iExists.rows.length === 0) {
    await client.execute({
      sql: 'INSERT INTO ingresos_hogar (userId, descripcion, monto, fuente, fecha, recurrente, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [userId, "Sueldo Líquido", 1450000, "Empresa Principal", "2026-07-01", 1, nowMs]
    })
    console.log("Ingreso de prueba (Sueldo Líquido: 1,450,000 CLP) registrado.")
  }

  console.log("¡Gastos poblados con éxito en local.db!")
}

seed().catch(console.error)
