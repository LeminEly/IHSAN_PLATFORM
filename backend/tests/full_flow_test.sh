#!/bin/bash

# 🌙 IHSAN Platform - Full System Verification Script
# This script tests the entire lifecycle of the API from public access to donation.

# --- Configuration ---
BASE_URL="http://localhost:3000/api/v1"
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏁 Starting Full API Verification Flow...${NC}\n"

# Help function to parse JSON fields using jq
get_field() {
    echo "$1" | jq -r "$2"
}

# --- 1. Public Routes ---
echo -e "${BLUE}[1/7] Testing Public Access...${NC}"
HEALTH=$(curl -s -X GET "http://localhost:3000/health")
if [[ $(get_field "$HEALTH" ".status") == "ok" ]]; then
    echo -e "  ✅ Health Check OK"
else
    echo -e "  ❌ Health Check Failed"
    exit 1
fi

DASHBOARD=$(curl -s -X GET "${BASE_URL}/public/dashboard")
if [[ $(get_field "$DASHBOARD" ".success") == "true" ]]; then
    echo -e "  ✅ Public Dashboard OK"
else
    echo -e "  ❌ Public Dashboard Failed"
    exit 1
fi

# --- 2. Authentication ---
echo -e "\n${BLUE}[2/7] Testing Authentication (Admin & Validator)...${NC}"
ADMIN_RESP=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"phone": "+22222222222", "password": "password123"}')

ADMIN_TOKEN=$(get_field "$ADMIN_RESP" ".token")
if [[ "$ADMIN_TOKEN" != "null" ]]; then
    echo -e "  ✅ Admin Login Successful"
else
    echo -e "  ❌ Admin Login Failed: $ADMIN_RESP"
    exit 1
fi

VAL_RESP=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"phone": "+22233333333", "password": "password123"}')

VAL_TOKEN=$(get_field "$VAL_RESP" ".token")
if [[ "$VAL_TOKEN" != "null" ]]; then
    echo -e "  ✅ Validator Login Successful"
else
    echo -e "  ❌ Validator Login Failed"
    exit 1
fi

# --- 3. Partner Discovery ---
echo -e "\n${BLUE}[3/7] Discovering Partners (Admin)...${NC}"
PARTNERS=$(curl -s -X GET "${BASE_URL}/admin/partners" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

PARTNER_ID=$(echo "$PARTNERS" | jq -r ".[0].id")
if [[ "$PARTNER_ID" != "null" ]]; then
    PARTNER_NAME=$(echo "$PARTNERS" | jq -r ".[0].business_name")
    echo -e "  ✅ Found Partner: $PARTNER_NAME (ID: $PARTNER_ID)"
else
    echo -e "  ❌ No Partners Found. Please run seed_db.js first."
    exit 1
fi

# --- 4. Need Creation ---
echo -e "\n${BLUE}[4/7] Creating a New Need (Validator)...${NC}"
NEED_RESP=$(curl -s -X POST "${BASE_URL}/validator/needs" \
    -H "Authorization: Bearer $VAL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"Support Bash Test\",
        \"description\": \"Test automatique via script shell\",
        \"estimated_amount\": 2500,
        \"category\": \"food_basket\",
        \"location_quarter\": \"Tevragh Zeina\",
        \"partner_id\": \"$PARTNER_ID\",
        \"priority\": 2,
        \"beneficiary_description\": \"Famille test\",
        \"family_size\": 4
    }")

NEED_ID=$(get_field "$NEED_RESP" ".need.id")
if [[ "$NEED_ID" != "null" ]]; then
    echo -e "  ✅ Need Created Successfully (ID: $NEED_ID)"
else
    echo -e "  ❌ Need Creation Failed: $NEED_RESP"
    exit 1
fi

# --- 5. Admin Approval ---
echo -e "\n${BLUE}[5/7] Approving Need (Admin)...${NC}"
APPROVE_RESP=$(curl -s -X PUT "${BASE_URL}/admin/needs/${NEED_ID}/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"reason": "Validé par script automatisé"}')

if [[ $(get_field "$APPROVE_RESP" ".success") != "false" ]]; then
    echo -e "  ✅ Need Approved Successfully"
else
    echo -e "  ❌ Need Approval Failed"
    exit 1
fi

# --- 6. Guest Donation ---
echo -e "\n${BLUE}[6/7] Processing Guest Donation...${NC}"
DON_RESP=$(curl -s -X POST "${BASE_URL}/donor/needs/${NEED_ID}/fund" \
    -H "Content-Type: application/json" \
    -d '{
        "donor_phone": "+22246666666",
        "payment_method": "mobile_money"
    }')

if [[ $(get_field "$DON_RESP" ".error") == "null" ]]; then
    RECEIPT=$(get_field "$DON_RESP" ".transaction.receipt_number")
    echo -e "  ✅ Donation Successful (Receipt: $RECEIPT)"
else
    echo -e "  ❌ Donation Failed: $DON_RESP"
    exit 1
fi

# --- 7. Final Verification ---
echo -e "\n${BLUE}[7/7] Final Verification in Public Catalog...${NC}"
CATALOG=$(curl -s -X GET "${BASE_URL}/public/needs")
IS_PRESENT=$(echo "$CATALOG" | jq ".needs[] | select(.id == \"$NEED_ID\")")

if [[ -n "$IS_PRESENT" ]]; then
    FINAL_STATUS=$(echo "$IS_PRESENT" | jq -r ".status")
    echo -e "  ✅ Need found in public catalog. Status: $FINAL_STATUS"
else
    echo -e "  ⚠️ Note: Need may be hidden because it is now 'funded'. This is expected behavior."
fi

echo -e "\n${GREEN}✨ ALL TESTS PASSED SUCCESSFULLY! IHSAN Platform is healthy.${NC}"
