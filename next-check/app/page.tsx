import { demos } from "../../registry/index.gen";

export default function Page() {
  return (
    <main style={{ display: "grid", gap: 24, padding: 24 }}>
      {demos.map(({ slug, Demo }) => (
        <section key={slug} data-slug={slug}>
          <Demo />
        </section>
      ))}
    </main>
  );
}
