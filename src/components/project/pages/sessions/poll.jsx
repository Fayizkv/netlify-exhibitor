import React, { useEffect, useMemo, useState } from 'react';
// Removed Recharts import as we now render custom progress bars for results
import { Button } from "../../../core/elements";
import { SubPageHeader } from "../../../core/input/heading";
import { SimpleShimmer } from "../../../core/loader/shimmer";
import { Input } from "../../../core/input/styles";
import Accordion from "../../../core/accordian";
import { GetIcon } from "../../../../icons";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import FormInput from "../../../core/input";

export default function PollAnalyticsDashboard({ eventId, sessionId, sessionMeta, setMessage }) {
  const [polls, setPolls] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [speaker, setSpeaker] = useState("");
  const [endDate, setEndDate] = useState("");
  // Track an explicitly expanded poll if needed in future
  const [expandedPoll, setExpandedPoll] = useState(null);

  // Fetch real polls from API
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const filter = {};
        if (eventId) filter.event = eventId;
        if (sessionId) filter.session = sessionId;
        const response = await getData(filter, "poll");
        const list = Array.isArray(response?.data?.response)
          ? response.data.response
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setPolls(list);
        if (list.length > 0) {
          setExpandedPoll(list[0]._id || list[0].id);
        }
      } catch (e) {
        // Optional UI feedback
        if (setMessage) {
          setMessage({ type: 1, content: "Failed to load polls", icon: "error", title: "Error" });
        }
      } finally {
      }
    };
    fetchPolls();
  }, [eventId, sessionId, setMessage]);

  const addOption = () => setOptions(prev => [...prev, ""]);
  const updateOption = (idx, val) => setOptions(prev => prev.map((o, i) => (i === idx ? val : o)));
  const removeOption = (idx) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter((_, i) => i !== idx));
  };
  const resetForm = () => {
    setQuestion("");
    setOptions(["", ""]);
    setSpeaker("");
    setSelectedPoll(null);
    setIsEditMode(false);
    setEndDate("");
  };
  const refreshPolls = async () => {
    try {
      const filter = {};
      if (eventId) filter.event = eventId;
      if (sessionId) filter.session = sessionId;
      const r = await getData(filter, "poll");
      const list = Array.isArray(r?.data?.response)
        ? r.data.response
        : Array.isArray(r?.data?.data)
        ? r.data.data
        : Array.isArray(r?.data)
        ? r.data
        : [];
      setPolls(list);
    } catch {}
  };
  const endPoll = async (pollId) => {
    if (!pollId) return;
    if (setMessage) {
      setMessage({
        type: 2,
        content: "End this poll? Attendees will no longer be able to vote.",
        proceed: "End Poll",
        okay: "Cancel",
        onProceed: async () => {
          try {
            // Optimistically mark this poll ended for immediate UI transition
            setPolls((prev) => prev.map((p) => (p._id === pollId || p.id === pollId ? { ...p, active: false } : p)));
            const res = await putData({ id: pollId, active: false }, "poll");
            if (res?.status === 200) {
              // Refresh quietly to sync any server-side totals
              refreshPolls();
              setMessage({ type: 1, content: "Poll ended", icon: "success", title: "Success" });
              return true;
            }
            setMessage({ type: 1, content: "Failed to end poll", icon: "error", title: "Error" });
            return false;
          } catch (e) {
            setMessage({ type: 1, content: "Failed to end poll", icon: "error", title: "Error" });
            return false;
          }
        },
      });
    }
  };
  const reopenPoll = async (pollId) => {
    if (!pollId) return;
    try {
      // Optimistically mark as active for snappy UI
      setPolls((prev) => prev.map((p) => (p._id === pollId || p.id === pollId ? { ...p, active: true } : p)));
      const res = await putData({ id: pollId, active: true }, "poll");
      if (res?.status === 200) {
        refreshPolls();
        setMessage && setMessage({ type: 1, content: "Poll reopened", icon: "success", title: "Success" });
      } else {
        setMessage && setMessage({ type: 1, content: "Failed to reopen poll", icon: "error", title: "Error" });
      }
    } catch (e) {
      setMessage && setMessage({ type: 1, content: "Failed to reopen poll", icon: "error", title: "Error" });
    }
  };
  const deletePoll = async (pollId) => {
    if (!pollId) return;
    if (setMessage) {
      setMessage({
        type: 2,
        content: "Are you sure you want to delete this poll? This action cannot be undone.",
        proceed: "Delete",
        okay: "Cancel",
        onProceed: async () => {
          try {
            const res = await deleteData({ id: pollId }, "poll");
            if (res?.data?.success || res?.status === 200) {
              await refreshPolls();
              setMessage({ type: 1, content: "Poll deleted", icon: "success", title: "Success" });
              return true;
            }
            setMessage({ type: 1, content: "Failed to delete poll", icon: "error", title: "Error" });
            return false;
          } catch (e) {
            setMessage({ type: 1, content: "Failed to delete poll", icon: "error", title: "Error" });
            return false;
          }
        },
      });
    }
  };
  const editPoll = (poll) => {
    if (!poll) return;
    setSelectedPoll(poll);
    setQuestion(poll.question || "");
    setOptions(Array.isArray(poll.options) && poll.options.length > 0 ? poll.options.map((o) => o.text || "") : ["", ""]);
    setSpeaker(poll.speaker?._id || poll.speaker || "");
    setEndDate(poll.endDate || "");
    setIsEditMode(true);
    setIsAddOpen(true);
  };
  const savePoll = async () => {
    if (!question.trim() || options.some(o => !o.trim())) {
      setMessage && setMessage({ type: 1, content: "Please enter question and all options", icon: "error", title: "Validation" });
      return;
    }
    if (isEditMode && selectedPoll?._id) {
      // Preserve existing votes by index where possible
      // Set isSelected to true if votes > 0
      const updatedOptions = options.map((text, idx) => {
        const voteCount = selectedPoll?.options?.[idx]?.votes ?? 0;
        return {
          text,
          votes: voteCount,
          isSelected: voteCount > 0,
        };
      });
      const payload = {
        id: selectedPoll._id,
        question,
        options: updatedOptions,
        active: typeof selectedPoll.active === "boolean" ? selectedPoll.active : true,
        ...(speaker ? { speaker } : {}),
        ...(endDate ? { endDate } : {}),
      };
      try {
        const res = await putData(payload, "poll");
        if (res?.status === 200) {
          setIsAddOpen(false);
          resetForm();
          await refreshPolls();
          setMessage && setMessage({ type: 1, content: "Poll updated successfully!", icon: "success", title: "Success" });
        } else {
          const errorMsg = res?.data?.message || res?.customMessage || "Failed to update poll";
          setMessage && setMessage({ type: 1, content: errorMsg, icon: "error", title: "Error" });
        }
      } catch (error) {
        console.error("Error updating poll:", error);
        setMessage && setMessage({ type: 1, content: error?.message || "Failed to update poll", icon: "error", title: "Error" });
      }
      return;
    }

    // Create new poll
    const payload = {
      question,
      session: sessionId,
      pollNumber: (Array.isArray(polls) ? polls.length : 0) + 1,
      event: eventId,
      ...(speaker ? { speaker } : {}),
      options: options.map(text => ({ text, votes: 0, isSelected: false })),
      active: true,
      ...(endDate ? { endDate } : {}),
    };
    try {
      const res = await postData(payload, "poll");
      if (res.status === 200 || res.status === 201) {
        setIsAddOpen(false);
        resetForm();
        await refreshPolls();
        setMessage && setMessage({ type: 1, content: "Poll created successfully!", icon: "success", title: "Success" });
      } else {
        const errorMsg = res?.data?.message || res?.customMessage || "Failed to create poll";
        setMessage && setMessage({ type: 1, content: errorMsg, icon: "error", title: "Error" });
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      setMessage && setMessage({ type: 1, content: error?.message || "Failed to create poll", icon: "error", title: "Error" });
    }
  };

  const sessionSubtitle = useMemo(() => {
    if (!sessionMeta) return "";
    const parts = [sessionMeta.stage, sessionMeta.startTime, sessionMeta.duration].filter(Boolean);
    return parts.join(' • ');
  }, [sessionMeta]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-start">
          <SubPageHeader title="Polls" description={sessionSubtitle ? `Session: ${sessionSubtitle}` : ""} line={false} />
          <div className="flex gap-2">
            {/* <Button 
              value="Export"
              icon="download"
              type="secondary"
              ClickEvent={() => {}}
            /> */}
            <Button 
              value="Add New Poll"
              icon="add"
              type="primary"
              ClickEvent={() => setIsAddOpen(true)}
            />
          </div>
        </div>

        {/* AI Insight Banner */}
        {/* <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 flex items-start gap-2">
          <GetIcon icon="info" className="text-blue-600 mt-0.5" />
          <p className="text-blue-900 text-[11px]">
            <strong>AI Insight:</strong> Launch polls in the first 15 minutes for better engagement.
          </p>
        </div> */}
      </div>


      {/* Polls List (scroll handled by parent modal) */}
      <div className="px-6 py-4 space-y-4">
        {/* Hide default left icon inside accordion button for this page only */}
        <style>
          {`
            .eh-no-left-icon .plain > div > button > div:first-child svg { display: none !important; }
            /* Compact button styles scoped to poll actions */
            .eh-poll-actions .button { 
              display: inline-flex; align-items: center; justify-content: center; 
              font-weight: 500; cursor: pointer; transition: all 0.2s ease; 
              outline: none; width: auto; 
            }
            /* Use project theme for color variants; no custom bg overrides */
            .eh-poll-actions .button.mini { height: 28px; font-size: 12px; padding: 0 8px; gap: 6px; border-radius: 6px; }
            .eh-poll-actions .button.mini svg { width: 14px; height: 14px; }
            /* Remove any inner borders added by Accordion internals (keep only card border) */
            .eh-no-left-icon .plain > div { border: 0 !important; }
            .eh-no-left-icon .plain > div > div { border: 0 !important; }
          `}
        </style>
        {polls === null && (
          <SimpleShimmer />
        )}
        {polls !== null && polls.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-gray-500">No polls found</div>
        )}
        {polls !== null && polls.map((poll, index) => {
          const pollId = poll._id || poll.id;
          const totalResponses = Array.isArray(poll.options)
            ? poll.options.reduce((sum, o) => sum + (o.votes || 0), 0)
            : 0;
          const engagement = totalResponses > 0 ? 100 : 0;
          const chartData = Array.isArray(poll.options)
            ? poll.options.map(o => ({ name: o.text, value: o.votes || 0 }))
            : [];

          const items = [
            {
              icon: null,
              label: (
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${poll.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <h3 className={`text-base font-medium truncate ${poll.active ? 'text-gray-900' : 'text-gray-700'}`}>{poll.question}</h3>
                  {/* {!poll.active && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full flex-shrink-0">Ended</span>
                  )} */}
                </div>
              ),
              rightLabel: (
                <div className="flex items-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${poll.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {poll.active ? 'Active' : 'Ended'}
                  </span>
                </div>
              ),
              content: (
                <div className="space-y-3">
                  {/* Ended banner */}
                  {!poll.active && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3">
                      <GetIcon icon="info" />
                      <span>The poll has ended. Responses can no longer be changed.</span>
                    </div>
                  )}

                  {/* Results */}
                  {poll.active ? (
                    chartData.length > 0 ? (
                      <div className="space-y-3">
                        {Array.isArray(poll.options) && poll.options.map((o, i) => {
                          const pct = totalResponses > 0 ? Math.round(((o.votes || 0) / totalResponses) * 100) : 0;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700 truncate mr-2">{o.text}</span>
                                <span className="text-sm font-semibold text-gray-800">{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-gray-200">
                                <div className={`${i===0 ? 'bg-green-500' : i===1 ? 'bg-blue-500' : 'bg-yellow-400'} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-28 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500 text-[11px]">No responses yet</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      {Array.isArray(poll.options) && poll.options.map((o, i) => {
                        const pct = totalResponses > 0 ? Math.round(((o.votes || 0) / totalResponses) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 truncate mr-2">{o.text}</span>
                            <span className="text-sm font-semibold text-gray-800">{pct}%</span>
                          </div>
                        );
                      })}
                      {chartData.length === 0 && (
                        <div className="h-20 flex items-center justify-center bg-white border border-dashed border-gray-200 rounded">
                          <p className="text-gray-500 text-[11px]">No responses recorded</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer with responses + actions */}
                  <div className="flex items-center justify-between mt-3 pt-6 border-t border-gray-100">
                    <div className="text-xs text-gray-500">{totalResponses} Responses {poll.active ? '(Live)' : '(Final)'}
                    </div>
                  <div className="flex items-center gap-2 eh-poll-actions">
                      {poll.active ? (
                        <>
                          <Button value="End Poll" icon="close" type="secondary" align="button mini" ClickEvent={() => endPoll(pollId)} />
                          <Button value="Edit" icon="edit" type="secondary" align="button mini" ClickEvent={() => editPoll(poll)} />
                        </>
                      ) : (
                        <>
                          <Button value="Reopen" icon="refresh" type="secondary" align="button mini" ClickEvent={() => reopenPoll(pollId)} />
                          <Button value="Delete" icon="delete" type="error" align="button mini" ClickEvent={() => deletePoll(pollId)} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ), 
            },
          ];

          return (
            <div key={pollId} className={`rounded-lg border eh-no-left-icon ${poll.active ? 'bg-white border-gray-200' : 'bg-white border-gray-200'}`}>
              <Accordion items={items} customClass="plain" />
            </div>
          );
        })}
      </div>

      {/* Add Poll Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3" onClick={() => setIsAddOpen(false)}>
          <div className="bg-white rounded-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{isEditMode ? "Edit Poll" : "Add New Poll"}</h3>
                <p className="text-gray-500 mt-0.5 text-[11px]">{isEditMode ? "Update the poll question or options" : "Add a new poll to the session"}</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700 text-sm" onClick={() => setIsAddOpen(false)}>×</button>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">Poll Question</label>
                <Input
                  aria-label="Poll Question"
                  placeholder="Poll Question"
                  value={question}
                  onChange={(e)=>setQuestion(e.target.value)}
                />
              </div>
              <div>
                <FormInput
                  type="select"
                  apiType="API"
                  selectApi="speakers/speaker-event"
                  placeholder="Select Speaker"
                  name="speaker"
                  label="Speaker"
                  required={false}
                  value={speaker}
                  onChange={(e) => {
                    const value = e?.target?.value || e?.id || e || "";
                    setSpeaker(value);
                  }}
                  params={[{ name: "event", value: eventId, dynamic: true }]}
                  showItem="value"
                  icon="speakers"
                />
              </div>
              <div>
                <FormInput
                  type="date"
                  placeholder="Select End Date"
                  name="endDate"
                  label="End Date"
                  required={false}
                  value={endDate}
                  onChange={(date, id, type) => {
                    // DateInput onChange receives (date, id, type) where date is a Date object or null
                    const dateValue = date ? date.toISOString() : "";
                    setEndDate(dateValue);
                  }}
                  icon="date"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-800">Poll Options</label>
                  <Button value="Add Option" type="primary" align="button mini" ClickEvent={addOption} />
                </div>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        aria-label={`Option ${idx+1}`}
                        placeholder={`Option ${idx+1}`}
                        value={opt}
                        onChange={(e)=>updateOption(idx, e.target.value)}
                      />
                      {options.length > 2 && (
                        <Button value="Remove" type="secondary" align="button mini" ClickEvent={()=>removeOption(idx)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2 justify-start">
              <Button value={isEditMode ? "Save Changes" : "Save Poll"} type="primary" ClickEvent={savePoll} />
              <Button value="Cancel" type="secondary" ClickEvent={()=>{ setIsAddOpen(false); resetForm(); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}