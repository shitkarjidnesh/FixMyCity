@echo off
echo Opening all monorepo projects in VS Code...

start code backend
start code admin
start code client
start code mobile\client
start code mobile\worker

echo All VS Code windows opened successfully!
pause
