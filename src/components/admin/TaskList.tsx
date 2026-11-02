import { addTask, removeTask, toggleTask } from "@/app/admin/actions";
import type { Task } from "@/lib/admin/data";
import { dayKey, shortDate } from "@/lib/admin/dates";
import ConfirmButton from "./ConfirmButton";
import Icon from "./Icon";

function dueLabel(due: string) {
  if (!due) return null;
  const today = dayKey();
  const t = new Date(`${today}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 1);
  if (due < today) return { text: `Overdue · ${shortDate(due)}`, cls: "due-late" };
  if (due === today) return { text: "Today", cls: "due-today" };
  if (due === t.toISOString().slice(0, 10)) return { text: "Tomorrow", cls: "due-soon" };
  return { text: shortDate(due), cls: "" };
}

// Task rows with a tick box; `canDelete` adds a delete button (full Tasks page).
export function TaskRows({ tasks, canDelete = false }: { tasks: Task[]; canDelete?: boolean }) {
  return (
    <ul className="tasks">
      {tasks.map((t) => {
        const due = dueLabel(t.due);
        return (
          <li key={t.id} className={t.done ? "is-done" : undefined}>
            <form action={toggleTask}>
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" className="tick" aria-label={t.done ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`} aria-pressed={t.done}>
                {t.done && <Icon name="check" size={14} />}
              </button>
            </form>
            <span className="task-title">{t.title}</span>
            {due && <span className={`due ${due.cls}`}><Icon name="calendar" size={14} /> {due.text}</span>}
            {canDelete && (
              <form action={removeTask}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmButton message={`Delete "${t.title}"?`}>Delete</ConfirmButton>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AddTaskForm() {
  return (
    <form action={addTask} className="task-add">
      <input name="title" required maxLength={160} placeholder="New task…" aria-label="New task" />
      <input name="due" type="date" aria-label="Due date" defaultValue={dayKey()} />
      <button type="submit" aria-label="Add task"><Icon name="arrow" size={18} /></button>
    </form>
  );
}
