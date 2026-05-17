#!/bin/bash
# Validate all migrations are properly exported

echo "🔍 Checking migration files..."
echo ""

for file in migrations/*.js; do
  echo "File: $file"
  
  if grep -q "export const up" "$file"; then
    echo "  ✅ Has 'export const up' function"
  else
    echo "  ❌ Missing 'export const up' function"
  fi
  
  if grep -q "export const down" "$file"; then
    echo "  ✅ Has 'export const down' function"
  else
    echo "  ⚠️  No 'export const down' function"
  fi
  
  echo ""
done

echo "✅ Migration validation complete"
