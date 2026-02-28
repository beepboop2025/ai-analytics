/**
 * pybind11 bindings for the native stats library.
 * Exposes C++ functions to Python as the `native_stats_ext` module.
 */

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>

#include "stats.cpp"

namespace py = pybind11;

// Helper: convert numpy 2D array to vector<vector<double>>
std::vector<std::vector<double>> numpy_to_vec2d(py::array_t<double> arr) {
    auto buf = arr.unchecked<2>();
    int n = buf.shape(0);
    int m = buf.shape(1);
    std::vector<std::vector<double>> result(n, std::vector<double>(m));
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j)
            result[i][j] = buf(i, j);
    return result;
}

// Helper: convert numpy 1D array to vector<double>
std::vector<double> numpy_to_vec1d(py::array_t<double> arr) {
    auto buf = arr.unchecked<1>();
    int n = buf.shape(0);
    std::vector<double> result(n);
    for (int i = 0; i < n; ++i)
        result[i] = buf(i);
    return result;
}


PYBIND11_MODULE(native_stats_ext, m) {
    m.doc() = "High-performance statistics library (C++ with pybind11)";

    m.def("fast_correlation_matrix",
        [](py::array_t<double> data) {
            auto buf = data.unchecked<2>();
            auto vec = numpy_to_vec2d(data);
            auto result = native_stats::fast_correlation_matrix(vec, buf.shape(0), buf.shape(1));

            // Convert to numpy
            int n = result.size();
            py::array_t<double> out({n, n});
            auto out_buf = out.mutable_unchecked<2>();
            for (int i = 0; i < n; ++i)
                for (int j = 0; j < n; ++j)
                    out_buf(i, j) = result[i][j];
            return out;
        },
        py::arg("data"),
        "Compute Pearson correlation matrix. Input: numpy array (n_rows x n_cols)."
    );

    m.def("rolling_statistics",
        [](py::array_t<double> values, int window) {
            auto vec = numpy_to_vec1d(values);
            auto result = native_stats::rolling_statistics(vec, window);
            return py::dict(
                py::arg("mean") = result.mean,
                py::arg("std") = result.std,
                py::arg("min") = result.min,
                py::arg("max") = result.max
            );
        },
        py::arg("values"), py::arg("window"),
        "Compute rolling mean, std, min, max over a window."
    );

    m.def("percentile_exact",
        [](py::array_t<double> values, double p) {
            auto vec = numpy_to_vec1d(values);
            return native_stats::percentile_exact(vec, p);
        },
        py::arg("values"), py::arg("percentile"),
        "Compute exact percentile via sorting."
    );

    m.def("outlier_detection_iqr",
        [](py::array_t<double> values, double multiplier) {
            auto vec = numpy_to_vec1d(values);
            return native_stats::outlier_detection_iqr(vec, multiplier);
        },
        py::arg("values"), py::arg("multiplier") = 1.5,
        "Detect outliers using IQR method. Returns list of outlier indices."
    );
}
