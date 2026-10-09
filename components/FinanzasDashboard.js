"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const VISTAS = [
  { id: "mes", nombre: "Mes" },
  { id: "quincena", nombre: "Quincena" },
  { id: "semana", nombre: "Semana" },
]
const REFRESCO_MS = 2 * 60 * 1000

// Miles con punto, igual que en el Sheet (₡10.562)
const miles = n => String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
const crc = v => (v === null || v === undefined ? "—" : `${v < 0 ? "-" : ""}₡${miles(v)}`)
const pct = v => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`)
const diaCorto = k => `${Number(k.slice(8, 10))}/${Number(k.slice(5, 7))}`

function estado(p) {
  if (p === null || p === undefined) return "neutral"
  if (p >= 1) return "malo"
  if (p >= 0.8) return "alerta"
  return "bien"
}

function hace(iso, ahora) {
  const min = Math.round((ahora - new Date(iso).getTime()) / 60000)
  if (min < 1) return "hace un momento"
  if (min === 1) return "hace 1 min"
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  return h === 1 ? "hace 1 hora" : `hace ${h} horas`
}

function Barra({ valor, tono, etiqueta, detalle }) {
  const ancho = Math.min(Math.max(valor || 0, 0), 1) * 100
  return (
    <div className="fz-barra">
      <div className="fz-barra-top">
        <span>{etiqueta}</span>
        <span>{detalle}</span>
      </div>
      <div className="fz-pista">
        <div className={`fz-relleno fz-${tono}`} style={{ width: `${ancho}%` }} />
      </div>
    </div>
  )
}

function Dato({ titulo, valor, nota, tono }) {
  return (
    <div className="fz-card fz-dato">
      <p className="fz-label">{titulo}</p>
      <p className={`fz-valor ${tono ? `fz-txt-${tono}` : ""}`}>{valor}</p>
      {nota && <p className="fz-nota">{nota}</p>}
    </div>
  )
}

function GastoDiario({ periodo }) {
  const valores = periodo.diario.map(d => d.gasto || 0)
  const ideal = periodo.presupuesto ? periodo.presupuesto / periodo.dias : 0
  const max = Math.max(...valores, ideal, 1)
  return (
    <div className="fz-card">
      <p className="fz-label">Gasto por día</p>
      <div className="fz-cols" role="img" aria-label="Gasto por día del periodo">
        {ideal > 0 && (
          <div className="fz-linea" style={{ bottom: `${(ideal / max) * 100}%` }}>
            <span>{crc(ideal)}/día</span>
          </div>
        )}
        {periodo.diario.map(d => (
          <div key={d.dia} className="fz-col" title={`${diaCorto(d.dia)}: ${d.gasto === null ? "—" : crc(d.gasto)}`}>
            <div
              className={`fz-col-barra ${d.gasto === null ? "fz-futuro" : d.gasto > ideal ? "fz-sobre" : ""}`}
              style={{ height: d.gasto === null ? "3px" : `${Math.max((d.gasto / max) * 100, d.gasto > 0 ? 2 : 0)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="fz-eje">
        <span>{diaCorto(periodo.inicio)}</span>
        <span>{diaCorto(periodo.fin)}</span>
      </div>
    </div>
  )
}

function Lista({ titulo, items, tono }) {
  const max = Math.max(...items.map(i => i.total), 1)
  return (
    <div className="fz-card">
      <p className="fz-label">{titulo}</p>
      {items.length === 0 && <p className="fz-nota">Sin gastos todavía.</p>}
      <ul className="fz-lista">
        {items.map(i => (
          <li key={i.nombre}>
            <div className="fz-lista-top">
              <span>{i.nombre}</span>
              <span>{crc(i.total)}</span>
            </div>
            <div className="fz-pista fz-pista-fina">
              <div className={`fz-relleno fz-${tono}`} style={{ width: `${(Math.max(i.total, 0) / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Historico({ meses }) {
  const max = Math.max(...meses.map(m => m.gasto), 1)
  return (
    <div className="fz-card">
      <p className="fz-label">Gasto variable · últimos 6 meses</p>
      <div className="fz-hist">
        {meses.map((m, i) => (
          <div key={m.clave} className="fz-hist-col">
            <span className="fz-hist-valor">{m.gasto ? crc(m.gasto) : ""}</span>
            <div className="fz-hist-area">
              <div
                className={`fz-hist-barra ${i === meses.length - 1 ? "fz-actual" : ""}`}
                style={{ height: `${(m.gasto / max) * 100}%` }}
              />
            </div>
            <span className="fz-hist-mes">{m.etiqueta.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Movimientos({ items }) {
  return (
    <div className="fz-card">
      <p className="fz-label">Últimos movimientos</p>
      <ul className="fz-movs">
        {items.map((m, i) => {
          const f = new Date(m.fecha)
          const fecha = f.toLocaleDateString("es-CR", { day: "numeric", month: "short", timeZone: "America/Costa_Rica" })
          return (
            <li key={`${m.fecha}-${i}`}>
              <div>
                <p className="fz-mov-detalle">{m.detalle}</p>
                <p className="fz-nota">
                  {fecha} · {m.categoria} · {m.medio}
                </p>
              </div>
              <span className="fz-mov-monto">{crc(m.monto)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function FinanzasDashboard({ data, error }) {
  const router = useRouter()
  const [vista, setVista] = useState("mes")
  const [ahora, setAhora] = useState(null)
  const [refrescando, setRefrescando] = useState(false)

  // Refresca solo cada 2 minutos mientras la página está abierta
  useEffect(() => {
    setAhora(Date.now())
    const reloj = setInterval(() => setAhora(Date.now()), 30000)
    const datos = setInterval(() => router.refresh(), REFRESCO_MS)
    return () => {
      clearInterval(reloj)
      clearInterval(datos)
    }
  }, [router])

  useEffect(() => setRefrescando(false), [data])

  function refrescar() {
    setRefrescando(true)
    router.refresh()
  }

  async function salir() {
    await fetch("/api/finanzas/logout", { method: "POST" })
    router.refresh()
  }

  const encabezado = (
    <header className="fz-head">
      <p className="fz-prompt">
        <span className="prompt">➜ ~</span> <span className="cmd">./finanzas</span>
      </p>
      <div className="fz-acciones">
        {data && ahora && <span className="fz-nota">{hace(data.generado, ahora)}</span>}
        <button onClick={refrescar} disabled={refrescando} aria-label="Actualizar">
          {refrescando ? "…" : "↻"}
        </button>
        <button onClick={salir}>salir</button>
      </div>
    </header>
  )

  if (!data) {
    return (
      <>
        {encabezado}
        <div className="fz-card">
          <p className="fz-error">No pude cargar los datos.</p>
          <p className="fz-nota">{error}</p>
        </div>
      </>
    )
  }

  const p = data[vista]
  const tono = estado(p.pct)
  const ritmoBien = (p.ritmo || 0) >= 0
  const esMes = vista === "mes"

  return (
    <>
      {encabezado}

      <div className="fz-tabs" role="group" aria-label="Vista">
        {VISTAS.map(v => (
          <button key={v.id} className={vista === v.id ? "activo" : ""} onClick={() => setVista(v.id)}>
            {v.nombre}
          </button>
        ))}
      </div>

      <section className="fz-card fz-hero">
        <p className="fz-label">
          Te queda · {p.etiqueta}
        </p>
        <p className={`fz-grande fz-txt-${p.queda !== null && p.queda < 0 ? "malo" : "texto"}`}>{crc(p.queda)}</p>
        <p className="fz-nota">
          de {crc(p.presupuesto)} · {p.diasRestantes} {p.diasRestantes === 1 ? "día" : "días"} por delante
        </p>
        <Barra valor={p.pct} tono={tono} etiqueta="gastado" detalle={`${crc(p.gastado)} · ${pct(p.pct)}`} />
        <Barra valor={p.tiempoPct} tono="neutral" etiqueta="tiempo" detalle={`día ${p.diasTranscurridos} de ${p.dias}`} />
        {p.ritmo !== null && (
          <p className={`fz-ritmo fz-txt-${ritmoBien ? "bien" : "malo"}`}>
            {ritmoBien
              ? `Vas ${crc(p.ritmo)} por debajo del ritmo`
              : `Vas ${crc(-p.ritmo)} por encima del ritmo`}
          </p>
        )}
      </section>

      <section className="fz-grid">
        <Dato titulo="Puedes gastar por día" valor={crc(p.porDia)} nota={`Si sigues así cierras en ${crc(p.proyeccion)}`} />
        <Dato
          titulo="Gasto variable"
          valor={crc(p.gastoVariable)}
          nota={`Tarjeta ${crc(p.tarjeta)} · SINPE/efectivo ${crc(p.manual)}`}
        />
        {esMes && data.mes.ahorroProyectado !== undefined && (
          <Dato
            titulo="Ahorro del mes (proyectado)"
            valor={crc(data.mes.ahorroProyectado)}
            tono={data.mes.ahorroProyectado >= 0 ? "bien" : "malo"}
            nota={`Ingreso ${crc(data.mes.ingreso)} · fijos ${crc(data.mes.fijos)}${data.mes.extraordinarios ? ` · extraordinarios ${crc(data.mes.extraordinarios)}` : ""}`}
          />
        )}
        {data.mes.ahorroAcumulado !== undefined && (
          <Dato titulo="Ahorro acumulado" valor={crc(data.mes.ahorroAcumulado)} nota={`${p.transacciones} gastos en el periodo`} />
        )}
      </section>

      <GastoDiario periodo={p} />

      <section className="fz-grid fz-grid-2">
        <Lista titulo="En qué se va" items={p.categorias} tono="ambar" />
        <Lista titulo="Medio de pago" items={p.medios} tono="cian" />
      </section>

      {esMes && <Historico meses={data.historico} />}

      <Movimientos items={data.movimientos} />

      <p className="fz-pie">
        {data.incluyeManual ? "El presupuesto cuenta tarjeta, SINPE y efectivo." : "El presupuesto cuenta solo la tarjeta."} Sin
        gastos fijos ni extraordinarios.
      </p>
    </>
  )
}
