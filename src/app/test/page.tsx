import { TestChat } from "@/components/TestChat";

export default function TestPage() {
  return (
    <>
      <a className="hearth-back" href="/">
        Studio
      </a>
      <div className="hearth-frame">
        <div className="hearth-beam" />
        <div className="hearth-pans" aria-hidden="true">
          <span className="hearth-pan" />
          <span className="hearth-pan" />
          <span className="hearth-pan" />
        </div>
        <TestChat />
      </div>
    </>
  );
}
