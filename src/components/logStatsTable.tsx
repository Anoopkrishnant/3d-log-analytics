"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipLoader, PuffLoader } from "react-spinners";
import { useLogStats } from "@/hooks/useLogStats";


const ITEMS_PER_PAGE = 50;

const LogStatsTable: React.FC = () => {
  const [searchItem, setSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logStats = useLogStats();

  // If your useLogStats returns data as null or undefined while loading
  // use this for loading state
  const isLoading = !logStats || logStats.length === 0;

  // You can improve this by modifying useLogStats to return loading explicitly

  const filteredLogs = useMemo(() => {
    if (!logStats) return [];
    const search = searchItem.trim().toLowerCase();
    if (!search) return logStats;
    return logStats.filter(
      (log) =>
        log.job_id.toLowerCase().includes(search) ||
        log.file_name.toLowerCase().includes(search)
    );
  }, [logStats, searchItem]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  return (
    <motion.div
      className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl pt-4 p-6 md:p-8 border border-[#1f1f1f] mx-8 min-h-[300px]" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {/* Header + Search omitted for brevity, keep your existing code */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6"> 
        <h2 className="text-lg md:text-2xl font-semibold text-gray-100 text-center md:text-left">
          Log Stats Table
        </h2>
        <div className="relative w-full md:w-72"> 
          <input
            type="text"
            placeholder="Search by Job ID or File Name..."
            onChange={(e) => {
              setSearchItem(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
            value={searchItem}
            className="bg-[#2f2f2f] text-white placeholder-gray-400 rounded-lg pl-12 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-sm"
          />
          <svg
            className="absolute left-4 top-3.5 text-gray-400 w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
      </div>

      {/* Loader Section */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <PuffLoader size={50} color="#55057aff" />
        </div>
      ) : (
        <>
          {/* Table */}
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr>
                {[
                  "Job ID",
                  "File Name",
                  "Total Logs",
                  "Errors",
                  "Warnings",
                  "Infos",
                  "Unique IPs",
                  "Keywords Found",
                  "Processing Time",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 md:px-8 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedLogs.map((log) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {/* Mobile view */}
                  <td className="md:hidden px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-gray-100">{log.job_id}</div>
                      <div className="text-xs text-gray-400">File: {log.file_name}</div>
                      <div className="text-xs text-gray-400">Total Logs: {log.total_logs}</div>
                      <div className="text-xs text-gray-400">
                        Errors: {log.error_count}, Warnings: {log.warning_count}, Infos: {log.info_count}
                      </div>
                      <div className="text-xs text-gray-400">Unique IPs: {log.unique_ips}</div>
                      <div className="text-xs text-gray-400">
                        Keywords: {JSON.stringify(log.keywords_found)}
                      </div>
                      <div className="text-xs text-gray-400">Processing Time: {log.processing_time}</div>
                      <div className="text-xs text-gray-400">Created: {new Date(log.created_at).toLocaleString()}</div>
                    </div>
                  </td>

                  {/* Desktop view */}
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-gray-100">{log.job_id}</td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-gray-300">{log.file_name}</td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-gray-300">{log.total_logs}</td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-red-500">{log.error_count}</td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-yellow-400">{log.warning_count}</td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-blue-400">{log.info_count}</td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-gray-300">{log.unique_ips}</td>
                  <td className="hidden md:table-cell px-8 py-4 max-w-xs truncate whitespace-normal text-sm text-gray-300">
                    {JSON.stringify(log.keywords_found)}
                  </td>
                  <td className="hidden md:table-cell px-8 py-4 whitespace-nowrap text-sm text-gray-300">{log.processing_time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded ${
                    page === currentPage
                      ? "bg-gray-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LogStatsTable;
