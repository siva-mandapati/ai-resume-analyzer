import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-5xl font-extrabold text-blue-600 mb-4 tracking-tight">AI Resume Analyzer</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Get instant feedback on your resume using advanced AI. Uncover missing skills, get a matching score, and land your dream job faster.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;
