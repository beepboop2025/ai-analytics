FROM python:3.12-slim AS base

# Install build tools for C++ extension
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Build C++ extension (optional — falls back to pure Python if it fails)
COPY native/ native/
RUN cd native && \
    mkdir -p build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release 2>/dev/null && \
    make -j$(nproc) 2>/dev/null && \
    cp native_stats_ext*.so /app/ 2>/dev/null || \
    echo "C++ extension build skipped (optional)"

COPY *.py .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
