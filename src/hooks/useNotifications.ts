import { useState, useEffect, useCallback } from "react";
import { getDunstNotifications } from "../utils/dunst";
import type { Notification } from "../types";

const NOTIFICATION_UPDATE_INTERVAL = 10000; // Update every 10 seconds

/**
 * Custom hook to manage dunst notifications
 * Fetches notification history from dunst and provides refresh functionality
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getDunstNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    refresh: fetchNotifications,
  };
}
