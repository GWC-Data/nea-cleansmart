import React, { useState, useEffect } from "react";
import { Check, X, Building2, Loader2, Phone, MapPin } from "lucide-react";
import { DataTable } from "../../../components/sections/admin/DataTable";
import type { Column } from "../../../components/sections/admin/DataTable";
import { orgApiService } from "../../../services/orgApiService";
import { toast } from "sonner";

interface OrgRequest {
  orgId: string;
  orgName: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const OrganizationRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<OrgRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await orgApiService.getAllOrganizations();
      // Show all for now, or filter by pending if desired
      setRequests(data);
    } catch (error) {
      toast.error("Failed to fetch organization requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await orgApiService.updateOrganization(id, { status: 'approved' });
      toast.success("Organization approved successfully");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to approve organization");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await orgApiService.updateOrganization(id, { status: 'rejected' });
      toast.success("Organization disapproved");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to disapprove organization");
    }
  };

  const columns: Column<OrgRequest>[] = [
    {
      key: "orgName",
      label: "Organization Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex bg-[#F0F7E4] items-center justify-center text-[#86B537] shrink-0">
            <Building2 size={16} />
          </div>
          <span className="font-semibold text-[#1A2A3A] text-sm">{row.orgName}</span>
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
      key: "phone",
      label: "Phone",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-[#6B7A88] font-medium text-sm">
          <Phone size={12} className="text-[#A0AAB5] shrink-0" />
          <span>{row.phone || "—"}</span>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-[#6B7A88] font-medium text-sm max-w-[180px]">
          <MapPin size={12} className="text-[#A0AAB5] shrink-0" />
          <span className="truncate" title={row.address}>{row.address || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusMap = {
          pending:  { bg: "#FFF9E6", text: "#D97706", label: "Pending" },
          approved: { bg: "#F0F7E4", text: "#86B537", label: "Approved" },
          rejected: { bg: "#FEF2F2", text: "#EF4444", label: "Disapproved" },
        };
        const s = statusMap[row.status] ?? statusMap.pending;
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
          {row.status === 'pending' ? (
            <>
              <button
                onClick={() => handleApprove(row.orgId)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white bg-[#86B537] hover:bg-[#75A030] transition-colors"
              >
                <Check size={12} />
                Approve
              </button>
              <button
                onClick={() => handleReject(row.orgId)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
              >
                <X size={12} />
                Disapprove
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

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] tracking-tight">
            Organization Registration Requests
          </h1>
          <p className="text-sm text-[#8A9AA8] font-medium mt-0.5">
            Review and manage pending organization applications
          </p>
        </div>
        <div className="text-xs font-semibold text-[#8A9AA8] bg-[#F5F7FA] px-3 py-1.5 rounded-full">
          {requests.length} Total Requests
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#108ACB] animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading requests...</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns as any}
              data={paginatedRequests as any}
              rowKey={(r) => r.orgId as string}
              loading={false}
              emptyText="No pending requests"
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[#E8EDF2] flex items-center justify-between bg-[#FBFBFC]">
                <p className="text-xs text-[#8A9AA8] font-medium">
                  Showing <span className="text-[#1A2A3A]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[#1A2A3A]">{Math.min(currentPage * itemsPerPage, requests.length)}</span> of <span className="text-[#1A2A3A]">{requests.length}</span> requests
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-[#E8EDF2] bg-white text-[#6B7A88] hover:bg-[#F8F9FB]"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 rounded-md text-[11px] font-bold transition-colors ${
                          currentPage === i + 1
                            ? "bg-[#108ACB] text-white shadow-sm"
                            : "text-[#6B7A88] hover:bg-[#F8F9FB] border border-transparent"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-[#E8EDF2] bg-white text-[#6B7A88] hover:bg-[#F8F9FB]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationRequestsPage;
