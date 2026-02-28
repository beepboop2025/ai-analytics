"""Statistical profiler — generates comprehensive dataset statistics using DuckDB + polars."""

import duckdb
import polars as pl
import numpy as np
from scipy import stats


class DataProfiler:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def profile(self, table_name: str) -> dict:
        """Generate a full statistical profile of a dataset."""
        # Get schema
        schema = self.db.execute(f"DESCRIBE {table_name}").fetchall()
        row_count = self.db.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]

        columns = []
        for col_name, col_type, *_ in schema:
            col_profile = self._profile_column(table_name, col_name, col_type, row_count)
            columns.append(col_profile)

        # Correlation matrix for numeric columns
        numeric_cols = [c["name"] for c in columns if c["is_numeric"]]
        correlations = self._compute_correlations(table_name, numeric_cols) if len(numeric_cols) >= 2 else None

        return {
            "table": table_name,
            "row_count": row_count,
            "column_count": len(schema),
            "columns": columns,
            "correlations": correlations,
        }

    def _profile_column(self, table: str, col: str, dtype: str, total_rows: int) -> dict:
        """Profile a single column."""
        is_numeric = dtype in ("DOUBLE", "FLOAT", "INTEGER", "BIGINT", "DECIMAL", "SMALLINT", "TINYINT", "HUGEINT")

        # Basic stats from DuckDB
        stats_query = f"""
            SELECT
                COUNT("{col}") AS non_null,
                COUNT(DISTINCT "{col}") AS distinct_count,
                COUNT(*) - COUNT("{col}") AS null_count
            FROM {table}
        """
        basic = self.db.execute(stats_query).fetchone()

        profile = {
            "name": col,
            "type": dtype,
            "is_numeric": is_numeric,
            "non_null": basic[0],
            "distinct_count": basic[1],
            "null_count": basic[2],
            "null_percentage": round(basic[2] / max(total_rows, 1) * 100, 2),
        }

        if is_numeric:
            num_stats = self.db.execute(f"""
                SELECT
                    MIN("{col}")::DOUBLE AS min_val,
                    MAX("{col}")::DOUBLE AS max_val,
                    AVG("{col}")::DOUBLE AS mean_val,
                    MEDIAN("{col}")::DOUBLE AS median_val,
                    STDDEV("{col}")::DOUBLE AS std_val,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY "{col}")::DOUBLE AS q1,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY "{col}")::DOUBLE AS q3
                FROM {table}
            """).fetchone()

            profile.update({
                "min": num_stats[0],
                "max": num_stats[1],
                "mean": round(num_stats[2], 4) if num_stats[2] is not None else None,
                "median": num_stats[3],
                "std": round(num_stats[4], 4) if num_stats[4] is not None else None,
                "q1": num_stats[5],
                "q3": num_stats[6],
                "iqr": round(num_stats[6] - num_stats[5], 4) if num_stats[5] is not None and num_stats[6] is not None else None,
            })

            # Detect outliers (IQR method)
            if num_stats[5] is not None and num_stats[6] is not None:
                iqr = num_stats[6] - num_stats[5]
                lower = num_stats[5] - 1.5 * iqr
                upper = num_stats[6] + 1.5 * iqr
                outlier_count = self.db.execute(
                    f'SELECT COUNT(*) FROM {table} WHERE "{col}" < {lower} OR "{col}" > {upper}'
                ).fetchone()[0]
                profile["outlier_count"] = outlier_count

            # Histogram (10 bins)
            try:
                values = [r[0] for r in self.db.execute(f'SELECT "{col}"::DOUBLE FROM {table} WHERE "{col}" IS NOT NULL').fetchall()]
                if values:
                    hist, bin_edges = np.histogram(values, bins=10)
                    profile["histogram"] = {
                        "counts": hist.tolist(),
                        "bin_edges": [round(float(b), 4) for b in bin_edges],
                    }

                    # Normality test (for < 5000 samples)
                    if len(values) < 5000 and len(values) > 8:
                        _, p_value = stats.normaltest(values)
                        profile["normality_p_value"] = round(float(p_value), 6)
            except Exception:
                pass

        else:
            # Categorical: top values
            top = self.db.execute(
                f'SELECT "{col}", COUNT(*) AS cnt FROM {table} WHERE "{col}" IS NOT NULL GROUP BY "{col}" ORDER BY cnt DESC LIMIT 10'
            ).fetchall()
            profile["top_values"] = [{"value": str(r[0]), "count": r[1]} for r in top]

        return profile

    def _compute_correlations(self, table: str, numeric_cols: list[str]) -> dict:
        """Compute Pearson correlation matrix for numeric columns."""
        cols_str = ", ".join(f'"{c}"::DOUBLE' for c in numeric_cols)
        rows = self.db.execute(f"SELECT {cols_str} FROM {table}").fetchall()

        data = np.array(rows, dtype=np.float64)
        # Remove rows with NaN
        mask = ~np.isnan(data).any(axis=1)
        data = data[mask]

        if data.shape[0] < 3:
            return None

        corr = np.corrcoef(data.T)
        return {
            "columns": numeric_cols,
            "matrix": [[round(float(v), 4) for v in row] for row in corr],
        }
