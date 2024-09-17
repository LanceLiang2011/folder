"use server";

export async function analyzeFileName(prevState: any, formData: FormData) {
  const files = formData.get("files");

  if (!files) {
    throw new Error("No files provided");
  }

  // Parse the files string to get an array of filenames
  const filenames = JSON.parse(files.toString());

  const events: any = [];

  // List of Chinese provinces, municipalities, autonomous regions, and special administrative regions
  const provinces = [
    "北京市",
    "天津市",
    "上海市",
    "重庆市",
    "河北省",
    "山西省",
    "辽宁省",
    "吉林省",
    "黑龙江省",
    "江苏省",
    "浙江省",
    "安徽省",
    "福建省",
    "江西省",
    "山东省",
    "河南省",
    "湖北省",
    "湖南省",
    "广东省",
    "海南省",
    "四川省",
    "贵州省",
    "云南省",
    "陕西省",
    "甘肃省",
    "青海省",
    "内蒙古",
    "广西",
    "西藏",
    "宁夏",
    "新疆",
    "香港",
    "澳门",
    "台湾",
  ];

  filenames.forEach((filename: any) => {
    // Remove leading numbers (e.g., dates)
    const nameWithoutNumbers = filename.replace(/^\d+/, "").trim();

    // Split the remaining string by spaces
    const parts = nameWithoutNumbers.split(/\s+/);

    // Check if we have at least three parts
    if (parts.length >= 3) {
      let [locationFull, people, cause] = parts;

      // Attempt to extract the province name from locationFull
      let province = provinces.find((prov) => locationFull.startsWith(prov));

      if (!province) {
        // Remove suffixes like "省", "市", "自治区", "特别行政区" for matching
        for (let prov of provinces) {
          let provShort = prov.replace(/(省|市|自治区|特别行政区)$/, "");
          if (locationFull.startsWith(provShort)) {
            province = prov;
            break;
          }
        }
      }

      if (!province) {
        // If still not found, default to the first two characters
        console.warn(`Province not found in location "${locationFull}".`);
        province = locationFull.substring(0, 2) + "省";
      }

      events.push({
        location: province,
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
