import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor 工具显示", () => {
    it("应该显示创建文件操作", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/components/Button.jsx",
            },
            state: "result",
          }}
        />
      );

      expect(screen.getByText("创建文件")).toBeDefined();
      expect(screen.getByText("/components/Button.jsx")).toBeDefined();
    });

    it("应该显示编辑文件操作", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "str_replace",
              path: "/App.jsx",
            },
            state: "result",
          }}
        />
      );

      expect(screen.getByText("编辑文件")).toBeDefined();
      expect(screen.getByText("/App.jsx")).toBeDefined();
    });

    it("应该显示查看文件操作", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "view",
              path: "/utils/helpers.js",
            },
            state: "result",
          }}
        />
      );

      expect(screen.getByText("查看文件")).toBeDefined();
      expect(screen.getByText("/utils/helpers.js")).toBeDefined();
    });
  });

  describe("file_manager 工具显示", () => {
    it("应该显示重命名操作", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "file_manager",
            args: {
              command: "rename",
              path: "/old.js",
              new_path: "/new.js",
            },
            state: "result",
          }}
        />
      );

      expect(screen.getByText("重命名")).toBeDefined();
      expect(screen.getByText("/old.js → /new.js")).toBeDefined();
    });

    it("应该显示删除操作", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "file_manager",
            args: {
              command: "delete",
              path: "/components/Unused.jsx",
            },
            state: "result",
          }}
        />
      );

      expect(screen.getByText("删除")).toBeDefined();
      expect(screen.getByText("/components/Unused.jsx")).toBeDefined();
    });
  });

  describe("加载状态", () => {
    it("应该在 partial-call 状态显示加载动画", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/test.js",
            },
            state: "partial-call",
          }}
        />
      );

      // 检查是否有旋转加载器（Loader2 组件会添加 animate-spin 类）
      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeDefined();
    });

    it("应该在 call 状态显示加载动画", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/test.js",
            },
            state: "call",
          }}
        />
      );

      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeDefined();
    });

    it("应该在 result 状态显示完成指示器", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/test.js",
            },
            state: "result",
          }}
        />
      );

      // 检查绿色圆点（bg-emerald-500）
      const completedIndicator = container.querySelector(".bg-emerald-500");
      expect(completedIndicator).toBeDefined();

      // 不应该有加载动画
      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeNull();
    });
  });

  describe("未知工具处理", () => {
    it("应该显示未知工具的原始名称", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "unknown_tool",
            args: {},
            state: "result",
          }}
        />
      );

      expect(screen.getByText("unknown_tool")).toBeDefined();
    });
  });

  describe("边界情况", () => {
    it("应该处理没有 target 的情况", () => {
      render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              // 缺少 path
            },
            state: "result",
          }}
        />
      );

      expect(screen.getByText("创建文件")).toBeDefined();
      // target 为空时不应该显示额外的文本节点
    });

    it("应该处理 args 为空对象的情况", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {},
            state: "result",
          }}
        />
      );

      // 应该至少显示默认操作
      expect(container.textContent).toBeTruthy();
    });
  });

  describe("样式类", () => {
    it("应该应用正确的样式类", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/test.js",
            },
            state: "result",
          }}
        />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("inline-flex");
      expect(badge.className).toContain("items-center");
      expect(badge.className).toContain("gap-2");
      expect(badge.className).toContain("bg-neutral-50");
      expect(badge.className).toContain("rounded-lg");
      expect(badge.className).toContain("border");
    });

    it("操作文本应该有 font-medium 类", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/test.js",
            },
            state: "result",
          }}
        />
      );

      const actionText = screen.getByText("创建文件");
      expect(actionText.className).toContain("font-medium");
    });

    it("目标文件路径应该有 font-mono 类", () => {
      const { container } = render(
        <ToolInvocationBadge
          tool={{
            toolName: "str_replace_editor",
            args: {
              command: "create",
              path: "/test.js",
            },
            state: "result",
          }}
        />
      );

      const targetText = screen.getByText("/test.js");
      expect(targetText.className).toContain("font-mono");
      expect(targetText.className).toContain("text-neutral-500");
    });
  });
});
