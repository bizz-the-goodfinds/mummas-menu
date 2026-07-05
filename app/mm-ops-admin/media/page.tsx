"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { MediaTab } from "@/components/admin/MediaTab";
import { PageHeader } from "@/components/admin/ui";

export default function MediaPage() {
  const { token } = useAdmin();
  return (
    <>
      <PageHeader title="Media" subtitle="Upload images to Supabase Storage and copy their URLs" />
      <MediaTab token={token} />
    </>
  );
}
