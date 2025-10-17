// src/AppErrorBoundary.tsx
import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Log centralizado se quiser integrar com um serviço
    // eslint-disable-next-line no-console
    console.error("AppErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[40vh] grid place-items-center p-6">
            <div className="max-w-md text-center">
              <div className="text-rose-600 font-semibold mb-2">Ocorreu um erro</div>
              <p className="text-slate-600 mb-4">
                Tente atualizar a página ou voltar para a Home.
              </p>
              <a
                href="/"
                className="inline-block rounded-md bg-slate-900 text-white px-4 py-2"
              >
                Ir para Home
              </a>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
