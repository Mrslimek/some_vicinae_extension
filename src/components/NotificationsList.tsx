import {
  List,
  ActionPanel,
  Action,
  Color,
  showToast,
  Clipboard,
} from "@vicinae/api";
import {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationUrgencyColor,
} from "../utils/dunst";
import type { Notification } from "../types";
import { AppIcons } from "../utils/icons";

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  onRefresh: () => void;
}

/**
 * Component for displaying dunst notification history
 * Shows a searchable list of notifications with copy and refresh actions
 */
export function NotificationsList({
  notifications,
  isLoading,
  onRefresh,
}: NotificationsListProps) {
  const getUrgencyColor = (urgency: string): Color => {
    switch (urgency) {
      case "CRITICAL":
        return Color.Red;
      case "NORMAL":
        return Color.Blue;
      case "LOW":
        return Color.SecondaryText;
      default:
        return Color.SecondaryText;
    }
  };

  const handleCopyNotification = async (notification: Notification) => {
    const text = `[${notification.appname}] ${notification.summary}\n\n${notification.body}`;
    await Clipboard.copy(text);
    showToast({ title: "Copied to clipboard" });
  };

  const handleCopyMessage = async (message: string) => {
    await Clipboard.copy(message);
    showToast({ title: "Message copied" });
  };

  return (
    <List
      searchBarPlaceholder="Search notifications..."
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={AppIcons.Refresh}
            onAction={onRefresh}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    >
      {notifications.length === 0 ? (
        <List.EmptyView
          title="No notifications found"
          description="Dunst notification history is empty or dunst is not running"
          icon={AppIcons.Info}
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                icon={AppIcons.Refresh}
                onAction={onRefresh}
              />
            </ActionPanel>
          }
        />
      ) : (
        notifications.map((notification) => (
          <List.Item
            key={notification.id}
            title={notification.summary || "No summary"}
            subtitle={notification.body}
            accessories={[
              {
                text: notification.appname,
                icon: getNotificationIcon(
                  notification.appname,
                  notification.icon_path,
                ),
              },
              {
                text: formatNotificationTime(notification.timestamp),
              },
            ]}
            icon={{
              source: getNotificationIcon(
                notification.appname,
                notification.icon_path,
              ),
              tintColor: getUrgencyColor(notification.urgency),
            }}
            actions={
              <ActionPanel>
                <Action
                  title="Copy Notification"
                  icon={AppIcons.Copy}
                  onAction={() => handleCopyNotification(notification)}
                />
                <Action
                  title="Copy Full Message"
                  icon={AppIcons.Copy}
                  onAction={() => handleCopyMessage(notification.message)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
                <ActionPanel.Section title="Metadata">
                  <Action
                    title={`App: ${notification.appname}`}
                    icon={AppIcons.Desktop}
                    onAction={() => {}}
                  />
                  <Action
                    title={`Urgency: ${notification.urgency}`}
                    icon={AppIcons.Info}
                    onAction={() => {}}
                  />
                  {notification.category && (
                    <Action
                      title={`Category: ${notification.category}`}
                      icon={AppIcons.List}
                      onAction={() => {}}
                    />
                  )}
                </ActionPanel.Section>
                <ActionPanel.Section title="Actions">
                  <Action
                    title="Refresh All"
                    icon={AppIcons.Refresh}
                    onAction={onRefresh}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
