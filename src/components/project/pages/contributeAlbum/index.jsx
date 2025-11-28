import React, { useState, useEffect, useRef, useCallback } from "react";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import { X, ListIcon, Grid2X2PlusIcon, FoldHorizontal, CheckIcon, XIcon, Trash2Icon, BanIcon, CircleCheckBig } from "lucide-react";
import { CustomFolder } from "../../../../images";
import ImageGallery from "../../../core/list/imagegallery";
import { SubPageHeader } from "../../../core/input/heading";

// const imgCdn = import.meta.env.VITE_CDN;
const imgCdn = "https://event-hex-saas.s3.amazonaws.com/";

const Modal = ({ show, onClose, title, children, className }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-xl max-w-md w-full mx-4 p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-200 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ContributeAlbum = (props) => {
  const [eventId, setEventId] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [activeView, setActiveView] = useState("all"); // 'all', 'pending', 'approved'
  const [displayedPhotos, setDisplayedPhotos] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // New states for infinite scrolling
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const observer = useRef();

  const photoClickTimers = useRef({});

  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Counts for different categories
  const [counts, setCounts] = useState({
    approved: 0,
    pending: 0,
    total: 0,
  });

  useEffect(() => {
    setEventId(props.openData.data._id);
  }, [props]);

  const fetchData = async (reset = false) => {
    if (!eventId || isLoading) return;

    try {
      setIsLoading(true);
      const currentSkip = reset ? 0 : skip;

      // Prepare query parameters
      const queryParams = {
        event: eventId,
        skip: currentSkip,
        limit: 50,
      };

      // Add approve filter if a specific category is selected
      if (activeView === "pending") {
        queryParams.approve = false;
      } else if (activeView === "approved") {
        queryParams.approve = true;
      }

      const response = await getData(queryParams, "contribute");
      const data = response.data;
      console.log(data, "data");

      if (data.success) {
        const photos = data.response || [];

        // Transform photos to match your photo structure
        const transformedPhotos = photos.map((photo) => ({
          id: photo._id,
          src: photo.image || photo.compressed || photo.thumbnail,
          timestamp: new Date(photo.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          isApproved: photo.approve || false,
          addedBy: photo.addedBy,
        }));

        if (reset) {
          setAllPhotos(transformedPhotos);
          setSkip(50);
          // Only update total count on first fetch or when resetting
          if (!initialFetchDone || reset) {
            setTotalCount(data.filterCount || 0);
            setInitialFetchDone(true);
          }
        } else {
          setAllPhotos((prev) => [...prev, ...transformedPhotos]);
          setSkip((prev) => prev + 50);
        }

        // Update counts
        if (data.counts) {
          setCounts(data.counts);
        }

        setHasMore(transformedPhotos.length === 50);

        // Update displayed photos based on current view
        let photosToFilter = [];
        if (activeView === "all") {
          photosToFilter = reset ? transformedPhotos : [...allPhotos, ...transformedPhotos];
        } else if (activeView === "pending") {
          photosToFilter = (reset ? transformedPhotos : [...allPhotos, ...transformedPhotos]).filter((p) => !p.isApproved);
        } else if (activeView === "approved") {
          photosToFilter = (reset ? transformedPhotos : [...allPhotos, ...transformedPhotos]).filter((p) => p.isApproved);
        }

        if (searchQuery) {
          photosToFilter = photosToFilter.filter((p) => p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.timestamp.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        setDisplayedPhotos(photosToFilter);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update counts after actions
  const updateCountsAfterAction = async () => {
    try {
      const response = await getData({ event: eventId, skip: 0, limit: 1 }, "contribute");
      const data = response.data;
      if (data.success && data.counts) {
        setCounts(data.counts);
        if (!initialFetchDone) {
          setTotalCount(data.filterCount || 0);
          setInitialFetchDone(true);
        }
      }
    } catch (error) {
      console.error("Error updating counts:", error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deleteData({ id: photoId }, "contribute");
      setAllPhotos(allPhotos.filter((photo) => photo.id !== photoId));
      await updateCountsAfterAction();
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  const handleDeleteMultiplePhotos = async (photoIds) => {
    try {
      await deleteData({ ids: photoIds }, "contribute/bulk-delete");
      setAllPhotos(allPhotos.filter((photo) => !photoIds.includes(photo.id)));
      await updateCountsAfterAction();
    } catch (error) {
      console.error("Error deleting photos:", error);
    }
  };

  const handlePhotoSelect = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAllPhotos = () => {
    // Selects all photos currently displayed by filters
    setSelectedPhotos(new Set(displayedPhotos.map((p) => p.id)));
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  const openPreviewModal = (imageSrc) => {
    setPreviewImage(imageSrc);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setPreviewImage(null);
    setShowPreviewModal(false);
  };

  const handleToggleApprove = async (photoId, approve) => {
    try {
      // Update approve status in backend
      await putData({ approve }, `contribute/${photoId}/status`);

      // Update local state
      setAllPhotos((prevPhotos) => prevPhotos.map((photo) => (photo.id === photoId ? { ...photo, isApproved: approve } : photo)));

      await updateCountsAfterAction();
    } catch (error) {
      console.error("Error updating approve status:", error);
      alert("Failed to update approve status. Please try again.");
    }
  };

  const handlePhotoInteraction = (photo) => {
    const photoId = photo.id;
    const existingTimeoutId = photoClickTimers.current[photoId];

    if (existingTimeoutId) {
      clearTimeout(existingTimeoutId);
      delete photoClickTimers.current[photoId];
      handlePhotoSelect(photoId);
    } else {
      const newTimeoutId = setTimeout(() => {
        openPreviewModal(photo.src);
        delete photoClickTimers.current[photoId];
      }, 250);
      photoClickTimers.current[photoId] = newTimeoutId;
    }
  };

  const handleBulkApprove = async (approve) => {
    if (selectedPhotos.size === 0) {
      alert("Please select photos to " + (approve ? "approve" : "reject"));
      return;
    }

    try {
      const photoIds = Array.from(selectedPhotos);
      await putData({ contributeIds: photoIds, approve }, "contribute/bulk-update");

      // Update local state
      setAllPhotos((prevPhotos) => prevPhotos.map((photo) => (selectedPhotos.has(photo.id) ? { ...photo, isApproved: approve } : photo)));

      await updateCountsAfterAction();
      deselectAllPhotos();
    } catch (error) {
      console.error("Error bulk updating photos:", error);
      alert("Failed to " + (approve ? "approve" : "reject") + " photos. Please try again.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [eventId, activeView]);

  // Update displayed photos when filters change
  useEffect(() => {
    let photosToFilter = allPhotos;

    if (activeView === "pending") {
      photosToFilter = allPhotos.filter((p) => !p.isApproved);
    } else if (activeView === "approved") {
      photosToFilter = allPhotos.filter((p) => p.isApproved);
    }

    if (searchQuery) {
      photosToFilter = photosToFilter.filter((p) => p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.timestamp.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setDisplayedPhotos(photosToFilter);
  }, [activeView, allPhotos, searchQuery]);

  // Infinite scroll observer
  const lastPhotoRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchData();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    const timers = photoClickTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col ">
            {/* <h1 className="text-lg sm:text-xl font-medium">Contributions</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Review, approve, and manage all contributed photos from your event.
            </p> */}
            <SubPageHeader title="Contributions" line={false} description="Review, approve, and manage all contributed photos from your event." />
          </div>
        </div>

        {/* Category buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-2 text-xs sm:text-sm rounded-md border ${
              activeView === "all" ? "bg-[#375DFB]  border-[#375DFB] text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveView("all")}
          >
            All ({counts.total})
          </button>
          <button
            className={`px-3 py-2 text-xs sm:text-sm rounded-md border ${
              activeView === "pending" ? "bg-[#375DFB]  border-[#375DFB] text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveView("pending")}
          >
            Pending
          </button>
          <button
            className={`px-3 py-2 text-xs sm:text-sm rounded-md border ${
              activeView === "approved" ? "bg-[#375DFB]  border-[#375DFB] text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveView("approved")}
          >
            Approved
          </button>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between sm:items-center border-gray-300">
          <div className="flex items-center gap-2">
            <button
              className={`flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm ${viewMode === "grid" ? "bg-[#375DFB]  hover:bg-[#375DFB] text-white border-[#375DFB]" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              type="button"
            >
              <Grid2X2PlusIcon className="w-4 h-4 flex-shrink-0" />
            </button>
            <button
              className={`flex rounded-xl border border-gray-300  hover:bg-gray-100   hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm ${viewMode === "list" ? "bg-[#375DFB] hover:bg-[#375DFB] text-white border-[#375DFB]" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              type="button"
            >
              <ListIcon className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row py-1 gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              {selectedPhotos.size > 0 ? (
                <p className="text-xs sm:text-sm text-gray-600">
                  {selectedPhotos.size} photo
                  {selectedPhotos.size === 1 ? "" : "s"} selected
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-600">
                  {displayedPhotos.length} photo
                  {displayedPhotos.length === 1 ? "" : "s"}
                  {activeView === "all" && " in total"}
                  {activeView === "pending" && " pending"}
                  {activeView === "approved" && " approved"}
                </p>
              )}
              <button
                onClick={selectAllPhotos}
                disabled={displayedPhotos.length === 0}
                className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center text-xs sm:text-sm disabled:opacity-50"
              >
                Select all
              </button>
              {selectedPhotos.size > 0 && (
                <button onClick={deselectAllPhotos} className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center text-xs sm:text-sm">
                  Deselect all
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkApprove(true)}
                disabled={selectedPhotos.size === 0}
                className="flex rounded-xl border border-gray-300 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-green-100 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon className="w-4 h-4 flex-shrink-0" />
                Approve All
              </button>
              <button
                onClick={() => handleBulkApprove(false)}
                disabled={selectedPhotos.size === 0}
                className="flex rounded-xl border border-gray-300 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XIcon className="w-4 h-4 flex-shrink-0" />
                Reject All
              </button>
              <button
                className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => {
                  if (selectedPhotos.size > 0) {
                    handleDeleteMultiplePhotos(Array.from(selectedPhotos));
                  }
                }}
              >
                <Trash2Icon className="w-4 h-4 flex-shrink-0" />
                Delete
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  ref={index === displayedPhotos.length - 1 ? lastPhotoRef : null}
                  className={`w-full h-full group relative cursor-pointer ${
                    selectedPhotos.has(photo.id) ? "border-4 border-blue-500 rounded-xl p-1 box-border" : "border-4 border-transparent box-border"
                  }`}
                  onClick={() => handlePhotoInteraction(photo)}
                >
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <img src={imgCdn + photo.src} alt={photo.id} className={`w-full h-full object-cover aspect-square ${!photo.isApproved ? "blur-sm" : ""}`} />

                    {/* Black gradient overlay for selected photos */}
                    {selectedPhotos.has(photo.id) && <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/50 to-transparent pointer-events-none" />}

                    {/* Selection checkbox - top left */}
                    <div
                      className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-white bg-opacity-30 flex items-center justify-center shadow cursor-pointer z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoSelect(photo.id);
                      }}
                    >
                      {selectedPhotos.has(photo.id) && <CircleCheckBig className="w-5 h-5 text-blue-500" />}
                    </div>

                    {/* Approval controls - top right */}
                    <div className="absolute top-2 right-2 z-10">
                      {photo.isApproved ? (
                        <div className="flex flex-col items-center">
                          <CheckIcon
                            className="w-4 h-4 text-green-400 cursor-pointer hover:text-green-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Disapproving photo with id: ${photo.id}`);
                              handleToggleApprove(photo.id, false);
                            }}
                          />
                          <p className="text-green-400 text-xs mt-1">Approved</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <BanIcon
                            className="w-4 h-4 text-yellow-500 cursor-pointer hover:text-yellow-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Approving photo with id: ${photo.id}`);
                              handleToggleApprove(photo.id, true);
                            }}
                          />
                          <p className="text-yellow-500 text-xs mt-1"> please approve</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom overlay with timestamp and delete icon */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs flex justify-between items-center rounded-b-lg">
                    <span>{photo.timestamp}</span>
                    <Trash2Icon
                      className="w-4 h-4 text-white hover:text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  ref={index === displayedPhotos.length - 1 ? lastPhotoRef : null}
                  className={`flex items-center bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition p-2 gap-4 relative ${selectedPhotos.has(photo.id) ? "border-blue-500" : ""}`}
                  onClick={() => handlePhotoInteraction(photo)}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={imgCdn + photo.src} alt={photo.id} className="w-full h-full object-cover" />
                    {selectedPhotos.has(photo.id) && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none rounded-lg" />}
                    {photo.isApproved && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                        <CheckIcon className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{photo.id}</span>
                    <span className="text-xs text-gray-500">{photo.timestamp}</span>
                    {photo.addedBy && <span className="text-xs text-gray-400">By: {photo.addedBy.name || photo.addedBy.email || "Unknown"}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {photo.isApproved ? (
                      <div className="flex flex-col items-center">
                        <CheckIcon
                          className="w-4 h-4 text-green-400 cursor-pointer hover:text-green-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Disapproving photo with id: ${photo.id}`);
                            handleToggleApprove(photo.id, false);
                          }}
                        />
                        <p className="text-green-400 text-xs mt-1">Approved</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <BanIcon
                          className="w-4 h-4 text-yellow-500 cursor-pointer hover:text-yellow-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Approving photo with id: ${photo.id}`);
                            handleToggleApprove(photo.id, true);
                          }}
                        />
                        <p className="text-yellow-500 text-xs mt-1">Disapproved</p>
                      </div>
                    )}
                    <Trash2Icon
                      className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="col-span-full text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}
          {!isLoading && displayedPhotos.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">No photos to display in this view.</div>}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button onClick={closePreviewModal} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
              <X className="w-6 h-6" />
            </button>
            <img src={imgCdn + previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributeAlbum;
