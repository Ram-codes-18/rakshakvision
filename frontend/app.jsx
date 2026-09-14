// RakshakVision - High-Fidelity Command & Control Application
const { useState, useEffect, useRef } = React;

// Helper: Lucide Icon component renderer
const Icon = ({ name, className = "w-5 h-5" }) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [name]);
  return <i data-lucide={name} class={className}></i>;
};

// Initial Mock Datasets
const INITIAL_CAMERAS = [
  { id: 'CAM-01', name: 'Sector A1 - Outer Perimeter', location: 'Border Sector Alpha', zone: 'Safe Zone', direction: 'NORTH → SOUTH', status: 'ONLINE', fps: 25, edgeNode: 'EDGE-NODE-01', threatLevel: 'LOW', aiActive: true, count: 2 },
  { id: 'CAM-02', name: 'Sector A2 - Fence Sector', location: 'Border Fence Line 12', zone: 'Buffer Zone', direction: 'NORTH → SOUTH', status: 'ONLINE', fps: 24, edgeNode: 'EDGE-NODE-01', threatLevel: 'MEDIUM', aiActive: true, count: 1 },
  { id: 'CAM-03', name: 'Sector B1 - Boundary Post', location: 'Border Outpost 04', zone: 'Buffer Zone', direction: 'NORTH → SOUTH', status: 'ONLINE', fps: 25, edgeNode: 'EDGE-NODE-01', threatLevel: 'HIGH', aiActive: true, count: 1 },
  { id: 'CAM-04', name: 'Sector B2 - Vehicle Checkpoint', location: 'Checkpoint Bravo', zone: 'Safe Zone', direction: 'EAST → WEST', status: 'ONLINE', fps: 30, edgeNode: 'EDGE-NODE-02', threatLevel: 'LOW', aiActive: true, count: 3 },
  { id: 'CAM-05', name: 'Sector C1 - Restricted Zone', location: 'Restricted Line 09', zone: 'Restricted Zone', direction: 'NORTH → SOUTH', status: 'ONLINE', fps: 25, edgeNode: 'EDGE-NODE-02', threatLevel: 'CRITICAL', aiActive: true, count: 1 },
  { id: 'CAM-06', name: 'Sector C2 - Night Thermal', location: 'Thermal Tower 02', zone: 'Restricted Zone', direction: 'NORTH → SOUTH', status: 'ONLINE', fps: 20, edgeNode: 'EDGE-NODE-03', threatLevel: 'LOW', aiActive: true, count: 0 },
];

const INITIAL_ALERTS = [
  {
    id: 'ALT-9041',
    severity: 'CRITICAL',
    title: 'Restricted Zone Virtual Fence Breach',
    description: 'Target #P104 crossed virtual fence vector SOUTH into Restricted Sector C1.',
    cameraId: 'CAM-05',
    timestamp: '22:41:27',
    threatScore: 87,
    status: 'ACTIVE',
    targetId: 'PERSON #P104',
    zone: 'Restricted Zone',
    incidentId: 'INC-2026-0914-0042'
  },
  {
    id: 'ALT-9040',
    severity: 'HIGH',
    title: 'Multi-Camera Tracking Escalation',
    description: 'Target #P104 correlated across CAM-02 → CAM-03 (+8s interval).',
    cameraId: 'CAM-03',
    timestamp: '22:41:16',
    threatScore: 68,
    status: 'ACTIVE',
    targetId: 'PERSON #P104',
    zone: 'Buffer Zone',
    incidentId: 'INC-2026-0914-0042'
  },
  {
    id: 'ALT-9038',
    severity: 'MEDIUM',
    title: 'Watchlist Vehicle Detected',
    description: 'ANPR match on vehicle plate JK02AB1234 at Checkpoint Bravo.',
    cameraId: 'CAM-04',
    timestamp: '21:18:43',
    threatScore: 52,
    status: 'ACKNOWLEDGED',
    targetId: 'VEHICLE JK02AB1234',
    zone: 'Safe Zone',
    incidentId: 'INC-2026-0914-0039'
  },
  {
    id: 'ALT-9035',
    severity: 'LOW',
    title: 'Perimeter Motion Anomaly',
    description: 'Minor infrared motion fluctuation detected on Sector A1.',
    cameraId: 'CAM-01',
    timestamp: '20:12:05',
    threatScore: 24,
    status: 'RESOLVED',
    targetId: 'UNKNOWN #U088',
    zone: 'Safe Zone',
    incidentId: null
  }
];

const INITIAL_INCIDENTS = [
  {
    id: 'INC-2026-0914-0042',
    alertId: 'ALT-9041',
    title: 'Critical Restricted Fence Intrusion',
    threatScore: 87,
    threatLevel: 'CRITICAL',
    status: 'ACTIVE',
    createdAt: '2026-09-14 22:41:29',
    cameraId: 'CAM-05',
    targetId: 'PERSON #P104',
    direction: 'NORTH → SOUTH',
    evidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
    correlatedCameras: ['CAM-02', 'CAM-03', 'CAM-05'],
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timeline: [
      { timestamp: '22:41:08', event: 'Target #P104 detected near outer perimeter fence', camera: 'CAM-02', score: 45, zone: 'Buffer Zone' },
      { timestamp: '22:41:16', event: 'Spatiotemporal track match established (+8s delta)', camera: 'CAM-03', score: 68, zone: 'Buffer Zone' },
      { timestamp: '22:41:27', event: 'Virtual fence breached vector SOUTH into Restricted Sector', camera: 'CAM-05', score: 87, zone: 'Restricted Zone' },
      { timestamp: '22:41:28', event: 'Threat Fusion Engine upgraded severity to CRITICAL', camera: 'SYSTEM', score: 87, zone: 'Restricted Zone' },
      { timestamp: '22:41:29', event: 'CRITICAL alert dispatched to SOC Commander', camera: 'SYSTEM', score: 87, zone: 'Restricted Zone' }
    ]
  }
];

const INITIAL_EDGE_NODES = [
  { id: 'EDGE-NODE-01', name: 'Edge Unit Alpha - Sector A/B', status: 'ONLINE', cpu: 62, gpu: 71, latency: 24, cameras: 3, storeAndForward: false, cachedEvents: 0 },
  { id: 'EDGE-NODE-02', name: 'Edge Unit Bravo - Sector B/C', status: 'DEGRADED', cpu: 78, gpu: 82, latency: 118, cameras: 2, storeAndForward: false, cachedEvents: 14 },
  { id: 'EDGE-NODE-03', name: 'Edge Unit Charlie - Thermal Mesh', status: 'ONLINE', cpu: 45, gpu: 52, latency: 18, cameras: 1, storeAndForward: false, cachedEvents: 0 },
];

const INITIAL_ANPR = [
  { id: 'ANPR-101', plate: 'JK02AB1234', confidence: 96, camera: 'CAM-04', time: '21:18:43', direction: 'NORTH → SOUTH', status: 'WATCHLIST', type: 'Heavy Truck' },
  { id: 'ANPR-102', plate: 'DL01XY9988', confidence: 98, camera: 'CAM-04', time: '20:45:12', direction: 'EAST → WEST', status: 'AUTHORIZED', type: 'Patrol SUV' },
  { id: 'ANPR-103', plate: 'PB65CZ4321', confidence: 91, camera: 'CAM-04', time: '19:30:05', direction: 'WEST → EAST', status: 'UNKNOWN', type: 'Sedan' },
];

const INITIAL_AUDIT = [
  { id: 1, time: '19:42:01', operator: 'Operator 01', role: 'OPERATOR', action: 'Acknowledged Incident', target: 'INC-2026-0914-0042', result: 'SUCCESS' },
  { id: 2, time: '19:43:22', operator: 'Operator 01', role: 'OPERATOR', action: 'Viewed Evidence Clip', target: 'INC-2026-0914-0042', result: 'SUCCESS' },
  { id: 3, time: '19:44:08', operator: 'Commander 02', role: 'COMMANDER', action: 'Escalated Threat to Border Patrol', target: 'INC-2026-0914-0042', result: 'DISPATCHED' },
];

// Main App Container
function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('COMMANDER'); // ADMIN, COMMANDER, OPERATOR, VIEWER
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Application Data States
  const [cameras, setCameras] = useState(INITIAL_CAMERAS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [edgeNodes, setEdgeNodes] = useState(INITIAL_EDGE_NODES);
  const [anprList, setAnprList] = useState(INITIAL_ANPR);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT);
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-2026-0914-0042');
  const [selectedCameraId, setSelectedCameraId] = useState('CAM-05');

  // Simulation & Demo Controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [demoScenario, setDemoScenario] = useState('Multi-Camera Tracking');
  const [simStep, setSimStep] = useState(1);
  const [networkDisconnected, setNetworkDisconnected] = useState(false);

  // Live System Time
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimStep(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handle Scenario Auto Generation
  useEffect(() => {
    if (!isSimulating) return;
    const now = new Date().toLocaleTimeString();

    if (demoScenario === 'Multi-Camera Tracking') {
      const stepPhase = simStep % 3;
      if (stepPhase === 1) {
        // Step 1: CAM-02 Detection
        setCameras(prev => prev.map(c => c.id === 'CAM-02' ? { ...c, threatLevel: 'MEDIUM' } : c));
      } else if (stepPhase === 2) {
        // Step 2: CAM-03 Correlation
        setCameras(prev => prev.map(c => c.id === 'CAM-03' ? { ...c, threatLevel: 'HIGH' } : c));
      } else {
        // Step 3: CAM-05 Virtual Fence Breach
        setCameras(prev => prev.map(c => c.id === 'CAM-05' ? { ...c, threatLevel: 'CRITICAL' } : c));
      }
    } else if (demoScenario === 'Virtual Fence Intrusion') {
      const newAlert = {
        id: `ALT-${9042 + simStep}`,
        severity: 'CRITICAL',
        title: 'Restricted Fence Vector South Intrusion',
        description: `Target #P${108 + (simStep % 5)} crossed restricted boundary line at Sector C1.`,
        cameraId: 'CAM-05',
        timestamp: now,
        threatScore: 92,
        status: 'ACTIVE',
        targetId: `PERSON #P${108 + (simStep % 5)}`,
        zone: 'Restricted Zone',
        incidentId: 'INC-2026-0914-0042'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
    } else if (demoScenario === 'ANPR Detection') {
      const plates = ['JK02AB1234', 'DL01XY9988', 'PB65CZ4321', 'HR26DK9001'];
      const currentPlate = plates[simStep % plates.length];
      const newAnpr = {
        id: `ANPR-${200 + simStep}`,
        plate: currentPlate,
        confidence: 94 + (simStep % 5),
        camera: 'CAM-04',
        time: now,
        direction: 'NORTH → SOUTH',
        status: currentPlate === 'JK02AB1234' ? 'WATCHLIST' : 'AUTHORIZED',
        type: 'Cargo Van'
      };
      setAnprList(prev => [newAnpr, ...prev.slice(0, 9)]);
    } else if (demoScenario === 'Network Failure') {
      setEdgeNodes(prev => prev.map(e => e.id === 'EDGE-NODE-02' ? { ...e, status: 'DEGRADED', storeAndForward: true, cachedEvents: e.cachedEvents + 1 } : e));
    }
  }, [simStep, demoScenario, isSimulating]);

  // Action Handlers
  const handleAcknowledgeIncident = (incId) => {
    setIncidents(prev => prev.map(inc => inc.id === incId ? { ...inc, status: 'ACKNOWLEDGED' } : inc));
    setAlerts(prev => prev.map(a => a.incidentId === incId ? { ...a, status: 'ACKNOWLEDGED' } : a));
    const newLog = {
      id: auditLog.length + 1,
      time: new Date().toLocaleTimeString(),
      operator: 'Commander 01',
      role: userRole,
      action: 'Acknowledged Threat Incident',
      target: incId,
      result: 'SUCCESS'
    };
    setAuditLog(prev => [newLog, ...prev]);
  };

  const handleResolveIncident = (incId) => {
    setIncidents(prev => prev.map(inc => inc.id === incId ? { ...inc, status: 'RESOLVED' } : inc));
    setAlerts(prev => prev.map(a => a.incidentId === incId ? { ...a, status: 'RESOLVED' } : a));
    const newLog = {
      id: auditLog.length + 1,
      time: new Date().toLocaleTimeString(),
      operator: 'Commander 01',
      role: userRole,
      action: 'Resolved Incident Threat',
      target: incId,
      result: 'CLOSED'
    };
    setAuditLog(prev => [newLog, ...prev]);
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={(role) => { setUserRole(role); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080c14] text-slate-100">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0b101d] border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080c14] rounded-[7px] flex items-center justify-center">
                <Icon name="shield-alert" className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wider text-slate-100 flex items-center gap-1.5 font-mono">
                RAKSHAK<span className="text-cyan-400">VISION</span>
              </div>
              <div className="text-[10px] text-cyan-400/80 tracking-widest uppercase font-mono">
                Border AI Analytics
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] text-sm">
            <NavItem id="overview" label="Overview" icon="layout-dashboard" active={activeTab} onClick={setActiveTab} />
            <NavItem id="monitoring" label="Live Monitoring" icon="video" active={activeTab} onClick={setActiveTab} badge="6 CAM" />
            <NavItem id="fence" label="Border Virtual Fence" icon="fence" active={activeTab} onClick={setActiveTab} badge="RULES" badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/40" />
            <NavItem id="threat_fusion" label="Threat Fusion Engine" icon="cpu" active={activeTab} onClick={setActiveTab} badge="87" badgeColor="bg-red-500/20 text-red-400 border-red-500/40" />
            <NavItem id="correlation" label="Multi-Cam Correlation" icon="git-merge" active={activeTab} onClick={setActiveTab} badge="P104" badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/40" />
            <NavItem id="alerts" label="Alert Center" icon="bell" active={activeTab} onClick={setActiveTab} badge={alerts.filter(a=>a.status==='ACTIVE').length.toString()} badgeColor="bg-red-500 text-white font-bold" />
            <NavItem id="incidents" label="Incidents & Evidence" icon="file-warning" active={activeTab} onClick={setActiveTab} />
            <NavItem id="anpr" label="ANPR Module" icon="car" active={activeTab} onClick={setActiveTab} badge="WATCH" badgeColor="bg-purple-500/20 text-purple-300 border-purple-500/40" />
            <NavItem id="face" label="Face Verification" icon="user-check" active={activeTab} onClick={setActiveTab} />
            <NavItem id="threat_map" label="Tactical Threat Map" icon="map" active={activeTab} onClick={setActiveTab} />
            <NavItem id="analytics" label="Analytics & Stats" icon="bar-chart-3" active={activeTab} onClick={setActiveTab} />
            <NavItem id="edge" label="Edge Resilience" icon="hard-drive" active={activeTab} onClick={setActiveTab} badge="STORE-FWD" badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/40" />
            <NavItem id="cameras" label="Camera Registration" icon="camera" active={activeTab} onClick={setActiveTab} />
            <NavItem id="evidence" label="Evidence Repository" icon="database" active={activeTab} onClick={setActiveTab} />
            <NavItem id="audit" label="Audit Log & Security" icon="shield-check" active={activeTab} onClick={setActiveTab} />
            <NavItem id="settings" label="Settings & RBAC" icon="settings" active={activeTab} onClick={setActiveTab} />
          </nav>
        </div>

        {/* User Role Card */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080c14]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {userRole.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">Operator #01</div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {userRole}
              </div>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="text-slate-400 hover:text-red-400 transition" title="Logout">
              <Icon name="log-out" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-14 bg-[#0b101d]/90 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0">
          {/* Left System Status Indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <Icon name="cpu" className="w-3.5 h-3.5 text-cyan-400" />
              <span>EDGE NODES: <strong className="text-cyan-400">3/3 ONLINE</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <Icon name="wifi" className="w-3.5 h-3.5 text-emerald-400" />
              <span>CCTV STREAMS: <strong className="text-emerald-400">6/6 ACTIVE</strong></span>
            </div>
          </div>

          {/* Right Clock & Demobar Toggle */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/90 border border-slate-700/60 rounded px-3 py-1 text-xs font-mono text-cyan-300 tracking-wider flex items-center gap-2 shadow-inner">
              <Icon name="clock" className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
              <span className="text-[10px] text-slate-400 font-sans">IST (UTC+5:30)</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-md p-1 flex text-xs">
              {['ADMIN', 'COMMANDER', 'OPERATOR'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`px-2 py-0.5 rounded ${userRole === r ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* DEMO PRESENTATION SCENARIO CONTROL BAR */}
        <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-950 border-b border-cyan-500/30 px-6 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              SIH 2026 DEMO ENGINE
            </div>
            <span className="text-xs text-slate-300 font-medium">Scenario:</span>
            <select
              value={demoScenario}
              onChange={(e) => setDemoScenario(e.target.value)}
              className="bg-slate-900 border border-cyan-500/40 rounded px-3 py-1 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="Multi-Camera Tracking">1. Multi-Camera Correlation (CAM-02 → CAM-03 → CAM-05)</option>
              <option value="Virtual Fence Intrusion">2. Virtual Fence Breach (Restricted Sector C1)</option>
              <option value="ANPR Detection">3. Vehicle ANPR & Watchlist Detection (JK02AB1234)</option>
              <option value="Network Failure">4. Edge Network Disconnect & Store-and-Forward</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${isSimulating ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'}`}
            >
              <Icon name={isSimulating ? "pause" : "play"} className="w-3.5 h-3.5" />
              {isSimulating ? "PAUSE SIMULATION" : "START DEMO"}
            </button>
            <button
              onClick={() => { setSimStep(1); setAlerts(INITIAL_ALERTS); }}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-xs font-mono flex items-center gap-1.5"
            >
              <Icon name="rotate-ccw" className="w-3.5 h-3.5" />
              RESET STEP ({simStep})
            </button>
          </div>
        </div>

        {/* DYNAMIC VIEW ROUTER */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080c14]">
          {activeTab === 'overview' && (
            <OverviewView
              cameras={cameras}
              alerts={alerts}
              incidents={incidents}
              anprList={anprList}
              onNavigate={setActiveTab}
              onSelectIncident={(id) => { setSelectedIncidentId(id); setActiveTab('incidents'); }}
            />
          )}
          {activeTab === 'monitoring' && (
            <MonitoringView
              cameras={cameras}
              simStep={simStep}
              onSelectCamera={(id) => { setSelectedCameraId(id); }}
            />
          )}
          {activeTab === 'fence' && <VirtualFenceView simStep={simStep} />}
          {activeTab === 'threat_fusion' && <ThreatFusionView simStep={simStep} />}
          {activeTab === 'correlation' && <CorrelationView simStep={simStep} onInspectIncident={(id) => { setSelectedIncidentId(id); setActiveTab('incidents'); }} />}
          {activeTab === 'alerts' && <AlertCenterView alerts={alerts} onInspectIncident={(id) => { setSelectedIncidentId(id); setActiveTab('incidents'); }} />}
          {activeTab === 'incidents' && (
            <IncidentDetailView
              incident={incidents.find(i => i.id === selectedIncidentId) || incidents[0]}
              onAcknowledge={handleAcknowledgeIncident}
              onResolve={handleResolveIncident}
            />
          )}
          {activeTab === 'anpr' && <ANPRView anprList={anprList} />}
          {activeTab === 'face' && <FaceDetectionView />}
          {activeTab === 'threat_map' && <ThreatMapView onSelectCamera={(id) => { setSelectedCameraId(id); setActiveTab('monitoring'); }} />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'edge' && <EdgeView edgeNodes={edgeNodes} setEdgeNodes={setEdgeNodes} />}
          {activeTab === 'cameras' && <CameraMgmtView cameras={cameras} setCameras={setCameras} />}
          {activeTab === 'evidence' && <EvidenceView incidents={incidents} />}
          {activeTab === 'audit' && <AuditView auditLog={auditLog} />}
          {activeTab === 'settings' && <SettingsView userRole={userRole} setUserRole={setUserRole} />}
        </main>
      </div>
    </div>
  );
}

// Sub-Component: Navigation Item
function NavItem({ id, label, icon, active, onClick, badge, badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${isActive ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon name={icon} className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// VIEW 1: OVERVIEW DASHBOARD
function OverviewView({ cameras, alerts, incidents, anprList, onNavigate, onSelectIncident }) {
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* CRITICAL ALERT THREAT BANNER */}
      {criticalCount > 0 && (
        <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-slate-900 border border-red-500/50 rounded-xl p-4 flex items-center justify-between shadow-lg pulse-critical">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
              <Icon name="alert-triangle" className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-[10px] font-extrabold uppercase">CRITICAL THREAT BREACH</span>
                <span className="text-xs font-mono text-red-300">THREAT SCORE: 87/100</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Target #P104 Crossed Border Virtual Fence into Restricted Zone</h3>
              <p className="text-xs text-slate-300 mt-1">Multi-camera correlation trajectory confirmed across CAM-02 → CAM-03 → CAM-05 in 19 seconds.</p>
            </div>
          </div>
          <button
            onClick={() => onSelectIncident('INC-2026-0914-0042')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-lg transition shadow-md flex items-center gap-2"
          >
            <span>INVESTIGATE INCIDENT</span>
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-6 gap-4">
        <KpiCard title="Cameras Online" value={`${cameras.filter(c=>c.status==='ONLINE').length}/6`} subtext="100% Operational" icon="video" color="emerald" />
        <KpiCard title="Active Alerts" value={activeAlerts.length.toString()} subtext={`${criticalCount} Critical`} icon="bell" color="red" />
        <KpiCard title="Critical Threats" value={criticalCount.toString()} subtext="Immediate Response" icon="shield-alert" color="red" />
        <KpiCard title="People Detected" value="142" subtext="+18 last hour" icon="users" color="cyan" />
        <KpiCard title="Vehicles Detected" value="38" subtext="1 Watchlist match" icon="car" color="purple" />
        <KpiCard title="Incidents Today" value="12" subtext="9 Resolved" icon="file-check" color="blue" />
      </div>

      {/* MID SECTION: MULTI-CAMERA CORRELATION TRACK + THREAT RADAR */}
      <div className="grid grid-cols-3 gap-6">
        {/* CORRELATION TRACK PREVIEW */}
        <div className="col-span-2 bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Icon name="git-merge" className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">ACTIVE MULTI-CAMERA TARGET TRACK (#P104)</h3>
            </div>
            <button onClick={() => onNavigate('correlation')} className="text-xs text-cyan-400 hover:underline font-mono">
              Full Track Graph →
            </button>
          </div>

          <div className="bg-[#080c14] border border-slate-800 rounded-lg p-4 relative overflow-hidden">
            {/* Timeline track nodes */}
            <div className="flex items-center justify-between relative z-10">
              <CorrelationNode cam="CAM-02" name="Sector A2 Outer" time="22:41:08" score={45} status="MEDIUM" icon="camera" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 relative mx-2">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-amber-400 bg-[#080c14] px-1.5 rounded border border-amber-500/30">+8s</span>
              </div>
              <CorrelationNode cam="CAM-03" name="Sector B1 Buffer" time="22:41:16" score={68} status="HIGH" icon="camera" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 relative mx-2">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-red-400 bg-[#080c14] px-1.5 rounded border border-red-500/30">+11s</span>
              </div>
              <CorrelationNode cam="CAM-05" name="Sector C1 Restricted" time="22:41:27" score={87} status="CRITICAL" icon="shield-alert" highlight={true} />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Travel Time: <strong className="text-cyan-300">19 seconds</strong></span>
              <span className="text-slate-400">Direction Vector: <strong className="text-red-400">NORTH → SOUTH (Inward Breach)</strong></span>
              <span className="text-slate-400">Threat Score Escalation: <strong className="text-red-400">45 → 68 → 87</strong></span>
            </div>
          </div>
        </div>

        {/* THREAT FUSION GAUGE SUMMARY */}
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="cpu" className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-sm text-slate-100">THREAT FUSION SCORE</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold">CRITICAL</span>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                <circle cx="72" cy="72" r="60" stroke="#ef4444" strokeWidth="12" fill="transparent" strokeDasharray="377" strokeDashoffset={377 * (1 - 87/100)} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono text-red-400 tracking-tight">87</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Out of 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-3">
            <div className="flex justify-between text-slate-300">
              <span>Location Risk:</span>
              <span className="text-red-400 font-bold">25/30</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Direction Vector (S):</span>
              <span className="text-orange-400 font-bold">18/20</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Nighttime Penalty:</span>
              <span className="text-amber-400 font-bold">15/15</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ALERTS FEED */}
      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Icon name="bell" className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">REAL-TIME SURVEILLANCE ALERTS</h3>
          </div>
          <button onClick={() => onNavigate('alerts')} className="text-xs text-cyan-400 hover:underline font-mono">
            View All Alerts ({alerts.length}) →
          </button>
        </div>

        <div className="space-y-2">
          {alerts.slice(0, 4).map(alert => (
            <div key={alert.id} className="bg-[#080c14] border border-slate-800/80 rounded-lg p-3 flex items-center justify-between hover:border-cyan-500/40 transition">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                  {alert.severity}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200">{alert.title}</div>
                  <div className="text-[11px] text-slate-400">{alert.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400">{alert.timestamp}</span>
                {alert.incidentId && (
                  <button
                    onClick={() => onSelectIncident(alert.incidentId)}
                    className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 rounded text-xs font-mono transition"
                  >
                    Investigate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sub-Component: KPI Card
function KpiCard({ title, value, subtext, icon, color }) {
  const colors = {
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    red: 'border-red-500/30 text-red-400 bg-red-500/10',
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  };

  return (
    <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-xs font-medium">{title}</span>
        <div className={`p-1.5 rounded-lg border ${colors[color]}`}>
          <Icon name={icon} className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-extrabold font-mono text-slate-100 tracking-tight">{value}</div>
        <div className="text-[10px] font-mono text-slate-400 mt-1">{subtext}</div>
      </div>
    </div>
  );
}

// Sub-Component: Correlation Track Node
function CorrelationNode({ cam, name, time, score, status, icon, highlight }) {
  return (
    <div className={`flex flex-col items-center text-center p-3 rounded-lg border ${highlight ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10' : 'bg-[#0e1626] border-slate-800'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${highlight ? 'bg-red-500 text-white' : 'bg-slate-800 text-cyan-400'}`}>
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold font-mono text-slate-200">{cam}</span>
      <span className="text-[10px] text-slate-400 mt-0.5">{name}</span>
      <span className="text-[10px] font-mono text-slate-300 mt-1">{time}</span>
      <span className={`text-[10px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded ${status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'}`}>
        Score: {score}
      </span>
    </div>
  );
}

// VIEW 2: LIVE MONITORING SURVEILLANCE WALL
function MonitoringView({ cameras, simStep, onSelectCamera }) {
  const [selectedCam, setSelectedCam] = useState(null);
  const [aiOverlay, setAiOverlay] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Icon name="video" className="w-5 h-5 text-cyan-400" />
            LIVE BORDER CCTV SURVEILLANCE WALL (6 CAMERAS)
          </h2>
          <p className="text-xs text-slate-400">Real-time IP-CCTV streams with AI YOLO detection bounding boxes & object tracking IDs</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiOverlay(!aiOverlay)}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition flex items-center gap-1.5 ${aiOverlay ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
          >
            <Icon name="eye" className="w-4 h-4" />
            AI OVERLAY: {aiOverlay ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* 6-CAMERA GRID */}
      <div className="grid grid-cols-3 gap-4">
        {cameras.map(cam => (
          <CameraFeedCard
            key={cam.id}
            cam={cam}
            simStep={simStep}
            aiOverlay={aiOverlay}
            onOpenModal={() => setSelectedCam(cam)}
          />
        ))}
      </div>

      {/* SINGLE CAMERA INSPECTION MODAL */}
      {selectedCam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0e1626] border border-cyan-500/40 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b101d]">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">{selectedCam.id}</span>
                <h3 className="font-bold text-sm text-slate-100">{selectedCam.name}</h3>
              </div>
              <button onClick={() => setSelectedCam(null)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <CameraFeedCard cam={selectedCam} simStep={simStep} aiOverlay={aiOverlay} isExpanded={true} />
              <div className="grid grid-cols-4 gap-4 text-xs font-mono bg-[#080c14] p-4 rounded-lg border border-slate-800">
                <div>RTSP Stream: <span className="text-cyan-300">{selectedCam.rtsp_url || 'rtsp://192.168.1.105/live'}</span></div>
                <div>Edge Node: <span className="text-emerald-400">{selectedCam.edgeNode}</span></div>
                <div>FPS: <span className="text-cyan-300">{selectedCam.fps} FPS</span></div>
                <div>AI Status: <span className="text-emerald-400">ACTIVE (YOLOv8)</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-Component: Camera Feed Card with Canvas Simulation Overlay
function CameraFeedCard({ cam, simStep, aiOverlay, onOpenModal, isExpanded }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw dark border surveillance video placeholder background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Draw horizon & fence lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.4);
    ctx.lineTo(w, h * 0.4);
    ctx.stroke();

    // Virtual fence red line
    ctx.strokeStyle = cam.threatLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w, h * 0.65);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label on line
    ctx.fillStyle = cam.threatLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('RESTRICTED BORDER VIRTUAL FENCE LINE', 10, h * 0.63);

    // Draw simulated AI Bounding Boxes if overlay enabled
    if (aiOverlay) {
      if (cam.id === 'CAM-05') {
        // Critical Person Target #P104
        const x = 120 + ((simStep * 10) % 80);
        const y = 80 + ((simStep * 8) % 60);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 40, 75);

        // Bounding label
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x, y - 18, 110, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('PERSON #P104 98%', x + 4, y - 5);

        // Movement Vector Arrow
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 75);
        ctx.lineTo(x + 20, y + 105);
        ctx.stroke();
      } else if (cam.id === 'CAM-04') {
        // ANPR Vehicle #V021
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 70, 140, 70);

        ctx.fillStyle = '#a855f7';
        ctx.fillRect(80, 52, 140, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText('VEHICLE [JK02AB1234]', 84, 65);
      }
    }
  }, [simStep, aiOverlay, cam]);

  return (
    <div className={`bg-[#0e1626] border rounded-xl overflow-hidden shadow-sm flex flex-col ${cam.threatLevel === 'CRITICAL' ? 'border-red-500/60 shadow-red-500/20' : 'border-slate-800'}`}>
      {/* Header telemetry */}
      <div className="p-2.5 bg-[#0b101d] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cam.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
          <span className="font-bold text-slate-200">{cam.id}</span>
          <span className="text-[10px] text-slate-400">{cam.name}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cam.threatLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-300'}`}>
          {cam.threatLevel}
        </span>
      </div>

      {/* Simulated Canvas Feed */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={225} className="w-full h-full object-cover" />

        {/* Live overlay tag */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur border border-slate-700/60 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          LIVE • {cam.fps} FPS
        </div>

        {/* Action Controls */}
        {!isExpanded && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button onClick={onOpenModal} className="p-1 bg-[#0e1626]/80 hover:bg-[#0e1626] border border-slate-700 rounded text-slate-300" title="Expand View">
              <Icon name="maximize-2" className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="p-2.5 bg-[#080c14] flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
        <span>Zone: <strong className="text-slate-200">{cam.zone}</strong></span>
        <span>Vector: <strong className="text-cyan-300">{cam.direction}</strong></span>
      </div>
    </div>
  );
}

// VIEW 3: BORDER-AWARE VIRTUAL FENCE BUILDER
function VirtualFenceView({ simStep }) {
  const [activeZone, setActiveZone] = useState('Restricted');
  const [vectorDirection, setVectorDirection] = useState('NORTH → SOUTH');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Icon name="fence" className="w-5 h-5 text-amber-400" />
            BORDER-AWARE VIRTUAL FENCE & RULE CONFIGURATOR
          </h2>
          <p className="text-xs text-slate-400">Interactive perimeter boundary line definition, directional vector rules, and automated breach triggers</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5">
            <Icon name="plus" className="w-4 h-4" />
            + CREATE VIRTUAL FENCE ZONE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* INTERACTIVE CANVAS ZONE EDITOR */}
        <div className="col-span-2 bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold font-mono text-slate-200">INTERACTIVE FENCE CANVAS (CAM-05 SECTOR C1)</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold">BREACHED</span>
          </div>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
            <img src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-50" />

            {/* Polygon Virtual Zones Overlay */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Safe Zone */}
              <polygon points="0,0 800,0 800,120 0,120" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" />
              <text x="20" y="30" fill="#22c55e" fontSize="12" fontFamily="JetBrains Mono">SAFE ZONE (NORTH)</text>

              {/* Buffer Zone */}
              <polygon points="0,120 800,120 800,240 0,240" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
              <text x="20" y="150" fill="#f59e0b" fontSize="12" fontFamily="JetBrains Mono">BUFFER ZONE (PERIMETER)</text>

              {/* Restricted Zone */}
              <polygon points="0,240 800,240 800,450 0,450" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="2" />
              <text x="20" y="270" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="JetBrains Mono">RESTRICTED ZONE (SOVEREIGN BOUNDARY)</text>

              {/* Virtual Fence Vector Arrows */}
              <line x1="400" y1="180" x2="400" y2="280" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow)" />
            </svg>

            {/* Dynamic Target Marker */}
            <div className="absolute top-[260px] left-[380px] bg-red-600/90 text-white font-mono text-[10px] px-2 py-1 rounded shadow-lg flex items-center gap-1 animate-pulse">
              <Icon name="user" className="w-3 h-3" />
              #P104 (BREACHED - SOUTH)
            </div>
          </div>
        </div>

        {/* RULE CONFIGURATOR PANEL */}
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Icon name="sliders" className="w-4 h-4 text-cyan-400" />
            RULE CONFIGURATION ENGINE
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Target Zone:</label>
              <select value={activeZone} onChange={e=>setActiveZone(e.target.value)} className="w-full bg-[#080c14] border border-slate-700 rounded px-3 py-2 text-cyan-300">
                <option value="Restricted">Restricted Zone (High Priority)</option>
                <option value="Buffer">Buffer Zone (Warning)</option>
                <option value="Safe">Safe Zone (Monitored)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Movement Direction Vector:</label>
              <select value={vectorDirection} onChange={e=>setVectorDirection(e.target.value)} className="w-full bg-[#080c14] border border-slate-700 rounded px-3 py-2 text-cyan-300">
                <option value="NORTH → SOUTH">NORTH → SOUTH (Inward Breach)</option>
                <option value="SOUTH → NORTH">SOUTH → NORTH (Outward Exit)</option>
                <option value="EAST → WEST">EAST → WEST (Lateral Border)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Active Time Window:</label>
              <input type="text" value="22:00 - 05:00 (Night Surveillance)" disabled className="w-full bg-[#080c14] border border-slate-800 rounded px-3 py-2 text-slate-400" />
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="bg-red-950/40 border border-red-500/40 rounded p-3 text-[11px] text-red-300 space-y-1">
                <div className="font-bold">EVALUATED RULE LOGIC:</div>
                <div>IF Object = PERSON</div>
                <div>AND Zone = Restricted Zone</div>
                <div>AND Direction = NORTH → SOUTH</div>
                <div>THEN Action = Raise CRITICAL Threat (Score 87+)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// VIEW 4: THREAT FUSION ENGINE
function ThreatFusionView({ simStep }) {
  const [locRisk, setLocRisk] = useState(25);
  const [dirRisk, setDirRisk] = useState(18);
  const [timeRisk, setTimeRisk] = useState(15);
  const [behRisk, setBehRisk] = useState(20);
  const [corrRisk, setCorrRisk] = useState(12);

  const totalScore = Math.min(100, locRisk + dirRisk + timeRisk + behRisk + corrRisk);
  const threatLevel = totalScore >= 76 ? 'CRITICAL' : totalScore >= 51 ? 'HIGH' : totalScore >= 26 ? 'MEDIUM' : 'LOW';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="cpu" className="w-5 h-5 text-red-400" />
          THREAT FUSION ENGINE (MULTI-FACTOR WEIGHTED RISK COMPUTATION)
        </h2>
        <p className="text-xs text-slate-400">Algorithmic score calculation combining location, movement vector, nighttime parameters, behavior dwell time, and multi-camera correlation</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* SCORE METER GAUGE */}
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">COMPOSITE THREAT SCORE</span>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="#1e293b" strokeWidth="16" fill="transparent" />
              <circle cx="96" cy="96" r="80" stroke={totalScore >= 76 ? '#ef4444' : totalScore >= 51 ? '#f97316' : '#eab308'} strokeWidth="16" fill="transparent" strokeDasharray="502" strokeDashoffset={502 * (1 - totalScore/100)} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-5xl font-extrabold font-mono tracking-tight ${totalScore >= 76 ? 'text-red-400' : 'text-amber-400'}`}>{totalScore}</span>
              <span className="text-xs font-mono text-slate-400 mt-1">/ 100</span>
            </div>
          </div>

          <span className={`mt-4 px-4 py-1.5 rounded-full font-mono text-xs font-extrabold border uppercase tracking-wider ${totalScore >= 76 ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'}`}>
            THREAT LEVEL: {threatLevel}
          </span>
        </div>

        {/* DYNAMIC WEIGHT SLIDERS & BREAKDOWN */}
        <div className="col-span-2 bg-[#0e1626] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Icon name="sliders" className="w-4 h-4 text-cyan-400" />
            DYNAMIC THREAT INPUT PARAMETERS
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Location Risk (Restricted vs Buffer Zone):</span>
                <span className="text-cyan-400 font-bold">{locRisk} / 30</span>
              </div>
              <input type="range" min="0" max="30" value={locRisk} onChange={e=>setLocRisk(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Direction Vector Risk (NORTH → SOUTH):</span>
                <span className="text-cyan-400 font-bold">{dirRisk} / 20</span>
              </div>
              <input type="range" min="0" max="20" value={dirRisk} onChange={e=>setDirRisk(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Time Risk (Nighttime Penalty 22:00 - 05:00):</span>
                <span className="text-cyan-400 font-bold">{timeRisk} / 15</span>
              </div>
              <input type="range" min="0" max="15" value={timeRisk} onChange={e=>setTimeRisk(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Behavior Dwell Time Risk (&gt;10s Dwell):</span>
                <span className="text-cyan-400 font-bold">{behRisk} / 20</span>
              </div>
              <input type="range" min="0" max="20" value={behRisk} onChange={e=>setBehRisk(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Multi-Camera Spatiotemporal Correlation Match:</span>
                <span className="text-cyan-400 font-bold">{corrRisk} / 15</span>
              </div>
              <input type="range" min="0" max="15" value={corrRisk} onChange={e=>setCorrRisk(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// VIEW 5: MULTI-CAMERA CORRELATION
function CorrelationView({ simStep, onInspectIncident }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="git-merge" className="w-5 h-5 text-cyan-400" />
          MULTI-CAMERA SPATIOTEMPORAL CORRELATION TRACKER
        </h2>
        <p className="text-xs text-slate-400">Core USP: Cross-camera feature matching & trajectory reconstruction for target #P104</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">TARGET SIGNATURE: PERSON #P104</span>
            <h3 className="text-base font-bold text-slate-100 mt-1">Cross-Camera Trajectory: CAM-02 → CAM-03 → CAM-05</h3>
          </div>
          <button
            onClick={() => onInspectIncident('INC-2026-0914-0042')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-lg transition"
          >
            Inspect Incident Details →
          </button>
        </div>

        {/* TIMELINE VISUALIZATION */}
        <div className="grid grid-cols-3 gap-6 relative">
          <div className="bg-[#080c14] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs font-bold">CAM-02</span>
              <span className="text-xs font-mono text-slate-400">22:41:08</span>
            </div>
            <img src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=80" className="w-full h-32 object-cover rounded border border-slate-800" />
            <div className="text-xs font-mono text-slate-300">
              <div>Location: Sector A2 Fence</div>
              <div>Threat Score: <strong className="text-amber-400">45 (MEDIUM)</strong></div>
            </div>
          </div>

          <div className="bg-[#080c14] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs font-bold">CAM-03</span>
              <span className="text-xs font-mono text-slate-400">22:41:16 (+8s)</span>
            </div>
            <img src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=80" className="w-full h-32 object-cover rounded border border-slate-800" />
            <div className="text-xs font-mono text-slate-300">
              <div>Location: Sector B1 Buffer</div>
              <div>Threat Score: <strong className="text-orange-400">68 (HIGH)</strong></div>
            </div>
          </div>

          <div className="bg-[#080c14] border border-red-500/50 rounded-xl p-4 space-y-3 bg-red-950/20 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-xs font-bold">CAM-05 (BREACH)</span>
              <span className="text-xs font-mono text-red-300">22:41:27 (+11s)</span>
            </div>
            <img src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=80" className="w-full h-32 object-cover rounded border border-red-500/40" />
            <div className="text-xs font-mono text-slate-300">
              <div>Location: Sector C1 Restricted</div>
              <div>Threat Score: <strong className="text-red-400">87 (CRITICAL)</strong></div>
            </div>
          </div>
        </div>

        <div className="bg-[#080c14] border border-slate-800 p-4 rounded-lg flex items-center justify-between text-xs font-mono text-slate-300">
          <div>Total Sequence Travel Time: <strong className="text-cyan-300">19 seconds</strong></div>
          <div>Velocity Estimate: <strong className="text-cyan-300">2.4 m/s (Fast Walking Vector SOUTH)</strong></div>
          <div>Correlation Match Confidence: <strong className="text-emerald-400">96.4% Feature Match</strong></div>
        </div>
      </div>
    </div>
  );
}

// VIEW 6: ALERT CENTER
function AlertCenterView({ alerts, onInspectIncident }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="bell" className="w-5 h-5 text-red-400" />
          REAL-TIME ALERTS CENTER
        </h2>
        <p className="text-xs text-slate-400">Prioritized alert dispatch log ordered by threat severity</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#0b101d] border-b border-slate-800 text-slate-400 uppercase">
              <th className="p-3">Severity</th>
              <th className="p-3">Title / Description</th>
              <th className="p-3">Camera</th>
              <th className="p-3">Target ID</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Score</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {alerts.map(a => (
              <tr key={a.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-200">{a.title}</div>
                  <div className="text-[11px] text-slate-400">{a.description}</div>
                </td>
                <td className="p-3 text-cyan-300">{a.cameraId}</td>
                <td className="p-3 text-slate-300">{a.targetId}</td>
                <td className="p-3 text-slate-400">{a.timestamp}</td>
                <td className="p-3 font-bold text-red-400">{a.threatScore}</td>
                <td className="p-3">
                  {a.incidentId ? (
                    <button
                      onClick={() => onInspectIncident(a.incidentId)}
                      className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 rounded transition"
                    >
                      Investigate
                    </button>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// VIEW 7: INCIDENT DETAIL PAGE
function IncidentDetailView({ incident, onAcknowledge, onResolve }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
              {incident.threatLevel} (SCORE: {incident.threatScore})
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 font-mono">{incident.id}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">{incident.title}</p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => onAcknowledge(incident.id)}
            className="px-4 py-2 bg-amber-600/20 border border-amber-500/40 hover:bg-amber-600/30 text-amber-300 font-bold rounded-lg transition"
          >
            ACKNOWLEDGE
          </button>
          <button
            onClick={() => onResolve(incident.id)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
          >
            RESOLVE INCIDENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* EVIDENCE IMAGE / VIDEO FRAME */}
        <div className="col-span-2 bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Icon name="camera" className="w-4 h-4 text-cyan-400" />
            INCIDENT EVIDENCE CAPTURE (CAM-05)
          </h3>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
            <img src={incident.evidenceUrl} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded border border-slate-700 text-xs font-mono text-cyan-300">
              TIMESTAMP: {incident.createdAt}
            </div>
            <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1 rounded border border-slate-700 text-[10px] font-mono text-slate-300">
              SHA-256 HASH: {incident.hash.slice(0, 24)}...
            </div>
          </div>
        </div>

        {/* TIMELINE EVENT LOG */}
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Icon name="clock" className="w-4 h-4 text-cyan-400" />
            INCIDENT TIMELINE
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {incident.timeline.map((t, idx) => (
              <div key={idx} className="border-l-2 border-cyan-500 pl-3 space-y-0.5 relative">
                <span className="text-[10px] text-cyan-400 font-bold">{t.timestamp} • {t.camera}</span>
                <div className="text-slate-200">{t.event}</div>
                <div className="text-[10px] text-slate-400">Threat Score: {t.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// VIEW 8: ANPR MODULE
function ANPRView({ anprList }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="car" className="w-5 h-5 text-purple-400" />
          AUTOMATIC NUMBER PLATE RECOGNITION (ANPR)
        </h2>
        <p className="text-xs text-slate-400">Simulated vehicle license plate OCR matching against border watchlist databases</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#0b101d] border-b border-slate-800 text-slate-400 uppercase">
              <th className="p-3">Plate Number</th>
              <th className="p-3">OCR Confidence</th>
              <th className="p-3">Camera</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Vehicle Type</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {anprList.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-cyan-300 text-sm tracking-wider">{item.plate}</td>
                <td className="p-3 text-emerald-400">{item.confidence}%</td>
                <td className="p-3 text-slate-300">{item.camera}</td>
                <td className="p-3 text-slate-400">{item.time}</td>
                <td className="p-3 text-slate-300">{item.type}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'WATCHLIST' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// VIEW 9: AUTHORIZED FACE DETECTION
function FaceDetectionView() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 text-xs font-mono text-amber-300 flex items-center gap-3">
        <Icon name="shield-alert" className="w-5 h-5 text-amber-400 shrink-0" />
        <span>AUTHORIZATION NOTICE: Face detection module operates under strict policy controls with mandatory cryptographic audit logging for consent compliance.</span>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Icon name="user-check" className="w-5 h-5 text-cyan-400" />
          SYNTHETIC DEMO IDENTITY MATCHING
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#080c14] border border-slate-800 rounded-lg p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
              S014
            </div>
            <div>
              <div className="font-bold text-slate-200">Demo Subject 014</div>
              <div className="text-emerald-400 mt-1">94% Feature Match</div>
              <div className="text-slate-400 text-[10px] mt-1">Audit Token: AUD-9014-VERIFIED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// VIEW 10: TACTICAL THREAT MAP
function ThreatMapView({ onSelectCamera }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="map" className="w-5 h-5 text-cyan-400" />
          TACTICAL BORDER SURVEILLANCE THREAT MAP
        </h2>
        <p className="text-xs text-slate-400">Stylized 2D dark command center map visualizing camera fields of view and active target vectors</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-6 relative aspect-[21/9] overflow-hidden flex items-center justify-center shadow-lg">
        {/* Stylized Tactical Map Graphic */}
        <svg className="w-full h-full">
          {/* Border line */}
          <line x1="0" y1="120" x2="1000" y2="120" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 4" />
          <text x="20" y="110" fill="#ef4444" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">INTERNATIONAL BORDER FENCE LINE</text>

          {/* Buffer zone */}
          <rect x="0" y="40" width="1000" height="80" fill="rgba(245, 158, 11, 0.08)" />

          {/* Camera Nodes */}
          {[
            { id: 'CAM-01', x: 100, y: 180 },
            { id: 'CAM-02', x: 280, y: 180 },
            { id: 'CAM-03', x: 460, y: 180 },
            { id: 'CAM-04', x: 640, y: 180 },
            { id: 'CAM-05', x: 820, y: 180, active: true },
          ].map(node => (
            <g key={node.id} className="cursor-pointer" onClick={() => onSelectCamera(node.id)}>
              <circle cx={node.x} cy={node.y} r="12" fill={node.active ? '#ef4444' : '#00f0ff'} opacity="0.8" />
              <text x={node.x - 20} y={node.y + 28} fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono">{node.id}</text>
            </g>
          ))}

          {/* Target Trajectory Line */}
          <path d="M 280 180 L 460 180 L 820 180" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        </svg>
      </div>
    </div>
  );
}

// VIEW 11: ANALYTICS
function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="bar-chart-3" className="w-5 h-5 text-cyan-400" />
          BORDER ANALYTICS & SURVEILLANCE METRICS
        </h2>
        <p className="text-xs text-slate-400">Statistical distribution of detections, intrusions, and system performance</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-xs font-mono text-slate-300">ALERTS BY HOUR (24H METRICS)</h3>
          <div className="h-48 bg-[#080c14] border border-slate-800 rounded-lg p-4 flex items-end justify-between gap-2">
            {[12, 18, 24, 45, 68, 87, 54, 32, 19, 14, 28, 42].map((v, i) => (
              <div key={i} className="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t transition" style={{ height: `${v}%` }}></div>
            ))}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-xs font-mono text-slate-300">THREAT SEVERITY BREAKDOWN</h3>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-red-400">CRITICAL:</span>
                <span>15%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                <div className="bg-red-500 h-full w-[15%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-orange-400">HIGH:</span>
                <span>30%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                <div className="bg-orange-500 h-full w-[30%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-amber-400">MEDIUM:</span>
                <span>45%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// VIEW 12: EDGE RESILIENCE
function EdgeView({ edgeNodes, setEdgeNodes }) {
  const toggleStoreAndForward = (nodeId) => {
    setEdgeNodes(prev => prev.map(e => e.id === nodeId ? { ...e, storeAndForward: !e.storeAndForward, status: !e.storeAndForward ? 'STORE-AND-FORWARD ACTIVE' : 'ONLINE' } : e));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="hard-drive" className="w-5 h-5 text-emerald-400" />
          EDGE NODE RESILIENCE & STORE-AND-FORWARD SIMULATION
        </h2>
        <p className="text-xs text-slate-400">Core USP: Distributed edge nodes continue CV detection offline during network disconnects</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {edgeNodes.map(node => (
          <div key={node.id} className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold font-mono text-xs text-cyan-300">{node.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${node.storeAndForward ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                {node.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div>CPU Usage: <strong className="text-cyan-400">{node.cpu}%</strong></div>
              <div>GPU Usage: <strong className="text-cyan-400">{node.gpu}%</strong></div>
              <div>Network Latency: <strong className="text-emerald-400">{node.latency} ms</strong></div>
              <div>Cached Events in Queue: <strong className="text-amber-400">{node.cachedEvents} events</strong></div>
            </div>

            <button
              onClick={() => toggleStoreAndForward(node.id)}
              className={`w-full py-2 rounded text-xs font-mono font-bold border transition ${node.storeAndForward ? 'bg-emerald-600 text-white' : 'bg-amber-600/20 text-amber-300 border-amber-500/40'}`}
            >
              {node.storeAndForward ? "RESTORE NETWORK SYNC" : "SIMULATE NETWORK DISCONNECT"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// VIEW 13: CAMERA MANAGEMENT
function CameraMgmtView({ cameras, setCameras }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="camera" className="w-5 h-5 text-cyan-400" />
          CAMERA REGISTRATION & RTSP STREAM MANAGEMENT
        </h2>
        <p className="text-xs text-slate-400">Configure IP-CCTV nodes, RTSP stream URLs, edge assignments, and boundary directions</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#0b101d] border-b border-slate-800 text-slate-400 uppercase">
              <th className="p-3">Camera ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">RTSP Stream URL</th>
              <th className="p-3">Location</th>
              <th className="p-3">Zone</th>
              <th className="p-3">Edge Node</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {cameras.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-bold text-cyan-300">{c.id}</td>
                <td className="p-3 text-slate-200">{c.name}</td>
                <td className="p-3 text-slate-400">{c.rtsp_url || 'rtsp://192.168.1.101/live'}</td>
                <td className="p-3 text-slate-300">{c.location}</td>
                <td className="p-3 text-slate-300">{c.zone}</td>
                <td className="p-3 text-emerald-400">{c.edgeNode}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 text-[10px]">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// VIEW 14: EVIDENCE REPOSITORY
function EvidenceView({ incidents }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="database" className="w-5 h-5 text-cyan-400" />
          EVIDENCE REPOSITORY & LEGAL CHAIN OF CUSTODY
        </h2>
        <p className="text-xs text-slate-400">Cryptographically signed snapshot and video clip evidence store</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {incidents.map(inc => (
          <div key={inc.id} className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-xs text-cyan-300">{inc.id}</span>
              <span className="text-xs font-mono text-slate-400">{inc.createdAt}</span>
            </div>
            <img src={inc.evidenceUrl} className="w-full h-40 object-cover rounded border border-slate-800" />
            <div className="text-xs font-mono text-slate-400 truncate">
              SHA-256: {inc.hash}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// VIEW 15: AUDIT LOG
function AuditView({ auditLog }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="shield-check" className="w-5 h-5 text-cyan-400" />
          SECURITY AUDIT LOG & OPERATOR ACTION RECORDS
        </h2>
        <p className="text-xs text-slate-400">Tamper-evident log of all human operator actions and incident resolution states</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#0b101d] border-b border-slate-800 text-slate-400 uppercase">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Operator</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target Incident</th>
              <th className="p-3">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {auditLog.map(log => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 text-slate-400">{log.time}</td>
                <td className="p-3 font-bold text-slate-200">{log.operator}</td>
                <td className="p-3 text-cyan-400">{log.role}</td>
                <td className="p-3 text-slate-300">{log.action}</td>
                <td className="p-3 text-slate-400">{log.target}</td>
                <td className="p-3 text-emerald-400 font-bold">{log.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// VIEW 16: SETTINGS & RBAC
function SettingsView({ userRole, setUserRole }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Icon name="settings" className="w-5 h-5 text-cyan-400" />
          SYSTEM SETTINGS & ROLE-BASED ACCESS CONTROL (RBAC)
        </h2>
        <p className="text-xs text-slate-400">Manage user authorization roles, confidence thresholds, and system parameters</p>
      </div>

      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3">ACTIVE ROLE ASSIGNMENT</h3>
        <div className="grid grid-cols-4 gap-4 text-xs font-mono">
          {['ADMIN', 'COMMANDER', 'OPERATOR', 'VIEWER'].map(r => (
            <button
              key={r}
              onClick={() => setUserRole(r)}
              className={`p-4 rounded-xl border text-center font-bold transition ${userRole === r ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md' : 'bg-[#080c14] text-slate-400 border-slate-800'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// VIEW 17: LOGIN PAGE
function LoginView({ onLogin }) {
  const [role, setRole] = useState('COMMANDER');

  return (
    <div className="min-h-screen bg-tactical-grid flex items-center justify-center p-6 bg-[#080c14]">
      <div className="bg-[#0e1626] border border-cyan-500/40 rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#080c14] rounded-[10px] flex items-center justify-center">
              <Icon name="shield-alert" className="w-9 h-9 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold font-mono text-slate-100 tracking-wider mt-2">RAKSHAK<span className="text-cyan-400">VISION</span></h1>
          <p className="text-xs text-cyan-400/80 font-mono tracking-widest uppercase">Secure • Detect • Correlate • Respond</p>
          <p className="text-xs text-slate-400 mt-1">SIH 2026 Problem Statement 26187 Border AI Analytics</p>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Select Demo Credentials Role:</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-4 py-2.5 text-cyan-300">
              <option value="COMMANDER">Commander Mode (Full Operational Control)</option>
              <option value="OPERATOR">Operator Mode (Monitoring & Alert Ack)</option>
              <option value="ADMIN">Admin Mode (System Config & Cameras)</option>
            </select>
          </div>

          <button
            onClick={() => onLogin(role)}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-sm rounded-lg transition shadow-lg shadow-cyan-500/20"
          >
            INITIALIZE COMMAND CENTER →
          </button>
        </div>
      </div>
    </div>
  );
}

// Render Application
ReactDOM.render(<App />, document.getElementById('root'));
