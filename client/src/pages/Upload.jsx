import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import API from '../api/api';
import toast from 'react-hot-toast';

function Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    if (targetRole) {
      formData.append('targetRole', targetRole);
    }
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const res = await API.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Resume analyzed successfully!');
      // Navigate to the analysis page with the returned resume ID
      navigate(`/analysis/${res.data._id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error uploading file. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white max-w-xl w-full p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Upload Your Resume</h1>
        <p className="text-gray-600 mb-8">
          Our AI will analyze your PDF resume against industry standards, calculate an ATS score, and find missing skills.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-left">
            {error}
          </div>
        )}

        {isUploading ? (
          <div className="py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium text-lg">Parsing PDF & Running AI Analysis...</p>
            <p className="text-sm text-gray-500 mt-2">This usually takes about 10-15 seconds.</p>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Job Role (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Developer" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description (Highly Recommended)</label>
              <textarea 
                placeholder="Paste the job description here for a tailored match percentage and keyword gap analysis..." 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="pt-2">
              <FileUpload onUploadSuccess={handleUpload} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
