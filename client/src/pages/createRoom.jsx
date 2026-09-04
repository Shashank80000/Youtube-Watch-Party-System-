import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateRoom = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/rooms/create");

      console.log("Create room response:", response.data);

      const { roomId } = response.data;

      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Create room error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create room"
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
            New watch party
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Create a room
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Start a watch party and invite your friends using the room code.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
              +
            </div>

            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                You will become the Host
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                As the Host, you'll have full control over playback, roles,
                and participants.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating room..." : "Create watch party"}
        </button>

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

export default CreateRoom;