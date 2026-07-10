import { ScaleLoader } from "react-spinners";

function Loader({
  color = "#4f46e5",
  height = 35,
  width = 4,
  radius = 2,
  margin = 2,
  loading = true,
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
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
