export async function validateSQL(query: string) {

  try {

    let cleanedQuery = query
      .replace(/```sql/gi, "")
      .replace(/```/g, "")
      .replace(/^SQL\s*Query\s*:/i, "")
      .trim();

    // Remove trailing semicolon
    cleanedQuery = cleanedQuery.replace(/;$/, "");

    console.log(cleanedQuery, "cleanedQuery");

    // Ensure query starts with SELECT
    if (!/^SELECT\b/i.test(cleanedQuery)) {
      console.log("Not a SELECT query");

      return {
        valid: false,
        error: "Only SELECT queries are allowed"
      };
    }

    console.log("Valid SELECT query");

    return {
      valid: true
    };

  } catch (error) {

    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown validation error"
    };

  }

}