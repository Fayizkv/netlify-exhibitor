import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image, Maximize2 } from "lucide-react";
import { sampleImages } from "../uicompoents";
import { useWatermark } from "../../../../../contexts/watermarkContext";

const WatermarkEditor = () => {
  const { opacity, scale, setScale, watermarkPosition, setWatermarkPosition, watermarkType, watermarkImage, watermarkText, textColor, textBackgroundColor, textSize, textWeight, textStyle } =
    useWatermark();

  const [currentImage, setCurrentImage] = useState(sampleImages[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartScale, setResizeStartScale] = useState(0);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const watermarkRef = useRef(null);

  // Handle watermark dragging
  const handleMouseDown = (e) => {
    if (!watermarkRef.current) return;

    setIsDragging(true);

    const watermarkRect = watermarkRef.current.getBoundingClientRect();
    setStartPos({
      x: e.clientX - watermarkRect.left,
      y: e.clientY - watermarkRect.top,
    });
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartScale(scale);
    setResizeStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !watermarkRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    if (isDragging) {
      let x = e.clientX - canvasRect.left - startPos.x;
      let y = e.clientY - canvasRect.top - startPos.y;

      x = Math.max(0, Math.min(x, canvasRect.width - watermarkRef.current.offsetWidth));
      y = Math.max(0, Math.min(y, canvasRect.height - watermarkRef.current.offsetHeight));

      const xPercent = (x / canvasRect.width) * 100;
      const yPercent = (y / canvasRect.height) * 100;

      setWatermarkPosition({ x: xPercent, y: yPercent });
    } else if (isResizing) {
      const dx = e.clientX - resizeStartPos.x;
      const dy = e.clientY - resizeStartPos.y;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = dx + dy > 0 ? 1 : -1;
      const scaleChange = (distance / 10) * scaleFactor;
      const newScale = Math.max(5, Math.min(50, resizeStartScale + scaleChange));

      setScale(newScale);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, startPos, resizeStartScale, resizeStartPos, scale]);

  const navigateImage = (direction) => {
    const currentIndex = sampleImages.findIndex((img) => img.id === currentImage.id);
    if (direction === "next") {
      setCurrentImage(sampleImages[(currentIndex + 1) % sampleImages.length]);
    } else {
      setCurrentImage(sampleImages[(currentIndex - 1 + sampleImages.length) % sampleImages.length]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow bg-gray-100 rounded-lg flex items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: "60vh" }}>
        {/* Checkered background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                           linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                           linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Canvas with the preview image */}
        <div ref={canvasRef} className="relative w-full max-w-3xl aspect-[4/3] bg-white rounded-md shadow-lg overflow-hidden">
          <img src={currentImage.url} alt={currentImage.name} className="w-full h-full object-cover" />

          {/* Draggable Watermark element */}
          <div
            ref={watermarkRef}
            className="absolute cursor-move group"
            style={{
              left: `${watermarkPosition.x}%`,
              top: `${watermarkPosition.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: opacity / 100,
              width: `${scale}%`,
              pointerEvents: "auto",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="relative">
              {watermarkType === "image" ? (
                <img
                  src={watermarkImage}
                  alt="Watermark"
                  style={{
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                    userSelect: "none",
                  }}
                  className="pointer-events-none max-w-none"
                />
              ) : (
                <div
                  className="px-3 py-2 rounded text-center pointer-events-none whitespace-nowrap"
                  style={{
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                    userSelect: "none",
                    fontSize: `${textSize}px`,
                    color: textColor,
                    fontWeight: textWeight,
                    fontStyle: textStyle,
                    backgroundColor: textBackgroundColor,
                  }}
                >
                  {watermarkText || "Sample Watermark"}
                </div>
              )}

              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={handleResizeStart}
                style={{ transform: "translate(30%, 30%)" }}
              >
                <Maximize2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-md p-1.5 flex items-center space-x-4 text-sm text-gray-600">
          <button
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            onClick={() => navigateImage("prev")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>{currentImage.name}</span>
          </div>

          <button
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            onClick={() => navigateImage("next")}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default WatermarkEditor;
