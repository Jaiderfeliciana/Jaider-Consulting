import { NotConnected, PageHead } from "@/components/admin/Bits";
import { AddTaskForm, TaskRows } from "@/components/admin/TaskList";
import { getTasks } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";

export default async function TasksPage() {
  const tasks = await fromDb(getTasks);
  if (!("data" in tasks)) {
    return <><PageHead icon="check" title="Tasks" /><NotConnected what="The database" error={"error" in tasks ? tasks.error : undefined} /></>;
  }
  const open = tasks.data.filter((t) => !t.done), done = tasks.data.filter((t) => t.done);
  return (
    <>
      <PageHead icon="check" title="Tasks" sub={`${open.length} open · ${done.length} done`} />
      <div className="card">
        <h2>Add a task</h2>
        <AddTaskForm />
      </div>
      <div className="card">
        <h2>To do</h2>
        {open.length ? <TaskRows tasks={open} canDelete /> : <p className="muted">Nothing to do. Nice work!</p>}
      </div>
      {done.length > 0 && (
        <div className="card">
          <h2>Done</h2>
          <TaskRows tasks={done} canDelete />
        </div>
      )}
    </>
  );
}
