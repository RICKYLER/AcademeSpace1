# PowerShell script to build Vite project with environment variables
# This fixes the API connection issue for manual Netlify deployment

Write-Host "🔧 Building AcademeSpace with Environment Variables..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Set environment variables for this build session
$env:VITE_VENICE_API_KEY_CHAT = "TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1"
$env:VITE_VENICE_API_KEY_IMAGE = "TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1"
$env:VITE_PHOTO_GENERATION_API_ENDPOINT = "https://api.openai.com/v1/images/generations"
$env:VITE_WALLETCONNECT_PROJECT_ID = "demo-project-id"
$env:VITE_SOCKET_IO_SERVER_URL = "http://localhost:3001"

Write-Host "✅ Environment variables set:" -ForegroundColor Green
Write-Host "   VITE_VENICE_API_KEY_CHAT = $($env:VITE_VENICE_API_KEY_CHAT.Substring(0,20))..." -ForegroundColor Yellow
Write-Host "   VITE_VENICE_API_KEY_IMAGE = $($env:VITE_VENICE_API_KEY_IMAGE.Substring(0,20))..." -ForegroundColor Yellow
Write-Host "   VITE_PHOTO_GENERATION_API_ENDPOINT = $env:VITE_PHOTO_GENERATION_API_ENDPOINT" -ForegroundColor Yellow
Write-Host "   VITE_WALLETCONNECT_PROJECT_ID = $env:VITE_WALLETCONNECT_PROJECT_ID" -ForegroundColor Yellow
Write-Host "   VITE_SOCKET_IO_SERVER_URL = $env:VITE_SOCKET_IO_SERVER_URL" -ForegroundColor Yellow

Write-Host "`n🏗️ Building project..." -ForegroundColor Cyan

try {
    # Run the build command with environment variables
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Build completed successfully!" -ForegroundColor Green
        Write-Host "=" * 60 -ForegroundColor Gray
        
        Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. 🌐 Go to Netlify: https://app.netlify.com/" -ForegroundColor White
        Write-Host "2. 📁 Drag `& drop the 'dist/' folder to deploy" -ForegroundColor White
        Write-Host "3. 🧪 Test AI at: https://academespace.netlify.app/algebrain" -ForegroundColor White
        
        Write-Host "`n🎯 Your API connection should now work!" -ForegroundColor Green
        Write-Host "The environment variables are now embedded in the build." -ForegroundColor Gray
        
    } else {
        Write-Host "`n❌ Build failed!" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Error during build:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🎉 Build script completed!" -ForegroundColor Cyan