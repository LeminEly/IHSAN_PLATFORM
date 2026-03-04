#!/bin/bash

# IHSAN Platform - Global API Verification Script
# This script contains curl commands to test the core flows of the platform.

BASE_URL="http://localhost:3000/api/v1"
echo "🚀 Starting API Verification for $BASE_URL"

# 1. PUBLIC ACCESS TEST
echo -e "\n--- 🌍 Testing Public Routes ---"
curl -s -X GET "$BASE_URL/public/dashboard" | grep -q "total_donations" && echo "✅ Public Dashboard OK"
curl -s -X GET "$BASE_URL/public/needs" | grep -q "id" && echo "✅ Public Needs Catalog OK"

# 2. AUTHENTICATION TEST (Register & Login)
echo -e "\n--- 👤 Testing Auth ---"
# Note: These values might need to be unique if running multiple times
# curl -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{"full_name":"Test Admin","phone":"22222222","password":"password123","role":"admin"}'

ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"22222222","password":"password123"}' | grep -oP '(?<="token":")[^"]*')

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Admin Login Failed"
else
    echo "✅ Admin Login OK"
fi

# 3. VALIDATOR FLOW
echo -e "\n--- 🔍 Testing Validator Flow ---"
# Login as validator (assumes user exists)
VAL_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"33333333","password":"password123"}' | grep -oP '(?<="token":")[^"]*')

# Create a Need
NEED_ID=$(curl -s -X POST "$BASE_URL/validator/needs" \
  -H "Authorization: Bearer $VAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Iftar","description":"5 meals","estimated_amount":1250,"location_quarter":"Arafat","partner_id":"PASTE_PARTNER_ID_HERE"}' | grep -oP '(?<="id":")[^"]*')

if [ ! -z "$NEED_ID" ]; then echo "✅ Need Creation OK ($NEED_ID)"; fi

# 4. ADMIN APPROVAL
echo -e "\n--- 🛡️ Testing Admin Approval ---"
curl -s -X POST "$BASE_URL/admin/needs/$NEED_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Verified valid need"}' | grep -q "succès" && echo "✅ Admin Approval OK"

# 5. DONOR FUNDING (Guest)
echo -e "\n--- 🎁 Testing Guest Donation ---"
curl -s -X POST "$BASE_URL/donor/needs/$NEED_ID/fund" \
  -H "Content-Type: application/json" \
  -d '{"donor_phone":"44444444","payment_method":"masrivi"}' | grep -q "succès" && echo "✅ Guest Donation OK"

echo -e "\n🏁 Initial Verification Scan Complete."
echo "💡 Note: For full verification, ensure database is seeded with Test Users (Admin: 22222222, Validator: 33333333)."
