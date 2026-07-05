"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { SiteEditor } from "@/components/admin/SiteEditor";
import { PageHeader } from "@/components/admin/ui";

export default function SitePage() {
  const { token } = useAdmin();
  return (
    <>
      <PageHeader
        title="Site Content"
        subtitle="Brand, contact details, FSSAI, business hours, and retention copy"
      />
      <SiteEditor token={token} />
    </>
  );
}
