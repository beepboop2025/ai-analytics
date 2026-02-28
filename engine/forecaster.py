"""Time series forecaster using ARIMA from statsmodels."""

import duckdb
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from datetime import timedelta


class Forecaster:
    def __init__(self, db: duckdb.DuckDBPyConnection):
        self.db = db

    def forecast(self, table: str, date_col: str, value_col: str, periods: int = 30) -> dict:
        """Generate ARIMA forecast for a time series column.

        Args:
            table: DuckDB table name
            date_col: Column containing dates/timestamps
            value_col: Column containing numeric values to forecast
            periods: Number of future periods to predict

        Returns:
            dict with historical data, forecast values, and confidence intervals
        """
        # Fetch and sort data
        rows = self.db.execute(
            f'SELECT "{date_col}", "{value_col}"::DOUBLE FROM {table} '
            f'WHERE "{value_col}" IS NOT NULL ORDER BY "{date_col}"'
        ).fetchall()

        if len(rows) < 10:
            raise ValueError(f"Need at least 10 data points for forecasting, got {len(rows)}")

        dates = [str(r[0]) for r in rows]
        values = np.array([r[1] for r in rows], dtype=np.float64)

        # Remove NaN
        mask = ~np.isnan(values)
        values = values[mask]
        dates = [d for d, m in zip(dates, mask) if m]

        if len(values) < 10:
            raise ValueError("Insufficient non-null values for forecasting")

        # Fit ARIMA model (auto-select order)
        best_aic = float("inf")
        best_model = None

        for p in range(3):
            for d in range(2):
                for q in range(3):
                    try:
                        model = ARIMA(values, order=(p, d, q))
                        fitted = model.fit()
                        if fitted.aic < best_aic:
                            best_aic = fitted.aic
                            best_model = fitted
                    except Exception:
                        continue

        if best_model is None:
            raise ValueError("Failed to fit ARIMA model")

        # Generate forecast
        forecast_result = best_model.get_forecast(steps=min(periods, 365))
        forecast_values = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=0.05)

        # Build forecast dates (assuming daily frequency)
        try:
            from datetime import datetime
            last_date = datetime.fromisoformat(dates[-1])
            forecast_dates = [(last_date + timedelta(days=i + 1)).isoformat() for i in range(len(forecast_values))]
        except Exception:
            forecast_dates = [f"T+{i + 1}" for i in range(len(forecast_values))]

        return {
            "model": f"ARIMA{best_model.model.order}",
            "aic": round(best_aic, 2),
            "historical": {
                "dates": dates[-60:],  # Last 60 data points
                "values": [round(float(v), 4) for v in values[-60:]],
            },
            "forecast": {
                "dates": forecast_dates,
                "values": [round(float(v), 4) for v in forecast_values],
                "lower_ci": [round(float(v), 4) for v in conf_int[:, 0]],
                "upper_ci": [round(float(v), 4) for v in conf_int[:, 1]],
            },
            "diagnostics": {
                "data_points": len(values),
                "forecast_periods": len(forecast_values),
            },
        }
