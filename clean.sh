if [ "$1" = 'dist' ]; then
    rm -r dist
elif [ "$1" = 'npm' ]; then
    rm -r src/node_modules
    rm src/package.json src/package-lock.json
    exit 0
elif [ "$1" = 'build' ]; then
    rm src/.tsbuildinfo src/*.js src/*.jsx src/*.d.ts
    exit 0
else
    echo "Usage: $0 {dist | npm | build}"
    exit 1
fi