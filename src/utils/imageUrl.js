// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    // Return a placeholder SVG instead of null to avoid errors
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMzAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1NlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb3BlcnR5IEltYWdlPC90ZXh0Pjwvc3Zz4KPC9zdmc+';
  }

  // If already a data URI, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  

  // Get API base URL (remove /api suffix if present)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Ensure image path starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${path}`;
};

