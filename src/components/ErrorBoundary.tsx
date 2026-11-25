import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GameErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The island could not start:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="game-error">
          <div className="game-error-card">
            <p className="modal-kicker">a small hiccup</p>
            <h1>The island needs WebGL</h1>
            <p>
              Hossna's Secret World needs 3D graphics to open. Try a recent version of
              Chrome, Safari, Edge or Firefox, and make sure hardware acceleration is
              enabled in your browser settings.
            </p>
            <button className="button button--primary" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
