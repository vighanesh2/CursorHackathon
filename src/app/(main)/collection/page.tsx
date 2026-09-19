import { CollectionList } from "@/components/CollectionList";

export default function CollectionPage() {
  return (
    <div className="flex flex-1 px-6 py-12">
      <main className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink">
            Collection
          </h1>
          <p className="max-w-xl text-[15px] leading-6 text-mute">
            Saved Design DNA for this browser session. Open one to rename or restyle, or delete it after two confirms.
          </p>
        </div>
        <CollectionList />
      </main>
    </div>
  );
}
