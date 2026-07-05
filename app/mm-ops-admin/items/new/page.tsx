"use client";

import { useEffect, useState } from "react";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { ItemForm } from "@/components/admin/ItemForm";
import { PageHeader } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MenuData } from "@/lib/types";

export default function NewItemPage() {
  const api = useAdminApi();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<MenuData>("/api/admin/menu")
      .then(setMenu)
      .catch((e) => setError(e.message));
  }, [api]);

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!menu) {
    return (
      <>
        <PageHeader title="New Item" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="New Item" subtitle="Create a dish and see exactly how it will look" />
      <ItemForm
        mode="create"
        categories={menu.categories}
        initial={{
          id: "",
          categoryId: menu.categories.find((c) => !c.deletedAt)?.id ?? "",
          name: "",
          price: 0,
          description: "",
          image: "",
          tags: "",
          status: "available",
          isVisible: true,
        }}
      />
    </>
  );
}
