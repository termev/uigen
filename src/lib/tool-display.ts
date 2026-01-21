// 工具调用显示信息接口
interface ToolInvocation {
  toolName: string;
  args: any;
  state: "partial-call" | "call" | "result";
  result?: any;
}

// 工具显示信息
export interface ToolDisplayInfo {
  action: string; // 操作动词（创建、编辑、删除等）
  target: string; // 目标文件/对象
}

/**
 * 将工具调用转换为用户友好的显示信息
 * @param tool 工具调用对象
 * @returns 包含操作描述和目标的显示信息
 */
export function getToolDisplayInfo(tool: ToolInvocation): ToolDisplayInfo {
  const { toolName, args } = tool;

  // 处理 str_replace_editor 工具
  if (toolName === "str_replace_editor") {
    const command = args?.command;
    const path = args?.path || "";

    switch (command) {
      case "create":
        return {
          action: "创建文件",
          target: path,
        };
      case "view":
        return {
          action: "查看文件",
          target: path,
        };
      case "str_replace":
        return {
          action: "编辑文件",
          target: path,
        };
      case "insert":
        return {
          action: "修改文件",
          target: path,
        };
      case "undo_edit":
        return {
          action: "撤销编辑",
          target: path,
        };
      default:
        return {
          action: "操作文件",
          target: path,
        };
    }
  }

  // 处理 file_manager 工具
  if (toolName === "file_manager") {
    const command = args?.command;
    const path = args?.path || "";
    const newPath = args?.new_path;

    switch (command) {
      case "rename":
        return {
          action: "重命名",
          target: newPath ? `${path} → ${newPath}` : path,
        };
      case "delete":
        return {
          action: "删除",
          target: path,
        };
      default:
        return {
          action: "文件操作",
          target: path,
        };
    }
  }

  // 未知工具，返回原始工具名称
  return {
    action: toolName,
    target: "",
  };
}
