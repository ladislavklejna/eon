# PowerShell skript pro automatické nastavení Network Security Config pro Android
#
# POUŽITÍ:
# 1. Nejdřív inicializujte Android: npx cap add android
# 2. Pak spusťte tento skript: .\setup-android-security.ps1

Write-Host "🔧 Nastavuji Android Network Security Config..." -ForegroundColor Cyan

# Kontrola, že Android složka existuje
if (-not (Test-Path "android")) {
    Write-Host "❌ Chyba: Složka 'android' neexistuje!" -ForegroundColor Red
    Write-Host "   Nejdřív spusťte: npx cap add android" -ForegroundColor Yellow
    exit 1
}

# Vytvoření xml složky, pokud neexistuje
$xmlDir = "android\app\src\main\res\xml"
if (-not (Test-Path $xmlDir)) {
    New-Item -ItemType Directory -Path $xmlDir -Force | Out-Null
}

# Zkopírování network security config
Write-Host "📁 Kopíruji network_security_config.xml..." -ForegroundColor Cyan
Copy-Item "android-network-security-config.xml" "$xmlDir\network_security_config.xml" -Force

# Úprava AndroidManifest.xml
$manifest = "android\app\src\main\AndroidManifest.xml"

if (Test-Path $manifest) {
    Write-Host "📝 Aktualizuji AndroidManifest.xml..." -ForegroundColor Cyan

    $content = Get-Content $manifest -Raw

    # Kontrola, jestli už network security config není nastavený
    if ($content -match "android:networkSecurityConfig") {
        Write-Host "✅ AndroidManifest.xml už obsahuje networkSecurityConfig" -ForegroundColor Green
    } else {
        # Přidání network security config do application tagu
        $content = $content -replace '<application', "<application`n        android:networkSecurityConfig=`"@xml/network_security_config`""
        Set-Content -Path $manifest -Value $content
        Write-Host "✅ Přidán networkSecurityConfig do AndroidManifest.xml" -ForegroundColor Green
    }
} else {
    Write-Host "❌ AndroidManifest.xml nenalezen!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Android Network Security Config byl úspěšně nastaven!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Další kroky:" -ForegroundColor Cyan
Write-Host "   1. Zkontrolujte IP adresu v: $xmlDir\network_security_config.xml"
Write-Host "   2. Pokud vaše NAS IP není 10.0.1.51, změňte ji"
Write-Host "   3. Spusťte build: npm run build"
Write-Host "   4. Synchronizujte: npx cap sync"
Write-Host "   5. Otevřete Android Studio: npx cap open android"
Write-Host ""
