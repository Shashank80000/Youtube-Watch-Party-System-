import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const JoinRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [roomId, setRoomId] = useState(() => {
    return new URLSearchParams(location.search).get("room") || "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    const input = roomId.trim();
    let cleanedRoomId = input;

    try {
      const parsedUrl = new URL(input);
      const roomPath = parsedUrl.pathname.match(/^\/room\/([^/]+)$/i);

      if (roomPath) {
        cleanedRoomId = roomPath[1];
      }
    } catch {
      // The input can be a room code instead of a URL.
    }

    if (!cleanedRoomId) {
      setError("Please enter a room code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        `/rooms/${cleanedRoomId}/join`
      );

      console.log("Join room response:", response.data);

      navigate(`/room/${cleanedRoomId}`);
    } catch (error) {
      console.error("Join room error:", error);

      if (error.response?.status === 401) {
        navigate("/login", {
          state: { from: `/room/${cleanedRoomId}` },
        });
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to join room"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8">

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-neutral-500">
            Join watch party
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Join a room
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Enter the room code shared by the host.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleJoinRoom}>
          <label className="mb-2 block text-sm font-medium text-neutral-800">
            Room code or invite link
          </label>

          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room code or paste invite link"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm uppercase outline-none transition focus:border-neutral-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Joining room..." : "Join watch party"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-3 w-full rounded-lg border border-neutral-200 bg-white py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;