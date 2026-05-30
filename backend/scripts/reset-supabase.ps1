# Reset Supabase public schema using credentials from backend/.env
# Requires psql: https://www.postgresql.org/download/windows/

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "Missing $envFile. Copy .env.example and set DB_URL, DB_USER, DB_PASSWORD."
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
        $vars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$dbUrl = $vars["DB_URL"]
$dbUser = $vars["DB_USER"]
$dbPassword = $vars["DB_PASSWORD"]

if (-not $dbUrl -or -not $dbUser -or -not $dbPassword) {
    Write-Error "DB_URL, DB_USER, and DB_PASSWORD must be set in backend/.env"
}

if ($dbUrl -notmatch '^jdbc:postgresql://([^:/]+):(\d+)/([^?]+)') {
    Write-Error "DB_URL must be jdbc:postgresql://host:port/database?sslmode=require"
}

$hostName = $Matches[1]
$port = $Matches[2]
$database = $Matches[3]
$sqlFile = Join-Path $PSScriptRoot "reset-supabase-public-schema.sql"

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Host "psql not found. Run reset-supabase-public-schema.sql in Supabase SQL Editor."
    Write-Host $sqlFile
    exit 1
}

$env:PGPASSWORD = $dbPassword
Write-Host "Resetting Supabase schema on ${hostName} / ${database} ..."
& psql -h $hostName -p $port -U $dbUser -d $database -v ON_ERROR_STOP=1 -f $sqlFile
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
Write-Host "Done. Start the backend to recreate tables and run admin seed."
