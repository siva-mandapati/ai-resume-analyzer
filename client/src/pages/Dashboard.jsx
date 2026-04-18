import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, TrendingUp, Award, Clock } from 'lucide-react';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/resume/history');
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const averageScore = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map(r => r.score)) : 0;
  const chartData = [...history].reverse().map((r, i) => ({
    name: `V${i + 1}`,
    score: r.score,
    date: new Date(r.createdAt).toLocaleDateString()
  }));

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Welcome back, {user?.name}. Here's your resume performance.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/compare" className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Compare
          </Link>
          <Link to="/upload" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center gap-2">
            + New Analysis
          </Link>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Award className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Average Score</p>
            <p className="text-3xl font-black text-gray-900">{averageScore}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl"><ArrowUpRight className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Highest Score</p>
            <p className="text-3xl font-black text-gray-900">{bestScore}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Clock className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Resumes</p>
            <p className="text-3xl font-black text-gray-900">{history.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Score Progression</h2>
          {history.length >= 2 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <TrendingUp className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">Upload more resumes to see your improvement trend.</p>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent History</h2>
          {loading ? (
            <p className="text-gray-500">Loading your history...</p>
          ) : history.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
              {history.map((item, idx) => (
                <Link key={item._id} to={`/analysis/${item._id}`} className="block p-5 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md transition bg-gray-50 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">{item.filename}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${item.score > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <h3 className="text-gray-600 font-medium mb-2">No resumes analyzed yet</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your first resume to get actionable AI feedback.</p>
              <Link to="/upload" className="text-blue-600 font-medium hover:underline">Go to Upload Page</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
