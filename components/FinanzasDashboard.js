"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ZONA, crc, diaCR, estado, sinAnimacion } from "@/lib/finanzas-formato"
import {
  Monto,
  Anillos,
  CurvaAcumulada,
  GastoDiario,
  Calendario,
  PorDiaSemana,
  MediosBarra,
  TopGastos,
  Cierre,
} from "@/components/FinanzasGraficos"

const VISTAS = [
  { id: "mes", nombre: "Mes" },
  { id: "quincena", nombre: "Quincena" },
  { id: "semana", nombre: "Semana" },
]
const REFRESCO_MS = 2 * 60 * 1000
const JALON_MAX = 90 // px que baja el indicador como máximo
const JALON_UMBRAL = 60 // px para que soltar actualice

function hace(iso, ahora) {
  const min = Math.round((ahora - new Date(iso).getTime()) / 60000)
  if (min < 1) return "hace un momento"
  if (min === 1) return "hace 1 min"
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  return h === 1 ? "hace 1 hora" : `hace ${h} horas`
}

function Dato({ titulo, valor, nota, tono, className = "" }) {
  return (
    <div className={`fz-card fz-dato ${className}`}>
      <p className="fz-label">{titulo}</p>
      <p className={`fz-valor ${tono ? `fz-txt-${tono}` : ""}`}>{valor}</p>
      {nota && <p className="fz-nota">{nota}</p>}
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
              <span>
                <Monto valor={i.total} />
              </span>
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
                style={{ "--i": i, height: `${(m.gasto / max) * 100}%` }}
              />
            </div>
            <span className="fz-hist-mes">{m.etiqueta.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Movimientos({ items, etiqueta }) {
  return (
    <div className="fz-card">
      <p className="fz-label">Últimos movimientos · {etiqueta}</p>
      {items.length === 0 && <p className="fz-nota">Sin movimientos en este periodo.</p>}
      <ul className="fz-movs">
        {items.map((m, i) => {
          const f = new Date(m.fecha)
          const fecha = f.toLocaleDateString("es-CR", { day: "numeric", month: "short", timeZone: ZONA })
          return (
            <li key={`${m.fecha}-${i}`} style={{ "--i": Math.min(i, 10) }}>
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
  const [cierres, setCierres] = useState([])
  const cuerpo = useRef(null)
  const jalon = useRef(null)
  const vistaAnterior = useRef(0)

  function refrescar() {
    setRefrescando(true)
    router.refresh()
  }
  const refrescarRef = useRef(refrescar)
  refrescarRef.current = refrescar

  // Refresca cada 2 minutos solo con la pestaña visible, y apenas vuelves a ella
  useEffect(() => {
    const visible = () => document.visibilityState === "visible"
    setAhora(Date.now())
    const reloj = setInterval(() => visible() && setAhora(Date.now()), 30000)
    const datos = setInterval(() => visible() && router.refresh(), REFRESCO_MS)
    function alVolver() {
      if (!visible()) return
      setAhora(Date.now())
      router.refresh()
    }
    document.addEventListener("visibilitychange", alVolver)
    return () => {
      clearInterval(reloj)
      clearInterval(datos)
      document.removeEventListener("visibilitychange", alVolver)
    }
  }, [router])

  useEffect(() => setRefrescando(false), [data])

  // Gestos táctiles: deslizar de lado cambia de vista; jalar hacia abajo desde arriba actualiza
  // (instalada como app en iOS no existe el "pull to refresh" del navegador).
  useEffect(() => {
    let x0 = null
    let y0 = 0
    let arriba = false
    let modo = null // null mientras decide · "deslizar" · "jalar" · "nada"

    function pintar(d) {
      const el = jalon.current
      if (!el) return
      el.style.transition = "none"
      el.style.opacity = String(Math.min(d / JALON_UMBRAL, 1))
      el.style.transform = `translateY(${d - 48}px)`
      el.firstChild.style.transform = `rotate(${d * 4}deg)`
      el.classList.toggle("fz-listo", d >= JALON_UMBRAL)
    }
    function soltar() {
      const el = jalon.current
      if (!el) return
      el.style.transition = el.style.opacity = el.style.transform = el.firstChild.style.transform = ""
      el.classList.remove("fz-listo")
    }

    function inicio(e) {
      if (e.touches.length !== 1) {
        x0 = null
        return
      }
      x0 = e.touches[0].clientX
      y0 = e.touches[0].clientY
      arriba = window.scrollY <= 0
      modo = null
    }
    function mover(e) {
      if (x0 === null || modo === "nada" || modo === "deslizar") return
      const dx = e.touches[0].clientX - x0
      const dy = e.touches[0].clientY - y0
      if (!modo) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
        if (Math.abs(dx) > Math.abs(dy) * 1.5) modo = "deslizar"
        else if (dy > 0 && arriba) modo = "jalar"
        else modo = "nada"
      }
      if (modo === "jalar") pintar(Math.min(Math.max(dy, 0) * 0.5, JALON_MAX))
    }
    function fin(e) {
      if (x0 === null) return
      const t = e.changedTouches[0]
      const dx = t.clientX - x0
      const dy = t.clientY - y0
      if (modo === "deslizar" && Math.abs(dx) > 60) {
        setVista(actual => {
          const i = VISTAS.findIndex(v => v.id === actual) + (dx < 0 ? 1 : -1)
          return VISTAS[Math.min(Math.max(i, 0), VISTAS.length - 1)].id
        })
      }
      if (modo === "jalar") {
        soltar()
        if (Math.min(dy * 0.5, JALON_MAX) >= JALON_UMBRAL) refrescarRef.current()
      }
      x0 = null
    }

    const pasivo = { passive: true }
    document.addEventListener("touchstart", inicio, pasivo)
    document.addEventListener("touchmove", mover, pasivo)
    document.addEventListener("touchend", fin, pasivo)
    document.addEventListener("touchcancel", soltar, pasivo)
    return () => {
      document.removeEventListener("touchstart", inicio, pasivo)
      document.removeEventListener("touchmove", mover, pasivo)
      document.removeEventListener("touchend", fin, pasivo)
      document.removeEventListener("touchcancel", soltar, pasivo)
    }
  }, [])

  // Al cambiar de vista el contenido entra desde el lado hacia donde fuiste
  useEffect(() => {
    const i = VISTAS.findIndex(v => v.id === vista)
    const dir = Math.sign(i - vistaAnterior.current)
    vistaAnterior.current = i
    if (!dir || !cuerpo.current?.animate || sinAnimacion()) return
    cuerpo.current.animate(
      [
        { transform: `translateX(${dir * 36}px)`, opacity: 0.2 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 320, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" }
    )
  }, [vista])

  // Periodos cerrados desde la última visita. Se guarda lo último que viste de cada periodo
  // en este navegador; si el periodo ya cambió, se avisa cómo cerró (una sola vez).
  useEffect(() => {
    if (!data) return
    const nuevos = []
    for (const v of VISTAS) {
      const p = data[v.id]
      if (!p) continue
      const clave = `fz-cierre-${v.id}`
      try {
        const antes = JSON.parse(localStorage.getItem(clave) || "null")
        if (antes && antes.fin < p.inicio && antes.presupuesto) nuevos.push({ ...antes, id: v.id, vista: v.nombre })
        const { inicio, fin, etiqueta, presupuesto, gastado } = p
        localStorage.setItem(clave, JSON.stringify({ inicio, fin, etiqueta, presupuesto, gastado }))
      } catch {}
    }
    if (nuevos.length) setCierres(c => [...c.filter(x => !nuevos.some(n => n.id === x.id)), ...nuevos])
  }, [data])

  async function salir() {
    await fetch("/api/finanzas/logout", { method: "POST" })
    router.refresh()
  }

  const indicador = (
    <div ref={jalon} className={`fz-jalar ${refrescando ? "fz-cargando" : ""}`} aria-hidden="true">
      <span>↻</span>
    </div>
  )

  const encabezado = (
    <header className="fz-head">
      <p className="fz-prompt">
        <span className="prompt">➜ ~</span> <span className="cmd">./finanzas</span>
      </p>
      <div className="fz-acciones">
        {data && ahora && <span className="fz-nota">{hace(data.generado, ahora)}</span>}
        <button onClick={refrescar} disabled={refrescando} aria-label="Actualizar">
          <span className={`fz-icono ${refrescando ? "fz-gira" : ""}`}>↻</span>
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
        {indicador}
      </>
    )
  }

  const p = data[vista]
  const tono = estado(p.pct)
  const ritmoBien = (p.ritmo || 0) >= 0
  const esMes = vista === "mes"
  const pasado = p.queda !== null && p.queda < 0
  const indice = VISTAS.findIndex(v => v.id === vista)
  const movimientos = data.movimientos.filter(m => {
    const dia = diaCR(m.fecha)
    return dia >= p.inicio && dia <= p.fin
  })

  return (
    <>
      {encabezado}

      <div className="fz-tabs" role="group" aria-label="Vista" style={{ "--i": indice, "--n": VISTAS.length }}>
        <span className="fz-tabs-marca" aria-hidden="true" />
        {VISTAS.map(v => (
          <button
            key={v.id}
            className={vista === v.id ? "activo" : ""}
            aria-pressed={vista === v.id}
            onClick={() => setVista(v.id)}
          >
            {v.nombre}
          </button>
        ))}
      </div>

      {cierres.map(c => (
        <Cierre key={c.id} cierre={c} onCerrar={() => setCierres(cs => cs.filter(x => x.id !== c.id))} />
      ))}

      <div ref={cuerpo} className="fz-cuerpo">
        <section className="fz-card fz-hero">
          <p className="fz-label">Te queda · {p.etiqueta}</p>
          <p className={`fz-grande fz-txt-${pasado ? "malo" : "texto"}`}>
            <Monto valor={p.queda} />
          </p>
          <p className="fz-nota">
            de {crc(p.presupuesto)} · {p.diasRestantes} {p.diasRestantes === 1 ? "día" : "días"} por delante
          </p>
          <div className="fz-hero-anillos">
            <Anillos gasto={p.pct} tiempo={p.tiempoPct} tono={tono} />
            <ul className="fz-leyenda">
              <li>
                <i className={`fz-punto fz-${tono}`} />
                <span className="fz-leyenda-nombre">gastado</span>
                <span className="fz-leyenda-monto">
                  <Monto valor={p.gastado} />
                </span>
              </li>
              <li>
                <i className="fz-punto fz-neutral" />
                <span className="fz-leyenda-nombre">tiempo</span>
                <span className="fz-leyenda-monto">
                  día {p.diasTranscurridos} de {p.dias}
                </span>
              </li>
              {p.ritmo !== null && (
                <li className={`fz-ritmo fz-txt-${ritmoBien ? "bien" : "malo"}`}>
                  {ritmoBien ? `${crc(p.ritmo)} por debajo del ritmo` : `${crc(-p.ritmo)} por encima del ritmo`}
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="fz-grid">
          {pasado ? (
            <Dato
              titulo="Puedes gastar por día"
              valor="Sin margen"
              tono="malo"
              nota={`Te pasaste por ${crc(-p.queda)} · cierras en ${crc(p.proyeccion)}`}
            />
          ) : (
            <Dato
              titulo="Puedes gastar por día"
              valor={<Monto valor={p.porDia} />}
              nota={`Si sigues así cierras en ${crc(p.proyeccion)}`}
            />
          )}
          <Dato
            titulo="Gasto variable"
            valor={<Monto valor={p.gastoVariable} />}
            nota={`Tarjeta ${crc(p.tarjeta)} · SINPE/efectivo ${crc(p.manual)}`}
          />
          {esMes && data.mes.ahorroProyectado !== undefined && (
            <Dato
              className="fz-aparece"
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

        {/* key = vista: al cambiar de vista los gráficos se vuelven a dibujar */}
        <CurvaAcumulada key={`curva-${vista}`} periodo={p} />

        <GastoDiario key={`diario-${vista}`} periodo={p} />

        {vista !== "semana" && <Calendario key={`cal-${vista}`} periodo={p} />}

        <section className="fz-grid fz-grid-2">
          <Lista titulo="En qué se va" items={p.categorias} tono="ambar" />
          <MediosBarra items={p.medios} />
        </section>

        <TopGastos key={`top-${vista}`} movimientos={movimientos} />

        {esMes && <PorDiaSemana diario={data.mes.diario} />}

        {esMes && <Historico meses={data.historico} />}

        <Movimientos key={`movs-${vista}`} items={movimientos} etiqueta={p.etiqueta} />
      </div>

      <p className="fz-pie">
        {data.incluyeManual ? "El presupuesto cuenta tarjeta, SINPE y efectivo." : "El presupuesto cuenta solo la tarjeta."} Sin
        gastos fijos ni extraordinarios.
      </p>

      {indicador}
    </>
  )
}
