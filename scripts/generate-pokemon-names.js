const fs = require('fs');

async function fetchSpeciesNames(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (!res.ok) {
      console.error(`Failed to fetch species ${id}: ${res.status}`);
      return { en: `pokemon-${id}`, fr: `pokemon-${id}` };
    }

    const data = await res.json();

    const en = data.names.find(n => n.language.name === 'en')?.name || `pokemon-${id}`;
    const fr = data.names.find(n => n.language.name === 'fr')?.name || en;

    return { en, fr };
  } catch (error) {
    console.error(`Error fetching species ${id}:`, error.message);
    return { en: `pokemon-${id}`, fr: `pokemon-${id}` };
  }
}

async function generateMapping() {
  console.log('Starting Pokemon names generation for IDs 1-649...\n');
  const mapping = {};

  for (let id = 1; id <= 649; id++) {
    mapping[id] = await fetchSpeciesNames(id);
    if (id % 50 === 0) {
      console.log(`Progress: ${id}/649 (${Math.round(id/649*100)}%)`);
    }
    // Rate limiting to avoid hammering the API
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\nGenerating TypeScript file...');

  const output = `// Auto-generated file - do not edit manually
// Generated on ${new Date().toISOString()}
// Source: PokeAPI pokemon-species endpoint

export const pokemonNames: Record<number, { en: string; fr: string }> = ${JSON.stringify(mapping, null, 2)} as const;
`;

  fs.writeFileSync('lib/pokemon-names.ts', output);
  console.log('✓ File generated: lib/pokemon-names.ts');
  console.log(`✓ Total Pokemon: ${Object.keys(mapping).length}`);
}

generateMapping().catch(console.error);
