import { useEffect, useState } from "react";
import "./App.css";
const getLocalData = () => {
  const data = localStorage.getItem("ojt-logs");
  return data ? JSON.parse(data) : [];
};

export default function App() {
  const [logs, setLogs] = useState(getLocalData());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: "", timeIn: "", timeOut: "" });

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0).toFixed(2);

  useEffect(() => {
    localStorage.setItem("ojt-logs", JSON.stringify(logs));
  }, [logs]);

  const calculateHours = (inTime, outTime) => {
    const start = new Date(`1970-01-01T${inTime}`);
    const end = new Date(`1970-01-01T${outTime}`);
    return Math.abs((end - start) / (1000 * 60 * 60)); // hours
  };

  const handleAdd = () => {
    const hours = calculateHours(form.timeIn, form.timeOut);
    setLogs([...logs, { ...form, hours }]);
    setForm({ date: "", timeIn: "", timeOut: "" });
    setModalOpen(false);
  };

  const handleDelete = (index) => {
    const updated = logs.filter((_, i) => i !== index);
    setLogs(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <div className="bg-slate-800 shadow-md shadow-slate-900 px-6 py-4 flex items-center">
       <img className="w-10 rounded-full mr-3" src="/Lumnaire.jpg" alt="" />
        <h1 className="text-xl font-semibold text-white">Lumnaire</h1>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">🕒 OJT HOUR TRACKER</h1>
          <p className="text-slate-300 mt-2">
            Track your attendance and rendered hours with ease.
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setModalOpen(true)}
          >
            Time In
          </button>
        </div>

        <table className="w-full text-sm text-left text-white rounded overflow-hidden">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Time In</th>
              <th className="p-2">Time Out</th>
              <th className="p-2">Hours</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={index}
                className="odd:bg-slate-900 even:bg-slate-800 border-b border-slate-700"
              >
                <td className="p-2">{log.date}</td>
                <td className="p-2">{log.timeIn}</td>
                <td className="p-2">{log.timeOut}</td>
                <td className="p-2">{log.hours.toFixed(2)}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-slate-400">
                  No entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-right mt-4 font-bold text-white">
          Total Rendered Hours: {totalHours}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl mb-4">Add Time Entry</h2>
            <label className="block mb-2">
              Date:
              <input
                type="date"
                className="w-full mt-1 p-2 rounded bg-slate-900 text-white"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="block mb-2">
              Time In:
              <input
                type="time"
                className="w-full mt-1 p-2 rounded bg-slate-900 text-white"
                value={form.timeIn}
                onChange={(e) => setForm({ ...form, timeIn: e.target.value })}
              />
            </label>
            <label className="block mb-4">
              Time Out:
              <input
                type="time"
                className="w-full mt-1 p-2 rounded bg-slate-900 text-white"
                value={form.timeOut}
                onChange={(e) => setForm({ ...form, timeOut: e.target.value })}
              />
            </label>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleAdd}
              >
                Save
              </button>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
