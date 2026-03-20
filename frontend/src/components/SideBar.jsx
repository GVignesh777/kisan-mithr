import { useState, useRef, useEffect } from "react";

const MIN_WIDTH = 220;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 280;

const ResizableSidebar = ({ children }) => {
  const sidebarRef = useRef(null);
  const isResizingRef = useRef(false);

  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem("sidebar-width");
    return saved ? parseInt(saved) : DEFAULT_WIDTH;
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Save width to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-width", width);
  }, [width]);

  const startResizing = () => {
    isResizingRef.current = true;
    document.body.style.cursor = "col-resize";
  };

  const stopResizing = () => {
    isResizingRef.current = false;
    document.body.style.cursor = "default";
  };

  const resize = (e) => {
    if (!isResizingRef.current) return;

    const newWidth = e.clientX;

    if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
      setWidth(newWidth);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{ width: isCollapsed ? "60px" : `${width}px` }}
        className="relative bg-gray-900 text-white transition-all duration-200"
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-3 right-3 text-sm bg-gray-700 px-2 py-1 rounded"
        >
          {isCollapsed ? ">" : "<"}
        </button>

        <div className="h-full overflow-y-auto p-4">
          {!isCollapsed && children}
        </div>

        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-gray-700 hover:bg-green-500"
          />
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden">
        {/* Your VoiceAssistant content will go here */}
      </div>
    </div>
  );
};

export default ResizableSidebar;