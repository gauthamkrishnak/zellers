import { ScaleLoader } from "react-spinners";

function Loader({
  color = "#4f46e5",
  height = 35,
  width = 4,
  radius = 2,
  margin = 2,
  loading = true,
  className = "",
  fullHeight = true,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullHeight ? "min-h-[calc(100vh-220px)] w-full" : ""
      } ${className}`}
      role="status"
      aria-label="Loading"
    >
      <ScaleLoader
        color={color}
        loading={loading}
        height={height}
        width={width}
        radius={radius}
        margin={margin}
      />
    </div>
  );
}

export default Loader;
