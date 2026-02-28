/**
 * High-performance statistics library for AI-Analytics.
 * Uses Eigen for linear algebra operations.
 *
 * Functions:
 * - fast_correlation_matrix: O(n*m^2) Pearson correlation
 * - rolling_statistics: Windowed mean/std/min/max
 * - percentile_exact: Exact percentile via sorting
 * - outlier_detection_iqr: IQR-based outlier detection
 */

#include <vector>
#include <algorithm>
#include <cmath>
#include <numeric>
#include <stdexcept>

// Eigen header (header-only library)
#ifdef USE_EIGEN
#include <Eigen/Dense>
#endif

namespace native_stats {

/**
 * Compute Pearson correlation matrix for an n×m matrix.
 * Each column is a variable, each row is an observation.
 */
std::vector<std::vector<double>> fast_correlation_matrix(
    const std::vector<std::vector<double>>& data,
    int n_rows, int n_cols
) {
    if (n_rows < 2 || n_cols < 2) {
        throw std::runtime_error("Need at least 2 rows and 2 columns");
    }

    // Compute means
    std::vector<double> means(n_cols, 0.0);
    for (int j = 0; j < n_cols; ++j) {
        for (int i = 0; i < n_rows; ++i) {
            means[j] += data[i][j];
        }
        means[j] /= n_rows;
    }

    // Compute standard deviations
    std::vector<double> stds(n_cols, 0.0);
    for (int j = 0; j < n_cols; ++j) {
        for (int i = 0; i < n_rows; ++i) {
            double diff = data[i][j] - means[j];
            stds[j] += diff * diff;
        }
        stds[j] = std::sqrt(stds[j] / (n_rows - 1));
    }

    // Compute correlation matrix
    std::vector<std::vector<double>> corr(n_cols, std::vector<double>(n_cols, 0.0));
    for (int a = 0; a < n_cols; ++a) {
        corr[a][a] = 1.0;
        for (int b = a + 1; b < n_cols; ++b) {
            if (stds[a] < 1e-15 || stds[b] < 1e-15) {
                corr[a][b] = corr[b][a] = 0.0;
                continue;
            }
            double sum = 0.0;
            for (int i = 0; i < n_rows; ++i) {
                sum += (data[i][a] - means[a]) * (data[i][b] - means[b]);
            }
            double r = sum / ((n_rows - 1) * stds[a] * stds[b]);
            corr[a][b] = corr[b][a] = r;
        }
    }
    return corr;
}

/**
 * Compute rolling statistics (mean, std, min, max) over a window.
 */
struct RollingResult {
    std::vector<double> mean;
    std::vector<double> std;
    std::vector<double> min;
    std::vector<double> max;
};

RollingResult rolling_statistics(const std::vector<double>& values, int window) {
    int n = static_cast<int>(values.size());
    if (window > n) window = n;
    if (window < 1) throw std::runtime_error("Window must be >= 1");

    RollingResult result;
    result.mean.resize(n, 0.0);
    result.std.resize(n, 0.0);
    result.min.resize(n, 0.0);
    result.max.resize(n, 0.0);

    for (int i = 0; i < n; ++i) {
        int start = std::max(0, i - window + 1);
        int count = i - start + 1;

        double sum = 0, sq_sum = 0;
        double lo = values[start], hi = values[start];

        for (int j = start; j <= i; ++j) {
            sum += values[j];
            sq_sum += values[j] * values[j];
            lo = std::min(lo, values[j]);
            hi = std::max(hi, values[j]);
        }

        result.mean[i] = sum / count;
        result.min[i] = lo;
        result.max[i] = hi;

        if (count > 1) {
            double variance = (sq_sum - sum * sum / count) / (count - 1);
            result.std[i] = std::sqrt(std::max(0.0, variance));
        }
    }

    return result;
}

/**
 * Compute exact percentile via sorting.
 */
double percentile_exact(std::vector<double> values, double p) {
    if (values.empty()) throw std::runtime_error("Empty input");
    if (p < 0 || p > 100) throw std::runtime_error("Percentile must be in [0, 100]");

    std::sort(values.begin(), values.end());
    double rank = (p / 100.0) * (values.size() - 1);
    int lo = static_cast<int>(std::floor(rank));
    int hi = static_cast<int>(std::ceil(rank));
    double frac = rank - lo;

    return values[lo] * (1 - frac) + values[hi] * frac;
}

/**
 * Detect outliers using the IQR method.
 * Returns indices of outlier values.
 */
std::vector<int> outlier_detection_iqr(const std::vector<double>& values, double multiplier = 1.5) {
    if (values.size() < 4) return {};

    std::vector<double> sorted_vals = values;
    std::sort(sorted_vals.begin(), sorted_vals.end());

    double q1 = percentile_exact(sorted_vals, 25.0);
    double q3 = percentile_exact(sorted_vals, 75.0);
    double iqr = q3 - q1;
    double lower = q1 - multiplier * iqr;
    double upper = q3 + multiplier * iqr;

    std::vector<int> outliers;
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
        if (values[i] < lower || values[i] > upper) {
            outliers.push_back(i);
        }
    }
    return outliers;
}

} // namespace native_stats
