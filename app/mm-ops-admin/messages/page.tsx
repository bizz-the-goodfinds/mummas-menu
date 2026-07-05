"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import { MessagesTab } from "@/components/admin/MessagesTab";
import { PageHeader } from "@/components/admin/ui";

export default function MessagesPage() {
  const { token } = useAdmin();
  return (
    <>
      <PageHeader
        title="WhatsApp Messages"
        subtitle="Templates used for orders, inquiries, and support chats"
      />
      <MessagesTab token={token} />
    </>
  );
}
