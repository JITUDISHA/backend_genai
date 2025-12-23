export default function ChatLoading() {
  return (
    <div className="h-screen w-full bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-900 to-slate-900" />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-100">
            Loading your chats
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Connecting to real-time messages…
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 animate-[loaderBar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
