import { TestChat } from "@/components/TestChat";

export default function TestPage() {
  return (
    <>
      <a className="tide-back" href="/">
        Studio
      </a>
      <div className="tide-shell">
        <TestChat />
      </div>
    </>
  );
}
