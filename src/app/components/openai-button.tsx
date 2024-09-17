"use client";
import { useFormStatus } from "react-dom";

export default function OpenaiButton({ uploading }: { uploading: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={uploading || pending}>
      OpenAI分析
    </button>
  );
}
