"use client";

import type {
  GenerateMessageRequest,
  GenerateMessageResponse,
  CreateTargetRequest,
  AnalyzeConflictRequest,
  DailyHookDto,
  UpdateUserProfileRequest,
} from "@/lib/schemas";

/**
 * Typed client for the app's internal API routes.
 *
 * Auth: Supabase session cookies are sent automatically with `credentials: "include"`
 * on same-origin requests, so we don't need to set Authorization headers.
 */

type ApiEnvelope<T> = {
  data: T;
  meta?: {
    usage?: {
      remaining?: number | null;
      resetAt?: string;
      unlimited?: boolean;
    };
  };
};

type ApiProblem = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  upgrade_url?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ApiProblem,
  ) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as ApiProblem;
    throw new ApiError(res.status, problem);
  }

  if (res.status === 204) return { data: null as T };
  return (await res.json()) as ApiEnvelope<T>;
}

export const api = {
  generateMessage: (body: GenerateMessageRequest) =>
    request<GenerateMessageResponse>("/api/messages/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createTarget: (body: CreateTargetRequest) =>
    request<{ id: string; name: string | null }>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listTargets: () =>
    request<Array<{ id: string; name: string | null; relation: string }>>(
      "/api/profiles",
    ),

  analyzeTarget: (id: string) =>
    request<unknown>(`/api/profiles/${id}/analyze`, { method: "POST" }),

  analyzeConflict: (body: AnalyzeConflictRequest) =>
    request<unknown>("/api/conflicts/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getScore: (targetId: string) =>
    request<{ compatibility: number; risks: unknown[]; strengths: unknown[] } | null>(
      `/api/scores/${targetId}`,
    ),

  recomputeScore: (targetId: string) =>
    request<unknown>(`/api/scores/${targetId}`, { method: "POST" }),

  getTodayHook: () => request<DailyHookDto | null>("/api/hooks/today"),

  createChatSession: (body: { targetId: string }) =>
    request<{ id: string }>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  ackHook: (id: string, action: "copied" | "dismissed" | "used") =>
    request<{ acked: boolean }>(`/api/hooks/${id}/ack`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  getMyProfile: () =>
    request<{
      id: string;
      display_name: string | null;
      gender: string | null;
      age_range: string | null;
      interests: string[] | null;
      communication_style: string | null;
      attachment_style: string | null;
      relationship_goal: string | null;
      raw_bio: string | null;
    }>("/api/me/profile"),

  updateMyProfile: (body: UpdateUserProfileRequest) =>
    request<unknown>("/api/me/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
