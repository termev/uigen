"use client";

import { Loader2 } from "lucide-react";
import { getToolDisplayInfo } from "@/lib/tool-display";

interface ToolInvocationBadgeProps {
  tool: {
    toolName: string;
    args: any;
    state: "partial-call" | "call" | "result";
    result?: any;
  };
}

/**
 * 工具调用显示徽章组件
 * 将技术性的工具名称转换为用户友好的操作描述
 */
export function ToolInvocationBadge({ tool }: ToolInvocationBadgeProps) {
  const { action, target } = getToolDisplayInfo(tool);
  const isLoading = tool.state !== "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      )}
      <span className="text-neutral-700">
        <span className="font-medium">{action}</span>
        {target && (
          <span className="ml-1 font-mono text-neutral-500">{target}</span>
        )}
      </span>
    </div>
  );
}
