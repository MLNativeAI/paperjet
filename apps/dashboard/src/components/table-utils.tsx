export const renderCellValue = (
  col: { type: "number" | "boolean" | "date" | "text" | "currency"; id: string; slug: string; description: string },
  row: Record<string, string | number | boolean | Date | null>,
) => {
  const cellValue = row[col.slug];
  // TODO: Maybe we don't need this after all
  switch (typeof cellValue) {
    // case 'string': {
    //   return <td>{cellValue}</td>
    // }
    // case 'number': {
    //   return <td>{cellValue}</td>
    // }
    default:
      return <td>{cellValue?.toString()}</td>;
  }
};
