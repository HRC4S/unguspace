"use client";

import { createContext, useContext, useState } from "react";

const PostComposerContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
}>({
  open: false,
  setOpen: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  pendingFile: null,
  setPendingFile: () => {},
});

export function PostComposerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <PostComposerContext.Provider
      value={{ open, setOpen, refreshKey, triggerRefresh, pendingFile, setPendingFile }}
    >
      {children}
    </PostComposerContext.Provider>
  );
}

export const usePostComposer = () => useContext(PostComposerContext);