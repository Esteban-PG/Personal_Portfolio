"use client"

import { useEffect, useRef, useState } from "react"
import { crc, crcCorto, pct, diaCorto, diaSemana, sinAnimacion } from "@/lib/finanzas-formato"

const DIAS_CORTOS = ["L", "K", "M", "J", "V", "S", "D"]
const DIAS_LARGOS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"]
const COLORES = ["cian", "ambar", "bien", "neutral"]

// Lleva el número de su valor anterior al nuevo (al cambiar de vista o al refrescar).
// El primer render ya muestra el valor real, así el HTML del servidor nunca dice ₡0.
function useContador(objetivo, ms = 650) {
  const [valor, setValor] = useState(objetivo)
  const actual = useRef(objetivo)

  useEffect(() => {
    const desde = actual.current
    if (typeof objetivo !== "number" || typeof desde !== "number" || desde === objetivo || sinAnimacion()) {
      actual.current = objetivo
      setValor(objetivo)
      return
    }
    let raf
    const t0 = performance.now()
    const paso = t => {
      const k = Math.min((t - t0) / ms, 1)
      const v = desde + (objetivo - desde) * (1 - Math.pow(1 - k, 3))
      actual.current = v
      setValor(v)
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [objetivo, ms])

  return valor
}

export function Monto({ valor }) {
  return crc(useContador(valor))
}

// Ancho real del contenedor, para dibujar el SVG en píxeles (sin trazos deformados)
function useAncho() {
  const ref = useRef(null)
  const [ancho, setAncho] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setAncho(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, ancho]
}

// Título de tarjeta + detalle del elemento tocado a la derecha
function Encabezado({ titulo, detalle, clave }) {
  return (
    <div className="fz-card-top">
      <p className="fz-label">{titulo}</p>
      {detalle && (
        <p key={clave} className="fz-sel">
          {detalle}
        </p>
      )}
    </div>
  )
}

/* ---------- 2. anillos: gastado (afuera) vs tiempo (adentro) ---------- */

function Arco({ r, valor, clase }) {
  const c = 2 * Math.PI * r
  const v = Math.min(Math.max(valor || 0, 0), 1)
  return (
    <>
      <circle cx="50" cy="50" r={r} className="fz-anillo-pista" />
      {v > 0.001 && (
        <circle
          cx="50"
          cy="50"
          r={r}
          className={`fz-anillo fz-trazo-${clase}`}
          style={{ "--c": c, strokeDasharray: c, strokeDashoffset: c * (1 - v) }}
        />
      )}
    </>
  )
}

export function Anillos({ gasto, tiempo, tono }) {
  return (
    <div className="fz-anillos">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <Arco r={44} valor={gasto} clase={tono} />
        <Arco r={32} valor={tiempo} clase="neutral" />
      </svg>
      <span className={`fz-anillos-pct fz-txt-${tono === "neutral" ? "texto" : tono}`}>{pct(gasto)}</span>
    </div>
  )
}

/* ---------- 1. curva de gasto acumulado vs ideal y proyección ---------- */

export function CurvaAcumulada({ periodo }) {
  const [ref, ancho] = useAncho()
  const alto = 150
  const { diario, dias, presupuesto, proyeccion } = periodo

  let suma = 0
  const real = [{ x: 0, y: 0 }]
  diario.forEach((d, i) => {
    if (d.gasto === null) return
    suma += d.gasto
    real.push({ x: i + 1, y: suma })
  })
  const ultimo = real[real.length - 1]
  const tope = Math.max(presupuesto || 0, proyeccion || 0, suma, 1) * 1.08
  const X = x => (x / dias) * ancho
  const Y = y => alto - (y / tope) * alto
  const ruta = pts => pts.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ")

  const idealHoy = presupuesto ? (presupuesto / dias) * ultimo.x : null
  const sobre = idealHoy !== null && ultimo.y > idealHoy
  const conProyeccion = proyeccion !== null && proyeccion !== undefined && ultimo.x < dias

  return (
    <div className="fz-card">
      <p className="fz-label">Gasto acumulado</p>
      <div ref={ref} className="fz-curva" style={{ height: alto }}>
        {ancho > 0 && (
          <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Gasto acumulado del periodo">
            {presupuesto > 0 && (
              <>
                <line className="fz-curva-tope" x1="0" x2={ancho} y1={Y(presupuesto)} y2={Y(presupuesto)} />
                <path className="fz-curva-ideal" d={ruta([{ x: 0, y: 0 }, { x: dias, y: presupuesto }])} />
              </>
            )}
            <path
              className={`fz-curva-area ${sobre ? "fz-sobre" : ""}`}
              d={`${ruta(real)} L${X(ultimo.x).toFixed(1)},${alto} L0,${alto} Z`}
            />
            {conProyeccion && (
              <path
                className={`fz-curva-proy ${sobre ? "fz-sobre" : ""}`}
                d={ruta([ultimo, { x: dias, y: proyeccion }])}
              />
            )}
            <path className={`fz-curva-real ${sobre ? "fz-sobre" : ""}`} pathLength="1" d={ruta(real)} />
            <circle className={`fz-curva-pulso ${sobre ? "fz-sobre" : ""}`} cx={X(ultimo.x)} cy={Y(ultimo.y)} r="4" />
            <circle className={`fz-curva-punto ${sobre ? "fz-sobre" : ""}`} cx={X(ultimo.x)} cy={Y(ultimo.y)} r="4" />
          </svg>
        )}
        {presupuesto > 0 && (
          <span className="fz-curva-etq" style={{ top: Y(presupuesto) - 16 }}>
            presupuesto {crcCorto(presupuesto)}
          </span>
        )}
      </div>
      <ul className="fz-leyenda fz-leyenda-fila">
        <li>
          <i className={`fz-punto ${sobre ? "fz-malo" : "fz-ambar"}`} />
          real {crc(ultimo.y)}
        </li>
        {presupuesto > 0 && (
          <li>
            <i className="fz-punto fz-neutral" />
            ideal hoy {crc(idealHoy)}
          </li>
        )}
        {conProyeccion && (
          <li>
            <i className="fz-punto fz-punto-hueco" />
            cierras en {crc(proyeccion)}
          </li>
        )}
      </ul>
    </div>
  )
}

/* ---------- gasto por día (columnas), tocar una para ver el monto ---------- */

export function GastoDiario({ periodo }) {
  const [sel, setSel] = useState(null)
  const valores = periodo.diario.map(d => d.gasto || 0)
  const ideal = periodo.presupuesto ? periodo.presupuesto / periodo.dias : 0
  const max = Math.max(...valores, ideal, 1)
  const elegido = sel !== null ? periodo.diario[sel] : null

  return (
    <div className="fz-card">
      <Encabezado
        titulo="Gasto por día"
        clave={sel}
        detalle={elegido && `${diaCorto(elegido.dia)} · ${elegido.gasto === null ? "todavía no" : crc(elegido.gasto)}`}
      />
      <div className={`fz-cols ${elegido ? "fz-con-sel" : ""}`} role="img" aria-label="Gasto por día del periodo">
        {ideal > 0 && (
          <div className="fz-linea" style={{ bottom: `${(ideal / max) * 100}%` }}>
            <span>{crc(ideal)}/día</span>
          </div>
        )}
        {periodo.diario.map((d, i) => (
          <div
            key={d.dia}
            className={`fz-col ${sel === i ? "fz-elegida" : ""}`}
            title={`${diaCorto(d.dia)}: ${d.gasto === null ? "—" : crc(d.gasto)}`}
            onClick={() => setSel(sel === i ? null : i)}
          >
            <div
              className={`fz-col-barra ${d.gasto === null ? "fz-futuro" : d.gasto > ideal ? "fz-sobre" : ""}`}
              style={{
                "--i": i,
                height: d.gasto === null ? "3px" : `${Math.max((d.gasto / max) * 100, d.gasto > 0 ? 2 : 0)}%`,
              }}
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

/* ---------- 3. calendario con intensidad por día ---------- */

export function Calendario({ periodo }) {
  const [sel, setSel] = useState(null)
  const ideal = periodo.presupuesto ? periodo.presupuesto / periodo.dias : 0
  const max = Math.max(...periodo.diario.map(d => d.gasto || 0), 1)
  const primero = diaSemana(periodo.inicio)
  const elegido = sel !== null ? periodo.diario[sel] : null

  return (
    <div className="fz-card">
      <Encabezado
        titulo="Calendario"
        clave={sel}
        detalle={elegido && `${diaCorto(elegido.dia)} · ${elegido.gasto === null ? "todavía no" : crc(elegido.gasto)}`}
      />
      <div className="fz-cal">
        {DIAS_CORTOS.map(d => (
          <span key={d} className="fz-cal-dia">
            {d}
          </span>
        ))}
        {Array.from({ length: primero }, (_, i) => (
          <span key={`vacio-${i}`} />
        ))}
        {periodo.diario.map((d, i) => {
          const pos = primero + i
          const nivel = d.gasto ? Math.max(d.gasto / max, 0.15) : 0
          const clases = [
            "fz-cal-celda",
            d.gasto === null && "fz-futuro",
            ideal && d.gasto > ideal && "fz-sobre",
            nivel > 0.55 && "fz-oscuro",
            sel === i && "fz-elegida",
          ]
          return (
            <div
              key={d.dia}
              className={clases.filter(Boolean).join(" ")}
              style={{ "--nivel": `${Math.round(nivel * 100)}%`, "--d": Math.floor(pos / 7) + (pos % 7) }}
              onClick={() => setSel(sel === i ? null : i)}
            >
              {Number(d.dia.slice(8, 10))}
            </div>
          )
        })}
      </div>
      <div className="fz-cal-escala">
        <span>menos</span>
        {[0.15, 0.4, 0.7, 1].map(n => (
          <i key={n} style={{ "--nivel": `${n * 100}%` }} />
        ))}
        <span>más</span>
        {ideal > 0 && <span className="fz-cal-nota">borde rojo = sobre {crcCorto(ideal)}/día</span>}
      </div>
    </div>
  )
}

/* ---------- 4. promedio por día de la semana ---------- */

export function PorDiaSemana({ diario }) {
  const [sel, setSel] = useState(null)
  const sumas = Array(7).fill(0)
  const cuentas = Array(7).fill(0)
  diario.forEach(d => {
    if (d.gasto === null) return
    const w = diaSemana(d.dia)
    sumas[w] += d.gasto
    cuentas[w]++
  })
  const promedios = sumas.map((s, i) => (cuentas[i] ? s / cuentas[i] : 0))
  const max = Math.max(...promedios, 1)
  const mayor = promedios.indexOf(Math.max(...promedios))
  const hayDatos = cuentas.some(Boolean) && promedios[mayor] > 0

  return (
    <div className="fz-card">
      <Encabezado
        titulo="Promedio por día de la semana"
        clave={sel}
        detalle={sel !== null && `${DIAS_LARGOS[sel]} · ${crc(promedios[sel])}`}
      />
      <div className={`fz-semana ${sel !== null ? "fz-con-sel" : ""}`}>
        {promedios.map((v, i) => (
          <div
            key={i}
            className={`fz-semana-col ${sel === i ? "fz-elegida" : ""}`}
            onClick={() => setSel(sel === i ? null : i)}
          >
            <span className="fz-hist-valor">{v ? crcCorto(v) : ""}</span>
            <div className="fz-hist-area">
              <div
                className={`fz-hist-barra ${hayDatos && i === mayor ? "fz-actual" : ""}`}
                style={{ "--i": i, height: `${(v / max) * 100}%` }}
              />
            </div>
            <span className="fz-hist-mes">{DIAS_CORTOS[i]}</span>
          </div>
        ))}
      </div>
      {hayDatos && <p className="fz-nota">Donde más se te va: los {DIAS_LARGOS[mayor]}.</p>}
    </div>
  )
}

/* ---------- 5. medio de pago como una sola barra apilada ---------- */

export function MediosBarra({ items }) {
  const total = items.reduce((s, i) => s + Math.max(i.total, 0), 0)
  return (
    <div className="fz-card">
      <p className="fz-label">Medio de pago</p>
      {total === 0 ? (
        <p className="fz-nota">Sin gastos todavía.</p>
      ) : (
        <>
          <div className="fz-apilada">
            <div className="fz-apilada-relleno">
              {items.map((i, k) => (
                <div
                  key={i.nombre}
                  className={`fz-segmento fz-${COLORES[k % COLORES.length]}`}
                  style={{ width: `${(Math.max(i.total, 0) / total) * 100}%` }}
                />
              ))}
            </div>
          </div>
          <ul className="fz-leyenda">
            {items.map((i, k) => (
              <li key={i.nombre}>
                <i className={`fz-punto fz-${COLORES[k % COLORES.length]}`} />
                <span className="fz-leyenda-nombre">{i.nombre}</span>
                <span className="fz-leyenda-monto">
                  <Monto valor={i.total} /> · {pct(Math.max(i.total, 0) / total)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/* ---------- 6. los gastos más grandes del periodo ---------- */

export function TopGastos({ movimientos }) {
  const top = [...movimientos].filter(m => m.monto > 0).sort((a, b) => b.monto - a.monto).slice(0, 5)
  const max = Math.max(...top.map(m => m.monto), 1)
  return (
    <div className="fz-card">
      <p className="fz-label">Los más grandes</p>
      {top.length === 0 && <p className="fz-nota">Sin gastos en este periodo.</p>}
      <ol className="fz-lista fz-top">
        {top.map((m, i) => (
          <li key={`${m.fecha}-${i}`} style={{ "--i": i }}>
            <div className="fz-lista-top">
              <span>
                <b className="fz-top-n">{i + 1}</b> {m.detalle}
              </span>
              <span>{crc(m.monto)}</span>
            </div>
            <div className="fz-pista fz-pista-fina">
              <div className="fz-relleno fz-ambar" style={{ width: `${(m.monto / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------- 10. aviso de periodo cerrado ---------- */

export function Cierre({ cierre, onCerrar }) {
  const diferencia = (cierre.presupuesto || 0) - (cierre.gastado || 0)
  const bien = diferencia >= 0
  return (
    <div className={`fz-card fz-cierre ${bien ? "fz-cierre-bien" : "fz-cierre-malo"}`}>
      {bien ? (
        <svg className="fz-check" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" pathLength="1" />
          <path d="M7 12.5l3.2 3.2L17 9" pathLength="1" />
        </svg>
      ) : (
        <span className="fz-cierre-icono">!</span>
      )}
      <div className="fz-cierre-texto">
        <p className="fz-label">
          {cierre.vista} cerrada · {cierre.etiqueta}
        </p>
        <p>
          {bien ? "Cerraste " : "Te pasaste por "}
          <b className={bien ? "fz-txt-bien" : "fz-txt-malo"}>{crc(Math.abs(diferencia))}</b>
          {bien ? " abajo del presupuesto." : "."}
        </p>
      </div>
      <button onClick={onCerrar} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  )
}
