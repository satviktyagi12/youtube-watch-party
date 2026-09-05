import {
    CreateRoomResponse,
    GetRoomResponse,
  } from "../types/room";
  
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const request = async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(
        data?.message || "Something went wrong"
      );
    }
  
    return data as T;
  };
  
  export const createRoom = async (
    username: string
  ): Promise<CreateRoomResponse> => {
    return request<CreateRoomResponse>("/api/rooms", {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
    });
  };
  
  export const getRoom = async (
    roomId: string
  ): Promise<GetRoomResponse> => {
    return request<GetRoomResponse>(
      `/api/rooms/${encodeURIComponent(roomId)}`
    );
  };