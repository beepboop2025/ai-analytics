"""AI-Analytics Data Engine — FastAPI service with DuckDB, polars, and statistical analysis."""

import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from typing import Optional

import duckdb

from profiler import DataProfiler
from sql_engine import SQLEngine
from forecaster import Forecaster

# Shared DuckDB connection per-process
_db: duckdb.DuckDBPyConnection | None = None
_sql_engine: SQLEngine | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _db, _sql_engine
    _db = duckdb.connect(":memory:")
    _sql_engine = SQLEngine(_db)
    print("[Engine] DuckDB initialized (in-memory)")
    yield
    if _db:
        _db.close()
    print("[Engine] Shutdown")


app = FastAPI(title="AI-Analytics Data Engine", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "data-engine"}


# --- Models ---

class ProfileRequest(BaseModel):
    dataset_name: str


class SQLRequest(BaseModel):
    query: str
    dataset_name: Optional[str] = None


class ForecastRequest(BaseModel):
    dataset_name: str
    date_column: str
    value_column: str
    periods: int = 30


class DeepAnalyzeRequest(BaseModel):
    dataset_name: str


# --- Endpoints ---

@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...), name: Optional[str] = None):
    """Upload a CSV/JSON file into DuckDB for analysis."""
    dataset_name = name or file.filename.rsplit(".", 1)[0].replace(" ", "_").lower()

    suffix = file.filename.rsplit(".", 1)[-1].lower()
    if suffix not in ("csv", "json", "parquet"):
        raise HTTPException(400, "Supported formats: csv, json, parquet")

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{suffix}") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        if suffix == "csv":
            _db.execute(f"CREATE OR REPLACE TABLE {dataset_name} AS SELECT * FROM read_csv_auto('{tmp_path}')")
        elif suffix == "json":
            _db.execute(f"CREATE OR REPLACE TABLE {dataset_name} AS SELECT * FROM read_json_auto('{tmp_path}')")
        elif suffix == "parquet":
            _db.execute(f"CREATE OR REPLACE TABLE {dataset_name} AS SELECT * FROM read_parquet('{tmp_path}')")

        count = _db.execute(f"SELECT COUNT(*) FROM {dataset_name}").fetchone()[0]
        columns = [col[0] for col in _db.execute(f"DESCRIBE {dataset_name}").fetchall()]
    finally:
        os.unlink(tmp_path)

    return {"dataset": dataset_name, "rows": count, "columns": columns}


@app.post("/profile")
def profile_dataset(req: ProfileRequest):
    """Statistical profiling of a dataset — types, distributions, outliers, correlations."""
    profiler = DataProfiler(_db)
    try:
        return profiler.profile(req.dataset_name)
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/sql")
def run_sql(req: SQLRequest):
    """Run a DuckDB SQL query against uploaded datasets."""
    try:
        return _sql_engine.execute(req.query)
    except Exception as e:
        raise HTTPException(400, str(e))


@app.post("/forecast")
def forecast(req: ForecastRequest):
    """Time series forecast using ARIMA."""
    forecaster = Forecaster(_db)
    try:
        return forecaster.forecast(req.dataset_name, req.date_column, req.value_column, req.periods)
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/deep-analyze")
def deep_analyze(req: DeepAnalyzeRequest):
    """Comprehensive dataset analysis — profile + correlations + outliers + distributions."""
    profiler = DataProfiler(_db)
    try:
        profile = profiler.profile(req.dataset_name)

        # Try native C++ stats if available
        native_stats = {}
        try:
            import native_stats_ext
            numeric_cols = [c["name"] for c in profile["columns"] if c["type"] in ("DOUBLE", "FLOAT", "INTEGER", "BIGINT")]
            if numeric_cols:
                data = _db.execute(
                    f"SELECT {', '.join(numeric_cols)} FROM {req.dataset_name}"
                ).fetchall()
                import numpy as np
                matrix = np.array(data, dtype=np.float64)
                native_stats["correlation_matrix"] = native_stats_ext.fast_correlation_matrix(matrix).tolist()
                native_stats["column_names"] = numeric_cols
        except ImportError:
            pass  # C++ extension not compiled

        return {**profile, "native_stats": native_stats}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/datasets")
def list_datasets():
    """List all loaded datasets."""
    tables = _db.execute("SHOW TABLES").fetchall()
    result = []
    for (table_name,) in tables:
        count = _db.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
        columns = [col[0] for col in _db.execute(f"DESCRIBE {table_name}").fetchall()]
        result.append({"name": table_name, "rows": count, "columns": columns})
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
