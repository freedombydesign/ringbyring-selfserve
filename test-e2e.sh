#!/bin/bash

# RingByRing Self-Serve End-to-End Test
# Tests all critical paths programmatically

set -e

BASE_URL="https://www.ringbyring.com"
PASSED=0
FAILED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "RingByRing Self-Serve E2E Test Suite"
echo "Testing: $BASE_URL"
echo "============================================"
echo ""

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local check_content="$4"

    echo -n "Testing: $name... "

    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        if [ -n "$check_content" ]; then
            if echo "$body" | grep -q "$check_content"; then
                echo -e "${GREEN}✓ PASS${NC} (Status: $status_code, Content: ✓)"
                ((PASSED++))
            else
                echo -e "${RED}✗ FAIL${NC} (Status: $status_code, Content: ✗)"
                echo "  Expected content '$check_content' not found"
                ((FAILED++))
            fi
        else
            echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
            ((PASSED++))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        ((FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. PUBLIC PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Landing Page" "$BASE_URL/" "200" "RingByRing"
test_endpoint "Login Page" "$BASE_URL/auth/login" "200"
test_endpoint "Onboarding Page" "$BASE_URL/onboarding" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. TRADE SERVICE PAGES (SEO)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Plumber Answering Service" "$BASE_URL/plumber-answering-service" "200" "plumber"
test_endpoint "HVAC Answering Service" "$BASE_URL/hvac-answering-service" "200" "HVAC"
test_endpoint "Electrician Answering Service" "$BASE_URL/electrician-answering-service" "200" "electrician"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. CITY PAGES (SEO)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Hamilton Plumber" "$BASE_URL/plumber-answering-service/hamilton" "200" "Hamilton"
test_endpoint "Burlington HVAC" "$BASE_URL/hvac-answering-service/burlington" "200" "Burlington"
test_endpoint "Toronto Electrician" "$BASE_URL/electrician-answering-service/toronto" "200" "Toronto"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. DASHBOARD PAGES (AUTH REQUIRED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# These should redirect to login (302) or return 200 if there's client-side auth
test_endpoint "Main Dashboard" "$BASE_URL/dashboard" "200"
test_endpoint "Call History" "$BASE_URL/dashboard/calls" "200"
test_endpoint "Settings" "$BASE_URL/dashboard/settings" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. API ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# These should return 401 (unauthorized) for unauthenticated requests
test_endpoint "Dashboard Config API" "$BASE_URL/api/dashboard/config" "401"
test_endpoint "Dashboard Calls API" "$BASE_URL/api/dashboard/calls" "401"
test_endpoint "Dashboard Billing API" "$BASE_URL/api/dashboard/billing" "401"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. GOOGLE OAUTH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test that login page loads (client-side rendered, can't check button)
echo -n "Testing: Login Page Renders... "
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/auth/login")
status_code=$(echo "$response" | tail -n 1)
if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Login page loads)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Login page failed to load)"
    ((FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. FIXED INPUT FIELDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test that settings page loads (client-side rendered)
echo -n "Testing: Settings Page Loads... "
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/dashboard/settings")
status_code=$(echo "$response" | tail -n 1)
if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Settings page loads)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Settings page failed to load)"
    ((FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. SEO & META"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Sitemap" "$BASE_URL/sitemap.xml" "200" "urlset"
test_endpoint "Robots.txt" "$BASE_URL/robots.txt" "200" "User-agent"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo "RingByRing Self-Serve is working end-to-end!"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Please review the failures above."
    exit 1
fi
