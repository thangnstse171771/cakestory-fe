import React, { useState, useEffect } from 'react';

const HIDDEN_PROMPT =
  'Close-up, eye-level shot of a cake on a stand, with soft, even lighting and a simple, blurred background. The focus is on the cake\'s presentation, highlighting its details elegantly of';

const defaultFields = {
  name: '',
  color: '',
  layers: '',
  theme: '',
};

export default function AICakeGeneratorModal({ open, onClose }) {
  const [fields, setFields] = useState(defaultFields);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [recentImages, setRecentImages] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  // Fetch 3 latest images when modal opens
  useEffect(() => {
    if (!open) return;
    setLoadingRecent(true);
    fetch('https://cakestory-be.onrender.com/api/ai/images', {
      headers: {
        'accept': '*/*',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJzb25ndGhhbmciLCJlbWFpbCI6InNvbmd0aGFuZ0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImZpcmViYXNlVWlkIjoiUWIwUVhVcDM1U1RNRUJZWlg2WFp1bHRUODFyMiIsImlhdCI6MTc1MzM1MjUwMiwiZXhwIjoxNzUzNDM4OTAyfQ.zD9PR651DBsYBpFiKkjPPjSfWzRC5TEzDqSfepX9m5M',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setRecentImages(data.data.slice(0, 3));
        } else {
          setRecentImages([]);
        }
      })
      .catch(() => setRecentImages([]))
      .finally(() => setLoadingRecent(false));
  }, [open, image]);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImage(null);
    // Compose prompt
    const prompt = `${HIDDEN_PROMPT} ${fields.name ? 'Tên bánh: ' + fields.name + '. ' : ''}${fields.color ? 'Màu sắc: ' + fields.color + '. ' : ''}${fields.layers ? 'Số tầng: ' + fields.layers + '. ' : ''}${fields.theme ? 'Chủ đề: ' + fields.theme + '.' : ''}`;
    try {
      // Gửi POST để bắt đầu tạo ảnh
      const res = await fetch('https://cakestory-be.onrender.com/api/ai/generate', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJzb25ndGhhbmciLCJlbWFpbCI6InNvbmd0aGFuZ0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImZpcmViYXNlVWlkIjoiUWIwUVhVcDM1U1RNRUJZWlg2WFp1bHRUODFyMiIsImlhdCI6MTc1MzM1MjUwMiwiZXhwIjoxNzUzNDM4OTAyfQ.zD9PR651DBsYBpFiKkjPPjSfWzRC5TEzDqSfepX9m5M',
        },
        body: JSON.stringify({ prompt }),
      });
      // Sau khi gửi POST, poll API images để lấy ảnh mới nhất
      let found = false;
      let pollCount = 0;
      let lastImageUrl = null;
      while (!found && pollCount < 30) { // tối đa ~30s
        await new Promise((r) => setTimeout(r, 1000));
        pollCount++;
        const imgRes = await fetch('https://cakestory-be.onrender.com/api/ai/images', {
          headers: {
            'accept': '*/*',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJzb25ndGhhbmciLCJlbWFpbCI6InNvbmd0aGFuZ0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImZpcmViYXNlVWlkIjoiUWIwUVhVcDM1U1RNRUJZWlg2WFp1bHRUODFyMiIsImlhdCI6MTc1MzM1MjUwMiwiZXhwIjoxNzUzNDM4OTAyfQ.zD9PR651DBsYBpFiKkjPPjSfWzRC5TEzDqSfepX9m5M',
          },
        });
        const imgData = await imgRes.json();
        if (imgData && imgData.data && imgData.data.length > 0) {
          // Tìm ảnh mới nhất có prompt giống prompt vừa gửi
          const match = imgData.data.find((img) => img.prompt && img.prompt.includes(fields.name));
          if (match && match.image_url !== lastImageUrl) {
            setImage(match.image_url);
            found = true;
            break;
          }
          lastImageUrl = imgData.data[0].image_url;
        }
      }
      if (!found) {
        setError('Tạo ảnh quá lâu, vui lòng thử lại sau.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-center">AI Cake Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={fields.name} onChange={handleChange} placeholder="Tên bánh (ví dụ: Bánh sinh nhật)" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          <input name="color" value={fields.color} onChange={handleChange} placeholder="Màu sắc chủ đạo (ví dụ: Hồng, xanh, neon...)" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          <input name="layers" value={fields.layers} onChange={handleChange} placeholder="Số tầng (ví dụ: 1, 2, 3...)" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          <input name="theme" value={fields.theme} onChange={handleChange} placeholder="Chủ đề (ví dụ: Robot, hoạt hình, sinh nhật...)" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold py-2 rounded shadow hover:from-pink-500 hover:to-purple-500 transition-all duration-200">
            {loading ? 'Đang tạo ảnh...' : 'Tạo ảnh AI'}
          </button>
        </form>
        {error && <div className="text-red-500 mt-3 text-center">{error}</div>}
        {loading && (
          <div className="flex flex-col items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mb-2"></div>
            <div className="text-pink-500 text-sm">Đang tạo ảnh, vui lòng đợi...</div>
          </div>
        )}
        {image && !loading && (
          <div className="mt-6 flex flex-col items-center">
            <img src={image} alt="AI Cake" className="rounded-lg shadow-lg max-h-64 object-contain" />
            <a href={image} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-500 underline">Xem ảnh lớn</a>
          </div>
        )}
        {/* Recent images preview */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700 text-sm">Ảnh AI gần đây</span>
            <button type="button" onClick={() => window.location.href='/ai-generated-images'} className="text-xs text-pink-500 hover:underline bg-transparent border-0 p-0">Xem tất cả</button>
          </div>
          {loadingRecent ? (
            <div className="flex flex-col items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-400 mb-2"></div>
              <div className="text-xs text-gray-400">Đang tải ảnh...</div>
            </div>
          ) : recentImages.length === 0 ? (
            <div className="flex flex-col items-center py-4">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#e5e7eb"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M8 15h8M9 10h.01M15 10h.01" strokeWidth="2" strokeLinecap="round" /></svg>
              <div className="text-xs text-gray-400 mt-2">Chưa có ảnh nào.</div>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              {recentImages.map((img) => (
                <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={img.image_url} alt={img.prompt} className="w-20 h-20 object-cover rounded-lg border hover:scale-105 transition-transform" title={img.prompt} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
