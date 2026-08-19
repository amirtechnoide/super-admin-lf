import { ModuleUnavailable } from "@/components/ui/module-unavailable";

export default function CommentsPage() {
  return (
    <ModuleUnavailable
      title="Commentaires"
      description="Modération des commentaires laissés sur les articles."
      endpoints={[
        "GET /comments",
        "PUT /comments/{id}/status",
        "DELETE /comments/{id}",
      ]}
    />
  );
}
