// components/ui/modal.tsx
"use client";

import { ReactNode } from "react";
import { X } from "lucide-react"; // lucide-react je že v tvojem projektu (če ni, lahko zamenjaš z navadnim "X")
import { Button } from "@/components/ui/button";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
