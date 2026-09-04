import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/navbar";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
          <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium text-neutral-500">
            Watch Party
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
            Welcome back{user?.username ? `, ${user.username}` : ""}
          </h1>

          <p className="mt-3 max-w-xl text-base leading-7 text-neutral-500">
            Watch YouTube videos together with your friends in real time.
          </p>
        </div>

        {/* Actions */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Create room */}
          <Link
            to="/create-room"
            className="group rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-neutral-300"
          >
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-lg text-white">
              +
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              Create a watch party
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Start a new room and invite others to watch YouTube together.
            </p>

            <div className="mt-6 text-sm font-medium text-neutral-900">
              Create room →
            </div>
          </Link>

          {/* Join room */}
          <Link
            to="/join-room"
            className="group rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-neutral-300"
          >
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1d8c5] text-lg text-neutral-900">
              →
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              Join a watch party
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Enter a room code and join an existing watch party.
            </p>

            <div className="mt-6 text-sm font-medium text-neutral-900">
              Join room →
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-7">
          <h2 className="text-lg font-semibold text-neutral-900">
            How it works
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                01 — Create
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Create a room and become its Host.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-900">
                02 — Invite
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Share your room code with friends.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-900">
                03 — Watch
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Watch and control the video together in real time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
