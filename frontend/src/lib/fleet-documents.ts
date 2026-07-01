import api from "@/lib/api";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const SUPABASE_REF_PREFIX = "supabase://";

function isSupabaseReference(pathOrUrl: string): boolean {
  return pathOrUrl.startsWith(SUPABASE_REF_PREFIX);
}

function storagePathFromReference(reference: string): string {
  const value = reference.substring(SUPABASE_REF_PREFIX.length);
  const separator = value.indexOf("/");
  return separator >= 0 ? value.substring(separator + 1) : value;
}

function signedAccessEndpoint(reference: string): string {
  const storagePath = storagePathFromReference(reference);

  if (storagePath.startsWith("maintenance/")) {
    return `/api/maintenance/files/access?ref=${encodeURIComponent(reference)}`;
  }

  if (storagePath.startsWith("rentals/")) {
    return `/api/rentals/files/access?ref=${encodeURIComponent(reference)}`;
  }

  throw new Error("Unsupported fleet document reference.");
}

function apiPathFromDocumentUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const url = new URL(pathOrUrl);
    return `${url.pathname}${url.search}`;
  }

  return pathOrUrl;
}

function storedFileNameFromUrl(pathOrUrl: string): string {
  if (isSupabaseReference(pathOrUrl)) {
    return decodeURIComponent(storagePathFromReference(pathOrUrl).split("/").pop() ?? "");
  }

  const path = apiPathFromDocumentUrl(pathOrUrl).split("?")[0] ?? "";
  return decodeURIComponent(path.split("/").pop() ?? "");
}

export function documentDisplayName(pathOrUrl: string | null, fallback: string): string {
  if (!pathOrUrl) {
    return fallback;
  }

  const storedName = storedFileNameFromUrl(pathOrUrl);

  if (isSupabaseReference(pathOrUrl)) {
    const uuidSeparator = storedName.indexOf("_");
    return uuidSeparator > 0 ? storedName.substring(uuidSeparator + 1) : storedName || fallback;
  }

  const parts = storedName.split("_");

  if (parts.length >= 4) {
    return parts.slice(3).join("_") || fallback;
  }

  return storedName || fallback;
}

export async function openAuthenticatedDocument(pathOrUrl: string): Promise<void> {
  const targetWindow = window.open("about:blank", "_blank");

  try {
    if (isSupabaseReference(pathOrUrl)) {
      const response = await api.get<ApiResponse<string>>(signedAccessEndpoint(pathOrUrl));
      if (targetWindow) {
        targetWindow.location.href = response.data.data;
      } else {
        window.open(response.data.data, "_blank");
      }
      return;
    }

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
