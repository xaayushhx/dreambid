import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { enquiriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

function Enquiries() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['enquiries', statusFilter],
    () => enquiriesAPI.getAll({ status: statusFilter || undefined, limit: 100 })
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => enquiriesAPI.updateStatus(id, status),
    {
      onSuccess: (response, { id, status }) => {
        toast.success('Enquiry status updated');
        // Update the selected enquiry with the new status
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({
            ...selectedEnquiry,
            status: status
          });
        }
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries('enquiries');
        queryClient.invalidateQueries(['enquiries', statusFilter]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      },
    }
  );

  const enquiries = data?.data?.enquiries || [];

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'contacted': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      case 'not_interested': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'unable_to_connect': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'call_later': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading enquiries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-300">Error loading enquiries: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Enquiries List */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Enquiries</h1>
          
          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-midnight-700 border border-midnight-600 text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="not_interested">Not Interested</option>
            <option value="unable_to_connect">Unable to Connect</option>
            <option value="call_later">Asked to Call Later</option>
          </select>
        </div>

        {/* Enquiries List */}
        <div className="space-y-3">
          {enquiries.length === 0 ? (
            <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-8 text-center text-text-secondary">
              <p>No enquiries found.</p>
            </div>
          ) : (
            enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => setSelectedEnquiry(enquiry)}
                className={`bg-midnight-900 border border-midnight-700 rounded-lg p-4 cursor-pointer transition-all hover:border-gold ${
                  selectedEnquiry?.id === enquiry.id ? 'border-gold ring-2 ring-gold/20' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{enquiry.name}</h3>
                    <p className="text-sm text-text-secondary truncate">{enquiry.email}</p>
                    <p className="text-sm text-text-secondary">{enquiry.phone}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                      {enquiry.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-midnight-700">
                  <p className="text-sm text-text-primary font-medium truncate">{enquiry.property_title}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(enquiry.created_at).toLocaleDateString()} at {new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - Details Panel */}
      {selectedEnquiry && (
        <div className="lg:col-span-1">
          <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold text-text-primary mb-6">Enquiry Details</h2>

            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-text-secondary">Name</p>
                    <p className="text-sm text-text-primary font-medium">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm text-text-primary font-medium break-all">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Phone</p>
                    <p className="text-sm text-text-primary font-medium">{selectedEnquiry.phone}</p>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="pt-4 border-t border-midnight-700">
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-3">Property Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-text-secondary">Property</p>
                    <p className="text-sm text-text-primary font-medium">{selectedEnquiry.property_title}</p>
                  </div>
                  {selectedEnquiry.property_address && (
                    <div>
                      <p className="text-xs text-text-secondary">Address</p>
                      <p className="text-sm text-text-primary">{selectedEnquiry.property_address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-text-secondary">Type</p>
                    <p className="text-sm text-text-primary font-medium">{selectedEnquiry.enquiry_type || 'General Inquiry'}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedEnquiry.message && (
                <div className="pt-4 border-t border-midnight-700">
                  <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-3">Message</h3>
                  <p className="text-sm text-text-primary bg-midnight-800 rounded-lg p-3">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              {/* Status & Actions */}
              <div className="pt-4 border-t border-midnight-700">
                <h3 className="text-sm font-semibold text-gold uppercase tracking-wide mb-3">Status</h3>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => {
                    handleStatusChange(selectedEnquiry.id, e.target.value);
                    setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-midnight-800 border border-midnight-600 text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="unable_to_connect">Unable to Connect</option>
                  <option value="call_later">Asked to Call Later</option>
                </select>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-midnight-700">
                <p className="text-xs text-text-secondary">
                  Created: {new Date(selectedEnquiry.created_at).toLocaleDateString()} {new Date(selectedEnquiry.created_at).toLocaleTimeString()}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  ID: {selectedEnquiry.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Enquiries;
