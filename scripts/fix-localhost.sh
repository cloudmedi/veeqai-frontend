#!/bin/bash
# Replace all localhost:5000 with environment variable usage

find src -name "*.tsx" -type f -exec sed -i 's|http://localhost:5000|\${import.meta.env.VITE_API_BASE_URL \|\| "http://localhost:5000"}|g' {} \;

echo "✅ All localhost URLs replaced with environment variable"