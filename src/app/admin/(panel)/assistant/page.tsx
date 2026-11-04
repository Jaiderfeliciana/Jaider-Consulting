import AssistantCard from "@/components/admin/AssistantCard";
import InsightsCard from "@/components/admin/InsightsCard";
import { PageHead } from "@/components/admin/Bits";
import { isAssistantConfigured } from "@/lib/admin/assistant";

export default function AssistantPage() {
  const connected = isAssistantConfigured();
  return (
    <>
      <PageHead icon="bolt" title="AI Assistant" sub="Grok knows your clients, payments, tasks and bookings. Ask it anything about your business." />
      <div className="assistant-page">
        <AssistantCard connected={connected} />
        <InsightsCard connected={connected} tip="Run an analysis and Grok will look at your revenue, clients and tasks and suggest what to focus on this week." />
      </div>
    </>
  );
}
