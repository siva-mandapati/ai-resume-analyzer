import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';

function Compare() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected1, setSelected1] = useState(null);
  const [selected2, setSelected2] = useState(null);

  useEffect(() => {
    API.get('/resume/history')
      .then(res => {
        setHistory(res.data);
        if (res.data.length >= 2) {
          setSelected1(res.data[0]);
          setSelected2(res.data[1]);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSelect1 = (e) => {
    const resume = history.find(r => r._id === e.target.value);
    setSelected1(resume);
  };

  const handleSelect2 = (e) => {
    const resume = history.find(r => r._id === e.target.value);
    setSelected2(resume);
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center font-bold text-xl text-blue-600">Loading History...</div>;

  if (history.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Resumes</h1>
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-6 text-lg">You need at least 2 resumes analyzed to use the comparison feature.</p>
          <Link to="/upload" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition">Upload Another Resume</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Compare Resumes</h1>
        <p className="text-gray-600 text-lg">See how your latest iterations score against each other.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Selector 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <label className="block text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Resume A</label>
          <select 
            value={selected1?._id || ''} 
            onChange={handleSelect1}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {history.map(r => (
              <option key={r._id} value={r._id}>{r.filename} (Score: {r.score}) - {new Date(r.createdAt).toLocaleDateString()}</option>
            ))}
          </select>
        </div>

        {/* Selector 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <label className="block text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">Resume B</label>
          <select 
            value={selected2?._id || ''} 
            onChange={handleSelect2}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {history.map(r => (
              <option key={r._id} value={r._id}>{r.filename} (Score: {r.score}) - {new Date(r.createdAt).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
      </div>

      {selected1 && selected2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-6 w-1/3"></th>
                <th className="p-6 w-1/3 border-l border-gray-200 text-blue-900 font-bold text-lg">{selected1.filename}</th>
                <th className="p-6 w-1/3 border-l border-gray-200 text-purple-900 font-bold text-lg">{selected2.filename}</th>
              </tr>
            </thead>
            <tbody>
              {/* ATS Score Row */}
              <tr className="border-b border-gray-100">
                <td className="p-6 font-semibold text-gray-700">Overall ATS Score</td>
                <td className="p-6 border-l border-gray-200 text-center">
                  <span className={`text-4xl font-black ${selected1.score >= selected2.score ? 'text-green-500' : 'text-gray-400'}`}>{selected1.score}</span>
                </td>
                <td className="p-6 border-l border-gray-200 text-center">
                  <span className={`text-4xl font-black ${selected2.score > selected1.score ? 'text-green-500' : 'text-gray-400'}`}>{selected2.score}</span>
                </td>
              </tr>
              
              {/* Target Role Row */}
              <tr className="border-b border-gray-100">
                <td className="p-6 font-semibold text-gray-700">Target Role</td>
                <td className="p-6 border-l border-gray-200">{selected1.targetRole || "General"}</td>
                <td className="p-6 border-l border-gray-200">{selected2.targetRole || "General"}</td>
              </tr>

              {/* Skills Row */}
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <td className="p-6 font-semibold text-gray-700 align-top">Skills Found</td>
                <td className="p-6 border-l border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selected1.extractedSkills.slice(0, 8).map((s, i) => <span key={i} className="bg-gray-200 px-2 py-1 rounded text-xs font-medium text-gray-700">{s}</span>)}
                    {selected1.extractedSkills.length > 8 && <span className="text-xs text-gray-500 py-1">+{selected1.extractedSkills.length - 8} more</span>}
                  </div>
                </td>
                <td className="p-6 border-l border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selected2.extractedSkills.slice(0, 8).map((s, i) => <span key={i} className="bg-gray-200 px-2 py-1 rounded text-xs font-medium text-gray-700">{s}</span>)}
                    {selected2.extractedSkills.length > 8 && <span className="text-xs text-gray-500 py-1">+{selected2.extractedSkills.length - 8} more</span>}
                  </div>
                </td>
              </tr>

              {/* Missing Skills Row */}
              <tr>
                <td className="p-6 font-semibold text-gray-700 align-top">Missing Keywords</td>
                <td className="p-6 border-l border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selected1.missingSkills.map((s, i) => <span key={i} className="bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded text-xs font-medium">{s}</span>)}
                  </div>
                </td>
                <td className="p-6 border-l border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selected2.missingSkills.map((s, i) => <span key={i} className="bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded text-xs font-medium">{s}</span>)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Compare;
