# Convenience launcher for Windows PowerShell.
# It creates development secrets for this process and starts Spring Boot.
# For persistent environments, use a proper secret manager/environment configuration.

function New-RandomBase64([int]$bytes) {
    $buffer = New-Object byte[] $bytes
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
    return [Convert]::ToBase64String($buffer)
}

$env:APP_AES_KEY = New-RandomBase64 32
$env:APP_JWT_SECRET = New-RandomBase64 32

mvn spring-boot:run
