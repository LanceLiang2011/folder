"use client";
import React, { useState } from "react";
import { analyzeFileName } from "./actions";

export default function Home() {
  const [folderData, setFolderData] = useState([]);
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

  const analyzeFileNameWithData = analyzeFileName.bind(null, folderData);

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
        <form action={analyzeFileNameWithData}>
          <button type="submit" disabled={uploading}>
            交给OpenAI分析
          </button>
        </form>
        <p>共{folderData.length}个文件夹</p>
        <pre>{JSON.stringify(folderData, null, 2)}</pre>
      </main>
      <footer>@LanceXLiang</footer>
    </div>
  );
}
