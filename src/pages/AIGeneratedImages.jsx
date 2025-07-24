import React, { useEffect, useState } from 'react';

export default function AIGeneratedImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://cakestory-be.onrender.com/api/ai/images', {
          headers: {
            'accept': '*/*',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJzb25ndGhhbmciLCJlbWFpbCI6InNvbmd0aGFuZ0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImZpcmViYXNlVWlkIjoiUWIwUVhVcDM1U1RNRUJZWlg2WFp1bHRUODFyMiIsImlhdCI6MTc1MzM1MjUwMiwiZXhwIjoxNzUzNDM4OTAyfQ.zD9PR651DBsYBpFiKkjPPjSfWzRC5TEzDqSfepX9m5M',
          },
        });
        const data = await res.json();
        if (data && data.data) {
          setImages(data.data);
        } else {
          setError('Không lấy được ảnh.');
        }
      } catch (err) {
        setError('Có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">AI Generated Cake Gallery</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:shadow-2xl transition-shadow duration-200">
              <img src={img.image_url} alt={img.prompt} className="rounded-lg max-h-56 object-contain mb-3" />
              <div className="text-xs text-gray-500 mb-1 truncate w-full text-center" title={img.prompt}>{img.prompt}</div>
              <div className="text-[10px] text-gray-400">{new Date(img.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
