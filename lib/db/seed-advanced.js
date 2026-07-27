const { createClient } = require("@libsql/client")

async function seedAdvanced() {
  const connectionString = "file:local.db"
  const client = createClient({ url: connectionString })

  console.log("Iniciando la inserción de datos avanzados (Condominios, Egresos, Webmaster y Roles)...")

  const nowMs = Date.now()

  // 1. Actualizar el usuario Alejandro Vargas para que tenga rol 'webmaster'
  const targetUserId = "gnofQmVe8AHaCHVcVFanduq4eMpS2LaH"
  await client.execute({
    sql: "UPDATE 'user' SET role = 'webmaster' WHERE id = ?",
    args: [targetUserId]
  })
  console.log("- Usuario Alejandro Vargas actualizado a rol 'webmaster'")

  // 2. Crear un Copropietario de prueba adicional
  const copropietarioId = "copropietarioTestUserId123"
  const copropietarioExists = await client.execute({
    sql: "SELECT id FROM 'user' WHERE id = ?",
    args: [copropietarioId]
  })

  if (copropietarioExists.rows.length === 0) {
    await client.execute({
      sql: "INSERT INTO 'user' (id, name, email, emailVerified, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [copropietarioId, "Juan Pérez Copropietario", "juan.perez@condominio.cl", 1, "copropietario", nowMs, nowMs]
    })
    console.log("- Copropietario de prueba 'Juan Pérez' creado")
  }

  // 3. Crear un Administrador de Curso de prueba adicional
  const adminCursoId = "adminCursoTestUserId123"
  const adminCursoExists = await client.execute({
    sql: "SELECT id FROM 'user' WHERE id = ?",
    args: [adminCursoId]
  })

  if (adminCursoExists.rows.length === 0) {
    await client.execute({
      sql: "INSERT INTO 'user' (id, name, email, emailVerified, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [adminCursoId, "María Constanza Profesora", "maria.profesora@colegio.cl", 1, "admin_curso", nowMs, nowMs]
    })
    console.log("- Administrador de Curso 'María Constanza' creado")
  }

  // 4. Crear Departamentos
  // Depto 101, Torre A (Asignado a Alejandro Vargas - Webmaster)
  let depto101Id;
  const d101Exists = await client.execute({
    sql: "SELECT id FROM departamentos WHERE numero = ? AND bloque = ?",
    args: ["101", "Torre A"]
  })
  if (d101Exists.rows.length > 0) {
    depto101Id = d101Exists.rows[0].id
  } else {
    const res = await client.execute({
      sql: "INSERT INTO departamentos (numero, bloque, copropietarioId, prorrateo, activo, createdAt) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: ["101", "Torre A", targetUserId, 250, 1, nowMs] // 2.50%
    })
    depto101Id = res.rows[0].id
  }

  // Depto 102, Torre A (Asignado a Alejandro Vargas - Webmaster)
  let depto102Id;
  const d102Exists = await client.execute({
    sql: "SELECT id FROM departamentos WHERE numero = ? AND bloque = ?",
    args: ["102", "Torre A"]
  })
  if (d102Exists.rows.length > 0) {
    depto102Id = d102Exists.rows[0].id
  } else {
    const res = await client.execute({
      sql: "INSERT INTO departamentos (numero, bloque, copropietarioId, prorrateo, activo, createdAt) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: ["102", "Torre A", targetUserId, 350, 1, nowMs] // 3.50%
    })
    depto102Id = res.rows[0].id
  }

  // Depto 201, Torre B (Asignado a Juan Pérez - Copropietario)
  let depto201Id;
  const d201Exists = await client.execute({
    sql: "SELECT id FROM departamentos WHERE numero = ? AND bloque = ?",
    args: ["201", "Torre B"]
  })
  if (d201Exists.rows.length > 0) {
    depto201Id = d201Exists.rows[0].id
  } else {
    const res = await client.execute({
      sql: "INSERT INTO departamentos (numero, bloque, copropietarioId, prorrateo, activo, createdAt) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: ["201", "Torre B", copropietarioId, 400, 1, nowMs] // 4.00%
    })
    depto201Id = res.rows[0].id
  }
  console.log("- Departamentos e inquilinos creados")

  // 5. Crear Egresos del Condominio (Gastos Generales)
  const egresosCondo = [
    { desc: "Pago honorarios conserjería Julio 2026", monto: 950000, fecha: "2026-07-02", cat: "Conserjería y Personal" },
    { desc: "Reparación motor portón vehicular entrada", monto: 280000, fecha: "2026-07-10", cat: "Mantenimiento Ascensores" },
    { desc: "Electricidad común espacios y luminarias", monto: 185000, fecha: "2026-07-15", cat: "Servicios Básicos Comunes" },
    { desc: "Insumos limpieza y jardinería áreas comunes", monto: 90000, fecha: "2026-07-20", cat: "Áreas Verdes / Piscina" }
  ]

  for (const eg of egresosCondo) {
    const exists = await client.execute({
      sql: "SELECT id FROM gastos_condominio WHERE descripcion = ? AND fecha = ?",
      args: [eg.desc, eg.fecha]
    })
    if (exists.rows.length === 0) {
      await client.execute({
        sql: "INSERT INTO gastos_condominio (descripcion, monto, fecha, categoria, createdAt) VALUES (?, ?, ?, ?, ?)",
        args: [eg.desc, eg.monto, eg.fecha, eg.cat, nowMs]
      })
    }
  }
  console.log("- Egresos de Condominio poblados")

  // 6. Crear Gastos Comunes Emitidos
  // Gasto Común de Junio (Depto 101 - YA PAGADO)
  const gcJunioExists = await client.execute({
    sql: "SELECT id FROM gastos_comunes WHERE departamentoId = ? AND mes = ? AND anio = ?",
    args: [depto101Id, 6, 2026]
  })
  let gcJunioId;
  if (gcJunioExists.rows.length === 0) {
    const res = await client.execute({
      sql: "INSERT INTO gastos_comunes (departamentoId, mes, anio, monto, fechaVencimiento, estado, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
      args: [depto101Id, 6, 2026, 125000, "2026-07-05", "pagado", nowMs]
    })
    gcJunioId = res.rows[0].id

    // Registrar su pago en pagos_gasto_comun
    await client.execute({
      sql: "INSERT INTO pagos_gasto_comun (gastoComunId, departamentoId, copropietarioId, monto, fecha, transaccionId, metodoPago, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [gcJunioId, depto101Id, targetUserId, 125000, "2026-07-04", "TX-COND-JUNE-PAGO101", "Webpay", nowMs]
    })
    console.log("- Gasto Común Junio (Depto 101) creado y pagado")
  }

  // Gasto Común de Julio (Depto 101 - PENDIENTE)
  const gcJulio101Exists = await client.execute({
    sql: "SELECT id FROM gastos_comunes WHERE departamentoId = ? AND mes = ? AND anio = ?",
    args: [depto101Id, 7, 2026]
  })
  if (gcJulio101Exists.rows.length === 0) {
    await client.execute({
      sql: "INSERT INTO gastos_comunes (departamentoId, mes, anio, monto, fechaVencimiento, estado, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [depto101Id, 7, 2026, 132000, "2026-08-05", "pendiente", nowMs]
    })
    console.log("- Gasto Común Julio (Depto 101) creado como pendiente")
  }

  // Gasto Común de Julio (Depto 102 - PENDIENTE)
  const gcJulio102Exists = await client.execute({
    sql: "SELECT id FROM gastos_comunes WHERE departamentoId = ? AND mes = ? AND anio = ?",
    args: [depto102Id, 7, 2026]
  })
  if (gcJulio102Exists.rows.length === 0) {
    await client.execute({
      sql: "INSERT INTO gastos_comunes (departamentoId, mes, anio, monto, fechaVencimiento, estado, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [depto102Id, 7, 2026, 185000, "2026-08-05", "pendiente", nowMs]
    })
    console.log("- Gasto Común Julio (Depto 102) creado como pendiente")
  }

  // 7. Insertar Egresos de Curso (Inversiones de cuotas escolares)
  // Necesitamos el cursoId del "5° Básico A"
  const cursoRes = await client.execute("SELECT id FROM cursos LIMIT 1")
  if (cursoRes.rows.length > 0) {
    const cursoId = cursoRes.rows[0].id
    const egresosCursoData = [
      { desc: "Reserva de bus de turismo - Paseo Cajón del Maipo", monto: 350000, fecha: "2026-07-01", obs: "Aprobado por directiva" },
      { desc: "Compra de carnes, carbón y ensaladas", monto: 125000, fecha: "2026-07-12", obs: "Boleta N° 932" }
    ]

    for (const eg of egresosCursoData) {
      const exists = await client.execute({
        sql: "SELECT id FROM egresos_curso WHERE cursoId = ? AND descripcion = ?",
        args: [cursoId, eg.desc]
      })
      if (exists.rows.length === 0) {
        await client.execute({
          sql: "INSERT INTO egresos_curso (cursoId, descripcion, monto, fecha, observaciones, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
          args: [cursoId, eg.desc, eg.monto, eg.fecha, eg.obs, nowMs]
        })
      }
    }
    console.log("- Egresos de Curso (inversión de cuotas) agregados con éxito")
  }

  console.log("¡Todos los datos avanzados de Condominio y roles fueron sembrados con éxito!");
}

seedAdvanced().catch(console.error)
