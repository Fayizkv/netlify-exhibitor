import React, { useState, useEffect, useRef, useCallback } from "react";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import { X, FolderPlusIcon, PlusIcon, ListIcon, Grid2X2PlusIcon, SearchIcon, FoldHorizontal, StarIcon, Trash2Icon, CircleCheckBig } from "lucide-react";
import { FaStar } from "react-icons/fa6";
import { CustomFolder } from "../../../../images";
import ImageGallery from "../../../core/list/imagegallery";
import ListTableSkeleton from "../../../core/loader/shimmer";
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

const EventHexPhotoManager = (props) => {
  const [eventId, setEventId] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderNameInMove, setNewFolderNameInMove] = useState("");
  const [targetFolderIdForMove, setTargetFolderIdForMove] = useState("");

  const [activeView, setActiveView] = useState("all"); // 'all', 'uncategorized', 'highlights', or folderId
  const [displayedPhotos, setDisplayedPhotos] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [album, setAlbum] = useState(null);
  const [favoriteAlbums, setFavoriteAlbums] = useState(new Set());

  // New states for infinite scrolling
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [highlightCount, setHighlightCount] = useState(0);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const observer = useRef();

  const photoClickTimers = useRef({});

  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);

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
        isHighlight: false,
      };

      // Add album filter if a specific album is selected
      if (activeView !== "all" && activeView !== "uncategorized" && activeView !== "highlights") {
        queryParams.album = activeView;
      }
      // When viewing highlights, ask API to return only highlights if supported
      if (activeView === "highlights") {
        queryParams.isHighlight = true;
      }

      const response = await getData(queryParams, "insta-snap");
      const data = response.data;
      console.log(data, "data");

      if (data.success) {
        if (typeof data.eventHighlightCount === "number") {
          setHighlightCount(data.eventHighlightCount);
        }
        const photos = data.response || [];
        const albumImageCounts = data.albumImageCounts || [];

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
          isHighlight: photo.isHighlight || false,
          albumId: photo.album?._id || null,
        }));

        // Transform album data from albumImageCounts
        const transformedFolders = albumImageCounts.map((album) => ({
          id: album.albumId,
          name: album.albumName,
          count: album.count || 0,
          isFavourite: album.isFavourite || false,
          photoIds: [], // Will be populated below
        }));

        // Populate photoIds in folders based on album association
        const updatedFolders = transformedFolders.map((folder) => ({
          ...folder,
          photoIds: transformedPhotos.filter((photo) => photo.albumId === folder.id).map((photo) => photo.id),
        }));

        // Set favorite albums
        const favoriteAlbumIds = new Set(updatedFolders.filter((folder) => folder.isFavourite).map((folder) => folder.id));

        if (reset) {
          setAllPhotos(transformedPhotos);
          setSkip(50);
          // Only update total count when viewing all
          if (activeView === "all") {
            setTotalCount(data.filterCount || 0);
            setInitialFetchDone(true);
          }
        } else {
          setAllPhotos((prev) => [...prev, ...transformedPhotos]);
          setSkip((prev) => prev + 50);
        }

        // Avoid overriding album counts/favorites when viewing highlights
        if (activeView !== "highlights") {
          setFolders(updatedFolders);
          setFavoriteAlbums(favoriteAlbumIds);
        }
        setHasMore(transformedPhotos.length === 50);
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
      const response = await getData({ event: eventId, skip: 0, limit: 1 }, "insta-snap");
      const data = response.data;
      if (data.success) {
        // Only update total count if we haven't done initial fetch
        if (!initialFetchDone) {
          setTotalCount(data.filterCount || 0);
          setInitialFetchDone(true);
        }
        if (typeof data.eventHighlightCount === "number") {
          setHighlightCount(data.eventHighlightCount);
        }
        const albumImageCounts = data.albumImageCounts || [];
        setFolders((prevFolders) => {
          return prevFolders.map((folder) => {
            const updatedCount = albumImageCounts.find((a) => a.albumId === folder.id)?.count || 0;
            const updatedAlbum = albumImageCounts.find((a) => a.albumId === folder.id);
            return {
              ...folder,
              count: updatedCount,
              isFavourite: updatedAlbum?.isFavourite || false,
            };
          });
        });

        // Update favorite albums state
        const favoriteAlbumIds = new Set(albumImageCounts.filter((album) => album.isFavourite).map((album) => album.albumId));
        setFavoriteAlbums(favoriteAlbumIds);
      }
    } catch (error) {
      console.error("Error updating counts:", error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deleteData({ id: photoId }, "insta-snap");
      setAllPhotos(allPhotos.filter((photo) => photo.id !== photoId));
      await updateCountsAfterAction();
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  const handleDeleteMultiplePhotos = async (photoIds) => {
    try {
      await deleteData({ ids: photoIds }, "insta-snap/bulk-delete");
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

  const createFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (trimmedName && !folders.some((f) => f.name === trimmedName)) {
      try {
        const response = await postData({ event: eventId, name: trimmedName }, "album");
        const newAlbum = response.data.data;

        const newFolder = {
          id: newAlbum._id,
          name: newAlbum.name,
          photoIds: [],
          isFavourite: newAlbum.isFavourite || false,
        };

        setFolders([...folders, newFolder]);
        setNewFolderName("");
        setShowCreateFolderModal(false);
      } catch (error) {
        console.error("Error creating album:", error);
        alert("Failed to create folder. Please try again.");
      }
    } else if (folders.some((f) => f.name === trimmedName)) {
      alert("A folder with this name already exists.");
    }
  };

  const movePhotosToFolder = async () => {
    if (!targetFolderIdForMove && folders.length > 0) {
      alert("Please select a destination folder.");
      return;
    }
    if (selectedPhotos.size === 0) {
      alert("No photos selected to move.");
      return;
    }

    const photoIdsToMove = Array.from(selectedPhotos);

    try {
      await putData({ photoIds: photoIdsToMove, albumId: targetFolderIdForMove }, "insta-snap/album");

      // Update local state
      setFolders((currentFolders) => {
        let updatedFolders = currentFolders.map((folder) => {
          const newPhotoIds = folder.photoIds.filter((id) => !photoIdsToMove.includes(id));
          return { ...folder, photoIds: newPhotoIds };
        });

        updatedFolders = updatedFolders.map((folder) => {
          if (folder.id === targetFolderIdForMove) {
            const photosToAdd = photoIdsToMove.filter((id) => !folder.photoIds.includes(id));
            return { ...folder, photoIds: [...folder.photoIds, ...photosToAdd] };
          }
          return folder;
        });
        return updatedFolders;
      });

      await updateCountsAfterAction();
      alert(`Photos moved to folder "${folders.find((f) => f.id === targetFolderIdForMove)?.name}".`);
      deselectAllPhotos();
      setShowMoveToFolderModal(false);
    } catch (error) {
      console.error("Error moving photos:", error);
      alert("Failed to move photos. Please try again.");
    }
  };

  const createNewFolderAndMove = async () => {
    const trimmedName = newFolderNameInMove.trim();
    if (trimmedName && !folders.some((f) => f.name === trimmedName)) {
      try {
        const response = await postData({ event: eventId, name: trimmedName }, "album");
        const newAlbum = response.data.response;

        const newFolderId = newAlbum._id;
        const photoIdsToMove = Array.from(selectedPhotos);

        setFolders((currentFolders) => {
          let updatedFolders = currentFolders.map((folder) => {
            const newPhotoIds = folder.photoIds.filter((id) => !photoIdsToMove.includes(id));
            return { ...folder, photoIds: newPhotoIds };
          });
          return [
            ...updatedFolders,
            {
              id: newFolderId,
              name: newAlbum.name,
              photoIds: photoIdsToMove,
              isFavourite: newAlbum.isFavourite || false,
            },
          ];
        });

        alert(`Photos moved to new folder "${trimmedName}".`);
        setNewFolderNameInMove("");
        deselectAllPhotos();
        setShowMoveToFolderModal(false);
      } catch (error) {
        console.error("Error creating folder and moving photos:", error);
        alert("Failed to create folder and move photos. Please try again.");
      }
    } else if (folders.some((f) => f.name === trimmedName)) {
      alert("A folder with this name already exists.");
    } else {
      alert("Please enter a valid and unique folder name.");
    }
  };

  const openPreviewModal = (imageSrc) => {
    setPreviewImage(imageSrc);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setPreviewImage(null);
    setShowPreviewModal(false);
  };

  const handleToggleStar = async (photoId) => {
    try {
      // Update highlight status in backend
      const target = allPhotos.find((p) => p.id === photoId);
      const nextHighlight = target ? !target.isHighlight : true;
      await putData({ id: photoId, isHighlight: nextHighlight }, "insta-snap");

      // Update local state on photos
      setAllPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, isHighlight: nextHighlight } : p)));
      setHighlightCount((prev) => (nextHighlight ? prev + 1 : Math.max(0, prev - 1)));
    } catch (error) {
      console.error("Error updating highlight status:", error);
      alert("Failed to update highlight status. Please try again.");
    }
  };

  const handleToggleAlbumFavorite = async (albumId, e) => {
    e.stopPropagation(); // Prevent folder selection when clicking star
    try {
      const isCurrentlyFavorite = favoriteAlbums.has(albumId);
      await putData({ id: albumId, isFavourite: !isCurrentlyFavorite }, "album");

      // Update local state
      setFavoriteAlbums((prevFavorites) => {
        const newFavorites = new Set(prevFavorites);
        if (isCurrentlyFavorite) {
          newFavorites.delete(albumId);
        } else {
          newFavorites.add(albumId);
        }
        return newFavorites;
      });

      // Update folders state to reflect the change
      setFolders((prevFolders) => prevFolders.map((folder) => (folder.id === albumId ? { ...folder, isFavourite: !isCurrentlyFavorite } : folder)));
    } catch (error) {
      console.error("Error updating album favorite status:", error);
      alert("Failed to update album favorite status. Please try again.");
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

  // Placeholder for folder button styling
  const getFolderButtonStyle = (viewType) => {
    return `px-3 py-2 text-xs sm:text-sm rounded-md border ${activeView === viewType ? "bg-[#375DFB] text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`;
  };

  // Add Photos upload logic - Remove old functions
  // const handleAddPhotosChange = (e, id, type) => {
  //   // e.files is an array of File objects from MultipleImageUploader
  //   const files = e.files || [];
  //   // setUploadFiles(files.map(file => ({ file, name: file.name, status: 'pending' })));
  // };

  // const handleStartUpload = async () => {
  //   // setIsUploading(true);
  //   // let updatedFiles = [...uploadFiles];
  //   // for (let i = 0; i < updatedFiles.length; i++) {
  //   //   updatedFiles[i].status = 'uploading';
  //   //   setUploadFiles([...updatedFiles]);
  //   //   try {
  //   //     const res = await postData({ event: eventId, file: updatedFiles[i].file }, 'insta-snap');
  //   //     console.log(res, 'res')
  //   //     if (res.status === 200 && res.data) {
  //   //       const keys = res.data.keys || {};
  //   //       setAllPhotos(prev => [
  //   //         ...prev,
  //   //         {
  //   //           id: keys.imageId,
  //   //           src: keys.original || keys.thumbnail || keys.compressed,
  //   //           timestamp: new Date().toLocaleString('en-US', {
  //   //             month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  //   //           }),
  //   //           isHighlight: false,
  //   //           albumId: null
  //   //         }
  //   //       ]);
  //   //       updatedFiles[i].status = 'success';
  //   //     } else {
  //   //       updatedFiles[i].status = 'error';
  //   //       updatedFiles[i].errorMsg = res.customMessage || 'Upload failed';
  //   //     }
  //   //   } catch (err) {
  //   //     updatedFiles[i].status = 'error';
  //   //     updatedFiles[i].errorMsg = err?.message || 'Upload failed';
  //   //   }
  //   //   setUploadFiles([...updatedFiles]);
  //   // }
  //   // setIsUploading(false);
  //   // handleCloseAddPhotosModal();
  // };

  const handleCloseAddPhotosModal = () => {
    setShowAddPhotosModal(false);
    // setUploadFiles([]);
    // setIsUploading(false);
  };

  // Callback to refresh photos after successful upload
  const handleUploadComplete = () => {
    // Refresh the photos list
    fetchData(true);
    handleCloseAddPhotosModal();
  };

  // Add effect to refresh photos when modal is closed
  useEffect(() => {
    if (!showAddPhotosModal) {
      // Refresh photos when modal is closed
      fetchData(true);
    }
  }, [showAddPhotosModal]);

  const handleBulkHighlight = async () => {
    if (selectedPhotos.size === 0) {
      alert("Please select photos to highlight");
      return;
    }

    try {
      const photoIds = Array.from(selectedPhotos);
      await postData({ photoIds }, "insta-snap/bulk-highlight");

      // Update local state on photos
      setAllPhotos((prev) => prev.map((p) => (photoIds.includes(p.id) ? { ...p, isHighlight: true } : p)));
      const newlyHighlightedCount = allPhotos.filter((p) => photoIds.includes(p.id) && !p.isHighlight).length;
      if (newlyHighlightedCount > 0) {
        setHighlightCount((prev) => prev + newlyHighlightedCount);
      }

      deselectAllPhotos();
    } catch (error) {
      console.error("Error highlighting photos:", error);
      alert("Failed to highlight photos. Please try again.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [eventId, activeView]);

  // Update displayed photos when filters change
  useEffect(() => {
    let photosToFilter = allPhotos;

    if (activeView === "uncategorized") {
      const photosInAnyFolder = new Set(folders.flatMap((f) => f.photoIds));
      photosToFilter = allPhotos.filter((p) => !photosInAnyFolder.has(p.id));
    } else if (activeView === "highlights") {
      photosToFilter = allPhotos.filter((p) => p.isHighlight);
    } else if (activeView !== "all") {
      const selectedFolder = folders.find((f) => f.id === activeView);
      if (selectedFolder) {
        photosToFilter = allPhotos.filter((p) => selectedFolder.photoIds.includes(p.id));
      }
    }

    if (showOnlyStarred) {
      photosToFilter = photosToFilter.filter((p) => p.isHighlight);
    }

    if (searchQuery) {
      photosToFilter = photosToFilter.filter((p) => p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.timestamp.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setDisplayedPhotos(photosToFilter);
  }, [activeView, allPhotos, folders, searchQuery, showOnlyStarred]);

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
    if (folders.length > 0) {
      setTargetFolderIdForMove(folders[0].id);
    } else {
      setTargetFolderIdForMove(""); // No folders to select
    }
  }, [folders]);

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
            {/* <h1 className="text-lg sm:text-xl font-medium">Manage Photos</h1>
            <p className="text-xs sm:text-sm text-gray-500">Organize, Edit, and oversee all uploaded photos from your event.</p> */}
            <SubPageHeader title="Manage Photos" line={false} description="Organize, Edit, and oversee all uploaded photos from your event." />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <FolderPlusIcon className="w-4 h-4 flex-shrink-0" />
              Create Folder
            </button>
            <button
              className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={() => setShowAddPhotosModal(true)}
            >
              <PlusIcon className="w-4 h-4 flex-shrink-0" />
              Add Photos
            </button>
          </div>
        </div>

        {/* Folder Display Section */}
        <div className="flex  flex-wrap gap-2 py-3 border-b border-gray-200">
          <button onClick={() => setActiveView("all")} className={getFolderButtonStyle("all")}>
            All Photos ({totalCount})
          </button>
          <button onClick={() => setActiveView("highlights")} className={getFolderButtonStyle("highlights")}>
            Event Highlights ({highlightCount})
          </button>
          <button onClick={() => setActiveView("uncategorized")} className={getFolderButtonStyle("uncategorized")}>
            Uncategorized ({totalCount - folders.reduce((sum, folder) => sum + folder.count, 0)})
          </button>

          {folders.map((folder) => (
            <div key={folder.id} className="relative group">
              <button className="flex items-center gap-2 border border-gray-300 rounded-xl px-2 py-1 hover:bg-gray-100 hover:text-gray-700 text-[12px]" onClick={() => setActiveView(folder.id)}>
                <img className="w-8" src={CustomFolder} alt="folder" />
                {folder.name} ({folder.count})
              </button>
              <button
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
                onClick={(e) => handleToggleAlbumFavorite(folder.id, e)}
                title={favoriteAlbums.has(folder.id) ? "Remove from favorites" : "Add to favorites"}
              >
                {favoriteAlbums.has(folder.id) ? <FaStar className="w-2.5 h-2.5 text-yellow-400" /> : <StarIcon className="w-2.5 h-2.5 text-gray-400" />}
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between sm:items-center border-gray-300">
          <div className="flex items-center gap-2">
            <button className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Grid2X2PlusIcon className="w-4 h-4 flex-shrink-0" />
            </button>
            {/* <button className="flex rounded-xl border border-gray-300 hover:bg-gray-100 hover:text-gray-700 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ListIcon className="w-4 h-4 flex-shrink-0" />
            </button> */}
          </div>
          {/* <div className="flex items-center gap-2">
            <SearchIcon className="w-6 h-6 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-xl text-xs sm:text-sm"
            />
          </div> */}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row py-1 gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              {/* This section was cleared by user in previous step, now shows selection count or 'No photos' */}
              {selectedPhotos.size > 0 ? (
                <p className="text-xs sm:text-sm text-gray-600">
                  {selectedPhotos.size} photo{selectedPhotos.size === 1 ? "" : "s"} selected
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-600">
                  {/* Display total photos in current view if nothing is selected */}
                  {displayedPhotos.length} photo{displayedPhotos.length === 1 ? "" : "s"}
                  {activeView === "all" && " in total"}
                  {activeView === "uncategorized" && " uncategorized"}
                  {activeView === "highlights" && " highlights"}
                  {folders.find((f) => f.id === activeView) && ` in ${folders.find((f) => f.id === activeView).name}`}
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
                onClick={() => {
                  if (selectedPhotos.size > 0) {
                    setShowMoveToFolderModal(true);
                  }
                }}
                disabled={selectedPhotos.size === 0}
                className="flex rounded-xl border border-gray-300 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FoldHorizontal className="w-4 h-4 flex-shrink-0" />
                Move to folder
              </button>
              <button
                onClick={handleBulkHighlight}
                disabled={selectedPhotos.size === 0}
                className="flex rounded-xl border border-gray-300 px-2 py-2 sm:px-3 sm:py-2 items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <StarIcon className="w-4 h-4 flex-shrink-0" />
                Add to Highlights
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                ref={index === displayedPhotos.length - 1 ? lastPhotoRef : null}
                className={`w-full h-full group relative cursor-pointer ${selectedPhotos.has(photo.id) ? "border-4 border-blue-500 rounded-xl  p-1 box-border" : "border-4 border-transparent box-border"}`}
                onClick={() => handlePhotoInteraction(photo)}
              >
                <img src={imgCdn + photo.src} alt={photo.id} className="w-full h-full object-cover aspect-square rounded-lg" />
                <div
                  className="  absolute  top-2 left-2 w-5 h-5 rounded-full border-2 border-white  bg-opacity-30 flex items-center justify-center shadow cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhotoSelect(photo.id);
                  }}
                >
                  {selectedPhotos.has(photo.id) && (
                    // <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <CircleCheckBig className="text-blue-500  " />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center rounded-b-lg">
                  <span>{photo.timestamp}</span>
                  <div className="flex gap-2">
                    {photo.isHighlight ? (
                      <FaStar
                        className="w-4 h-4 text-yellow-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(photo.id);
                        }}
                      />
                    ) : (
                      <StarIcon
                        className="w-4 h-4 text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(photo.id);
                        }}
                      />
                    )}
                    <Trash2Icon
                      className="w-4 h-4 text-white hover:text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isLoading && (
            <div className="col-span-full py-4">
              <ListTableSkeleton viewMode={"list"} displayColumn={"triple"} />
            </div>
          )}
          {!isLoading && displayedPhotos.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">No photos to display in this view.</div>}
        </div>
      </div>

      <Modal className="bg-gray-100" show={showCreateFolderModal} onClose={() => setShowCreateFolderModal(false)} title="Create New Folder">
        <div className="space-y-4">
          <div>
            <label htmlFor="newFolderNameInput" className="block text-sm font-medium text-gray-700 mb-1">
              Folder Name
            </label>
            <input
              id="newFolderNameInput"
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g., Event Highlights"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateFolderModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createFolder}
              disabled={!newFolderName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
            >
              Create Folder
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        className="bg-gray-100"
        show={showMoveToFolderModal}
        onClose={() => setShowMoveToFolderModal(false)}
        title={`Move ${selectedPhotos.size} Photo${selectedPhotos.size === 1 ? "" : "s"} to Folder`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="selectFolderMove" className="block text-sm font-medium text-gray-700 mb-1">
              Select Destination Folder
            </label>
            <select
              id="selectFolderMove"
              value={targetFolderIdForMove}
              onChange={(e) => setTargetFolderIdForMove(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
              disabled={folders.length === 0}
            >
              {folders.length === 0 ? (
                <option value="" disabled>
                  No folders available
                </option>
              ) : (
                folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-2 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div>
            <label htmlFor="newFolderNameInMoveInput" className="block text-sm font-medium text-gray-700 mb-1">
              Create New Folder & Move
            </label>
            <div className="flex gap-2">
              <input
                id="newFolderNameInMoveInput"
                type="text"
                value={newFolderNameInMove}
                onChange={(e) => setNewFolderNameInMove(e.target.value)}
                placeholder="e.g., Candids"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={createNewFolderAndMove}
                disabled={!newFolderNameInMove.trim() || selectedPhotos.size === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
              >
                Create & Move
              </button>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4 items-center">
            <div>
              {selectedPhotos.size > 0 && (
                <div className="flex items-center">
                  {allPhotos
                    .filter((p) => selectedPhotos.has(p.id))
                    .slice(0, 3) // Show fewer previews in modal
                    .map((photo, index) => (
                      <img
                        key={photo.id}
                        src={imgCdn + photo.src}
                        alt="Selected"
                        className={`w-7 h-7 rounded-full border-2 border-white object-cover ${
                          index > 0 ? "-ml-2" : "" // Adjusted overlap
                        }`}
                        style={{ zIndex: 3 - index }}
                      />
                    ))}
                  {selectedPhotos.size > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 -ml-2" style={{ zIndex: 0 }}>
                      +{selectedPhotos.size - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMoveToFolderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={movePhotosToFolder}
                disabled={(!targetFolderIdForMove && folders.length > 0) || selectedPhotos.size === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300"
              >
                Move Photos
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal className="bg-gray-100" show={showAddPhotosModal} onClose={handleCloseAddPhotosModal} title="Add Photos">
        <div className="space-y-4">
          <ImageGallery openData={props.openData} api="insta-snap" imageSettings={{ fileName: "file" }} showTitle={false} />
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseAddPhotosModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        show={showPreviewModal}
        onClose={closePreviewModal}
        // title="Image Preview"
        // Ensure preview modal has a solid background
      >
        {previewImage && <img src={imgCdn + previewImage} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain rounded" />}
      </Modal>
    </div>
  );
};

export default EventHexPhotoManager;
