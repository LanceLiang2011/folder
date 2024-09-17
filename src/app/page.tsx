"use client";
import React, { useEffect, useState } from "react";
import { analyzeFileName } from "./actions";
import { useFormState, useFormStatus } from "react-dom";
import OpenaiButton from "./components/openai-button";

export default function Home() {
  const [folderData, setFolderData] = useState([]);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePickFolder = async () => {
    setUploading(true);
    try {
      // Check if the browser supports the File System Access API
      if (!window.showDirectoryPicker) {
        throw new Error(
          "Your browser does not support the File System Access API."
        );
      }
      // Open directory picker
      const dirHandle = await window.showDirectoryPicker();
      const folders: any = [];
      // Start recursive traversal
      await traverseDirectory(dirHandle, "", folders);
      setFolderData(folders);
    } catch (err: any) {
      setError(err.message);
      console.error("Error picking directory:", err);
    } finally {
      setUploading(false);
    }
  };

  const traverseDirectory = async (dirHandle: any, path: any, folders: any) => {
    // Add current directory to the folders list
    const currentPath = path ? `${path}/${dirHandle.name}` : dirHandle.name;
    folders.push({ name: dirHandle.name, path: currentPath });

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "directory") {
        // Recurse into subdirectory
        await traverseDirectory(handle, currentPath, folders);
      }
    }
  };

  // Function to convert JSON to CSV
  const jsonToCsv = (jsonData: any) => {
    const items = jsonData.events;
    if (!items || items.length === 0) {
      return "";
    }
    const header = Object.keys(items[0]);
    const csv = [
      header.join(","), // header row first
      ...items.map((row: any) =>
        header
          .map((fieldName) =>
            JSON.stringify(row[fieldName]).replace(/^"|"$/g, "")
          )
          .join(",")
      ),
    ].join("\r\n");

    return csv;
  };

  const [state, formAction] = useFormState(analyzeFileName, {
    message: "",
  });

  // Effect to generate CSV URL when state.message changes
  useEffect(() => {
    if (state.message) {
      try {
        const jsonData = JSON.parse(state.message);
        const csvData = jsonToCsv(jsonData);
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        setCsvUrl(url);
      } catch (err) {
        console.error("Error parsing JSON or generating CSV:", err);
      }
    }
  }, [state.message]);

  return (
    <div>
      <main>
        {!uploading && <p>选择一个文件夹，获得全部子文件夹的名称和路径</p>}
        {uploading && <p>正在上传...</p>}
        <button disabled={uploading} onClick={handlePickFolder}>
          选择文档
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <br />
        <br />
        <form action={formAction}>
          <input
            type="hidden"
            name="files"
            value={JSON.stringify(folderData.map((f: any) => f.name))}
          />
          <OpenaiButton uploading={uploading} />
        </form>
        {csvUrl && (
          <a href={csvUrl} download="events.csv">
            下载CSV文件
          </a>
        )}
        {state.message && <p>{state.message}</p>}
        <p>共{folderData.length}个文件夹</p>
        <pre>{JSON.stringify(folderData, null, 2)}</pre>
      </main>
      <footer>@LanceXLiang</footer>
    </div>
  );
}
