import React, { useState } from "react";
import { Check, X, Building2 } from "lucide-react";
import { DataTable } from "../../../components/sections/admin/DataTable";
import type { Column } from "../../../components/sections/admin/DataTable";

interface OrgRequest {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  [key: string]: unknown;
}

const INITIAL_REQUESTS: OrgRequest[] = [
  {
    id: "1",
    name: "Green Earth Foundation",
    email: "contact@greenearth.org",
    status: "pending",
    submittedAt: "2026-04-25T10:30:00Z",
  },
  {
    id: "2",
    name: "Clean City Initiative",
    email: "admin@cleancity.net",
    status: "pending",
    submittedAt: "2026-04-26T14:45:00Z",
  },
  {
    id: "3",
    name: "Eco Warriors",
    email: "info@ecowarriors.com",
    status: "pending",
    submittedAt: "2026-04-27T09:15:00Z",
  },
  {
    id: "4",
    name: "Sustainable Future NGO",
    email: "hello@sustainable.org",
    status: "pending",
    submittedAt: "2026-04-28T08:00:00Z",
  },
];

export const OrganizationRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<OrgRequest[]>(INITIAL_REQUESTS);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
    );
    // In a real app, this would call an API
    console.log(`Approved request ${id}`);
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req))
    );
    // In a real app, this would call an API
    console.log(`Rejected request ${id}`);
  };

  const columns: Column<OrgRequest>[] = [
    {
      key: "name",
      label: "Organization Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex bg-[#F0F7E4] items-center justify-center text-[#86B537] shrink-0">
            <Building2 size={16} />
          </div>
          <span className="font-semibold text-[#1A2A3A] text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email Address",
      render: (row) => (
        <span className="text-[#6B7A88] font-medium text-sm">{row.email}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const styles = {
          pending: { bg: "#FFF9E6", text: "#D97706", label: "Pending" },
          approved: { bg: "#F0F7E4", text: "#86B537", label: "Approved" },
          rejected: { bg: "#FEF2F2", text: "#EF4444", label: "Rejected" },
        };
        const s = styles[row.status];
        return (
          <span
            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium"
            style={{ background: s.bg, color: s.text }}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      key: "_actions",
      label: "Actions",
      width: "180px",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" ? (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white bg-[#86B537] hover:bg-[#75A030] transition-colors"
              >
                <Check size={12} />
                Approve
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
              >
                <X size={12} />
                Reject
              </button>
            </>
          ) : (
            <span className="text-[11px] text-[#A0AAB5] font-medium italic">
              Decision made
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A] tracking-tight">
          Organization Registration Requests
        </h1>
        <p className="text-sm text-[#8A9AA8] font-medium mt-0.5">
          Review and manage pending organization applications
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
        <DataTable
          columns={columns as any}
          data={requests}
          rowKey={(r) => r.id}
          loading={false}
          emptyText="No pending requests"
        />
      </div>
    </div>
  );
};

export default OrganizationRequestsPage;
