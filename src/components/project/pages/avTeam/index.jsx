import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { ButtonPanel, Filter } from "../../../core/list/styles";
import { Button } from "../../../core/elements";
import Search from "../../../core/search";
import FormInput from "../../../core/input";
import NoDataFound from "../../../core/list/nodata";
import ListTableSkeleton from "../../../core/loader/shimmer";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import MultiSelect from "../../../core/multiSelect";
import { useMessage } from "../../../core/message/useMessage";
import { ThreeDotMenu, getMenuItems } from "../../../core/list/threedotmenu";

const AvTeam = (props) => {
  const toast = useToast();
  const { showMessage } = useMessage();

  const [eventId, setEventId] = useState(props?.openData?.data?._id || null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [avCodes, setAvCodes] = useState([]);
  const [sessionsMap, setSessionsMap] = useState({});
  const [stagesMap, setStagesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("session");
  const [formSessions, setFormSessions] = useState([]); // array of {id, value}
  const [formStages, setFormStages] = useState([]); // array of {id, value}

  useEffect(() => {
    if (props?.openData?.data?._id) setEventId(props.openData.data._id);
  }, [props?.openData?.data?._id]);

  // Fetch sessions for MultiSelect and for mapping session IDs to names
  const fetchSessionsSelect = async (evId) => {
    try {
      const response = await getData({ event: evId }, "sessions/select");
      const items = response?.data || [];
      const map = {};
      items.forEach((it) => {
        map[String(it.id || it._id)] = it.value;
      });
      setSessionsMap(map);
    } catch (e) {
      // non-blocking
    }
  };

  // Fetch stages for MultiSelect and for mapping stage IDs to names
  const fetchStagesSelect = async (evId) => {
    try {
      const response = await getData({ event: evId }, "stage/master/select");
      const items = response?.data || [];
      const map = {};
      items.forEach((it) => {
        map[String(it.id || it._id)] = it.value;
      });
      setStagesMap(map);
    } catch (e) {
      // non-blocking
    }
  };

  // Fetch AV codes
  const fetchAvCodes = async (evId) => {
    setListLoading(true);
    try {
      const response = await getData({ event: evId }, "av-code");
      if (response?.status === 200) {
        const list = response?.data?.response || response?.data || [];
        setAvCodes(list);
      }
    } catch (e) {
      toast.error("Failed to load AV codes");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!eventId) return;
      setLoading(true);
      await Promise.all([
        fetchSessionsSelect(eventId), 
        fetchStagesSelect(eventId),
        fetchAvCodes(eventId)
      ]);
      setLoading(false);
    };
    init();
  }, [eventId]);

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormType("session");
    setFormSessions([]);
    setFormStages([]);
    setIsModalOpen(true);
  };

  // For edit, map data to form state
  const openEdit = (item) => {
    setEditingItem(item);
    setFormTitle(item?.title || "");
    setFormType(item?.type || "session");
    
    // Map sessions
    const selectedSessions = (item?.assignerSessions || []).map((session) => ({
      id: String(session._id),
      value: session.title || session.value,
    }));
    setFormSessions(selectedSessions);
    
    // Map stages
    const selectedStages = (item?.assignerStages || []).map((stage) => ({
      id: String(stage._id),
      value: stage.stage || stage.value,
    }));
    setFormStages(selectedStages);
    
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    const itemName = item?.title || "code";
    const res = await deleteData({ id: item._id }, "av-code");
    console.log(res, "res");
    if (res?.status === 200) {
      toast.success("Deleted");
      fetchAvCodes(eventId);
      return true;
    }
    console.log("deleted");
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormType("session");
    setFormSessions([]);
    setFormStages([]);
    setIsModalOpen(false);
  };

  // When submitting, send appropriate data based on type
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!eventId) {
      toast.error("Missing event");
      return;
    }
    if (!formTitle?.trim()) {
      toast.error("Title is required");
      return;
    }
    
    const sessionIds = (formSessions || []).map((s) => s.id);
    const stageIds = (formStages || []).map((s) => s.id);
    
    const payload = {
      title: formTitle.trim(),
      event: eventId,
      type: formType,
      assignerSessions: sessionIds,
      assignerStages: stageIds,
    };
    
    try {
      let res;
      if (editingItem?._id) {
        res = await putData({ id: editingItem._id, ...payload }, "av-code");
      } else {
        res = await postData(payload, "av-code");
      }
      if (res?.status === 200) {
        toast.success(editingItem ? "Updated" : "Created");
        resetForm();
        fetchAvCodes(eventId);
      } else {
        toast.error("Save failed");
      }
    } catch (e) {
      toast.error("Save failed");
    }
  };

  // Filtering by title or code
  const filteredAvCodes = useMemo(() => {
    const key = searchTerm.trim().toLowerCase();
    if (!key) return avCodes;
    return (avCodes || []).filter((item) => 
      (item?.title || "").toLowerCase().includes(key) || 
      (item?.code || "").toLowerCase().includes(key)
    );
  }, [searchTerm, avCodes]);

  // Get display text for assignments - always show sessions
  const getAssignmentText = (item) => {
    const sessions = (item?.assignerSessions || []).map((session) => session.title || session.value);
    return sessions.length > 0 ? sessions.join(", ") : "No sessions";
  };

  // Get assignment count - always count sessions
  const getAssignmentCount = (item) => {
    return (item?.assignerSessions || []).length;
  };

  // Generate AV Team URL
  const generateAvTeamUrl = (code) => {
    // Helper function to extract default eventhex domain
    const extractDefaultEventhexDomain = (domains) => {
      if (!Array.isArray(domains)) return null;
      const match = domains.find((d) => (d?.appType === "eventhex" || d?.route === "eventhex") && d?.isDefault === true && typeof d?.domain === "string" && d?.domain?.length > 0);
      return match ? match.domain : null;
    };

    // Helper function to get cached domain
    const getCachedEventDomain = (eventId) => {
      try {
        return localStorage.getItem(`eventhex:domain:${eventId}`);
      } catch (e) {
        return null;
      }
    };

    // Helper function to cache domain
    const cacheEventDomain = (eventId, domain) => {
      try {
        if (eventId && domain) {
          localStorage.setItem(`eventhex:domain:${eventId}`, domain);
        }
      } catch (e) {}
    };

    // Check cache first
    const cachedDomain = getCachedEventDomain(eventId);
    if (cachedDomain) {
      const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
      return code ? `${websiteUrl}/av?code=${code}` : `${websiteUrl}/av`;
    }

    // If not cached, fetch and cache for future use
    getData({ event: eventId }, "whitelisted-domains").then((domainRes) => {
      if (domainRes?.status === 200) {
        const defaultDomain = extractDefaultEventhexDomain(domainRes?.data?.response || []);
        if (defaultDomain) {
          cacheEventDomain(eventId, defaultDomain);
        } else {
          // Fallback to regular website URL if no default domain is set
          getData({ id: eventId }, "event/website").then((res) => {
            if (res?.status === 200 && res?.data?.data) {
              const websiteUrl = res.data.data.includes("http") ? res.data.data : `https://${res.data.data}`;
              cacheEventDomain(eventId, websiteUrl);
            }
          });
        }
      }
    });

    // Return fallback URL while fetching
    return code ? `example.com/av?code=${code}` : "example.com/av";
  };

  if (loading) {
    return (
      <RowContainer className="data-layout">
        <ListTableSkeleton viewMode={"table"} tableColumnCount={5} />
      </RowContainer>
    );
  }

  return (
    <RowContainer className="data-layout">
      <PageHeader title="AV Team Codes" description="Assign one code to multiple sessions or stages for the AV team." line={false} />

      {/* AV Team URL Display */}
      <div className="mb-6 p-4 bg-bg-weak rounded-lg border border-stroke-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-main mb-1">AV Team Access URL</h3>
            <p className="text-xs text-text-sub">Share this URL with your AV team to access their assigned sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-text-sub bg-bg-white px-3 py-2 rounded border border-stroke-soft">
              {generateAvTeamUrl()}
            </span>
            <button
              onClick={() => window.open(generateAvTeamUrl(), '_blank')}
              className="p-2 hover:bg-bg-soft rounded transition-colors"
              title="Open AV Team URL"
            >
              <GetIcon icon="link" className="w-5 h-5 text-text-sub hover:text-primary-base" />
            </button>
          </div>
        </div>
      </div>

      <ButtonPanel className="custom">
        <div className="flex items-center gap-3">
          <Search title="Search" placeholder="Search by title or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {/* <Filter onClick={() => {}}>
            <GetIcon icon="filter" />
            <span>Filter</span>
          </Filter> */}
        </div>

        <div className="flex items-center gap-3">
          <Button value="Add Access" icon="add" ClickEvent={openCreate} type="primary" align="bg-primary-base hover:bg-primary-dark text-white" />
        </div>
      </ButtonPanel>

      {listLoading ? (
        <ListTableSkeleton viewMode={"table"} tableColumnCount={5} />
      ) : filteredAvCodes.length === 0 ? (
        <NoDataFound shortName="AV Codes" icon="key" addPrivilege={true} addLabel="Add Code" isCreatingHandler={openCreate} description="Create your first AV team code and assign sessions or stages." />
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm bg-bg-white border border-stroke-soft rounded-lg">
            <thead>
              <tr className="bg-bg-weak text-text-sub">
                <th className="text-left px-4 py-2 border-b border-stroke-soft">Title</th>
                <th className="text-left px-4 py-2 border-b border-stroke-soft">Code</th>
                <th className="text-left px-4 py-2 border-b border-stroke-soft">Type</th>
                <th className="text-left px-4 py-2 border-b border-stroke-soft">Assigned Sessions</th>
                <th className="text-left px-4 py-2 border-b border-stroke-soft">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvCodes.map((item) => {
                const assignmentText = getAssignmentText(item);
                const assignmentCount = getAssignmentCount(item);
                
                return (
                  <tr key={item._id} className="hover:bg-bg-weak">
                    <td className="px-4 py-2 text-text-main">{item?.title || "-"}</td>
                    <td className="px-4 py-2 text-text-main font-mono">{item?.code}</td>
                    <td className="px-4 py-2 text-text-sub">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === "stage" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {item.type === "stage" ? "Stage-wise" : "Session-wise"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-text-sub">
                      {assignmentCount === 0 ? (
                        <span className="text-text-disabled">No sessions assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {assignmentText.split(", ").slice(0, 3).map((assignment, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-bg-soft text-text-soft border border-stroke-soft">
                              {assignment}
                            </span>
                          ))}
                          {assignmentCount > 3 && (
                            <span className="px-2 py-0.5 rounded bg-bg-soft text-text-soft border border-stroke-soft">
                              +{assignmentCount - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <ThreeDotMenu
                        items={getMenuItems({
                          showDeleteInDotMenu: true,
                          showEditInDotMenu: true,
                          showCloneInDotMenu: false,
                          data: item,
                          titleValue: item.title,
                          itemTitle: { type: "text" },
                          slNo: 0,
                          signleRecord: false,
                          clonePrivilege: false,
                          updatePrivilege: true,
                          delPrivilege: true,
                          actionElements: { dotmenu: [] },
                          updateHandler: () => {},
                          deleteHandler: handleDelete,
                          refreshUpdate: () => {},
                          openAction: () => {},
                          formInput: [],
                          setMessage: showMessage,
                          setUpdateId: () => {},
                          setSubAttributes: () => {},
                          setShowSubList: () => {},
                          isEditingHandler: openEdit,
                          udpateView: () => {},
                          getValue: (type, value) => value,
                        })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{editingItem ? "Edit AV Code" : "Create AV Code"}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <FormInput
                  type="text"
                  name="title"
                  label="Title"
                  placeholder="Eg: Main Hall Team"
                  required={true}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  customClass="full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Assignment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="session"
                      checked={formType === "session"}
                      onChange={(e) => setFormType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-text-main">Session-wise</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="stage"
                      checked={formType === "stage"}
                      onChange={(e) => setFormType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-text-main">Stage-wise</span>
                  </label>
                </div>
              </div>

              {formType === "session" ? (
                <div>
                  <MultiSelect
                    label="Assign Sessions"
                    apiType="API"
                    selectApi={`sessions/select`}
                    params={[{ name: "event", value: eventId }]}
                    value={formSessions}
                    onSelect={(items) => setFormSessions(items)}
                    placeholder="Select sessions"
                    customClass="w-full"
                  />
                </div>
              ) : (
                <div>
                  <MultiSelect
                    label="Assign Stages"
                    apiType="API"
                    selectApi={`stage/master/select`}
                    params={[{ name: "event", value: eventId }]}
                    value={formStages}
                    onSelect={(items) => setFormStages(items)}
                    placeholder="Select stages"
                    customClass="w-full"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button value="Cancel" ClickEvent={resetForm} type="secondary" align="bg-bg-weak hover:bg-bg-soft text-text-main" />
                <Button value={editingItem ? "Save Changes" : "Create"} ClickEvent={handleSubmit} type="primary" align="bg-primary-base hover:bg-primary-dark text-white" />
              </div>
            </form>
          </div>
        </div>
      )}
    </RowContainer>
  );
};

export default AvTeam;

