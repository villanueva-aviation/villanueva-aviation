@echo off
rem Pone o quita el lector del instructor en el inicio de Windows.
set "ATAJO=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Villanueva Instructor Lector.lnk"
if exist "%ATAJO%" (
  del "%ATAJO%"
  echo Listo: el lector ya no se abre solo al prender la PC.
) else (
  powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut($env:ATAJO); $s.TargetPath='%~dp0VillanuevaInstructorLector.exe'; $s.WorkingDirectory='%~dp0'; $s.Arguments='--sin-ventana'; $s.WindowStyle=7; $s.Save()"
  echo Listo: el lector se abrira solo, minimizado, al prender la PC.
)
pause
