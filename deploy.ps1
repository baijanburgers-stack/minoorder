# PlatePixels MinoOrder Cloud Deployer Wizard
# This script securely logs in, links, pushes database migrations, and deploys Edge Functions
# to your live cloud Supabase project 'ykgxqmomsabyfgfwevsx'.

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                MINOORDER CLOUD DEPLOYER WIZARD                      " -ForegroundColor Cyan
Write-Host "                Designed by PlatePixels Systems                      " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Request Supabase Access Token
Write-Host "[1/4] Supabase Authentication" -ForegroundColor Yellow
Write-Host "Please generate an access token at https://supabase.com/dashboard/account/tokens" -ForegroundColor Gray
$token = Read-Host "Enter your Supabase Personal Access Token"
if (-not $token) {
    Write-Error "Access Token is required to authenticate with Supabase CLI."
}

# Step 2: Request Database Password
Write-Host ""
Write-Host "[2/4] Database Verification" -ForegroundColor Yellow
$password = Read-Host "Enter your Supabase Database Password (for project ykgxqmomsabyfgfwevsx)"
if (-not $password) {
    Write-Error "Database Password is required to link the project and apply migrations."
}

# Step 3: Run Authentication & Link
Write-Host ""
Write-Host "[3/4] Authenticating & Linking Project..." -ForegroundColor Yellow
try {
    Write-Host "Authenticating CLI..." -ForegroundColor Gray
    npx supabase login --token $token
    
    Write-Host "Linking project ykgxqmomsabyfgfwevsx..." -ForegroundColor Gray
    npx supabase link --project-ref ykgxqmomsabyfgfwevsx --password $password --yes
    
    Write-Host "Successfully authenticated and linked to cloud project!" -ForegroundColor Green
} catch {
    Write-Host "Failed to authenticate or link project. Please check your credentials and network connection." -ForegroundColor Red
    throw $_
}

# Step 4: Apply Database Schema Migration
Write-Host ""
Write-Host "[4/4] Deploying Database Schema & Edge Functions..." -ForegroundColor Yellow
try {
    Write-Host "Pushing SQL DDL migrations (26 compliance tables + RLS policies)..." -ForegroundColor Gray
    npx supabase db push --password $password
    
    Write-Host "Deploying Edge Function: calculate-cart..." -ForegroundColor Gray
    npx supabase functions deploy calculate-cart --project-ref ykgxqmomsabyfgfwevsx
    
    Write-Host "Deploying Edge Function: create-order..." -ForegroundColor Gray
    npx supabase functions deploy create-order --project-ref ykgxqmomsabyfgfwevsx
    
    Write-Host "Deploying Edge Function: fiscal-sign-order..." -ForegroundColor Gray
    npx supabase functions deploy fiscal-sign-order --project-ref ykgxqmomsabyfgfwevsx
    
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "🎉 SUCCESS: MinoOrder Backend Fully Deployed to Supabase Cloud! 🎉" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "Your 26-table relational schema is live, and your secure Edge Functions" -ForegroundColor Gray
    Write-Host "are active at: https://ykgxqmomsabyfgfwevsx.supabase.co" -ForegroundColor Gray
    Write-Host "======================================================================" -ForegroundColor Green
} catch {
    Write-Host "An error occurred during deployment." -ForegroundColor Red
    throw $_
}
