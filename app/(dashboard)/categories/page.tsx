import { ModuleUnavailable } from "@/components/ui/module-unavailable";

export default function CategoriesPage() {
  return (
    <ModuleUnavailable
      title="Catégories & tags"
      description="Classement des articles par catégorie et par tag."
      endpoints={[
        "GET /categories",
        "POST /categories",
        "PUT /categories/{id}",
        "DELETE /categories/{id}",
        "GET /tags",
        "POST /tags",
      ]}
    />
  );
}
