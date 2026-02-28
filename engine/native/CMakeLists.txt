cmake_minimum_required(VERSION 3.20)
project(native_stats_ext LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Find pybind11
find_package(pybind11 REQUIRED)

# Optional: Find Eigen
find_package(Eigen3 QUIET)
if(Eigen3_FOUND)
    add_definitions(-DUSE_EIGEN)
endif()

# Build the Python extension module
pybind11_add_module(native_stats_ext bindings.cpp)

target_include_directories(native_stats_ext PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})

if(Eigen3_FOUND)
    target_link_libraries(native_stats_ext PRIVATE Eigen3::Eigen)
endif()

# Optimization flags
target_compile_options(native_stats_ext PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang,AppleClang>:-O3 -march=native>
    $<$<CXX_COMPILER_ID:MSVC>:/O2>
)
