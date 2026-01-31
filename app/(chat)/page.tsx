"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default function Page() {
  const [id] = useState(() => generateUUID());

  return <Chat id={id} initialMessages={[]} key={id} />;
}
