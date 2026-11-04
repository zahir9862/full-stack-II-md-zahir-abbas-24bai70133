# Run this script in the project PowerShell terminal before mvn spring-boot:run.
# It generates development secrets for the current PowerShell session.
# Do not commit generated secrets.

function New-RandomBase64([int]$bytes) {
    $buffer = New-Object byte[] $bytes
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
    return [Convert]::ToBase64String($buffer)
}

$env:APP_AES_KEY = New-RandomBase64 32
$env:APP_JWT_SECRET = New-RandomBase64 32

Write-Host "APP_AES_KEY and APP_JWT_SECRET are set for this PowerShell session."
Write-Host "Now run: mvn spring-boot:run"
