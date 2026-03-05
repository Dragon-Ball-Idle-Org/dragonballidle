export function getCanonicalList(list) {
  return list.slice().sort((a, b) => {
    const aKey = (a.id ? String(a.id) : String(a.name || "")).toLowerCase();
    const bKey = (b.id ? String(b.id) : String(b.name || "")).toLowerCase();
    return aKey.localeCompare(bKey);
  });
}

export function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.includes(","))
    return val.split(",").map((v) => v.trim());
  return [val];
}

// Função para comparar arrays
function compareValuesArray(val1, val2) {
  const arr1 = toArray(val1);
  const arr2 = toArray(val2);

  // Exatamente iguais (mesmo tamanho, mesmos valores, mesma ordem)
  if (arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i])) {
    return "exact";
  }

  // Parcial: pelo menos um valor igual
  if (arr1.some((v) => arr2.includes(v))) {
    return "partial";
  }

  // Nenhuma interseção
  return "none";
}
