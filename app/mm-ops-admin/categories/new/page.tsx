"use client";

import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader title="New Category" subtitle="A new section for the menu" />
      <CategoryForm
        mode="create"
        initial={{ id: "", slug: "", name: "", emoji: "", sortOrder: 0, isVisible: true }}
      />
    </>
  );
}
