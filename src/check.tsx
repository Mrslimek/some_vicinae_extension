import {
  Detail,
  List,
  Icon,
  Color,
  Action,
  ActionPanel,
  showToast,
  LocalStorage,
  Form,
  useNavigation,
} from "@vicinae/api";
import { useState, useEffect, useCallback } from "react";

// --- MAIN DASHBOARD COMPONENT ---
export default function InfiniteDashboard() {
  const [notes, setNotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();
  const [now, setNow] = useState(new Date());

  // Загрузка
  useEffect(() => {
    async function load() {
      const saved = await LocalStorage.getItem<string>("dashboard_notes");
      if (saved) setNotes(JSON.parse(saved));
      setIsLoading(false);
    }
    load();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Функция сохранения (передадим её в другие экраны)
  const saveNotes = useCallback(async (newNotes: string[]) => {
    setNotes([...newNotes]);
    await LocalStorage.setItem("dashboard_notes", JSON.stringify(newNotes));
  }, []);

  const timeStr = now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'long' });

  // Генерируем Markdown (просто список, без чекбоксов)
  let content = "";
  if (notes.length === 0) {
    content = "_No notes yet. Press Enter to add one._";
  } else {
    content = notes.map((note) => `* ${note}`).join("\n\n");
  }

  const fullMarkdown = `
# 📝 Workspace Notes
---
${content}
  `;

  return (
    <Detail
      key={notes.length} // Force re-render при изменении количества
      isLoading={isLoading}
      markdown={fullMarkdown}
      actions={
        <ActionPanel>
          <Action
            title="Add Note"
            icon={Icon.Plus}
            onAction={() => push(<AddNoteForm currentNotes={notes} onSave={saveNotes} />)}
          />
          
          {/* Кнопка для открытия менеджера заметок */}
          <Action
            title="Manage / Delete Notes"
            icon={Icon.List}
            onAction={() => push(<NotesManager notes={notes} onSave={saveNotes} />)}
          />

          <ActionPanel.Section title="Danger Zone">
            <Action
              title="Clear All"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              onAction={async () => {
                await saveNotes([]);
                showToast({ title: "All cleared" });
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Time" text={timeStr} icon={Icon.Clock} />
          <Detail.Metadata.Label title="Date" text={dateStr} icon={Icon.Calendar} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="User" text={process.env.USER || "vick"} icon={Icon.Person} />
          <Detail.Metadata.Label title="Host" text="hyprland" icon={Icon.Computer} />
          <Detail.Metadata.Label title="OS" text="Arch Linux" icon={Icon.Globe} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title="Statistics">
            <Detail.Metadata.TagList.Item 
              text={`${notes.length} notes`} 
              color={notes.length > 0 ? Color.Blue : Color.SecondaryText} 
            />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}

// --- SCREEN 2: ADD NOTE FORM ---
function AddNoteForm({ currentNotes, onSave }: { currentNotes: string[], onSave: (n: string[]) => void }) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm 
            title="Save Note" 
            onSubmit={(values: { noteText: string }) => {
              if (values.noteText.trim()) {
                onSave([values.noteText.trim(), ...currentNotes]);
                showToast({ title: "Note added" });
                pop();
              }
            }} 
          />
        </ActionPanel>
      }
    >
      <Form.TextArea id="noteText" title="Content" placeholder="Write something..." />
    </Form>
  );
}

// --- SCREEN 3: DELETE / MANAGE NOTES (LIST VIEW) ---
function NotesManager({ notes, onSave }: { notes: string[], onSave: (n: string[]) => void }) {
  // Локальный стейт для мгновенного обновления списка при удалении
  const [localNotes, setLocalNotes] = useState(notes);

  const handleDelete = (indexToDelete: number) => {
    const newNotes = localNotes.filter((_, index) => index !== indexToDelete);
    setLocalNotes(newNotes); // Обновляем этот экран
    onSave(newNotes);        // Обновляем хранилище и главный экран
    showToast({ title: "Deleted" });
  };

  return (
    <List searchBarPlaceholder="Search notes to delete...">
      {localNotes.length === 0 ? (
        <List.EmptyView title="No notes found" icon={Icon.Checkmark} />
      ) : (
        localNotes.map((note, index) => (
          <List.Item
            key={index} // В идеале нужен уникальный ID, но для простых строк сойдет индекс
            title={note}
            icon={Icon.Circle}
            actions={
              <ActionPanel>
                <Action
                  title="Delete Note"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => handleDelete(index)}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
