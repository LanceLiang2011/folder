"use server";
import { z } from "zod";

export async function analyzeFileName(prevState: any, formData: FormData) {
  const files = formData.get("files");
  console.log({ files });

  if (!files) {
    throw new Error("No files provided");
  }

  // Parse the files string to get an array of filenames
  const filenames = JSON.parse(files.toString());

  const events: any = [];

  filenames.forEach((filename: any) => {
    // Remove leading numbers (e.g., dates)
    const nameWithoutNumbers = filename.replace(/^\d+/, "").trim();

    // Split the remaining string by spaces
    const parts = nameWithoutNumbers.split(/\s+/);

    // Check if we have at least three parts
    if (parts.length >= 3) {
      const [location, people, cause] = parts;

      events.push({
        location: location,
        people: people,
        cause: cause,
      });
    } else {
      // Handle cases where there are less than 3 parts
      console.warn(
        `Filename "${filename}" does not have enough parts to extract data.`
      );
    }
  });

  const responseData = {
    events: events,
  };

  // Return the data as a JSON string to keep the return data consistent
  return { message: JSON.stringify(responseData) };
}
