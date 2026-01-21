import { describe, it, expect } from "vitest";
import { getToolDisplayInfo } from "../tool-display";

describe("getToolDisplayInfo", () => {
  describe("str_replace_editor 工具", () => {
    it("应该为 create 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "create",
          path: "/components/Button.jsx",
        },
        state: "result",
      });

      expect(result.action).toBe("创建文件");
      expect(result.target).toBe("/components/Button.jsx");
    });

    it("应该为 view 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "view",
          path: "/App.jsx",
        },
        state: "call",
      });

      expect(result.action).toBe("查看文件");
      expect(result.target).toBe("/App.jsx");
    });

    it("应该为 str_replace 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "str_replace",
          path: "/components/Counter.jsx",
        },
        state: "result",
      });

      expect(result.action).toBe("编辑文件");
      expect(result.target).toBe("/components/Counter.jsx");
    });

    it("应该为 insert 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "insert",
          path: "/utils/helpers.js",
        },
        state: "result",
      });

      expect(result.action).toBe("修改文件");
      expect(result.target).toBe("/utils/helpers.js");
    });

    it("应该为 undo_edit 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "undo_edit",
          path: "/components/Form.jsx",
        },
        state: "result",
      });

      expect(result.action).toBe("撤销编辑");
      expect(result.target).toBe("/components/Form.jsx");
    });

    it("应该为未知命令返回默认显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "unknown_command",
          path: "/test.js",
        },
        state: "result",
      });

      expect(result.action).toBe("操作文件");
      expect(result.target).toBe("/test.js");
    });

    it("应该处理缺少 path 参数的情况", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: {
          command: "create",
        },
        state: "result",
      });

      expect(result.action).toBe("创建文件");
      expect(result.target).toBe("");
    });
  });

  describe("file_manager 工具", () => {
    it("应该为 rename 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/old-name.js",
          new_path: "/new-name.js",
        },
        state: "result",
      });

      expect(result.action).toBe("重命名");
      expect(result.target).toBe("/old-name.js → /new-name.js");
    });

    it("应该为没有 new_path 的 rename 命令返回简化信息", () => {
      const result = getToolDisplayInfo({
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/old-name.js",
        },
        state: "result",
      });

      expect(result.action).toBe("重命名");
      expect(result.target).toBe("/old-name.js");
    });

    it("应该为 delete 命令返回正确的显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "file_manager",
        args: {
          command: "delete",
          path: "/components/Unused.jsx",
        },
        state: "result",
      });

      expect(result.action).toBe("删除");
      expect(result.target).toBe("/components/Unused.jsx");
    });

    it("应该为未知命令返回默认显示信息", () => {
      const result = getToolDisplayInfo({
        toolName: "file_manager",
        args: {
          command: "unknown",
          path: "/test.js",
        },
        state: "result",
      });

      expect(result.action).toBe("文件操作");
      expect(result.target).toBe("/test.js");
    });
  });

  describe("未知工具", () => {
    it("应该为未知工具返回工具名称", () => {
      const result = getToolDisplayInfo({
        toolName: "unknown_tool",
        args: {},
        state: "result",
      });

      expect(result.action).toBe("unknown_tool");
      expect(result.target).toBe("");
    });
  });

  describe("边界情况", () => {
    it("应该处理 args 为 undefined 的情况", () => {
      const result = getToolDisplayInfo({
        toolName: "str_replace_editor",
        args: undefined,
        state: "result",
      });

      expect(result.action).toBe("操作文件");
      expect(result.target).toBe("");
    });

    it("应该处理 args 为 null 的情况", () => {
      const result = getToolDisplayInfo({
        toolName: "file_manager",
        args: null,
        state: "result",
      });

      expect(result.action).toBe("文件操作");
      expect(result.target).toBe("");
    });
  });
});
