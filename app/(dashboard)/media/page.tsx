import { ModuleUnavailable } from "@/components/ui/module-unavailable";

export default function MediaPage() {
  return (
    <ModuleUnavailable
      title="Médias"
      description="Bibliothèque partagée des images et documents."
      endpoints={[
        "GET /media",
        "POST /media",
        "DELETE /media/{id}",
      ]}
    />
  );
}
