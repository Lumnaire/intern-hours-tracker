import { useEffect, useState } from "react";
import "./App.css";

const getLocalData = () => {
  const data = localStorage.getItem("ojt-logs");
  return data ? JSON.parse(data) : [];
};

const spriteList = [
  "abra.gif", "bellsprout.gif", "blastoise.gif", "bulbasaur.gif", "butterfree.gif",
  "charizard.gif", "paras.gif", "horsea.gif", "eevee.gif", "dratini.gif",
  "cubone.gif", "charmander.gif", "pidgeotto.gif", "pikachu.gif", "sandshrew.gif",
  "sandslash.gif", "squirtle.gif", "vulpix.gif",
];

export default function App() {
  const [logs, setLogs] = useState(getLocalData());
  const [modalOpen, setModalOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [form, setForm] = useState({ date: "", timeIn: "", timeOut: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [totalHoursNeeded, setTotalHoursNeeded] = useState(() => {
    const data = localStorage.getItem("ojt-total-hours-needed");
    return data ? parseFloat(data) : 0;
  });
  const [showNeededModal, setShowNeededModal] = useState(false);
  const [neededInput, setNeededInput] = useState(totalHoursNeeded);
  const [randomSprite, setRandomSprite] = useState("");
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breaks, setBreaks] = useState(() => {
    const data = localStorage.getItem("ojt-breaks");
    return data ? JSON.parse(data) : [];
  });
  const [breakInput, setBreakInput] = useState({ start: "", end: "" });

  useEffect(() => {
    localStorage.setItem("ojt-logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("ojt-total-hours-needed", totalHoursNeeded);
  }, [totalHoursNeeded]);

  useEffect(() => {
    localStorage.setItem("ojt-breaks", JSON.stringify(breaks));
  }, [breaks]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * spriteList.length);
    setRandomSprite(spriteList[randomIndex]);
  }, []);

  const calculateHours = (inTime, outTime) => {
    const start = new Date(`1970-01-01T${inTime}`);
    const end = new Date(`1970-01-01T${outTime}`);
    let total = Math.abs((end - start) / (1000 * 60 * 60));

    // Subtract overlapping breaks only
    breaks.forEach((br) => {
      const bStart = new Date(`1970-01-01T${br.start}`);
      const bEnd = new Date(`1970-01-01T${br.end}`);
      const overlapStart = new Date(Math.max(start, bStart));
      const overlapEnd = new Date(Math.min(end, bEnd));

      if (overlapEnd > overlapStart) {
        const overlap = (overlapEnd - overlapStart) / (1000 * 60 * 60);
        total -= overlap;
      }
    });

    return Math.max(0, total);
  };

  const handleSave = () => {
    const hours = calculateHours(form.timeIn, form.timeOut);
    const newEntry = { ...form, hours };

    if (editIndex !== null) {
      const updatedLogs = logs.map((log, idx) =>
        idx === editIndex ? newEntry : log
      );
      setLogs(updatedLogs);
    } else {
      setLogs([...logs, newEntry]);
    }

    setForm({ date: "", timeIn: "", timeOut: "" });
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const entry = logs[index];
    setForm({ date: entry.date, timeIn: entry.timeIn, timeOut: entry.timeOut });
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleDelete = (index) => {
    const updated = logs.filter((_, i) => i !== index);
    setLogs(updated);
  };

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0).toFixed(2);

  return (
     <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* HEADER */}
      <div className="bg-slate-800 shadow-md shadow-slate-900 px-6 py-4 flex items-center justify-between">
        <a href="https://ronald-portfolio-lumnaire.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center">
          <img className="w-10 rounded-full mr-3" src="/Lumnaire.jpg" alt="logo" />
          <h1 className="text-xl font-semibold text-white">Lumnaire</h1>
        </a>
        <button className="text-sm text-white hover:text-blue-400" onClick={() => setSupportOpen(true)}>
          Support Developer ❤️
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 max-w-4xl mx-auto w-full flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">🕒 OJT HOUR TRACKER</h1>
          <p className="text-slate-300 mt-2">Track your attendance and rendered hours with ease.</p>
           <small className="text-red-400">[NOTE: Add your regular break time first to deduct it from your hours.]</small>
        </div>

        {/* ADD BUTTON */}
        <div className="flex justify-end mb-4 items-center">
      
          <button className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 flex" onClick={() => {
            setForm({ date: "", timeIn: "", timeOut: "" });
            setEditIndex(null);
            setModalOpen(true);
          }}>
           + Add time entry
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-sm text-left text-white rounded">
            <thead className="bg-slate-800 text-white sticky top-0">
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
                <tr key={index} className="odd:bg-slate-900 even:bg-slate-800 border-b border-slate-700">
                  <td className="p-2">{log.date}</td>
                  <td className="p-2">{log.timeIn}</td>
                  <td className="p-2">{log.timeOut}</td>
                  <td className="p-2">{log.hours.toFixed(2)}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(index)} className="text-yellow-400 hover:text-yellow-600">Edit</button>
                    <button onClick={() => handleDelete(index)} className="text-red-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-slate-400">No entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="text-right mt-4 font-bold text-white space-y-2">
          <div>Total Rendered Hours: {totalHours}</div>
          <div>Total Hours Needed: {totalHoursNeeded}</div>
          <div>Remaining Hours: {(totalHoursNeeded - totalHours).toFixed(2)}</div>

          <button onClick={() => { setNeededInput(totalHoursNeeded); setShowNeededModal(true); }} className="mt-2 bg-blue-500 px-4 py-1 rounded hover:bg-blue-600 text-sm">
           + Set Total Hours Needed
          </button>
          <button onClick={() => setBreakModalOpen(true)} className="ml-2 mt-2 bg-purple-500 px-4 py-1 rounded hover:bg-purple-600 text-sm">
           + Add Break Time
          </button>
           

          <div className="mt-4 flex justify-end">
            <img src={`/sprites/${randomSprite}`} alt="Random Sprite" className="w-20 h-20" />
          </div>
         
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl mb-4">{editIndex !== null ? "Edit Entry" : "Add Time Entry"}</h2>
            <label className="block mb-2">
              Date:
              <input type="date" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="block mb-2">
              Time In:
              <input type="time" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" value={form.timeIn} onChange={(e) => setForm({ ...form, timeIn: e.target.value })} />
            </label>
            <label className="block mb-4">
              Time Out:
              <input type="time" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" value={form.timeOut} onChange={(e) => setForm({ ...form, timeOut: e.target.value })} />
            </label>
            <div className="flex justify-between">
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={handleSave}>Save</button>
              <button className="text-slate-400 hover:text-white" onClick={() => { setModalOpen(false); setEditIndex(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showNeededModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl mb-4">Set Total Hours Needed</h2>
            <input type="number" className="w-full p-2 mb-4 rounded bg-slate-900 text-white" value={neededInput} onChange={(e) => setNeededInput(e.target.value)} />
            <div className="flex justify-between">
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={() => { setTotalHoursNeeded(parseFloat(neededInput) || 0); setShowNeededModal(false); }}>Save</button>
              <button className="text-slate-400 hover:text-white" onClick={() => setShowNeededModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {breakModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl mb-4">Add Break Time</h2>
            <div className="mb-4 space-y-2">
              <div>
                <label className="block text-sm">Break Start</label>
                <input type="time" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" value={breakInput.start} onChange={(e) => setBreakInput({ ...breakInput, start: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Break End</label>
                <input type="time" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" value={breakInput.end} onChange={(e) => setBreakInput({ ...breakInput, end: e.target.value })} />
              </div>
              <button className="mt-2 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={() => {
                if (breakInput.start && breakInput.end) {
                  setBreaks([...breaks, { ...breakInput }]);
                  setBreakInput({ start: "", end: "" });
                }
              }}>
                Add Break
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto mb-4">
              {breaks.map((br, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-900 p-2 mb-2 rounded">
                  <span>{br.start} - {br.end}</span>
                  <button onClick={() => setBreaks(breaks.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600">Delete</button>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={() => setBreakModalOpen(false)}>Done</button>
              <button className="text-slate-400 hover:text-white" onClick={() => { setBreakModalOpen(false); setBreakInput({ start: "", end: "" }); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {supportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-4 rounded-lg w-[90%] max-w-sm shadow-xl relative">
            <button onClick={() => setSupportOpen(false)} className="absolute top-2 right-3 text-white text-lg hover:text-red-400">✖</button>
            <h2 className="text-center text-lg mb-3 font-semibold">Support Developer</h2>
            <div className="bg-slate-900 p-2 rounded">
              <img src="/gcash-qr-code.jpeg" alt="GCash QR Code" className="w-full rounded" />
            </div>
            <p className="text-center mt-3 text-sm text-slate-400">Thank you for your support! 💙</p>
          </div>
        </div>
      )}

      <footer className="bg-slate-800 text-center text-sm py-4 mt-6 text-slate-400">
        Developed by <a className="text-blue-400" href="https://ronald-portfolio-lumnaire.vercel.app/" target="_blank">Ronald Castromero</a> 💻
      </footer>
    </div>
  );
}