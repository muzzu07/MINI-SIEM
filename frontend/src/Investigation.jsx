import { useEffect, useState } from "react"

function Investigation({ alertId, onBack }) {

  const [alert, setAlert] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (!alertId) {
      return
    }

    fetch(`http://127.0.0.1:8001/api/alerts/${alertId}`)
      .then((response) => response.json())
      .then((data) => {
        setAlert(data)

        return fetch(
          `http://127.0.0.1:8001/api/events?source_ip=${data.source_ip}`
        )
      })
      .then((response) => response.json())
      .then((data) => {
        setEvents(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load investigation:", error)
        setLoading(false)
      })

  }, [alertId])


  const updateStatus = (status) => {

    fetch(
      `http://127.0.0.1:8001/api/alerts/${alertId}/status?status=${status}`,
      {
        method: "PATCH"
      }
    )
      .then((response) => response.json())
      .then(() => {

        setAlert((currentAlert) => ({
          ...currentAlert,
          status: status
        }))

      })
      .catch((error) => {
        console.error("Failed to update status:", error)
      })
  }


  if (loading) {

    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-400">
          Loading investigation...
        </p>
      </div>
    )

  }


  if (!alert) {

    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">

        <button
          onClick={onBack}
          className="mb-6 text-blue-400"
        >
          ← Back to Alerts
        </button>

        <p className="text-red-400">
          Alert not found.
        </p>

      </div>
    )

  }


  const severityClass = {
    CRITICAL: "text-red-500",
    HIGH: "text-orange-400",
    MEDIUM: "text-yellow-400",
    LOW: "text-blue-400"
  }


  return (

    <div className="min-h-screen bg-slate-950 text-white">


      {/* Header */}

      <header className="border-b border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between px-8 py-5">

          <div>

            <h1 className="text-xl font-bold">
              Alert Investigation
            </h1>

            <p className="text-sm text-slate-400">
              SOC Analyst Investigation Workspace
            </p>

          </div>

          <button
            onClick={onBack}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Alerts
          </button>

        </div>

      </header>


      <main className="p-8">


        {/* Alert Summary */}

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row">

            <div>

              <p className="text-sm text-slate-400">
                Detection
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {alert.rule_name}
              </h2>

            </div>


            <div
              className={`text-lg font-bold ${
                severityClass[alert.severity] ||
                "text-slate-300"
              }`}
            >
              {alert.severity}
            </div>

          </div>


          {/* Details */}

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">


            <div>

              <p className="text-sm text-slate-500">
                Source IP
              </p>

              <p className="mt-1 font-mono text-blue-400">
                {alert.source_ip}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                Host
              </p>

              <p className="mt-1">
                {alert.host || "-"}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                Attempts
              </p>

              <p className="mt-1">
                {alert.attempts || "-"}
              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">
                Status
              </p>

              <select
                value={alert.status}
                onChange={(e) =>
                  updateStatus(e.target.value)
                }
                className="mt-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
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

            </div>

          </div>

        </section>


        {/* Detection Description */}

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-lg font-semibold">
            Detection Details
          </h3>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            {alert.description ||
              "No detection description available."}
          </p>

        </section>


        {/* Related Events */}

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 p-6">

            <h3 className="text-lg font-semibold">
              Related Events
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Events associated with source IP{" "}
              <span className="font-mono text-blue-400">
                {alert.source_ip}
              </span>
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="min-w-[800px] w-full text-left">

              <thead className="bg-slate-800/50 text-sm text-slate-400">

                <tr>

                  <th className="px-6 py-4">
                    Timestamp
                  </th>

                  <th className="px-6 py-4">
                    Event Type
                  </th>

                  <th className="px-6 py-4">
                    Username
                  </th>

                  <th className="px-6 py-4">
                    Source IP
                  </th>

                  <th className="px-6 py-4">
                    Host
                  </th>

                </tr>

              </thead>


              <tbody>

                {events.map((event, index) => (

                  <tr
                    key={index}
                    className="border-t border-slate-800"
                  >

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {event.timestamp
                        ? new Date(
                            event.timestamp
                          ).toLocaleString()
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {event.event_type}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {event.username || "-"}
                    </td>

                    <td className="px-6 py-4 font-mono text-sm text-blue-400">
                      {event.source_ip || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {event.host || "-"}
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

export default Investigation