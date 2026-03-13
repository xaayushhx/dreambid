import { useQuery } from 'react-query';
import { userRegistrationsAPI } from '../../services/admin-api';
import toast from 'react-hot-toast';
import { CalendarIcon, UserIcon, MapPinIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

function UserRegistrations() {
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const { data: registrationsData, isLoading, error } = useQuery(
    'user-registrations',
    async () => {
      const response = await userRegistrationsAPI.getAll();
      return response.data;
    },
    {
      onError: (err) => {
        toast.error('Failed to fetch registrations');
      },
    }
  );

  const registrations = registrationsData?.registrations || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary">Loading registrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Failed to load registrations</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">User Registrations</h1>

      {registrations.length === 0 ? (
        <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-8 text-center">
          <p className="text-text-secondary">No registrations yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registrations List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegistration(reg)}
                  className={`bg-midnight-800 border border-midnight-700 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:border-gold ${
                    selectedRegistration?.id === reg.id ? 'border-gold bg-midnight-750' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{reg.name}</h3>
                      <p className="text-text-secondary flex items-center gap-2 mt-1">
                        <UserIcon className="w-4 h-4" />
                        {reg.contact_number}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {reg.requirements && Array.isArray(reg.requirements) && (
                    <div className="text-sm text-text-secondary space-y-1">
                      <p className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        {reg.requirements.length} requirement(s)
                      </p>
                      {reg.requirements[0] && (
                        <p>
                          Interested in: {reg.requirements[0].propertyType?.join(', ') || 'N/A'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          {selectedRegistration && (
            <div className="lg:col-span-1">
              <div className="bg-midnight-800 border border-midnight-700 rounded-lg p-6 sticky top-20">
                <h2 className="text-xl font-semibold text-white mb-6">Registration Details</h2>

                {/* Basic Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-text-muted text-sm mb-1">Name</p>
                    <p className="text-white font-medium">{selectedRegistration.name}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm mb-1">Contact Number</p>
                    <p className="text-white font-medium">{selectedRegistration.contact_number}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm mb-1">Registered On</p>
                    <p className="text-white font-medium">
                      {new Date(selectedRegistration.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                {selectedRegistration.requirements && Array.isArray(selectedRegistration.requirements) && (
                  <>
                    <div className="border-t border-midnight-700 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
                      <div className="space-y-4">
                        {selectedRegistration.requirements.map((req, idx) => (
                          <div key={idx} className="bg-midnight-900 rounded-lg p-4 border border-midnight-700">
                            <p className="text-gold text-sm font-semibold mb-3">Requirement {idx + 1}</p>

                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-text-muted mb-1">City/Locality</p>
                                <p className="text-text-primary">{req.preferredCity || 'N/A'}</p>
                              </div>

                              <div>
                                <p className="text-text-muted mb-1">Budget</p>
                                <p className="text-text-primary">{req.budget || 'N/A'}</p>
                              </div>

                              <div>
                                <p className="text-text-muted mb-1">Property Type</p>
                                <p className="text-text-primary">
                                  {Array.isArray(req.propertyType) && req.propertyType.length > 0
                                    ? req.propertyType.join(', ')
                                    : 'N/A'}
                                </p>
                              </div>

                              <div>
                                <p className="text-text-muted mb-1">Requirement Type</p>
                                <p className="text-text-primary capitalize">{req.requirementType || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserRegistrations;
