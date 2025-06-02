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

// Helper function to format break duration
const formatBreakDuration = (minutes) => {
  if (!minutes) return "None";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours > 0 ? `${hours}hr ` : ""}${mins > 0 ? `${mins}mins` : ""}`.trim();
};

export default function App() {
  const [logs, setLogs] = useState(getLocalData());
  const [modalOpen, setModalOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [form, setForm] = useState({ 
    date: "", 
    timeIn: "", 
    timeOut: "",
    breaks: [] // Now storing multiple breaks
  });
  const [currentBreak, setCurrentBreak] = useState({ start: "", end: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [totalHoursNeeded, setTotalHoursNeeded] = useState(() => {
    const data = localStorage.getItem("ojt-total-hours-needed");
    return data ? parseFloat(data) : 0;
  });
  const [showNeededModal, setShowNeededModal] = useState(false);
  const [neededInput, setNeededInput] = useState(totalHoursNeeded);
  const [randomSprite, setRandomSprite] = useState("");

  useEffect(() => {
    localStorage.setItem("ojt-logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("ojt-total-hours-needed", totalHoursNeeded);
  }, [totalHoursNeeded]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * spriteList.length);
    setRandomSprite(spriteList[randomIndex]);
  }, []);

  const calculateHours = (inTime, outTime, breaks) => {
    const start = new Date(`1970-01-01T${inTime}`);
    const end = new Date(`1970-01-01T${outTime}`);
    let total = Math.abs((end - start) / (1000 * 60 * 60));

    // Calculate total break time in hours
    const totalBreakHours = breaks.reduce((sum, br) => {
      if (br.start && br.end) {
        const bStart = new Date(`1970-01-01T${br.start}`);
        const bEnd = new Date(`1970-01-01T${br.end}`);
        
        // Only count if break is within work hours
        if (bStart >= start && bEnd <= end) {
          return sum + (bEnd - bStart) / (1000 * 60 * 60);
        }
      }
      return sum;
    }, 0);

    total -= totalBreakHours;
    return Math.max(0, total);
  };

  const calculateTotalBreakMinutes = (breaks) => {
    return breaks.reduce((sum, br) => {
      if (br.start && br.end) {
        const bStart = new Date(`1970-01-01T${br.start}`);
        const bEnd = new Date(`1970-01-01T${br.end}`);
        return sum + (bEnd - bStart) / (1000 * 60);
      }
      return sum;
    }, 0);
  };

  const handleSave = () => {
    const hours = calculateHours(form.timeIn, form.timeOut, form.breaks);
    const totalBreakMinutes = calculateTotalBreakMinutes(form.breaks);
    
    const newEntry = { 
      date: form.date, 
      timeIn: form.timeIn, 
      timeOut: form.timeOut,
      breaks: form.breaks,
      hours,
      totalBreakMinutes // Store total break minutes for display
    };

    if (editIndex !== null) {
      const updatedLogs = logs.map((log, idx) =>
        idx === editIndex ? newEntry : log
      );
      setLogs(updatedLogs);
    } else {
      setLogs([...logs, newEntry]);
    }

    setForm({ date: "", timeIn: "", timeOut: "", breaks: [] });
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const entry = logs[index];
    setForm({ 
      date: entry.date, 
      timeIn: entry.timeIn, 
      timeOut: entry.timeOut,
      breaks: entry.breaks || []
    });
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleDelete = (index) => {
    const updated = logs.filter((_, i) => i !== index);
    setLogs(updated);
  };

  const addBreak = () => {
    if (currentBreak.start && currentBreak.end) {
      setForm({
        ...form,
        breaks: [...form.breaks, { ...currentBreak }]
      });
      setCurrentBreak({ start: "", end: "" });
    }
  };

  const removeBreak = (index) => {
    const updatedBreaks = form.breaks.filter((_, i) => i !== index);
    setForm({ ...form, breaks: updatedBreaks });
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
        <button className="text-sm text-blue-400 hover:text-blue-400 cursor-pointer" onClick={() => setSupportOpen(true)}>
          Support Developer ❤️
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 max-w-4xl mx-auto w-full flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">🕒 OJT HOUR TRACKER</h1>
          <p className="text-slate-300 mt-2">Track your attendance and rendered hours with ease.</p>
        </div>

        {/* ADD BUTTON */}
        <div className="flex justify-end mb-4 items-center">
          <button className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 flex cursor-pointer" onClick={() => {
            setForm({ date: "", timeIn: "", timeOut: "", breaks: [] });
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
                <th className="p-2">Break Time</th>
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
                  <td className="p-2">{formatBreakDuration(log.totalBreakMinutes)}</td>
                  <td className="p-2">{log.hours.toFixed(2)}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(index)} className="text-yellow-400 hover:text-yellow-600 cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(index)} className="text-red-400 hover:text-red-600 cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-slate-400">No entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="text-right mt-4 font-bold text-white space-y-2">
          <div>Total Rendered Hours: {totalHours}</div>
          <div>Total Hours Needed: {totalHoursNeeded}</div>
          <div>Remaining Hours: {(totalHoursNeeded - totalHours).toFixed(2)}</div>

          <button onClick={() => { setNeededInput(totalHoursNeeded); setShowNeededModal(true); }} className="mt-2 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 text-sm cursor-pointer">
            + Set Total Hours Needed
          </button>

          <div className="mt-4 flex justify-end">
            <img src={`/sprites/${randomSprite}`} alt="Random Sprite" className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* TIME ENTRY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl mb-4">{editIndex !== null ? "Edit Entry" : "Add Time Entry"}</h2>
            <label className="block mb-2">
              Date:
              <input type="date" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" 
                value={form.date} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
              />
            </label>
            <label className="block mb-2">
              Time In:
              <input type="time" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" 
                value={form.timeIn} 
                onChange={(e) => setForm({ ...form, timeIn: e.target.value })} 
              />
            </label>
            <label className="block mb-2">
              Time Out:
              <input type="time" className="w-full mt-1 p-2 rounded bg-slate-900 text-white" 
                value={form.timeOut} 
                onChange={(e) => setForm({ ...form, timeOut: e.target.value })} 
              />
            </label>

            {/* BREAK TIME SECTION */}
            <div className="mb-4 mt-6">
              <h3 className="font-semibold mb-2">Break Times</h3>
              
              {/* Current break input */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-xs">Start</label>
                  <input type="time" className="w-full p-2 rounded bg-slate-900 text-white text-sm" 
                    value={currentBreak.start} 
                    onChange={(e) => setCurrentBreak({...currentBreak, start: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs">End</label>
                  <input type="time" className="w-full p-2 rounded bg-slate-900 text-white text-sm" 
                    value={currentBreak.end} 
                    onChange={(e) => setCurrentBreak({...currentBreak, end: e.target.value})} 
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addBreak}
                    className="bg-blue-500 px-3 py-2 rounded hover:bg-blue-600 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* List of added breaks */}
              <div className="max-h-32 overflow-y-auto">
                {form.breaks.map((br, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-900 p-2 mb-2 rounded text-sm">
                    <span>{br.start} - {br.end}</span>
                    <button 
                      onClick={() => removeBreak(index)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={handleSave}>
                Save
              </button>
              <button className="text-slate-400 hover:text-white" onClick={() => { setModalOpen(false); setEditIndex(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SET HOURS NEEDED MODAL */}
      {showNeededModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl mb-4">Set Total Hours Needed</h2>
            <input type="number" className="w-full p-2 mb-4 rounded bg-slate-900 text-white" 
              value={neededInput} 
              onChange={(e) => setNeededInput(e.target.value)} 
            />
            <div className="flex justify-between">
              <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" 
                onClick={() => { 
                  setTotalHoursNeeded(parseFloat(neededInput) || 0); 
                  setShowNeededModal(false); 
                }}
              >
                Save
              </button>
              <button className="text-slate-400 hover:text-white" onClick={() => setShowNeededModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {supportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-4 rounded-lg w-[90%] max-w-sm shadow-xl relative">
            <button onClick={() => setSupportOpen(false)} className="absolute top-2 right-3 text-white text-lg hover:text-red-400">
              ✖
            </button>
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