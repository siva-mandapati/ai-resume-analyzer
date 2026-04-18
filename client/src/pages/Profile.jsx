import { useEffect, useState } from "react";
import { getProfile } from "../api/auth";

function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getProfile();
            setUser(res.data);
        };
        fetchData();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-5xl text-blue-600 font-bold shadow-inner">
                    {user ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
                    {user ? (
                        <div className="space-y-4 mt-6">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Full Name</p>
                                <p className="text-xl text-gray-800">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                                <p className="text-xl text-gray-800">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Loading profile data...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;