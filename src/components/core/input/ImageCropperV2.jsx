import React, { useRef, useState, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "../elements";

const getCroppedImg = (image, crop) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], "croppedImage.png", { type: "image/png" });
      resolve(file);
    }, "image/png");
  });
};

const ImageCropperV2 = ({ image, onCropComplete, onClose, aspectHeight = 1, aspectWidth = 1 }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [useRecommended, setUseRecommended] = useState(!!(aspectHeight && aspectWidth));

  // Calculate aspect ratio if recommended is on
  const aspect = useRecommended && aspectHeight && aspectWidth ? aspectWidth / aspectHeight : undefined;

  const onImageLoad = useCallback(
    (e) => {
      setImgLoaded(true);
      const { width, height } = e.currentTarget;
      imgRef.current = e.currentTarget;
      let initialCrop;
      if (aspect) {
        const imgAspect = width / height;
        if (imgAspect > aspect) {
          // Image is wider than aspect, fit height
          const cropWidth = ((height * aspect) / width) * 100;
          initialCrop = { unit: "%", x: (100 - cropWidth) / 2, y: 0, width: cropWidth, height: 100, aspect };
        } else {
          // Image is taller than aspect, fit width
          const cropHeight = (width / aspect / height) * 100;
          initialCrop = { unit: "%", x: 0, y: (100 - cropHeight) / 2, width: 100, height: cropHeight, aspect };
        }
      } else {
        // Free crop: cover the whole image
        initialCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
      }
      setCrop(initialCrop);
    },
    [aspect]
  );

  const handleCrop = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedFile);
      onClose();
    }
  };

  if (!image || typeof image !== "string" || image.length < 5) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-xl shadow-lg p-4">No image to crop or invalid image source.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-2xl w-full flex flex-col items-center min-h-[400px] min-w-[340px]">
        <div className="flex w-full justify-between items-center mb-2 border-b border-gray-200 pb-2">
          <span className="text-sm font-medium text-gray-700">{useRecommended && aspectHeight && aspectWidth ? `Recommended Ratio: ${aspectWidth} x ${aspectHeight}` : "Free crop"}</span>
          {aspectHeight && aspectWidth && (
            <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 border border-gray-200" onClick={() => setUseRecommended((v) => !v)}>
              {useRecommended ? "Switch to Free Crop" : `Use ${aspectWidth}x${aspectHeight}`}
            </button>
          )}
        </div>
        <div className="w-full flex flex-col items-center justify-center min-h-[320px] min-w-[320px] max-h-[60vh] max-w-[90vw] bg-white">
          <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect} minWidth={50} minHeight={50}>
            <img ref={imgRef} alt="Crop me" src={image} style={{ maxWidth: "100%", maxHeight: "60vh", display: imgLoaded ? "block" : "none" }} onLoad={onImageLoad} />
          </ReactCrop>
          {!imgLoaded && <div className="text-gray-400 mt-4">Loading image...</div>}
        </div>
        <div className="flex gap-4 mt-6">
          <Button type="secondary" value="Close" ClickEvent={onClose} />
          <Button align="landing" value="Crop Image" ClickEvent={handleCrop} />
        </div>
      </div>
    </div>
  );
};

export default ImageCropperV2;
