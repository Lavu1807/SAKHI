import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Education from "./Education";
import { getMyths, sendMythFeedback } from "../../shared/utils/api";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MockMotion = React.forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  MockMotion.displayName = "MockMotion";

  return {
    motion: new Proxy({}, { get: () => MockMotion }),
  };
});

vi.mock("../../shared/utils/api", () => ({
  getMyths: vi.fn(),
  sendMythFeedback: vi.fn(),
}));

describe("Education feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyths.mockResolvedValue({
      myths: [
        {
          id: 101,
          category: "Exercise",
          myth: "You should avoid exercise during your period.",
          fact: "Gentle to moderate movement can ease cramps and support mood.",
          source: "ACOG",
        },
      ],
    });
    sendMythFeedback.mockResolvedValue({
      message: "Feedback received",
    });
  });

  it("renders header and loads myths on initial render", async () => {
    render(
      <MemoryRouter>
        <Education />
      </MemoryRouter>,
    );

    expect(screen.getByText("EDUCATION")).toBeInTheDocument();
    expect(screen.getByText("Learn without the noise")).toBeInTheDocument();
    expect(
      await screen.findByText("You should avoid exercise during your period."),
    ).toBeInTheDocument();
    expect(getMyths).toHaveBeenCalledWith("All");
  });

  it("filters myths based on search input", async () => {
    render(
      <MemoryRouter>
        <Education />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText("Search a topic");
    fireEvent.change(searchInput, { target: { value: "Chocolate" } });

    expect(
      screen.getByText("Chocolate cravings mean you lack chocolate."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("You should avoid exercise during your period."),
    ).not.toBeInTheDocument();
  });

  it("submits myth feedback on click", async () => {
    render(
      <MemoryRouter>
        <Education />
      </MemoryRouter>,
    );

    await screen.findByText("You should avoid exercise during your period.");
    const helpfulBtns = screen.getAllByRole("button", { name: "Helpful" });
    fireEvent.click(helpfulBtns[0]);

    await waitFor(() => {
      expect(sendMythFeedback).toHaveBeenCalledWith({
        mythId: 101,
        feedbackType: "yes",
      });
    });
  });

  it("switches to Quiz mode and handles answering", async () => {
    render(
      <MemoryRouter>
        <Education />
      </MemoryRouter>,
    );

    const quizTab = screen.getByRole("button", { name: "Quiz mode" });
    fireEvent.click(quizTab);

    expect(screen.getByText(/MYTH OR FACT · QUESTION/)).toBeInTheDocument();
    const mythBtn = screen.getByRole("button", { name: /Myth ❌/ });
    fireEvent.click(mythBtn);

    expect(screen.getByText("🎉 Correct!")).toBeInTheDocument();
    expect(screen.getByText("Next question →")).toBeInTheDocument();
  });
});
