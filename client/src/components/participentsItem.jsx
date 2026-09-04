const ParticipantItem = ({
  participant,
  currentRole,
  onAssignRole,
  onRemove,
}) => {
  const isHost = currentRole === "host";

  const isParticipantHost = participant.role === "host";

  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-neutral-50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1d8c5] text-sm font-semibold text-neutral-800">
          {participant.username?.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-900">
            {participant.username}
          </p>

          <p className="text-xs capitalize text-neutral-500">
            {participant.role}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isParticipantHost && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
            Host
          </span>
        )}

        {isHost && !isParticipantHost && (
          <>
            <button
              onClick={() =>
                onAssignRole(
                  participant.userId,
                  participant.role === "moderator"
                    ? "participant"
                    : "moderator"
                )
              }
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              {participant.role === "moderator"
                ? "Make Participant"
                : "Make Moderator"}
            </button>

            <button
              onClick={() => onRemove(participant.userId)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ParticipantItem;