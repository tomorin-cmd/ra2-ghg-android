$ErrorActionPreference = 'Continue'

$app = $PSScriptRoot
$sdk = $env:ANDROID_SDK_ROOT
$jdk = $env:JAVA_HOME
$bt  = Join-Path $sdk 'build-tools\android-16'
$androidJar = Join-Path $sdk 'platforms\android-36\android.jar'
$build = Join-Path $app 'build'
$assets = Join-Path $app 'assets'
$ksPass = $env:RA2_KEYSTORE_PASS

if (-not $sdk) { throw 'Please set ANDROID_SDK_ROOT to your Android SDK directory.' }
if (-not $jdk) { throw 'Please set JAVA_HOME to a JDK 17 directory.' }
if (-not $ksPass) { $ksPass = 'ra2ghg-local-dev' }

New-Item -ItemType Directory -Force -Path $build | Out-Null

$env:JAVA_HOME = $jdk
$env:PATH = "$jdk\bin;$env:PATH"

function Check-Step([string]$name) {
    if ($LASTEXITCODE -ne 0) {
        throw "$name failed with exit code $LASTEXITCODE"
    }
}

Write-Host '== aapt2 compile =='
if (Test-Path "$build\res.zip") { Remove-Item "$build\res.zip" -Force }
& "$bt\aapt2.exe" compile --dir "$app\res" -o "$build\res.zip"
Check-Step 'aapt2 compile'

Write-Host '== aapt2 link (assets, mix stored) =='
if (Test-Path "$build\base.apk") { Remove-Item "$build\base.apk" -Force }
& "$bt\aapt2.exe" link `
    -o "$build\base.apk" `
    -I $androidJar `
    --manifest "$app\AndroidManifest.xml" `
    --java "$build\gen" `
    --min-sdk-version 26 `
    --target-sdk-version 35 `
    --version-code 1 `
    --version-name 0.1 `
    -0 .mix `
    "$build\res.zip"
Check-Step 'aapt2 link'

Write-Host '== javac =='
if (Test-Path "$build\classes") { Remove-Item "$build\classes" -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$build\classes" | Out-Null
$sources = Get-ChildItem "$app\src" -Recurse -Filter '*.java' | ForEach-Object { $_.FullName }
$rjava = Get-ChildItem "$build\gen" -Recurse -Filter 'R.java' | ForEach-Object { $_.FullName }
& "$jdk\bin\javac.exe" -encoding UTF-8 -nowarn -Xlint:-options -source 8 -target 8 -classpath $androidJar -d "$build\classes" $sources $rjava 2>&1 | ForEach-Object { Write-Host $_ }
Check-Step 'javac'

Write-Host '== jar + d8 =='
& "$jdk\bin\jar.exe" cf "$build\classes.jar" -C "$build\classes" .
Check-Step 'jar'
if (Test-Path "$build\dex") { Remove-Item "$build\dex" -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$build\dex" | Out-Null
& "$bt\d8.bat" --lib $androidJar --min-api 26 --output "$build\dex" "$build\classes.jar"
Check-Step 'd8'

Write-Host '== pack assets + classes.dex (forward slashes) =='
$python = (Get-Command python -ErrorAction Stop).Source
& $python "$app\pack_assets.py" "$build\base.apk" $assets "$build\dex\classes.dex"
Check-Step 'pack assets'

Write-Host '== zipalign =='
if (Test-Path "$build\aligned.apk") { Remove-Item "$build\aligned.apk" -Force }
& "$bt\zipalign.exe" -f 4 "$build\base.apk" "$build\aligned.apk"
Check-Step 'zipalign'

Write-Host '== keystore =='
$ks = "$build\ra2ghg.keystore"
if (-not (Test-Path $ks)) {
    & "$jdk\bin\keytool.exe" -genkeypair -v -keystore $ks -alias ra2ghg `
        -keyalg RSA -keysize 2048 -validity 10000 `
        -storepass $ksPass -keypass $ksPass `
        -dname "CN=RA2 GHG, OU=DSH, O=Personal, L=Local, ST=Local, C=CN"
    Check-Step 'keytool'
}

Write-Host '== sign =='
if (Test-Path "$app\ra2ghg.apk") { Remove-Item "$app\ra2ghg.apk" -Force }
& "$bt\apksigner.bat" sign `
    --ks $ks `
    --ks-key-alias ra2ghg `
    --ks-pass pass:$ksPass `
    --key-pass pass:$ksPass `
    --out "$app\ra2ghg.apk" `
    "$build\aligned.apk"
Check-Step 'apksigner sign'

Write-Host '== verify =='
& "$bt\apksigner.bat" verify --verbose "$app\ra2ghg.apk"
Check-Step 'apksigner verify'
Get-Item "$app\ra2ghg.apk" | Select-Object FullName, Length

