import { registry } from "./registry";

export default function RegistryDiagnose() {
  const duplicates: string[] = [];
  const seen = new Set<string>();
  Object.keys(registry.sites).forEach((id) => {
    if (seen.has(id)) duplicates.push(id);
    else seen.add(id);
  });

  const missing: string[] = [];
  Object.values(registry.domains).forEach((domain) => {
    domain.personas.forEach((persona) => {
      persona.intents.forEach((intent) => {
        intent.siteIds.forEach((id) => {
          if (!registry.sites[id]) missing.push(id);
        });
      });
    });
  });

  const emptyUrls = Object.values(registry.sites)
    .filter((s) => !s.url)
    .map((s) => s.id);

  return (
    <div className="p-4 text-sm">
      <h1 className="text-xl font-bold mb-4">Registry Diagnose</h1>
      <div className="mb-4">
        <h2 className="font-semibold">Duplicate Site IDs</h2>
        {duplicates.length ? (
          <ul>
            {duplicates.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        ) : (
          <p>None</p>
        )}
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Missing Site References</h2>
        {missing.length ? (
          <ul>
            {missing.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        ) : (
          <p>None</p>
        )}
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Sites with Empty URL</h2>
        {emptyUrls.length ? (
          <ul>
            {emptyUrls.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        ) : (
          <p>None</p>
        )}
      </div>
    </div>
  );
}
