
import { componentRegistry } from "@/lib/registry/components";
import { ComponentSandbox } from "@/components/tools/ComponentSandbox";

export default function ComponentLibraryPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Component Library
        </h1>
        <p className="text-white/40 max-w-lg">
          A centralized registry of standardized UI primitives and layout patterns.
          Used for rapid prototyping and ensuring design consistency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {componentRegistry.map((component) => (
          <ComponentSandbox
            key={component.id}
            title={component.name}
            description={component.description}
            type={component.type}
            initialCode={component.code}
          />
        ))}
      </div>
    </div>
  );
}
