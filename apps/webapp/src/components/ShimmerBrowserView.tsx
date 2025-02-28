export const ShimmerBrowserView = ({ message = "Connecting to a browser..." }) => {
  return (
    <>
      <div className="mt-4 flex flex-col items-center">
        <div className="w-full md:w-2/3 bg-white rounded-md overflow-hidden">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-50 shimmer-circle rounded-full" />
              <div className="w-48 h-8 bg-gray-50 shimmer-rect rounded-md" />
            </div>
            <div className="w-8 h-8 bg-gray-50 shimmer-circle rounded-full" />
          </div>
          <div className="relative">
            <div className="w-full h-60 relative bg-gray-50 shimmer-rect rounded-md" />
            <div className="absolute top-4 left-4 w-3/4 h-4 bg-gray-50 shimmer-rect rounded" />
            <div className="absolute top-12 left-4 w-2/3 h-4 bg-gray-50 shimmer-rect rounded" />
            <div className="absolute top-20 left-4 w-1/2 h-4 bg-gray-50 shimmer-rect rounded" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-black">{message}</span>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .shimmer-rect {
          animation: shimmer 5s linear infinite;
          background: linear-gradient(
            90deg,
            #f5f5f5 25%,
            #fafafa 50%,
            #f5f5f5 75%
          );
          background-size: 200% 100%;
        }
        .shimmer-circle {
          animation: shimmer 8s linear infinite;
          background: linear-gradient(
            90deg,
            #f5f5f5 25%,
            #fafafa 50%,
            #f5f5f5 75%
          );
          background-size: 200% 100%;
        }
      `}</style>
    </>
  );
};
