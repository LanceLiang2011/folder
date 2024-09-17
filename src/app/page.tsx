"use client";
import React, { useState } from "react";
import { analyzeFileName } from "./actions";

export default function Home() {
  const [folderData, setFolderData] = useState([]);
  const [error, setError] = useState(null);

  const handlePickFolder = async () => {
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
        <button onClick={handlePickFolder}>Select Folder</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <pre>{JSON.stringify(folderData, null, 2)}</pre>
        <form action={analyzeFileNameWithData}>
          <button type="submit">Submit</button>
        </form>
      </main>
      <footer>@LanceXLiang</footer>
    </div>
  );
}
