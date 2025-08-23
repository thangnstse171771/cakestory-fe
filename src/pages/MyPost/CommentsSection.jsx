// components/CommentsSection.jsx

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { authAPI } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import DeleteCommentPopup from "./DeleteCommentPopup";
import { toast } from "react-toastify";

const CommentsSection = ({ postId, challengeStatus }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);

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

    if (newComment.length > MAX_COMMENT_LENGTH) {
      toast.error(`Bình luận không được vượt quá ${MAX_COMMENT_LENGTH} ký tự.`);
      return;
    }

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingContent.trim()) return;

    if (editingContent.length > MAX_COMMENT_LENGTH) {
      toast.error(`Bình luận không được vượt quá ${MAX_COMMENT_LENGTH} ký tự.`);
      return;
    }

    setEditing(true);
    try {
      await authAPI.editComment(editingCommentId, { content: editingContent });
      setEditingCommentId(null);
      setEditingContent("");
      fetchComments();
    } catch (error) {
      console.error("Failed to edit comment", error);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentIdToDelete) return;
    setDeleting(true);
    try {
      await authAPI.deleteComment(commentIdToDelete);
      fetchComments();
    } catch (error) {
      console.error("Failed to delete comment", error);
      toast.error("Xóa bình luận thất bại.");
    } finally {
      setDeleting(false);
      setIsPopupOpen(false);
      setCommentIdToDelete(null);
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const MAX_COMMENT_LENGTH = 500;

  return (
    <div className="flex flex-col h-full">
      <div className="text-gray-500 text-sm mb-2">Bình luận</div>

      {/* Scrollable Comments */}
      <div className="space-y-2 flex-1 max-h-[310px] overflow-y-auto pr-2">
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
                    {comment.User?.username || "Anonymous"}
                  </span>

                  {editingCommentId === comment.id ? (
                    <form
                      onSubmit={handleEditSubmit}
                      className="flex gap-2 items-center mt-1"
                    >
                      <input
                        type="text"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        maxLength={MAX_COMMENT_LENGTH}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />

                      {/* Actions + counter in one row */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent("");
                          }}
                          className="text-sm text-gray-400 hover:underline"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="text-sm text-blue-500 hover:underline"
                          disabled={
                            editing ||
                            (challengeStatus && challengeStatus !== "onGoing")
                          }
                        >
                          {editing ? "Đang tải..." : "Lưu"}
                        </button>
                        <div
                          className={`text-sm  ${
                            editingContent.length > MAX_COMMENT_LENGTH * 0.8
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          {editingContent.length}/{MAX_COMMENT_LENGTH}
                        </div>
                      </div>
                    </form>
                  ) : (
                    <p className="text-gray-700 text-sm whitespace-pre-line break-all">
                      {comment.content}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="text-xs">
                      {dayjs(comment.created_at).fromNow()}
                    </span>
                    {comment.User?.id === currentUserId && (
                      <>
                        <button
                          onClick={() => handleEditClick(comment)}
                          className={`${
                            challengeStatus && challengeStatus !== "onGoing"
                              ? "text-gray-400 cursor-not-allowed"
                              : "hover:underline cursor-pointer"
                          }`}
                          disabled={
                            challengeStatus && challengeStatus !== "onGoing"
                          }
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => {
                            setCommentIdToDelete(comment.id);
                            setIsPopupOpen(true);
                          }}
                          className={`${
                            challengeStatus && challengeStatus !== "onGoing"
                              ? "text-gray-400 cursor-not-allowed"
                              : "hover:underline text-red-500 cursor-pointer"
                          }`}
                          disabled={
                            challengeStatus && challengeStatus !== "onGoing"
                          }
                        >
                          Xóa
                        </button>
                      </>
                    )}
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
        className="flex flex-col gap-2 pt-3 border-t border-gray-200 mt-2"
      >
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Hãy viết gì đó..."
            disabled={challengeStatus && challengeStatus !== "onGoing"}
            maxLength={MAX_COMMENT_LENGTH}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          {newComment.length > 0 && (
            <span
              className={`text-xs ${
                newComment.length > MAX_COMMENT_LENGTH * 0.8
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {newComment.length}/{MAX_COMMENT_LENGTH}
            </span>
          )}

          <button
            type="submit"
            disabled={
              loading || (challengeStatus && challengeStatus !== "onGoing")
            }
            className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            {loading ? "Đang tải..." : "Đăng"}
          </button>
        </div>
      </form>

      <DeleteCommentPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onDelete={handleDeleteComment}
        loading={deleting}
      />
    </div>
  );
};

export default CommentsSection;
