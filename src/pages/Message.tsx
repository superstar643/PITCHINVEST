import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import users from "@/lib/usersData";
import { ChevronLeft } from "lucide-react";

const MAIN_COLOR = "#0a3d5c";

type Msg = { id: number; fromMe: boolean; text: string; time: string };

const Message: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const userId = id ? Number(id) : undefined;
  const [selectedId, setSelectedId] = useState<number | undefined>(userId ?? users.find(u => u.availableStatus)?.id);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Record<number, Msg[]>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // (responsive handled with CSS; keep JS minimal)

  // initialize a small mock conversation for selected users
  useEffect(() => {
    const initial: Record<number, Msg[]> = {};
    users.slice(0, 6).forEach((u, idx) => {
      initial[u.id] = [
        { id: 1, fromMe: false, text: `Hi, I'm ${u.fullName}. How can I help?`, time: "09:00" },
        ...(u.availableStatus ? [{ id: 2, fromMe: true, text: "Hello — I'd like to know more about your startup.", time: "09:02" }] : []),
      ];
    });
    setMessages(initial);
  }, []);

  useEffect(() => {
    // sync selected id from route
    if (userId && userId !== selectedId) setSelectedId(userId);
  }, [userId]);

  useEffect(() => {
    // scroll to bottom on messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedId]);

  const selectedUser = useMemo(() => users.find(u => u.id === selectedId), [selectedId]);
  const showList = !id; // /messages => list view (mobile), /messages/:id => chat view (mobile)

  const send = () => {
    if (!selectedId || !input.trim()) return;
    const next: Msg = { id: Date.now(), fromMe: true, text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...(prev || {}), [selectedId]: [...(prev[selectedId] || []), next] }));
    setInput("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow overflow-hidden" style={{ minHeight: '70vh' }}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Users list */}
          <aside className={`w-full md:w-80 border-r ${showList ? 'block' : 'hidden md:block'}`}>
            <div className="p-4 flex items-center justify-between" style={{ background: MAIN_COLOR, color: 'white' }}>
              <h2 className="font-bold">Messages</h2>
              <button onClick={() => navigate('/messages')} className="text-sm opacity-90">All</button>
            </div>
            <div className="p-3 shadow-lg">
              <input aria-label="Search users" placeholder="Search" className="w-full px-3 py-2 rounded bg-gray-100 text-sm" />
            </div>
            <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '58vh' }}>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => navigate(`/messages/${u.id}`)}
                  type="button"
                  aria-pressed={selectedId === u.id}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 border-b hover:bg-gray-50 ${selectedId === u.id ? 'bg-gray-100' : ''}`}
                >
                  <img src={u.photo} alt={u.fullName} className="border-2 w-16 h-16 rounded-full object-cover" style={{borderColor: MAIN_COLOR}}/>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-md">{u.fullName}</div>
                      <div className="text-sm text-gray-500">{u.availableStatus ? <span className="text-green-500">Online</span> : <span className="text-gray-400">Offline</span>}</div>
                    </div>
                    <div className="text-sm text-gray-500">{u.projectName} • {u.city}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Right: Chat area */}
          <main className={`flex-1 flex flex-col h-full ${showList ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b flex items-center gap-4">
              <button
                onClick={() => (id ? navigate('/messages') : navigate(-1))}
                className="md:hidden text-sm text-gray-600 inline-flex items-center gap-1 hover:text-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              {selectedUser ? (
                <div className="flex items-center gap-3">
                  <img src={selectedUser.photo} alt={selectedUser.fullName} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-bold">{selectedUser.fullName}</div>
                    <div className="text-xs text-gray-500">{selectedUser.companyName} • {selectedUser.countryFlag}</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Select a user to start chatting</div>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto min-h-[55vh] custom-scrollbar" ref={scrollRef}>
              {!selectedUser && (
                <div className="text-center text-gray-400 mt-20">No conversation selected</div>
              )}

              {selectedUser && ((messages[selectedUser.id] || []).length === 0) && (
                <div className="text-center text-gray-400 mt-20">No messages yet — say hello 👋</div>
              )}

              {selectedUser && (messages[selectedUser.id] || []).map(m => (
                <div key={m.id} className={`mb-3 flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-lg max-w-[70%] text-sm ${m.fromMe ? 'bg-[rgba(10,61,92,0.9)] text-white' : 'bg-gray-100 text-gray-800'}`}>
                    <div>{m.text}</div>
                    <div className="text-xs text-gray-400 mt-1 text-right">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send(); }}
                  disabled={!selectedUser}
                  placeholder={selectedUser ? `Message ${selectedUser.fullName}...` : 'Select a user to send a message'}
                  className="flex-1 px-3 py-2 rounded border"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!selectedUser || !input.trim()}
                  style={{ background: MAIN_COLOR, borderColor: MAIN_COLOR }}
                  className="px-4 py-2 text-white rounded disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Message;
