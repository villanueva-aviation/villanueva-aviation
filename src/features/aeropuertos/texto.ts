/** Une con espacio que no se parte las cifras de miles («12 000») y la cifra con su unidad («5013 ft»), para que no queden en dos renglones. */
export const nb = (s: string) =>
  s.replace(/(\d) (?=\d{3}(?!\d))/g, "$1 ").replace(/(\d) (?=(?:ft|pies|kt|NM)\b|%)/g, "$1 ");
