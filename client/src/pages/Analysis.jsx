import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';
import html2pdf from 'html2pdf.js';
import { Download, FileText, TrendingUp, CheckCircle, Map, Target, XCircle, PenTool, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

function Analysis() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const reportRef = useRef();


  // Cover Letter State
  const [coverLetterJobTitle, setCoverLetterJobTitle] = useState('');
  const [coverLetterCompanyName, setCoverLetterCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await API.get(`/resume/${id}`);
        setData(res.data);
        toast.success('Analysis complete!');
      } catch (err) {
        setError('Failed to load analysis. Please ensure you have permission.');
        toast.error('Failed to load analysis.');
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `${data.filename}-analysis.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };


  const handleGenerateCoverLetter = async () => {
    if (!coverLetterJobTitle || !coverLetterCompanyName) {
      toast.error("Please provide both Job Title and Company Name");
      return;
    }
    setCoverLetterLoading(true);
    try {
      const res = await API.post(`/resume/cover-letter/${id}`, {
        jobTitle: coverLetterJobTitle,
        companyName: coverLetterCompanyName
      });
      setCoverLetter(res.data.coverLetter);
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error("Failed to generate cover letter");
    }
    setCoverLetterLoading(false);
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${coverLetterCompanyName || 'Company'}-CoverLetter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex gap-4 mb-8">
          <div className="h-16 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <Link to="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block font-medium">&larr; Back to Dashboard</Link>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Resume Analysis Report</h1>
          <p className="text-gray-500 mt-2 text-lg">
            File: <span className="font-medium text-gray-700">{data.filename}</span>
            {data.targetRole && data.targetRole !== "General" && (
              <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 flex items-center inline-flex gap-1">
                <Target className="w-4 h-4" /> Role: {data.targetRole}
              </span>
            )}
            {data.jobDescription && (
              <span className="ml-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-100">
                JD Matched ({data.matchPercentage}%)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button onClick={handleDownloadPDF} className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
            <Download className="w-5 h-5" /> Download PDF
          </button>
          {/* Main Score Radial/Box */}
          <div className="text-center bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">ATS Score</p>
            <div className={`text-4xl font-black ${data.score > 80 ? 'text-green-500' : data.score > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
              {data.score}<span className="text-lg text-gray-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-gray-200 mb-8">
        <button onClick={() => setActiveTab('overview')} className={`px-5 py-3 font-semibold text-sm border-b-2 transition ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Overview & Scoring
        </button>
        <button onClick={() => setActiveTab('improve')} className={`px-5 py-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'improve' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <TrendingUp className="w-4 h-4" /> AI Resume Improver
        </button>
        <button onClick={() => setActiveTab('roadmap')} className={`px-5 py-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'roadmap' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Map className="w-4 h-4" /> Skill Gap Roadmap
        </button>

        <button onClick={() => setActiveTab('coverLetter')} className={`px-5 py-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${activeTab === 'coverLetter' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <PenTool className="w-4 h-4" /> Cover Letter
        </button>
      </div>

      <div ref={reportRef} className="bg-slate-50 p-1">
        {/* TAB CONTENT: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Breakdown & Skills */}
            <div className="lg:col-span-1 space-y-8">
          
          {/* Score Breakdown */}
          {data.scoreBreakdown && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                Score Breakdown
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Impact', value: data.scoreBreakdown.impact, color: 'bg-purple-500' },
                  { label: 'Formatting', value: data.scoreBreakdown.formatting, color: 'bg-blue-500' },
                  { label: 'Keywords', value: data.scoreBreakdown.keywords, color: 'bg-emerald-500' },
                  { label: 'Relevance', value: data.scoreBreakdown.relevance, color: 'bg-orange-500' }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="text-gray-900">{item.value}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Completeness */}
          {data.sectionCompleteness && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Section Completeness
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.sectionCompleteness).map(([section, isPresent]) => (
                  <div key={section} className="flex items-center gap-2 text-sm font-medium">
                    {isPresent ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={isPresent ? "text-gray-700" : "text-gray-400"}>{section}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JD Match Card */}
          {data.jobDescription && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                JD Keyword Match
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Matched
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.jdMatchedKeywords?.length > 0 ? data.jdMatchedKeywords.map((kw, i) => (
                      <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-200">{kw}</span>
                    )) : <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" /> Missing
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.jdMissingKeywords?.length > 0 ? data.jdMissingKeywords.map((kw, i) => (
                      <span key={i} className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold border border-red-200">{kw}</span>
                    )) : <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Skills */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Skills Found
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.extractedSkills.map((skill, index) => (
                <span key={index} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Missing Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((skill, index) => (
                <span key={index} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Suggestions */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              Actionable AI Suggestions
            </h2>
            
            <div className="space-y-6">
              {data.suggestions && data.suggestions.length > 0 ? (
                // Group by category if it's the new format
                typeof data.suggestions[0] === 'object' ? (
                  data.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-4 p-5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition">
                      <div className="flex-shrink-0 mt-1">
                         <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
                           {index + 1}
                         </div>
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-gray-900 mb-1">{suggestion.category}</h3>
                        <p className="text-gray-600 leading-relaxed">{suggestion.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback for old format
                  data.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="text-blue-500 font-bold mt-0.5">•</div>
                      <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                    </div>
                  ))
                )
              ) : (
                <p className="text-gray-500 italic">No suggestions available.</p>
              )}
            </div>
          </div>
        </div>
          </div>
        )}

        {/* TAB CONTENT: AI IMPROVER */}
        {activeTab === 'improve' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Bullet Point Improver</h2>
              <p className="text-gray-600">We've identified weak bullet points in your resume and rewritten them using action verbs and quantified metrics.</p>
            </div>
            
            <div className="space-y-6">
              {data.improvedBullets && data.improvedBullets.length > 0 ? (
                data.improvedBullets.map((bullet, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-red-50 p-6 border-b md:border-b-0 md:border-r border-gray-200">
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 block">Before (Weak)</span>
                      <p className="text-gray-800 line-through decoration-red-300">{bullet.original}</p>
                    </div>
                    <div className="bg-green-50 p-6 relative">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> After (Strong)
                      </span>
                      <p className="text-gray-900 font-medium">{bullet.improved}</p>
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-sm text-green-800"><span className="font-bold">Why it's better:</span> {bullet.reason}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">Your bullet points are already strong!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: SKILL GAP ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Skill Gap Learning Roadmap</h2>
              <p className="text-gray-600">Based on the skills missing for your target role, here is a step-by-step guide to acquire them.</p>
            </div>
            
            <div className="space-y-8">
              {data.learningRoadmap && data.learningRoadmap.length > 0 ? (
                data.learningRoadmap.map((roadmap, idx) => (
                  <div key={idx} className="relative pl-8 border-l-2 border-purple-200 pb-2">
                    <div className="absolute w-4 h-4 bg-purple-600 rounded-full -left-[9px] top-1 border-4 border-white"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{roadmap.skill}</h3>
                    <div className="space-y-3">
                      {roadmap.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start gap-3">
                          <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{stepIdx + 1}</span>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">No skill gaps detected or roadmap generated.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: COVER LETTER */}
        {activeTab === 'coverLetter' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PenTool className="w-6 h-6 text-emerald-600" /> AI Cover Letter Generator
              </h2>
              <p className="text-gray-600 text-sm mt-1">Generate a highly personalized cover letter tailored to a specific job title and company.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Job Title</label>
                <input 
                  type="text" 
                  value={coverLetterJobTitle} 
                  onChange={(e) => setCoverLetterJobTitle(e.target.value)} 
                  placeholder="e.g. Senior React Developer" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={coverLetterCompanyName} 
                  onChange={(e) => setCoverLetterCompanyName(e.target.value)} 
                  placeholder="e.g. Google" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerateCoverLetter}
              disabled={coverLetterLoading || !coverLetterJobTitle || !coverLetterCompanyName}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 mb-8 flex justify-center items-center gap-2"
            >
              {coverLetterLoading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Generating...</>
              ) : "Generate Cover Letter"}
            </button>

            {coverLetter && (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-sm">Generated Cover Letter</span>
                  <div className="flex gap-2">
                    <button onClick={handleCopyCoverLetter} className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-600 flex items-center gap-1 text-xs font-bold transition">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button onClick={handleDownloadTXT} className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-600 flex items-center gap-1 text-xs font-bold transition">
                      <Download className="w-3 h-3" /> Save .txt
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <textarea 
                    readOnly 
                    value={coverLetter} 
                    className="w-full h-96 bg-transparent border-none focus:ring-0 resize-none text-gray-800 leading-relaxed font-serif text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analysis;
