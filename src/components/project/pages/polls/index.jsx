// import React, { useState, useEffect, useCallback } from "react";
// import { getData, postData, deleteData, putData } from "../../../../backend/api";
// import { PageHeader, SubPageHeader } from "../../../core/input/heading";
// import { RowContainer } from "../../../styles/containers/styles";
// import { ButtonPanel } from "../../../core/list/styles";
// import { Button } from "../../../core/elements";
// import { Search } from "../../../core/search";
// import { Filter } from "../../../core/list/styles";
// import { NoDataFound } from "../../../core/list/nodata";
// import { Loader } from "../../../core/loader";
// import { useToast } from "../../../core/toast";
// import { GetIcon } from "../../../../icons";
// import { Message } from "../../../core/message";

// // Custom Shimmer Component for Polls Page
// const PollsShimmer = () => (
//   <div className="space-y-6">
//     {[1, 2, 3].map((i) => (
//       <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
//         <div className="animate-pulse">
//           <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
//           <div className="space-y-3">
//             {[1, 2, 3].map((j) => (
//               <div key={j} className="flex items-center justify-between">
//                 <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
//                 <div className="h-4 w-16 bg-gray-200 rounded"></div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-4 h-2 bg-gray-200 rounded"></div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// const Polls = (props) => {
//   const [polls, setPolls] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredPolls, setFilteredPolls] = useState([]);
//   const [eventId, setEventId] = useState(props.openData.data._id);
//   const [showAddPoll, setShowAddPoll] = useState(false);
//   const [showEditPoll, setShowEditPoll] = useState(false);
//   const [selectedPoll, setSelectedPoll] = useState(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [pollToDelete, setPollToDelete] = useState(null);

//   // Poll form states
//   const [newPoll, setNewPoll] = useState({
//     question: '',
//     pollNumber: 1,
//     options: ['', '']
//   });

//   const toast = useToast();

//   // Fetch polls data
//   const fetchPolls = useCallback(async () => {
//     if (!eventId) return;

//     setLoading(true);
//     try {
//       const response = await getData({ event: eventId }, 'poll');
//       if (response.status === 200) {
//         const pollsData = response.data.response || [];
//         setPolls(pollsData);
//         setFilteredPolls(pollsData);
//       }
//     } catch (error) {
//       console.error("Error fetching polls:", error);
//       toast.error("Failed to fetch polls");
//     } finally {
//       setLoading(false);
//     }
//   }, [eventId, toast]);

//   useEffect(() => {
//     fetchPolls();
//   }, [fetchPolls]);

//   // Filter polls based on search term
//   useEffect(() => {
//     if (searchTerm.trim() === '') {
//       setFilteredPolls(polls);
//     } else {
//       const filtered = polls.filter(poll =>
//         poll.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         poll.session?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         poll.session?.value?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredPolls(filtered);
//     }
//   }, [searchTerm, polls]);

//   // Handle adding new option
//   const handleAddOption = () => {
//     setNewPoll(prev => ({
//       ...prev,
//       options: [...prev.options, '']
//     }));
//   };

//   // Handle removing option
//   const handleRemoveOption = (index) => {
//     if (newPoll.options.length > 2) {
//       setNewPoll(prev => ({
//         ...prev,
//         options: prev.options.filter((_, i) => i !== index)
//       }));
//     }
//   };

//   // Handle option change
//   const handleOptionChange = (index, value) => {
//     setNewPoll(prev => ({
//       ...prev,
//       options: prev.options.map((option, i) => i === index ? value : option)
//     }));
//   };

//   // Handle poll form submission
//   const handleSavePoll = async () => {
//     if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     try {
//       const pollData = {
//         question: newPoll.question,
//         pollNumber: newPoll.pollNumber,
//         event: eventId,
//         user: props.user?._id || props.user?.id,
//         options: newPoll.options.map(text => ({ text, votes: 0 })),
//         active: true
//       };

//       const response = await postData(pollData, 'poll');
//       if (response.data.success) {
//         await fetchPolls();
//         setNewPoll({ question: '', pollNumber: polls.length + 1, options: ['', ''] });
//         setShowAddPoll(false);

//         if (props.setMessage) {
//           props.setMessage({
//             type: 1,
//             content: "Poll created successfully!",
//             proceed: "Okay",
//             icon: "success",
//           });
//         }
//       } else {
//         toast.error("Failed to create poll");
//       }
//     } catch (error) {
//       console.error("Error creating poll:", error);
//       toast.error("Error creating poll");
//     }
//   };

//   // Handle poll deletion
//   const handleDeletePoll = async (pollId) => {
//     try {
//       const response = await deleteData({ id: pollId }, 'poll');
//       if (response.data.success) {
//         await fetchPolls();
//         setIsDeleteModalOpen(false);
//         setPollToDelete(null);

//         if (props.setMessage) {
//           props.setMessage({
//             type: 1,
//             content: "Poll deleted successfully!",
//             proceed: "Okay",
//             icon: "success",
//           });
//         }
//       } else {
//         toast.error("Failed to delete poll");
//       }
//     } catch (error) {
//       console.error("Error deleting poll:", error);
//       toast.error("Error deleting poll");
//     }
//   };

//   // Show delete confirmation
//   const showDeleteConfirmation = (poll) => {
//     setPollToDelete(poll);
//     setIsDeleteModalOpen(true);
//   };

//   // Confirm delete
//   const confirmDelete = async () => {
//     if (pollToDelete) {
//       await handleDeletePoll(pollToDelete._id);
//     }
//   };

//   // Get progress bar color based on index
//   const getProgressBarColor = (index) => {
//     const colors = ['bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500'];
//     return colors[index % colors.length];
//   };

//   // Calculate total responses for a poll
//   const getTotalResponses = (poll) => {
//     return poll.options?.reduce((total, option) => total + (option.votes || 0), 0) || 0;
//   };

//   // Render poll card
//   const renderPollCard = (poll) => {
//     const totalResponses = getTotalResponses(poll);

//     return (
//       <div key={poll._id} className="bg-white border border-stroke-soft rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
//         {/* Poll Header */}
//         <div className="flex items-start justify-between mb-6">
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-text-main mb-2">{poll.question}</h3>
//             <div className="flex items-center space-x-4 text-sm text-text-sub">
//               <span>Poll #{poll.pollNumber || 1}</span>
//               <span>•</span>
//               <span>Session: {poll.session?.title || poll.session?.value || 'General Event'}</span>
//               <span>•</span>
//               <span>Total Responses: {totalResponses}</span>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => showDeleteConfirmation(poll)}
//               className="text-state-error hover:text-red-700 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
//             >
//               Delete
//             </button>
//           </div>
//         </div>

//         {/* Poll Options */}
//         <div className="space-y-4">
//           {poll.options?.map((option, index) => {
//             const percentage = totalResponses > 0 ? Math.round((option.votes / totalResponses) * 100) : 0;
//             return (
//               <div key={index} className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-text-main font-medium">{option.text}</span>
//                   <span className="text-text-sub text-sm">{option.votes || 0} responses</span>
//                 </div>
//                 <div className="w-full bg-bg-weak rounded-full h-2">
//                   <div
//                     className={`h-2 rounded-full ${getProgressBarColor(index)} transition-all duration-300`}
//                     style={{ width: `${percentage}%` }}
//                   ></div>
//                 </div>
//                 <div className="text-right text-xs text-text-soft">{percentage}%</div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Poll Status */}
//         <div className="mt-4 pt-4 border-t border-stroke-soft">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <div className={`w-2 h-2 rounded-full ${poll.active ? 'bg-state-success' : 'bg-state-error'}`}></div>
//               <span className="text-sm text-text-sub">
//                 {poll.active ? 'Active' : 'Inactive'}
//               </span>
//             </div>
//             <span className="text-xs text-text-soft">
//               Created: {poll.createdAt ? new Date(poll.createdAt).toLocaleDateString() : 'Recently'}
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <style>
//         {`
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

//           :root {
//             --primary-blue: #4F46E5;
//             --primary-blue-hover: #4338CA;
//             --danger-red: #EF4444;
//             --danger-red-hover: #DC2626;
//             --success-green: #10B981;
//             --success-green-hover: #059669;
//           }

//           body {
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//           }

//           .poll-button {
//             background-color: var(--primary-blue);
//             color: white;
//             padding: 10px 16px;
//             border-radius: 8px;
//             font-weight: 500;
//             font-size: 14px;
//             display: inline-flex;
//             align-items: center;
//             cursor: pointer;
//             transition: background-color 0.2s;
//             justify-content: center;
//             border: none;
//           }

//           .poll-button:hover {
//             background-color: var(--primary-blue-hover);
//           }

//           .poll-button.secondary {
//             background-color: white;
//             color: var(--gray-900);
//             border: 1px solid var(--gray-200);
//           }

//           .poll-button.secondary:hover {
//             background-color: var(--gray-50);
//           }

//           .poll-button.success {
//             background-color: var(--success-green);
//           }

//           .poll-button.success:hover {
//             background-color: var(--success-green-hover);
//           }

//           .poll-button.danger {
//             background-color: var(--danger-red);
//           }

//           .poll-button.danger:hover {
//             background-color: var(--danger-red-hover);
//           }

//           .poll-input {
//             width: 100%;
//             padding: 12px 16px;
//             border: 1px solid #D1D5DB;
//             border-radius: 8px;
//             font-size: 14px;
//             transition: border-color 0.2s, box-shadow 0.2s;
//           }

//           .poll-input:focus {
//             outline: none;
//             border-color: var(--primary-blue);
//             box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//           }

//           .poll-textarea {
//             width: 100%;
//             padding: 12px 16px;
//             border: 1px solid #D1D5DB;
//             border-radius: 8px;
//             font-size: 14px;
//             resize: vertical;
//             min-height: 100px;
//             transition: border-color 0.2s, box-shadow 0.2s;
//           }

//           .poll-textarea:focus {
//             outline: none;
//             border-color: var(--primary-blue);
//             box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
//           }

//           .poll-modal {
//             position: fixed;
//             inset: 0;
//             z-index: 50;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             background-color: rgba(0, 0, 0, 0.5);
//             padding: 1rem;
//           }

//           .poll-modal-content {
//             background-color: white;
//             border-radius: 12px;
//             box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//             width: 100%;
//             max-width: 2xl;
//             max-height: 80vh;
//             overflow-y: auto;
//           }

//           .poll-option-item {
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             margin-bottom: 12px;
//           }

//           .poll-option-input {
//             flex: 1;
//             padding: 10px 12px;
//             border: 1px solid #D1D5DB;
//             border-radius: 6px;
//             font-size: 14px;
//           }

//           .poll-option-input:focus {
//             outline: none;
//             border-color: var(--primary-blue);
//             box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
//           }

//           .poll-remove-btn {
//             color: var(--danger-red);
//             padding: 8px;
//             border-radius: 4px;
//             transition: background-color 0.2s;
//           }

//           .poll-remove-btn:hover {
//             background-color: rgba(239, 68, 68, 0.1);
//           }

//           .poll-add-btn {
//             background-color: var(--success-green);
//             color: white;
//             padding: 8px 12px;
//             border-radius: 6px;
//             font-size: 12px;
//             font-weight: 500;
//             display: flex;
//             align-items: center;
//             gap: 4px;
//             border: none;
//             cursor: pointer;
//             transition: background-color 0.2s;
//           }

//           .poll-add-btn:hover {
//             background-color: var(--success-green-hover);
//           }
//         `}
//       </style>

//       <RowContainer className="data-layout">
//         {/* Header */}
//         <PageHeader
//           title="Polls Management"
//           description="Create and manage polls to gather attendee feedback and insights."
//           line={false}
//         />

//         {/* Action Panel */}
//         <ButtonPanel className="custom">
//           <div className="flex items-center gap-3">
//             <Search
//               title="Search"
//               placeholder="Search polls..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <Filter onClick={() => {}}>
//               <GetIcon icon="filter" />
//               <span>Filter</span>
//             </Filter>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setShowAddPoll(true)}
//               className="poll-button success"
//             >
//               <GetIcon icon="add" />
//               <span>Add Poll</span>
//             </button>
//           </div>
//         </ButtonPanel>

//         {/* Content */}
//         {loading ? (
//           <PollsShimmer />
//         ) : filteredPolls.length === 0 ? (
//           <NoDataFound
//             shortName="Polls"
//             icon="poll"
//             addPrivilege={true}
//             addLabel="Add Poll"
//             isCreatingHandler={() => setShowAddPoll(true)}
//             description="Create polls to gather attendee feedback and insights."
//           />
//         ) : (
//           <div className="space-y-6">
//             {filteredPolls.map(renderPollCard)}
//           </div>
//         )}

//         {/* Add Poll Modal */}
//         {showAddPoll && (
//           <div className="poll-modal">
//             <div className="poll-modal-content">
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h3 className="text-xl font-semibold text-text-main">Add New Poll</h3>
//                   <button
//                     onClick={() => {
//                       setShowAddPoll(false);
//                       setNewPoll({ question: '', pollNumber: polls.length + 1, options: ['', ''] });
//                     }}
//                     className="text-text-sub hover:text-text-main text-2xl"
//                   >
//                     ×
//                   </button>
//                 </div>

//                 <div className="space-y-6">
//                   {/* Poll Question */}
//                   <div>
//                     <label className="block text-sm font-medium text-text-main mb-2">
//                       Poll Question *
//                     </label>
//                     <textarea
//                       value={newPoll.question}
//                       onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
//                       placeholder="Enter your poll question..."
//                       className="poll-textarea"
//                       rows="3"
//                     />
//                   </div>

//                   {/* Poll Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-text-main mb-2">
//                       Poll Number
//                     </label>
//                     <input
//                       type="number"
//                       value={newPoll.pollNumber}
//                       onChange={(e) => setNewPoll(prev => ({ ...prev, pollNumber: parseInt(e.target.value) || 1 }))}
//                       min="1"
//                       className="poll-input"
//                     />
//                   </div>

//                   {/* Poll Options */}
//                   <div>
//                     <div className="flex items-center justify-between mb-3">
//                       <label className="block text-sm font-medium text-text-main">
//                         Poll Options *
//                       </label>
//                       <button
//                         onClick={handleAddOption}
//                         className="poll-add-btn"
//                       >
//                         <GetIcon icon="add" />
//                         Add Option
//                       </button>
//                     </div>

//                     <div className="space-y-3">
//                       {newPoll.options.map((option, index) => (
//                         <div key={index} className="poll-option-item">
//                           <input
//                             type="text"
//                             value={option}
//                             onChange={(e) => handleOptionChange(index, e.target.value)}
//                             placeholder={`Option ${index + 1}`}
//                             className="poll-option-input"
//                           />
//                           {newPoll.options.length > 2 && (
//                             <button
//                               onClick={() => handleRemoveOption(index)}
//                               className="poll-remove-btn"
//                             >
//                               <GetIcon icon="delete" />
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Modal Actions */}
//                 <div className="flex space-x-3 mt-8">
//                   <button
//                     onClick={handleSavePoll}
//                     className="flex-1 poll-button"
//                   >
//                     Save Poll
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowAddPoll(false);
//                       setNewPoll({ question: '', pollNumber: polls.length + 1, options: ['', ''] });
//                     }}
//                     className="flex-1 poll-button secondary"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Delete Confirmation Modal */}
//         <div
//           className={`poll-modal ${isDeleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//           onClick={() => setIsDeleteModalOpen(false)}
//         >
//           <div
//             className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-transform duration-200"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center mb-4">
//               <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
//                 <GetIcon icon="warning" className="w-6 h-6 text-red-600" />
//               </div>
//             </div>
//             <div className="text-center">
//               <h3 className="text-lg font-semibold text-text-main mb-2">Delete Poll</h3>
//               <p className="text-sm text-text-sub mb-6">
//                 Are you sure you want to delete <span className="font-medium">"{pollToDelete?.question}"</span>?
//                 This action cannot be undone.
//               </p>
//             </div>
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 className="flex-1 poll-button secondary"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="flex-1 poll-button danger"
//               >
//                 Delete Poll
//               </button>
//             </div>
//           </div>
//         </div>
//       </RowContainer>
//     </>
//   );
// };

// export default Polls;
