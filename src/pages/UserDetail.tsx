import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import users from '@/lib/usersData';
import { ThumbsUp, Eye, MoveLeft, Share2 } from 'lucide-react';

const color = '#0a3d5c';

const UserDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = users.find(u => String(u.id) === id);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">User not found</div>
        );
    }

    return (
        <div className="bg-white pt-20 px-4 md:px-6 mb-12 pb-12">
            <div className="relative max-w-5xl mx-auto">
                {/* Header banner */}
                <div className="relative w-full z-1 md:h-96 sm:h-80 flex flex-col-reverse rounded-2xl overflow-hidden shadow-sm" style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <img src={user.headerBg} alt="header-bg" className="w-full h-full object-cover absolute top-0 left-0 z-0" />
                    {/* Top controls + avatar */}
                    <div className="flex items-start gap-6 z-10 bg-white/10 backdrop-blur-md p-4 rounded-b-2xl w-full">
                        <div className="flex-shrink-0">
                            <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color }}>{user.name}</h1>
                                    <div className="text-sm text-white">{user.startup}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border shadow-sm text-sm">
                                        <MoveLeft size={16} /> Back
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border shadow-sm text-sm" onClick={() => navigator?.share ? navigator.share({ title: user.name, text: user.startup, url: window.location.href }) : null}>
                                        <Share2 size={14} /> Share
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 text-sm text-white flex items-center gap-2">
                                <span>{user.city}, {user.country}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">{user.countryFlag}</span>
                                <span className={`ml-3 text-xs px-2 py-1 rounded-full ${user.availableStatus ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.availableStatus ? 'Available' : 'Unavailable'}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="text-sm text-white">Investment:</div>
                                <div className="font-semibold">{user.investmentPercent}% por {user.investmentAmount}</div>
                                <div className="text-sm text-green-600 font-semibold ml-4">{user.commission}% Comissão</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main card */}
                <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: large images */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-2 gap-3">
                                <img src={user.productImage1} alt="product-1" className="w-full h-52 md:h-60 object-cover rounded-lg" />
                                <img src={user.productImage2} alt="product-2" className="w-full h-52 md:h-60 object-cover rounded-lg" />
                            </div>

                            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-xs text-gray-600">PUBLIC APPROVAL</div>
                                <div className="text-2xl md:text-3xl font-bold text-green-600">{user.approvalRate}%</div>
                                <div className="flex justify-center gap-4 mt-3">
                                    <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border text-sm">
                                        <ThumbsUp size={14} /> <span>{user.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border text-sm">
                                        <Eye size={14} /> <span>{user.views}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-semibold">About {user.name}</h3>
                                <p className="text-sm text-gray-600 mt-2">{user.companyName} — Founded by {user.name}. This page shows a brief profile and product highlights. For more details, check the investment options or contact via message.</p>
                            </div>
                        </div>

                        {/* Right: actions / facts */}
                        <div>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => navigate(`/messages/${user.id}`)} className="w-full px-4 py-3 rounded-full bg-[#0a3d5c] text-white font-medium">Message</button>
                                <button onClick={() => navigate(`/auction/${user.id}`)} className="w-full px-4 py-3 rounded-full border border-green-600 text-green-600 font-medium">Auction</button>
                            </div>

                            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
                                <h4 className="text-xs text-gray-500">Key Facts</h4>
                                <div className="mt-4 text-sm">
                                    <div className="flex justify-between py-2 border-b"><span className="text-gray-500">User ID</span><span className="font-semibold">{user.id}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Company</span><span className="font-semibold">{user.companyName}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Startup</span><span className="font-semibold">{user.startup}</span></div>
                                    <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Location</span><span className="font-semibold">{user.city}, {user.country}</span></div>
                                    <div className="flex justify-between py-2"><span className="text-gray-500">Available</span><span className="font-semibold">{user.availableStatus ? 'Yes' : 'No'}</span></div>
                                </div>
                            </div>

                            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
                                <h4 className="text-xs text-gray-500">Share</h4>
                                <div className="mt-3 flex gap-3">
                                    <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">🔗</button>
                                    <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">🐦</button>
                                    <button className="w-9 h-9 rounded-full bg-gray-50 border flex items-center justify-center">📘</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
