import { useEffect, useState } from "react"

function Events({ onDashboard }) {

  const [events, setEvents] = useState([])
  const [sourceIp, setSourceIp] = useState("")
  const [eventType, setEventType] = useState("")


  const fetchEvents = () => {

    const params = new URLSearchParams()

    if (sourceIp.trim()) {
      params.append("source_ip", sourceIp.trim())
    }

    if (eventType) {
      params.append("event_type", eventType)
    }

    const url =
      `http://127.0.0.1:8001/api/events?${params.toString()}`

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setEvents(data)
      })
      .catch((error) => {
        console.error("Failed to fetch events:", error)
      })
  }


  useEffect(() => {
    fetchEvents()
  }, [])


  const clearFilters = () => {

    setSourceIp("")
    setEventType("")

    fetch("http://127.0.0.1:8001/api/events")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data)
      })
      .catch((error) => {
        console.error("Failed to fetch events:", error)
      })
  }


  return (

    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}

      <header className="border-b border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between px-8 py-5">

          <div>

            <h1 className="text-xl font-bold">
              Event Explorer
            </h1>

            <p className="text-sm text-slate-400">
              Investigate security events
            </p>

          </div>


          <div className="flex items-center gap-4">

            <button
              onClick={onDashboard}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Dashboard
            </button>

            <span className="text-slate-600">
              |
            </span>

            <span className="text-sm text-slate-300">
              Events
            </span>

          </div>

        </div>

      </header>


      {/* Main */}

      <main className="p-8">

        <div className="rounded-xl border border-slate-800 bg-slate-900">


          {/* Title + Filters */}

          <div className="border-b border-slate-800 p-6">

            <h2 className="text-lg font-semibold">
              Security Events
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Showing {events.length} events
            </p>


            {/* Filters */}

            <div className="mt-5 grid gap-4 md:grid-cols-3">


              {/* Source IP */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Source IP
                </label>

                <input
                  type="text"
                  value={sourceIp}
                  onChange={(e) => setSourceIp(e.target.value)}
                  placeholder="192.168.1.50"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                />

              </div>


              {/* Event Type */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Event Type
                </label>

                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                >

                  <option value="">
                    All Events
                  </option>

                  <option value="authentication_failure">
                    Authentication Failure
                  </option>

                </select>

              </div>


              {/* Buttons */}

              <div className="flex items-end gap-2">

                <button
                  onClick={fetchEvents}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Search
                </button>


                <button
                  onClick={clearFilters}
                  className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Clear
                </button>

              </div>

            </div>

          </div>


          {/* Events Table */}

          <div className="overflow-x-auto">

            <table className="w-full text-left">

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
                        ? new Date(event.timestamp).toLocaleString()
                        : "N/A"}

                    </td>


                    <td className="px-6 py-4 text-sm">

                      {event.event_type}

                    </td>


                    <td className="px-6 py-4 text-sm text-slate-300">

                      {event.username || "-"}

                    </td>


                    <td className="px-6 py-4 font-mono text-sm text-blue-400">

                      {event.source_ip || "-"}

                    </td>


                    <td className="px-6 py-4 text-sm text-slate-300">

                      {event.host || "-"}

                    </td>

                  </tr>

                ))}


                {events.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No events found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>

  )
}

export default Events