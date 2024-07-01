cd src
rm -r node_modules
rm package.json package-lock.json
echo "{}" > package.json
npm install --save-dev react react-dom vite
npm install --save-dev @types/react @types/react-dom @types/node
sudo npm install -g vite typescript
cd ..