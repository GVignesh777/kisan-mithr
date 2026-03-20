import React from 'react';
import AdminDiseaseReports from './AdminDiseaseReports';

// Often 'Image Moderation' refers broadly to all uploaded imagery.
// For Kisan Mithr, disease report images are the primary uploads.
// We can wrap the diseased reports page for now as they heavily overlap, 
// or implement a general image gallery view if separate models were created.

const AdminImageModeration = () => {
  return (
    <div>
       <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Global Image Moderation</h2>
          <p className="text-gray-500 text-sm mt-1">Review all visual media uploaded to the platform for appropriateness.</p>
       </div>
       {/* For full implementation, this would fetch from the /images route. 
           We'll reuse DiseaseReports structure conceptually here. */}
       <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-8">
         <p className="text-sm font-medium text-amber-800">Note: Currently, image moderation operates primarily through the Disease Reports dashboard.</p>
       </div>
       <AdminDiseaseReports />
    </div>
  );
};

export default AdminImageModeration;
