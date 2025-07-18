// components/CommentsSection.jsx

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { authAPI } from "../../api/auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const CommentsSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await authAPI.getCommentsByPostId(postId);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const commentData = { content: newComment };
      await authAPI.createComment(postId, commentData);
      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Failed to create comment", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return (
    <div className="flex flex-col h-full mb-4">
      <div className="text-gray-500 text-sm mb-2">Comments</div>

      {/* Scrollable Comments */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="py-1 border-b border-gray-100 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                {/* Avatar */}
                <img
                  src={
                    comment.User?.avatar || "https://placehold.co/40x40?text=👤"
                  }
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover mt-1"
                />

                <div className="ml-1">
                  <span className="font-bold text-gray-800 block">
                    {comment.User?.full_name || "Anonymous"}
                  </span>

                  <p className="text-gray-700 text-sm">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">
                      <Heart className="w-4 h-4" />
                      <span>{comment.likes || 0}</span>
                    </div>
                    <div className="hover:underline cursor-pointer">
                      {comment.replies || 0}{" "}
                      {comment.replies === 1 ? "reply" : "replies"}
                    </div>
                    <span className="text-xs">
                      {dayjs(comment.created_at).fromNow()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Form (always at bottom) */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-3 border-t border-gray-200 mt-2"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CommentsSection;
