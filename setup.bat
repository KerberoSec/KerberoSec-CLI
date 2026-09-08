@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo           KerberoSec CLI - Automated System Installer ^& Optimizer
echo                       Windows Bootstrap Installer
echo ==============================================================================

where bash >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [*] Bash detected in environment (Git Bash / WSL). Delegating to setup.sh...
    bash "%~dp0setup.sh" %*
    exit /b %ERRORLEVEL%
)

echo [*] Checking Bun runtime...
where bun >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [*] Bun runtime not found. Installing Bun via PowerShell...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "irm bun.sh/install.ps1 | iex"
    set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
)

where bun >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Bun installation could not be located in PATH.
    echo Please install Bun manually from https://bun.sh and re-run setup.bat.
    exit /b 1
)

echo [*] Installing monorepo dependencies...
cd /d "%~dp0"
bun install
if %ERRORLEVEL% neq 0 (
    echo [!] Dependency installation failed.
    exit /b %ERRORLEVEL%
)

echo [*] Compiling SDK packages...
bun run build:sdk

echo [*] Compiling CLI binary...
bun -F @kerberosec/cli build

echo [*] Creating global wrappers in %USERPROFILE%\.bun\bin...
if not exist "%USERPROFILE%\.bun\bin" mkdir "%USERPROFILE%\.bun\bin"
if not exist "%USERPROFILE%\.local\bin" mkdir "%USERPROFILE%\.local\bin"

set "REPO_PATH=%~dp0"
set "REPO_PATH=%REPO_PATH:~0,-1%"

(
echo @echo off
echo setlocal
echo chcp 65001 ^>nul 2^>^&1
echo set "PATH=%%USERPROFILE%%\Tools\bin;%%USERPROFILE%%\go\bin;%%USERPROFILE%%\.local\bin;%%USERPROFILE%%\.bun\bin;%%PATH%%"
echo if exist "%%USERPROFILE%%\.kerberosec\ollama_num_ctx" (
echo     set /p OLLAMA_NUM_CTX=^<"%%USERPROFILE%%\.kerberosec\ollama_num_ctx"
echo ^)
echo if "%%OLLAMA_NUM_CTX%%"=="" set OLLAMA_NUM_CTX=4096
echo bun run "%REPO_PATH%\apps\cli\src\index.ts" %%*
) > "%USERPROFILE%\.bun\bin\kerberosec.cmd"

copy /y "%USERPROFILE%\.bun\bin\kerberosec.cmd" "%USERPROFILE%\.local\bin\kerberosec.cmd" >nul 2>&1

(
echo [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
echo $env:PATH = "$HOME\Tools\bin;$HOME\go\bin;$HOME\.local\bin;$HOME\.bun\bin;$env:PATH"
echo if (Test-Path "$HOME\.kerberosec\ollama_num_ctx"^) {
echo     $env:OLLAMA_NUM_CTX = (Get-Content "$HOME\.kerberosec\ollama_num_ctx" -Raw^).Trim(^)
echo }
echo if (-not $env:OLLAMA_NUM_CTX^) { $env:OLLAMA_NUM_CTX = "4096" }
echo bun run "%REPO_PATH%\apps\cli\src\index.ts" $args
) > "%USERPROFILE%\.bun\bin\kerberosec.ps1"

copy /y "%USERPROFILE%\.bun\bin\kerberosec.ps1" "%USERPROFILE%\.local\bin\kerberosec.ps1" >nul 2>&1

echo.
echo ==============================================================================
echo           KerberoSec CLI is Successfully Installed on Windows!
echo ==============================================================================
echo.
echo Launch by typing: kerberosec
echo.
