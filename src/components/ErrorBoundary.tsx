"use client";

import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

/** Isolates a subtree so one render error doesn't take down the whole page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 text-center text-sm text-[var(--color-muted)]">
            Что-то пошло не так.{" "}
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="font-medium text-[var(--color-brand)] underline"
            >
              Попробовать снова
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
