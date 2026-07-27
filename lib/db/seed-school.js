const { createClient } = require("@libsql/client")

async function seedSchool() {
  const connectionString = "file:local.db"
  const client = createClient({ url: connectionString })

  const userId = "gnofQmVe8AHaCHVcVFanduq4eMpS2LaH" // ID de Alejandro Vargas (apoderado)
  console.log(`Poblando datos escolares para el apoderado: ${userId}`)

  const nowMs = Date.now()

  // 1. Insertar Colegio
  let colegioId;
  const colExists = await client.execute({
    sql: 'SELECT id FROM colegios WHERE rut = ?',
    args: ["76.543.210-K"]
  })

  if (colExists.rows.length > 0) {
    colegioId = colExists.rows[0].id
  } else {
    const res = await client.execute({
      sql: 'INSERT INTO colegios (nombre, rut, direccion, comuna, region, contacto, estado, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      args: ["Colegio Saint Gabriel", "76.543.210-K", "Av. Providencia 1420", "Providencia", "Región Metropolitana", "contacto@saintgabriel.cl", "activo", nowMs]
    })
    colegioId = res.rows[0].id
  }

  // 2. Insertar Curso
  let cursoId;
  const curExists = await client.execute({
    sql: 'SELECT id FROM cursos WHERE colegioId = ? AND nivel = ? AND nombre = ?',
    args: [colegioId, "5° Básico", "A"]
  })

  if (curExists.rows.length > 0) {
    cursoId = curExists.rows[0].id
  } else {
    const res = await client.execute({
      sql: 'INSERT INTO cursos (colegioId, anio, nivel, nombre, profesorJefe, directiva, activo, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      args: [colegioId, 2026, "5° Básico", "A", "Carmen Gloria Valenzuela", "Presidenta: Ana María, Tesorero: Carlos", 1, nowMs]
    })
    cursoId = res.rows[0].id
  }

  // 3. Insertar Alumno
  const runAlumno = "23.456.789-K"
  const alExists = await client.execute({
    sql: 'SELECT id FROM alumnos WHERE run = ?',
    args: [runAlumno]
  })

  if (alExists.rows.length === 0) {
    await client.execute({
      sql: 'INSERT INTO alumnos (id, nombreCompleto, run, fechaNacimiento, colegioId, cursoId, activo, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [runAlumno, "Pedro Vargas Pérez", runAlumno, "2015-05-12", colegioId, cursoId, 1, nowMs]
    })
  }

  // 4. Vincular Apoderado con Alumno
  const linkExists = await client.execute({
    sql: 'SELECT id FROM apoderado_alumno WHERE apoderadoId = ? AND alumnoId = ?',
    args: [userId, runAlumno]
  })

  if (linkExists.rows.length === 0) {
    await client.execute({
      sql: 'INSERT INTO apoderado_alumno (apoderadoId, alumnoId, relacion, responsablePago, createdAt) VALUES (?, ?, ?, ?, ?)',
      args: [userId, runAlumno, "Padre", 1, nowMs]
    })
  }

  // 5. Crear Cuotas para el Curso
  const cuotasData = [
    { nombre: "Matrícula Anual 2026", desc: "Matrícula de incorporación año escolar 2026", monto: 120000, vencimiento: "2026-03-05", tipo: "mensual" },
    { nombre: "Cuota Centro de Padres Julio", desc: "Aporte mensual centro de padres", monto: 15000, vencimiento: "2026-07-30", tipo: "mensual" },
    { nombre: "Cuota Paseo de Curso", desc: "Cuota de ahorro paseo de fin de año", monto: 45000, vencimiento: "2026-11-30", tipo: "paseo" },
    { nombre: "Graduación Extraordinaria", desc: "Fondo extraordinario gala de licenciatura", monto: 25000, vencimiento: "2026-08-15", tipo: "extraordinaria" },
  ]

  const cuotaIds = {}

  for (const c of cuotasData) {
    const exists = await client.execute({
      sql: 'SELECT id FROM cuotas WHERE cursoId = ? AND nombre = ?',
      args: [cursoId, c.nombre]
    })

    if (exists.rows.length > 0) {
      cuotaIds[c.nombre] = exists.rows[0].id
    } else {
      const res = await client.execute({
        sql: 'INSERT INTO cuotas (nombre, descripcion, cursoId, anio, monto, fechaVencimiento, tipo, activa, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
        args: [c.nombre, c.desc, cursoId, 2026, c.monto, c.vencimiento, c.tipo, 1, nowMs]
      })
      cuotaIds[c.nombre] = res.rows[0].id
    }
  }

  // 6. Crear Metas Económicas
  const metasData = [
    { nombre: "Paseo de fin de año", desc: "Fondo común del curso para el camping y piscina", objetivo: 1500000, recaudado: 350000 },
    { nombre: "Gala de Licenciatura", desc: "Ahorro colectivo arriendo salón y cena", objetivo: 1000000, recaudado: 120000 },
  ]

  for (const m of metasData) {
    const exists = await client.execute({
      sql: 'SELECT id FROM metas_curso WHERE cursoId = ? AND nombre = ?',
      args: [cursoId, m.nombre]
    })

    if (exists.rows.length === 0) {
      await client.execute({
        sql: 'INSERT INTO metas_curso (cursoId, nombre, descripcion, objetivo, recaudado, activa, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [cursoId, m.nombre, m.desc, m.objetivo, m.recaudado, 1, nowMs]
      })
    }
  }

  // 7. Registrar Pago Exitoso para la "Matrícula Anual 2026"
  const matriculaCuotaId = cuotaIds["Matrícula Anual 2026"]
  const pagoExists = await client.execute({
    sql: 'SELECT id FROM pagos_cuota WHERE alumnoId = ? AND cuotaId = ?',
    args: [runAlumno, matriculaCuotaId]
  })

  if (pagoExists.rows.length === 0) {
    await client.execute({
      sql: 'INSERT INTO pagos_cuota (apoderadoId, alumnoId, colegioId, cursoId, cuotaId, monto, fecha, transaccionId, estado, metodoPago, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [userId, runAlumno, colegioId, cursoId, matriculaCuotaId, 120000, "2026-03-04", "TX-MATRICULA-GABRIEL-001", "aprobado", "Webpay", nowMs]
    })
  }

  console.log("¡Datos escolares y de cuotas poblados con éxito en local.db!")
}

seedSchool().catch(console.error)
