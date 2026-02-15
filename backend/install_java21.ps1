$ErrorActionPreference = "Stop"
# Using Eclipse Adoptium (Temurin) as it has stable permanent links
$jdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.2%2B13/OpenJDK21U-jdk_x64_windows_hotspot_21.0.2_13.zip"
$installDir = "C:\Users\DELL\.gemini\openjdk-21"
$zipPath = "$installDir\openjdk-21.zip"

if (Test-Path "$installDir\jdk-21.0.2+13\bin\java.exe") {
    Write-Host "Java 21 already installed at $installDir"
} else {
    if (Test-Path $installDir) {
        Remove-Item -Path $installDir -Recurse -Force
    }
    Write-Host "Creating directory $installDir..."
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    
    Write-Host "Downloading OpenJDK 21 (Temurin)..."
    Invoke-WebRequest -Uri $jdkUrl -OutFile $zipPath

    Write-Host "Extracting OpenJDK 21..."
    Expand-Archive -Path $zipPath -DestinationPath $installDir -Force

    Remove-Item $zipPath
}

# Find the extracted directory name as it might vary
$extractedDir = Get-ChildItem -Path $installDir -Directory | Select-Object -First 1
$javaBin = "$($extractedDir.FullName)\bin"

$env:JAVA_HOME = $extractedDir.FullName
$env:Path = "$javaBin;$env:Path"

Write-Host "JAVA_HOME set to $env:JAVA_HOME"
& java -version
