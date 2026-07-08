function Loader() {
  return (
    <div
      className="min-h-screen flex flex-col
     items-center justify-center py-20  "
    >
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm font-medium text-slate-500">Loading...</p>
    </div>
  );
}

export default Loader;
