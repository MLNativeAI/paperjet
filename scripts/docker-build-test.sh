#!/bin/bash

# Docker build performance test script
set -e

echo "🚀 Docker Build Performance Test"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to measure build time
measure_build() {
    local dockerfile=$1
    local tag=$2
    local start_time=$(date +%s)
    
    echo -e "\n${YELLOW}Building with $dockerfile...${NC}"
    
    if docker build -f "$dockerfile" -t "$tag" . --progress=plain; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✓ Build completed in ${duration} seconds${NC}"
        return $duration
    else
        echo "❌ Build failed"
        return 999
    fi
}

# Test original Dockerfile
measure_build "Dockerfile" "paperjet:original"
ORIGINAL_TIME=$?

# Test optimized Dockerfile
measure_build "Dockerfile.optimized" "paperjet:optimized"
OPTIMIZED_TIME=$?

# Show results
echo -e "\n📊 Build Time Comparison:"
echo "========================"
echo "Original Dockerfile: ${ORIGINAL_TIME}s"
echo "Optimized Dockerfile: ${OPTIMIZED_TIME}s"

if [ $OPTIMIZED_TIME -lt $ORIGINAL_TIME ]; then
    IMPROVEMENT=$((100 - (OPTIMIZED_TIME * 100 / ORIGINAL_TIME)))
    echo -e "${GREEN}🎉 Improvement: ${IMPROVEMENT}% faster!${NC}"
else
    echo -e "${YELLOW}⚠️  No improvement detected${NC}"
fi

# Check image sizes
echo -e "\n📦 Image Size Comparison:"
echo "========================"
docker images | grep paperjet || true

# Clean up (optional)
read -p "Clean up test images? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker rmi paperjet:original paperjet:optimized 2>/dev/null || true
fi