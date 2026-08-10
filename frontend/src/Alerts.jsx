import { useEffect, useState } from "react"

function Alerts({ 
  onDashboard, 
  onEvents,
  onInvestigate
}) {

  const [alerts, setAlerts] = useState([])

  useEffect(() => {

    fetch("http://127.0.0.1:8001/api/alerts")
      .then((response) => response.json())
      .then((data) => {
        setAlerts(data)
      })
      .catch((error) => {
        console.error("Failed to fetch alerts:", error)
      })

  }, [])


  const updateStatus = (id, status) => {

    fetch(
      `http://127.0.0.1:8001/api/alerts/${id}/status?status=${status}`,
      {
        method: "PATCH"
      }
    )
      .then((response) => response.json())
      .then(() => {

        setAlerts((currentAlerts) =>
          currentAlerts.map((alert) =>
            alert._id === id
              ? {
                  ...alert,
                  status: status
                }
              : alert
          )
        )

      })
      .catch((error) => {
        console.error("Failed to update alert:", error)
      })
  }


  const severityClass = {
    CRITICAL: "text-red-500",
    HIGH: "text-orange-400",
    MEDIUM: "text-yellow-400",
    LOW: "text-blue-400"
  }


  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between px-8 py-5">

          <div>

            <h1 className="text-xl font-bold">
              Alert Management
            </h1>

            <p className="text-sm text-slate-400">
              Investigate and manage security alerts
            </p>

          </div>


          <div className="flex items-center gap-5">

            <button
              onClick={onDashboard}
              className="text-sm text-slate-400 hover:text-white"
            >
              Dashboard
            </button>

            <button
              onClick={onEvents}
              className="text-sm text-slate-400 hover:text-white"
            >
              Events
            </button>

            <span className="text-sm text-blue-400">
              Alerts
            </span>

          </div>

        </div>

      </header>


      <main className="p-8">

        <section className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 p-6">

            <h2 className="text-lg font-semibold">
              Security Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {alerts.length} alerts
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-800/50 text-sm text-slate-400">

                <tr>

                  <th className="px-6 py-4">
                    Severity
                  </th>

                  <th className="px-6 py-4">
                    Detection
                  </th>

                  <th className="px-6 py-4">
                    Source IP
                  </th>

                  <th className="px-6 py-4">
                    Host
                  </th>

                  <th className="px-6 py-4">
                    Attempts
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {alerts.map((alert) => (

                  <tr
                    key={alert._id}
                    className="border-t border-slate-800"
                  >

                    <td
                      className={`px-6 py-4 text-sm font-semibold ${
                        severityClass[alert.severity] ||
                        "text-slate-300"
                      }`}
                    >
                      {alert.severity}
                    </td>


                    <td className="px-6 py-4 text-sm">
                      {alert.rule_name}
                    </td>


                    <td className="px-6 py-4 font-mono text-sm text-blue-400">
                      {alert.source_ip}
                    </td>


                    <td className="px-6 py-4 text-sm">
                      {alert.host || "-"}
                    </td>


                    <td className="px-6 py-4 text-sm">
                      {alert.attempts || "-"}
                    </td>


                    <td className="px-6 py-4">

                      <select
                        value={alert.status}
                        onChange={(e) =>
                          updateStatus(
                            alert._id,
                            e.target.value
                          )
                        }
                        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                      >

                        <option value="NEW">
                          NEW
                        </option>

                        <option value="ACKNOWLEDGED">
                          ACKNOWLEDGED
                        </option>

                        <option value="INVESTIGATING">
                          INVESTIGATING
                        </option>

                        <option value="CONTAINED">
                          CONTAINED
                        </option>

                        <option value="RESOLVED">
                          RESOLVED
                        </option>

                      </select>

                    </td>


                    <td className="px-6 py-4">
                    <button
                      onClick={() => onInvestigate(alert._id)}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500"
                  >
                   Investigate
                  </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Alerts