import React, { useRef, useState, useEffect } from "react";
import { Upload, X, Crop } from "lucide-react";
import CustomLabel from "./label";
import ImageCropperV2 from "./ImageCropperV2";
import ErrorLabel from "./error";

const formatSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const MultiImageUploader = ({ maxFiles: maxFilesProp, onChange, ...props }) => {
  const maxFiles = maxFilesProp ?? 8;
  const [files, setFiles] = useState([]); // [{file, url, name, size}]
  const [dragActive, setDragActive] = useState(false);
  const [cropIdx, setCropIdx] = useState(null); // index of image to crop
  const [cropImage, setCropImage] = useState(null); // preview image for crop
  const [deletedFiles, setDeletedFiles] = useState([]); // store deleted existing images
  const [existingImages, setExistingImages] = useState(props.formValues?.["old_" + props.name] ?? []);
  const fileInputRef = useRef(null);
  const recommendedText = `Recommended: Square PNG or JPG, aspect ratio ${props.height}x${props.width}`;
  // Sync local existingImages state with prop changes
  useEffect(() => {
    setExistingImages(props.formValues?.["old_" + props.name] ?? []);
    setDeletedFiles([]); // Reset deleted files on prop change
  }, [props.formValues?.["old_" + props.name]]);

  // Filter out deleted files from existingImages
  const filteredExistingImages = existingImages.filter((_, i) => !deletedFiles.includes(i));

  const handleFiles = (fileList) => {
    const remainingSlots = maxFiles - filteredExistingImages.length - files.length;
    const newFiles = Array.from(fileList).slice(0, remainingSlots > 0 ? remainingSlots : 0);
    const fileObjs = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    const updated = [...files, ...fileObjs];
    setFiles(updated);
    if (onChange)
      onChange(
        {
          files: updated.map((f) => f.file),
          existingImages: filteredExistingImages,
          deletedFiles: deletedFiles.map((i) => existingImages[i]),
        },
        props.id,
        props.type
      );
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragleave") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    if (onChange)
      onChange(
        {
          files: updated.map((f) => f.file),
          existingImages: filteredExistingImages,
          deletedFiles: deletedFiles.map((i) => existingImages[i]),
        },
        props.id,
        props.type
      );
  };

  const openFileDialog = () => fileInputRef.current.click();

  // Crop logic
  const handleCropClick = (idx) => {
    setCropIdx(idx);
    setCropImage(files[idx].url);
  };

  const handleCropComplete = (croppedFile) => {
    if (cropIdx === null) return;
    const newUrl = URL.createObjectURL(croppedFile);
    const updated = files.map((f, i) => (i === cropIdx ? { ...f, file: croppedFile, url: newUrl, name: croppedFile.name, size: croppedFile.size } : f));
    setFiles(updated);
    setCropIdx(null);
    setCropImage(null);
    if (onChange)
      onChange(
        {
          files: updated.map((f) => f.file),
          existingImages: filteredExistingImages,
          deletedFiles: deletedFiles.map((i) => existingImages[i]),
        },
        props.id,
        props.type
      );
  };

  const handleCropClose = () => {
    setCropIdx(null);
    setCropImage(null);
  };

  // Handler to delete an existing image
  const handleDeleteExisting = (idx) => {
    const newDeleted = [...deletedFiles, idx];
    setDeletedFiles(newDeleted);
    // Remove from local state for immediate UI update
    // (filteredExistingImages is derived from state)
    if (onChange)
      onChange(
        {
          files: files.map((f) => f.file),
          existingImages: existingImages.filter((_, i) => !newDeleted.includes(i)),
          deletedFiles: newDeleted.map((i) => existingImages[i]),
        },
        props.id,
        props.type
      );
  };

  return (
    <div className="w-full max-w-full mx-auto flex flex-col col-span-12 gap-[4px]">
      <CustomLabel name={props.name} className={`${props.dynamicClass ?? ""}`} label={props.label} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />

      <div
        className={`rounded-[10px] border border-gray-200 bg-white p-0 sm:p-0 transition-all overflow-hidden ${dragActive ? "ring-2 ring-primary-base bg-blue-50" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col divide-y divide-gray-100">
          {filteredExistingImages.map((image, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
              <img src={import.meta.env.VITE_CDN + image} alt={`Image ${idx}`} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
              <button
                type="button"
                className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
                onClick={() => handleDeleteExisting(existingImages.indexOf(image))}
                aria-label="Delete existing image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {files.map((f, idx) => (
            <div key={idx} className={"flex items-center gap-4 px-4 py-3 bg-white rounded-md"}>
              <img src={f.url} alt={f.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
              <span className="flex-1 truncate text-base font-medium text-gray-800">{formatSize(f.size)}</span>
              <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600" onClick={() => handleCropClick(idx)} aria-label="Crop logo">
                <Crop className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600" onClick={() => removeFile(idx)} aria-label="Remove logo">
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {/* Add new card as last row if not at max */}
          {files.length + filteredExistingImages.length < maxFiles && (
            <div
              className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer min-h-[56px] py-3 m-2"
              onClick={openFileDialog}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              tabIndex={0}
              aria-label="Add image"
            >
              <span className="flex items-center gap-2 text-gray-400 font-medium text-base">
                <Upload className="w-5 h-5" /> Add Files
              </span>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputChange} />
            </div>
          )}
        </div>
        {/* Crop modal */}
        {cropIdx !== null && cropImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-lg p-4 relative max-w-xs w-full flex flex-col items-center">
              <button className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-red-200 text-gray-500 hover:text-red-600" onClick={handleCropClose} aria-label="Close crop">
                <X className="w-6 h-6" />
              </button>
              <ImageCropperV2 image={cropImage} onCropComplete={handleCropComplete} onClose={handleCropClose} aspect={props.aspect} />
            </div>
          </div>
        )}
        <div className="w-full p-2">
          <ErrorLabel error={props.error} info={props.info} />
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2 ml-1">{recommendedText}</div>
    </div>
  );
};

export default MultiImageUploader;
