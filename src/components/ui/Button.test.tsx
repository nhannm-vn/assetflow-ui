import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("<Button />", () => {
  it("renders its label", () => {
    render(<Button>Lưu</Button>);
    expect(screen.getByRole("button", { name: "Lưu" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Xóa</Button>);

    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button and blocks clicks while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Lưu
      </Button>
    );

    const button = screen.getByRole("button", { name: "Lưu" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
