import api from "@/lib/api";

function apiPathFromDocumentUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const url = new URL(pathOrUrl);
    return `${url.pathname}${url.search}`;
  }

  return pathOrUrl;
}

function storedFileNameFromUrl(pathOrUrl: string): string {
  const path = apiPathFromDocumentUrl(pathOrUrl).split("?")[0] ?? "";
  return decodeURIComponent(path.split("/").pop() ?? "");
}

export function documentDisplayName(pathOrUrl: string | null, fallback: string): string {
  if (!pathOrUrl) {
    return fallback;
  }

  const storedName = storedFileNameFromUrl(pathOrUrl);
  const parts = storedName.split("_");

  if (parts.length >= 4) {
    return parts.slice(3).join("_") || fallback;
  }

  return storedName || fallback;
}

export async function openAuthenticatedDocument(pathOrUrl: string): Promise<void> {
  const targetWindow = window.open("about:blank", "_blank");

  try {
    const response = await api.get<Blob>(apiPathFromDocumentUrl(pathOrUrl), {
      responseType: "blob",
    });

    const responseContentType = response.headers["content-type"];
    const contentType =
      typeof responseContentType === "string"
        ? responseContentType
        : response.data.type || "application/octet-stream";
    const blob = new Blob([response.data], { type: contentType });
    const objectUrl = URL.createObjectURL(blob);

    if (targetWindow) {
      targetWindow.location.href = objectUrl;
    } else {
      window.open(objectUrl, "_blank");
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    targetWindow?.close();
    throw error;
  }
}
