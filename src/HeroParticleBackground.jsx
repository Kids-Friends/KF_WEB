import { useEffect, useRef } from 'react'

/*
  Particles = sensor data nodes floating in space
  Lines     = live connections between robot, users, space
  Cursor    = robot responding to presence in real time
*/

const PALETTE = [
  [79,  142, 247],   // blue
  [45,  212, 191],   // mint
  [167, 139, 250],   // soft purple
  [147, 197, 253],   // light blue
  [248, 187, 208],   // soft pink
]

function makeParticle(w, h, isHub) {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r: isHub ? Math.random() * 1.5 + 2.5 : Math.random() * 1.2 + 0.7,
    opacity: isHub ? Math.random() * 0.3 + 0.4 : Math.random() * 0.25 + 0.12,
    color,
    /* independent sine/cosine phase for smooth organic drift */
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
    isHub,
  }
}

export default function HeroParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    /* Respect prefers-reduced-motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const mouse = { x: -9999, y: -9999 }
    let particles = []
    let raf
    let connectDist = 130
    let mouseR = 110

    function setup() {
      const parent = canvas.parentElement
      const w = (canvas.width  = parent.offsetWidth)
      const h = (canvas.height = parent.offsetHeight)

      const mobile    = w < 768
      const hubCount  = mobile ? 4  : 9
      const total     = mobile ? 24 : 58

      connectDist = mobile ? 80  : 130
      mouseR      = mobile ? 55  : 110

      particles = [
        ...Array.from({ length: hubCount },       () => makeParticle(w, h, true)),
        ...Array.from({ length: total - hubCount }, () => makeParticle(w, h, false)),
      ]
    }

    function draw() {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const cd2 = connectDist * connectDist
      const mr2 = mouseR * mouseR

      /* ── Update positions ── */
      for (const p of particles) {
        p.phase += p.phaseSpeed
        /* organic drift using two uncorrelated sinusoids */
        p.x += p.vx + Math.sin(p.phase)          * 0.14
        p.y += p.vy + Math.cos(p.phase * 0.71)   * 0.10

        /* toroidal wrap so particles never disappear */
        if (p.x < -20)    p.x = w + 20
        else if (p.x > w + 20) p.x = -20
        if (p.y < -20)    p.y = h + 20
        else if (p.y > h + 20) p.y = -20

        /* gentle repulsion — robot sensing nearby presence */
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < mr2 && d2 > 1) {
          const d  = Math.sqrt(d2)
          const f  = (1 - d / mouseR) * 0.9
          p.x += (dx / d) * f
          p.y += (dy / d) * f
        }
      }

      /* ── Connection lines (sensor network) ── */
      ctx.lineWidth = 0.65
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a  = particles[i]
          const b  = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < cd2) {
            const alpha = (1 - Math.sqrt(d2) / connectDist) * 0.13
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(110,165,255,${alpha})`
            ctx.stroke()
          }
        }
      }

      /* ── Draw particles ── */
      for (const p of particles) {
        const [r, g, b] = p.color

        /* hub nodes get a subtle radial glow — "key sensor points" */
        if (p.isHub) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
          grd.addColorStop(0, `rgba(${r},${g},${b},${+(p.opacity * 0.35).toFixed(3)})`)
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    /* Track mouse on the hero section (canvas is pointer-events:none) */
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const onResize     = () => { setup() }

    setup()
    raf = requestAnimationFrame(draw)

    const hero = canvas.parentElement
    hero.addEventListener('mousemove',  onMouseMove)
    hero.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize',   onResize)

    return () => {
      cancelAnimationFrame(raf)
      hero.removeEventListener('mousemove',  onMouseMove)
      hero.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize',   onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
