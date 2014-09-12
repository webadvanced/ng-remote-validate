@echo off
set PATH=\
echo Running jsHint
C:\Windows\System32\cscript.exe jsHint\wsh.js ..\src\ngRemoteValidate.js
echo Reading Version
set /p Build=<..\version.txt
echo Setting version and moving to release
del ..\release\*.js
copy ..\src\ngRemoteValidate.js ..\release\ngRemoteValidate.%Build%.js
copy ..\src\ngRemoteValidate.js ..\release\ngRemoteValidate.js
copy ..\bowerTemplate.json ..\bower.json
copy ..\src\ngRemoteValidate.js ..\app\public\javascripts\lib\ngRemoteValidate.js
fart -r -w -- ..\release\ngRemoteValidate.%Build%.js ##_version_## %Build%
fart -r -w -- ..\release\ngRemoteValidate.js ##_version_## %Build%
fart -r -w -- ..\bower.json ##_version_## %Build%
echo minify v%%Build%
minify\ajaxmin ..\release\ngRemoteValidate.%Build%.js -o ..\release\ngRemoteValidate.%Build%.min.js -clobber
echo Complete!
echo ----------------------------------------------
