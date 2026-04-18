import { useState } from 'react';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type !== 'application/pdf') {
      setError('Please drop a PDF file.');
      setFile(null);
    } else {
      setError('');
      setFile(droppedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUploadSuccess(file);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          accept=".pdf"
          onChange={handleFileChange} 
        />
        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
          <svg className={`w-12 h-12 mb-4 ${file ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          {file ? (
            <span className="text-blue-600 font-medium">{file.name}</span>
          ) : (
            <span className="text-gray-600">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              <p className="text-sm text-gray-400 mt-1">PDF files only (max 5MB)</p>
            </span>
          )}
        </label>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      <button 
        onClick={handleSubmit}
        disabled={!file}
        className={`w-full mt-6 py-3 rounded-lg font-bold shadow-sm transition ${file ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      >
        Analyze Resume
      </button>
    </div>
  );
}

export default FileUpload;
