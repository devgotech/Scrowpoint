import EmptyState from "@/components/EmptyState"

export default function Home() {
  return (
    <main className="container py-12 flex flex-col gap-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
      <EmptyState
        title="No activity yet"
        description="Your recent orders and sales will appear here. Browse the marketplace to find your next gadget."
        actionLabel="Browse Marketplace"
        actionHref="/marketplace"
      />
    </main>
  );
}