import React, { useEffect, useState } from "react";
import { getData } from "../../../../backend/api";
// import { PageHeader } from "../../../../components/core/input/heading";

const IAmAttending = ({ posterId }) => {
  const [usages, setUsages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getData({}, `advocacy-poster-usage?advocacyPoster=${posterId}`);
      if (response.data?.response) {
        const formattedUsages = response.data.response.map((usage) => {
          let imageBuilderData = {};
          try {
            imageBuilderData = JSON.parse(usage.imageBulderData);
          } catch (e) {
            console.error("Error parsing imageBuilderData:", e);
          }
          return {
            ...usage,
            imageBuilderData,
          };
        });
        setUsages(formattedUsages);
      }
    };
    fetchData();
  }, [posterId]);

  return (
    <div className="overflow-x-auto">
      {/* <PageHeader title="Poster Usage test" /> */}
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50 border-b">
            {usages[0]?.imageBuilderData &&
              Object.keys(usages[0].imageBuilderData).map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {key}
                </th>
              ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usages.map((usage, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {Object.entries(usage.imageBuilderData).map(([key, value]) => (
                <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof value === "object" ? JSON.stringify(value) : value?.toString()}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(usage.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IAmAttending;
