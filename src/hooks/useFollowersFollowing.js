import { useState, useCallback } from "react";
import { authAPI } from "../api/auth";

export default function useFollowersFollowing(userId) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authAPI.getFollowers(userId);
      setFollowers(res.followers || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authAPI.getFollowing(userId);
      setFollowing(res.following || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    followers,
    following,
    loading,
    fetchFollowers,
    fetchFollowing,
    setFollowers,
    setFollowing,
  };
}
