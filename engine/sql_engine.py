"""SQL engine — execute DuckDB queries and return structured results."""

import duckdb


class SQLEngine:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def execute(self, query: str) -> dict:
        """Execute a SQL query and return results as structured JSON."""
        # Safety: only allow SELECT and DESCRIBE
        stripped = query.strip().upper()
        if not stripped.startswith(("SELECT", "DESCRIBE", "SHOW", "WITH", "EXPLAIN")):
            raise ValueError("Only SELECT/DESCRIBE/SHOW/WITH queries are allowed")

        result = self.db.execute(query)
        columns = [desc[0] for desc in result.description]
        rows = result.fetchall()

        # Convert to list of dicts
        data = []
        for row in rows[:10000]:  # Cap at 10k rows
            record = {}
            for i, col in enumerate(columns):
                val = row[i]
                # Handle DuckDB types that aren't JSON-serializable
                if hasattr(val, "isoformat"):
                    val = val.isoformat()
                elif isinstance(val, (bytes, memoryview)):
                    val = str(val)
                record[col] = val
            data.append(record)

        return {
            "columns": columns,
            "data": data,
            "row_count": len(rows),
            "truncated": len(rows) > 10000,
        }
