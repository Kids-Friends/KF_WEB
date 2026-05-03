import { useState, useEffect } from 'react'

const P = { REST:'REST API', WS:'WebSocket', MQTT:'MQTT', IPC:'Local IPC', JPA:'JPA/MySQL' }
const Tag = ({ t }) => {
  const map = { 'REST API':['badge-rest','REST'], WebSocket:['badge-ws','WS'], MQTT:['badge-mqtt','MQTT'], 'Local IPC':['badge-ipc','IPC'], 'JPA/MySQL':['badge-jpa','JPA'] }
  const [cls, label] = map[t] || ['badge-rest', t]
  return <span className={`proto-badge ${cls}`}>{label}</span>
}

const overviewNodes = [
  { icon:'🍓', title:'Raspberry Pi', sub:'Main Hub (Edge)', color:'#10b981', tags:['Edge Computing','Linux','GPIO'], body:'시스템의 중심 기기. 센서 제어, 백엔드 서버, DB를 모두 내부에서 실행하는 Edge Computing 허브.' },
  { icon:'⚡', title:'Spring Boot Server', sub:'Central API Server', color:'#3b82f6', tags:['REST API','WebSocket','내부통신'], body:'전체 통신의 중심. App 요청 처리, DB 저장, 센서 명령 전달, 실시간 WebSocket Push를 담당.' },
  { icon:'🗄️', title:'Database', sub:'MySQL / MariaDB', color:'#ec4899', tags:['MySQL','MariaDB','로컬'], body:'라즈베리파이 내부에서 실행되는 로컬 DB. 센서 데이터, 상태값, 이벤트 로그를 저장.' },
  { icon:'🐍', title:'Python Sensor Runtime', sub:'GPIO Controller', color:'#f59e0b', tags:['Python','GPIO','센서'], body:'Python 스크립트 기반 센서 제어. 온습도, 위험감지, 모터, LED 등 하드웨어 직접 제어.' },
  { icon:'🤖', title:'Temi Android App', sub:'Client Interface', color:'#8b5cf6', tags:['Android','REST','WebSocket'], body:'사용자 인터페이스. 상태 조회, 제어 명령, 실시간 이벤트 수신을 담당하는 클라이언트.' },
]

const flows = [
  {
    num:1, color:'#3b82f6', title:'Temi App ↔ Spring Boot ↔ DB',
    purpose:'단순 상태값 조회·저장', proto:'REST API',
    steps:['Temi Android App','  ↕ REST GET / POST','Spring Boot Server','  ↕ JPA','Database'],
    protos:['REST API'],
    examples:['로봇 상태 조회','센서 최신값 조회','설정값 변경','사용자 입력 저장'],
    note:'요청-응답 구조가 명확하므로 REST API가 적합. 구현이 단순하고 디버깅이 쉽다.',
  },
  {
    num:2, color:'#10b981', title:'Temi App → Spring Boot → Sensor',
    purpose:'센서·액추에이터 제어 명령', proto:'REST + IPC',
    steps:['Temi Android App','  ↓ REST POST','Spring Boot Server','  ↓ MQTT / Local IPC','Python Sensor Runtime','  ↓ GPIO','Sensor / Actuator'],
    protos:['REST API','Local IPC','MQTT'],
    examples:['모터 작동','LED 제어','부저 실행','센서 동작 시작','장치 상태 변경'],
    note:'App은 서버를 반드시 거쳐 명령을 전달. Spring Boot가 명령을 검증·로그 후 센서 코드에 전달.',
  },
  {
    num:3, color:'#ec4899', title:'Sensor Runtime → Spring Boot → DB',
    purpose:'주기적 센서 데이터 저장', proto:'REST or IPC',
    steps:['Python Sensor Runtime','  ↓ REST POST / Local IPC','Spring Boot Server','  ↓ JPA','Database'],
    protos:['REST API','Local IPC','JPA/MySQL'],
    examples:['온도·습도 주기 저장','거리 센서값','움직임 감지 여부','센서 상태값'],
    note:'주기적 저장이라면 REST API로 충분. 같은 기기 내부라면 더 가벼운 Local IPC도 검토 가능.',
  },
  {
    num:4, color:'#8b5cf6', title:'Sensor → Spring Boot → Temi App',
    purpose:'위험 감지 즉시 실시간 알림', proto:'IPC + WebSocket',
    steps:['Python Sensor Runtime','  ↓ REST / MQTT / Local IPC','Spring Boot Server','  ↓ WebSocket Push','Temi Android App'],
    protos:['REST API','MQTT','Local IPC','WebSocket'],
    examples:['위험 상황 감지','충돌 감지','임계값 초과','사용자 호출 감지','긴급 이벤트'],
    note:'App이 폴링하지 않아도 서버가 즉시 Push할 수 있어야 하므로 WebSocket이 필수.',
  },
]

const protoTable = [
  { seg:'App → Spring Boot',        purpose:'조회, 저장, 명령 요청',       proto:'REST API',         cls:'badge-rest', reason:'구조가 단순하고 구현이 쉬움' },
  { seg:'Spring Boot → DB',         purpose:'데이터 저장/조회',             proto:'JPA/MySQL',        cls:'badge-jpa',  reason:'일반적인 백엔드 데이터 처리' },
  { seg:'Spring Boot → Sensor',     purpose:'센서/액추에이터 제어 명령',    proto:'Local IPC or MQTT',cls:'badge-ipc',  reason:'비동기 제어, 같은 기기면 IPC가 더 가벼움' },
  { seg:'Sensor → Spring Boot',     purpose:'센서 데이터 전달',             proto:'REST or Local IPC',cls:'badge-rest', reason:'주기적 저장에 적합, IPC도 검토 가능' },
  { seg:'Spring Boot → App',        purpose:'실시간 알림 Push',             proto:'WebSocket',        cls:'badge-ws',   reason:'서버→앱 즉시 Push 필요' },
]

const questions = [
  { q:'센서가 라즈베리파이에 직접 연결되어 있고, Spring Boot와 Python이 같은 기기에서 실행될 때 MQTT를 사용하는 것이 적절한가?', hint:'MQTT는 분산 환경용 프로토콜. 단일 기기 내부라면 오버헤드가 될 수 있다.' },
  { q:'Spring Boot ↔ Python Sensor Runtime 사이 통신으로 REST, MQTT, Unix Domain Socket, Local TCP, 파일 Queue, Redis Pub/Sub 중 어느 것이 가장 적절한가?', hint:'MVP에서는 Local TCP 또는 REST가 단순하고 디버깅이 쉬움. 규모가 커지면 Redis 고려.' },
  { q:'센서 데이터 저장, 실시간 알림, 액추에이터 제어를 하나의 Spring Boot 서버가 모두 담당하는 구조가 유지보수성·안정성 측면에서 적절한가?', hint:'MVP에서는 단일 서버가 단순하고 관리하기 쉬움. 확장 시 기능별 분리를 고려.' },
  { q:'MVP 단계에서는 MQTT 없이 REST API + WebSocket + Python Script 구조로 시작하는 것이 더 단순하고 안정적인가?', hint:'현재 아키텍처 조건에서는 YES. MQTT는 외부 MCU나 다중 노드 추가 시 도입 권장.' },
]

export default function ArchPage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="page">
      {/* NAV */}
      <nav className="arch-nav" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}>
        <div className="nav-brand">
          <div className="nav-brand-dot" />
          <span className="nav-brand-text">Edge Computing Architecture</span>
        </div>
        <div className="nav-right">
          {['#overview','#diagram','#flows','#protocol','#review','#mvp'].map((h,i) => (
            <a key={h} href={h} className="nav-pill">{['Overview','Diagram','Flows','Protocol','Review','MVP'][i]}</a>
          ))}
          <a href="/" className="nav-pill nav-home">← Main</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">🍓 Raspberry Pi Edge Computing</div>
          <h1 className="hero-title">
            <span>Edge Computing</span><br />Communication Architecture
          </h1>
          <p className="hero-sub">
            라즈베리파이를 Main Hub로, Spring Boot를 중앙 서버로 하는 로컬 센서 제어 및 실시간 통신 구조.
            클라우드 없이 단일 기기 내에서 완결되는 Edge Computing 설계.
          </p>
          <div className="hero-badges">
            {[P.REST,P.WS,P.MQTT,P.IPC,P.JPA].map(t => <Tag key={t} t={t} />)}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* SYSTEM OVERVIEW */}
      <section className="section" id="overview">
        <div className="container">
          <div className="sec-label">System Overview</div>
          <h2 className="sec-title">전체 시스템 구성</h2>
          <p className="sec-sub">라즈베리파이 단일 기기 내에서 센서 제어부터 API 서버, DB까지 모두 처리하는 Edge 구조.</p>
          <div className="overview-grid">
            {overviewNodes.map(n => (
              <div key={n.title} className="card overview-card">
                <div className="ov-accent" style={{ background: n.color }} />
                <div className="ov-icon">{n.icon}</div>
                <div className="ov-title">{n.title}</div>
                <div className="ov-sub" style={{ color: n.color }}>{n.sub}</div>
                <div className="ov-body">{n.body}</div>
                <div className="ov-tags">{n.tags.map(t => <span key={t} className="ov-tag">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ARCHITECTURE DIAGRAM */}
      <section className="section" id="diagram">
        <div className="container">
          <div className="sec-label">Architecture Diagram</div>
          <h2 className="sec-title">통신 구조 다이어그램</h2>
          <p className="sec-sub">Spring Boot를 중심으로 모든 통신이 흐르는 Hub-and-Spoke 구조.</p>

          <div className="arch-diagram">
            {/* External: Temi App */}
            <div className="arch-external">
              <div className="arch-node node-temi" style={{ minWidth: 200 }}>
                <div className="arch-node-icon">🤖</div>
                <div className="arch-node-title">Temi Android App</div>
                <div className="arch-node-sub">Client · UI</div>
              </div>
            </div>

            <div className="arch-arrows" style={{ marginTop: 12 }}>
              <div className="arch-arrow-item">
                <span className="arch-arrow-label aa-rest">REST API</span>
                <div className="arrow-v">⇅</div>
                <span className="arch-arrow-label aa-ws">WebSocket Push</span>
              </div>
            </div>

            {/* Raspberry Pi wrapper */}
            <div className="rpi-wrapper">
              <div className="rpi-label">🍓 Raspberry Pi — Edge Computing Hub</div>
              <div className="rpi-inner">
                <div className="arch-node node-springboot">
                  <div className="arch-node-icon">⚡</div>
                  <div className="arch-node-title">Spring Boot Server</div>
                  <div className="arch-node-sub">Central API · WebSocket</div>
                </div>
                <div className="arch-node node-db">
                  <div className="arch-node-icon">🗄️</div>
                  <div className="arch-node-title">MySQL / MariaDB</div>
                  <div className="arch-node-sub">Local Database</div>
                </div>
                <div className="arch-node node-python">
                  <div className="arch-node-icon">🐍</div>
                  <div className="arch-node-title">Python Sensor Runtime</div>
                  <div className="arch-node-sub">GPIO Controller</div>
                </div>
              </div>

              <div className="arch-arrows" style={{ marginTop: 16, marginBottom: 4 }}>
                <div className="arch-arrow-item">
                  <span className="arch-arrow-label aa-jpa">JPA / MySQL</span>
                  <div className="arrow-v" style={{ fontSize: 14 }}>↕ &nbsp;&nbsp;&nbsp;&nbsp;</div>
                </div>
                <div className="arch-arrow-item">
                  <span className="arch-arrow-label aa-ipc">Local IPC / REST</span>
                  <div className="arrow-v" style={{ fontSize: 14 }}>&nbsp;&nbsp;&nbsp;&nbsp; ↕</div>
                </div>
              </div>
            </div>

            <div className="arch-arrows">
              <div className="arch-arrow-item">
                <div className="arrow-v">↓</div>
                <span className="arch-arrow-label aa-mqtt">GPIO</span>
              </div>
            </div>

            {/* External: Sensors */}
            <div className="arch-external">
              <div className="arch-node node-sensor">
                <div className="arch-node-icon">🌡️</div>
                <div className="arch-node-title">Sensor / Actuator</div>
                <div className="arch-node-sub">온습도 · 모터 · LED · 부저</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* COMMUNICATION FLOWS */}
      <section className="section" id="flows">
        <div className="container">
          <div className="sec-label">Communication Flow</div>
          <h2 className="sec-title">통신 흐름 4가지</h2>
          <p className="sec-sub">목적에 따라 REST API, WebSocket, Local IPC를 구분해 사용한다.</p>
          <div className="flow-grid">
            {flows.map(f => (
              <div key={f.num} className="card flow-card">
                <div className="flow-header">
                  <div className="flow-num" style={{ background: f.color }}>{'①②③④'[f.num-1]}</div>
                  <div>
                    <div className="flow-title">{f.title}</div>
                    <div className="flow-purpose">{f.purpose}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 12 }}>
                  {f.protos.map(p => <Tag key={p} t={p} />)}
                </div>
                <div className="flow-steps">
                  {f.steps.map((s,i) => <div key={i}>{s}</div>)}
                </div>
                <div className="flow-examples">
                  {f.examples.map(e => <span key={e} className="flow-ex">{e}</span>)}
                </div>
                <p className="flow-note" style={{ marginTop: 12 }}>{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* PROTOCOL TABLE */}
      <section className="section" id="protocol">
        <div className="container">
          <div className="sec-label">Protocol Decision</div>
          <h2 className="sec-title">프로토콜 역할 구분</h2>
          <p className="sec-sub">구간별로 통신 목적에 맞는 프로토콜을 선택한 이유.</p>
          <table className="proto-table">
            <thead>
              <tr>
                <th>구간</th><th>목적</th><th>추천 프로토콜</th><th>이유</th>
              </tr>
            </thead>
            <tbody>
              {protoTable.map(r => (
                <tr key={r.seg}>
                  <td className="td-segment">{r.seg}</td>
                  <td>{r.purpose}</td>
                  <td><span className={`proto-badge ${r.cls}`} style={{ fontSize:11 }}>{r.proto}</span></td>
                  <td className="td-reason">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="divider" />

      {/* REVIEW QUESTIONS */}
      <section className="section" id="review">
        <div className="container">
          <div className="sec-label">Architecture Review</div>
          <h2 className="sec-title">검토해야 할 핵심 질문</h2>
          <p className="sec-sub">현재 설계에서 팀이 함께 논의해야 할 아키텍처 결정 포인트.</p>
          <div className="q-grid">
            {questions.map((q,i) => (
              <div key={i} className="card q-card">
                <div className="q-num">QUESTION {String(i+1).padStart(2,'0')}</div>
                <div className="q-text">{q.q}</div>
                <div className="q-hint">💡 {q.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* MVP ARCHITECTURE */}
      <section className="section" id="mvp">
        <div className="container">
          <div className="sec-label">Recommended MVP Architecture</div>
          <h2 className="sec-title">MVP 추천 구조</h2>
          <p className="sec-sub">MQTT를 최소화하고 REST + WebSocket + Local IPC로 단순하게 시작한다.</p>
          <div className="mvp-grid">
            <div>
              <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>MVP 통신 흐름</div>
              <div className="mvp-diagram">
                <div style={{ color:'var(--ws)', fontWeight:700 }}>Temi Android App</div>
                <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ <span style={{color:'var(--rest)'}}>REST API</span> / <span style={{color:'var(--ws)'}}>WebSocket</span></div>
                <div style={{ color:'var(--rest)', fontWeight:700 }}>Spring Boot Server</div>
                <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ <span style={{color:'var(--ipc)'}}>Local IPC</span> / <span style={{color:'var(--rest)'}}>REST</span></div>
                <div style={{ color:'var(--ipc)', fontWeight:700 }}>Python Sensor Runtime</div>
                <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ <span style={{color:'#f59e0b'}}>GPIO</span></div>
                <div style={{ color:'#f59e0b', fontWeight:700 }}>Sensor / Actuator</div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>MQTT 도입이 필요한 경우</div>
                <div className="when-grid">
                  <div className="card when-card-yes">
                    <div className="when-title"><span style={{color:'var(--mqtt)'}}>▶</span> MQTT 도입 시점</div>
                    <ul className="when-list yes-list">
                      {['센서 노드가 여러 개로 증가','ESP32/Arduino 외부 MCU 추가','센서·서버 물리적 분리','비동기 Pub/Sub 구조 필요','이벤트 양이 많아지는 경우'].map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                  <div className="card when-card-no">
                    <div className="when-title"><span style={{color:'var(--ipc)'}}>◆</span> MQTT 없이 가능한 경우</div>
                    <ul className="when-list no-list">
                      {['센서가 라즈베리파이에 직접 연결','모든 코드가 같은 기기에서 실행','센서 노드가 1~2개인 경우','단순 주기적 데이터 저장'].map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>MVP의 장점</div>
              <ul className="mvp-pros">
                {[
                  'MQTT 브로커(Mosquitto 등) 설치·관리 불필요',
                  'Spring Boot와 Python 간 통신을 REST로 통일해 디버깅 용이',
                  'WebSocket으로 실시간 알림은 충분히 구현 가능',
                  '단일 기기 내부 통신이라 네트워크 지연 최소',
                  '구조가 단순해 팀원 모두 빠르게 파악 가능',
                  '추후 MQTT 도입 시 Python 쪽만 수정하면 됨',
                ].map(t => <li key={t}>{t}</li>)}
              </ul>
              <div style={{ marginTop: 28 }}>
                <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Future Expansion — MQTT 도입 후</div>
                <div className="mvp-diagram" style={{ fontSize: 12 }}>
                  <div style={{ color:'var(--ws)', fontWeight:700 }}>Temi Android App</div>
                  <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ REST / WebSocket</div>
                  <div style={{ color:'var(--rest)', fontWeight:700 }}>Spring Boot Server</div>
                  <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ <span style={{color:'var(--mqtt)'}}>MQTT Subscribe</span></div>
                  <div style={{ color:'var(--mqtt)', fontWeight:700 }}>MQTT Broker (Mosquitto)</div>
                  <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ MQTT Publish</div>
                  <div style={{ color:'var(--ipc)', fontWeight:700 }}>ESP32 / Arduino / RPi GPIO</div>
                  <div style={{ color:'var(--text-3)', paddingLeft:8 }}>⇅ SPI / I2C / GPIO</div>
                  <div style={{ color:'#f59e0b', fontWeight:700 }}>Multiple Sensor Nodes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CONCLUSION */}
      <section className="section">
        <div className="container">
          <div className="sec-label">Conclusion</div>
          <h2 className="sec-title">핵심 결론</h2>
          <div className="conclusion" style={{ marginTop: 32 }}>
            <p className="conclusion-text">
              <strong>Spring Boot를 중앙 통제 서버로 두고, Temi App · DB · 센서 제어 코드를 연결하는 방향은 적절하다.</strong>
              <br /><br />
              다만 센서가 라즈베리파이에 직접 연결되어 있고, Spring Boot와 Python 코드가{' '}
              <strong>같은 기기 내부에서 실행된다면 MQTT는 필수가 아니다.</strong>
              <br /><br />
              <strong>MVP 단계에서는</strong> REST API + WebSocket + 로컬 Python Sensor Runtime 구조로 단순하게 시작하고,
              추후 <strong>외부 MCU나 다중 센서 노드가 추가될 때 MQTT를 도입</strong>하는 방향이 더 현실적이고 안정적이다.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="arch-footer">
        <p>Kids-Friends Robot — Edge Computing Architecture Document · 2025</p>
        <p style={{ marginTop: 8 }}>
          <a href="/" style={{ color:'var(--rest)', fontSize:13 }}>← 메인 페이지로 돌아가기</a>
        </p>
      </footer>
    </div>
  )
}
