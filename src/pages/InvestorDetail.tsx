import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import users from '@/lib/usersData';
import investers from '@/lib/investersData';
import { ThumbsUp, Eye, MoveLeft, Share2 } from 'lucide-react';

const InvestorDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = investers.find((u: any) => String(u.id) === id);

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">Investor not found</div>
      </AppLayout>
    );
  }

  // Prepare header image and images grid
  const color = '#ffffff';
  const images = user.images;

  // fill up to 9 with placeholders if necessary
  while (images.length < 9) images.push('/assets/1.avif');

  const videoPitch: string | undefined = (user as any).videoPitch;
  const presentationVideos: string[] = (user as any).presentationVideos ?? [];
  const docs: { name: string; url?: string }[] = (user as any).docs ?? [];

  return (
    <div className="bg-white pt-20 px-4 md:px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="relative w-full z-1 md:h-96 sm:h-80 flex flex-col-reverse rounded-2xl overflow-hidden shadow-sm" style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <img src={user.coverImage} alt="header-bg" className="w-full h-full object-cover absolute top-0 left-0 z-0" />
          <div className="flex items-start gap-6 z-10 bg-white/10 backdrop-blur-md p-4 rounded-b-2xl w-full">
            <div className="flex-shrink-0">
              <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold" style={{ color }}>{user.name}</h1>
                  <div className="text-sm text-white">{(user as any).projectInfo?.title ?? (user as any).role ?? ''}</div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border shadow-sm text-sm">
                    <MoveLeft size={16} /> Back
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border shadow-sm text-sm" onClick={() => (navigator as any)?.share ? (navigator as any).share({ title: user.name, text: (user as any).projectInfo?.title ?? '', url: window.location.href }) : null}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>

              <div className="mt-2 text-sm text-white flex items-center gap-2">
                <span>{user.city}, {user.country}</span>
                {(user as any).countryFlag ? <span className="text-xs px-2 py-1 bg-gray-100 rounded">{(user as any).countryFlag}</span> : null}
                <span className={`ml-3 text-xs px-2 py-1 rounded-full ${((user as any).availableStatus) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{((user as any).availableStatus) ? 'Available' : 'Unavailable'}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="text-sm text-white">Investment:</div>
                <div className="font-semibold">{(user as any).investmentPercent ?? '-'}% por {(user as any).investmentAmount ?? ((user as any).projectInfo?.minInvestment ?? '-')}</div>
                <div className="text-sm text-green-600 font-semibold ml-4">{(user as any).commission ?? '-'}% Comissão</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description / message */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg">Investor Message</h3>
              <p className="text-sm text-gray-600 mt-3">{(user as any).description ?? `${user.name} is an investor interested in strategic partnerships and high-impact startups.`}</p>
            </div>

            {/* Project information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg">Project Information</h3>
              <div className="mt-3 text-sm text-gray-600">
                <div className="mb-2"><span className="font-semibold">Project:</span> {(user as any).projectInfo?.title ?? '-'}</div>
                <div className="mb-2"><span className="font-semibold">Summary:</span> {(user as any).projectInfo?.summary ?? '-'}</div>
                <div className="mb-2"><span className="font-semibold">Category:</span> {(user as any).projectInfo?.category ?? '-'}</div>
                <div className="mb-2"><span className="font-semibold">Stage:</span> {(user as any).projectInfo?.stage ?? '-'}</div>
                <div className="mb-2"><span className="font-semibold">Minimum Investment:</span> {(user as any).projectInfo?.minInvestment ?? '-'}</div>
              </div>
            </div>

            {/* Nine photos */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg">Photos</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.slice(0, 9).map((src, idx) => (
                  <div key={idx} className="w-full h-28 bg-gray-100 rounded overflow-hidden">
                    {src ? <img src={src} alt={`photo-${idx}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Video Pitch */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg">Video Pitch</h3>
              <div className="mt-4">
                {videoPitch ? (
                  <div className="aspect-video">
                    <iframe src={videoPitch} title="Video pitch" className="w-full h-full" allowFullScreen />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">No video pitch available</div>
                )}
              </div>
            </div>

            {/* Presentation videos (two) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg">Presentation Videos</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map(i => (
                  <div key={i} className="w-full">
                    {presentationVideos[i] ? (
                      <div className="aspect-video">
                        <iframe src={presentationVideos[i]} title={`presentation-${i}`} className="w-full h-full" allowFullScreen />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">No presentation video</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-lg">Documents</h3>
              <div className="mt-3 space-y-2">
                {docs.length > 0 ? docs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between border rounded p-3">
                    <div className="text-sm">{d.name}</div>
                    {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="text-sm text-[#0a3d5c]">Open</a> : <div className="text-sm text-gray-400">No file</div>}
                  </div>
                )) : (
                  <div className="text-sm text-gray-500">No technical specifications or presentation sheet uploaded.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: summary / stats / actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-500">Project Snapshot</div>
              <div className="text-2xl font-bold text-[#0a3d5c] mt-2">{(user as any).projectInfo?.title ?? ''}</div>
              <div className="mt-4 text-sm text-gray-600">{(user as any).projectInfo?.summary ?? ''}</div>
              <div className="mt-4">
                <div className="text-xs text-gray-500">Partners</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {((user as any).partners ?? []).slice(0, 6).map((p: string, i: number) => (
                    <div key={i} className="h-10 flex items-center justify-center bg-white border rounded">
                      <img src={p} alt={`partner-${i}`} className="max-h-8 object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h4 className="text-xs text-gray-500">Key Facts</h4>
              <div className="mt-3 text-sm">
                <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Investor ID</span><span className="font-semibold">{user.id}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Role</span><span className="font-semibold">{(user as any).role ?? '-'}</span></div>
                <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Location</span><span className="font-semibold">{user.city}, {user.country}</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-500">Min Investment</span><span className="font-semibold">{(user as any).projectInfo?.minInvestment ?? '-'}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border">
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
  );
};

export default InvestorDetail;
