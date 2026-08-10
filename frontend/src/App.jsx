import Events from "./Events"
import Alerts from "./Alerts"
import Investigation from "./Investigation"
import { useEffect, useState } from "react"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [totalEvents, setTotalEvents] = useState(0)
  const [activeAlerts, setActiveAlerts] = useState(0)
  const [criticalAlerts, setCriticalAlerts] = useState(0)
  const [monitoredHosts, setMonitoredHosts] = useState(0)

  const [severity, setSeverity] = useState({
  CRITICAL: 0,
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0
})

const [topSourceIps, setTopSourceIps] = useState([])

const [alerts, setAlerts] = useState([])
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  useEffect(() => {

  fetch("http://127.0.0.1:8001/api/dashboard/overview")
    .then((response) => response.json())
    .then((data) => {

      setTotalEvents(data.total_events)
      setActiveAlerts(data.active_alerts)
      setCriticalAlerts(data.critical_alerts)
      setMonitoredHosts(data.monitored_hosts)

      setSeverity(data.severity)

      setTopSourceIps(data.top_source_ips)

    })
    .catch((error) => {
      console.error(
        "Failed to fetch dashboard overview:",
        error
      )
    })


  fetch("http://127.0.0.1:8001/api/alerts")
    .then((response) => response.json())
    .then((data) => {
      setAlerts(data)
    })
    .catch((error) => {
      console.error(
        "Failed to fetch alerts:",
        error
      )
    })

}, [])

  if (currentPage === "events") {
  return (
    <Events
      onDashboard={() => setCurrentPage("dashboard")}
    />
  )
}

   if (currentPage === "alerts") {
  return (
    <Alerts
      onDashboard={() => setCurrentPage("dashboard")}
      onEvents={() => setCurrentPage("events")}
    />
  )
}
   if (currentPage === "investigation") {
  return (
    <Investigation
      alertId={selectedAlertId}
      onBack={() => setCurrentPage("alerts")}
    />
  )
}
  
   return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between px-8 py-5">
          
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2">
              🛡️
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Mini SIEM
              </h1>

              <p className="text-sm text-slate-400">
                Security Operations Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">

         <div className="flex items-center gap-2">

            <button
             onClick={() => setCurrentPage("dashboard")}
             className={`text-sm ${
             currentPage === "dashboard"
             ? "text-blue-400"
             : "text-slate-400"
             }`}
                >
      Dashboard
    </button>

    <button
      onClick={() => setCurrentPage("events")}
      className={`text-sm ${
        currentPage === "events"
          ? "text-blue-400"
          : "text-slate-400"
      }`}
    >
      Events
    </button>

{/* NEW ALERTS BUTTON */}

      <button
    onClick={() => setCurrentPage("alerts")}
    className={`text-sm ${
      currentPage === "alerts"
        ? "text-blue-400"
        : "text-slate-400"
    }`}
  >
    Alerts
   </button>


  </div>



  <div className="flex items-center gap-2">

    <span className="h-2 w-2 rounded-full bg-green-500"></span>

    <span className="text-sm text-slate-300">
      System Online
    </span>

  </div>

</div>
        </div>
      </header>


      {/* Main */}
      <main className="p-8">

        <h2 className="mb-6 text-2xl font-bold">
          Security Overview
        </h2>


        {/* Statistics */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <StatCard
           title="Total Events"
           value={totalEvents.toLocaleString()}
           subtitle="All collected events"
         />

          <StatCard
           title="Active Alerts"
           value={activeAlerts}
           subtitle="Requires investigation"
        />

          <StatCard
           title="Critical Alerts"
           value={criticalAlerts}
           subtitle="Immediate attention"
        />

          <StatCard
            title="Monitored Hosts"
            value={monitoredHosts}
            subtitle="Unique hosts"
          />

        </div>


        {/* Content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Severity */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="mb-6 text-lg font-semibold">
              Alert Severity
            </h3>

            <div className="space-y-4">

              <SeverityRow
               label="Critical"
                value={severity.CRITICAL}
               width={`${Math.min(severity.CRITICAL * 10, 100)}%`}
               color="bg-red-500"
            />

              <SeverityRow
               label="High"
               value={severity.HIGH}
               width={`${Math.min(severity.HIGH * 10, 100)}%`}
               color="bg-orange-500"
            />

             <SeverityRow
              label="Medium"
              value={severity.MEDIUM}
              width={`${Math.min(severity.MEDIUM * 10, 100)}%`}
              color="bg-yellow-500"
            />

             <SeverityRow
              label="Low"
              value={severity.LOW}
              width={`${Math.min(severity.LOW * 10, 100)}%`}
              color="bg-blue-500"
            />

            </div>

          </section>


          {/* Top IPs */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="mb-6 text-lg font-semibold">
              Top Source IPs
            </h3>

            <div className="space-y-4">

              {topSourceIps.map((item) => (
             <IPRow
              key={item.ip}
              ip={item.ip}
             events={item.events}
             />
             ))}

              

              

              

            </div>

          </section>

        </div>


        {/* Recent Alerts */}
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 p-6">

            <h3 className="text-lg font-semibold">
              Recent Alerts
            </h3>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-800/50 text-sm text-slate-400">

                <tr>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Detection</th>
                  <th className="px-6 py-4">Source IP</th>
                  <th className="px-6 py-4">Host</th>
                  <th className="px-6 py-4">Status</th>
                </tr>

              </thead>
              <tbody>

              {alerts.map((alert, index) => (
               <AlertRow
                 key={index}
                 severity={alert.severity}
                 detection={alert.rule_name}
                 ip={alert.source_ip}
                 host={alert.host}
                 status={alert.status}
               />
              ))}

            </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  )
}


function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>

    </div>
  )
}


function SeverityRow({ label, value, width, color }) {
  return (
    <div>

      <div className="mb-2 flex justify-between text-sm">

        <span className="text-slate-300">
          {label}
        </span>

        <span className="text-slate-400">
          {value}
        </span>

      </div>

      <div className="h-2 rounded-full bg-slate-800">

        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width }}
        />

      </div>

    </div>
  )
}


function IPRow({ ip, events }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">

      <span className="font-mono text-sm text-slate-300">
        {ip}
      </span>

      <span className="text-sm text-slate-400">
        {events} events
      </span>

    </div>
  )
}


function AlertRow({
  severity,
  detection,
  ip,
  host,
  status
}) {
  const severityColors = {
    HIGH: "text-red-400",
    MEDIUM: "text-yellow-400",
    LOW: "text-blue-400",
  }

  return (

    <tr className="border-t border-slate-800">

      <td className={`px-6 py-4 text-sm font-semibold ${severityColors[severity]}`}>
        {severity}
      </td>

      <td className="px-6 py-4 text-sm">
        {detection}
      </td>

      <td className="px-6 py-4 font-mono text-sm text-slate-400">
        {ip}
      </td>

      <td className="px-6 py-4 text-sm text-slate-300">
        {host}
      </td>

      <td className="px-6 py-4 text-sm">
        {status}
      </td>

    </tr>
  )
}


export default App