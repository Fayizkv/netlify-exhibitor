import React, { useMemo } from "react";
import { GetIcon } from "../../../../icons/index.jsx";
import Accordion from "../../../core/accordian";

const EvaluationCriteria = ({ 
  criteria = [], 
  onEdit, 
  onDelete, 
  onAddNew,
  setMessage,
  quickAddNode = null,
  totalCount = null,
  provisional = null,
}) => {
  const listWithProvisional = useMemo(() => {
    const list = [...(provisional ? [provisional] : []), ...criteria];
    return list;
  }, [provisional, criteria]);

  const getTypeLabel = (responseType) => {
    if (responseType === "1-5" || responseType === "1-10") {
      return `Scale Rating (${responseType})`;
    }
    if (responseType === "multiple") {
      return "Multiple Choice";
    }
    if (responseType === "yesno") {
      return "Yes/No";
    }
    if (responseType === "text") {
      return "Text Feedback";
    }
    return responseType || "Unknown";
  };

  const getTypeColor = (responseType) => {
    if (responseType === "1-5" || responseType === "1-10") {
      return "bg-primary-light text-primary-base";
    }
    if (responseType === "multiple") {
      return "bg-bg-soft text-text-main";
    }
    if (responseType === "yesno") {
      return "bg-bg-soft text-text-main";
    }
    if (responseType === "text") {
      return "bg-bg-soft text-text-main";
    }
    return "bg-bg-soft text-text-main";
  };

  const handleDelete = (criterion, index) => {
    if (setMessage) {
      const criterionName = criterion.title || criterion.rubricName || `Criterion ${index + 1}`;
      setMessage({
        type: 2,
        content: `Do you want to delete '${criterionName}'? This action cannot be undone.`,
        proceed: "Delete",
        okay: "Cancel",
        onProceed: async () => {
          if (onDelete) {
            await onDelete(criterion, criterion._id || criterion.id);
          }
          return true;
        }
      });
    } else if (onDelete) {
      onDelete(criterion, criterion._id || criterion.id);
    }
  };

  const criterionTypes = [
    {
      id: "scale",
      label: "Scale Rating (1-5, 1-10)",
      icon: "chart",
    },
    {
      id: "multiple",
      label: "Multiple Choice",
      icon: "checkbox",
    },
    {
      id: "yesno",
      label: "Yes/No",
      icon: "check",
    },
    {
      id: "text",
      label: "Text Feedback",
      icon: "textarea",
    },
  ];

  return (
    <div className="w-full">
      {/* Evaluation Criteria Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Evaluation Criteria ({typeof totalCount === "number" ? totalCount : criteria.length})
        </h3>

        {/* Build display list including provisional item when present */}
        {(() => {
          const list = listWithProvisional;
          if (list.length === 0) {
            return (
              <div className="bg-bg-white rounded-lg border border-stroke-soft p-8 text-center">
                <p className="text-text-sub">No evaluation criteria defined yet.</p>
                <p className="text-sm text-text-soft mt-2">Add your first criterion below.</p>
              </div>
            );
          }
          const items = list.map((criterion, index) => {
            const typeLabel = getTypeLabel(criterion.responseType);
            const typeColor = getTypeColor(criterion.responseType);
            const title = criterion.title || criterion.rubricName || criterion.criteria || `Criterion ${index + 1}`;
            const weight = criterion.weight || 0;
            const required = criterion.required || false;
            const right = (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${typeColor}`}>{typeLabel}</span>
                {required && <span className="px-2 py-1 rounded text-xs font-medium bg-state-error/10 text-state-error whitespace-nowrap">Required</span>}
                <span className="text-sm font-semibold text-text-main">{weight}%</span>
                {!criterion.__provisional && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(criterion, index);
                    }}
                    className="p-1.5 hover:bg-state-error/10 rounded transition-colors group"
                    title="Delete criterion"
                  >
                    <GetIcon icon="trash" className="w-4 h-4 text-text-sub group-hover:text-state-error transition-colors" />
                  </button>
                )}
              </div>
            );

            const content = criterion.__provisional && quickAddNode ? (
              <div className="pt-2">{quickAddNode}</div>
            ) : (
              <div className="pt-2 space-y-3">
                {criterion.description && (
                  <div>
                    <p className="text-xs font-medium text-text-sub mb-1">Description</p>
                    <p className="text-sm text-text-main">{criterion.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {criterion.minValue !== undefined && (
                    <div>
                      <p className="text-xs font-medium text-text-sub mb-1">Min Value</p>
                      <p className="text-sm text-text-main">{criterion.minValue}</p>
                    </div>
                  )}
                  {criterion.maxValue !== undefined && (
                    <div>
                      <p className="text-xs font-medium text-text-sub mb-1">Max Value</p>
                      <p className="text-sm text-text-main">{criterion.maxValue}</p>
                    </div>
                  )}
                </div>
                {onEdit && (
                  <div className="pt-2">
                    <button type="button" onClick={() => onEdit(criterion)} className="px-4 py-2 bg-primary-base hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors">Edit Criterion</button>
                  </div>
                )}
              </div>
            );

            return {
              icon: "radio",
              label: `${index + 1}. ${title}`,
              rightLabel: right,
              content,
            };
          });

          return <Accordion items={items} />;
        })()}
      </div>

      {/* Add New Criterion Section */}
      <div className="mt-8 pt-6 border-t border-stroke-soft">
        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
          <GetIcon icon="add" />
          <span>Add New Criterion</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {criterionTypes.map((criterionType) => (
            <button
              key={criterionType.id}
              type="button"
              onClick={() => onAddNew && onAddNew(criterionType.id)}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-bg-white rounded-lg border-2 border-dashed border-stroke-soft hover:border-primary-base hover:bg-bg-weak transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-lg bg-bg-soft flex items-center justify-center group-hover:bg-primary-light transition-colors">
                <GetIcon 
                  icon={criterionType.icon} 
                  className="w-6 h-6 text-text-sub group-hover:text-primary-base" 
                />
              </div>
              <span className="text-sm font-medium text-text-main text-center">
                {criterionType.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluationCriteria;

