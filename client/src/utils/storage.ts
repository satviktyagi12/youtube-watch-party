const USERNAME_KEY = "watch_party_username";
const HOST_USER_ID_PREFIX = "watch_party_host_";

export const saveUsername = (
  username: string
): void => {
  localStorage.setItem(
    USERNAME_KEY,
    username
  );
};

export const getSavedUsername =
  (): string | null => {
    return localStorage.getItem(
      USERNAME_KEY
    );
  };

export const removeSavedUsername =
  (): void => {
    localStorage.removeItem(
      USERNAME_KEY
    );
  };

export const saveHostUserId = (
  roomId: string,
  userId: string
): void => {
  sessionStorage.setItem(
    `${HOST_USER_ID_PREFIX}${roomId.toUpperCase()}`,
    userId
  );
};

export const getHostUserId = (
  roomId: string
): string | null => {
  return sessionStorage.getItem(
    `${HOST_USER_ID_PREFIX}${roomId.toUpperCase()}`
  );
};

export const removeHostUserId = (
  roomId: string
): void => {
  sessionStorage.removeItem(
    `${HOST_USER_ID_PREFIX}${roomId.toUpperCase()}`
  );
};