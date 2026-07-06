"use client";

import { MediaManager } from "@/components/admin/MediaManager";
import { PageHeader } from "@/components/admin/ui";

export default function MediaPage() {
  return (
    <>
      <PageHeader title="Media" subtitle="Every image in storage — upload, copy URLs, and delete" />
      <MediaManager />
    </>
  );
}
