const USER_ID_KEY = "you-i-user-id";
const PROJECT_NAME_KEY = "you-i-project-name";
const DRAFT_KEY = "you-i-draft";

export function getOrCreateUserId(): string {
  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(USER_ID_KEY, id);
  return id;
}

export function getSavedProjectName(): string | null {
  return window.localStorage.getItem(PROJECT_NAME_KEY);
}

export function saveProjectName(name: string) {
  window.localStorage.setItem(PROJECT_NAME_KEY, name);
}

export function rememberDraft(draft: unknown) {
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function readDraft<T>(): T | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
